"""Bookmaker odds ingestion for Premier League matches.

Historical odds come from football-data.co.uk's free EPL CSV archive
(https://www.football-data.co.uk/downloadm.php), which publishes per-season
files with per-bookmaker odds plus market-average aggregates, in both
market-opening and closing sets since 2019/20. Files are cached under
``data/raw/odds/`` and reused across runs (offline-safe).

Leakage rule: only odds known *before kickoff* ever become features.
Closing odds qualify (struck at/before kickoff, before the outcome); match
results (FTHG/FTAG/FTR) are dropped at parse time and can never leak.
Live/upcoming odds are served by ``src/live_odds.py``, not here.
"""

from __future__ import annotations

import os
from datetime import datetime
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

from src.data_loader import RAW_DATA_DIR, download_file, standardize_team_name
from src.logging_config import get_logger

logger = get_logger(__name__)

FOOTBALL_DATA_URL = "https://www.football-data.co.uk/mmz4281/{season}/E0.csv"

# football-data.co.uk season folder codes covering the training window
# (2020/21) through the current season file (2026/27, updated twice weekly).
ODDS_SEASONS: List[str] = ["2021", "2122", "2223", "2324", "2425", "2526", "2627"]

ODDS_CACHE_DIR = os.path.join(RAW_DATA_DIR, "odds")
COMBINED_CACHE = os.path.join(ODDS_CACHE_DIR, "e0_combined.csv")

# Column triples in preference order: market-average closing (most books,
# Pinnacle-degradation-proof) -> market-average opening -> Bet365 snapshot.
CLOSE_TRIPLES: List[Tuple[str, str, str]] = [
    ("AvgCH", "AvgCD", "AvgCA"),
    ("AvgH", "AvgD", "AvgA"),
    ("B365H", "B365D", "B365A"),
]

# Same-book open/close pair for the steam (movement) signal.
MOVE_OPEN_TRIPLE = ("B365H", "B365D", "B365A")
MOVE_CLOSE_TRIPLE = ("B365CH", "B365CD", "B365CA")


def odds_cache_path(season: str) -> str:
    """Returns the local cache path for one season's odds CSV."""
    return os.path.join(ODDS_CACHE_DIR, f"E0_{season}.csv")


def download_season_odds(
    season: str,
    force_download: bool = False,
    offline: bool = False,
) -> str:
    """Downloads (or reuses the cache of) one season's odds CSV.

    With ``offline=True`` only the local cache is used; a missing cache
    raises FileNotFoundError with an actionable message.
    """
    local_path = odds_cache_path(season)
    if offline:
        if not os.path.exists(local_path):
            raise FileNotFoundError(
                f"Offline mode: odds cache missing at {local_path}. "
                f"Re-run once online to download season {season}."
            )
        return local_path
    url = FOOTBALL_DATA_URL.format(season=season)
    return download_file(url, local_path, force_download=force_download)


def implied_probabilities(
    home_odds: float, draw_odds: float, away_odds: float
) -> Tuple[float, float, float, float]:
    """Converts a decimal-odds triple to overround-stripped probabilities.

    Returns (p_home, p_draw, p_away, overround). Any missing or
    non-positive leg yields all-NaN (the caller falls back to neutral).
    """
    try:
        h, d, a = float(home_odds), float(draw_odds), float(away_odds)
    except (TypeError, ValueError):
        return (np.nan, np.nan, np.nan, np.nan)
    if not (h > 0 and d > 0 and a > 0):
        return (np.nan, np.nan, np.nan, np.nan)
    raw = np.array([1.0 / h, 1.0 / d, 1.0 / a])
    overround = float(raw.sum() - 1.0)
    norm = raw / raw.sum()
    return (float(norm[0]), float(norm[1]), float(norm[2]), overround)


def _triple_from_row(row: pd.Series, triple: Tuple[str, str, str]) -> Tuple[float, float, float, float]:
    """Implied probabilities for one column triple; NaNs when unavailable."""
    if all(col in row.index for col in triple):
        return implied_probabilities(row[triple[0]], row[triple[1]], row[triple[2]])
    return (np.nan, np.nan, np.nan, np.nan)


def select_odds_triple(row: pd.Series) -> Tuple[float, float, float, float, str]:
    """Picks the best available odds triple for a match row.

    Preference: average closing -> average opening -> Bet365 snapshot.
    Returns (p_home, p_draw, p_away, overround, source_label).
    """
    labels = ("avg_close", "avg_open", "b365")
    for triple, label in zip(CLOSE_TRIPLES, labels):
        p_h, p_d, p_a, ov = _triple_from_row(row, triple)
        if not any(float(v) != float(v) for v in (p_h, p_d, p_a)):  # no NaN
            return (p_h, p_d, p_a, ov, label)
    return (np.nan, np.nan, np.nan, np.nan, "missing")


def closing_movement(row: pd.Series) -> float:
    """Same-book (Bet365) close-minus-open move in implied home probability.

    Positive means market steam toward the home side. NaN when either leg
    of the pair is unavailable.
    """
    open_p = _triple_from_row(row, MOVE_OPEN_TRIPLE)
    close_p = _triple_from_row(row, MOVE_CLOSE_TRIPLE)
    if any(float(v) != float(v) for v in (open_p[0], close_p[0])):
        return np.nan
    return float(close_p[0] - open_p[0])


def parse_odds_csv(path: str, season: str) -> pd.DataFrame:
    """Parses one cached season CSV into a canonical odds frame.

    Keeps only pre-kickoff-known fields (date/teams/odds); result columns
    (FTHG/FTAG/FTR/HT*) are dropped at parse time so outcomes can never
    leak into features downstream.
    """
    raw = pd.read_csv(path)
    if "Date" not in raw.columns or "HomeTeam" not in raw.columns or "AwayTeam" not in raw.columns:
        raise ValueError(f"Unexpected odds schema in {path}: {list(raw.columns)[:8]}")

    dates = pd.to_datetime(raw["Date"], dayfirst=True, errors="coerce")
    if dates.isna().any():
        bad = int(dates.isna().sum())
        raise ValueError(f"{bad} unparseable dates in {path}")

    selected = [select_odds_triple(row) for _, row in raw.iterrows()]
    moves = [closing_movement(row) for _, row in raw.iterrows()]

    frame = pd.DataFrame(
        {
            "date": dates.dt.normalize(),
            "home_team": raw["HomeTeam"].map(standardize_team_name),
            "away_team": raw["AwayTeam"].map(standardize_team_name),
            "season": season,
            "odds_implied_home": [s[0] for s in selected],
            "odds_implied_draw": [s[1] for s in selected],
            "odds_implied_away": [s[2] for s in selected],
            "odds_overround": [s[3] for s in selected],
            "odds_source": [s[4] for s in selected],
            "odds_move_home": moves,
        }
    )
    return frame.sort_values(by=["date", "home_team", "away_team"]).reset_index(drop=True)


def load_odds_frame(
    seasons: Optional[List[str]] = None,
    force_download: bool = False,
    offline: bool = False,
) -> pd.DataFrame:
    """Loads the combined multi-season odds frame (cached after first build).

    Downloads any missing season files unless ``offline=True``. The combined
    frame is cached at ``data/raw/odds/e0_combined.csv`` and rebuilt when
    missing or forced.
    """
    seasons = seasons or ODDS_SEASONS
    if os.path.exists(COMBINED_CACHE) and not force_download:
        try:
            combined = pd.read_csv(COMBINED_CACHE, parse_dates=["date"])
            seasons_present = set(combined["season"].astype(str))
            if set(seasons) <= seasons_present:
                return combined
        except Exception as exc:
            logger.warning("Odds combined cache unreadable, rebuilding: %s", exc)

    frames: List[pd.DataFrame] = []
    for season in seasons:
        local_path = download_season_odds(season, force_download=force_download, offline=offline)
        frames.append(parse_odds_csv(local_path, season))

    combined = pd.concat(frames, ignore_index=True)
    combined = combined.sort_values(by=["date", "home_team", "away_team"]).reset_index(drop=True)
    os.makedirs(ODDS_CACHE_DIR, exist_ok=True)
    combined.to_csv(COMBINED_CACHE, index=False)
    logger.info("Odds frame: %d matches across %d seasons -> %s", len(combined), len(seasons), COMBINED_CACHE)
    return combined


def lookup_odds(
    odds_df: pd.DataFrame,
    home_team: str,
    away_team: str,
    match_date: datetime,
) -> Optional[Dict[str, float]]:
    """Looks up pre-kickoff odds for one fixture; None when unavailable."""
    if odds_df is None or odds_df.empty:
        return None
    day = pd.to_datetime(match_date).normalize()
    mask = (
        (odds_df["home_team"] == standardize_team_name(home_team))
        & (odds_df["away_team"] == standardize_team_name(away_team))
        & (pd.to_datetime(odds_df["date"]).dt.normalize() == day)
    )
    hits = odds_df[mask]
    if hits.empty:
        return None
    row = hits.iloc[-1]
    return {
        "odds_implied_home": float(row["odds_implied_home"]),
        "odds_implied_draw": float(row["odds_implied_draw"]),
        "odds_implied_away": float(row["odds_implied_away"]),
        "odds_overround": float(row["odds_overround"]),
        "odds_move_home": float(row["odds_move_home"]),
    }
