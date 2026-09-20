"""Central configuration loader (config.yaml + environment overrides).

Precedence: environment variables > config.yaml > hardcoded defaults.
The loader never raises if ``config.yaml`` or ``pyyaml`` is missing — it
falls back to defaults so offline/test environments keep working.
"""

from __future__ import annotations

import os
from functools import lru_cache
from typing import Any, Dict, List

try:
    import yaml  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    yaml = None  # type: ignore

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_PATH = os.path.join(BASE_DIR, "config.yaml")

_DEFAULTS: Dict[str, Any] = {
    "data": {
        "seasons": ["1819", "1920", "2021", "2122", "2223", "2324", "2425", "2526"],
        "historical_url_template": (
            "https://raw.githubusercontent.com/datasets/football-datasets"
            "/master/datasets/premier-league/season-{}.csv"
        ),
        "fixture_url": (
            "https://raw.githubusercontent.com/openfootball/england"
            "/master/2026-27/1-premierleague.txt"
        ),
        "openfootball": {
            "base_url": "https://raw.githubusercontent.com/openfootball/england/master",
            "seasons": [
                "2015-16", "2016-17", "2017-18", "2018-19", "2019-20",
                "2020-21", "2021-22", "2022-23", "2023-24", "2024-25", "2025-26"
            ],
            "competitions": ["premierleague", "facup", "eflcup"],
            "include_cups_in_context": True,
        },
    },
    "pipeline": {"split_date": "2024-01-01"},
    "model": {
        "home_advantage": 65.0,
        "blend_classifier": 0.6,
        "blend_poisson": 0.0,
        "blend_supremacy": 0.4,
        "calibration_grid_min": 1.0,
        "calibration_grid_max": 3.0,
        "calibration_grid_step": 0.05,
        "draw_rule": {
            "market_margin": 0.12,
            "market_min_prob": 0.24,
            "no_market_margin": 0.12,
            "no_market_min_prob": 0.25,
        },
        "odds_mask_rate": 0.15,
        "recency_half_life_days": 365,
    },
}


def _load_file() -> Dict[str, Any]:
    if yaml is None or not os.path.exists(CONFIG_PATH):
        return {}
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


@lru_cache(maxsize=1)
def get_config() -> Dict[str, Any]:
    """Returns the merged configuration dict (cached)."""
    file_cfg = _load_file()
    cfg: Dict[str, Any] = {
        section: dict(_DEFAULTS.get(section, {})) | dict(file_cfg.get(section, {}))
        for section in _DEFAULTS
    }

    # Environment overrides.
    seasons = os.environ.get("EPL_SEASONS")
    if seasons:
        cfg["data"]["seasons"] = [s.strip() for s in seasons.split(",") if s.strip()]
    fixture_url = os.environ.get("EPL_FIXTURE_URL")
    if fixture_url:
        cfg["data"]["fixture_url"] = fixture_url
    fixture_season = os.environ.get("EPL_FIXTURE_SEASON")
    if fixture_season:
        cfg["data"]["fixture_season"] = fixture_season
    split_date = os.environ.get("EPL_SPLIT_DATE")
    if split_date:
        cfg["pipeline"]["split_date"] = split_date
    of_base = os.environ.get("OPENFOOTBALL_BASE_URL")
    if of_base:
        cfg["data"]["openfootball"]["base_url"] = of_base
    of_seasons = os.environ.get("OPENFOOTBALL_SEASONS")
    if of_seasons:
        cfg["data"]["openfootball"]["seasons"] = [s.strip() for s in of_seasons.split(",") if s.strip()]
    of_competitions = os.environ.get("OPENFOOTBALL_COMPETITIONS")
    if of_competitions:
        cfg["data"]["openfootball"]["competitions"] = [c.strip() for c in of_competitions.split(",") if c.strip()]
    return cfg


def get_seasons() -> List[str]:
    return list(get_config()["data"]["seasons"])


def get_openfootball_config() -> Dict[str, Any]:
    return dict(get_config()["data"].get("openfootball", {}))


def get_openfootball_seasons() -> List[str]:
    return list(get_openfootball_config().get("seasons", []))


def get_openfootball_competitions() -> List[str]:
    return list(get_openfootball_config().get("competitions", []))


def get_split_date() -> str:
    return str(get_config()["pipeline"]["split_date"])


def reload_config() -> Dict[str, Any]:
    """Clears the cache (useful in tests) and reloads."""
    get_config.cache_clear()
    return get_config()
