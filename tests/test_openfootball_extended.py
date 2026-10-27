"""Contract and regression tests for openfootball/england ingestion and multi-competition context."""

import os
from datetime import datetime
import pandas as pd
import numpy as np
import pytest

from src.data_loader import (
    TEAM_ALIASES,
    COMPETITION_FILE_MAP,
    attach_played_results,
    season_label_start_year,
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


def test_competition_file_map_matches_upstream_published_filenames():
    """openfootball/england publishes unhyphenated cup filenames.

    Requesting fa-cup.txt / efl-cup.txt / league-cup.txt 404s, so every cup
    fetch failed and the whole multi-competition context layer silently
    collapsed to plain Premier League history while load_data() reported
    success. Pin the exact upstream names so this cannot regress silently.
    """
    assert COMPETITION_FILE_MAP["facup"] == ["facup.txt"]
    assert COMPETITION_FILE_MAP["eflcup"] == ["eflcup.txt"]
    assert COMPETITION_FILE_MAP["premierleague"] == ["1-premierleague.txt"]
    assert COMPETITION_FILE_MAP["championship"] == ["2-championship.txt"]
    # Historical hyphenated variants and the non-existent lower-division
    # suffixes must not reappear; each miss costs a retried download.
    assert not any("fa-cup" in n or "efl-cup" in n or "league-cup" in n for n in COMPETITION_FILE_MAP["facup"] + COMPETITION_FILE_MAP["eflcup"])
    assert not any(n.endswith(("-i.txt", "-ii.txt")) for n in COMPETITION_FILE_MAP["premierleague"])


def test_regular_season_header_yields_distinct_gameweeks(tmp_path):
    """2025-26 renamed the Premier League header to "Regular Season - N".

    The old pattern matched only Matchday/Round/Stage/Week, so every row in
    that season kept the initialiser gameweek of 1. 380 rows all labelled
    gameweek 1 still pass validate_web_dataset, which only range-checks 1..38.
    """
    body = []
    for week in range(1, 39):
        body.append(f"▪ Regular Season - {week}")
        body.append("  Sat Aug 16")
        body.append("    15:00  Arsenal FC v Chelsea FC")
    test_file = tmp_path / "1-premierleague.txt"
    test_file.write_text("\n".join(body), encoding="utf-8")

    df = parse_openfootball_fixtures(str(test_file), season="2025-26", is_url=False)

    assert len(df) == 38
    assert sorted(df["gameweek"].unique()) == list(range(1, 39))


def test_season_label_start_year_handles_both_label_shapes():
    """4-character codes start in 2000 + code[:2]; "2021" is 2020/21, not 2021."""
    assert season_label_start_year("2026-27") == 2026
    assert season_label_start_year("2015-16") == 2015
    assert season_label_start_year("2021") == 2020
    assert season_label_start_year("2425") == 2024
    assert season_label_start_year("2627") == 2026
    assert season_label_start_year("1819") == 2018


def test_results_overlay_fills_missing_scores_and_keeps_leakage_out():
    """The schedule feed lags the results feed; the overlay fills the gap.

    Matches are keyed on clubs with a +/-3 day kickoff tolerance because the
    two feeds disagree by a day on rescheduled games, and a result must never
    overwrite a fixture that already has one.
    """
    fixtures = pd.DataFrame(
        {
            "gameweek": [4, 4, 5],
            "date": pd.to_datetime(["2026-09-12", "2026-09-13", "2026-09-19"]),
            "time": ["", "14:00", ""],
            "home_team": ["Crystal Palace", "Arsenal", "Leeds"],
            "away_team": ["Ipswich", "Chelsea", "Crystal Palace"],
            "status": ["upcoming", "played", "upcoming"],
            "home_goals": [np.nan, 2.0, np.nan],
            "away_goals": [np.nan, 1.0, np.nan],
        }
    )
    results = pd.DataFrame(
        {
            "date": pd.to_datetime(["2026-09-12", "2026-09-13", "2026-09-20"]),
            "home_team": ["Crystal Palace", "Arsenal", "Leeds"],
            "away_team": ["Ipswich", "Chelsea", "Crystal Palace"],
            "home_goals": [1, 4, 0],
            "away_goals": [3, 0, 0],
            "time": ["15:00", "14:00", "16:30"],
        }
    )

    merged = attach_played_results(fixtures, results).set_index("home_team")

    # Exact-day match records the score and the kickoff time the feed lacked.
    assert merged.loc["Crystal Palace", "status"] == "played"
    assert (merged.loc["Crystal Palace", "home_goals"], merged.loc["Crystal Palace", "away_goals"]) == (1, 3)
    assert merged.loc["Crystal Palace", "time"] == "15:00"
    # Recorded results are authoritative: the overlay never rewrites them.
    assert (merged.loc["Arsenal", "home_goals"], merged.loc["Arsenal", "away_goals"]) == (2, 1)
    # One-day reschedule still matches, and the schedule's own date is kept.
    assert merged.loc["Leeds", "status"] == "played"
    assert merged.loc["Leeds", "date"] == pd.Timestamp("2026-09-19")
    assert merged.loc["Leeds", "time"] == "16:30"
    # Untouched fixtures stay upcoming.
    assert list(fixtures["status"]) == ["upcoming", "played", "upcoming"]


def test_results_overlay_ignores_stale_or_unrelated_results():
    """A result months away from the scheduled fixture is not that fixture."""
    fixtures = pd.DataFrame(
        {
            "gameweek": [10],
            "date": pd.to_datetime(["2027-05-02"]),
            "time": ["15:00"],
            "home_team": ["Arsenal"],
            "away_team": ["Chelsea"],
            "status": ["upcoming"],
            "home_goals": [np.nan],
            "away_goals": [np.nan],
        }
    )
    results = pd.DataFrame(
        {
            "date": pd.to_datetime(["2026-08-23"]),
            "home_team": ["Arsenal"],
            "away_team": ["Chelsea"],
            "home_goals": [2],
            "away_goals": [0],
            "time": ["15:00"],
        }
    )

    merged = attach_played_results(fixtures, results)

    assert merged.loc[0, "status"] == "upcoming"
    assert pd.isna(merged.loc[0, "home_goals"])


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
