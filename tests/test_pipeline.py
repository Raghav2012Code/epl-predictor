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
    assert feat_row["home_roll_goals_for_3"].values[0] == 2.0
    assert feat_row["away_roll_goals_against_3"].values[0] == 2.0
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
