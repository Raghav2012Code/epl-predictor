"""Data loading and normalization module for Premier League matches and fixtures.

Loads historical match data from public repositories and parses upcoming
fixtures for the 2026/2027 season from openfootball/england.
"""

from __future__ import annotations

import os
import re
import urllib.request
from datetime import datetime
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

from src.logging_config import get_logger

logger = get_logger(__name__)

RAW_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "raw")

# Standardized club name canonical mapping
TEAM_ALIASES: Dict[str, str] = {
    # Arsenal
    "arsenal": "Arsenal",
    "arsenal fc": "Arsenal",
    # Aston Villa
    "aston villa": "Aston Villa",
    "aston villa fc": "Aston Villa",
    # Bournemouth
    "afc bournemouth": "Bournemouth",
    "bournemouth": "Bournemouth",
    # Brentford
    "brentford": "Brentford",
    "brentford fc": "Brentford",
    # Brighton
    "brighton": "Brighton",
    "brighton & hove albion": "Brighton",
    "brighton & hove albion fc": "Brighton",
    "brighton and hove albion": "Brighton",
    # Burnley
    "burnley": "Burnley",
    "burnley fc": "Burnley",
    # Chelsea
    "chelsea": "Chelsea",
    "chelsea fc": "Chelsea",
    # Crystal Palace
    "crystal palace": "Crystal Palace",
    "crystal palace fc": "Crystal Palace",
    # Everton
    "everton": "Everton",
    "everton fc": "Everton",
    # Fulham
    "fulham": "Fulham",
    "fulham fc": "Fulham",
    # Ipswich Town
    "ipswich": "Ipswich",
    "ipswich town": "Ipswich",
    "ipswich town fc": "Ipswich",
    # Leeds United
    "leeds": "Leeds",
    "leeds united": "Leeds",
    "leeds united fc": "Leeds",
    # Leicester City
    "leicester": "Leicester",
    "leicester city": "Leicester",
    "leicester city fc": "Leicester",
    # Liverpool
    "liverpool": "Liverpool",
    "liverpool fc": "Liverpool",
    # Luton Town
    "luton": "Luton",
    "luton town": "Luton",
    "luton town fc": "Luton",
    # Manchester City
    "man city": "Manchester City",
    "manchester city": "Manchester City",
    "manchester city fc": "Manchester City",
    # Manchester United
    "man united": "Manchester United",
    "manchester united": "Manchester United",
    "manchester united fc": "Manchester United",
    # Newcastle United
    "newcastle": "Newcastle",
    "newcastle united": "Newcastle",
    "newcastle united fc": "Newcastle",
    # Nottingham Forest
    "nott'm forest": "Nottingham Forest",
    "nottingham forest": "Nottingham Forest",
    "nottingham forest fc": "Nottingham Forest",
    # Sheffield United
    "sheffield united": "Sheffield United",
    "sheffield united fc": "Sheffield United",
    "sheffield utd": "Sheffield United",
    # Southampton
    "southampton": "Southampton",
    "southampton fc": "Southampton",
    # Tottenham Hotspur
    "spurs": "Tottenham",
    "tottenham": "Tottenham",
    "tottenham hotspur": "Tottenham",
    "tottenham hotspur fc": "Tottenham",
    # West Ham United
    "west ham": "West Ham",
    "west ham united": "West Ham",
    "west ham united fc": "West Ham",
    # Wolverhampton Wanderers
    "wolves": "Wolves",
    "wolverhampton": "Wolves",
    "wolverhampton wanderers": "Wolves",
    "wolverhampton wanderers fc": "Wolves",
    # Coventry City
    "coventry": "Coventry",
    "coventry city": "Coventry",
    "coventry city fc": "Coventry",
    # Sunderland
    "sunderland": "Sunderland",
    "sunderland afc": "Sunderland",
    # Hull City
    "hull": "Hull",
    "hull city": "Hull",
    "hull city afc": "Hull",
    # Norwich City
    "norwich": "Norwich",
    "norwich city": "Norwich",
    "norwich city fc": "Norwich",
    # Watford
    "watford": "Watford",
    "watford fc": "Watford",
    # West Bromwich Albion
    "west brom": "West Brom",
    "west bromwich albion": "West Brom",
    "west bromwich albion fc": "West Brom",
}


def standardize_team_name(name: str) -> str:
    """Standardizes team names to a consistent canonical format."""
    clean = re.sub(r"\s+", " ", name.strip().lower())
    return TEAM_ALIASES.get(clean, name.strip())


def download_file(url: str, local_path: str, force_download: bool = False) -> str:
    """Downloads a file if not already cached locally."""
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    if os.path.exists(local_path) and not force_download:
        return local_path

    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"},
    )
    with urllib.request.urlopen(req, timeout=30) as response, open(
        local_path, "wb"
    ) as out_file:
        out_file.write(response.read())
    return local_path


def parse_openfootball_fixtures(
    file_path_or_url: str,
    season: str = "2026-27",
    is_url: bool = False,
) -> pd.DataFrame:
    """Parses openfootball fixture schedule file (e.g. 2026-27/1-premierleague.txt).

    Returns a DataFrame with columns:
    [season, gameweek, date, time, home_team, away_team, status, home_goals, away_goals]
    """
    if is_url:
        local_cache = os.path.join(RAW_DATA_DIR, f"openfootball_{season}.txt")
        download_file(file_path_or_url, local_cache)
        content_path = local_cache
    else:
        content_path = file_path_or_url

    with open(content_path, "r", encoding="utf-8", errors="ignore") as f:
        text = f.read()

    lines = text.splitlines()
    matches: List[Dict] = []

    current_matchday = 1
    current_date_str = ""
    season_start_year = int(season.split("-")[0])

    # Date regex like: Fri Aug 21 2026 or Sat Aug 22 or Mon Jan 4
    date_regex = re.compile(
        r"^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+([A-Za-z]{3})\s+(\d{1,2})(?:\s+(\d{4}))?",
        re.IGNORECASE,
    )
    matchday_regex = re.compile(r"Matchday\s+(\d+)", re.IGNORECASE)

    # Patterns for match lines:
    # 1. 20:00  Arsenal FC  v Coventry City FC  3-0 (2-0)
    # 2. 12:30  Everton FC  v Chelsea FC
    # 3. Everton FC  v Crystal Palace FC  2-0 (1-0)
    # 4. Burnley FC  0-3 (0-2)  Manchester City FC
    match_v_score_regex = re.compile(
        r"^(?:(\d{1,2}:\d{2})\s+)?(.+?)\s+v\s+(.+?)(?:\s+(\d+)[\-–](\d+)(?:\s+\(\d+[\-–]\d+\))?)?$",
        re.IGNORECASE,
    )
    match_score_middle_regex = re.compile(
        r"^(?:(\d{1,2}:\d{2})\s+)?(.+?)\s+(\d+)[\-–](\d+)(?:\s+\(\d+[\-–]\d+\))?\s+(.+?)$",
        re.IGNORECASE,
    )

    for raw_line in lines:
        line = raw_line.strip()
        if not line or line.startswith("=") or line.startswith("#"):
            continue

        # Check matchday
        m_day = matchday_regex.search(line)
        if m_day:
            current_matchday = int(m_day.group(1))
            continue

        # Check date
        m_date = date_regex.match(line)
        if m_date:
            month_str, day_str, year_str = m_date.group(1), m_date.group(2), m_date.group(3)
            if not year_str:
                # Infer year: Aug-Dec -> start_year, Jan-Jul -> start_year + 1
                month_num = datetime.strptime(month_str, "%b").month
                year_val = season_start_year if month_num >= 7 else (season_start_year + 1)
            else:
                year_val = int(year_str)
            current_date_str = f"{year_val:04d}-{datetime.strptime(month_str, '%b').month:02d}-{int(day_str):02d}"
            continue

        # Check match with " v "
        m_v = match_v_score_regex.match(line)
        if m_v:
            # Missing kickoff times are unknown, not 15:00. Use empty string
            # so downstream consumers don't mistake a default for a real time.
            time_val = m_v.group(1) or ""
            team1_raw = m_v.group(2).strip()
            team2_raw = m_v.group(3).strip()
            hg = m_v.group(4)
            ag = m_v.group(5)

            # Avoid headers captured erroneously
            if "Matchday" in team1_raw or "League" in team1_raw:
                continue

            # Guard against matches appearing before any date header.
            if not current_date_str:
                continue

            home_team = standardize_team_name(team1_raw)
            away_team = standardize_team_name(team2_raw)

            status = "played" if (hg is not None and ag is not None) else "upcoming"
            matches.append(
                {
                    "season": season,
                    "gameweek": current_matchday,
                    "date": current_date_str,
                    "time": time_val,
                    "home_team": home_team,
                    "away_team": away_team,
                    "status": status,
                    "home_goals": int(hg) if hg is not None else np.nan,
                    "away_goals": int(ag) if ag is not None else np.nan,
                }
            )
            continue

        # Check match with score in middle (Burnley FC 0-3 (0-2) Manchester City FC)
        m_mid = match_score_middle_regex.match(line)
        if m_mid:
            if not current_date_str:
                continue
            time_val = m_mid.group(1) or ""
            team1_raw = m_mid.group(2).strip()
            hg = m_mid.group(3)
            ag = m_mid.group(4)
            team2_raw = m_mid.group(5).strip()

            home_team = standardize_team_name(team1_raw)
            away_team = standardize_team_name(team2_raw)

            matches.append(
                {
                    "season": season,
                    "gameweek": current_matchday,
                    "date": current_date_str,
                    "time": time_val,
                    "home_team": home_team,
                    "away_team": away_team,
                    "status": "played",
                    "home_goals": int(hg),
                    "away_goals": int(ag),
                }
            )

    df = pd.DataFrame(matches)
    if not df.empty and "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values(by=["date", "gameweek"]).reset_index(drop=True)
    return df


def load_historical_stats(
    seasons: Optional[List[str]] = None,
    force_download: bool = False,
) -> pd.DataFrame:
    """Downloads and merges historical Premier League match statistics.

    Includes full results, goals, shots, shots on target, corners, and possession.
    """
    from src.config import get_config

    cfg = get_config()["data"]
    if seasons is None:
        seasons = list(cfg["seasons"])

    all_dfs: List[pd.DataFrame] = []
    skipped: List[str] = []
    base_url = str(cfg["historical_url_template"])

    def _num_col(frame: pd.DataFrame, key: str, default: float) -> pd.Series:
        # DataFrame.get(key, scalar) + pd.to_numeric(scalar) loses Series
        # semantics; always coerce via a Series so missing columns fall back
        # to a constant instead of raising AttributeError on .fillna.
        if key in frame.columns:
            return pd.to_numeric(frame[key], errors="coerce").fillna(default)
        return pd.Series(default, index=frame.index, dtype=float)

    for s_code in seasons:
        url = base_url.format(s_code)
        local_path = os.path.join(RAW_DATA_DIR, f"season_{s_code}.csv")
        try:
            download_file(url, local_path, force_download=force_download)
            df = pd.read_csv(local_path)
        except Exception as exc:
            # Never fail silently: record which seasons were skipped so the
            # caller/UI can report reduced training size instead of claiming 2280.
            skipped.append(f"{s_code} ({type(exc).__name__})")
            continue

        if df.empty or "HomeTeam" not in df.columns or "AwayTeam" not in df.columns:
            skipped.append(f"{s_code} (missing team columns)")
            continue

        # Format standardized season label (e.g. 2023-24)
        if len(s_code) == 4:
            s_label = f"20{s_code[:2]}-20{s_code[2:]}" if int(s_code[:2]) > 50 else f"20{s_code[:2]}-{s_code[2:]}"
        else:
            s_label = s_code

        df["season"] = s_label
        df["home_team"] = df["HomeTeam"].apply(standardize_team_name)
        df["away_team"] = df["AwayTeam"].apply(standardize_team_name)
        df["date"] = pd.to_datetime(df["Date"], errors="coerce")

        # Goals
        df["home_goals"] = pd.to_numeric(df.get("FTHG"), errors="coerce")
        df["away_goals"] = pd.to_numeric(df.get("FTAG"), errors="coerce")

        # Result: 'H', 'D', 'A'
        if "FTR" in df.columns:
            df["result"] = df["FTR"]
        else:
            df["result"] = np.where(
                df["home_goals"] > df["away_goals"],
                "H",
                np.where(df["home_goals"] < df["away_goals"], "A", "D"),
            )

        # In-match statistics: Shots and Shots on Target (missing-column safe)
        df["home_shots"] = _num_col(df, "HS", 12.0)
        df["away_shots"] = _num_col(df, "AS", 10.0)
        df["home_shots_target"] = _num_col(df, "HST", 4.0)
        df["away_shots_target"] = _num_col(df, "AST", 3.0)

        # Corners (missing-column safe)
        df["home_corners"] = _num_col(df, "HC", 5.0)
        df["away_corners"] = _num_col(df, "AC", 4.0)

        # Possession proxy:
        # Datasets do not ship possession; derive it from shot & corner share.
        # Callers must treat this as synthetic, not measured possession.
        total_shots = df["home_shots"] + df["away_shots"]
        shot_ratio = np.where(total_shots > 0, df["home_shots"] / total_shots, 0.5)

        total_corners = df["home_corners"] + df["away_corners"]
        corner_ratio = np.where(total_corners > 0, df["home_corners"] / total_corners, 0.5)

        # Synthetic/Derived possession bounded [28%, 72%]
        computed_poss = (0.55 * shot_ratio + 0.45 * corner_ratio) * 100
        df["home_possession"] = np.clip(np.round(computed_poss, 1), 28.0, 72.0)
        df["away_possession"] = np.round(100.0 - df["home_possession"], 1)

        keep_cols = [
            "season",
            "date",
            "home_team",
            "away_team",
            "home_goals",
            "away_goals",
            "result",
            "home_shots",
            "away_shots",
            "home_shots_target",
            "away_shots_target",
            "home_corners",
            "away_corners",
            "home_possession",
            "away_possession",
        ]
        all_dfs.append(df[keep_cols].dropna(subset=["home_goals", "away_goals", "date"]))

    if not all_dfs:
        if skipped:
            logger.warning("No historical seasons loaded. Skipped: %s", ", ".join(skipped))
        return pd.DataFrame()

    if skipped:
        logger.warning("Partial historical load. Skipped seasons: %s", ", ".join(skipped))

    full_df = pd.concat(all_dfs, ignore_index=True)
    full_df = full_df.sort_values(by="date").reset_index(drop=True)
    return full_df


def load_2026_2027_fixtures() -> pd.DataFrame:
    """Loads and parses the 2026/2027 Premier League schedule from openfootball/england."""
    from src.config import get_config

    cfg = get_config()["data"]
    url = str(cfg["fixture_url"])
    season = str(cfg["fixture_season"])
    return parse_openfootball_fixtures(url, season=season, is_url=True)
