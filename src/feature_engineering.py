"""Feature engineering pipeline for match outcome and scoreline forecasting.

Computes rolling statistics (goals, shots, possession, points momentum),
venue-specific form, head-to-head metrics, and rest days with strict
zero-leakage guarantees.
"""

from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

WINDOWS: List[int] = [3, 5, 10]

# Historical baseline Elo ratings & power parameters across 2020-2026
BASE_ELO: Dict[str, float] = {
    # Elite Title Contenders
    "Manchester City": 1950.0,
    "Arsenal": 1915.0,
    "Liverpool": 1895.0,
    # European Contenders
    "Chelsea": 1790.0,
    "Newcastle": 1785.0,
    "Aston Villa": 1780.0,
    "Tottenham": 1770.0,
    "Manchester United": 1760.0,
    # Established Mid-Table
    "West Ham": 1690.0,
    "Brighton": 1690.0,
    "Brentford": 1670.0,
    "Bournemouth": 1660.0,
    "Crystal Palace": 1650.0,
    "Fulham": 1645.0,
    "Wolves": 1640.0,
    # Lower Table / Regulars
    "Leicester": 1600.0,
    "Everton": 1590.0,
    "Nottingham Forest": 1575.0,
    "Leeds": 1560.0,
    "Southampton": 1540.0,
    "Burnley": 1520.0,
    # Relegation Battlers & Promoted Sides
    "Watford": 1500.0,
    "Norwich": 1490.0,
    "West Brom": 1490.0,
    "Sheffield United": 1480.0,
    "Luton": 1480.0,
    "Ipswich": 1475.0,
    "Sunderland": 1460.0,
    "Coventry": 1430.0,
    "Hull": 1420.0,
}

CLUB_POWER_INDEX: Dict[str, Dict[str, float]] = {
    "Manchester City": {"elo": 1950.0, "gf_baseline": 2.42, "ga_baseline": 0.86, "points_baseline": 2.30, "shots_baseline": 16.5, "target_baseline": 6.5, "poss_baseline": 65.0},
    "Arsenal": {"elo": 1915.0, "gf_baseline": 2.18, "ga_baseline": 0.99, "points_baseline": 2.20, "shots_baseline": 15.5, "target_baseline": 5.8, "poss_baseline": 60.0},
    "Liverpool": {"elo": 1895.0, "gf_baseline": 2.14, "ga_baseline": 1.08, "points_baseline": 2.15, "shots_baseline": 16.0, "target_baseline": 6.0, "poss_baseline": 61.0},
    "Chelsea": {"elo": 1790.0, "gf_baseline": 1.64, "ga_baseline": 1.22, "points_baseline": 1.70, "shots_baseline": 14.5, "target_baseline": 5.2, "poss_baseline": 57.0},
    "Newcastle": {"elo": 1785.0, "gf_baseline": 1.62, "ga_baseline": 1.32, "points_baseline": 1.68, "shots_baseline": 14.0, "target_baseline": 5.0, "poss_baseline": 53.0},
    "Aston Villa": {"elo": 1780.0, "gf_baseline": 1.56, "ga_baseline": 1.36, "points_baseline": 1.65, "shots_baseline": 13.5, "target_baseline": 4.8, "poss_baseline": 52.0},
    "Tottenham": {"elo": 1770.0, "gf_baseline": 1.76, "ga_baseline": 1.38, "points_baseline": 1.62, "shots_baseline": 14.5, "target_baseline": 5.3, "poss_baseline": 55.0},
    "Manchester United": {"elo": 1760.0, "gf_baseline": 1.58, "ga_baseline": 1.27, "points_baseline": 1.60, "shots_baseline": 14.0, "target_baseline": 5.0, "poss_baseline": 53.0},
    "West Ham": {"elo": 1690.0, "gf_baseline": 1.40, "ga_baseline": 1.45, "points_baseline": 1.35, "shots_baseline": 12.0, "target_baseline": 4.0, "poss_baseline": 45.0},
    "Brighton": {"elo": 1690.0, "gf_baseline": 1.40, "ga_baseline": 1.33, "points_baseline": 1.38, "shots_baseline": 14.0, "target_baseline": 4.6, "poss_baseline": 56.0},
    "Brentford": {"elo": 1670.0, "gf_baseline": 1.45, "ga_baseline": 1.49, "points_baseline": 1.32, "shots_baseline": 12.5, "target_baseline": 4.3, "poss_baseline": 46.0},
    "Bournemouth": {"elo": 1660.0, "gf_baseline": 1.28, "ga_baseline": 1.69, "points_baseline": 1.30, "shots_baseline": 12.5, "target_baseline": 4.2, "poss_baseline": 46.0},
    "Crystal Palace": {"elo": 1650.0, "gf_baseline": 1.22, "ga_baseline": 1.43, "points_baseline": 1.28, "shots_baseline": 11.5, "target_baseline": 3.9, "poss_baseline": 45.0},
    "Fulham": {"elo": 1645.0, "gf_baseline": 1.25, "ga_baseline": 1.46, "points_baseline": 1.25, "shots_baseline": 12.0, "target_baseline": 4.1, "poss_baseline": 48.0},
    "Wolves": {"elo": 1640.0, "gf_baseline": 1.20, "ga_baseline": 1.50, "points_baseline": 1.22, "shots_baseline": 11.0, "target_baseline": 3.8, "poss_baseline": 46.0},
    "Everton": {"elo": 1590.0, "gf_baseline": 1.10, "ga_baseline": 1.44, "points_baseline": 1.05, "shots_baseline": 11.5, "target_baseline": 3.7, "poss_baseline": 42.0},
    "Nottingham Forest": {"elo": 1575.0, "gf_baseline": 1.18, "ga_baseline": 1.74, "points_baseline": 1.00, "shots_baseline": 11.0, "target_baseline": 3.5, "poss_baseline": 41.0},
    "Leeds": {"elo": 1560.0, "gf_baseline": 1.36, "ga_baseline": 1.81, "points_baseline": 0.98, "shots_baseline": 12.0, "target_baseline": 3.8, "poss_baseline": 47.0},
    "Leicester": {"elo": 1560.0, "gf_baseline": 1.25, "ga_baseline": 1.75, "points_baseline": 0.95, "shots_baseline": 11.5, "target_baseline": 3.6, "poss_baseline": 46.0},
    "Southampton": {"elo": 1530.0, "gf_baseline": 1.10, "ga_baseline": 1.85, "points_baseline": 0.90, "shots_baseline": 11.0, "target_baseline": 3.5, "poss_baseline": 44.0},
    "Burnley": {"elo": 1520.0, "gf_baseline": 1.05, "ga_baseline": 1.85, "points_baseline": 0.88, "shots_baseline": 10.5, "target_baseline": 3.2, "poss_baseline": 43.0},
    "Ipswich": {"elo": 1475.0, "gf_baseline": 1.13, "ga_baseline": 1.94, "points_baseline": 0.85, "shots_baseline": 10.0, "target_baseline": 3.1, "poss_baseline": 42.0},
    "Sunderland": {"elo": 1460.0, "gf_baseline": 1.05, "ga_baseline": 1.82, "points_baseline": 0.82, "shots_baseline": 9.8, "target_baseline": 3.0, "poss_baseline": 42.0},
    "Coventry": {"elo": 1430.0, "gf_baseline": 0.97, "ga_baseline": 1.86, "points_baseline": 0.78, "shots_baseline": 9.5, "target_baseline": 2.9, "poss_baseline": 41.0},
    "Hull": {"elo": 1420.0, "gf_baseline": 0.94, "ga_baseline": 1.89, "points_baseline": 0.75, "shots_baseline": 9.2, "target_baseline": 2.8, "poss_baseline": 40.0},
}


def compute_dynamic_elo(
    matches_df: pd.DataFrame,
    initial_ratings: Optional[Dict[str, float]] = None,
    home_adv: float = 65.0,
    k_base: float = 20.0,
) -> Tuple[
    List[float],
    List[float],
    List[float],
    Dict[str, List[float]],
    Dict[str, float],
    Dict[str, List[float]],
]:
    """Calculates chronological pre-match Elo ratings and momentum trajectories with zero leakage.

    Features:
        - Dynamic streak momentum acceleration: Teams on active streaks receive amplified K updates.
        - Inter-season regression to the mean (15% reversion to base Elo, streak reset).
        - Multi-window Elo velocity (3-match and 5-match rolling rate of change).
        - Non-linear goal margin scaling.

    Returns:
        home_elos: Pre-match Elo for home team for each row.
        away_elos: Pre-match Elo for away team for each row.
        elo_diffs: Pre-match (home_elo + home_adv - away_elo) for each row.
        momentum_dict: Pre-match 3-match and 5-match Elo momentum features.
        current_ratings: Final Elo state after all matches played.
        rating_histories: Chronological history of pre-match Elo ratings per club.
    """
    ratings: Dict[str, float] = dict(initial_ratings) if initial_ratings else dict(BASE_ELO)
    rating_histories: Dict[str, List[float]] = {t: [] for t in BASE_ELO.keys()}
    streaks: Dict[str, int] = {t: 0 for t in BASE_ELO.keys()}

    n_matches = len(matches_df)
    if n_matches == 0:
        empty_mom = {
            "home_elo_momentum_3": [],
            "away_elo_momentum_3": [],
            "diff_elo_momentum_3": [],
            "home_elo_momentum_5": [],
            "away_elo_momentum_5": [],
            "diff_elo_momentum_5": [],
        }
        return [], [], [], empty_mom, ratings, rating_histories

    home_elos: List[float] = [0.0] * n_matches
    away_elos: List[float] = [0.0] * n_matches
    elo_diffs: List[float] = [0.0] * n_matches

    h_mom_3: List[float] = [0.0] * n_matches
    a_mom_3: List[float] = [0.0] * n_matches
    diff_mom_3: List[float] = [0.0] * n_matches

    h_mom_5: List[float] = [0.0] * n_matches
    a_mom_5: List[float] = [0.0] * n_matches
    diff_mom_5: List[float] = [0.0] * n_matches

    ht_arr = matches_df["home_team"].values
    at_arr = matches_df["away_team"].values
    season_arr = matches_df["season"].values if "season" in matches_df.columns else None
    has_goals = "home_goals" in matches_df.columns and "away_goals" in matches_df.columns
    hg_arr = matches_df["home_goals"].values if has_goals else None
    ag_arr = matches_df["away_goals"].values if has_goals else None

    last_season = season_arr[0] if season_arr is not None and len(season_arr) > 0 else None

    for i in range(n_matches):
        ht = ht_arr[i]
        at = at_arr[i]

        # Handle off-season mean reversion between seasons
        if season_arr is not None:
            curr_season = season_arr[i]
            if curr_season != last_season:
                for team in ratings:
                    base = BASE_ELO.get(team, 1420.0)
                    ratings[team] = 0.85 * ratings[team] + 0.15 * base
                    streaks[team] = 0
                last_season = curr_season

        rh = ratings.get(ht, BASE_ELO.get(ht, 1420.0))
        ra = ratings.get(at, BASE_ELO.get(at, 1420.0))

        # Record pre-match ratings
        home_elos[i] = rh
        away_elos[i] = ra
        elo_diffs[i] = (rh + home_adv) - ra

        # Compute pre-match Elo momentum (rate of change over past matches)
        h_hist = rating_histories.get(ht, [])
        a_hist = rating_histories.get(at, [])

        h_m3 = (rh - h_hist[-3]) if len(h_hist) >= 3 else (rh - BASE_ELO.get(ht, 1420.0))
        a_m3 = (ra - a_hist[-3]) if len(a_hist) >= 3 else (ra - BASE_ELO.get(at, 1420.0))
        h_mom_3[i] = round(h_m3, 2)
        a_mom_3[i] = round(a_m3, 2)
        diff_mom_3[i] = round(h_m3 - a_m3, 2)

        h_m5 = (rh - h_hist[-5]) if len(h_hist) >= 5 else (rh - BASE_ELO.get(ht, 1420.0))
        a_m5 = (ra - a_hist[-5]) if len(a_hist) >= 5 else (ra - BASE_ELO.get(at, 1420.0))
        h_mom_5[i] = round(h_m5, 2)
        a_mom_5[i] = round(a_m5, 2)
        diff_mom_5[i] = round(h_m5 - a_m5, 2)

        # Update rating history before match is played (zero-leakage)
        if ht not in rating_histories:
            rating_histories[ht] = []
        if at not in rating_histories:
            rating_histories[at] = []
        rating_histories[ht].append(rh)
        rating_histories[at].append(ra)

        # If match was played with valid score, update Elo for subsequent matches
        if has_goals:
            hg = hg_arr[i]
            ag = ag_arr[i]
            if pd.notna(hg) and pd.notna(ag):
                hg_val = float(hg)
                ag_val = float(ag)

                dr = (rh + home_adv) - ra
                eh = 1.0 / (1.0 + 10.0 ** (-dr / 400.0))
                ea = 1.0 - eh

                sh = 1.0 if hg_val > ag_val else (0.5 if hg_val == ag_val else 0.0)
                sa = 1.0 - sh

                margin = abs(hg_val - ag_val)
                g_mult = 1.0 if margin <= 1 else (1.5 if margin == 2 else 1.75 + (margin - 3) / 8.0)

                # Streak momentum multiplier
                h_streak = streaks.get(ht, 0)
                a_streak = streaks.get(at, 0)

                h_streak_mult = 1.0
                if sh == 1.0 and h_streak >= 2:
                    h_streak_mult += min(0.35, 0.08 * (h_streak - 1))
                elif sh == 0.0 and h_streak <= -2:
                    h_streak_mult += min(0.35, 0.08 * (abs(h_streak) - 1))

                a_streak_mult = 1.0
                if sa == 1.0 and a_streak >= 2:
                    a_streak_mult += min(0.35, 0.08 * (a_streak - 1))
                elif sa == 0.0 and a_streak <= -2:
                    a_streak_mult += min(0.35, 0.08 * (abs(a_streak) - 1))

                k_h = k_base * g_mult * h_streak_mult
                k_a = k_base * g_mult * a_streak_mult

                ratings[ht] = rh + k_h * (sh - eh)
                ratings[at] = ra + k_a * (sa - ea)

                # Update streaks
                if sh == 1.0:
                    streaks[ht] = h_streak + 1 if h_streak > 0 else 1
                    streaks[at] = a_streak - 1 if a_streak < 0 else -1
                elif sa == 1.0:
                    streaks[at] = a_streak + 1 if a_streak > 0 else 1
                    streaks[ht] = h_streak - 1 if h_streak < 0 else -1
                else:
                    streaks[ht] = 0
                    streaks[at] = 0

    momentum_dict = {
        "home_elo_momentum_3": h_mom_3,
        "away_elo_momentum_3": a_mom_3,
        "diff_elo_momentum_3": diff_mom_3,
        "home_elo_momentum_5": h_mom_5,
        "away_elo_momentum_5": a_mom_5,
        "diff_elo_momentum_5": diff_mom_5,
    }

    return home_elos, away_elos, elo_diffs, momentum_dict, ratings, rating_histories


def transform_matches_to_team_perspective(df: pd.DataFrame) -> pd.DataFrame:
    """Transforms match results into a row-per-team dataset sorted chronologically.

    Each match generates two rows: one for the home team and one for the away team.
    """
    if df.empty:
        return pd.DataFrame()

    df = df.copy().sort_values(by="date").reset_index(drop=True)
    n = len(df)
    m_ids = df.index.values

    # Determine match results if not already present
    if "result" in df.columns:
        res = df["result"]
    else:
        res = np.where(
            df["home_goals"] > df["away_goals"],
            "H",
            np.where(df["home_goals"] < df["away_goals"], "A", "D"),
        )

    h_pts = np.where(res == "H", 3, np.where(res == "D", 1, 0))
    a_pts = np.where(res == "A", 3, np.where(res == "D", 1, 0))

    home_df = pd.DataFrame(
        {
            "match_id": m_ids,
            "date": df["date"],
            "team": df["home_team"],
            "opponent": df["away_team"],
            "is_home": 1,
            "goals_for": df["home_goals"],
            "goals_against": df["away_goals"],
            "goal_diff": df["home_goals"] - df["away_goals"],
            "shots_for": df.get("home_shots", 12.0),
            "shots_against": df.get("away_shots", 10.0),
            "shots_target_for": df.get("home_shots_target", 4.0),
            "shots_target_against": df.get("away_shots_target", 3.0),
            "possession": df.get("home_possession", 50.0),
            "points": h_pts,
            "win": np.where(res == "H", 1, 0),
            "draw": np.where(res == "D", 1, 0),
            "loss": np.where(res == "A", 1, 0),
        }
    )

    away_df = pd.DataFrame(
        {
            "match_id": m_ids,
            "date": df["date"],
            "team": df["away_team"],
            "opponent": df["home_team"],
            "is_home": 0,
            "goals_for": df["away_goals"],
            "goals_against": df["home_goals"],
            "goal_diff": df["away_goals"] - df["home_goals"],
            "shots_for": df.get("away_shots", 10.0),
            "shots_against": df.get("home_shots", 12.0),
            "shots_target_for": df.get("away_shots_target", 3.0),
            "shots_target_against": df.get("home_shots_target", 4.0),
            "possession": df.get("away_possession", 50.0),
            "points": a_pts,
            "win": np.where(res == "A", 1, 0),
            "draw": np.where(res == "D", 1, 0),
            "loss": np.where(res == "H", 1, 0),
        }
    )

    team_df = pd.concat([home_df, away_df], ignore_index=True)
    team_df = team_df.sort_values(by=["date", "match_id"]).reset_index(drop=True)
    return team_df


def compute_team_rolling_features(team_df: pd.DataFrame) -> pd.DataFrame:
    """Computes rolling averages for each team prior to each match (shift 1)."""
    metrics = [
        "goals_for",
        "goals_against",
        "goal_diff",
        "shots_for",
        "shots_target_for",
        "possession",
        "points",
    ]

    team_df = team_df.sort_values(by=["team", "date"]).reset_index(drop=True)

    # Rest days calculation
    team_df["prev_date"] = team_df.groupby("team")["date"].shift(1)
    team_df["rest_days"] = (team_df["date"] - team_df["prev_date"]).dt.total_seconds() / (24 * 3600)
    team_df["rest_days"] = team_df["rest_days"].fillna(7.0).clip(lower=1.0, upper=30.0)

    # Rolling overall metrics
    for w in WINDOWS:
        for m in metrics:
            col_name = f"roll_{m}_{w}"
            team_df[col_name] = (
                team_df.groupby("team")[m]
                .transform(lambda s: s.shift(1).rolling(w, min_periods=1).mean())
            )

    # Venue-specific rolling metrics (home form for home games, away form for away games)
    team_df = team_df.sort_values(by=["team", "is_home", "date"]).reset_index(drop=True)
    venue_metrics = ["goals_for", "goals_against", "points"]
    for m in venue_metrics:
        team_df[f"venue_roll_{m}_5"] = (
            team_df.groupby(["team", "is_home"])[m]
            .transform(lambda s: s.shift(1).rolling(5, min_periods=1).mean())
        )

    team_df = team_df.sort_values(by=["match_id", "is_home"], ascending=[True, False]).reset_index(drop=True)
    return team_df


def compute_head_to_head_features(matches_df: pd.DataFrame) -> pd.DataFrame:
    """Computes historical head-to-head records prior to each match."""
    matches_df = matches_df.sort_values(by="date").reset_index(drop=True)

    h2h_h_win_rate = []
    h2h_goal_diff = []
    h2h_total_matches = []

    # Dictionary mapping frozenset({teamA, teamB}) to list of prior encounters
    # encounter: (home_team, hg, ag)
    h2h_history: Dict[Tuple[str, str], List[Tuple[str, int, int]]] = {}

    for _, row in matches_df.iterrows():
        ht = row["home_team"]
        at = row["away_team"]
        pair_key = (ht, at) if ht < at else (at, ht)

        prior_encounters = h2h_history.get(pair_key, [])
        if prior_encounters:
            # Filter up to last 5 encounters
            recent = prior_encounters[-5:]
            h_wins = 0
            gd_sum = 0
            for enc_ht, enc_hg, enc_ag in recent:
                if enc_ht == ht:
                    gd = enc_hg - enc_ag
                    if gd > 0:
                        h_wins += 1
                else:
                    gd = enc_ag - enc_hg
                    if gd > 0:
                        h_wins += 1
                gd_sum += gd

            h2h_h_win_rate.append(h_wins / len(recent))
            h2h_goal_diff.append(gd_sum / len(recent))
            h2h_total_matches.append(len(recent))
        else:
            h2h_h_win_rate.append(0.33)  # default prior
            h2h_goal_diff.append(0.0)
            h2h_total_matches.append(0)

        # Record this encounter after calculating features
        if pair_key not in h2h_history:
            h2h_history[pair_key] = []
        h2h_history[pair_key].append((ht, int(row["home_goals"]), int(row["away_goals"])))

    matches_df["h2h_home_win_rate"] = h2h_h_win_rate
    matches_df["h2h_goal_diff"] = h2h_goal_diff
    matches_df["h2h_matches_count"] = h2h_total_matches
    return matches_df


def build_engineered_dataset(raw_matches: pd.DataFrame) -> pd.DataFrame:
    """End-to-end dataset builder merging rolling stats and H2H features for modeling."""
    raw_matches = raw_matches.copy().sort_values(by="date").reset_index(drop=True)
    raw_matches["match_id"] = raw_matches.index

    # 1. Transform and compute team rolling stats
    team_df = transform_matches_to_team_perspective(raw_matches)
    team_features = compute_team_rolling_features(team_df)

    # Separate home and away features
    home_feats = team_features[team_features["is_home"] == 1].copy()
    away_feats = team_features[team_features["is_home"] == 0].copy()

    # Prefix columns
    feat_cols = [c for c in home_feats.columns if c.startswith("roll_") or c.startswith("venue_roll_") or c == "rest_days"]

    home_rename = {c: f"home_{c}" for c in feat_cols}
    away_rename = {c: f"away_{c}" for c in feat_cols}

    home_subset = home_feats[["match_id"] + feat_cols].rename(columns=home_rename)
    away_subset = away_feats[["match_id"] + feat_cols].rename(columns=away_rename)

    # 2. Compute dynamic Elo ratings and momentum features
    home_elos, away_elos, elo_diffs, elo_mom, _, _ = compute_dynamic_elo(raw_matches)
    raw_matches["home_elo"] = home_elos
    raw_matches["away_elo"] = away_elos
    raw_matches["elo_diff"] = elo_diffs
    for k, vals in elo_mom.items():
        raw_matches[k] = vals

    # 3. Compute H2H features
    matches_with_h2h = compute_head_to_head_features(raw_matches)

    # 4. Merge together
    merged = matches_with_h2h.merge(home_subset, on="match_id", how="left")
    merged = merged.merge(away_subset, on="match_id", how="left")

    # Differential features (home - away advantage indicators)
    for w in WINDOWS:
        merged[f"diff_roll_goals_for_{w}"] = merged[f"home_roll_goals_for_{w}"] - merged[f"away_roll_goals_for_{w}"]
        merged[f"diff_roll_goals_against_{w}"] = merged[f"home_roll_goals_against_{w}"] - merged[f"away_roll_goals_against_{w}"]
        merged[f"diff_roll_points_{w}"] = merged[f"home_roll_points_{w}"] - merged[f"away_roll_points_{w}"]
        merged[f"diff_roll_shots_target_{w}"] = merged[f"home_roll_shots_target_for_{w}"] - merged[f"away_roll_shots_target_for_{w}"]
        merged[f"diff_roll_possession_{w}"] = merged[f"home_roll_possession_{w}"] - merged[f"away_roll_possession_{w}"]

    merged["diff_rest_days"] = merged["home_rest_days"] - merged["away_rest_days"]

    # Target encodings:
    # result: H -> 2, D -> 1, A -> 0
    res_map = {"H": 2, "D": 1, "A": 0}
    merged["target_outcome"] = merged["result"].map(res_map)
    merged["target_home_goals"] = merged["home_goals"]
    merged["target_away_goals"] = merged["away_goals"]

    # Fill any initial missing rolling averages with league median
    feature_columns = get_feature_column_names()
    for col in feature_columns:
        if col in merged.columns:
            merged[col] = merged[col].fillna(merged[col].median())

    return merged


def get_feature_column_names() -> List[str]:
    """Returns the ordered list of predictive feature column names."""
    cols: List[str] = []

    # Elo rating and momentum features
    cols.extend([
        "home_elo",
        "away_elo",
        "elo_diff",
        "home_elo_momentum_3",
        "away_elo_momentum_3",
        "diff_elo_momentum_3",
        "home_elo_momentum_5",
        "away_elo_momentum_5",
        "diff_elo_momentum_5",
    ])

    # Home & Away rolling metrics
    for side in ["home", "away"]:
        cols.append(f"{side}_rest_days")
        for w in WINDOWS:
            for m in ["goals_for", "goals_against", "goal_diff", "shots_for", "shots_target_for", "possession", "points"]:
                cols.append(f"{side}_roll_{m}_{w}")
        for m in ["goals_for", "goals_against", "points"]:
            cols.append(f"{side}_venue_roll_{m}_5")

    # Differential features
    for w in WINDOWS:
        cols.extend([
            f"diff_roll_goals_for_{w}",
            f"diff_roll_goals_against_{w}",
            f"diff_roll_points_{w}",
            f"diff_roll_shots_target_{w}",
            f"diff_roll_possession_{w}",
        ])
    cols.append("diff_rest_days")

    # H2H features
    cols.extend(["h2h_home_win_rate", "h2h_goal_diff", "h2h_matches_count"])
    return cols


def build_fixture_features(
    home_team: str,
    away_team: str,
    match_date: datetime,
    history_matches_df: pd.DataFrame,
) -> pd.DataFrame:
    """Builds a single-row feature DataFrame for an upcoming match using past history.

    Used for real-time inference and upcoming 2026/2027 fixtures.
    """
    history = history_matches_df[history_matches_df["date"] < match_date].copy()
    feature_cols = get_feature_column_names()

    if history.empty:
        # Fallback to zero-diff defaults if no history
        row = {c: 0.0 for c in feature_cols}
        row["home_rest_days"] = 7.0
        row["away_rest_days"] = 7.0
        row["home_roll_possession_5"] = 50.0
        row["away_roll_possession_5"] = 50.0
        h_base = BASE_ELO.get(home_team, 1420.0)
        a_base = BASE_ELO.get(away_team, 1420.0)
        row["home_elo"] = h_base
        row["away_elo"] = a_base
        row["elo_diff"] = (h_base + 65.0) - a_base
        row["home_elo_momentum_3"] = 0.0
        row["away_elo_momentum_3"] = 0.0
        row["diff_elo_momentum_3"] = 0.0
        row["home_elo_momentum_5"] = 0.0
        row["away_elo_momentum_5"] = 0.0
        row["diff_elo_momentum_5"] = 0.0
        return pd.DataFrame([row])[feature_cols]

    # Compute current dynamic Elo and rating history up to match date
    _, _, _, _, current_ratings, rating_histories = compute_dynamic_elo(history)
    h_elo = current_ratings.get(home_team, BASE_ELO.get(home_team, 1420.0))
    a_elo = current_ratings.get(away_team, BASE_ELO.get(away_team, 1420.0))

    h_hist = rating_histories.get(home_team, [])
    a_hist = rating_histories.get(away_team, [])
    h_m3 = (h_elo - h_hist[-3]) if len(h_hist) >= 3 else (h_elo - BASE_ELO.get(home_team, 1420.0))
    a_m3 = (a_elo - a_hist[-3]) if len(a_hist) >= 3 else (a_elo - BASE_ELO.get(away_team, 1420.0))
    h_m5 = (h_elo - h_hist[-5]) if len(h_hist) >= 5 else (h_elo - BASE_ELO.get(home_team, 1420.0))
    a_m5 = (a_elo - a_hist[-5]) if len(a_hist) >= 5 else (a_elo - BASE_ELO.get(away_team, 1420.0))

    # Convert to team perspective
    team_df = transform_matches_to_team_perspective(history)

    def extract_latest_team_stats(team_name: str, is_home: int) -> Dict[str, float]:
        sub = team_df[team_df["team"] == team_name]
        stats: Dict[str, float] = {}

        p_info = CLUB_POWER_INDEX.get(team_name, {
            "gf_baseline": 1.10,
            "ga_baseline": 1.65,
            "points_baseline": 1.0,
            "shots_baseline": 11.0,
            "target_baseline": 3.5,
            "poss_baseline": 45.0,
        })

        if sub.empty:
            stats["rest_days"] = 7.0
            for w in WINDOWS:
                stats[f"roll_goals_for_{w}"] = p_info["gf_baseline"]
                stats[f"roll_goals_against_{w}"] = p_info["ga_baseline"]
                stats[f"roll_goal_diff_{w}"] = p_info["gf_baseline"] - p_info["ga_baseline"]
                stats[f"roll_shots_for_{w}"] = p_info["shots_baseline"]
                stats[f"roll_shots_target_for_{w}"] = p_info["target_baseline"]
                stats[f"roll_possession_{w}"] = p_info["poss_baseline"]
                stats[f"roll_points_{w}"] = p_info["points_baseline"]
            stats["venue_roll_goals_for_5"] = p_info["gf_baseline"]
            stats["venue_roll_goals_against_5"] = p_info["ga_baseline"]
            stats["venue_roll_points_5"] = p_info["points_baseline"]
            return stats

        last_date = sub["date"].max()
        rest = (match_date - last_date).total_seconds() / (24 * 3600)
        stats["rest_days"] = float(np.clip(rest, 1.0, 30.0))

        # Bayesian shrinkage for small sample sizes (N < 8 matches)
        k = len(sub)
        prior_w = max(0.0, (8.0 - k) / 8.0)
        obs_w = 1.0 - prior_w

        # Rolling overall
        for w in WINDOWS:
            recent_w = sub.tail(w)
            obs_gf = float(recent_w["goals_for"].mean())
            obs_ga = float(recent_w["goals_against"].mean())
            obs_pts = float(recent_w["points"].mean())
            obs_shots = float(recent_w["shots_for"].mean())
            obs_tgt = float(recent_w["shots_target_for"].mean())
            obs_poss = float(recent_w["possession"].mean())

            gf_shrunk = prior_w * p_info["gf_baseline"] + obs_w * obs_gf
            ga_shrunk = prior_w * p_info["ga_baseline"] + obs_w * obs_ga
            pts_shrunk = prior_w * p_info["points_baseline"] + obs_w * obs_pts
            shots_shrunk = prior_w * p_info["shots_baseline"] + obs_w * obs_shots
            tgt_shrunk = prior_w * p_info["target_baseline"] + obs_w * obs_tgt
            poss_shrunk = prior_w * p_info["poss_baseline"] + obs_w * obs_poss

            stats[f"roll_goals_for_{w}"] = gf_shrunk
            stats[f"roll_goals_against_{w}"] = ga_shrunk
            stats[f"roll_goal_diff_{w}"] = gf_shrunk - ga_shrunk
            stats[f"roll_shots_for_{w}"] = shots_shrunk
            stats[f"roll_shots_target_for_{w}"] = tgt_shrunk
            stats[f"roll_possession_{w}"] = poss_shrunk
            stats[f"roll_points_{w}"] = pts_shrunk

        # Venue specific
        venue_sub = sub[sub["is_home"] == is_home].tail(5)
        if not venue_sub.empty:
            v_k = len(venue_sub)
            v_prior_w = max(0.0, (5.0 - v_k) / 5.0)
            v_obs_w = 1.0 - v_prior_w
            stats["venue_roll_goals_for_5"] = float(v_prior_w * p_info["gf_baseline"] + v_obs_w * venue_sub["goals_for"].mean())
            stats["venue_roll_goals_against_5"] = float(v_prior_w * p_info["ga_baseline"] + v_obs_w * venue_sub["goals_against"].mean())
            stats["venue_roll_points_5"] = float(v_prior_w * p_info["points_baseline"] + v_obs_w * venue_sub["points"].mean())
        else:
            stats["venue_roll_goals_for_5"] = stats["roll_goals_for_5"]
            stats["venue_roll_goals_against_5"] = stats["roll_goals_against_5"]
            stats["venue_roll_points_5"] = stats["roll_points_5"]

        return stats

    h_stats = extract_latest_team_stats(home_team, is_home=1)
    a_stats = extract_latest_team_stats(away_team, is_home=0)

    feature_dict: Dict[str, float] = {}

    # Elo and momentum features
    feature_dict["home_elo"] = h_elo
    feature_dict["away_elo"] = a_elo
    feature_dict["elo_diff"] = (h_elo + 65.0) - a_elo
    feature_dict["home_elo_momentum_3"] = round(h_m3, 2)
    feature_dict["away_elo_momentum_3"] = round(a_m3, 2)
    feature_dict["diff_elo_momentum_3"] = round(h_m3 - a_m3, 2)
    feature_dict["home_elo_momentum_5"] = round(h_m5, 2)
    feature_dict["away_elo_momentum_5"] = round(a_m5, 2)
    feature_dict["diff_elo_momentum_5"] = round(h_m5 - a_m5, 2)

    for k, v in h_stats.items():
        feature_dict[f"home_{k}"] = v
    for k, v in a_stats.items():
        feature_dict[f"away_{k}"] = v

    # Differentials
    for w in WINDOWS:
        feature_dict[f"diff_roll_goals_for_{w}"] = feature_dict[f"home_roll_goals_for_{w}"] - feature_dict[f"away_roll_goals_for_{w}"]
        feature_dict[f"diff_roll_goals_against_{w}"] = feature_dict[f"home_roll_goals_against_{w}"] - feature_dict[f"away_roll_goals_against_{w}"]
        feature_dict[f"diff_roll_points_{w}"] = feature_dict[f"home_roll_points_{w}"] - feature_dict[f"away_roll_points_{w}"]
        feature_dict[f"diff_roll_shots_target_{w}"] = feature_dict[f"home_roll_shots_target_for_{w}"] - feature_dict[f"away_roll_shots_target_for_{w}"]
        feature_dict[f"diff_roll_possession_{w}"] = feature_dict[f"home_roll_possession_{w}"] - feature_dict[f"away_roll_possession_{w}"]
    feature_dict["diff_rest_days"] = feature_dict["home_rest_days"] - feature_dict["away_rest_days"]

    # H2H
    h2h_sub = history[
        ((history["home_team"] == home_team) & (history["away_team"] == away_team))
        | ((history["home_team"] == away_team) & (history["away_team"] == home_team))
    ].tail(5)

    if not h2h_sub.empty:
        h_wins = 0
        gd_sum = 0
        for _, m in h2h_sub.iterrows():
            if m["home_team"] == home_team:
                gd = m["home_goals"] - m["away_goals"]
                if gd > 0:
                    h_wins += 1
            else:
                gd = m["away_goals"] - m["home_goals"]
                if gd > 0:
                    h_wins += 1
            gd_sum += gd
        feature_dict["h2h_home_win_rate"] = h_wins / len(h2h_sub)
        feature_dict["h2h_goal_diff"] = gd_sum / len(h2h_sub)
        feature_dict["h2h_matches_count"] = len(h2h_sub)
    else:
        feature_dict["h2h_home_win_rate"] = 0.33
        feature_dict["h2h_goal_diff"] = 0.0
        feature_dict["h2h_matches_count"] = 0

    return pd.DataFrame([feature_dict])[feature_cols]
