# Delivery status and deferred research

This document is the current release-oriented status for the Premier League predictor. It replaces the earlier phase checklist, which contained historical season counts and no longer represented the dashboard or model contract.

## Current status

Phases 0 through 8 are implemented in the current release candidate. The production classifier is selected by Ranked Probability Score (RPS), not raw accuracy. The current held-out benchmark is sourced from `models/metrics.json`:

| Model | RPS | Accuracy | Goal MAE | Scoreline KL | Variety | Status |
| :--- | ---: | ---: | ---: | ---: | ---: | :--- |
| Random Forest | 0.2078 | 50.6% | 0.89 | 7.1373 | 25.3% | Production |
| XGBoost | 0.2109 | 50.6% | 0.87 | 10.1708 | 20.9% | Benchmark |
| Stacked | 0.2077 | 50.0% | 0.87 | 8.4604 | 24.7% | Benchmark |

These are time-ordered validation results, not a guarantee of future match accuracy. The dashboard distinguishes recorded scores from projected fixtures; projected fixtures must never be presented as observed results. Scoreline quality (KL divergence vs empirical scorelines and argmax-variety) is measured on the held-out evaluation tail (158 matches) and transcribed from `models/metrics.json`. Production follows pooled RPS across three rolling-origin folds (Random Forest 0.1974, Stacked 0.1981, XGBoost 0.1994); the table headlines the most recent fold.

## Completed phases

### Phase 0 — Data foundation

Historical results, the published fixture schedule, cached football-data.co.uk odds, team aliases, and kickoff-time fallbacks are represented in reproducible loaders. Missing kickoff times remain `TBC`; the pipeline does not invent a kickoff time.

### Phase 1 — Leakage-safe features

Rolling form, venue splits, head-to-head history, rest and congestion measures, travel distance, Elo ratings, and market signals are built chronologically. Fixture features filter history to dates strictly earlier than the fixture date, and odds validation rejects result columns and insufficient joins.

### Phase 2 — Model training

Random Forest, XGBoost, multinomial logistic regression, and Elo-Poisson members are trained as separate classification and goal-regression components. Tree tuning is deterministic and recorded in `models/tuning.json`.

### Phase 3 — Honest evaluation and selection

Time-series validation separates training, calibration, and evaluation data. The stacked meta-learner uses out-of-fold probabilities, calibration is selected on a disjoint slice, and production selection uses RPS with documented tie-breakers.

Every training run writes `models/evaluation_receipt.json`: one schema-versioned, deterministic artifact that states the evaluation population (fold starts, train and validation rows, and the evaluation rows left after the calibration slice is removed), records per-model per-fold and pooled metrics, and attaches seeded bootstrap confidence intervals over resampled matches. It also publishes per-outcome confusion counts, recall and precision, predicted-versus-observed class shares, and the same diagnostics split into lopsided and tight matches by a documented absolute home-minus-away probability gap whose threshold is recorded in config and in the artifact. The receipt, not prose, is the measurement surface for later model changes; the dashboard benchmark and the prose tables stay transcribed from the generated metrics as before.

### Phase 4 — Forecast outputs

The pipeline writes the forecast CSV and Markdown report, persists compatible model metadata, and uses the shared draw-decision rule for probabilities, forecasts, and scorelines.

### Phase 5 — Serving and interfaces

The FastAPI surface provides health, readiness, model metadata, dataset, prediction, and gameweek endpoints. CLI commands validate gameweeks and club names, return non-zero status for invalid input, and support cached checkpoints or explicit retraining.

### Phase 6 — Dashboard

The React dashboard provides Fixtures, Simulator, Table, Clubs, and Analytics views from the serialized dataset. Official/projected labels, loading and retry states, accessible tables, keyboard-dismissible diagnostic previews, and responsive mobile layouts are part of the UI contract.

### Phase 7 — Diagnostics and publication

Diagnostic charts are generated with the dashboard's light theme and copied to `web/public/visuals/`. The dashboard data export and generated forecast artifacts are kept synchronized through the pipeline/export workflow.

### Phase 8 — Quality gates

The Python test suite covers leakage, odds contracts, model compatibility, calibration, scoreline consistency, tuning, interfaces, and API behavior. The web gate runs TypeScript checking and a production Vite build. CI runs the supported Python matrix and frontend build.

## Release checklist

Before publishing a refreshed forecast or model:

1. Run the offline pipeline when the cached source data is sufficient.
2. Regenerate the web dataset with `.venv\Scripts\python.exe export_web_data.py`.
3. Confirm generated CSV, Markdown, JSON, metrics, and PNG artifacts are synchronized, including `models/evaluation_receipt.json`, whose evaluation population and pooled metrics must agree with `models/metrics.json`. Validate forecast labels with the shared draw-decision rule rather than assuming the raw probability argmax is always the published outcome.
4. Run `.venv\Scripts\python.exe -m pytest tests/ -v` from the repository root.
5. Run `npm run build` from `web/`.
6. Inspect the dashboard at desktop and narrow phone widths, including Analytics diagnostics and tables.
7. Review the staged file list before committing; keep each commit scoped to one coherent change.

## Multi-competition context integration (openfootball/england)

Historical datasets and multi-competition context from `openfootball/england` (FA Cup, EFL Cup, Championship, extended historical seasons) are ingested and structured into the chronological context layer:
- Domestic cups inform real-world `rest_days` (e.g. midweek cup recovery) and 14-day fixture congestion `congestion_14d`.
- Cross-competition dynamic Elo ratings update with competition-aware K-factor scaling.
- Primary Premier League outcome modeling maintains strict pre-kickoff odds gating and zero leakage.

## Deferred research

The following are intentionally deferred research items, not release blockers:

- Player availability, injuries, suspensions, lineups, and verified squad news. These require timestamped sources and a leakage-safe availability snapshot.
- A live odds integration. This would require an explicit provider, licensing review, caching policy, failure behavior, and a new pre-kickoff leakage contract.

Any deferred feature must ship with its data provenance, time-of-availability definition, validation coverage, and dashboard/API documentation before it becomes part of the production model.
