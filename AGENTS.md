# AGENTS.md - Developer & AI Agent Guidelines

Welcome to the **Premier League Match Outcome & Scoreline Predictor** repository. This document outlines the architectural standards, design decisions, code organization, testing protocols, and contribution patterns for AI agents and human contributors working on this codebase.

---

## 1. Project Overview & Core Mission

The system ingests historical English Premier League match data, pre-kickoff bookmaker market signals, and upcoming schedules from [`openfootball/england`](https://github.com/openfootball/england) and public match databases to forecast:
1. **Match Outcome Probabilities**: Calibrated 3-way distribution for `Home Win`, `Draw`, and `Away Win`.
2. **Exact Scorelines**: Continuous expected goals (`Home xG` and `Away xG`) modeled via Poisson regression and reconciled into integer scorelines (e.g., `2 - 1`).

Market data comes from football-data.co.uk's free archive (cached, never scraped) with an optional live board via The Odds API (`EPL_ODDS_API_KEY`; the pipeline runs fully offline without it). A stacked ensemble (tuned Random Forest, XGBoost, logistic regression, Elo-Poisson) is benchmarked under time ordered validation; production is selected by Ranked Probability Score (RPS).

---

## 2. Directory Structure & Abstractions

```
elegant-franklin/
├── config.yaml                # Central pipeline/model/training configuration
├── data/
│   ├── raw/                   # Cached raw datasets (seasons CSVs & openfootball txt)
│   ├── raw/odds/              # Cached bookmaker odds (per-season E0 CSVs + live board)
│   ├── predictions_2026_2027.csv  # 380 fixture forecasts with probabilities and scorelines
│   └── predictions_2026_2027.md   # Markdown table of predictions by gameweek
├── models/
│   ├── tuning.json            # Deterministic Optuna records (consumed at train time)
│   └── metrics.json           # Benchmark sidecar (RF/XGBoost/Stacked + selection)
├── visuals/                   # Generated Matplotlib diagnostic charts (PNG)
├── web/                       # Standalone React 19 + TS 5.9 + Vite 8 + Tailwind CSS 4 dashboard
│   ├── src/
│   │   ├── App.tsx            # Single-file fixture-first dashboard (generic model rendering)
│   │   ├── hooks/useEPLData.ts# Async dataset loading with skeletons + retry
│   │   ├── data/eplData.json  # Serialized 380 fixtures, teams, benchmarks
│   │   └── types/             # TypeScript data contracts
│   └── package.json
├── export_web_data.py         # Serializer from Python pipeline to web/src/data/eplData.json
├── api.py                     # FastAPI serving surface (/health, /dataset, /predict)
├── src/
│   ├── __init__.py
│   ├── config.py              # config.yaml loader (env overrides, yaml-optional fallback)
│   ├── data_loader.py         # Ingestion, openfootball text parser, alias normalization
│   ├── odds_loader.py         # football-data.co.uk odds ingestion + implied probabilities
│   ├── live_odds.py           # Optional The Odds API client (env key, offline-safe)
│   ├── feature_engineering.py # Rolling form, venue splits, H2H, rest days, market signals (zero-leakage)
│   ├── models.py              # MatchPredictorModel (RF/XGB/LogReg), EloPoissonModel, StackedEnsembleModel
│   ├── tuning.py              # Deterministic Optuna search (mirrors benchmark protocol)
│   ├── evaluate.py            # RPS, time-series metrics & Matplotlib chart generation
│   ├── validation.py          # Input validation, checkpoint compat, odds leakage gates
│   ├── logging_config.py      # Central logging setup
│   └── pipeline.py            # End-to-end training, benchmarking, and forecast orchestrator
├── tests/
│   ├── test_pipeline.py       # Core unit and integration pytest suite
│   ├── test_odds.py           # Odds parsing, leakage contract, feature-join tests
│   ├── test_live_odds.py      # Live client tests (all network mocked)
│   ├── test_tuning.py         # RPS, search determinism, tuning record tests
│   ├── test_ensemble.py       # Elo member, stacking, checkpoint dispatch tests
│   └── test_interfaces.py     # CLI/API contract tests
├── predict.py                 # User-facing CLI tool (forecasts + market-implied line)
├── run_pipeline.py            # Single-command pipeline runner
├── pytest.ini                 # Pytest configuration
├── requirements.txt           # Pinned Python package dependencies
├── AGENTS.md                  # Agent architecture guide (this file)
└── README.md                  # User and project documentation
```

---

## 3. Strict Development Principles

### Zero Data Leakage Guarantee
> [!IMPORTANT]
> When computing features for any match on date $T$, you **MUST NOT** use any match occurring on or after date $T$. 
- In `src/feature_engineering.py`, every rolling calculation uses `.shift(1)` on chronological data.
- When calling `build_fixture_features(home_team, away_team, match_date, history)`, the history is strictly filtered: `history[history["date"] < match_date]`.
- Bookmaker odds are legal features **only when struck before kickoff** (closing aggregates qualify; results never enter). `src/odds_loader.py` drops result columns at parse time, and `src/validation.py:assert_odds_frame_clean()` / `assert_odds_coverage()` enforce the contract mechanically: no `FTHG`/`FTAG`/`FTR` columns, implied triples summing to 1, and >=95% (date, home, away) join coverage, or training refuses to run.

### Ensemble & Selection Policy
- Level-0 members are Random Forest, XGBoost, multinomial logistic regression, and Elo-Poisson (`EloPoissonModel` reads only `home_elo`/`away_elo`; league means and slope fit on training rows only). The meta-learner trains on honest out-of-fold train probabilities (`TimeSeriesSplit`), never in-sample outputs.
- Production is selected by **RPS** (Ranked Probability Score, lower wins), tie-broken by log-loss, accuracy, goal MAE. Accuracy alone never selects.
- Calibration uses temperature scaling with grid floor `T >= 1.0` (soften only), fit on the disjoint calibration half of validation (`split_calibration_evaluation()`); headline metrics use the other half.
- The draw decision (`favor_outcome_from_proba()`) is the SINGLE source of truth for scorelines, forecasts, and validation decisions, with regime-aware thresholds for market-present vs no-market rows. Retune both whenever the production model changes (procedure: grid on the disjoint eval slice + forecast-slate plausibility band 18-27%).
- `predict_outcome_proba()` outputs are always `(N, 3)` in `[Away, Draw, Home]` order (`align_probas()` guards degenerate slices).
- Checkpoints are strict: `assert_model_compatible(..., strict=True)` in serving paths; `StackedEnsembleModel.fit()` refits members but keeps meta weights frozen.

### Classification / Regression Separation
- Classification and regression stay distinct estimators: the classifier optimizes 3-way probabilities, the regressors optimize count Poisson loss for goals. Do not collapse outcomes into a single regression diff without checking RPS.
- Scorelines are harmonized in `predict_scoreline()` via the shared draw rule, never by global grid argmax.

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

# Offline mode (uses data/raw cache only, no downloads):
.venv\Scripts\python run_pipeline.py --offline

# Hyperparameter search (deterministic, writes models/tuning.json):
.venv\Scripts\python -m src.tuning --trials 40 --offline

# Optional live odds (free key; pipeline degrades gracefully without it):
$env:EPL_ODDS_API_KEY = "<your-theoddsapi-key>"

# CLI Gameweek inspection:
.venv\Scripts\python predict.py --gameweek 7

# CLI Custom Matchup:
.venv\Scripts\python predict.py --match "Arsenal" "Chelsea"

# CLI Benchmark:
.venv\Scripts\python predict.py --benchmark
```

### Web Dashboard
```powershell
cd web
npm ci
npm run dev     # serves on http://localhost:5173
npm run build   # typechecks (tsc) and emits web/dist/
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

4. **Tuning Hyperparameters**:
   - Extend the search space in `src/tuning.py:suggest_rf()` / `suggest_xgb()`; never hand-edit `models/tuning.json` (it is the search record, consumed at train time).
   - Keep the protocol honest: fit on train, calibrate on the calibration slice, score RPS on the disjoint eval slice via `split_calibration_evaluation()`.
   - Re-run the search with `python -m src.tuning --trials 40 --offline` and commit the regenerated `tuning.json`.

5. **Commits**:
   - Commit scoped work per feature with a `type(scope): subject` message, then push; never bundle unrelated phases into one commit.

---

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five canonical triage labels used as-is. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
