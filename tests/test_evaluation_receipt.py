"""Contract tests for the evaluation receipt artifact.

These assert what the artifact says and the guarantees it carries, never a
specific accuracy or RPS value (those legitimately move between runs). The
seams exercised are the receipt's own module and the rolling folds it
describes.
"""

from __future__ import annotations

import json

import numpy as np
import pandas as pd
import pytest

from src.evaluate import ranked_probability_score
from src.models import build_rolling_folds, split_calibration_evaluation
from src.receipt import (
    RECEIPT_SCHEMA_VERSION,
    ReceiptSchemaError,
    build_receipt,
    load_receipt,
    pooled_from_rows,
    row_rps,
    write_receipt,
)

MODELS = ("Model A", "Model B")


def _frame(n_dates: int = 40, constant_outcome: int | None = None) -> pd.DataFrame:
    """Small deterministic dated frame with target columns and an odds flag."""
    dates = pd.date_range("2024-01-01", periods=n_dates, freq="D")
    clubs = ["Alpha", "Beta", "Gamma", "Delta"]
    rows = []
    for index, date in enumerate(dates):
        home_goals = index % 3
        away_goals = (index + 1) % 3
        outcome = 2 if home_goals > away_goals else (1 if home_goals == away_goals else 0)
        if constant_outcome is not None:
            outcome = int(constant_outcome)
        rows.append(
            {
                "date": date,
                "home_team": clubs[index % 4],
                "away_team": clubs[(index + 1) % 4],
                "target_home_goals": home_goals,
                "target_away_goals": away_goals,
                "target_outcome": outcome,
                "odds_missing": 1.0 if index % 5 == 0 else 0.0,
            }
        )
    return pd.DataFrame(rows)


def _folds(frame: pd.DataFrame, n_folds: int = 3):
    return build_rolling_folds(frame, n_folds=n_folds, validation_from="2024-01-10")


def _reference_f1(preds: np.ndarray, actual: np.ndarray) -> float:
    scores = []
    for cls in (0, 1, 2):
        tp = np.sum((preds == cls) & (actual == cls))
        fp = np.sum((preds == cls) & (actual != cls))
        fn = np.sum((preds != cls) & (actual == cls))
        precision = tp / (tp + fp) if (tp + fp) else 0.0
        recall = tp / (tp + fn) if (tp + fn) else 0.0
        scores.append(
            (2 * precision * recall) / (precision + recall) if (precision + recall) else 0.0
        )
    return float(np.mean(scores))


def _fold_metrics(val_df: pd.DataFrame, seed: int = 7):
    """Scored arrays for the evaluation slice, plus independently computed metrics."""
    _, evaluation_slice = split_calibration_evaluation(len(val_df))
    eval_df = val_df.iloc[evaluation_slice]
    n_rows = len(eval_df)
    actual = eval_df["target_outcome"].to_numpy(dtype=int)
    generator = np.random.default_rng(seed)
    metrics = {}
    for offset, name in enumerate(MODELS):
        logits = generator.normal(size=(n_rows, 3)) * (1.0 - 0.2 * offset)
        proba = np.exp(logits - logits.max(axis=1, keepdims=True))
        proba = proba / proba.sum(axis=1, keepdims=True)
        preds = np.argmax(proba, axis=1)
        metrics[name] = {
            "rps": ranked_probability_score(actual, proba),
            "log_loss": float(
                np.mean(-np.log(np.clip(proba[np.arange(n_rows), actual], 1e-15, 1 - 1e-15)))
            ),
            "accuracy": float(np.mean(preds == actual)),
            "macro_f1": _reference_f1(preds, actual),
            "avg_goal_mae": 0.9 + 0.01 * offset,
            "val_proba": proba,
            "val_preds": preds,
            "eval_y_outcome": actual,
        }
    return metrics


def _receipt(folds, per_fold_metrics, frame, **overrides):
    kwargs = dict(
        split_date="2024-01-10",
        fingerprint="sha256:test",
        seed=1234,
        resamples=200,
        ci_level=0.95,
    )
    kwargs.update(overrides)
    return build_receipt(folds, per_fold_metrics, **kwargs)


def _build(frame: pd.DataFrame, **overrides):
    folds = _folds(frame)
    per_fold_metrics = [_fold_metrics(val_df) for _, val_df in folds]
    return _receipt(folds, per_fold_metrics, frame, **overrides)


def test_population_counts_exclude_the_calibration_rows():
    frame = _frame()
    folds = _folds(frame)
    receipt = _build(frame)

    population = receipt["population"]
    assert population["n_evaluation_rows"] == len(receipt["rows"])
    assert (
        population["n_calibration_rows"] + population["n_evaluation_rows"]
        == population["n_validation_rows"]
    )
    assert population["n_validation_rows"] == sum(len(val_df) for _, val_df in folds)
    assert len(population["folds"]) == len(folds)
    assert [f["fold"] for f in population["folds"]] == [1, 2, 3]
    # Every recorded row belongs to a fold that reported it.
    assert sorted({row["fold"] for row in receipt["rows"]}) == [1, 2, 3]
    for fold_block in population["folds"]:
        recorded = [row for row in receipt["rows"] if row["fold"] == fold_block["fold"]]
        assert len(recorded) == fold_block["evaluation_rows"]
        assert fold_block["calibration_rows"] > 0
        assert fold_block["train_rows"] > 0


def test_pooled_metrics_are_reproducible_from_the_row_block():
    receipt = _build(_frame())
    weights = np.array(
        [fold["evaluation_rows"] for fold in receipt["population"]["folds"]], dtype=float
    )

    for name in MODELS:
        model = receipt["models"][name]
        derived = pooled_from_rows(receipt["rows"], name)
        for key in ("rps", "log_loss", "accuracy", "macro_f1"):
            assert abs(derived[key] - model["pooled"][key]) <= 1e-5, key
        expected_mae = float(
            np.average([fold["metrics"]["avg_goal_mae"] for fold in model["folds"]], weights=weights)
        )
        assert abs(expected_mae - model["pooled"]["avg_goal_mae"]) <= 1e-5


def test_row_rps_matches_the_scorer():
    generator = np.random.default_rng(3)
    proba = generator.dirichlet([1.0, 1.0, 1.0], size=25)
    actual = generator.integers(0, 3, size=25)
    assert abs(float(np.mean(row_rps(proba, actual))) - ranked_probability_score(actual, proba)) < 1e-12


def test_constant_scores_produce_zero_width_intervals():
    frame = _frame(constant_outcome=1)
    folds = _folds(frame)
    per_fold_metrics = []
    for _, val_df in folds:
        _, evaluation_slice = split_calibration_evaluation(len(val_df))
        n_rows = len(val_df.iloc[evaluation_slice])
        proba = np.tile(np.array([0.2, 0.5, 0.3]), (n_rows, 1))
        metrics = {}
        for name in MODELS:
            metrics[name] = {
                "rps": ranked_probability_score(np.ones(n_rows, dtype=int), proba),
                "log_loss": 0.6931471805599453,
                "accuracy": 1.0,
                "macro_f1": 1.0,
                "avg_goal_mae": 0.9,
                "val_proba": proba,
                "val_preds": np.ones(n_rows, dtype=int),
                "eval_y_outcome": np.ones(n_rows, dtype=int),
            }
        per_fold_metrics.append(metrics)

    receipt = _receipt(folds, per_fold_metrics, frame)
    for name in MODELS:
        for key in ("rps", "log_loss", "accuracy"):
            low, high = receipt["models"][name]["pooled_ci"][key]
            assert low == high, (name, key)


def test_receipt_is_deterministic():
    frame = _frame()
    first = _build(frame)
    second = _build(frame)
    # Different generator instances must still yield byte-identical artifacts.
    assert json.dumps(first) == json.dumps(second)


def test_bootstrap_parameters_are_recorded():
    receipt = _build(_frame(), resamples=150, seed=99, ci_level=0.9)
    method = receipt["method"]
    assert method["bootstrap_resamples"] == 150
    assert method["bootstrap_seed"] == 99
    assert method["ci_level"] == 0.9
    assert method["n_folds"] == len(receipt["population"]["folds"])
    assert receipt["outcome_order"] == ["Away", "Draw", "Home"]


def test_odds_missing_flag_is_carried_per_row():
    frame = _frame()
    receipt = _build(frame)
    expected = []
    for _, val_df in _folds(frame):
        _, evaluation_slice = split_calibration_evaluation(len(val_df))
        expected.extend(
            int(float(value) >= 0.5) for value in val_df.iloc[evaluation_slice]["odds_missing"]
        )
    assert [row["odds_missing"] for row in receipt["rows"]] == expected
    assert set(expected) == {0, 1}


def test_fold_without_a_calibration_slice_is_recorded_not_crashed():
    frame = _frame(n_dates=6).iloc[:5].reset_index(drop=True)
    train_df = frame.iloc[:2].reset_index(drop=True)
    val_df = frame.iloc[2:].reset_index(drop=True)
    folds = [(train_df, val_df)]
    receipt = _receipt(folds, [_fold_metrics(val_df)], frame)
    fold_block = receipt["population"]["folds"][0]
    assert fold_block["calibration_rows"] == 0
    assert fold_block["evaluation_rows"] == len(val_df)
    assert receipt["population"]["n_evaluation_rows"] == len(val_df)


def test_data_fingerprint_is_order_independent_and_content_sensitive():
    from src.receipt import data_fingerprint

    frame = _frame(n_dates=12)
    fingerprint = data_fingerprint(frame)
    shuffled = frame.sample(frac=1.0, random_state=5).reset_index(drop=True)
    assert data_fingerprint(shuffled) == fingerprint

    changed = frame.copy()
    changed.loc[0, "target_home_goals"] = int(changed.loc[0, "target_home_goals"]) + 1
    assert data_fingerprint(changed) != fingerprint


def test_unknown_schema_version_is_rejected(tmp_path):
    path = tmp_path / "receipt.json"
    path.write_text(json.dumps({"schema_version": RECEIPT_SCHEMA_VERSION + 1}), encoding="utf-8")
    with pytest.raises(ReceiptSchemaError):
        load_receipt(str(path))


def test_written_receipt_round_trips(tmp_path):
    receipt = _build(_frame())
    path = write_receipt(str(tmp_path / "nested" / "receipt.json"), receipt)
    assert load_receipt(path) == receipt


def test_mismatched_scored_rows_are_refused():
    frame = _frame()
    folds = _folds(frame)
    per_fold_metrics = [_fold_metrics(val_df) for _, val_df in folds]
    per_fold_metrics[0]["Model A"]["val_preds"] = per_fold_metrics[0]["Model A"]["val_preds"][:-1]
    with pytest.raises(ValueError, match="evaluation slice"):
        _receipt(folds, per_fold_metrics, frame)


def test_model_set_must_be_stable_across_folds():
    frame = _frame()
    folds = _folds(frame)
    per_fold_metrics = [_fold_metrics(val_df) for _, val_df in folds]
    per_fold_metrics[1] = {"Model A": per_fold_metrics[1]["Model A"]}
    with pytest.raises(ValueError, match="stable model set"):
        _receipt(folds, per_fold_metrics, frame)
