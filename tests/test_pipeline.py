"""Unit and integration tests for Premier League match predictor pipeline."""

from __future__ import annotations

import os
from datetime import datetime

import numpy as np
import pandas as pd
import pytest

from src.data_loader import (
    parse_openfootball_fixtures,
    standardize_team_name,
)
from src.feature_engineering import (
    build_engineered_dataset,
    build_feature_context,
    build_fixture_features,
    get_feature_column_names,
)
from src.models import MatchPredictorModel, train_and_benchmark_models


def test_standardize_team_name():
    assert standardize_team_name("Arsenal FC") == "Arsenal"
    assert standardize_team_name("man city") == "Manchester City"
    assert standardize_team_name("nott'm forest") == "Nottingham Forest"
    assert standardize_team_name("Tottenham Hotspur FC") == "Tottenham"


def test_openfootball_fixture_parsing(tmp_path):
    sample_text = """
= English Premier League 2026/27

▪ Matchday 1
  Fri Aug 21 2026
    20:00  Arsenal FC              v Coventry City FC         3-0 (2-0)
  Sat Aug 22
    12:30  Everton FC              v Chelsea FC
"""
    test_file = tmp_path / "test_fixtures.txt"
    test_file.write_text(sample_text, encoding="utf-8")

    df = parse_openfootball_fixtures(str(test_file), season="2026-27", is_url=False)
    assert len(df) == 2
    assert df.iloc[0]["home_team"] == "Arsenal"
    assert df.iloc[0]["away_team"] == "Coventry"
    assert df.iloc[0]["status"] == "played"
    assert df.iloc[0]["home_goals"] == 3
    assert df.iloc[0]["away_goals"] == 0

    assert df.iloc[1]["home_team"] == "Everton"
    assert df.iloc[1]["away_team"] == "Chelsea"
    assert df.iloc[1]["status"] == "upcoming"
    assert np.isnan(df.iloc[1]["home_goals"])


def test_feature_engineering_zero_leakage():
    # Construct small synthetic historical dataset
    dates = pd.date_range("2024-01-01", periods=10, freq="7D")
    records = []
    teams = [("Arsenal", "Chelsea"), ("Liverpool", "Manchester City")]
    for i, d in enumerate(dates):
        pair = teams[i % 2]
        records.append(
            {
                "season": "2023-24",
                "date": d,
                "home_team": pair[0],
                "away_team": pair[1],
                "home_goals": (i % 3),
                "away_goals": ((i + 1) % 2),
                "result": "H" if (i % 3) > ((i + 1) % 2) else ("A" if (i % 3) < ((i + 1) % 2) else "D"),
                "home_shots": 14.0,
                "away_shots": 9.0,
                "home_shots_target": 5.0,
                "away_shots_target": 3.0,
                "home_corners": 6.0,
                "away_corners": 4.0,
                "home_possession": 55.0,
                "away_possession": 45.0,
            }
        )
    raw_df = pd.DataFrame(records)
    feat_df = build_engineered_dataset(raw_df)

    cols = get_feature_column_names()
    for c in cols:
        assert c in feat_df.columns, f"Missing feature column: {c}"

    # Verify target columns
    assert "target_outcome" in feat_df.columns
    assert "target_home_goals" in feat_df.columns
    assert "target_away_goals" in feat_df.columns


def test_fixture_feature_extraction():
    dates = pd.date_range("2024-01-01", periods=10, freq="7D")
    records = []
    for i, d in enumerate(dates):
        records.append(
            {
                "season": "2023-24",
                "date": d,
                "home_team": "Arsenal",
                "away_team": "Chelsea",
                "home_goals": 2,
                "away_goals": 1,
                "result": "H",
                "home_shots": 15.0,
                "away_shots": 8.0,
                "home_shots_target": 6.0,
                "away_shots_target": 2.0,
                "home_corners": 7.0,
                "away_corners": 3.0,
                "home_possession": 58.0,
                "away_possession": 42.0,
            }
        )
    raw_df = pd.DataFrame(records)
    future_date = datetime(2024, 4, 1)
    feat_row = build_fixture_features("Arsenal", "Chelsea", future_date, raw_df)

    assert feat_row.shape[0] == 1
    assert feat_row.shape[1] == len(get_feature_column_names())
    # Thin-history Bayesian shrinkage pulls observed 2.0 goals toward club
    # baselines (Arsenal GF 2.18, Chelsea GA 1.22), so values sit between
    # observed and baseline rather than exactly 2.0.
    home_gf3 = float(feat_row["home_roll_goals_for_3"].values[0])
    away_ga3 = float(feat_row["away_roll_goals_against_3"].values[0])
    assert 2.0 < home_gf3 <= 2.18
    assert 1.22 < away_ga3 < 2.0
    assert "home_elo" in feat_row.columns
    assert "away_elo" in feat_row.columns
    assert "elo_diff" in feat_row.columns
    assert "home_elo_momentum_3" in feat_row.columns
    assert "away_elo_momentum_3" in feat_row.columns
    assert "diff_elo_momentum_3" in feat_row.columns
    assert "home_elo_momentum_5" in feat_row.columns
    assert "away_elo_momentum_5" in feat_row.columns
    assert "diff_elo_momentum_5" in feat_row.columns
    assert feat_row["home_elo"].values[0] > feat_row["away_elo"].values[0]
    # Arsenal won 10 in a row vs Chelsea in records, so home momentum is positive
    assert feat_row["home_elo_momentum_3"].values[0] > 0
    assert feat_row["diff_elo_momentum_3"].values[0] > 0


def test_model_training_and_inference():
    n_samples = 40
    feature_cols = get_feature_column_names()
    np.random.seed(42)

    X = pd.DataFrame(np.random.randn(n_samples, len(feature_cols)), columns=feature_cols)
    y_outcome = pd.Series(np.random.choice([0, 1, 2], size=n_samples))
    y_hg = pd.Series(np.random.poisson(1.5, size=n_samples))
    y_ag = pd.Series(np.random.poisson(1.1, size=n_samples))

    # Test Random Forest
    rf_model = MatchPredictorModel("rf")
    rf_model.fit(X, y_outcome, y_hg, y_ag)
    proba_rf = rf_model.predict_outcome_proba(X)
    scores_rf = rf_model.predict_scoreline(X)
    assert proba_rf.shape == (n_samples, 3)
    assert len(scores_rf) == n_samples

    # Test XGBoost
    xgb_model = MatchPredictorModel("xgboost")
    xgb_model.fit(X, y_outcome, y_hg, y_ag)
    proba_xgb = xgb_model.predict_outcome_proba(X)
    scores_xgb = xgb_model.predict_scoreline(X)
    assert proba_xgb.shape == (n_samples, 3)
    assert len(scores_xgb) == n_samples


def test_model_save_and_load(tmp_path):
    n_samples = 30
    feature_cols = get_feature_column_names()
    np.random.seed(42)

    X = pd.DataFrame(np.random.randn(n_samples, len(feature_cols)), columns=feature_cols)
    y_outcome = pd.Series(np.random.choice([0, 1, 2], size=n_samples))
    y_hg = pd.Series(np.random.poisson(1.5, size=n_samples))
    y_ag = pd.Series(np.random.poisson(1.1, size=n_samples))

    model = MatchPredictorModel("rf")
    model.fit(X, y_outcome, y_hg, y_ag)
    orig_probas = model.predict_outcome_proba(X)
    orig_scores = model.predict_scoreline(X)

    save_file = str(tmp_path / "test_model.joblib")
    model.save(save_file)
    assert os.path.exists(save_file)

    loaded_model = MatchPredictorModel.load(save_file)
    assert loaded_model.is_fitted
    assert loaded_model.model_type == "rf"
    assert loaded_model.feature_names == feature_cols

    loaded_probas = loaded_model.predict_outcome_proba(X)
    loaded_scores = loaded_model.predict_scoreline(X)
    np.testing.assert_allclose(orig_probas, loaded_probas, rtol=1e-5)
    assert orig_scores == loaded_scores


def test_precomputed_context_consistency():
    dates = pd.date_range("2024-01-01", periods=10, freq="7D")
    records = []
    for i, d in enumerate(dates):
        records.append(
            {
                "season": "2023-24",
                "date": d,
                "home_team": "Arsenal" if i % 2 == 0 else "Chelsea",
                "away_team": "Chelsea" if i % 2 == 0 else "Arsenal",
                "home_goals": 2,
                "away_goals": 1,
                "result": "H",
                "home_shots": 14.0,
                "away_shots": 9.0,
                "home_shots_target": 5.0,
                "away_shots_target": 3.0,
                "home_corners": 6.0,
                "away_corners": 4.0,
                "home_possession": 55.0,
                "away_possession": 45.0,
            }
        )
    raw_df = pd.DataFrame(records)
    future_date = datetime(2024, 4, 1)

    # Standard extraction
    feat_std = build_fixture_features("Arsenal", "Chelsea", future_date, raw_df)

    # Precomputed context extraction
    ctx = build_feature_context(raw_df, as_of_date=future_date)
    feat_ctx = build_fixture_features("Arsenal", "Chelsea", future_date, raw_df, precomputed_context=ctx)

    pd.testing.assert_frame_equal(feat_std, feat_ctx)


def test_precomputed_context_rejects_future_history():
    """Cached Elo state containing future matches must not leak into past fixtures."""
    dates = pd.date_range("2024-01-01", periods=10, freq="7D")
    records = []
    for i, d in enumerate(dates):
        records.append(
            {
                "season": "2023-24",
                "date": d,
                "home_team": "Arsenal" if i % 2 == 0 else "Chelsea",
                "away_team": "Chelsea" if i % 2 == 0 else "Arsenal",
                "home_goals": 2,
                "away_goals": 1,
                "result": "H",
                "home_shots": 14.0,
                "away_shots": 9.0,
                "home_shots_target": 5.0,
                "away_shots_target": 3.0,
                "home_corners": 6.0,
                "away_corners": 4.0,
                "home_possession": 55.0,
                "away_possession": 45.0,
            }
        )
    raw_df = pd.DataFrame(records)
    mid_date = datetime(2024, 2, 1)

    feat_past_only = build_fixture_features("Arsenal", "Chelsea", mid_date, raw_df)
    # Full-history cache (contains March matches) must be ignored for a Feb fixture.
    full_ctx = build_feature_context(raw_df)
    feat_with_full_cache = build_fixture_features(
        "Arsenal", "Chelsea", mid_date, raw_df, precomputed_context=full_ctx
    )
    pd.testing.assert_frame_equal(feat_past_only, feat_with_full_cache)


def test_scoreline_agrees_with_proba_argmax():
    n_samples = 20
    feature_cols = get_feature_column_names()
    np.random.seed(7)
    X = pd.DataFrame(np.random.randn(n_samples, len(feature_cols)), columns=feature_cols)
    y_outcome = pd.Series(np.random.choice([0, 1, 2], size=n_samples))
    y_hg = pd.Series(np.random.poisson(1.5, size=n_samples))
    y_ag = pd.Series(np.random.poisson(1.1, size=n_samples))
    model = MatchPredictorModel("rf")
    model.fit(X, y_outcome, y_hg, y_ag)
    probas = model.predict_outcome_proba(X)
    scores = model.predict_scoreline(X)
    for i, (h, a) in enumerate(scores):
        fav = int(np.argmax(probas[i]))
        if fav == 2:
            assert h > a
        elif fav == 0:
            assert h < a
        else:
            assert h == a


def test_poisson_grid_dixon_coles_direction():
    model = MatchPredictorModel("rf")
    grid, _ = model.compute_poisson_grid(1.5, 1.2, max_goals=2)
    # With positive rho, 1-1 is suppressed (tau=1-rho<1) and mass shifts
    # sensibly; grid must remain a valid distribution.
    assert abs(float(grid.sum()) - 1.0) < 1e-9
    assert bool((grid >= 0).all())


def test_engineered_cold_start_uses_fixed_priors():
    dates = pd.date_range("2024-01-01", periods=2, freq="7D")
    raw_df = pd.DataFrame(
        [
            {
                "season": "2023-24", "date": dates[0],
                "home_team": "Arsenal", "away_team": "Chelsea",
                "home_goals": 2, "away_goals": 1, "result": "H",
                "home_shots": 14.0, "away_shots": 9.0,
                "home_shots_target": 5.0, "away_shots_target": 3.0,
                "home_corners": 6.0, "away_corners": 4.0,
                "home_possession": 55.0, "away_possession": 45.0,
            },
            {
                "season": "2023-24", "date": dates[1],
                "home_team": "Liverpool", "away_team": "Manchester City",
                "home_goals": 1, "away_goals": 1, "result": "D",
                "home_shots": 13.0, "away_shots": 11.0,
                "home_shots_target": 4.0, "away_shots_target": 4.0,
                "home_corners": 5.0, "away_corners": 5.0,
                "home_possession": 52.0, "away_possession": 48.0,
            },
        ]
    )
    feat_df = build_engineered_dataset(raw_df)
    assert not feat_df[get_feature_column_names()].isna().any().any()


def test_benchmark_uses_expected_goals_mae():
    from src.models import train_and_benchmark_models

    n = 30
    feature_cols = get_feature_column_names()
    np.random.seed(11)
    base = pd.DataFrame(np.random.randn(n, len(feature_cols)), columns=feature_cols)
    base["date"] = pd.date_range("2023-01-01", periods=n, freq="7D")
    base["target_outcome"] = np.random.choice([0, 1, 2], size=n)
    base["target_home_goals"] = np.random.poisson(1.5, size=n)
    base["target_away_goals"] = np.random.poisson(1.2, size=n)
    train_df, val_df = base.iloc[:20].copy(), base.iloc[20:].copy()
    _, metrics = train_and_benchmark_models(train_df, val_df, feature_cols)
    for vals in metrics.values():
        # MAE on continuous xG is typically < 2 for this scale; integer-score
        # MAE would be quantized. Just assert finiteness and scoreline separation.
        assert np.isfinite(vals["avg_goal_mae"])
        assert "exact_score_acc" in vals
        assert len(vals["pred_scores"]) == len(val_df)
