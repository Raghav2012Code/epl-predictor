# Remaining Phases

Status: Phases 0–5 complete (odds, tuning, stacking, supremacy head, richer
features, eight-season history). Production: tuned Random Forest, RPS 0.2068,
season 214H/85D/81A (22.4% draws). Suite: 72 passing.

Conventions for every phase below: disjoint calibration/eval slices stay
untouched by selection, draw band 18–27% is a hard constraint, one feature
commit per phase, full suite + pipeline regen + export + README + web build
before pushing.

## Phase 6 — Calibration upgrade

**Goal:** replace single-temperature scaling with properly compared
calibrators.
- Compare `CalibratedClassifierCV(cv="prefit")` sigmoid vs isotonic against
  temperature on the disjoint eval slice (objective: RPS).
- Winner becomes the calibrator for all tree members; temperature path
  stays as fallback. Elo-Poisson member included in the comparison.
- Files: `src/models.py` (calibrate paths), `src/evaluate.py` (reliability
  curves), `tests/test_ensemble.py` (+ calibration tests).
- Acceptance: eval RPS improves over T-only; no draws-band regression.

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

## Live odds activation (no build needed)

- Set a free The Odds API key in `EPL_ODDS_API_KEY`; upcoming fixtures
  gain real pre-kickoff markets instead of neutral priors. Verify with
  `predict.py --match` (market-implied line appears) and one offline
  fallback run with the key unset.

## Deferred (explicitly not planned)

- Player availability / line-up features: no timestamped free source
  found; building on untimestamped data would leak. Revisit only with
  a kickoff-stamped feed.
- Deeper history than 2018/19: diminishing returns observed (older
  football needed 365-day decay to avoid dilution); revisit after
  Phase 6–8 land.
