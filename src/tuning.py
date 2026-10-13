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
import contextlib
import json
import os
import sys
import tempfile
from typing import Any, Dict, Iterator, List, Optional

import numpy as np
import pandas as pd

from src.evaluate import ranked_probability_score
from src.logging_config import get_logger
from src.models import (
    JOINT_BLEND_KEYS,
    JOINT_DRAW_KEYS,
    MatchPredictorModel,
    split_calibration_evaluation,
)

logger = get_logger(__name__)

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
TUNING_PATH = os.path.join(MODELS_DIR, "tuning.json")

RF_PARAM_KEYS = ("n_estimators", "max_depth", "min_samples_leaf")
XGB_PARAM_KEYS = (
    "n_estimators", "max_depth", "learning_rate",
    "subsample", "colsample_bytree", "reg_lambda",
)
# Draw-share admissibility band for study trials. The production draw rule
# was selected under an 18-27% draw-share constraint on both market regimes
# (see the draw-rule provenance note in src/models.py); the joint search
# carries the same constraint so tuning can never reintroduce a
# never-calls-draws pathology. Trials outside the band score inf.
JOINT_DRAW_SHARE_MIN = 0.18
JOINT_DRAW_SHARE_MAX = 0.27


def draw_share_admissible(share: float) -> bool:
    """Whether an eval draw share keeps a trial in the joint search."""
    return bool(JOINT_DRAW_SHARE_MIN <= float(share) <= JOINT_DRAW_SHARE_MAX)


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
    cal_slice, eval_slice = split_calibration_evaluation(len(val_df))
    X_train, y_outcome = train_df[feature_cols], train_df["target_outcome"]
    y_hg, y_ag = train_df["target_home_goals"], train_df["target_away_goals"]
    X_cal = val_df[feature_cols].iloc[cal_slice] if cal_slice.stop else val_df[feature_cols].iloc[0:0]
    y_cal = val_df["target_outcome"].iloc[cal_slice] if cal_slice.stop else val_df["target_outcome"].iloc[0:0]
    X_eval = val_df[feature_cols].iloc[eval_slice]
    y_eval = val_df["target_outcome"].iloc[eval_slice]
    if len(X_eval) == 0:
        return float("inf")
    from src.config import get_config as _get_cfg_tune
    from src.feature_engineering import recency_weights as _recency_weights_tune

    _sw = _recency_weights_tune(
        train_df["date"] if "date" in train_df.columns else None,
        half_life_days=float(_get_cfg_tune()["model"].get("recency_half_life_days", 730)),
    )
    model = MatchPredictorModel(model_type).apply_params(params)
    model.fit(X_train, y_outcome, y_hg, y_ag, sample_weight=_sw)
    if len(X_cal) > 0:
        try:
            model.calibrate_temperature(X_cal, y_cal)
        except Exception:
            model.calibration_temperature = 1.0
    probas = model.predict_outcome_proba(X_eval)
    if metric == "log_loss":
        eps = 1e-15
        clipped = np.clip(probas, eps, 1 - eps)
        y = np.asarray(y_eval.values, dtype=int)
        return float(-np.mean(np.log(clipped[np.arange(len(y)), y])))
    if metric != "rps":
        raise ValueError(f"Unknown tuning metric {metric!r}; use 'rps' or 'log_loss'.")
    return float(ranked_probability_score(y_eval, probas))


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


@contextlib.contextmanager
def _study_baseline() -> Iterator[None]:
    """Hides any persisted joint receipt from serving accessors.

    Trial evaluation must start from baseline serving behavior (config +
    constants). Without this, a previous record leaks into evaluation
    through get_draw_rule/blend_weights/get_scoreline_defaults and two
    runs of the same study diverge. Restores the path afterwards.
    """
    global TUNING_PATH
    try:
        with open(TUNING_PATH, "r", encoding="utf-8") as f:
            record = json.load(f) or {}
    except (OSError, ValueError):
        record = {}
    baseline = {k: v for k, v in (record if isinstance(record, dict) else {}).items()
                if k != "joint"}
    tmp = tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False, encoding="utf-8")
    try:
        json.dump(baseline, tmp, indent=2)
        tmp.close()
        previous, TUNING_PATH = TUNING_PATH, tmp.name
        try:
            yield
        finally:
            TUNING_PATH = previous
    finally:
        try:
            os.remove(tmp.name)
        except OSError:
            pass


def get_joint_params(path: Optional[str] = None) -> Dict[str, Any]:
    """Reads the joint receipt params from tuning.json ({} when absent).

    Small file, read per call (no cache) so serving never goes stale and
    tests need no cache invalidation. Missing file degrades to {} and every
    consumer falls back to config/constants.
    """
    try:
        with open(path or TUNING_PATH, "r", encoding="utf-8") as f:
            record = json.load(f) or {}
        params = (record.get("joint", {}) or {}).get("params", {})
        return dict(params) if isinstance(params, dict) else {}
    except (OSError, ValueError):
        return {}


def suggest_joint(trial) -> Dict[str, Any]:
    """Joint search space: draw rule, blend weights, scoreline shape."""
    from src.models import SCORELINE_DISPERSION_VALUES, SCORELINE_RHO_VALUES

    return {
        "draw_rule": {
            "market_margin": trial.suggest_float("market_margin", 0.02, 0.25),
            "market_min_prob": trial.suggest_float("market_min_prob", 0.15, 0.35),
            "no_market_margin": trial.suggest_float("no_market_margin", 0.02, 0.25),
            "no_market_min_prob": trial.suggest_float("no_market_min_prob", 0.15, 0.35),
        },
        "blend": {
            "blend_classifier": trial.suggest_float("blend_classifier", 0.0, 1.0),
            "blend_poisson": trial.suggest_float("blend_poisson", 0.0, 1.0),
            "blend_supremacy": trial.suggest_float("blend_supremacy", 0.0, 1.0),
        },
        "scoreline_theta": trial.suggest_categorical(
            "scoreline_theta", list(SCORELINE_RHO_VALUES)),
        "scoreline_dispersion": trial.suggest_categorical(
            "scoreline_dispersion", list(SCORELINE_DISPERSION_VALUES)),
    }


def evaluate_joint(
    joint_params: Dict[str, Any],
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    feature_cols: List[str],
) -> Dict[str, float]:
    """Scores one joint receipt on the disjoint evaluation slice.

    Fits the tuned-RF reference on train rows (temperature on the cal
    slice, mirroring the tree protocol), then applies the trial draw rule,
    blend weights, and scoreline shape exactly as serving would. Returns
    the joint error (RPS + scoreline cross-entropy + draw-decision error,
    all lower-better nats/rates documented as one scalar) with components.
    Trials whose eval draw share falls outside the admissibility band score
    inf: tuning must never reintroduce a never-calls-draws forecast.
    """
    from src.models import MatchPredictorModel, apply_temperature_scaling, favor_outcome_from_proba

    cal_slice, eval_slice = split_calibration_evaluation(len(val_df))
    X_train, y_outcome = train_df[feature_cols], train_df["target_outcome"]
    y_hg, y_ag = train_df["target_home_goals"], train_df["target_away_goals"]
    X_cal = val_df[feature_cols].iloc[cal_slice] if cal_slice.stop else val_df[feature_cols].iloc[0:0]
    y_cal = val_df["target_outcome"].iloc[cal_slice] if cal_slice.stop else val_df["target_outcome"].iloc[0:0]
    X_eval = val_df[feature_cols].iloc[eval_slice]
    y_eval = val_df["target_outcome"].iloc[eval_slice]
    if len(X_eval) == 0:
        return {"value": float("inf"), "rps": float("inf"),
                "scoreline_nll": float("inf"), "draw_error": float("inf")}
    from src.config import get_config as _get_cfg_tune
    from src.feature_engineering import recency_weights as _recency_weights_tune

    _sw = _recency_weights_tune(
        train_df["date"] if "date" in train_df.columns else None,
        half_life_days=float(_get_cfg_tune()["model"].get("recency_half_life_days", 730)),
    )
    model = MatchPredictorModel("rf").apply_params(get_tuned_params("rf"))
    model.fit(X_train, y_outcome, y_hg, y_ag, sample_weight=_sw)
    if len(X_cal) > 0:
        try:
            model.calibrate_temperature(X_cal, y_cal)
        except Exception:
            model.calibration_temperature = 1.0

    rule = (joint_params.get("draw_rule") or {})
    blend = (joint_params.get("blend") or {})
    weights = np.array([
        float(blend.get("blend_classifier", 0.6)),
        float(blend.get("blend_poisson", 0.0)),
        float(blend.get("blend_supremacy", 0.4)),
    ])
    weights = weights / weights.sum() if weights.sum() > 0 else np.array([0.6, 0.0, 0.4])
    sources = model._source_probas(X_eval)
    probas = (weights[0] * sources["clf"] + weights[1] * sources["poisson"]
              + weights[2] * sources["supremacy"])
    probas = probas / np.maximum(probas.sum(axis=1, keepdims=True), 1e-12)
    if model.calibration_method == "temperature" and model.calibration_temperature != 1.0:
        probas = apply_temperature_scaling(probas, model.calibration_temperature)
    rps = float(ranked_probability_score(y_eval, probas))

    missing = (X_eval["odds_missing"].to_numpy(dtype=float)
               if "odds_missing" in X_eval.columns else np.zeros(len(X_eval)))
    preds = np.array([favor_outcome_from_proba(p, odds_missing=m, rule=rule)
                      for p, m in zip(probas, missing)])
    draw_error = float(np.mean(preds != np.asarray(y_eval.values, dtype=int)))
    draw_share = float(np.mean(preds == 1)) if len(preds) else 0.0

    lam_h, lam_a = model.predict_expected_goals(X_eval, apply_correction=False)
    grids, _ = model.compute_poisson_grid(
        lam_h, lam_a, max_goals=10,
        rho=joint_params.get("scoreline_theta", 0.11),
        dispersion=joint_params.get("scoreline_dispersion", 1.0),
    )
    rows = np.arange(len(X_eval))
    true_h = np.clip(np.asarray(val_df["target_home_goals"].iloc[eval_slice], dtype=int).ravel(), 0, 10)
    true_a = np.clip(np.asarray(val_df["target_away_goals"].iloc[eval_slice], dtype=int).ravel(), 0, 10)
    nll = float(-np.mean(np.log(np.maximum(grids[rows, true_h, true_a], 1e-12))))
    components = {"rps": rps, "scoreline_nll": nll, "draw_error": draw_error,
                  "draw_share": draw_share}
    if not draw_share_admissible(draw_share):
        return {"value": float("inf"), **components}
    return {"value": rps + nll + draw_error, **components}


def tune_joint(
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    feature_cols: List[str],
    n_trials: int = 40,
    seed: int = 42,
) -> Dict[str, Any]:
    """Runs one deterministic Optuna study over the joint receipt space.

    The whole study evaluates under baseline serving behavior: a persisted
    joint receipt is hidden from the serving accessors for the run, so a
    previous record can never leak into trial evaluation and reruns from
    the same code and data are identical.
    """
    import optuna

    sampler = optuna.samplers.TPESampler(seed=seed)
    study = optuna.create_study(direction="minimize", sampler=sampler)

    def _objective(trial) -> float:
        return evaluate_joint(
            suggest_joint(trial), train_df, val_df, feature_cols)["value"]

    with _study_baseline():
        study.optimize(_objective, n_trials=max(1, n_trials))
    best = study.best_trial
    return {
        "params": suggest_joint_to_record(best),
        "value": float(study.best_value),
        "components": {k: float(v) for k, v in _joint_components(
            best, train_df, val_df, feature_cols).items() if k != "value"},
        "trials": len(study.trials),
        "metric": "joint_nll",
        "seed": seed,
    }


def suggest_joint_to_record(trial) -> Dict[str, Any]:
    """Reshapes flat trial params into the receipt structure."""
    flat = dict(trial.params)
    return {
        "draw_rule": {k: float(flat[k]) for k in JOINT_DRAW_KEYS},
        "blend": {k: float(flat[k]) for k in JOINT_BLEND_KEYS},
        "scoreline_theta": float(flat["scoreline_theta"]),
        "scoreline_dispersion": float(flat["scoreline_dispersion"]),
    }


def _joint_components(best, train_df, val_df, feature_cols) -> Dict[str, float]:
    return evaluate_joint(
        suggest_joint_to_record(best), train_df, val_df, feature_cols)


def run_joint_tuning(
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    feature_cols: List[str],
    n_trials: int = 40,
    seed: int = 42,
    persist: bool = True,
) -> Dict[str, Any]:
    """Tunes the joint receipt, merging it into models/tuning.json.

    The existing tree section is preserved; only the "joint" key is set.
    """
    logger.info("Tuning joint receipt (%d trials)...", n_trials)
    outcome = tune_joint(train_df, val_df, feature_cols,
                         n_trials=n_trials, seed=seed)
    logger.info("  - best joint_nll=%.4f params=%s", outcome["value"], outcome["params"])
    results: Dict[str, Any] = dict(outcome)
    if persist:
        os.makedirs(MODELS_DIR, exist_ok=True)
        try:
            with open(TUNING_PATH, "r", encoding="utf-8") as f:
                record = json.load(f) or {}
        except (OSError, ValueError):
            record = {}
        if not isinstance(record, dict):
            record = {}
        record["joint"] = outcome
        with open(TUNING_PATH, "w", encoding="utf-8") as f:
            json.dump(record, f, indent=2)
        logger.info("Joint receipt saved to %s", TUNING_PATH)
    return results


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
    parser.add_argument(
        "--joint", action="store_true",
        help="Tune the joint receipt (draw rule, blend weights, scoreline shape) instead of tree hyperparameters.",
    )
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
    if args.joint:
        run_joint_tuning(train_df, val_df, cols, n_trials=args.trials,
                         seed=args.seed, persist=not args.no_persist)
        return 0
    run_tuning(train_df, val_df, cols, n_trials=args.trials,
               seed=args.seed, metric=args.metric, persist=not args.no_persist)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
