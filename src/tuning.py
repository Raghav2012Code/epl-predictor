"""Hyperparameter tuning for the tree models (Optuna, deterministic).

Protocol mirrors benchmarking exactly: fit on train-only rows, fit the
temperature on the disjoint calibration slice, score the metric on the
disjoint evaluation slice (see models.split_calibration_evaluation).
Nothing in validation ever touches trial selection beyond the
calibration fit, and the final evaluation tail stays untouched until
reporting.

Outputs:
- models/tuning.json: best params + values per model (consumed by the
  pipeline at train time; missing file means defaults).
- stdout summary for the operator.

Usage:
    .venv/Scripts/python -m src.tuning --trials 40 --metric rps --offline
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd

from src.evaluate import ranked_probability_score
from src.logging_config import get_logger
from src.models import MatchPredictorModel, split_calibration_evaluation

logger = get_logger(__name__)

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
TUNING_PATH = os.path.join(MODELS_DIR, "tuning.json")

RF_PARAM_KEYS = ("n_estimators", "max_depth", "min_samples_leaf")
XGB_PARAM_KEYS = (
    "n_estimators", "max_depth", "learning_rate",
    "subsample", "colsample_bytree", "reg_lambda",
)


def suggest_rf(trial) -> Dict[str, Any]:
    """Random-Forest search space (applied to classifier + regressors)."""
    return {
        "n_estimators": trial.suggest_int("n_estimators", 150, 500, step=50),
        "max_depth": trial.suggest_int("max_depth", 4, 12),
        "min_samples_leaf": trial.suggest_int("min_samples_leaf", 1, 8),
    }


def suggest_xgb(trial) -> Dict[str, Any]:
    """XGBoost search space (applied to classifier + regressors)."""
    return {
        "n_estimators": trial.suggest_int("n_estimators", 150, 400, step=50),
        "max_depth": trial.suggest_int("max_depth", 2, 6),
        "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.15, log=True),
        "subsample": trial.suggest_float("subsample", 0.6, 1.0),
        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.6, 1.0),
        "reg_lambda": trial.suggest_float("reg_lambda", 0.0, 5.0),
    }


def _slice_frames(
    train_df: pd.DataFrame, val_df: pd.DataFrame, feature_cols: List[str]
):
    """Splits frames into train / calibration / evaluation views."""
    cal_slice, eval_slice = split_calibration_evaluation(len(val_df))
    return {
        "X_train": train_df[feature_cols],
        "y_outcome": train_df["target_outcome"],
        "y_hg": train_df["target_home_goals"],
        "y_ag": train_df["target_away_goals"],
        "X_cal": val_df[feature_cols].iloc[cal_slice] if cal_slice.stop else val_df[feature_cols].iloc[0:0],
        "y_cal": val_df["target_outcome"].iloc[cal_slice] if cal_slice.stop else val_df["target_outcome"].iloc[0:0],
        "X_eval": val_df[feature_cols].iloc[eval_slice],
        "y_eval": val_df["target_outcome"].iloc[eval_slice],
    }


def evaluate_params(
    model_type: str,
    params: Dict[str, Any],
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    feature_cols: List[str],
    metric: str = "rps",
) -> float:
    """Fits one param set and scores it on the disjoint evaluation slice.

    Lower is better for both supported metrics (rps, log_loss).
    Returns inf when the evaluation slice is empty.
    """
    parts = _slice_frames(train_df, val_df, feature_cols)
    if len(parts["X_eval"]) == 0:
        return float("inf")
    model = MatchPredictorModel(model_type).apply_params(params)
    model.fit(parts["X_train"], parts["y_outcome"], parts["y_hg"], parts["y_ag"])
    if len(parts["X_cal"]) > 0:
        try:
            model.calibrate_temperature(parts["X_cal"], parts["y_cal"])
        except Exception:
            model.calibration_temperature = 1.0
    probas = model.predict_outcome_proba(parts["X_eval"])
    if metric == "log_loss":
        eps = 1e-15
        clipped = np.clip(probas, eps, 1 - eps)
        y = np.asarray(parts["y_eval"].values, dtype=int)
        return float(-np.mean(np.log(clipped[np.arange(len(y)), y])))
    if metric != "rps":
        raise ValueError(f"Unknown tuning metric {metric!r}; use 'rps' or 'log_loss'.")
    return float(ranked_probability_score(parts["y_eval"], probas))


def tune_model(
    model_type: str,
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    feature_cols: List[str],
    n_trials: int = 40,
    seed: int = 42,
    metric: str = "rps",
) -> Dict[str, Any]:
    """Runs a deterministic Optuna study; returns best params + value."""
    import optuna

    suggest = suggest_rf if model_type == "rf" else suggest_xgb
    sampler = optuna.samplers.TPESampler(seed=seed)
    study = optuna.create_study(direction="minimize", sampler=sampler)

    def _objective(trial) -> float:
        return evaluate_params(
            model_type, suggest(trial), train_df, val_df, feature_cols, metric=metric
        )

    study.optimize(_objective, n_trials=max(1, n_trials))
    best_params = {k: v for k, v in study.best_trial.params.items()}
    return {
        "params": best_params,
        "value": float(study.best_value),
        "trials": len(study.trials),
        "metric": metric,
    }


def get_tuned_params(model_type: str, path: Optional[str] = None) -> Dict[str, Any]:
    """Reads tuned params for one model from tuning.json ({} when absent)."""
    key = "rf" if model_type == "rf" else "xgboost"
    try:
        with open(path or TUNING_PATH, "r", encoding="utf-8") as f:
            record = json.load(f) or {}
        params = (record.get("models", {}).get(key, {}) or {}).get("params", {})
        return dict(params) if isinstance(params, dict) else {}
    except (OSError, ValueError):
        return {}


def run_tuning(
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    feature_cols: List[str],
    n_trials: int = 40,
    seed: int = 42,
    metric: str = "rps",
    persist: bool = True,
) -> Dict[str, Any]:
    """Tunes RF + XGBoost, optionally persists models/tuning.json."""
    results: Dict[str, Any] = {
        "metric": metric,
        "seed": seed,
        "n_trials": n_trials,
        "models": {},
    }
    for model_type, short in (("rf", "rf"), ("xgboost", "xgboost")):
        logger.info("Tuning %s (%d trials, metric=%s)...", model_type, n_trials, metric)
        outcome = tune_model(model_type, train_df, val_df, feature_cols,
                             n_trials=n_trials, seed=seed, metric=metric)
        results["models"][short] = outcome
        logger.info("  - best %s=%s value=%.4f", metric, outcome["params"], outcome["value"])
    if persist:
        os.makedirs(MODELS_DIR, exist_ok=True)
        with open(TUNING_PATH, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2)
        logger.info("Tuning record saved to %s", TUNING_PATH)
    return results


def main() -> int:
    parser = argparse.ArgumentParser(description="Tune RF/XGBoost hyperparameters.")
    parser.add_argument("--trials", type=int, default=40)
    parser.add_argument("--metric", choices=("rps", "log_loss"), default="rps")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--offline", action="store_true")
    parser.add_argument("--no-persist", action="store_true")
    args = parser.parse_args()

    from src.config import get_split_date
    from src.data_loader import load_historical_stats
    from src.feature_engineering import build_engineered_dataset, get_feature_column_names
    from src.odds_loader import load_odds_frame

    raw = load_historical_stats(offline=args.offline)
    odds = load_odds_frame(offline=args.offline)
    from src.config import get_config as _get_cfg

    mask_rate = float(_get_cfg()["model"].get("odds_mask_rate", 0.15))
    eng = build_engineered_dataset(raw, odds_df=odds, odds_mask_rate=mask_rate)
    cols = get_feature_column_names()
    split_date = pd.to_datetime(get_split_date())
    train_df = eng[eng["date"] < split_date].copy()
    val_df = eng[eng["date"] >= split_date].copy()
    logger.info("Tuning data: %d train / %d validation rows.", len(train_df), len(val_df))
    run_tuning(train_df, val_df, cols, n_trials=args.trials,
               seed=args.seed, metric=args.metric, persist=not args.no_persist)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
