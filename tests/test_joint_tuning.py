"""Joint deterministic search (issue #53): draw rule, blend weights, theta, dispersion."""

from __future__ import annotations

import numpy as np
import pandas as pd

from src.models import (
    SCORELINE_DISPERSION_VALUES,
    SCORELINE_RHO_VALUES,
    blend_weights,
    get_draw_rule,
    get_scoreline_defaults,
)
from src.tuning import (
    JOINT_DRAW_SHARE_MAX,
    JOINT_DRAW_SHARE_MIN,
    get_joint_params,
    tune_joint,
)


def _frames(n_train=60, n_val=24, seed=11):
    rng = np.random.RandomState(seed)
    cols = ["f%d" % i for i in range(6)] + ["odds_missing"]
    mk = lambda n: pd.DataFrame(
        np.column_stack([rng.randn(n, 6), np.zeros(n)]), columns=cols
    )
    train = mk(n_train)
    train["target_outcome"] = rng.choice([0, 1, 2], size=n_train)
    train["target_home_goals"] = rng.poisson(1.4, size=n_train)
    train["target_away_goals"] = rng.poisson(1.1, size=n_train)
    val = mk(n_val)
    val["target_outcome"] = rng.choice([0, 1, 2], size=n_val)
    val["target_home_goals"] = rng.poisson(1.4, size=n_val)
    val["target_away_goals"] = rng.poisson(1.1, size=n_val)
    return train, val, cols


def test_tune_joint_is_deterministic_with_full_receipt():
    train, val, cols = _frames()
    first = tune_joint(train, val, cols, n_trials=3, seed=7)
    second = tune_joint(train, val, cols, n_trials=3, seed=7)
    assert first["params"] == second["params"]
    # Same params can still differ in the last float bit: the objective sums
    # sklearn/xgboost outputs in library thread order, so compare the receipt
    # value at a tolerance rather than demanding bit-identical arithmetic.
    assert abs(first["value"] - second["value"]) < 1e-9
    params = first["params"]
    assert set(params["draw_rule"]) == {
        "market_margin", "market_min_prob", "no_market_margin", "no_market_min_prob",
    }
    assert set(params["blend"]) == {"blend_classifier", "blend_poisson", "blend_supremacy"}
    assert params["scoreline_theta"] in SCORELINE_RHO_VALUES
    assert params["scoreline_dispersion"] in SCORELINE_DISPERSION_VALUES
    assert first["trials"] == 3
    assert set(first["components"]) == {"rps", "scoreline_nll", "draw_error", "draw_share"}
    assert all(np.isfinite(first["components"][key]) for key in first["components"])


def test_joint_record_flows_into_serving_accessors(tmp_path, monkeypatch):
    import src.tuning as tuning_mod

    record = {
        "joint": {
            "params": {
                "draw_rule": {
                    "market_margin": 0.05, "market_min_prob": 0.30,
                    "no_market_margin": 0.06, "no_market_min_prob": 0.31,
                },
                "blend": {
                    "blend_classifier": 0.2, "blend_poisson": 0.3, "blend_supremacy": 0.5,
                },
                "scoreline_theta": -0.02, "scoreline_dispersion": 0.7,
            }
        }
    }
    target = tmp_path / "tuning.json"
    target.write_text(__import__("json").dumps(record), encoding="utf-8")
    monkeypatch.setattr(tuning_mod, "TUNING_PATH", str(target))

    assert get_joint_params() == record["joint"]["params"]
    rule = get_draw_rule()
    assert rule["market_margin"] == 0.05 and rule["market_min_prob"] == 0.30
    assert rule["no_market_margin"] == 0.06 and rule["no_market_min_prob"] == 0.31
    weights = blend_weights()
    assert abs(sum(weights) - 1.0) < 1e-12
    assert weights == (0.2, 0.3, 0.5)
    assert get_scoreline_defaults() == (-0.02, 0.7)


def test_serving_accessors_fall_back_without_joint_record(tmp_path, monkeypatch):
    import src.tuning as tuning_mod

    monkeypatch.setattr(tuning_mod, "TUNING_PATH", str(tmp_path / "absent.json"))
    assert get_joint_params() == {}
    rule = get_draw_rule()
    assert set(rule) == {"market_margin", "market_min_prob", "no_market_margin", "no_market_min_prob"}
    assert all(isinstance(value, float) for value in rule.values())
    weights = blend_weights()
    assert abs(sum(weights) - 1.0) < 1e-12
    theta, dispersion = get_scoreline_defaults()
    assert isinstance(theta, float) and isinstance(dispersion, float)


def test_draw_share_band_rejects_impossible_receipts():
    from src.tuning import draw_share_admissible, evaluate_joint

    assert draw_share_admissible(0.22)
    assert draw_share_admissible(JOINT_DRAW_SHARE_MIN)
    assert draw_share_admissible(JOINT_DRAW_SHARE_MAX)
    assert not draw_share_admissible(0.0)
    assert not draw_share_admissible(1.0)
    assert not draw_share_admissible(0.179)
    assert not draw_share_admissible(0.271)

    train, val, cols = _frames()
    blend = {"blend_classifier": 0.6, "blend_poisson": 0.0, "blend_supremacy": 0.4}
    # Margin 1.0 with min_prob 0.0 calls everything a draw: share exactly 1
    # for any probabilities, so the trial always scores inf.
    always = {
        "market_margin": 1.0, "market_min_prob": 0.0,
        "no_market_margin": 1.0, "no_market_min_prob": 0.0,
    }
    out = evaluate_joint(
        {"draw_rule": always, "blend": blend,
         "scoreline_theta": 0.11, "scoreline_dispersion": 1.0},
        train, val, cols,
    )
    assert out["draw_share"] == 1.0
    assert out["value"] == float("inf")


def test_draw_share_band_accepts_permissive_receipt():
    from src.tuning import evaluate_joint

    train, val, cols = _frames()
    lax_rule = {
        "market_margin": 0.25, "market_min_prob": 0.15,
        "no_market_margin": 0.25, "no_market_min_prob": 0.15,
    }
    out = evaluate_joint(
        {"draw_rule": lax_rule,
         "blend": {"blend_classifier": 0.6, "blend_poisson": 0.0, "blend_supremacy": 0.4},
         "scoreline_theta": 0.11, "scoreline_dispersion": 1.0},
        train, val, cols,
    )
    # Gate wiring: finiteness follows the band, whatever synthetic draws do.
    in_band = JOINT_DRAW_SHARE_MIN <= out["draw_share"] <= JOINT_DRAW_SHARE_MAX
    assert np.isfinite(out["value"]) == in_band


def test_study_ignores_persisted_joint_record(tmp_path, monkeypatch):
    import src.tuning as tuning_mod

    train, val, cols = _frames()
    record = {
        "joint": {
            "params": {
                "draw_rule": {
                    "market_margin": 0.05, "market_min_prob": 0.30,
                    "no_market_margin": 0.06, "no_market_min_prob": 0.31,
                },
                "blend": {
                    "blend_classifier": 0.2, "blend_poisson": 0.3, "blend_supremacy": 0.5,
                },
                "scoreline_theta": -0.02, "scoreline_dispersion": 0.7,
            }
        }
    }
    target = tmp_path / "tuning.json"
    target.write_text(__import__("json").dumps(record), encoding="utf-8")
    monkeypatch.setattr(tuning_mod, "TUNING_PATH", str(target))
    with_record = tune_joint(train, val, cols, n_trials=1, seed=7)
    monkeypatch.setattr(tuning_mod, "TUNING_PATH", str(tmp_path / "absent.json"))
    without_record = tune_joint(train, val, cols, n_trials=1, seed=7)
    assert with_record["params"] == without_record["params"]
    assert abs(with_record["value"] - without_record["value"]) < 1e-9
