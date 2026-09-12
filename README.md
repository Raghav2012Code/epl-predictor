# Premier League Match Predictor

An evidence-led Premier League forecasting project for the 2026/27 season. The pipeline produces calibrated Home Win / Draw / Away Win probabilities, expected goals, and a most likely scoreline from historical match data and the published 380-fixture schedule.

The repository has two entry points:

- A Python pipeline for ingestion, feature engineering, time ordered validation, forecasting, diagnostics, and serving.
- A React dashboard for fixtures, scenario exploration, projected standings, club profiles, and model evidence.

## What the model does

The production model combines a three-class classifier with two Poisson goal regressors. Features are built chronologically with lagged rolling windows, venue splits, head-to-head history, rest days, and dynamic Elo ratings. A match never sees a result from the same date or a later date. Cold starts use club-specific priors rather than zeros or future dataset medians.

The current generated benchmark is held out after a time-series split at 2024-01-01. Half of the validation tail is reserved for temperature calibration; the reported metrics use the later evaluation tail.

| Model | Accuracy | Macro F1 | Log loss | Goal MAE | Within one goal | Selection |
| :--- | ---: | ---: | ---: | ---: | ---: | :--- |
| Random Forest | 49.4% | 0.372 | 1.024 | 0.90 | 55.9% | Production |
| XGBoost | 49.8% | 0.371 | 1.042 | 0.90 | 56.8% | Benchmark |

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

The full pipeline trains both models, writes diagnostics, saves `models/production_model.joblib` and `models/metrics.json`, then exports the forecast CSV and Markdown report. To refresh the dashboard data after a pipeline run:

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

## Validation

```powershell
.venv\Scripts\python.exe -m pytest tests/ -v
cd web
npm run build
```

The test suite covers zero leakage, stable same-date ordering, cold-start priors, Dixon–Coles direction, model save/load, scoreline consistency, calibration-safe benchmark outputs, feature-order drift, probability totals, CLI exit codes, the dataset endpoint, and CORS. The current suite has 18 passing tests.

## Repository layout

```text
src/                       Python data, feature, model, validation, and pipeline code
tests/                     Python unit and interface contract tests
data/                      Cached inputs and generated season forecasts
models/                    Generated checkpoint metadata (the binary checkpoint is ignored)
visuals/                   Generated Matplotlib diagnostics
web/src/App.tsx            Responsive dashboard composition and state ownership
web/src/styles/index.css   Dashboard design system and responsive rules
api.py                     FastAPI serving surface
predict.py                 CLI query surface
export_web_data.py         Pipeline-to-dashboard serializer
nginx.conf                 Static deployment configuration
```

## License

MIT
