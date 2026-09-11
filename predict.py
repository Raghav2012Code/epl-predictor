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


def get_pipeline(force_retrain: bool = False, fast_mode: bool = False) -> PremierLeaguePredictionPipeline:
    """Singleton helper to load or initialize pipeline."""
    global PIPELINE_INSTANCE
    # Refresh when forced, when switching between fast/slow modes, or first use.
    needs_build = (
        PIPELINE_INSTANCE is None
        or force_retrain
        or (fast_mode and PIPELINE_INSTANCE.best_model is None)
    )
    if needs_build:
        PIPELINE_INSTANCE = PremierLeaguePredictionPipeline()
        model_path = os.path.join(os.path.dirname(__file__), "models", "production_model.joblib")
        if not force_retrain and fast_mode and os.path.exists(model_path):
            PIPELINE_INSTANCE.load_data()
            PIPELINE_INSTANCE.load_model(model_path)
        else:
            PIPELINE_INSTANCE.prepare_data()
            PIPELINE_INSTANCE.train_and_evaluate()
    return PIPELINE_INSTANCE


def _resolve_engine_label() -> str:
    """Reads the production engine from checkpoint, falling back to XGBoost."""
    model_path = os.path.join(os.path.dirname(__file__), "models", "production_model.joblib")
    if os.path.exists(model_path):
        try:
            import joblib as _joblib

            payload = _joblib.load(model_path)
            mt = payload.get("model_type", "xgboost") if isinstance(payload, dict) else "xgboost"
            return "Random Forest" if str(mt).lower() == "rf" else "XGBoost"
        except Exception:
            pass
    return "XGBoost"


def run_gameweek_prediction(gameweek_num: int, force_retrain: bool = False):
    """Displays predicted outcomes and scores for a specific gameweek."""
    from src.validation import validate_gameweek

    try:
        gameweek_num = validate_gameweek(gameweek_num)
    except ValueError as exc:
        print(f"\n[!] {exc}\n")
        return
    csv_path = os.path.join(os.path.dirname(__file__), "data", "predictions_2026_2027.csv")

    if not os.path.exists(csv_path) or force_retrain:
        print("Generating 2026/2027 predictions dataset...")
        pipeline = get_pipeline(force_retrain=force_retrain)
        df = pipeline.forecast_2026_2027_season()
        best_model = pipeline.best_model_name
    else:
        df = pd.read_csv(csv_path)
        best_model = _resolve_engine_label()

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
        time_val = r.get("time", "15:00")
        if not isinstance(time_val, str) or not time_val.strip():
            time_val = "15:00"

        table_data.append([
            r["date"],
            time_val,
            match_str,
            score_str,
            prob_str,
            r["predicted_outcome"],
            status_note,
        ])

    headers = ["Date", "Time", "Fixture", "Predicted Score", "Win / Draw / Loss Probs", "Favorite", "Status"]
    print(tabulate(table_data, headers=headers, tablefmt="grid"))
    print("\n")


def run_custom_matchup(home_team: str, away_team: str, force_retrain: bool = False):
    """Predicts outcome and score for any custom head-to-head match."""
    from src.validation import assert_model_compatible, canonical_team

    try:
        home_team = canonical_team(home_team)
        away_team = canonical_team(away_team)
    except ValueError as exc:
        print(f"\n[!] {exc}\n")
        return
    if home_team == away_team:
        print("\n[!] Home and away clubs must differ.\n")
        return
    model_path = os.path.join(os.path.dirname(__file__), "models", "production_model.joblib")
    fast = not force_retrain and os.path.exists(model_path)
    pipeline = get_pipeline(force_retrain=force_retrain, fast_mode=fast)
    try:
        assert_model_compatible(pipeline.best_model, strict=False)
    except RuntimeError as exc:
        print(f"\n[!] {exc}\n")
        return
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


def run_benchmark(force_retrain: bool = False):
    """Prints side-by-side benchmark table comparing Random Forest and XGBoost."""
    pipeline = get_pipeline(force_retrain=force_retrain)
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
        "--retrain", "-r",
        action="store_true",
        help="Force re-training of models even if a cached model checkpoint exists.",
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
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable debug logging (sets LOG_LEVEL=DEBUG).",
    )
    parser.add_argument(
        "--quiet", "-q",
        action="store_true",
        help="Suppress info logs (sets LOG_LEVEL=WARNING).",
    )

    args = parser.parse_args()

    from src.logging_config import configure_logging

    if args.verbose:
        configure_logging("DEBUG")
    elif args.quiet:
        configure_logging("WARNING")

    if args.benchmark:
        run_benchmark(force_retrain=args.retrain)
    elif args.match:
        run_custom_matchup(args.match[0], args.match[1], force_retrain=args.retrain)
    elif args.gameweek is not None:
        run_gameweek_prediction(args.gameweek, force_retrain=args.retrain)
    elif args.export:
        pipeline = get_pipeline(force_retrain=args.retrain)
        pipeline.forecast_2026_2027_season()
        print("\n[+] Predictions for all 380 fixtures exported successfully!")
    else:
        # Default behavior: show current upcoming gameweek (e.g. Gameweek 4)
        csv_path = os.path.join(os.path.dirname(__file__), "data", "predictions_2026_2027.csv")
        default_gw = 4
        if os.path.exists(csv_path):
            try:
                df_all = pd.read_csv(csv_path)
                upcoming = df_all[df_all["status"] == "Upcoming"]["gameweek"]
                if not upcoming.empty:
                    default_gw = int(upcoming.min())
            except Exception:
                pass

        print("\nWelcome to the Premier League Match Outcome & Scoreline Predictor!")
        print(f"Showing current upcoming Gameweek {default_gw} predictions as default...\n")
        run_gameweek_prediction(default_gw)
        print(f"Tip: Use --help to see all options (e.g. --match 'Arsenal' 'Chelsea', --gameweek {default_gw}, --benchmark).")


if __name__ == "__main__":
    main()
