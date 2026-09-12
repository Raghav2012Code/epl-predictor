# PR #27 Review — `codex/full-remediation` → `main`

- **PR:** #27, "feat: complete EPL predictor remediation and dashboard redesign" by `abivan100-stack`
- **Scope:** +5,166 / −8,474 across 40 files (`HEAD 780e223` vs `main dc1156b`)
- **Reviewed:** 2026-09-12 (diff inspection + `tsc && vite build` in an isolated worktree)
- **CI:** no checks reported on the PR branch; local web build passes (see §2)

## 1. Verdict: do NOT merge as-is — request changes

The UI rewrite is shippable (build green, no dead imports, real fixes). But the PR also
commits regenerated forecast artifacts with **0 draws in 380 fixtures** (issue #5 regressed
from 1) and leaves three further core model defects untouched (#6 train/serve skew,
#13 cold-start fill, #16 frozen post-GW3 context). Merging now would publish a
demonstrably wrong forecast as "complete remediation".

**Merge only after** the blockers in §4 are fixed (plus the one-line outcome-swap fix and
the footer URL nit). If the dashboard is needed urgently, merge the `web/` half alone —
not `data/`, `models/`, or `src/` in their current state.

## 2. UI verification (done, no open doubts)

- `tsc && vite build` passes cleanly in an isolated worktree (`vite v5.4.21`, ~5 s).
- The 9 deleted components (`AnalyticsView`, `ClubView`, `GameweekView`,
  `MatchSimulator`, `Navbar`, `Sidebar`, `TelemetryBar`, `Logo`, `MatchCard`) are
  consolidated into single-file pages in `web/src/App.tsx` — nothing dangles.
  Stale-import scan of the PR tree: zero hits.
- `useEPLData` contract (loading / error / ready) matches `App.tsx` narrowing;
  every `className` used is defined in `styles/index.css` (incl. `team-mark`,
  `tone-*`, `table-wrap`, `two-column`); `Fixture`/`TeamProfile` fields used
  (`homeShort`, `awayColor`, `actualScore`, …) exist in `types/index.ts`;
  responsive breakpoints are present.

## 3. Per-issue results (25 open issues, oldest → newest)

| # | Issue | Result | Evidence |
|---|-------|--------|----------|
| #2 | Web build fails (unbalanced `ErrorBoundary`) | **Fixed** | Balanced pairs in PR `App.tsx`; `tsc && vite build` green |
| #3 | Rolling/Elo features on wrong fixture (41% rows) | **Fixed** | `_chronological()` + mergesort before rolling/merge (`feature_engineering.py:19-31`) |
| #4 | 113/380 predictions contradict own probabilities | **Fixed** | 0/380 contradict; outcome = argmax + constrained scoreline (`models.py:244,250-253`, `pipeline.py:271-272`) |
| #5 | 1 draw in 380 (Dixon-Coles rho inverted) | **Not fixed (regressed)** | Now **0/380** (222H/158A); `rho=0.11` unchanged (`models.py:164`) |
| #6 | Train/serve skew (serving-only shrinkage) | **Not fixed** | Shrinkage still serving-only (`feature_engineering.py:716-759` vs training `:381-419`) |
| #7 | Temperature tuned on benchmark slice | **Fixed** | Cal on first val half, report/select on disjoint second half (`models.py:335-344,349-371`) |
| #8 | Contradictory metric sets / README vs code | **Fixed** | All agree on Random Forest, lowest log-loss (`metrics.json:2`, `README:18-19`, `pipeline.py:126-131`) |
| #9 | Simulator compares wrong fixture leg | **Fixed** | Exact orientation matched first (PR `App.tsx` SimulatorPage) |
| #10 | Flipped scoreline/outcome not un-swapped | **Partial** | Score/goals/probs swapped, `predictedOutcome` **not** swapped in reverse fallback |
| #11 | Club select from Standings/search is no-op | **Fixed** | Single lifted `selectedClub` state, controlled ClubsPage |
| #12 | Inspection Studio sticks on previous GW | **Fixed** | `selectedId` reset via effect on GW/query change |
| #13 | Cold-start fills `diff_*` with league levels | **Not fixed** | Substring loop unchanged (`feature_engineering.py:542-548`); venue priors unreachable |
| #14 | Probs don't sum to 100 (101/380 rows) | **Fixed** | Largest-remainder to 0.1%; 0/380 bad rows (`pipeline.py:47-59`) |
| #15 | 78% kickoffs fabricated as 15:00 | **Fixed** | Fallback now `TBC` (`pipeline.py:255`, `export_web_data.py:275-276`); payload 285×TBC / 42×15:00 |
| #16 | Context frozen after GW3 (Arsenal 35-3-0/108) | **Not fixed** | Forecast `else: Upcoming` appends nothing (`pipeline.py:325-328`); Elo/form frozen |
| #17 | `predict.py` drops flags / exits 0 on errors | **Partial** | Error paths return 2, but default branch still drops `--offline/--retrain` (`predict.py:285`) |
| #18 | Drift guard dead code / order-blind | **Fixed** | `strict=True` + ordered-list compare (`validation.py:53-55,72-73`, `predict.py:145`) |
| #19 | `--gameweek` retrains from scratch | **Fixed** | CSV/checkpoint fast path first (`predict.py:83-90,48-50`) |
| #20 | `api.py` no CORS / dataset endpoint / health | **Fixed** | CORS + `/dataset` + 503-aware `/health` (`api.py:29,98-151`) |
| #21 | `nginx.conf` header / cache / 50x defects | **Partial** | Headers re-emitted + 50x added, but `X-XSS-Protection` still dropped in locations; duplicate `Cache-Control` remains |
| #22 | Analytics vs Standings disagree (746 vs 769) | **Fixed** | Single `effective_goals()` source, 497==497 + basis label (`export_web_data.py:323-330,441-443`) |
| #23 | A11y gaps (sort, modal) | **Partial** | aria-sort + buttons + Esc/initial-focus added; no focus-trap/Tab-cycle/return-focus; standings rows mouse-only |
| #24 | `Tcl_AsyncDelete` (no `Agg` backend) | **Fixed** | `matplotlib.use("Agg")` before pyplot (`evaluate.py:13-15`) |
| #25 | Tests green-by-construction, no CLI/API cover | **Partial** | Real CLI/API tests added (`test_interfaces.py`); no direct artifact-file checks |
| #26 | Dashboard polish ("AI control room") | **Fixed** | Genuine fixture-first light redesign; telemetry chrome removed |

**Tally: 16 fixed · 5 partial · 4 not fixed.**

## 4. Remaining work before merge (blockers first)

1. **#5 — restore a plausible draw rate.** Currently 0/380. Revisit the Dixon-Coles
   adjustment and the outcome-constrained argmax in `src/models.py:164,240-255`;
   target roughly the EPL ~20–25% band before republishing the CSV/JSON.
2. **#6 — kill the train/serve skew.** Either apply the `CLUB_POWER_INDEX`
   shrinkage in training too, or remove it from serving (`feature_engineering.py`
   `:381-419` vs `:716-759`). No shrunk feature the model never saw.
3. **#13 — fix the cold-start fill.** `diff_*` columns must fill with `0.0`, not a
   league level; reorder so venue priors are reachable (`feature_engineering.py:542-548`).
4. **#16 — unfreeze the forecast context.** Update Elo/form sequentially as simulated
   results append in the season loop (`pipeline.py:290-328`).
5. **#10 (one line)** — swap `predictedOutcome` alongside the score in the
   reverse-leg fallback in `SimulatorPage`.
6. **#17** — forward `--offline/--retrain` in the default branch (`predict.py:285`).
7. **#21** — re-add `X-XSS-Protection` inside location blocks (headers don't inherit)
   and emit a single `Cache-Control`.
8. **#23** — add focus-trap/Tab-cycle/return-focus to the diagnostic dialog and
   keyboard access to standings rows.
9. **Nits** — footer "View source" points at the fork
   (`abivan100-stack/epl-predictor`); repoint to `Raghav2012Code/epl-predictor`.
   Consider a direct artifact-file test (#25 remainder).

## 5. Issues safe to close after a corrected merge

Once the PR lands **with §4 addressed and artifacts regenerated**, these 16 can be
closed (each verified fixed in this review, pending re-verification of the final push):

**#2, #3, #4, #7, #8, #9, #11, #12, #14, #15, #18, #19, #20, #22, #24, #26**
plus **#5** once the draw rate is restored.

Keep open as follow-ups until finished: **#6, #10, #13, #16, #17, #21, #23, #25**.
