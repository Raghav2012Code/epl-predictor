# Remaining Phases

Status: Phases 0–5 complete (odds, tuning, stacking, supremacy head, richer
features, eight-season history). Production: tuned Random Forest, RPS 0.2068,
season 214H/85D/81A (22.4% draws). Phase 6 calibration upgrade is complete.

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

## Phase 7 — Draw rule to config

**Goal:** end hand-tuned constants (`DRAW_MARGIN*` in `src/models.py`,
retuned 6 times and counting).
- Move all four thresholds to `config.yaml` under `model.draw_rule`;
  `favor_outcome_from_proba()` reads them (module defaults preserved).
- Grid-search on the disjoint eval slice, objective RPS, draw share
  constrained to 18–27% on both eval regimes and the forecast slate.
- Commit the tuning receipt in the constants' comment (as done before).
- Files: `src/models.py`, `src/config.py`, `config.yaml`,
  `tests/test_odds.py` (regime test reads the same config).
- Acceptance: slate 18–27%, 0 mismatches, no manual constant edits after.

## Phase 8 — RPS everywhere

**Goal:** reporting catches up with selection (RPS already selects
production; displays still lead with accuracy).
- `src/evaluate.py`: RPS curves + per-model RPS panel in diagnostics.
- `export_web_data.py` + `web/src/types/index.ts` + Model page: RPS
  column in the benchmark table and API payload (additive fields only —
  the web already renders N models generically).
- README benchmark table leads with RPS; AGENTS.md selection policy
  already documents it, no change needed there.
- Acceptance: dashboard, API, and README all show RPS primary with
  accuracy/log-loss retained for continuity.

## Deferred (explicitly not planned)

- Player availability / line-up features: no timestamped free source
  found; building on untimestamped data would leak. Revisit only with
  a kickoff-stamped feed.
- Deeper history than 2018/19: diminishing returns observed (older
  football needed 365-day decay to avoid dilution); revisit after
  Phase 6–8 land.
