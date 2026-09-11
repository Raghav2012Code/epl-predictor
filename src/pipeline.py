"""Main orchestration pipeline for data loading, training, benchmarking, and forecasting.

Provides end-to-end execution and exports predictions for the 2026/2027 Premier League season.
"""

from __future__ import annotations

import os
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from tabulate import tabulate

from src.data_loader import (
    load_2026_2027_fixtures,
    load_historical_stats,
    standardize_team_name,
)
from src.evaluate import (
    plot_confusion_matrices,
    plot_feature_importance,
    plot_goal_error_distribution,
    plot_metrics_comparison,
)
from src.feature_engineering import (
    build_engineered_dataset,
    build_feature_context,
    build_fixture_features,
    get_feature_column_names,
)
from src.models import (
    OUTCOME_CODES,
    OUTCOME_NAMES,
    MatchPredictorModel,
    train_and_benchmark_models,
)

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
DEFAULT_MODEL_PATH = os.path.join(MODELS_DIR, "production_model.joblib")


class PremierLeaguePredictionPipeline:
    """End-to-end management pipeline for training, evaluation, and inference."""

    def __init__(self):
        self.raw_historical: Optional[pd.DataFrame] = None
        self.engineered_df: Optional[pd.DataFrame] = None
        self.fixtures_2026_2027: Optional[pd.DataFrame] = None
        self.feature_cols: List[str] = get_feature_column_names()
        self.models: Dict[str, MatchPredictorModel] = {}
        self.metrics: Dict[str, Dict[str, Any]] = {}
        self.best_model_name: str = "XGBoost"
        self.best_model: Optional[MatchPredictorModel] = None

    def load_data(self, force_download: bool = False) -> PremierLeaguePredictionPipeline:
        """Loads historical match data and upcoming fixtures without running full dataset engineering."""
        if self.raw_historical is None:
            self.raw_historical = load_historical_stats(force_download=force_download)
        if self.fixtures_2026_2027 is None:
            self.fixtures_2026_2027 = load_2026_2027_fixtures()
        return self

    def prepare_data(self, force_download: bool = False) -> PremierLeaguePredictionPipeline:
        """Loads historical stats and 2026/27 fixtures and performs feature engineering."""
        print("[1/5] Loading historical match data and 2026/2027 fixtures...")
        self.load_data(force_download=force_download)

        print(f"      - Loaded {len(self.raw_historical)} historical matches across 6 seasons.")
        print(f"      - Loaded {len(self.fixtures_2026_2027)} matches for 2026/2027 Premier League.")

        print("[2/5] Engineering rolling form, venue splits, and head-to-head metrics...")
        self.engineered_df = build_engineered_dataset(self.raw_historical)
        print(f"      - Engineered dataset shape: {self.engineered_df.shape} ({len(self.feature_cols)} features).")
        return self

    def train_and_evaluate(self, split_date_str: str = "2024-01-01") -> Dict[str, Any]:
        """Performs time-series cross-validation split, fits RF & XGBoost, and generates plots."""
        if self.engineered_df is None:
            self.prepare_data()

        print(f"[3/5] Benchmarking Random Forest vs XGBoost with time-series split (cutoff: {split_date_str})...")
        split_date = pd.to_datetime(split_date_str)
        train_mask = self.engineered_df["date"] < split_date
        val_mask = self.engineered_df["date"] >= split_date

        train_df = self.engineered_df[train_mask].copy()
        val_df = self.engineered_df[val_mask].copy()

        print(f"      - Training matches: {len(train_df)} | Validation matches: {len(val_df)}")

        self.models, self.metrics = train_and_benchmark_models(train_df, val_df, self.feature_cols)

        # Best model: primary key is calibrated multi-class log-loss (lower),
        # tie-broken by accuracy (higher) then goal MAE (lower). This matches
        # the classifier objective instead of an arbitrary acc-MAE blend.
        def _rank(m: Dict[str, Any]) -> tuple:
            return (m["log_loss"], -m["accuracy"], m["avg_goal_mae"])

        rf_rank = _rank(self.metrics["Random Forest"])
        xgb_rank = _rank(self.metrics["XGBoost"])
        self.best_model_name = "XGBoost" if xgb_rank <= rf_rank else "Random Forest"
        self.best_model = self.models[self.best_model_name]

        print(f"      - Random Forest Accuracy: {self.metrics['Random Forest']['accuracy']:.3f} | LogLoss: {self.metrics['Random Forest']['log_loss']:.3f} | Goal MAE: {self.metrics['Random Forest']['avg_goal_mae']:.3f}")
        print(f"      - XGBoost Accuracy:       {self.metrics['XGBoost']['accuracy']:.3f} | LogLoss: {self.metrics['XGBoost']['log_loss']:.3f} | Goal MAE: {self.metrics['XGBoost']['avg_goal_mae']:.3f}")
        print(f"      -> Best Performing Model Selected: {self.best_model_name} (lowest log-loss)")

        # Generate Matplotlib visualizations
        print("[4/5] Generating Matplotlib diagnostic visualization suite...")
        y_val_outcome = val_df["target_outcome"].values
        y_val_hg = val_df["target_home_goals"].values
        y_val_ag = val_df["target_away_goals"].values

        plot_feature_importance(
            self.metrics["Random Forest"]["feature_importances"],
            self.metrics["XGBoost"]["feature_importances"],
        )
        plot_confusion_matrices(
            y_val_outcome,
            self.metrics["Random Forest"]["val_preds"],
            self.metrics["XGBoost"]["val_preds"],
        )
        plot_metrics_comparison(self.metrics)
        plot_goal_error_distribution(
            y_val_hg,
            y_val_ag,
            self.metrics[self.best_model_name]["pred_scores"],
        )
        print("      - Diagnostic charts saved to 'visuals/' directory.")

        # Re-train best model on 100% of historical data for maximum forecasting accuracy
        print("      - Refitting best model on full historical dataset for upcoming forecasts...")
        self.best_model.fit(
            self.engineered_df[self.feature_cols],
            self.engineered_df["target_outcome"],
            self.engineered_df["target_home_goals"],
            self.engineered_df["target_away_goals"],
        )
        self.save_model(DEFAULT_MODEL_PATH)

        return self.metrics

    def save_model(self, filepath: Optional[str] = None) -> str:
        """Saves the current fitted production model checkpoint to disk."""
        if self.best_model is None:
            raise ValueError("No fitted production model available to save.")
        path = filepath or DEFAULT_MODEL_PATH
        self.best_model.save(path)
        print(f"      - Model checkpoint saved to: {path}")
        return path

    def load_model(self, filepath: Optional[str] = None) -> MatchPredictorModel:
        """Loads a production model checkpoint from disk."""
        path = filepath or DEFAULT_MODEL_PATH
        self.best_model = MatchPredictorModel.load(path)
        self.best_model_name = "Random Forest" if self.best_model.model_type == "rf" else "XGBoost"
        expected = set(get_feature_column_names())
        loaded = set(self.best_model.feature_names)
        if loaded != expected:
            print(f"[warn] Checkpoint feature set differs from code ({len(loaded)} vs {len(expected)}). "
                  f"Missing: {sorted(expected - loaded)[:5]}, Extra: {sorted(loaded - expected)[:5]}. "
                  "Consider retraining with --retrain.")
        self.feature_cols = self.best_model.feature_names
        return self.best_model

    def forecast_2026_2027_season(self) -> pd.DataFrame:
        """Forecasts all 380 fixtures for the 2026/2027 season and exports results."""
        if self.best_model is None:
            self.train_and_evaluate()

        print("[5/5] Generating match outcome probabilities and scoreline forecasts for 2026/2027...")
        if self.raw_historical is None or self.raw_historical.empty:
            raise ValueError("Historical data is empty; call prepare_data() before forecasting.")
        if self.fixtures_2026_2027 is None or self.fixtures_2026_2027.empty:
            raise ValueError("2026/2027 fixtures are empty; call prepare_data() before forecasting.")
        fixtures = self.fixtures_2026_2027.copy().sort_values(by=["date", "gameweek"]).reset_index(drop=True)
        rolling_history = self.raw_historical.copy().sort_values(by="date").reset_index(drop=True)
        # Historical means for unobserved in-play stats of played 2026/27
        # matches (shots/corners/possession are not in openfootball feeds).
        hist_means = {
            c: float(rolling_history[c].mean())
            for c in ["home_shots", "away_shots", "home_shots_target", "away_shots_target",
                      "home_corners", "away_corners", "home_possession", "away_possession"]
            if c in rolling_history.columns
        }
        feature_context = build_feature_context(rolling_history)

        predictions: List[Dict[str, Any]] = []

        for _, fix in fixtures.iterrows():
            m_date = fix["date"]
            ht = fix["home_team"]
            at = fix["away_team"]
            gw = fix["gameweek"]
            raw_time = fix.get("time", "")
            m_time = raw_time if isinstance(raw_time, str) and raw_time.strip() else "15:00"

            # Feature vector using precomputed context for sub-millisecond extraction
            X_match = build_fixture_features(ht, at, m_date, rolling_history, precomputed_context=feature_context)

            probas = self.best_model.predict_outcome_proba(X_match)[0]  # [p_away, p_draw, p_home]
            p_away = float(probas[0])
            p_draw = float(probas[1])
            p_home = float(probas[2])

            pred_scores = self.best_model.predict_scoreline(X_match)[0]
            pred_hg, pred_ag = pred_scores

            # Favorite outcome is the blended probability argmax so it always
            # agrees with home/draw/away probs (scoreline is already
            # constrained to that outcome in predict_scoreline).
            fav_idx = int(np.argmax(probas))
            fav_outcome = "Away Win" if fav_idx == 0 else ("Draw" if fav_idx == 1 else "Home Win")

            pred_item = {
                "gameweek": gw,
                "date": m_date.strftime("%Y-%m-%d") if isinstance(m_date, datetime) or hasattr(m_date, "strftime") else str(m_date),
                "time": m_time,
                "home_team": ht,
                "away_team": at,
                "home_win_prob": round(p_home * 100, 1),
                "draw_prob": round(p_draw * 100, 1),
                "away_win_prob": round(p_away * 100, 1),
                "predicted_outcome": fav_outcome,
                "predicted_score": f"{pred_hg} - {pred_ag}",
                "pred_home_goals": pred_hg,
                "pred_away_goals": pred_ag,
            }

            # Check if match was already played in 2026/27 (early weeks)
            if fix.get("status") == "played" and pd.notna(fix.get("home_goals")):
                act_hg = int(fix["home_goals"])
                act_ag = int(fix["away_goals"])
                act_res = "H" if act_hg > act_ag else ("A" if act_hg < act_ag else "D")
                pred_item["actual_score"] = f"{act_hg} - {act_ag}"
                pred_item["status"] = "Played"

                # Append to rolling history and refresh context so subsequent gameweeks reflect real results.
                # Shots/corners/possession are unobserved in openfootball feeds,
                # so use historical means (not hardcoded constants) to avoid
                # diluting form signals with league-average placeholders.
                new_row = {
                    "season": "2026-27",
                    "date": m_date,
                    "home_team": ht,
                    "away_team": at,
                    "home_goals": act_hg,
                    "away_goals": act_ag,
                    "result": act_res,
                    "home_shots": hist_means.get("home_shots", 12.0),
                    "away_shots": hist_means.get("away_shots", 10.0),
                    "home_shots_target": hist_means.get("home_shots_target", 4.0),
                    "away_shots_target": hist_means.get("away_shots_target", 3.0),
                    "home_corners": hist_means.get("home_corners", 5.0),
                    "away_corners": hist_means.get("away_corners", 4.0),
                    "home_possession": hist_means.get("home_possession", 50.0),
                    "away_possession": hist_means.get("away_possession", 50.0),
                }
                rolling_history = pd.concat([rolling_history, pd.DataFrame([new_row])], ignore_index=True)
                feature_context = build_feature_context(rolling_history)
            else:

                pred_item["actual_score"] = "-"
                pred_item["status"] = "Upcoming"

            predictions.append(pred_item)

        pred_df = pd.DataFrame(predictions)

        # Export CSV
        os.makedirs(DATA_DIR, exist_ok=True)
        csv_path = os.path.join(DATA_DIR, "predictions_2026_2027.csv")
        pred_df.to_csv(csv_path, index=False)
        print(f"      - Exported CSV to: {csv_path}")

        # Export Markdown
        md_path = os.path.join(DATA_DIR, "predictions_2026_2027.md")
        self._export_markdown_report(pred_df, md_path)
        print(f"      - Exported Markdown summary to: {md_path}")

        return pred_df

    def _export_markdown_report(self, df: pd.DataFrame, output_path: str):
        """Creates a formatted markdown document summarizing the predictions."""
        with open(output_path, "w", encoding="utf-8") as f:
            f.write("# Premier League 2026/2027 Season Match Predictions\n\n")
            f.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Primary Prediction Engine: **{self.best_model_name}**\n\n")

            f.write("## Model Performance Benchmark Summary\n\n")
            bench_data = []
            for m_name, m_vals in self.metrics.items():
                bench_data.append([
                    m_name,
                    f"{m_vals['accuracy']*100:.1f}%",
                    f"{m_vals['macro_f1']:.3f}",
                    f"{m_vals['log_loss']:.3f}",
                    f"{m_vals['avg_goal_mae']:.2f}",
                    f"{m_vals['within_1_goal_acc']*100:.1f}%",
                ])
            headers = ["Model", "Accuracy", "Macro F1", "Log Loss", "Goal MAE", "Within 1 Goal Acc"]
            f.write(tabulate(bench_data, headers=headers, tablefmt="github"))
            f.write("\n\n---\n\n")

            f.write("## Season Fixtures and Forecasts\n\n")
            for gw, gw_matches in df.groupby("gameweek"):
                f.write(f"### Gameweek {gw}\n\n")
                tbl_rows = []
                for _, r in gw_matches.iterrows():
                    tbl_rows.append([
                        r["date"],
                        r["home_team"],
                        r["predicted_score"],
                        r["away_team"],
                        f"{r['home_win_prob']}%",
                        f"{r['draw_prob']}%",
                        f"{r['away_win_prob']}%",
                        r["predicted_outcome"],
                        r["status"],
                    ])
                gw_headers = ["Date", "Home", "Pred Score", "Away", "Home %", "Draw %", "Away %", "Fav Outcome", "Status"]
                f.write(tabulate(tbl_rows, headers=gw_headers, tablefmt="github"))
                f.write("\n\n")

    def predict_custom_match(self, home_team: str, away_team: str, match_date: Optional[datetime] = None) -> Dict[str, Any]:
        """Instant prediction for an arbitrary matchup between two clubs."""
        if self.best_model is None:
            self.train_and_evaluate()
        if self.raw_historical is None or self.raw_historical.empty:
            # Fast-load path (load_model only) may skip history; load it now.
            self.load_data()

        ht_std = standardize_team_name(home_team)
        at_std = standardize_team_name(away_team)
        m_date = match_date or datetime.now()

        X_match = build_fixture_features(ht_std, at_std, m_date, self.raw_historical)
        probas = self.best_model.predict_outcome_proba(X_match)[0]
        pred_scores = self.best_model.predict_scoreline(X_match)[0]
        exp_hg, exp_ag = self.best_model.predict_expected_goals(X_match)

        p_away, p_draw, p_home = probas[0], probas[1], probas[2]
        fav_idx = int(np.argmax(probas))
        fav_outcome = "Away Win" if fav_idx == 0 else ("Draw" if fav_idx == 1 else "Home Win")

        return {
            "home_team": ht_std,
            "away_team": at_std,
            "match_date": m_date.strftime("%Y-%m-%d"),
            "predicted_score": f"{pred_scores[0]} - {pred_scores[1]}",
            "pred_home_goals": pred_scores[0],
            "pred_away_goals": pred_scores[1],
            "expected_home_goals": round(float(exp_hg[0]), 2),
            "expected_away_goals": round(float(exp_ag[0]), 2),
            "home_win_prob": round(p_home * 100, 1),
            "draw_prob": round(p_draw * 100, 1),
            "away_win_prob": round(p_away * 100, 1),
            "predicted_outcome": fav_outcome,
            "model_used": self.best_model_name,
        }
