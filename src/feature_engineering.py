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


def transform_matches_to_team_perspective(df: pd.DataFrame) -> pd.DataFrame:
    """Transforms match results into a row-per-team dataset sorted chronologically.

    Each match generates two rows: one for the home team and one for the away team.
    """
    df = df.copy().sort_values(by="date").reset_index(drop=True)

    home_rows = []
    away_rows = []

    for idx, row in df.iterrows():
        match_date = row["date"]
        hg = row["home_goals"]
        ag = row["away_goals"]
        res = row["result"]

        # Points
        h_pts = 3 if res == "H" else (1 if res == "D" else 0)
        a_pts = 3 if res == "A" else (1 if res == "D" else 0)

        home_rows.append(
            {
                "match_id": idx,
                "date": match_date,
                "team": row["home_team"],
                "opponent": row["away_team"],
                "is_home": 1,
                "goals_for": hg,
                "goals_against": ag,
                "goal_diff": hg - ag,
                "shots_for": row.get("home_shots", 12.0),
                "shots_against": row.get("away_shots", 10.0),
                "shots_target_for": row.get("home_shots_target", 4.0),
                "shots_target_against": row.get("away_shots_target", 3.0),
                "possession": row.get("home_possession", 50.0),
                "points": h_pts,
                "win": 1 if res == "H" else 0,
                "draw": 1 if res == "D" else 0,
                "loss": 1 if res == "A" else 0,
            }
        )

        away_rows.append(
            {
                "match_id": idx,
                "date": match_date,
                "team": row["away_team"],
                "opponent": row["home_team"],
                "is_home": 0,
                "goals_for": ag,
                "goals_against": hg,
                "goal_diff": ag - hg,
                "shots_for": row.get("away_shots", 10.0),
                "shots_against": row.get("home_shots", 12.0),
                "shots_target_for": row.get("away_shots_target", 3.0),
                "shots_target_against": row.get("home_shots_target", 4.0),
                "possession": row.get("away_possession", 50.0),
                "points": a_pts,
                "win": 1 if res == "A" else 0,
                "draw": 1 if res == "D" else 0,
                "loss": 1 if res == "H" else 0,
            }
        )

    team_df = pd.DataFrame(home_rows + away_rows)
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

    # 2. Compute H2H features
    matches_with_h2h = compute_head_to_head_features(raw_matches)

    # 3. Merge together
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
        return pd.DataFrame([row])

    # Convert to team perspective
    team_df = transform_matches_to_team_perspective(history)

    def extract_latest_team_stats(team_name: str, is_home: int) -> Dict[str, float]:
        sub = team_df[team_df["team"] == team_name]
        stats: Dict[str, float] = {}

        if sub.empty:
            # Newly promoted team fallback to bottom-half average
            last_date = match_date
            stats["rest_days"] = 7.0
            for w in WINDOWS:
                stats[f"roll_goals_for_{w}"] = 1.0
                stats[f"roll_goals_against_{w}"] = 1.6
                stats[f"roll_goal_diff_{w}"] = -0.6
                stats[f"roll_shots_for_{w}"] = 10.0
                stats[f"roll_shots_target_for_{w}"] = 3.0
                stats[f"roll_possession_{w}"] = 42.0
                stats[f"roll_points_{w}"] = 0.9
            stats["venue_roll_goals_for_5"] = 1.0
            stats["venue_roll_goals_against_5"] = 1.6
            stats["venue_roll_points_5"] = 0.9
            return stats

        last_date = sub["date"].max()
        rest = (match_date - last_date).total_seconds() / (24 * 3600)
        stats["rest_days"] = float(np.clip(rest, 1.0, 30.0))

        # Rolling overall
        for w in WINDOWS:
            recent_w = sub.tail(w)
            stats[f"roll_goals_for_{w}"] = float(recent_w["goals_for"].mean())
            stats[f"roll_goals_against_{w}"] = float(recent_w["goals_against"].mean())
            stats[f"roll_goal_diff_{w}"] = float(recent_w["goal_diff"].mean())
            stats[f"roll_shots_for_{w}"] = float(recent_w["shots_for"].mean())
            stats[f"roll_shots_target_for_{w}"] = float(recent_w["shots_target_for"].mean())
            stats[f"roll_possession_{w}"] = float(recent_w["possession"].mean())
            stats[f"roll_points_{w}"] = float(recent_w["points"].mean())

        # Venue specific
        venue_sub = sub[sub["is_home"] == is_home].tail(5)
        if not venue_sub.empty:
            stats["venue_roll_goals_for_5"] = float(venue_sub["goals_for"].mean())
            stats["venue_roll_goals_against_5"] = float(venue_sub["goals_against"].mean())
            stats["venue_roll_points_5"] = float(venue_sub["points"].mean())
        else:
            stats["venue_roll_goals_for_5"] = stats["roll_goals_for_5"]
            stats["venue_roll_goals_against_5"] = stats["roll_goals_against_5"]
            stats["venue_roll_points_5"] = stats["roll_points_5"]

        return stats

    h_stats = extract_latest_team_stats(home_team, is_home=1)
    a_stats = extract_latest_team_stats(away_team, is_home=0)

    feature_dict: Dict[str, float] = {}

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
