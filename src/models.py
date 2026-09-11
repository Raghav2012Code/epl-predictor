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

    def fit(self, X: pd.DataFrame, y_outcome: pd.Series, y_hg: pd.Series, y_ag: pd.Series) -> MatchPredictorModel:
        """Fits the outcome classifier and both goal regressors."""
        self.feature_names = list(X.columns)
        self.classifier.fit(X, y_outcome)
        self.home_regressor.fit(X, y_hg)
        self.away_regressor.fit(X, y_ag)
        self.is_fitted = True
        return self

    def compute_poisson_grid(self, h_exp: float, a_exp: float, max_goals: int = 6) -> Tuple[np.ndarray, np.ndarray]:
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

    def predict_outcome_proba(self, X: pd.DataFrame) -> np.ndarray:
        """Returns calibrated probability matrix of shape (N, 3): [p_away, p_draw, p_home].

        Blends multi-class tree probabilities with count Poisson probabilities for optimal calibration.
        """
        clf_probas = self.classifier.predict_proba(X)
        exp_hg, exp_ag = self.predict_expected_goals(X)

        blended = np.zeros_like(clf_probas)
        for i in range(len(X)):
            _, p_poiss = self.compute_poisson_grid(exp_hg[i], exp_ag[i])
            p_comb = 0.60 * clf_probas[i] + 0.40 * p_poiss
            p_comb /= p_comb.sum()
            blended[i] = p_comb

        return blended

    def predict_expected_goals(self, X: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Returns expected float goals (expected_hg, expected_ag)."""
        exp_hg = np.maximum(0.0, self.home_regressor.predict(X))
        exp_ag = np.maximum(0.0, self.away_regressor.predict(X))
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
        max_goals = 6

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

        # Predictions on validation
        val_proba = model.predict_outcome_proba(X_val)
        val_preds = np.argmax(val_proba, axis=1)
        exp_hg, exp_ag = model.predict_expected_goals(X_val)
        pred_scores = model.predict_scoreline(X_val)
        pred_hg = np.array([s[0] for s in pred_scores])
        pred_ag = np.array([s[1] for s in pred_scores])

        # Classification metrics
        acc = float(np.mean(val_preds == y_val_outcome.values))

        # Multi-class log loss
        eps = 1e-15
        clipped_proba = np.clip(val_proba, eps, 1 - eps)
        # One-hot true outcomes
        y_val_onehot = np.zeros_like(val_proba)
        for row_idx, true_cls in enumerate(y_val_outcome.values):
            y_val_onehot[row_idx, int(true_cls)] = 1.0
        log_loss = float(-np.mean(np.sum(y_val_onehot * np.log(clipped_proba), axis=1)))

        # Macro F1
        f1_scores = []
        for c in [0, 1, 2]:
            tp = np.sum((val_preds == c) & (y_val_outcome.values == c))
            fp = np.sum((val_preds == c) & (y_val_outcome.values != c))
            fn = np.sum((val_preds != c) & (y_val_outcome.values == c))
            prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
            rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
            f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0
            f1_scores.append(f1)
        macro_f1 = float(np.mean(f1_scores))

        # Goal prediction metrics: MAE on continuous expected goals
        # (regressor quality). Integer scorelines are evaluated separately via
        # exact-score / within-1-goal accuracy below.
        mae_hg = float(np.mean(np.abs(exp_hg - y_val_hg.values)))
        mae_ag = float(np.mean(np.abs(exp_ag - y_val_ag.values)))
        avg_mae = (mae_hg + mae_ag) / 2.0

        exact_score_acc = float(np.mean((pred_hg == y_val_hg.values) & (pred_ag == y_val_ag.values)))
        within_1_goal = float(
            np.mean((np.abs(pred_hg - y_val_hg.values) <= 1) & (np.abs(pred_ag - y_val_ag.values) <= 1))
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
            "pred_scores": pred_scores,
            "feature_importances": model.get_feature_importances(),
        }

    return models, metrics
