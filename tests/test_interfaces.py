from __future__ import annotations

import copy
import json
import os
import subprocess
import sys
from datetime import datetime
from types import SimpleNamespace

import numpy as np
import pandas as pd
import pytest

from src.feature_engineering import build_engineered_dataset, build_fixture_features, get_feature_column_names
from src.pipeline import _round_probabilities
from src.validation import assert_model_compatible

_HOST_ENV_KEYS = ("EPL_ENV", "EPL_ALLOWED_HOSTS", "EPL_CORS_ORIGINS")


def _match(date: str, home: str, away: str, home_goals: int = 1, away_goals: int = 0) -> dict:
    return {
        "season": "2023-24", "date": pd.Timestamp(date), "home_team": home, "away_team": away,
        "home_goals": home_goals, "away_goals": away_goals,
        "result": "H" if home_goals > away_goals else "A" if home_goals < away_goals else "D",
        "home_shots": 12.0, "away_shots": 10.0, "home_shots_target": 4.0, "away_shots_target": 3.0,
        "home_corners": 5.0, "away_corners": 4.0, "home_possession": 52.0, "away_possession": 48.0,
    }


def test_same_date_features_keep_input_order() -> None:
    raw = pd.DataFrame([
        _match("2024-01-01", "Arsenal", "Chelsea"),
        _match("2024-01-01", "Liverpool", "Manchester City"),
    ])
    engineered = build_engineered_dataset(raw)
    assert engineered["home_team"].tolist() == ["Arsenal", "Liverpool"]


def test_cold_start_uses_team_priors_for_differentials() -> None:
    columns = ["date", "home_team", "away_team", "home_goals", "away_goals"]
    history = pd.DataFrame(columns=columns)
    features = build_fixture_features("Arsenal", "Hull", datetime(2026, 8, 1), history)
    assert float(features["diff_roll_goals_for_5"].iloc[0]) > 0
    assert float(features["home_roll_goals_for_5"].iloc[0]) > float(features["away_roll_goals_for_5"].iloc[0])


def test_probability_rounding_preserves_total() -> None:
    rounded = _round_probabilities([0.3333333, 0.3333333, 0.3333334])
    assert rounded == [33.3, 33.3, 33.4]
    assert sum(rounded) == 100.0


def test_checkpoint_validation_rejects_feature_order_drift() -> None:
    columns = get_feature_column_names()
    loaded = SimpleNamespace(feature_names=list(reversed(columns)))
    assert assert_model_compatible(loaded, strict=False) is False
    with pytest.raises(RuntimeError, match="Order:"):
        assert_model_compatible(loaded, strict=True)


def test_invalid_gameweek_has_nonzero_cli_exit() -> None:
    result = subprocess.run(
        [sys.executable, "predict.py", "--gameweek", "0", "--offline"],
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 2
    assert "between 1 and 38" in result.stdout


def test_production_requires_explicit_hosts_and_origins(monkeypatch) -> None:
    """Unset must fail exactly like empty/wildcard, never degrade silently.

    Returning [] for EPL_ALLOWED_HOSTS installs TrustedHostMiddleware with an
    empty pattern list, which answers 400 to every request; returning [] for
    EPL_CORS_ORIGINS silently disables CORS.
    """
    import api

    def _resolve(production: bool, hosts, origins):
        monkeypatch.setattr(api, "_is_production", production)
        for name, value in (("EPL_ALLOWED_HOSTS", hosts), ("EPL_CORS_ORIGINS", origins)):
            if value is None:
                monkeypatch.delenv(name, raising=False)
            else:
                monkeypatch.setenv(name, value)
        return api._configured_hosts(), api._configured_origins()

    for label, value in (("unset", None), ("empty", ""), ("wildcard", "*")):
        for position in (0, 1):
            bad_hosts = None if position == 1 else value
            bad_origins = None if position == 0 else value
            with pytest.raises(RuntimeError, match="must (list explicit|not contain)"):
                _resolve(True, bad_hosts, bad_origins)

    assert _resolve(True, "api.example.com", "https://app.example.com") == (
        ["api.example.com"],
        ["https://app.example.com"],
    )
    assert _resolve(False, None, None) == (
        ["localhost", "127.0.0.1", "testserver"],
        ["http://localhost:5173"],
    )


def test_production_import_fails_fast_without_explicit_origins() -> None:
    """Importing api in production with no CORS config must raise, not serve.

    _configured_origins() runs at import time before _configured_hosts(), so
    this exercises the import guard; the host guard itself is covered by
    test_production_requires_explicit_hosts_and_origins.
    """
    env = {k: v for k, v in os.environ.items() if k not in _HOST_ENV_KEYS}
    env["EPL_ENV"] = "production"
    result = subprocess.run(
        [sys.executable, "-c", "import api"],
        capture_output=True, text=True, check=False, env=env,
    )
    assert result.returncode != 0
    assert "EPL_CORS_ORIGINS must list explicit origins in production." in result.stderr


def test_router_errors_use_the_documented_error_shape() -> None:
    """404/405 come from Starlette, not fastapi, so both must map to {"error": ...}."""
    from fastapi.testclient import TestClient
    from api import app

    with TestClient(app) as client:
        missing_route = client.get("/definitely-not-a-route")
        assert missing_route.status_code == 404
        assert "error" in missing_route.json()

        wrong_method = client.post("/health")
        assert wrong_method.status_code == 405
        assert "error" in wrong_method.json()


def test_dataset_endpoint_and_cors_contract() -> None:
    from fastapi.testclient import TestClient
    from api import app

    with TestClient(app) as client:
        response = client.get("/dataset")
        assert response.status_code == 200
        payload = response.json()
        assert len(payload["fixtures"]) == 380
        assert not np.isnan(float(payload["analytics"]["avgGoalsPerMatch"]))
        preflight = client.options(
            "/dataset",
            headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "GET"},
        )
        assert preflight.status_code == 200
        assert preflight.headers.get("access-control-allow-origin") == "http://localhost:5173"
        assert response.headers.get("x-request-id")


def test_readiness_endpoint_reports_model_state() -> None:
    from fastapi.testclient import TestClient
    from api import app

    with TestClient(app) as client:
        response = client.get("/ready")
        assert response.status_code in (200, 503)
        payload = response.json()
        assert payload["model_loaded"] is (response.status_code == 200)


def test_dataset_validator_rejects_incomplete_payload() -> None:
    from src.dataset_validation import validate_web_dataset

    with pytest.raises(ValueError, match=r"fixtures\[0\]\..+ is required"):
        validate_web_dataset({"season": "2026/2027", "meta": {}, "fixtures": [{"id": 1, "gameweek": 1}]})


def _exported_dataset() -> dict:
    with open("web/src/data/eplData.json", encoding="utf-8") as handle:
        return json.load(handle)


def test_dataset_validator_rejects_probability_totals_that_are_not_100() -> None:
    from src.dataset_validation import validate_web_dataset

    payload = _exported_dataset()
    payload["fixtures"][0]["homeWinProb"] = 99.0
    with pytest.raises(ValueError, match="probabilities must total 100"):
        validate_web_dataset(payload)


def test_dataset_validator_rejects_duplicate_ids_and_invalid_gameweeks() -> None:
    from src.dataset_validation import validate_web_dataset

    payload = _exported_dataset()
    payload["fixtures"][1]["id"] = payload["fixtures"][0]["id"]
    with pytest.raises(ValueError, match="unique"):
        validate_web_dataset(payload)

    payload = copy.deepcopy(_exported_dataset())
    payload["fixtures"][0]["gameweek"] = 39
    with pytest.raises(ValueError, match="between 1 and 38"):
        validate_web_dataset(payload)
