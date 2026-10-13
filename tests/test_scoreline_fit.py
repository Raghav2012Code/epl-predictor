"""Scoreline distribution fitting (issue #49): theta + dispersion on the cal slice."""

from __future__ import annotations

import numpy as np
import pandas as pd

from src.feature_engineering import get_feature_column_names
from src.models import (
    DEFAULT_SCORELINE_DISPERSION,
    DEFAULT_SCORELINE_RHO,
    SCORELINE_DISPERSION_VALUES,
    SCORELINE_RHO_VALUES,
    MatchPredictorModel,
)


def _tiny_frame(n: int = 24, seed: int = 3):
    cols = get_feature_column_names()
    rng = np.random.RandomState(seed)
    X = pd.DataFrame(rng.randn(n, len(cols)), columns=cols)
    y_outcome = pd.Series(rng.choice([0, 1, 2], size=n))
    y_hg = pd.Series(rng.poisson(1.5, size=n))
    y_ag = pd.Series(rng.poisson(1.2, size=n))
    return X, y_outcome, y_hg, y_ag


def _fitted_model():
    X, y_outcome, y_hg, y_ag = _tiny_frame()
    model = MatchPredictorModel("rf")
    model.fit(X, y_outcome, y_hg, y_ag)
    return model, X, y_hg, y_ag


def test_calibrate_scoreline_returns_grid_point_and_repeats_identically():
    model, X, y_hg, y_ag = _fitted_model()
    first = model.calibrate_scoreline(X, y_hg, y_ag)
    second = model.calibrate_scoreline(X, y_hg, y_ag)
    assert first == second
    theta, dispersion = first
    assert theta in SCORELINE_RHO_VALUES
    assert dispersion in SCORELINE_DISPERSION_VALUES
    assert (model.scoreline_theta, model.scoreline_dispersion) == first


def test_calibrate_scoreline_empty_slice_keeps_defaults():
    model, _, _, _ = _fitted_model()
    cols = get_feature_column_names()
    out = model.calibrate_scoreline(
        pd.DataFrame(columns=cols), pd.Series(dtype=int), pd.Series(dtype=int)
    )
    assert out == (DEFAULT_SCORELINE_RHO, DEFAULT_SCORELINE_DISPERSION)
    assert model.scoreline_theta == DEFAULT_SCORELINE_RHO
    assert model.scoreline_dispersion == DEFAULT_SCORELINE_DISPERSION


def _cal_nll(model, X, y_hg, y_ag, theta, dispersion, max_goals=10):
    lam_h, lam_a = model.predict_expected_goals(X, apply_correction=False)
    grids, _ = model.compute_poisson_grid(
        lam_h, lam_a, max_goals=max_goals, rho=theta, dispersion=dispersion
    )
    rows = np.arange(len(X))
    true_h = np.clip(np.asarray(y_hg, dtype=int).ravel(), 0, max_goals)
    true_a = np.clip(np.asarray(y_ag, dtype=int).ravel(), 0, max_goals)
    return float(-np.mean(np.log(np.maximum(grids[rows, true_h, true_a], 1e-12))))


def test_fitted_grid_never_worsens_calibration_nll():
    model, X, y_hg, y_ag = _fitted_model()
    theta, dispersion = model.calibrate_scoreline(X, y_hg, y_ag)
    fitted = _cal_nll(model, X, y_hg, y_ag, theta, dispersion)
    default = _cal_nll(
        model, X, y_hg, y_ag, DEFAULT_SCORELINE_RHO, DEFAULT_SCORELINE_DISPERSION
    )
    assert fitted <= default


def test_scoreline_path_ignores_hand_bounded_corrections():
    model, X, _, _ = _fitted_model()
    calm = model.predict_scoreline(X)
    model.home_goal_correction = 1.25
    model.away_goal_correction = 0.8
    capped = model.predict_scoreline(X)
    assert calm == capped


def test_benchmark_metrics_record_fitted_scoreline_params():
    from src.models import train_and_benchmark_models

    n = 30
    cols = get_feature_column_names()
    rng = np.random.RandomState(11)
    base = pd.DataFrame(rng.randn(n, len(cols)), columns=cols)
    base["date"] = pd.date_range("2023-01-01", periods=n, freq="7D")
    base["target_outcome"] = rng.choice([0, 1, 2], size=n)
    base["target_home_goals"] = rng.poisson(1.5, size=n)
    base["target_away_goals"] = rng.poisson(1.2, size=n)
    _, metrics = train_and_benchmark_models(base.iloc[:20].copy(), base.iloc[20:].copy(), cols)
    for vals in metrics.values():
        assert vals["scoreline_theta"] in SCORELINE_RHO_VALUES
        assert vals["scoreline_dispersion"] in SCORELINE_DISPERSION_VALUES
        quality = vals["scoreline_quality"]
        assert 0.0 <= quality["kl_divergence"] < float("inf")
        assert 0.0 <= quality["argmax_variety"] <= 1.0
