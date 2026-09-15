# Remaining Phases

Status: Phases 0–8 complete (odds, tuning, stacking, supremacy head, richer
features, eight-season history, calibration, draw-rule config, RPS reporting).
Production:
tuned Random Forest, RPS 0.2068, season 214H/85D/81A (22.4% draws).

Conventions for every phase below: disjoint calibration/eval slices stay
untouched by selection, draw band 18–27% is a hard constraint, one feature
commit per phase, full suite + pipeline regen + export + README + web build
before pushing.

## Phase 6 — Calibration upgrade (complete)

**Goal:** replace single-temperature scaling with properly compared
calibrators. Implemented in `src/models.py` with persisted winner and scores;
tree members compare prefit sigmoid and isotonic against temperature using RPS
on the calibration slice, while headline metrics remain on the untouched
evaluation slice; temperature is retained as fallback.
Calibration checkpoint round-trip and probability-total tests are in
`tests/test_ensemble.py`.

## Phase 7 — Draw rule to config (complete)

**Goal:** end hand-tuned constants. Implemented with all four thresholds in
`config.yaml` under `model.draw_rule`; `favor_outcome_from_proba()` reads the
shared configuration with module-level backward-compatible defaults. Added an
RPS grid tuner that constrains both market regimes and the forecast slate to
18–27% draws, plus config-read and constraint tests in `tests/test_odds.py`.

## Phase 8 — RPS everywhere (complete)

**Goal:** reporting catches up with selection (RPS already selects
production; displays still lead with accuracy).
Implemented: `src/evaluate.py` now emits reliability and per-model RPS
diagnostics; `export_web_data.py`, `web/src/types/index.ts`, and the Model page
carry and display RPS as the primary benchmark metric; the README and AGENTS
policy retain accuracy/log-loss for continuity. The generated dashboard data
includes the RPS values and diagnostic entry.

## Deferred (explicitly not planned)

- Player availability / line-up features: no timestamped free source
  found; building on untimestamped data would leak. Revisit only with
  a kickoff-stamped feed.
- Deeper history than 2018/19: diminishing returns observed (older
  football needed 365-day decay to avoid dilution); revisit after
  Phase 6–8 land.
