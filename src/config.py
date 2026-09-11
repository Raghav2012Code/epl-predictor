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
        "seasons": ["2021", "2122", "2223", "2324", "2425", "2526"],
        "historical_url_template": (
            "https://raw.githubusercontent.com/datasets/football-datasets"
            "/master/datasets/premier-league/season-{}.csv"
        ),
        "fixture_url": (
            "https://raw.githubusercontent.com/openfootball/england"
            "/master/2026-27/1-premierleague.txt"
        ),
        "fixture_season": "2026-27",
    },
    "pipeline": {"split_date": "2024-01-01"},
    "model": {
        "home_advantage": 65.0,
        "blend_classifier": 0.60,
        "blend_poisson": 0.40,
        "calibration_grid_min": 0.5,
        "calibration_grid_max": 3.0,
        "calibration_grid_step": 0.05,
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
    return cfg


def get_seasons() -> List[str]:
    return list(get_config()["data"]["seasons"])


def get_split_date() -> str:
    return str(get_config()["pipeline"]["split_date"])


def reload_config() -> Dict[str, Any]:
    """Clears the cache (useful in tests) and reloads."""
    get_config.cache_clear()
    return get_config()
