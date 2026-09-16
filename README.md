# Premier League Match Predictor

An evidence-led Premier League forecasting project for the 2026/27 season. The pipeline produces calibrated Home Win / Draw / Away Win probabilities, expected goals, and a most likely scoreline from historical match data, pre-kickoff bookmaker market signals, and the published 380-fixture schedule. A stacked ensemble (tuned Random Forest, XGBoost, logistic regression, and Elo-Poisson members) is benchmarked with time ordered validation; production is selected by Ranked Probability Score.

The repository has two entry points:

- A Python pipeline for ingestion, feature engineering, time ordered validation, forecasting, diagnostics, and serving.
- A React dashboard for fixtures, scenario exploration, projected standings, club profiles, and model evidence.

## What the model does

The production model combines a three-class classifier with two Poisson goal regressors. Features are built chronologically with lagged rolling windows, venue splits, head-to-head history, rest days, fixture congestion, away-travel distance, dynamic Elo ratings, and pre-kickoff bookmaker market signals (overround-stripped closing odds, same-book steam, overround). Training rows carry exponential recency weights. A match never sees a result from the same date or a later date, and odds frames are gated to pre-kickoff fields only. Cold starts use club-specific priors rather than zeros or future dataset medians.

The current generated benchmark is held out after a time-series split at 2024-01-01. Half of the validation tail is reserved for calibration-method selection; the reported metrics use the later evaluation tail. Tree hyperparameters come from a deterministic Optuna search recorded in `models/tuning.json` (re-run with `.venv\Scripts\python.exe -m src.tuning --trials 40 --offline`).

| Model | Accuracy | Macro F1 | Log loss | RPS | Goal MAE | Within one goal | Selection |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| Random Forest | 46.6% | 0.432 | 1.016 | 0.207 | 0.90 | 59.3% | Production |
| XGBoost | 48.7% | 0.403 | 1.026 | 0.208 | 0.89 | 55.3% | Benchmark |
| Stacked | 47.2% | 0.415 | 1.016 | 0.208 | 0.89 | 57.2% | Benchmark |

Production is selected by Ranked Probability Score (lower is better): the proper scoring rule for ordered Home/Draw/Away outcomes. The stacked ensemble (RF + XGBoost + logistic regression + Elo-Poisson members, meta-learner on out-of-fold train probabilities) leads on accuracy; Random Forest keeps production on RPS.

These are validation measurements, not a promise of future accuracy. Exact scorelines are especially uncertain; probabilities should be read as distributions.

## Dashboard

The dashboard is a quiet football analysis workspace rather than a telemetry screen. It uses a responsive layout, readable typography, restrained club accents, clear official/projected labels, and one consistent data source.

- **Fixtures** shows each gameweek with the selected match, probability strip, scoreline, and a plain-language model read.
- **Simulator** provides a browser scenario estimate and keeps the scheduled production forecast beside it. Reverse fixtures are re-oriented before comparison.
- **Table** provides an accessible sortable projected table with explicit official/projected data notes.
- **Clubs** provides controlled club selection, recent results, and next fixtures.
- **Model** separates validation metrics, outcome mix, season goals, and diagnostic images. Diagnostic previews are keyboard dismissible with Escape.

Run it locally:

```powershell
cd web
npm ci
npm run dev
```

Open `http://localhost:5173`. The dashboard uses the bundled `web/src/data/eplData.json`; set `VITE_DATA_URL` to load the same schema from a remote endpoint.

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

Use `--offline` when the raw datasets already exist in `data/raw`:

```powershell
.venv\Scripts\python.exe run_pipeline.py --offline
```

Bookmaker odds come from football-data.co.uk's free archive and are cached under `data/raw/odds` (no scraping). The project does not use an external live-odds API; upcoming fixtures use cached historical market signals when available and neutral priors otherwise.

The full pipeline trains the Random Forest, XGBoost, and stacked ensemble, writes diagnostics, saves `models/production_model.joblib` and `models/metrics.json`, then exports the forecast CSV and Markdown report. To refresh the dashboard data after a pipeline run:

```powershell
.venv\Scripts\python.exe export_web_data.py
```

Kickoff times that are absent from the source schedule are shown as `TBC`; the pipeline never invents a 15:00 kickoff.

## CLI

```powershell
.venv\Scripts\python.exe predict.py --gameweek 7
.venv\Scripts\python.exe predict.py --match "Arsenal" "Chelsea"
.venv\Scripts\python.exe predict.py --benchmark
.venv\Scripts\python.exe predict.py --gameweek 7 --offline
```

Invalid gameweeks and unknown clubs return a non-zero exit status. A cached checkpoint is used when available; pass `--retrain` to rebuild it.

## API

```powershell
.venv\Scripts\python.exe -m uvicorn api:app --host 0.0.0.0 --port 8000
```

Endpoints:

- `GET /health` returns 200 only when the model is loaded and 503 while the service is degraded.
- `GET /model-info` returns checkpoint, feature, and calibration metadata.
- `GET /dataset` returns the validated dashboard dataset.
- `GET /predict?home=Arsenal&away=Chelsea` returns a single forecast.
- `GET /gameweek/{n}` returns the ten fixtures for a valid gameweek.

CORS origins can be configured with `EPL_CORS_ORIGINS`, as a comma separated list. Errors use an `{ "error": ... }` response shape.

For deployment, set `EPL_ENV=production`, provide explicit comma-separated
`EPL_CORS_ORIGINS` and `EPL_ALLOWED_HOSTS`, and mount a compatible checkpoint
through `EPL_MODEL_PATH` when it is outside the repository. Production disables
the interactive API documentation endpoints. Use `/health` for liveness and
`/ready` for traffic routing; readiness returns HTTP 503 until the checkpoint
passes compatibility validation.

## Validation

```powershell
.venv\Scripts\python.exe -m pytest tests/ -v
cd web
npm run build
```

The test suite covers zero leakage, stable same-date ordering, cold-start priors, pre-kickoff odds gates (no result columns, join coverage), Dixon–Coles direction, model save/load (including stacked checkpoints), scoreline consistency under the shared draw rule, tuning determinism, calibration-method selection and reliability curves, feature-order drift, probability totals, CLI exit codes, the dataset endpoint, and CORS.

## Repository layout

```text
src/                       Python data, feature, model, validation, tuning, and pipeline code
src/odds_loader.py         Cached football-data.co.uk odds ingestion + implied probabilities
src/tuning.py              Deterministic Optuna search for tree hyperparameters
tests/                     Python unit and interface contract tests (odds, tuning, ensemble)
data/                      Cached inputs, odds archive, and generated season forecasts
models/                    tuning.json + metrics.json (the binary checkpoint is ignored)
visuals/                   Generated Matplotlib diagnostics
web/                       React 19 + TypeScript + Vite 8 + Tailwind CSS 4 dashboard
web/src/App.tsx            Responsive dashboard composition and state ownership
web/src/styles/index.css   Dashboard design system and responsive rules
config.yaml                Central pipeline/model/training configuration
api.py                     FastAPI serving surface
predict.py                 CLI query surface
export_web_data.py         Pipeline-to-dashboard serializer
```

## License

MIT
