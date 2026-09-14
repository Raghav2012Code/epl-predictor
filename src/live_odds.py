"""Live pre-match odds via The Odds API (https://theoddsapi.com).

Design notes:
- The API key NEVER lives in code or config files: it is read from the
  ``EPL_ODDS_API_KEY`` environment variable only.
- Every failure mode (no key, no network, 401/429/5xx, empty slate)
  returns None with a logged warning. The pipeline treats None as "no
  live market" and falls back to historical-closing priors, so forecasts
  always work offline.
- Successful responses are cached under ``data/raw/odds/live/`` so a
  quota is spent at most once per polling window and reruns are free.
- Only pre-kickoff h2h prices are consumed; the parser keeps no scores,
  so live odds cannot leak outcomes either.
"""

from __future__ import annotations

import json
import os
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

from src.data_loader import RAW_DATA_DIR, standardize_team_name
from src.logging_config import get_logger
from src.odds_loader import implied_probabilities

logger = get_logger(__name__)

API_KEY_ENV = "EPL_ODDS_API_KEY"
API_BASE = "https://api.theoddsapi.com/v4/sports/soccer_epl/odds"
LIVE_CACHE_DIR = os.path.join(RAW_DATA_DIR, "odds", "live")

DEFAULT_REGIONS = "uk"
DEFAULT_MARKETS = "h2h"


def get_api_key() -> Optional[str]:
    """Returns the API key from the environment, or None when absent."""
    key = os.environ.get(API_KEY_ENV, "").strip()
    return key or None


def _live_cache_path() -> str:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    return os.path.join(LIVE_CACHE_DIR, f"epl_h2h_{stamp}.json")


def fetch_live_odds(
    api_key: Optional[str] = None,
    regions: str = DEFAULT_REGIONS,
    markets: str = DEFAULT_MARKETS,
    timeout: int = 30,
) -> Optional[List[Dict[str, Any]]]:
    """Fetches the upcoming EPL h2h board; None when unavailable.

    Never raises for transport/API failures: logs a warning and returns
    None so callers degrade to historical priors.
    """
    key = api_key or get_api_key()
    if not key:
        logger.warning(
            "Live odds unavailable: set the %s environment variable. "
            "Falling back to historical-closing priors.",
            API_KEY_ENV,
        )
        return None
    params = urllib.parse.urlencode({
        "apiKey": key,
        "regions": regions,
        "markets": markets,
        "oddsFormat": "decimal",
        "dateFormat": "iso",
    })
    url = f"{API_BASE}?{params}"
    try:
        req = urllib.request.Request(
            url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        )
        with urllib.request.urlopen(req, timeout=timeout) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        logger.warning("Live odds fetch failed (%s); using historical priors.", exc)
        return None
    if not isinstance(payload, list):
        logger.warning("Live odds returned an unexpected body; using historical priors.")
        return None
    try:
        os.makedirs(LIVE_CACHE_DIR, exist_ok=True)
        with open(_live_cache_path(), "w", encoding="utf-8") as f:
            json.dump(payload, f)
    except Exception as exc:
        logger.warning("Could not cache live odds response: %s", exc)
    logger.info("Live odds: %d upcoming EPL events.", len(payload))
    return payload


def _consensus_h2h(bookmakers: List[Dict[str, Any]]) -> Optional[Tuple[float, float, float]]:
    """Averages decimal h2h prices across bookmakers (robust to one stale book)."""
    homes: List[float] = []
    draws: List[float] = []
    aways: List[float] = []
    for book in bookmakers or []:
        for market in book.get("markets", []) or []:
            if market.get("key") != "h2h":
                continue
            prices = {o.get("name"): o.get("price") for o in market.get("outcomes", []) or []}
            try:
                homes.append(float(prices["Home"]))
                draws.append(float(prices["Draw"]))
                aways.append(float(prices["Away"]))
            except (TypeError, ValueError, KeyError):
                continue
    if not homes:
        return None
    return (float(np.mean(homes)), float(np.mean(draws)), float(np.mean(aways)))


def parse_live_odds(events: List[Dict[str, Any]]) -> pd.DataFrame:
    """Parses a live board into the canonical odds frame shape.

    Consensus (mean) decimal prices per event become overround-stripped
    implied probabilities with source ``live:consensus``. Movement is NaN
    (no opening snapshot on the live board).
    """
    rows: List[Dict[str, Any]] = []
    for event in events or []:
        try:
            home = standardize_team_name(event["home_team"])
            away = standardize_team_name(event["away_team"])
            day = pd.to_datetime(event["commence_time"]).tz_convert(None).normalize()
        except (KeyError, TypeError, ValueError):
            continue
        triple = _consensus_h2h(event.get("bookmakers", []))
        if triple is None:
            continue
        p_h, p_d, p_a, overround = implied_probabilities(*triple)
        if any(float(v) != float(v) for v in (p_h, p_d, p_a)):
            continue
        rows.append({
            "date": day,
            "home_team": home,
            "away_team": away,
            "season": "live",
            "odds_implied_home": p_h,
            "odds_implied_draw": p_d,
            "odds_implied_away": p_a,
            "odds_overround": overround,
            "odds_source": "live:consensus",
            "odds_move_home": np.nan,
        })
    frame = pd.DataFrame(rows, columns=[
        "date", "home_team", "away_team", "season",
        "odds_implied_home", "odds_implied_draw", "odds_implied_away",
        "odds_overround", "odds_source", "odds_move_home",
    ])
    return frame.sort_values(by=["date", "home_team", "away_team"]).reset_index(drop=True)


def lookup_live_odds(
    live_df: pd.DataFrame,
    home_team: str,
    away_team: str,
    match_date: datetime,
    window_days: int = 9,
) -> Optional[Dict[str, float]]:
    """Finds live odds for a fixture by teams + nearest kickoff in window.

    Fixture dates shift after publication, so the match is on (teams,
    closest event within ``window_days``), not exact date equality.
    """
    if live_df is None or live_df.empty:
        return None
    home = standardize_team_name(home_team)
    away = standardize_team_name(away_team)
    target = pd.to_datetime(match_date).normalize()
    cands = live_df[(live_df["home_team"] == home) & (live_df["away_team"] == away)].copy()
    if cands.empty:
        return None
    cands["date"] = pd.to_datetime(cands["date"]).dt.normalize()
    cands["gap"] = (cands["date"] - target).abs()
    cands = cands[cands["gap"] <= pd.to_timedelta(window_days, unit="D")]
    if cands.empty:
        return None
    row = cands.sort_values(by="gap").iloc[0]
    move = row["odds_move_home"]
    return {
        "odds_implied_home": float(row["odds_implied_home"]),
        "odds_implied_draw": float(row["odds_implied_draw"]),
        "odds_implied_away": float(row["odds_implied_away"]),
        "odds_overround": float(row["odds_overround"]),
        "odds_move_home": float(move) if float(move) == float(move) else 0.0,
    }
