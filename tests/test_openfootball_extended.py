"""Contract and regression tests for openfootball/england ingestion and multi-competition context."""

import os
from datetime import datetime
import pandas as pd
import numpy as np
import pytest

from src.data_loader import (
    TEAM_ALIASES,
    standardize_team_name,
    parse_openfootball_fixtures,
    load_openfootball_competition_data,
    load_multi_competition_history,
)
from src.feature_engineering import (
    compute_dynamic_elo,
    compute_team_rolling_features,
    transform_matches_to_team_perspective,
    build_fixture_features,
    BASE_ELO,
    STADIUM_COORDS,
)


def test_openfootball_cup_and_knockout_parsing(tmp_path):
    """Verifies parsing of openfootball tournament files with extra time, penalties, and rounds."""
    sample_text = """
= FA Cup 2024/25

▪ Round 3
  Fri Jan 10 2025
    19:45  Aston Villa FC   v Chelsea FC                1-2
  Sat Jan 11
    12:30  Liverpool FC     v Manchester United FC      2-2 aet (1-1) 4-5 pen.
           Arsenal FC       v Tottenham Hotspur FC      3-1 (1-0)
  Sun Jan 12
    16:30  Manchester City FC v Newcastle United FC     2-0 (1-0)

▪ Round of 16
  Sat Feb 15
    15:00  Chelsea FC       v Arsenal FC                1-1
"""
    test_file = tmp_path / "fa-cup.txt"
    test_file.write_text(sample_text.strip(), encoding="utf-8")

    df = parse_openfootball_fixtures(str(test_file), season="2024-25", is_url=False)
    assert not df.empty
    assert len(df) == 5

    # Check teams are canonicalized
    assert "Aston Villa" in df["home_team"].values
    assert "Chelsea" in df["away_team"].values
    assert "Liverpool" in df["home_team"].values
    assert "Manchester United" in df["away_team"].values

    # Check penalty / extra time score parsing
    liv_row = df[(df["home_team"] == "Liverpool") & (df["away_team"] == "Manchester United")].iloc[0]
    assert liv_row["status"] == "played"
    assert liv_row["home_goals"] == 2
    assert liv_row["away_goals"] == 2


def test_team_aliases_expansion():
    """Checks that historical and Championship club aliases resolve to canonical names."""
    assert standardize_team_name("Swansea City AFC") == "Swansea"
    assert standardize_team_name("Stoke City FC") == "Stoke"
    assert standardize_team_name("Middlesbrough FC") == "Middlesbrough"
    assert standardize_team_name("Blackburn Rovers") == "Blackburn"
    assert standardize_team_name("Derby County") == "Derby"
    assert standardize_team_name("Reading FC") == "Reading"
    assert standardize_team_name("Bolton Wanderers") == "Bolton"
    assert standardize_team_name("Wigan Athletic") == "Wigan"
    assert standardize_team_name("Queens Park Rangers") == "QPR"
    assert standardize_team_name("Bristol City FC") == "Bristol City"
    assert standardize_team_name("Preston North End") == "Preston"
    assert standardize_team_name("Millwall FC") == "Millwall"
    assert standardize_team_name("Wrexham AFC") == "Wrexham"


def test_multi_competition_rest_and_congestion(tmp_path):
    """Verifies that a midweek cup match correctly affects rest days and congestion for a weekend league match."""
    matches = pd.DataFrame([
        {
            "match_id": 1,
            "competition": "premierleague",
            "season": "2024-25",
            "date": pd.to_datetime("2025-01-04"),
            "home_team": "Arsenal",
            "away_team": "Chelsea",
            "home_goals": 2,
            "away_goals": 1,
            "result": "H",
        },
        {
            "match_id": 2,
            "competition": "facup",
            "season": "2024-25",
            "date": pd.to_datetime("2025-01-08"),  # Wednesday cup match
            "home_team": "Arsenal",
            "away_team": "Liverpool",
            "home_goals": 1,
            "away_goals": 1,
            "result": "D",
        },
        {
            "match_id": 3,
            "competition": "premierleague",
            "season": "2024-25",
            "date": pd.to_datetime("2025-01-11"),  # Saturday league match (3 days rest after cup)
            "home_team": "Tottenham",
            "away_team": "Arsenal",
            "home_goals": 1,
            "away_goals": 2,
            "result": "A",
        },
    ])

    team_df = transform_matches_to_team_perspective(matches)
    team_feats = compute_team_rolling_features(team_df)

    # Filter for Arsenal's row on 2025-01-11
    ars_row = team_feats[(team_feats["team"] == "Arsenal") & (team_feats["date"] == pd.to_datetime("2025-01-11"))].iloc[0]

    # Rest days should be exactly 3.0 days (from Jan 8 to Jan 11)
    assert ars_row["rest_days"] == pytest.approx(3.0, abs=0.1)

    # Congestion in trailing 14 days should count the prior 2 matches (Jan 4 and Jan 8)
    assert ars_row["congestion_14d"] == 2


def test_zero_leakage_with_multi_competition_history():
    """Ensures multi-competition feature extraction never sees matches on or after match_date."""
    matches = pd.DataFrame([
        {
            "match_id": 1,
            "competition": "premierleague",
            "season": "2024-25",
            "date": pd.to_datetime("2025-01-01"),
            "home_team": "Manchester City",
            "away_team": "Everton",
            "home_goals": 3,
            "away_goals": 0,
            "result": "H",
        },
        {
            "match_id": 2,
            "competition": "eflcup",
            "season": "2024-25",
            "date": pd.to_datetime("2025-01-07"),
            "home_team": "Manchester City",
            "away_team": "Watford",
            "home_goals": 4,
            "away_goals": 0,
            "result": "H",
        },
        {
            "match_id": 3,
            "competition": "premierleague",
            "season": "2024-25",
            "date": pd.to_datetime("2025-01-15"),
            "home_team": "Manchester City",
            "away_team": "Chelsea",
            "home_goals": 1,
            "away_goals": 1,
            "result": "D",
        },
    ])

    # Target fixture as of 2025-01-10 (before Jan 15 match)
    feat_df = build_fixture_features(
        home_team="Manchester City",
        away_team="Chelsea",
        match_date=pd.to_datetime("2025-01-10"),
        history_matches_df=matches,
    )

    # Prior goals for Man City in 3-match window should only reflect Jan 1 (3) and Jan 7 (4) -> mean = 3.5
    assert feat_df["home_roll_goals_for_3"].iloc[0] == pytest.approx(3.5, abs=0.01)
    # Rest days for Man City on Jan 10 should be 3 days (from Jan 7 cup match)
    assert feat_df["home_rest_days"].iloc[0] == pytest.approx(3.0, abs=0.1)


def test_dynamic_elo_competition_k_scaling():
    """Verifies that dynamic Elo scales K for non-league/cup matches."""
    epl_match = pd.DataFrame([{
        "match_id": 1,
        "competition": "premierleague",
        "season": "2024-25",
        "date": pd.to_datetime("2024-09-01"),
        "home_team": "Arsenal",
        "away_team": "Tottenham",
        "home_goals": 2,
        "away_goals": 0,
        "result": "H",
    }])
    cup_match = pd.DataFrame([{
        "match_id": 1,
        "competition": "facup",
        "season": "2024-25",
        "date": pd.to_datetime("2024-09-01"),
        "home_team": "Arsenal",
        "away_team": "Tottenham",
        "home_goals": 2,
        "away_goals": 0,
        "result": "H",
    }])

    _, _, _, _, epl_ratings, _ = compute_dynamic_elo(epl_match)
    _, _, _, _, cup_ratings, _ = compute_dynamic_elo(cup_match)

    # Elo change in cup match should be lower than league match due to 0.75 K-scaling
    epl_delta = epl_ratings["Arsenal"] - BASE_ELO["Arsenal"]
    cup_delta = cup_ratings["Arsenal"] - BASE_ELO["Arsenal"]
    assert cup_delta < epl_delta
    assert cup_delta == pytest.approx(epl_delta * 0.75, rel=1e-2)
