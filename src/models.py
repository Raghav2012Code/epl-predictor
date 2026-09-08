"""Machine learning models module for Premier League outcome and scoreline forecasting.

Implements Random Forest and XGBoost classifiers (Win / Draw / Loss)
and goal regressors (Home Goals / Away Goals) with side-by-side benchmarking.
"""

from __future__ import annotations

from typing import Any, Dict, List, Tuple

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

    def predict_outcome_proba(self, X: pd.DataFrame) -> np.ndarray:
        """Returns probability matrix of shape (N, 3): [p_away, p_draw, p_home]."""
        return self.classifier.predict_proba(X)

    def predict_expected_goals(self, X: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Returns expected float goals (expected_hg, expected_ag)."""
        exp_hg = np.maximum(0.0, self.home_regressor.predict(X))
        exp_ag = np.maximum(0.0, self.away_regressor.predict(X))
        return exp_hg, exp_ag

    def predict_scoreline(self, X: pd.DataFrame) -> List[Tuple[int, int]]:
        """Forecasts integer scoreline for each match in X.

        Reconciles expected continuous goals with predicted class probabilities.
        """
        exp_hg, exp_ag = self.predict_expected_goals(X)
        probas = self.predict_outcome_proba(X)

        scorelines: List[Tuple[int, int]] = []
        for i in range(len(X)):
            h_exp = exp_hg[i]
            a_exp = exp_ag[i]
            p_away, p_draw, p_home = probas[i]

            # Primary integer goal estimates
            raw_h = int(np.round(h_exp))
            raw_a = int(np.round(a_exp))

            # Alignment with predicted outcome
            most_likely_outcome = int(np.argmax(probas[i]))  # 0: Away, 1: Draw, 2: Home
            if most_likely_outcome == 1:  # Draw favored
                # If goals differ, bring them to the closest realistic draw score (1-1 or 0-0 or 2-2)
                avg_g = int(np.round((h_exp + a_exp) / 2))
                raw_h = min(avg_g, 2)
                raw_a = raw_h
            elif most_likely_outcome == 2:  # Home win favored
                if raw_h <= raw_a:
                    raw_h = max(raw_a + 1, 1)
            elif most_likely_outcome == 0:  # Away win favored
                if raw_a <= raw_h:
                    raw_a = max(raw_h + 1, 1)

            scorelines.append((raw_h, raw_a))

        return scorelines

    def get_feature_importances(self) -> pd.Series:
        """Extracts normalized feature importances from the outcome classifier."""
        if hasattr(self.classifier, "feature_importances_"):
            fi = self.classifier.feature_importances_
        else:
            fi = np.zeros(len(self.feature_names))
        return pd.Series(fi, index=self.feature_names).sort_values(ascending=False)


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

        # Goal prediction metrics
        mae_hg = float(np.mean(np.abs(pred_hg - y_val_hg.values)))
        mae_ag = float(np.mean(np.abs(pred_ag - y_val_ag.values)))
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
