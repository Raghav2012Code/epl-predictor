"""Input validation and model-compatibility gates for serving paths.

All user-facing entry points (CLI, API) must validate through here so bad
input produces actionable errors instead of tracebacks.

Odds leakage contract: bookmaker odds are legal features ONLY when struck
before kickoff. Closing aggregates qualify (known at kickoff, before the
outcome); match results must never appear in an odds frame. The gates
below enforce both halves mechanically.
"""

from __future__ import annotations

import difflib
from typing import List

import pandas as pd

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


# Result columns that must never appear in an odds frame. Their presence
# proves post-kickoff information entered the feature path.
FORBIDDEN_ODDS_COLUMNS = frozenset({
    "FTHG", "FTAG", "FTR", "HTHG", "HTAG", "HTR",
    "home_goals", "away_goals", "result", "target_outcome",
})

REQUIRED_ODDS_COLUMNS = frozenset({
    "date", "home_team", "away_team",
    "odds_implied_home", "odds_implied_draw", "odds_implied_away",
    "odds_overround", "odds_move_home",
})


def assert_odds_frame_clean(odds_df: pd.DataFrame) -> bool:
    """Enforces the pre-kickoff half of the odds leakage contract.

    Raises ValueError when a result column is present, a required column
    is missing, or any non-missing implied triple fails to sum to 1.
    Returns True when clean.
    """
    if odds_df is None or odds_df.empty:
        raise ValueError("Odds frame is empty; cannot validate leakage contract.")
    leaked = sorted(FORBIDDEN_ODDS_COLUMNS & set(odds_df.columns))
    if leaked:
        raise ValueError(
            f"Odds leakage: post-kickoff columns present {leaked}. "
            "Odds frames must contain only pre-kickoff-known fields."
        )
    missing = sorted(REQUIRED_ODDS_COLUMNS - set(odds_df.columns))
    if missing:
        raise ValueError(f"Odds frame missing required columns: {missing}.")
    triple = odds_df[["odds_implied_home", "odds_implied_draw", "odds_implied_away"]]
    complete = triple.dropna()
    if not complete.empty:
        bad = ((complete.sum(axis=1) - 1.0).abs() > 1e-6).sum()
        if bad:
            raise ValueError(f"Odds leakage gate: {int(bad)} implied triples do not sum to 1.")
    return True


def assert_odds_coverage(
    matches_df: pd.DataFrame,
    odds_df: pd.DataFrame,
    min_coverage: float = 0.95,
) -> float:
    """Enforces the join half of the odds leakage contract.

    Every training row must find pre-kickoff odds on (date, home, away).
    Returns the coverage fraction; raises ValueError below min_coverage
    (signals season drift or team-mapping regressions, not silent NaNs).
    """
    assert_odds_frame_clean(odds_df)
    if matches_df is None or matches_df.empty:
        raise ValueError("Matches frame is empty; cannot measure odds coverage.")
    left = matches_df[["date", "home_team", "away_team"]].copy()
    left["date"] = pd.to_datetime(left["date"]).dt.normalize()
    right = odds_df[["date", "home_team", "away_team"]].copy()
    right["date"] = pd.to_datetime(right["date"]).dt.normalize()
    merged = left.merge(
        right.drop_duplicates(subset=["date", "home_team", "away_team"]),
        on=["date", "home_team", "away_team"],
        how="left",
        indicator=True,
    )
    coverage = float((merged["_merge"] == "both").mean())
    if coverage < min_coverage:
        raise ValueError(
            f"Odds coverage {coverage:.3f} below minimum {min_coverage:.2f}: "
            "check season files and team-name mapping before training."
        )
    return coverage


def assert_model_compatible(model, *, strict: bool = True) -> bool:
    """Checks a loaded checkpoint's feature set matches current code.

    Returns True when compatible. In strict mode raises RuntimeError with a
    retrain hint; otherwise logs a warning and returns False.
    """
    expected = list(get_feature_column_names())
    loaded = list(getattr(model, "feature_names", []) or [])
    if loaded == expected:
        return True
    expected_set = set(expected)
    loaded_set = set(loaded)
    missing = sorted(expected_set - loaded_set)[:5]
    extra = sorted(loaded_set - expected_set)[:5]
    order_mismatch = next(
        (f"position {idx}: expected {want!r}, loaded {got!r}"
         for idx, (want, got) in enumerate(zip(expected, loaded)) if want != got),
        None,
    )
    msg = (
        f"Model checkpoint feature drift: {len(loaded)} vs {len(expected)} expected. "
        f"Missing: {missing}, Extra: {extra}. "
        f"Order: {order_mismatch or 'compatible'}. Retrain with `python run_pipeline.py` "
        "or `predict.py --retrain`."
    )
    if strict:
        raise RuntimeError(msg)
    logger.warning(msg)
    return False
