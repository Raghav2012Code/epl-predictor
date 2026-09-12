"""Machine learning models module for Premier League outcome and scoreline forecasting.

Implements Random Forest and XGBoost classifiers (Win / Draw / Loss)
and goal regressors (Home Goals / Away Goals) with side-by-side benchmarking.
"""

from __future__ import annotations

import math
import os
from typing import Any, Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from xgboost import XGBClassifier, XGBRegressor

# Outcome label mapping: 0 -> Away Win (A), 1 -> Draw (D), 2 -> Home Win (H)
OUTCOME_NAMES = {0: "Away Win", 1: "Draw", 2: "Home Win"}
OUTCOME_CODES = {0: "A", 1: "D", 2: "H"}


class MatchPredictorModel:
    """Wrapper encapsulating an outcome classifier and home/away goal regressors."""

    def __init__(self, model_type: str = "xgboost"):
        self.model_type = model_type.lower()
        if self.model_type == "rf":
            self.classifier = RandomForestClassifier(
                n_estimators=300,
                max_depth=8,
                min_samples_leaf=4,
                class_weight="balanced",
                random_state=42,
                n_jobs=-1,
            )
            self.home_regressor = RandomForestRegressor(
                n_estimators=250,
                max_depth=6,
                min_samples_leaf=4,
                random_state=42,
                n_jobs=-1,
            )
            self.away_regressor = RandomForestRegressor(
                n_estimators=250,
                max_depth=6,
                min_samples_leaf=4,
                random_state=42,
                n_jobs=-1,
            )
        else:  # xgboost
            self.classifier = XGBClassifier(
                n_estimators=250,
                max_depth=4,
                learning_rate=0.03,
                subsample=0.8,
                colsample_bytree=0.8,
                objective="multi:softprob",
                num_class=3,
                eval_metric="mlogloss",
                random_state=42,
                n_jobs=-1,
            )
            self.home_regressor = XGBRegressor(
                n_estimators=200,
                max_depth=3,
                learning_rate=0.03,
                subsample=0.8,
                colsample_bytree=0.8,
                objective="count:poisson",
                random_state=42,
                n_jobs=-1,
            )
            self.away_regressor = XGBRegressor(
                n_estimators=200,
                max_depth=3,
                learning_rate=0.03,
                subsample=0.8,
                colsample_bytree=0.8,
                objective="count:poisson",
                random_state=42,
                n_jobs=-1,
            )

        self.feature_names: List[str] = []
        self.is_fitted: bool = False
        # Temperature scaling for calibrated probabilities (fit on validation).
        # T > 1 softens overconfident peaks; T == 1.0 means uncalibrated.
        self.calibration_temperature: float = 1.0
        # Multiplicative bias correction for expected goals (fit on training
        # means): counters systematic under/over-prediction of Poisson means.
        self.home_goal_correction: float = 1.0
        self.away_goal_correction: float = 1.0

    def fit(self, X: pd.DataFrame, y_outcome: pd.Series, y_hg: pd.Series, y_ag: pd.Series) -> MatchPredictorModel:
        """Fits the outcome classifier and both goal regressors."""
        self.feature_names = list(X.columns)
        self.classifier.fit(X, y_outcome)
        self.home_regressor.fit(X, y_hg)
        self.away_regressor.fit(X, y_ag)
        # Fit goal bias correction on training means (guarded, bounded).
        try:
            pred_h = np.maximum(0.05, np.asarray(self.home_regressor.predict(X), dtype=float))
            pred_a = np.maximum(0.05, np.asarray(self.away_regressor.predict(X), dtype=float))
            true_h = np.asarray(y_hg, dtype=float)
            true_a = np.asarray(y_ag, dtype=float)
            ch = float(np.mean(true_h) / max(1e-6, float(np.mean(pred_h))))
            ca = float(np.mean(true_a) / max(1e-6, float(np.mean(pred_a))))
            self.home_goal_correction = float(np.clip(ch, 0.8, 1.25))
            self.away_goal_correction = float(np.clip(ca, 0.8, 1.25))
        except Exception:
            self.home_goal_correction = 1.0
            self.away_goal_correction = 1.0
        self.is_fitted = True
        return self

    def calibrate_temperature(self, X_val: pd.DataFrame, y_val: pd.Series) -> float:
        """Fits temperature scaling on validation blended probabilities.

        Grid-searches T in [0.5, 3.0] to minimize multi-class log-loss.
        Returns the fitted temperature and stores it for inference.
        """
        probas = self.predict_outcome_proba(X_val, apply_temperature=False)
        y = np.asarray(y_val.values if hasattr(y_val, "values") else y_val, dtype=int)
        eps = 1e-15
        from src.config import get_config

        grid_cfg = get_config()["model"]
        gmin = float(grid_cfg.get("calibration_grid_min", 0.5))
        gmax = float(grid_cfg.get("calibration_grid_max", 3.0))
        gstep = float(grid_cfg.get("calibration_grid_step", 0.05))
        best_t, best_ll = 1.0, float("inf")
        grid = np.arange(gmin, gmax + gstep / 2, gstep)
        for t in [round(float(x), 2) for x in grid]:
            scaled = self._apply_temperature(probas, t)
            clipped = np.clip(scaled, eps, 1 - eps)
            ll = float(-np.mean(np.log(clipped[np.arange(len(y)), y])))
            if ll < best_ll:
                best_ll, best_t = ll, t
        self.calibration_temperature = float(best_t)
        return self.calibration_temperature

    @staticmethod
    def _apply_temperature(probas: np.ndarray, t: float) -> np.ndarray:
        """Applies temperature scaling: softmax(log(p)/T) row-wise."""
        t = max(0.05, float(t))
        logp = np.log(np.clip(probas, 1e-15, 1.0))
        scaled = logp / t
        scaled -= scaled.max(axis=1, keepdims=True)
        exp = np.exp(scaled)
        return exp / exp.sum(axis=1, keepdims=True)

    def compute_poisson_grid(self, h_exp: float, a_exp: float, max_goals: int = 10) -> Tuple[np.ndarray, np.ndarray]:
        """Calculates normalized bivariate Poisson probability grid and outcome probabilities.

        Applies Dixon-Coles adjustment for low scores (0-0, 1-0, 0-1, 1-1).
        """
        lh = max(0.2, float(h_exp))
        la = max(0.2, float(a_exp))
        # Dixon-Coles low-score dependence. rho must stay small and positive
        # (literature ~0.1); a negative value inverts the correction and
        # inflates draws while suppressing 1-0/0-1.
        rho = 0.11
        grid = np.zeros((max_goals + 1, max_goals + 1))

        for h in range(max_goals + 1):
            for a in range(max_goals + 1):
                p_h = (lh ** h) * math.exp(-lh) / math.factorial(h)
                p_a = (la ** a) * math.exp(-la) / math.factorial(a)
                tau = 1.0
                if h == 0 and a == 0:
                    tau = 1.0 - (lh * la * rho)
                elif h == 0 and a == 1:
                    tau = 1.0 + (lh * rho)
                elif h == 1 and a == 0:
                    tau = 1.0 + (la * rho)
                elif h == 1 and a == 1:
                    tau = 1.0 - rho
                grid[h, a] = max(0.0, tau) * p_h * p_a

        tot = grid.sum()
        if tot > 0:
            grid /= tot

        p_home = float(np.sum(np.tril(grid, -1)))
        p_draw = float(np.sum(np.diag(grid)))
        p_away = float(np.sum(np.triu(grid, 1)))
        return grid, np.array([p_away, p_draw, p_home])

    def predict_outcome_proba(self, X: pd.DataFrame, apply_temperature: bool = True) -> np.ndarray:
        """Returns calibrated probability matrix of shape (N, 3): [p_away, p_draw, p_home].

        Blends multi-class tree probabilities with count Poisson probabilities,
        then applies fitted temperature scaling (if calibrated).
        """
        clf_probas = self.classifier.predict_proba(X)
        exp_hg, exp_ag = self.predict_expected_goals(X)

        from src.config import get_config

        blend_cfg = get_config()["model"]
        w_clf = float(blend_cfg.get("blend_classifier", 0.60))
        w_poiss = float(blend_cfg.get("blend_poisson", 0.40))

        blended = np.zeros_like(clf_probas)
        for i in range(len(X)):
            _, p_poiss = self.compute_poisson_grid(exp_hg[i], exp_ag[i])
            p_comb = w_clf * clf_probas[i] + w_poiss * p_poiss
            p_comb /= p_comb.sum()
            blended[i] = p_comb

        if apply_temperature and self.calibration_temperature != 1.0:
            blended = self._apply_temperature(blended, self.calibration_temperature)
        return blended

    def predict_expected_goals(self, X: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Returns bias-corrected expected float goals (expected_hg, expected_ag)."""
        exp_hg = np.maximum(0.0, self.home_regressor.predict(X)) * self.home_goal_correction
        exp_ag = np.maximum(0.0, self.away_regressor.predict(X)) * self.away_goal_correction
        return exp_hg, exp_ag

    def predict_scoreline(self, X: pd.DataFrame) -> List[Tuple[int, int]]:
        """Forecasts integer scoreline for each match in X using Poisson mode argmax.

        Selects the highest-probability joint scoreline (h, a) consistent with
        the blended outcome argmax, so the scoreline always agrees with
        ``predict_outcome_proba``. This eliminates forced 2-1 mode collapse
        while keeping probabilities and predicted outcomes consistent.
        """
        exp_hg, exp_ag = self.predict_expected_goals(X)
        probas = self.predict_outcome_proba(X)

        scorelines: List[Tuple[int, int]] = []
        # 0-10 covers >99.9% of Poisson mass for EPL means (<3.0); 0-6
        # truncated high-scoring tails and biased outcome probs after renorm.
        max_goals = 10

        for i in range(len(X)):
            grid, _ = self.compute_poisson_grid(exp_hg[i], exp_ag[i], max_goals=max_goals)
            # Favored outcome is always the blended probability argmax:
            # 0: Away, 1: Draw, 2: Home. No separate draw-boost rule here so
            # pipeline `predicted_outcome` (derived from probas) stays in sync.
            fav_outcome = int(np.argmax(probas[i]))

            # Select best scoreline matching favored outcome
            best_s = (1, 1)
            best_p = -1.0

            for h in range(max_goals + 1):
                for a in range(max_goals + 1):
                    cond = (h > a) if fav_outcome == 2 else ((h == a) if fav_outcome == 1 else (h < a))
                    if cond and grid[h, a] > best_p:
                        best_p = grid[h, a]
                        best_s = (h, a)

            scorelines.append(best_s)

        return scorelines

    def get_feature_importances(self) -> pd.Series:
        """Extracts normalized feature importances from the outcome classifier."""
        if hasattr(self.classifier, "feature_importances_"):
            fi = self.classifier.feature_importances_
        else:
            fi = np.zeros(len(self.feature_names))
        return pd.Series(fi, index=self.feature_names).sort_values(ascending=False)

    def save(self, filepath: str) -> str:
        """Serializes fitted model artifacts, regressors, and metadata to disk using joblib."""
        if not self.is_fitted:
            raise ValueError("Cannot save an unfitted MatchPredictorModel.")
        os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
        payload = {
            "model_type": self.model_type,
            "classifier": self.classifier,
            "home_regressor": self.home_regressor,
            "away_regressor": self.away_regressor,
            "feature_names": self.feature_names,
            "is_fitted": self.is_fitted,
            "calibration_temperature": self.calibration_temperature,
            "home_goal_correction": self.home_goal_correction,
            "away_goal_correction": self.away_goal_correction,
        }
        joblib.dump(payload, filepath, compress=3)
        return filepath

    @classmethod
    def load(cls, filepath: str) -> MatchPredictorModel:
        """Loads a serialized MatchPredictorModel checkpoint from disk."""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Model checkpoint not found at: {filepath}")
        payload = joblib.load(filepath)
        instance = cls(payload["model_type"])
        instance.classifier = payload["classifier"]
        instance.home_regressor = payload["home_regressor"]
        instance.away_regressor = payload["away_regressor"]
        instance.feature_names = payload["feature_names"]
        instance.is_fitted = payload["is_fitted"]
        # Backward-compatible: checkpoints saved before calibration default to 1.0.
        instance.calibration_temperature = float(payload.get("calibration_temperature", 1.0))
        instance.home_goal_correction = float(payload.get("home_goal_correction", 1.0))
        instance.away_goal_correction = float(payload.get("away_goal_correction", 1.0))
        return instance


def train_and_benchmark_models(
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    feature_cols: List[str],
) -> Tuple[Dict[str, MatchPredictorModel], Dict[str, Dict[str, Any]]]:
    """Trains both Random Forest and XGBoost models on train_df and benchmarks on val_df."""
    X_train = train_df[feature_cols]
    y_train_outcome = train_df["target_outcome"]
    y_train_hg = train_df["target_home_goals"]
    y_train_ag = train_df["target_away_goals"]

    X_val = val_df[feature_cols]
    y_val_outcome = val_df["target_outcome"]
    y_val_hg = val_df["target_home_goals"]
    y_val_ag = val_df["target_away_goals"]

    models: Dict[str, MatchPredictorModel] = {
        "Random Forest": MatchPredictorModel("rf"),
        "XGBoost": MatchPredictorModel("xgboost"),
    }

    metrics: Dict[str, Dict[str, Any]] = {}

    for name, model in models.items():
        model.fit(X_train, y_train_outcome, y_train_hg, y_train_ag)
        # Keep calibration rows separate from benchmark rows.  Fitting a
        # temperature on the same validation slice used for headline metrics
        # makes the reported log-loss optimistic.
        calibration_n = int(len(X_val) * 0.5)
        if len(X_val) >= 8 and calibration_n >= 3 and len(X_val) - calibration_n >= 3:
            calibration_slice = slice(0, calibration_n)
            evaluation_slice = slice(calibration_n, None)
        else:
            calibration_slice = slice(0, 0)
            evaluation_slice = slice(0, None)
        if calibration_slice.stop:
            try:
                model.calibrate_temperature(X_val.iloc[calibration_slice], y_val_outcome.iloc[calibration_slice])
            except Exception:
                model.calibration_temperature = 1.0

        # Predictions on validation (calibrated)
        eval_X = X_val.iloc[evaluation_slice]
        eval_y_outcome = y_val_outcome.iloc[evaluation_slice]
        eval_y_hg = y_val_hg.iloc[evaluation_slice]
        eval_y_ag = y_val_ag.iloc[evaluation_slice]
        val_proba = model.predict_outcome_proba(eval_X)
        val_preds = np.argmax(val_proba, axis=1)
        exp_hg, exp_ag = model.predict_expected_goals(eval_X)
        pred_scores = model.predict_scoreline(eval_X)
        all_pred_scores = model.predict_scoreline(X_val)
        pred_hg = np.array([s[0] for s in pred_scores])
        pred_ag = np.array([s[1] for s in pred_scores])

        # Classification metrics
        acc = float(np.mean(val_preds == eval_y_outcome.values))

        # Multi-class log loss
        eps = 1e-15
        clipped_proba = np.clip(val_proba, eps, 1 - eps)
        # One-hot true outcomes
        y_val_onehot = np.zeros_like(val_proba)
        for row_idx, true_cls in enumerate(eval_y_outcome.values):
            y_val_onehot[row_idx, int(true_cls)] = 1.0
        log_loss = float(-np.mean(np.sum(y_val_onehot * np.log(clipped_proba), axis=1)))

        # Macro F1
        f1_scores = []
        for c in [0, 1, 2]:
            tp = np.sum((val_preds == c) & (eval_y_outcome.values == c))
            fp = np.sum((val_preds == c) & (eval_y_outcome.values != c))
            fn = np.sum((val_preds != c) & (eval_y_outcome.values == c))
            prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
            rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
            f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0
            f1_scores.append(f1)
        macro_f1 = float(np.mean(f1_scores))

        # Goal prediction metrics: MAE on continuous expected goals
        # (regressor quality). Integer scorelines are evaluated separately via
        # exact-score / within-1-goal accuracy below.
        mae_hg = float(np.mean(np.abs(exp_hg - eval_y_hg.values)))
        mae_ag = float(np.mean(np.abs(exp_ag - eval_y_ag.values)))
        avg_mae = (mae_hg + mae_ag) / 2.0

        exact_score_acc = float(np.mean((pred_hg == eval_y_hg.values) & (pred_ag == eval_y_ag.values)))
        within_1_goal = float(
            np.mean((np.abs(pred_hg - eval_y_hg.values) <= 1) & (np.abs(pred_ag - eval_y_ag.values) <= 1))
        )

        metrics[name] = {
            "accuracy": acc,
            "log_loss": log_loss,
            "macro_f1": macro_f1,
            "mae_home_goals": mae_hg,
            "mae_away_goals": mae_ag,
            "avg_goal_mae": avg_mae,
            "exact_score_acc": exact_score_acc,
            "within_1_goal_acc": within_1_goal,
            "val_preds": val_preds,
            "val_proba": val_proba,
            # Keep the historical public shape for callers that use this as a
            # validation-length diagnostic; metrics themselves use the
            # calibration-independent evaluation tail below.
            "pred_scores": all_pred_scores,
            "eval_pred_scores": pred_scores,
            "feature_importances": model.get_feature_importances(),
            "calibration_temperature": model.calibration_temperature,
            "home_goal_correction": model.home_goal_correction,
            "away_goal_correction": model.away_goal_correction,
            "eval_y_outcome": eval_y_outcome.values,
            "eval_y_home_goals": eval_y_hg.values,
            "eval_y_away_goals": eval_y_ag.values,
        }

    return models, metrics
