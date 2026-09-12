from __future__ import annotations

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
        assert preflight.headers.get("access-control-allow-origin") == "*"
