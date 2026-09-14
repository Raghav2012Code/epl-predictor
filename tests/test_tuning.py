"""Unit tests for hyperparameter tuning (tiny trials, synthetic data)."""

import numpy as np
import pandas as pd

from src.evaluate import ranked_probability_score
from src.models import MatchPredictorModel
from src.tuning import (
    RF_PARAM_KEYS,
    XGB_PARAM_KEYS,
    evaluate_params,
    get_tuned_params,
    run_tuning,
    suggest_rf,
    suggest_xgb,
    tune_model,
)


def _frames(n_train=90, n_val=30, seed=11):
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


def test_rps_basics():
    # Perfect forecast scores 0; constant 1/3 scores 1/9.
    y = pd.Series([0, 1, 2, 2])
    perfect = np.array([[1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 0, 1]], dtype=float)
    assert ranked_probability_score(y, perfect) == 0.0
    flat = np.full((4, 3), 1 / 3)
    # No universal constant: for y=[0,1,2,2] the flat forecast scores
    # (5/18 + 1/9 + 5/18 + 5/18) / 4 = 17/72.
    assert abs(ranked_probability_score(y, flat) - 17 / 72) < 1e-12
    # Near-miss beats far-miss: predict Home when actual Draw.
    near = np.array([[0.1, 0.2, 0.7]])
    assert ranked_probability_score([1], near) < ranked_probability_score([0], near)


def test_rps_rejects_bad_shapes():
    import pytest

    with pytest.raises(ValueError, match="\\(N, K\\)"):
        ranked_probability_score([0, 1], [[0.5, 0.5]])


def test_apply_params_routes_only_valid_keys():
    model = MatchPredictorModel("rf").apply_params(
        {"n_estimators": 11, "max_depth": 3, "learning_rate": 0.05, "bogus": 1}
    )
    assert model.classifier.get_params()["n_estimators"] == 11
    assert model.classifier.get_params()["max_depth"] == 3
    # learning_rate is not an RF param: routed nowhere, no crash.
    assert "learning_rate" not in model.classifier.get_params()
    xgb = MatchPredictorModel("xgboost").apply_params({"learning_rate": 0.05})
    assert xgb.classifier.get_params()["learning_rate"] == 0.05


def test_evaluate_params_finite_and_metric_choice():
    import pytest

    train, val, cols = _frames()
    value = evaluate_params("rf", {"n_estimators": 10, "max_depth": 3},
                            train, val, cols, metric="rps")
    assert 0.0 <= value <= 1.0
    ll = evaluate_params("rf", {"n_estimators": 10, "max_depth": 3},
                         train, val, cols, metric="log_loss")
    assert ll > 0.0
    with pytest.raises(ValueError, match="Unknown tuning metric"):
        evaluate_params("rf", {}, train, val, cols, metric="oops")


def test_tune_model_deterministic_and_bounded():
    train, val, cols = _frames()
    first = tune_model("rf", train, val, cols, n_trials=4, seed=7)
    second = tune_model("rf", train, val, cols, n_trials=4, seed=7)
    assert first["params"] == second["params"]
    assert set(first["params"]) <= set(RF_PARAM_KEYS)
    assert first["trials"] == 4
    xgb = tune_model("xgboost", train, val, cols, n_trials=3, seed=7)
    assert set(xgb["params"]) <= set(XGB_PARAM_KEYS)


def test_run_tuning_persists_and_reads_back(tmp_path, monkeypatch):
    import src.tuning as tuning_mod

    train, val, cols = _frames()
    target = tmp_path / "tuning.json"
    monkeypatch.setattr(tuning_mod, "TUNING_PATH", str(target))
    monkeypatch.setattr(tuning_mod, "MODELS_DIR", str(tmp_path))
    results = run_tuning(train, val, cols, n_trials=2, seed=3, persist=True)
    assert target.exists()
    assert get_tuned_params("rf")["n_estimators"] >= 150
    assert set(results["models"]["xgboost"]["params"]) <= set(XGB_PARAM_KEYS)
    # Missing file degrades to defaults.
    monkeypatch.setattr(tuning_mod, "TUNING_PATH", str(tmp_path / "absent.json"))
    assert get_tuned_params("rf") == {}
    assert get_tuned_params("xgboost") == {}
