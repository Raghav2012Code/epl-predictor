# Bolt's Journal - Critical Performance Learnings

## 2025-05-18 - Avoid pandas `groupby().transform(lambda...)` closures for rolling metrics
**Learning:** In pandas, calling `.transform(lambda s: s.shift(1).rolling(...))` inside a loop over metrics invokes Python closure overhead per group across all metric columns. Pre-shifting metrics as a batch (`groupby()[metrics].shift(1)`) and calling bulk grouped `.rolling()` or `.ewm()` operations avoids the Python lambda fallback, accelerating feature dataset construction by ~70% (from ~1.03s down to ~0.30s).
**Action:** Always pre-shift grouped DataFrame metrics in vector operations before computing window aggregations (`rolling`, `ewm`, `expanding`) instead of passing custom Python lambdas to `groupby().transform()`.

## 2026-10-03 - Pre-grouping DataFrame subsets for batch feature extraction
**Learning:** In batch feature extraction (`build_fixture_features`), repeated DataFrame boolean filtering (`df[df["team"] == team_name]`) across 380+ fixtures creates substantial pandas overhead. Storing a pre-grouped dictionary (`team_by_name = {team: sub for team, sub in team_df.groupby("team", sort=False)}`) in `precomputed_context` reduces filtering time from O(N) to O(1) hash map lookups, speeding up batch extraction by ~24%.
**Action:** Always pre-group or index DataFrames by lookup keys in context objects when extracting single-entity slices repeatedly in batch pipelines or simulation loops.

## 2026-10-04 - Vectorizing Dixon-Coles bivariate Poisson grid calculations
**Learning:** Sequential Python `for` loops computing 11x11 bivariate Dixon-Coles Poisson grids row-by-row in `_source_probas` and `predict_scoreline` execute 242 loop iterations per match. Refactoring `compute_poisson_grid` to operate on 3D NumPy array tensors (`(N, 11, 11)`) vectorizes Dixon-Coles adjustments and outcome probability sums, achieving ~40x speedup for Poisson grid calculations without numerical loss ($7.7 \times 10^{-16}$ max diff).
**Action:** Always vectorize probability grid calculations across batch dimensions using NumPy 3D/broadcast array operations rather than iterating match-by-match in Python loops.
