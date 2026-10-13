"""Margin-of-victory Elo tests (issue #50) at the model interface seam.

The chronological Elo update in ``src.feature_engineering.compute_dynamic_elo``
scales K by a fixed, parameter-free function of |goal difference|, and that one
function serves both the training and fixture paths. These tests lock in:

1. Bit-identical reruns (the member stays fully deterministic).
2. Margin sensitivity: a 3-0 win moves Elo strictly more than a 1-0 win,
   ceteris paribus, and the EloPoissonModel contribution shifts measurably.
"""

import numpy as np
import pandas as pd

from src.feature_engineering import compute_dynamic_elo, get_feature_column_names
from src.models import EloPoissonModel

R0 = 1500.0
HOME_ADV = 65.0
K_BASE = 20.0
INIT = {"Arsenal": R0, "Chelsea": R0}

# Hand-worked from the Elo expectancy for a 65-point edge:
# eh = 1 / (1 + 10**(-65/400)) = 0.5924662305843318, so a winner gains
# K * g * (1 - eh) with g = 1.00 for a 1-0 win and g = 1.75 for a 3-0 win.
AFTER_NARROW = 1508.1506753883134
AFTER_ROUT = 1514.2636819295483


def _scenario(home_goals, away_goals, match_id=1, date="2024-08-17"):
    return pd.DataFrame([{
        "season": "2024-25",
        "date": pd.Timestamp(date),
        "match_id": match_id,
        "home_team": "Arsenal",
        "away_team": "Chelsea",
        "home_goals": home_goals,
        "away_goals": away_goals,
    }])


def _elo(scenario):
    return compute_dynamic_elo(
        scenario, initial_ratings=dict(INIT), home_adv=HOME_ADV, k_base=K_BASE,
    )


def _multi_match_history():
    return pd.DataFrame([
        {"season": "2024-25", "date": pd.Timestamp("2024-08-17"), "match_id": 1,
         "home_team": "Arsenal", "away_team": "Chelsea", "home_goals": 3, "away_goals": 0},
        {"season": "2024-25", "date": pd.Timestamp("2024-08-24"), "match_id": 2,
         "home_team": "Chelsea", "away_team": "Arsenal", "home_goals": 1, "away_goals": 1},
        {"season": "2024-25", "date": pd.Timestamp("2024-08-31"), "match_id": 3,
         "home_team": "Arsenal", "away_team": "Chelsea", "home_goals": 0, "away_goals": 2},
        {"season": "2024-25", "date": pd.Timestamp("2024-09-14"), "match_id": 4,
         "home_team": "Chelsea", "away_team": "Arsenal", "home_goals": 1, "away_goals": 0},
    ])


def test_elo_reruns_are_bit_identical():
    first = _elo(_multi_match_history())
    second = _elo(_multi_match_history())
    for a, b in zip(first, second):
        assert a == b
    # Input row order must not matter: the update is chronological by construction.
    shuffled = _elo(_multi_match_history().iloc[::-1].reset_index(drop=True))
    for a, b in zip(first, shuffled):
        assert a == b


def test_rout_moves_elo_strictly_more_than_narrow_win():
    narrow_ratings = _elo(_scenario(1, 0))[4]
    rout_ratings = _elo(_scenario(3, 0))[4]
    # Winner gains strictly more from the rout; loser loses strictly more.
    assert rout_ratings["Arsenal"] > narrow_ratings["Arsenal"]
    assert rout_ratings["Chelsea"] < narrow_ratings["Chelsea"]
    # Hand-worked post-match winner ratings (fixed g of 1.00 vs 1.75).
    assert abs(narrow_ratings["Arsenal"] - AFTER_NARROW) < 1e-9
    assert abs(rout_ratings["Arsenal"] - AFTER_ROUT) < 1e-9
    gain_narrow = narrow_ratings["Arsenal"] - R0
    gain_rout = rout_ratings["Arsenal"] - R0
    assert abs(gain_rout / gain_narrow - 1.75) < 1e-9


def _fixed_member():
    cols = get_feature_column_names()
    gap = np.linspace(-200.0, 200.0, 9)
    X_train = pd.DataFrame({c: np.zeros(9) for c in cols})
    X_train["home_elo"] = 1500.0 + gap / 2.0
    X_train["away_elo"] = 1500.0 - gap / 2.0
    y_outcome = pd.Series([0, 0, 0, 1, 1, 2, 2, 2, 2])
    y_hg = pd.Series([0, 0, 1, 1, 1, 2, 2, 3, 3])
    y_ag = pd.Series([3, 2, 2, 1, 1, 1, 1, 0, 0])
    member = EloPoissonModel().fit(X_train, y_outcome, y_hg, y_ag)
    assert member.beta > 0.0  # goals track the Elo gap, so the member listens to it
    return member


def _member_row(home_elo, away_elo):
    cols = get_feature_column_names()
    X = pd.DataFrame({c: np.zeros(1) for c in cols})
    X["home_elo"] = [home_elo]
    X["away_elo"] = [away_elo]
    return X


def test_elo_member_contribution_shifts_with_margin():
    narrow_ratings = _elo(_scenario(1, 0))[4]
    rout_ratings = _elo(_scenario(3, 0))[4]
    member = _fixed_member()
    p_narrow = member.predict_outcome_proba(
        _member_row(narrow_ratings["Arsenal"], narrow_ratings["Chelsea"]))[0]
    p_rout = member.predict_outcome_proba(
        _member_row(rout_ratings["Arsenal"], rout_ratings["Chelsea"]))[0]
    # Column order is [away, draw, home]: the rout backs the winner harder.
    assert p_rout[2] > p_narrow[2]
    assert p_rout[0] < p_narrow[0]
    assert float(np.max(np.abs(p_rout - p_narrow))) > 0.01
