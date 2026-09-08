# AGENTS.md - Developer & AI Agent Guidelines

Welcome to the **Premier League Match Outcome & Scoreline Predictor** repository. This document outlines the architectural standards, design decisions, code organization, testing protocols, and contribution patterns for AI agents and human contributors working on this codebase.

---

## 1. Project Overview & Core Mission

The system ingests historical English Premier League match data and upcoming schedules from [`openfootball/england`](https://github.com/openfootball/england) and public match databases to forecast:
1. **Match Outcome Probabilities**: Calibrated 3-way distribution for `Home Win`, `Draw`, and `Away Win`.
2. **Exact Scorelines**: Continuous expected goals (`Home xG` and `Away xG`) modeled via Poisson regression and reconciled into integer scorelines (e.g., `2 - 1`).

---

## 2. Directory Structure & Abstractions

```
elegant-franklin/
├── data/
│   ├── raw/                       # Cached raw datasets (seasons CSVs & openfootball txt)
│   ├── predictions_2026_2027.csv  # 380 fixture forecasts with probabilities and scorelines
│   └── predictions_2026_2027.md   # Markdown table of predictions by gameweek
├── visuals/                       # Generated Matplotlib diagnostic charts (PNG)
├── web/                           # Standalone React 18 + TS + Tailwind CSS dashboard
│   ├── src/
│   │   ├── components/            # Navbar, GameweekView, MatchSimulator, Standings, Analytics
│   │   ├── data/eplData.json      # Serialized 380 fixtures, teams, benchmarks
│   │   └── types/                 # TypeScript data contracts
│   └── package.json
├── export_web_data.py             # Serializer from Python pipeline to web/src/data/eplData.json
├── src/
│   ├── __init__.py
│   ├── data_loader.py             # Ingestion, openfootball text parser, alias normalization
│   ├── feature_engineering.py     # Rolling form, venue splits, H2H, rest days (zero-leakage)
│   ├── models.py                  # MatchPredictorModel wrapper, RF & XGBoost classifiers/regressors
│   ├── evaluate.py                # Time-series metrics & Matplotlib chart generation
│   └── pipeline.py                # End-to-end training, benchmarking, and forecast orchestrator
├── tests/
│   └── test_pipeline.py           # Unit and integration pytest suite
├── predict.py                     # User-facing CLI tool
├── run_pipeline.py                # Single-command pipeline runner
├── pytest.ini                     # Pytest configuration
├── requirements.txt               # Pinned Python package dependencies
├── AGENTS.md                      # Agent architecture guide (this file)
└── README.md                      # User and project documentation
```

---

## 3. Strict Development Principles

### Zero Data Leakage Guarantee
> [!IMPORTANT]
> When computing features for any match on date $T$, you **MUST NOT** use any match occurring on or after date $T$. 
- In `src/feature_engineering.py`, every rolling calculation uses `.shift(1)` on chronological data.
- When calling `build_fixture_features(home_team, away_team, match_date, history)`, the history is strictly filtered: `history[history["date"] < match_date]`.

### Dual-Model Separation
- **Classification** and **Regression** are handled by distinct estimators:
  - Do not try to collapse 3-way outcome probabilities into a single regression diff without checking calibrated multi-class log loss.
  - The classifier optimizes 3-way log-loss; the regressors optimize count Poisson loss for goals.
  - Scorelines are harmonized in `MatchPredictorModel.predict_scoreline()`.

### Cross-Platform Encoding
- Always reconfigure stdout for UTF-8 compatibility in CLI scripts:
  ```python
  if hasattr(sys.stdout, "reconfigure"):
      sys.stdout.reconfigure(encoding="utf-8")
  ```
- Use ASCII-safe or GitHub-formatted tables (`tabulate(..., tablefmt="grid")`) to avoid Windows CP1252 crash issues.

---

## 4. Environment & Command Recipes

### Virtual Environment Setup
```powershell
# Using uv (recommended)
uv venv --python 3.11 .venv
uv pip install -r requirements.txt

# Using standard Python
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

### Running Tests
All agents must verify changes by running the test suite before submitting:
```powershell
.venv\Scripts\pytest tests/ -v
```

### Running Pipeline & CLI
```powershell
# Full pipeline execution (retrain, benchmark, plot, and predict 2026/27):
.venv\Scripts\python run_pipeline.py

# CLI Gameweek inspection:
.venv\Scripts\python predict.py --gameweek 7

# CLI Custom Matchup:
.venv\Scripts\python predict.py --match "Arsenal" "Chelsea"

# CLI Benchmark:
.venv\Scripts\python predict.py --benchmark
```

---

## 5. Guidelines for Modifying Existing Components

1. **Adding New Data Features**:
   - Add the metric calculation in `src/feature_engineering.py:compute_team_rolling_features()`.
   - Update both `build_engineered_dataset()` and `build_fixture_features()`.
   - Always append the new column name to `get_feature_column_names()`.
   - Add a unit test in `tests/test_pipeline.py`.

2. **Adding a New Model (e.g. LightGBM or CatBoost)**:
   - Extend `MatchPredictorModel` in `src/models.py`.
   - Register it in `train_and_benchmark_models()`.
   - Update `src/evaluate.py` to plot comparisons for the new model.

3. **Team Name Normalization**:
   - Any new club or variation must be added to `TEAM_ALIASES` in `src/data_loader.py`.
