"""One-command runner to execute the full end-to-end Premier League prediction pipeline.

Steps:
1. Ingests historical match data (2020-2026) and 2026/27 openfootball fixtures.
2. Engineers rolling features (goals, shots, possession, momentum, H2H).
3. Trains and benchmarks Random Forest vs XGBoost models using time-series validation.
4. Generates all Matplotlib diagnostic charts in `visuals/`.
5. Forecasts all 380 fixtures for the 2026/2027 season and saves CSV & Markdown reports.
"""

from __future__ import annotations

import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.pipeline import PremierLeaguePredictionPipeline


def main():
    start_time = time.time()
    print("=" * 80)
    print("  PREMIER LEAGUE MATCH OUTCOME & SCORE PREDICTOR PIPELINE (2026/27)")
    print("=" * 80)

    pipeline = PremierLeaguePredictionPipeline()
    pipeline.prepare_data()
    pipeline.train_and_evaluate(split_date_str="2024-01-01")
    pred_df = pipeline.forecast_2026_2027_season()

    elapsed = time.time() - start_time
    print("=" * 80)
    print(f" PIPELINE COMPLETED IN {elapsed:.1f} SECONDS")
    print("=" * 80)
    print(f"  - Forecasted Fixtures:      {len(pred_df)} matches")
    print(f"  - Best Model:               {pipeline.best_model_name}")
    print("  - Prediction Data (CSV):    data/predictions_2026_2027.csv")
    print("  - Prediction Report (MD):   data/predictions_2026_2027.md")
    print("  - Visual Diagnostics:       visuals/ (4 Matplotlib plots)")
    print("=" * 80)
    print("\nNext step: Try running CLI queries like:")
    print("  python predict.py --gameweek 1")
    print("  python predict.py --match \"Arsenal\" \"Chelsea\"")
    print("  python predict.py --benchmark\n")


if __name__ == "__main__":
    main()
