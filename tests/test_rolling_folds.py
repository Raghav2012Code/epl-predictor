"""Rolling-origin validation folds (issue #52).

Extends the zero-leakage suites (test_pipeline.py,
test_openfootball_extended.py) and the stable-same-date-ordering suite
(test_interfaces.py): every fold trains strictly on matches earlier than
its validation slice, same-date rows are never split, and production
selection comes from pooled RPS with the documented tie-break.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from src.feature_engineering import build_engineered_dataset, get_feature_column_names
from src.models import (
    MatchPredictorModel,
    _score_benchmark_model,
    build_rolling_folds,
    select_by_pooled_rps,
    split_calibration_evaluation,
)


def _raw_history(n_dates: int = 90, start: str = "2023-01-01") -> pd.DataFrame:
    """Two matches per date over weekly dates, built only from prior-row data."""
    dates = pd.date_range(start, periods=n_dates, freq="7D")
    clubs = ["Arsenal", "Chelsea", "Liverpool", "Manchester City"]
    records = []
    for i, day in enumerate(dates):
        for leg in range(2):
            home, away = clubs[(i + leg) % 4], clubs[(i + leg + 1) % 4]
            home_goals, away_goals = (i + leg) % 3, (i + leg + 1) % 2
            records.append(
                {
                    "season": "2023-24",
                    "date": day,
                    "home_team": home,
                    "away_team": away,
                    "home_goals": home_goals,
                    "away_goals": away_goals,
                    "result": "H" if home_goals > away_goals else ("A" if home_goals < away_goals else "D"),
                    "home_shots": 14.0,
                    "away_shots": 9.0,
                    "home_shots_target": 5.0,
                    "away_shots_target": 3.0,
                    "home_corners": 6.0,
                    "away_corners": 4.0,
                    "home_possession": 55.0,
                    "away_possession": 45.0,
                }
            )
    return pd.DataFrame(records)


def _entry(rps: float, log_loss: float = 1.0, accuracy: float = 0.5,
           avg_goal_mae: float = 0.9, n_rows: int = 10) -> dict:
    return {
        "rps": rps,
        "log_loss": log_loss,
        "accuracy": accuracy,
        "avg_goal_mae": avg_goal_mae,
        "eval_y_outcome": np.zeros(n_rows, dtype=int),
    }


def test_folds_train_strictly_before_validation_slice() -> None:
    engineered = build_engineered_dataset(_raw_history())
    folds = build_rolling_folds(engineered, n_folds=3, validation_from="2024-01-01")
    assert len(folds) == 3
    for train_df, val_df in folds:
        assert len(train_df) > 0 and len(val_df) > 0
        # Strict temporal separation: no shared dates, train entirely earlier.
        assert set(train_df["date"]) & set(val_df["date"]) == set()
        assert train_df["date"].max() < val_df["date"].min()


def test_folds_cover_validation_region_without_overlap() -> None:
    engineered = build_engineered_dataset(_raw_history())
    folds = build_rolling_folds(engineered, n_folds=3, validation_from="2024-01-01")
    region = engineered[pd.to_datetime(engineered["date"]) >= pd.Timestamp("2024-01-01")]
    assert sum(len(val_df) for _, val_df in folds) == len(region)
    seen = pd.concat([val_df for _, val_df in folds])
    assert len(seen.drop_duplicates()) == len(seen)


def test_folds_keep_same_date_rows_together_in_input_order() -> None:
    engineered = build_engineered_dataset(_raw_history())
    folds = build_rolling_folds(engineered, n_folds=3, validation_from="2024-01-01")
    for train_df, val_df in folds:
        for same_date in (train_df, val_df):
            for _, group in same_date.groupby("date", sort=False):
                # Same-date rows stay in one slice and keep input order.
                positions = engineered.index.get_indexer_for(group.index)
                assert list(positions) == sorted(positions)


def test_folds_are_deterministic() -> None:
    engineered = build_engineered_dataset(_raw_history())
    first = build_rolling_folds(engineered, n_folds=3, validation_from="2024-01-01")
    second = build_rolling_folds(engineered, n_folds=3, validation_from="2024-01-01")
    for (train_a, val_a), (train_b, val_b) in zip(first, second):
        pd.testing.assert_frame_equal(train_a, train_b)
        pd.testing.assert_frame_equal(val_a, val_b)


def test_pooled_selection_prefers_lower_rps_then_documented_tiebreak() -> None:
    best, _ = select_by_pooled_rps({
        "A": [_entry(0.20), _entry(0.20)],
        "B": [_entry(0.21), _entry(0.21)],
    })
    assert best == "A"

    best, _ = select_by_pooled_rps({  # RPS tie -> lower log loss wins.
        "A": [_entry(0.20, log_loss=1.0), _entry(0.20, log_loss=1.0)],
        "B": [_entry(0.20, log_loss=0.9), _entry(0.20, log_loss=0.9)],
    })
    assert best == "B"

    best, _ = select_by_pooled_rps({  # RPS + log-loss tie -> higher accuracy wins.
        "A": [_entry(0.20, accuracy=0.45), _entry(0.20, accuracy=0.45)],
        "B": [_entry(0.20, accuracy=0.50), _entry(0.20, accuracy=0.50)],
    })
    assert best == "B"

    best, pooled = select_by_pooled_rps({  # Full tie -> lower goal MAE wins.
        "A": [_entry(0.20, avg_goal_mae=0.95), _entry(0.20, avg_goal_mae=0.95)],
        "B": [_entry(0.20, avg_goal_mae=0.85), _entry(0.20, avg_goal_mae=0.85)],
    })
    assert best == "B"
    assert pooled["B"]["rps"] == 0.20


def test_fold_entries_keep_scoreline_keys_with_disjoint_cal_eval() -> None:
    feature_cols = get_feature_column_names()
    rng = np.random.RandomState(11)
    n = 60
    base = pd.DataFrame(rng.randn(n, len(feature_cols)), columns=feature_cols)
    base["date"] = pd.date_range("2023-01-01", periods=n, freq="7D")
    base["target_outcome"] = rng.choice([0, 1, 2], size=n)
    base["target_home_goals"] = rng.poisson(1.5, size=n)
    base["target_away_goals"] = rng.poisson(1.2, size=n)

    folds = build_rolling_folds(base, n_folds=2, validation_from="2023-06-01")
    for train_df, val_df in folds:
        model = MatchPredictorModel("rf").apply_params({"n_estimators": 10})
        model.fit(
            train_df[feature_cols],
            train_df["target_outcome"],
            train_df["target_home_goals"],
            train_df["target_away_goals"],
        )
        entry = _score_benchmark_model(
            model,
            val_df[feature_cols],
            val_df["target_outcome"],
            val_df["target_home_goals"],
            val_df["target_away_goals"],
        )
        # Preservation: every existing key survives per-fold scoring.
        for key in ("scoreline_theta", "scoreline_dispersion", "scoreline_quality",
                    "accuracy", "log_loss", "rps", "avg_goal_mae"):
            assert key in entry, key
        # Calibration/evaluation stays disjoint inside the fold.
        cal_slice, eval_slice = split_calibration_evaluation(len(val_df))
        assert len(range(*cal_slice.indices(len(val_df)))) + len(entry["eval_y_outcome"]) == len(val_df)
        assert cal_slice.stop == len(val_df) - len(entry["eval_y_outcome"])
        assert eval_slice.start == cal_slice.stop
