"""Interactive Command-Line Interface (CLI) for Premier League Match Outcome & Score Predictor.

Examples:
    python predict.py --gameweek 1
    python predict.py --gameweek 7
    python predict.py --match "Arsenal" "Chelsea"
    python predict.py --benchmark
    python predict.py --export
"""

from __future__ import annotations

import argparse
import os
import sys
from datetime import datetime

# Configure utf-8 stdout
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import pandas as pd
from tabulate import tabulate

# Add current dir to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.pipeline import PremierLeaguePredictionPipeline

PIPELINE_INSTANCE = None


def get_pipeline() -> PremierLeaguePredictionPipeline:
    """Singleton helper to load or initialize pipeline."""
    global PIPELINE_INSTANCE
    if PIPELINE_INSTANCE is None:
        PIPELINE_INSTANCE = PremierLeaguePredictionPipeline()
        PIPELINE_INSTANCE.prepare_data()
        PIPELINE_INSTANCE.train_and_evaluate()
    return PIPELINE_INSTANCE


def run_gameweek_prediction(gameweek_num: int):
    """Displays predicted outcomes and scores for a specific gameweek."""
    csv_path = os.path.join(os.path.dirname(__file__), "data", "predictions_2026_2027.csv")

    if not os.path.exists(csv_path):
        print("Generating 2026/2027 predictions dataset...")
        pipeline = get_pipeline()
        df = pipeline.forecast_2026_2027_season()
        best_model = pipeline.best_model_name
    else:
        df = pd.read_csv(csv_path)
        best_model = "XGBoost"

    gw_matches = df[df["gameweek"] == gameweek_num]
    if gw_matches.empty:
        print(f"\n[!] Gameweek {gameweek_num} not found. Valid gameweeks are 1 to 38.\n")
        return

    print("\n" + "=" * 94)
    print(f"       PREMIER LEAGUE 2026/2027 - GAMEWEEK {gameweek_num} PREDICTIONS")
    print(f"       Engine: {best_model} Dual-Predictor (Outcome Probabilities + Expected Scorelines)")
    print("=" * 94)

    table_data = []
    for _, r in gw_matches.iterrows():
        match_str = f"{r['home_team']} vs {r['away_team']}"
        score_str = f"[{r['predicted_score']}]"
        prob_str = f"H: {r['home_win_prob']}% | D: {r['draw_prob']}% | A: {r['away_win_prob']}%"
        status_note = f"Actual: {r['actual_score']}" if r.get("status") == "Played" else "Upcoming"

        table_data.append([
            r["date"],
            r.get("time", "15:00"),
            match_str,
            score_str,
            prob_str,
            r["predicted_outcome"],
            status_note,
        ])

    headers = ["Date", "Time", "Fixture", "Predicted Score", "Win / Draw / Loss Probs", "Favorite", "Status"]
    print(tabulate(table_data, headers=headers, tablefmt="grid"))
    print("\n")


def run_custom_matchup(home_team: str, away_team: str):
    """Predicts outcome and score for any custom head-to-head match."""
    pipeline = get_pipeline()
    pred = pipeline.predict_custom_match(home_team, away_team)

    print("\n" + "=" * 65)
    print("        PREMIER LEAGUE MATCH OUTCOME & SCORE FORECAST")
    print("=" * 65)
    print(f" Fixture:       {pred['home_team']} (Home) vs {pred['away_team']} (Away)")
    print(f" Match Date:    {pred['match_date']}")
    print(f" ML Engine:     {pred['model_used']}")
    print("-" * 65)
    print(f" PREDICTED SCORE:     >>>  {pred['home_team']} {pred['predicted_score']} {pred['away_team']}  <<<")
    print(f" Expected Goals (xG): Home: {pred['expected_home_goals']}  |  Away: {pred['expected_away_goals']}")
    print("-" * 65)
    print(" OUTCOME PROBABILITIES:")
    print(f"   [H] {pred['home_team']:<22} :  {pred['home_win_prob']:>5.1f}%")
    print(f"   [D] {'Draw':<22} :  {pred['draw_prob']:>5.1f}%")
    print(f"   [A] {pred['away_team']:<22} :  {pred['away_win_prob']:>5.1f}%")
    print("-" * 65)
    print(f" FAVORED OUTCOME:      {pred['predicted_outcome'].upper()}")
    print("=" * 65 + "\n")


def run_benchmark():
    """Prints side-by-side benchmark table comparing Random Forest and XGBoost."""
    pipeline = get_pipeline()
    metrics = pipeline.metrics

    print("\n" + "=" * 80)
    print("         MODEL BENCHMARK: RANDOM FOREST vs XGBOOST")
    print("=" * 80)

    rows = []
    for name, m in metrics.items():
        rows.append([
            name,
            f"{m['accuracy']*100:.2f}%",
            f"{m['macro_f1']:.3f}",
            f"{m['log_loss']:.3f}",
            f"{m['mae_home_goals']:.2f}",
            f"{m['mae_away_goals']:.2f}",
            f"{m['avg_goal_mae']:.2f}",
            f"{m['within_1_goal_acc']*100:.1f}%",
        ])

    headers = ["Model", "Accuracy", "Macro F1", "Log Loss", "Home MAE", "Away MAE", "Avg Goal MAE", "Within 1 Goal"]
    print(tabulate(rows, headers=headers, tablefmt="grid"))
    print(f"\n Selected Production Model: >>> {pipeline.best_model_name} <<<\n")
    print(" Matplotlib visual diagnostics have been saved to 'visuals/' directory:\n")
    print("  - visuals/feature_importance.png")
    print("  - visuals/confusion_matrix.png")
    print("  - visuals/model_metrics_comparison.png")
    print("  - visuals/goal_error_distribution.png\n")


def main():
    parser = argparse.ArgumentParser(
        description="Premier League Match Outcome and Scoreline Predictor (2026/27)"
    )
    parser.add_argument(
        "--gameweek", "-g",
        type=int,
        help="Gameweek number (1-38) to display predictions for.",
    )
    parser.add_argument(
        "--match", "-m",
        nargs=2,
        metavar=("HOME", "AWAY"),
        help="Custom match prediction: e.g. --match 'Arsenal' 'Chelsea'",
    )
    parser.add_argument(
        "--benchmark", "-b",
        action="store_true",
        help="Display benchmark metrics comparing Random Forest vs XGBoost.",
    )
    parser.add_argument(
        "--export", "-e",
        action="store_true",
        help="Re-train and export 2026/27 predictions to CSV and Markdown.",
    )

    args = parser.parse_args()

    if args.benchmark:
        run_benchmark()
    elif args.match:
        run_custom_matchup(args.match[0], args.match[1])
    elif args.gameweek is not None:
        run_gameweek_prediction(args.gameweek)
    elif args.export:
        pipeline = get_pipeline()
        pipeline.forecast_2026_2027_season()
        print("\n[+] Predictions for all 380 fixtures exported successfully!")
    else:
        # Default behavior: show Gameweek 1 or prompt
        print("\nWelcome to the Premier League Match Outcome & Scoreline Predictor!")
        print("Showing upcoming Gameweek 1 predictions as default...\n")
        run_gameweek_prediction(1)
        print("Tip: Use --help to see all options (e.g. --match 'Arsenal' 'Chelsea', --gameweek 7, --benchmark).")


if __name__ == "__main__":
    main()
