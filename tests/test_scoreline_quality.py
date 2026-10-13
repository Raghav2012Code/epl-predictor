"""Scoreline-quality baseline (issue #48): KL + argmax-variety on the eval tail."""

from __future__ import annotations

import numpy as np
import pandas as pd

from src.evaluate import scoreline_quality_metrics
from src.feature_engineering import get_feature_column_names
from src.models import train_and_benchmark_models


def test_quality_bounds_and_determinism():
    y_hg = np.array([1, 2, 1, 0, 2, 1, 3, 0])
    y_ag = np.array([0, 1, 1, 0, 0, 2, 1, 1])
    preds = [(1, 0), (2, 0), (1, 1), (0, 1), (2, 0), (1, 0), (2, 1), (0, 0)]
    first = scoreline_quality_metrics(y_hg, y_ag, preds)
    second = scoreline_quality_metrics(y_hg, y_ag, preds)
    assert first == second
    assert 0.0 <= first["kl_divergence"] < float("inf")
    assert 0.0 <= first["argmax_variety"] <= 1.0
    assert first["n_matches"] == 8


def test_quality_empty_slice_is_bounded():
    out = scoreline_quality_metrics([], [], [])
    assert out == {"kl_divergence": 0.0, "argmax_variety": 0.0, "n_matches": 0}


def test_variety_zero_when_only_modal_picks():
    y_hg = np.zeros(8, dtype=int)
    y_ag = np.zeros(8, dtype=int)
    preds = [(1, 0)] * 3 + [(2, 0)] * 2 + [(0, 1)] * 2 + [(1, 1)] * 1
    out = scoreline_quality_metrics(y_hg, y_ag, preds)
    assert out["argmax_variety"] == 0.0


def test_variety_counts_outside_top_four():
    y_hg = np.zeros(8, dtype=int)
    y_ag = np.zeros(8, dtype=int)
    preds = [(1, 0)] * 2 + [(2, 1)] * 2 + [(0, 0)] * 2 + [(0, 1)] + [(2, 0)]
    # Counts: 2,2,2,1,1 -> top-4 keeps one of the singletons, variety = 1/8.
    out = scoreline_quality_metrics(y_hg, y_ag, preds)
    assert out["argmax_variety"] == 0.125


def test_benchmark_entries_carry_bounded_quality():
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
        q = vals["scoreline_quality"]
        assert 0.0 <= q["kl_divergence"] < float("inf")
        assert 0.0 <= q["argmax_variety"] <= 1.0
        assert q["n_matches"] == len(vals["eval_y_home_goals"])
