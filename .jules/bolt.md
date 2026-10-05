# Bolt's Journal - Critical Performance Learnings

## 2025-05-18 - Avoid pandas `groupby().transform(lambda...)` closures for rolling metrics
**Learning:** In pandas, calling `.transform(lambda s: s.shift(1).rolling(...))` inside a loop over metrics invokes Python closure overhead per group across all metric columns. Pre-shifting metrics as a batch (`groupby()[metrics].shift(1)`) and calling bulk grouped `.rolling()` or `.ewm()` operations avoids the Python lambda fallback, accelerating feature dataset construction by ~70% (from ~1.03s down to ~0.30s).
**Action:** Always pre-shift grouped DataFrame metrics in vector operations before computing window aggregations (`rolling`, `ewm`, `expanding`) instead of passing custom Python lambdas to `groupby().transform()`.

## 2026-10-03 - Pre-grouping DataFrame subsets for batch feature extraction
**Learning:** In batch feature extraction (`build_fixture_features`), repeated DataFrame boolean filtering (`df[df["team"] == team_name]`) across 380+ fixtures creates substantial pandas overhead. Storing a pre-grouped dictionary (`team_by_name = {team: sub for team, sub in team_df.groupby("team", sort=False)}`) in `precomputed_context` reduces filtering time from O(N) to O(1) hash map lookups, speeding up batch extraction by ~24%.
**Action:** Always pre-group or index DataFrames by lookup keys in context objects when extracting single-entity slices repeatedly in batch pipelines or simulation loops.

## 2026-10-24 - Vectorize single-fixture EWM and multi-window rolling stats
**Learning:** Calling pandas `.ewm()` and slicing individual Series repeatedly inside single-fixture feature extraction (`extract_latest_team_stats`) incurs substantial Pandas Series allocation overhead (~0.1ms per `.ewm()` call across 24 calls per fixture). Converting the team's metrics slice to a 2D numpy array once and calculating EWM via fast Python list iteration reduces single-fixture feature extraction latency from ~25.2ms to ~14.5ms (~1.74x speedup).
**Action:** When calculating EWM or rolling window statistics over short single-entity historical slices in serving/fixture routines, convert metrics to 2D numpy arrays and calculate EWM using direct list iteration instead of invoking pandas `.ewm()`.
