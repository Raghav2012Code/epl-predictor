"""Input validation and model-compatibility gates for serving paths.

All user-facing entry points (CLI, API) must validate through here so bad
input produces actionable errors instead of tracebacks.
"""

from __future__ import annotations

import difflib
from typing import List

from src.data_loader import TEAM_ALIASES
from src.feature_engineering import BASE_ELO, get_feature_column_names
from src.logging_config import get_logger

logger = get_logger(__name__)

CANONICAL_TEAMS: List[str] = sorted(set(TEAM_ALIASES.values()) | set(BASE_ELO.keys()))


def validate_gameweek(value: int) -> int:
    """Validates a gameweek number is within 1-38."""
    try:
        gw = int(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"Gameweek must be an integer 1-38, got {value!r}.") from exc
    if not 1 <= gw <= 38:
        raise ValueError(f"Gameweek must be between 1 and 38, got {gw}.")
    return gw


def canonical_team(name: str) -> str:
    """Standardizes a club name, raising with a suggestion when unknown."""
    from src.data_loader import standardize_team_name

    std = standardize_team_name(name)
    if std in CANONICAL_TEAMS:
        return std
    hint = difflib.get_close_matches(std, CANONICAL_TEAMS, n=1, cutoff=0.6)
    suggestion = f" Did you mean '{hint[0]}'?" if hint else ""
    raise ValueError(
        f"Unknown club '{name}' (parsed as '{std}')."
        f" Known clubs include: {', '.join(CANONICAL_TEAMS[:8])}, ...{suggestion}"
    )


def assert_model_compatible(model, *, strict: bool = True) -> bool:
    """Checks a loaded checkpoint's feature set matches current code.

    Returns True when compatible. In strict mode raises RuntimeError with a
    retrain hint; otherwise logs a warning and returns False.
    """
    expected = set(get_feature_column_names())
    loaded = set(getattr(model, "feature_names", []) or [])
    if loaded == expected:
        return True
    missing = sorted(expected - loaded)[:5]
    extra = sorted(loaded - expected)[:5]
    msg = (
        f"Model checkpoint feature drift: {len(loaded)} vs {len(expected)} expected. "
        f"Missing: {missing}, Extra: {extra}. Retrain with `python run_pipeline.py` "
        "or `predict.py --retrain`."
    )
    if strict:
        raise RuntimeError(msg)
    logger.warning(msg)
    return False
