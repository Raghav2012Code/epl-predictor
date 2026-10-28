"""Versioned evaluation receipt for the forecast model.

One artifact (``models/evaluation_receipt.json``) answers "did this change
help?" for every later experiment: the evaluation population, per-model
per-fold metrics, pooled metrics, and seeded bootstrap intervals. It is
built by the training workflow only, never hand-edited.

Only the evaluation slice of each rolling-origin fold feeds the compared
numbers. Calibration rows are counted and excluded, using the same
``split_calibration_evaluation`` seam the benchmark scorer uses, so the
receipt can never describe a different population than the one that was
scored.

The artifact also stores the scored rows (identifiers, actual outcome, the
market-availability flag, and each model's predicted class and probability
vector) so diagnostics added later -- confusion, calibration, segment
splits -- are derivations of this file rather than a new schema each time.

Schema v2 adds the per-outcome diagnostics: confusion counts, recall and
precision, predicted-versus-observed class shares, and the same block split
into lopsided and tight matches by a documented absolute home-minus-away
probability gap.
"""

from __future__ import annotations

import hashlib
import json
import os
from typing import Any, Dict, List, Sequence, Tuple

import numpy as np
import pandas as pd

from src.evaluate import confusion_counts
from src.models import split_calibration_evaluation

RECEIPT_SCHEMA_VERSION = 2

# Transcribed into the artifact at six decimal places; comparisons and
# re-derivations allow this much slack.
FLOAT_PRECISION = 6

OUTCOME_ORDER: Tuple[str, ...] = ("Away", "Draw", "Home")

# Boundary tolerance for the documented |p_home - p_away| segmentation: a gap
# that is equal to the threshold in decimal can subtract to just below it in
# binary floating point, and such a match must still count as lopsided.
SHAPE_GAP_EPSILON = 1e-12

FOLD_METRIC_KEYS: Tuple[str, ...] = (
    "rps",
    "log_loss",
    "accuracy",
    "macro_f1",
    "avg_goal_mae",
)

# Bootstrapped because they describe probability quality on the population.
CI_METRIC_KEYS: Tuple[str, ...] = ("rps", "log_loss", "accuracy")


class ReceiptSchemaError(ValueError):
    """Raised when a receipt artifact cannot be read safely."""


def _round(value: float) -> float:
    return float(round(float(value), FLOAT_PRECISION))


def row_rps(probas: np.ndarray, actual: np.ndarray) -> np.ndarray:
    """Per-match Ranked Probability Score for [Away, Draw, Home] rows."""
    p = np.asarray(probas, dtype=float)
    y = np.asarray(actual, dtype=int)
    if p.ndim != 2 or p.shape[1] < 2 or len(y) != len(p):
        raise ValueError("probas must be an (N, K) matrix matching actual.")
    thresholds = np.arange(p.shape[1] - 1)
    cum = np.cumsum(p, axis=1)[:, thresholds]
    truth = (y[:, None] <= thresholds[None, :]).astype(float)
    return np.sum((cum - truth) ** 2, axis=1) / (p.shape[1] - 1)


def row_log_loss(probas: np.ndarray, actual: np.ndarray) -> np.ndarray:
    """Per-match multiclass log loss for [Away, Draw, Home] rows."""
    p = np.clip(np.asarray(probas, dtype=float), 1e-15, 1 - 1e-15)
    y = np.asarray(actual, dtype=int)
    if p.ndim != 2 or len(y) != len(p):
        raise ValueError("probas must be an (N, K) matrix matching actual.")
    return -np.log(p[np.arange(len(y)), y])


def macro_f1(preds: np.ndarray, actual: np.ndarray, n_classes: int = 3) -> float:
    """Unweighted mean F1 across the outcome classes present."""
    p = np.asarray(preds, dtype=int)
    y = np.asarray(actual, dtype=int)
    if len(p) != len(y):
        raise ValueError("preds must match actual.")
    scores = []
    for cls in range(n_classes):
        tp = int(np.sum((p == cls) & (y == cls)))
        fp = int(np.sum((p == cls) & (y != cls)))
        fn = int(np.sum((p != cls) & (y == cls)))
        precision = tp / (tp + fp) if (tp + fp) else 0.0
        recall = tp / (tp + fn) if (tp + fn) else 0.0
        f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) else 0.0
        scores.append(f1)
    return float(np.mean(scores))


def pooled_from_rows(rows: Sequence[Dict[str, Any]], model_name: str) -> Dict[str, float]:
    """Metrics re-derived from the receipt's own row block for one model.

    ``avg_goal_mae`` is deliberately absent: it needs the expected-goals
    values, which are a model-side quantity and pooled as a fold-weighted
    mean instead.
    """
    rows = list(rows)
    if not rows:
        raise ValueError("Cannot compute pooled metrics from an empty row block.")
    probas = np.array([row["probas"][model_name] for row in rows], dtype=float)
    preds = np.array([row["predicted"][model_name] for row in rows], dtype=int)
    actual = np.array([row["actual"] for row in rows], dtype=int)
    return {
        "rps": float(np.mean(row_rps(probas, actual))),
        "log_loss": float(np.mean(row_log_loss(probas, actual))),
        "accuracy": float(np.mean(preds == actual)),
        "macro_f1": macro_f1(preds, actual),
    }


def _shares(counts: np.ndarray) -> Dict[str, float]:
    """Share of the block per outcome class, in Away/Draw/Home order."""
    values = np.asarray(counts, dtype=float)
    total = float(values.sum())
    if total <= 0:
        return {label: 0.0 for label in OUTCOME_ORDER}
    return {label: _round(value / total) for label, value in zip(OUTCOME_ORDER, values)}


def _recall_precision(confusion: np.ndarray) -> Tuple[Dict[str, float], Dict[str, float]]:
    """Per-outcome recall and precision from a rows=actual, cols=predicted matrix.

    A class with no support scores 0.0 rather than NaN, so the artifact stays
    readable when a slice misses an outcome entirely.
    """
    matrix = np.asarray(confusion, dtype=int)
    recall: Dict[str, float] = {}
    precision: Dict[str, float] = {}
    for index, label in enumerate(OUTCOME_ORDER):
        actual_total = int(matrix[index].sum())
        predicted_total = int(matrix[:, index].sum())
        recall[label] = _round(matrix[index, index] / actual_total) if actual_total else 0.0
        precision[label] = _round(matrix[index, index] / predicted_total) if predicted_total else 0.0
    return recall, precision


def _diagnostic_block(rows: Sequence[Dict[str, Any]], model_name: str) -> Dict[str, Any]:
    """Confusion, recall/precision and shares for one model over one row set."""
    if not rows:
        return {
            "n": 0,
            "confusion": [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
            "recall": {label: 0.0 for label in OUTCOME_ORDER},
            "precision": {label: 0.0 for label in OUTCOME_ORDER},
            "observed_share": {label: 0.0 for label in OUTCOME_ORDER},
            "predicted_share": {label: 0.0 for label in OUTCOME_ORDER},
        }
    actual = np.array([row["actual"] for row in rows], dtype=int)
    predicted = np.array([row["predicted"][model_name] for row in rows], dtype=int)
    confusion = confusion_counts(actual, predicted)
    recall, precision = _recall_precision(confusion)
    return {
        "n": int(len(rows)),
        "confusion": [[int(value) for value in row] for row in confusion],
        "recall": recall,
        "precision": precision,
        "observed_share": _shares(np.bincount(actual, minlength=3)),
        "predicted_share": _shares(np.bincount(predicted, minlength=3)),
    }


def build_diagnostics(
    rows: Sequence[Dict[str, Any]],
    model_names: Sequence[str],
    threshold: float = 0.20,
) -> Dict[str, Any]:
    """Per-outcome diagnostics and the lopsided/tight split for every model.

    Shape segments use each model's own probabilities, so the split never
    depends on the production selection or on any external input. The
    threshold is written into the artifact, which makes a re-segmentation a
    visible diff instead of a silent change of population.
    """
    rows = list(rows)
    if not rows:
        raise ValueError("Cannot build diagnostics without evaluation rows.")
    threshold = float(threshold)
    if not 0.0 <= threshold <= 1.0:
        raise ValueError(f"lopsided gap threshold must be in [0, 1], got {threshold}.")

    models: Dict[str, Dict[str, Any]] = {}
    for name in model_names:
        gaps = [
            abs(float(row["probas"][name][2]) - float(row["probas"][name][0]))
            for row in rows
        ]
        # Probabilities are floats: a gap typed as 0.20 can subtract to
        # 0.19999999999999996, so the boundary comparison carries a tolerance
        # and a match sitting on the threshold counts as lopsided.
        boundary = threshold - SHAPE_GAP_EPSILON
        lopsided_rows = [row for row, gap in zip(rows, gaps) if gap >= boundary]
        tight_rows = [row for row, gap in zip(rows, gaps) if gap < boundary]
        overall = _diagnostic_block(rows, name)
        lopsided = _diagnostic_block(lopsided_rows, name)
        tight = _diagnostic_block(tight_rows, name)
        if lopsided["n"] + tight["n"] != overall["n"]:
            raise ValueError(
                f"{name}: shape segments hold {lopsided['n']} + {tight['n']} rows "
                f"but the overall block holds {overall['n']}."
            )
        models[name] = {"overall": overall, "lopsided": lopsided, "tight": tight}

    return {
        "definitions": {
            "confusion": {
                "rows": "actual",
                "columns": "predicted",
                "classes": list(OUTCOME_ORDER),
            },
            "shape_segments": {
                "metric": "abs(p_home - p_away)",
                "basis": "each model's own evaluation probabilities",
                "threshold": _round(threshold),
                "boundary_tolerance": SHAPE_GAP_EPSILON,
                "lopsided": "gap >= threshold - boundary_tolerance",
                "tight": "gap < threshold - boundary_tolerance",
            },
        },
        "models": models,
    }


def bootstrap_interval(
    losses: np.ndarray,
    resample_indices: np.ndarray,
    ci_level: float = 0.95,
) -> List[float]:
    """Percentile interval of the mean loss over pre-drawn resample indices.

    Indices are drawn once by the caller and shared across models, so
    intervals are paired and two runs over the same inputs agree exactly.
    """
    values = np.asarray(losses, dtype=float)
    indices = np.asarray(resample_indices, dtype=np.int64)
    if values.ndim != 1 or indices.ndim != 2:
        raise ValueError("losses must be 1-D and resample_indices 2-D.")
    if indices.shape[1] != len(values):
        raise ValueError("resample_indices must resample exactly the loss rows.")
    if not 0.0 < float(ci_level) < 1.0:
        raise ValueError(f"ci_level must be in (0, 1), got {ci_level}.")
    means = values[indices].mean(axis=1)
    alpha = (1.0 - float(ci_level)) / 2.0
    low, high = np.percentile(means, [alpha * 100.0, (1.0 - alpha) * 100.0])
    return [_round(low), _round(high)]


def data_fingerprint(frame: pd.DataFrame) -> str:
    """Stable sha256 of the dated match rows a receipt was built from.

    Later experiment comparisons refuse mismatched fingerprints, so a
    "improvement" measured on different data can never be presented as a
    delta.
    """
    if frame is None or frame.empty:
        raise ValueError("Cannot fingerprint an empty frame.")
    required = ("date", "home_team", "away_team")
    missing = [column for column in required if column not in frame.columns]
    if missing:
        raise ValueError(f"Frame is missing fingerprint columns: {missing}")

    home_goals = "target_home_goals" if "target_home_goals" in frame.columns else "home_goals"
    away_goals = "target_away_goals" if "target_away_goals" in frame.columns else "away_goals"
    lines = []
    for row in frame.itertuples(index=False):
        record = row._asdict()
        goal_home = record.get(home_goals)
        goal_away = record.get(away_goals)
        lines.append(
            "|".join(
                (
                    str(pd.to_datetime(record["date"]).date()),
                    str(record["home_team"]),
                    str(record["away_team"]),
                    str(int(goal_home)) if pd.notna(goal_home) else "-",
                    str(int(goal_away)) if pd.notna(goal_away) else "-",
                )
            )
        )
    payload = "\n".join(sorted(lines)).encode("utf-8")
    return "sha256:" + hashlib.sha256(payload).hexdigest()


def _fold_entry(
    fold_no: int,
    entry: Dict[str, Any],
    eval_df: pd.DataFrame,
) -> Dict[str, Any]:
    """Validates one model's scored arrays against the fold's evaluation rows."""
    probas = np.asarray(entry.get("val_proba"), dtype=float)
    preds = np.asarray(entry.get("val_preds"), dtype=int)
    actual = np.asarray(entry.get("eval_y_outcome"), dtype=int)
    expected = len(eval_df)
    for label, values in (("val_proba", probas), ("val_preds", preds), ("eval_y_outcome", actual)):
        if len(values) != expected:
            raise ValueError(
                f"Fold {fold_no}: {label} has {len(values)} rows but the evaluation "
                f"slice has {expected}. The receipt cannot describe a different "
                "population than the benchmark scored."
            )
    if not np.all(np.isfinite(probas)):
        raise ValueError(f"Fold {fold_no}: non-finite probabilities in the evaluation slice.")
    if "target_outcome" in eval_df.columns:
        labels = np.asarray(eval_df["target_outcome"], dtype=int)
        if not np.array_equal(labels, actual):
            raise ValueError(
                f"Fold {fold_no}: scored outcomes disagree with the validation frame. "
                "Row order or the evaluation slice has drifted."
            )
    return {"probas": probas, "preds": preds, "actual": actual}


def build_receipt(
    folds: Sequence[Tuple[pd.DataFrame, pd.DataFrame]],
    per_fold_metrics: Sequence[Dict[str, Dict[str, Any]]],
    *,
    split_date: str,
    fingerprint: str,
    seed: int = 42,
    resamples: int = 2000,
    ci_level: float = 0.95,
    lopsided_gap_threshold: float = 0.20,
) -> Dict[str, Any]:
    """Builds the deterministic receipt for one full rolling-origin benchmark."""
    if not folds:
        raise ValueError("Cannot build a receipt without validation folds.")
    if len(folds) != len(per_fold_metrics):
        raise ValueError(
            f"{len(folds)} folds but {len(per_fold_metrics)} fold metric sets."
        )
    if int(resamples) < 1:
        raise ValueError(f"resamples must be >= 1, got {resamples}.")

    model_names: List[str] = list(per_fold_metrics[0])
    if not model_names:
        raise ValueError("No benchmarked models to record.")
    for fold_no, metrics in enumerate(per_fold_metrics, start=1):
        if list(metrics) != model_names:
            raise ValueError(
                f"Fold {fold_no} scored models {list(metrics)} but fold 1 scored "
                f"{model_names}; the receipt needs one stable model set."
            )

    folds_block: List[Dict[str, Any]] = []
    raw_fold_metrics: Dict[str, List[Dict[str, float]]] = {name: [] for name in model_names}
    fold_arrays: Dict[str, List[Dict[str, np.ndarray]]] = {name: [] for name in model_names}
    rows: List[Dict[str, Any]] = []

    for fold_no, ((train_df, val_df), fold_metrics) in enumerate(
        zip(folds, per_fold_metrics), start=1
    ):
        calibration_slice, evaluation_slice = split_calibration_evaluation(len(val_df))
        eval_df = val_df.iloc[evaluation_slice].reset_index(drop=True)
        calibration_rows = int(calibration_slice.stop or 0)
        folds_block.append(
            {
                "fold": fold_no,
                "validation_start": str(pd.to_datetime(val_df["date"]).min().date()),
                "validation_end": str(pd.to_datetime(val_df["date"]).max().date()),
                "train_rows": int(len(train_df)),
                "validation_rows": int(len(val_df)),
                "calibration_rows": calibration_rows,
                "evaluation_rows": int(len(eval_df)),
            }
        )

        scored: Dict[str, Dict[str, np.ndarray]] = {}
        for name in model_names:
            entry = _fold_entry(fold_no, fold_metrics[name], eval_df)
            scored[name] = entry
            values = {
                key: float(fold_metrics[name][key]) for key in FOLD_METRIC_KEYS
            }
            raw_fold_metrics[name].append(values)
            fold_arrays[name].append(entry)

        reference_actual = scored[model_names[0]]["actual"]
        for name in model_names[1:]:
            if not np.array_equal(scored[name]["actual"], reference_actual):
                raise ValueError(f"Fold {fold_no}: scored outcome labels differ per model.")
        if "odds_missing" in eval_df.columns:
            odds_missing = [
                int(float(value) >= 0.5) for value in eval_df["odds_missing"].tolist()
            ]
        else:
            odds_missing = [0] * len(eval_df)

        dates = pd.to_datetime(eval_df["date"]).tolist() if "date" in eval_df.columns else []
        for position in range(len(eval_df)):
            rows.append(
                {
                    "fold": fold_no,
                    "date": str(dates[position].date()) if dates else "",
                    "home_team": str(eval_df["home_team"].iloc[position])
                    if "home_team" in eval_df.columns
                    else "",
                    "away_team": str(eval_df["away_team"].iloc[position])
                    if "away_team" in eval_df.columns
                    else "",
                    "actual": int(reference_actual[position]),
                    "odds_missing": odds_missing[position],
                    "predicted": {
                        name: int(scored[name]["preds"][position]) for name in model_names
                    },
                    "probas": {
                        name: [float(value) for value in scored[name]["probas"][position]]
                        for name in model_names
                    },
                }
            )

    population = {
        "n_validation_rows": int(sum(item["validation_rows"] for item in folds_block)),
        "n_calibration_rows": int(sum(item["calibration_rows"] for item in folds_block)),
        "n_evaluation_rows": int(sum(item["evaluation_rows"] for item in folds_block)),
        "folds": folds_block,
    }
    if population["n_evaluation_rows"] != len(rows):
        raise ValueError(
            f"Population says {population['n_evaluation_rows']} evaluation rows "
            f"but {len(rows)} were recorded."
        )

    weights = np.array([item["evaluation_rows"] for item in folds_block], dtype=float)
    if weights.sum() <= 0:
        weights = np.ones(len(folds_block), dtype=float)

    generator = np.random.default_rng(int(seed))
    resample_indices = generator.integers(
        0, len(rows), size=(int(resamples), len(rows)), dtype=np.int64
    )

    models_block: Dict[str, Dict[str, Any]] = {}
    for name in model_names:
        fold_entries = []
        for fold_no, values in enumerate(raw_fold_metrics[name], start=1):
            fold_entries.append(
                {
                    "fold": fold_no,
                    "metrics": {key: _round(values[key]) for key in FOLD_METRIC_KEYS},
                }
            )
        pooled_folds = {
            key: float(np.average([values[key] for values in raw_fold_metrics[name]], weights=weights))
            for key in FOLD_METRIC_KEYS
        }

        # Two independent derivations must agree: the fold-weighted means the
        # selection path uses, and the row block this artifact publishes.
        # Probabilities are stored unrounded so row-derived log loss keeps the
        # scorer's precision for confident wrong picks (rounding a 1e-6
        # probability to six decimals would move its loss by tenths).
        # Macro F1 is not additive, so it is pooled over rows instead of
        # averaged over folds; avg_goal_mae stays a fold-weighted mean because
        # expected goals are not carried in the row block.
        from_rows = pooled_from_rows(rows, name)
        for key in ("rps", "log_loss", "accuracy"):
            value = from_rows[key]
            if abs(value - pooled_folds[key]) > 1e-5:
                raise ValueError(
                    f"{name}: pooled {key} from rows ({value}) disagrees with the "
                    f"fold-weighted value ({pooled_folds[key]}); the receipt would "
                    "not be internally consistent."
                )
        pooled_folds["macro_f1"] = from_rows["macro_f1"]

        # Pooled losses concatenated across folds (not the rounded row block),
        # so the intervals carry the scorer's full precision.
        probas = np.concatenate([arrays["probas"] for arrays in fold_arrays[name]])
        actual = np.concatenate([arrays["actual"] for arrays in fold_arrays[name]])
        preds = np.concatenate([arrays["preds"] for arrays in fold_arrays[name]])
        loss_series = {
            "rps": row_rps(probas, actual),
            "log_loss": row_log_loss(probas, actual),
            "accuracy": (preds == actual).astype(float),
        }
        models_block[name] = {
            "folds": fold_entries,
            "pooled": {key: _round(pooled_folds[key]) for key in FOLD_METRIC_KEYS},
            "pooled_ci": {
                key: bootstrap_interval(loss_series[key], resample_indices, ci_level)
                for key in CI_METRIC_KEYS
            },
        }

    diagnostics = build_diagnostics(rows, model_names, lopsided_gap_threshold)

    return {
        "schema_version": RECEIPT_SCHEMA_VERSION,
        "method": {
            "bootstrap_resamples": int(resamples),
            "bootstrap_seed": int(seed),
            "ci_level": _round(ci_level),
            "n_folds": len(folds_block),
            "split_date": str(split_date),
            "rounding_decimals": FLOAT_PRECISION,
            "pooling": "row-weighted mean of per-fold metrics over the evaluation slices",
            "interval": "percentile bootstrap of the pooled row losses, resampling matches, "
            "shared resample indices across models",
        },
        "outcome_order": list(OUTCOME_ORDER),
        "data_fingerprint": str(fingerprint),
        "population": population,
        "models": models_block,
        "diagnostics": diagnostics,
        "rows": rows,
    }


def write_receipt(path: str, receipt: Dict[str, Any]) -> str:
    """Writes a receipt to disk after checking its schema version."""
    _assert_schema(receipt)
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(receipt, handle, indent=2)
    return path


def load_receipt(path: str) -> Dict[str, Any]:
    """Reads a receipt, rejecting unknown schema versions instead of guessing."""
    with open(path, "r", encoding="utf-8") as handle:
        receipt = json.load(handle)
    _assert_schema(receipt)
    return receipt


def _assert_schema(receipt: Dict[str, Any]) -> None:
    version = receipt.get("schema_version") if isinstance(receipt, dict) else None
    if version != RECEIPT_SCHEMA_VERSION:
        raise ReceiptSchemaError(
            f"Unsupported evaluation receipt schema_version {version!r}; this build "
            f"reads version {RECEIPT_SCHEMA_VERSION}. Regenerate the artifact with "
            "the training workflow instead of hand-editing it."
        )
