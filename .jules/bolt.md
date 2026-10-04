# Bolt's Journal - Critical Performance Learnings

## 2025-05-18 - Avoid pandas `groupby().transform(lambda...)` closures for rolling metrics
**Learning:** In pandas, calling `.transform(lambda s: s.shift(1).rolling(...))` inside a loop over metrics invokes Python closure overhead per group across all metric columns. Pre-shifting metrics as a batch (`groupby()[metrics].shift(1)`) and calling bulk grouped `.rolling()` or `.ewm()` operations avoids the Python lambda fallback, accelerating feature dataset construction by ~70% (from ~1.03s down to ~0.30s).
**Action:** Always pre-shift grouped DataFrame metrics in vector operations before computing window aggregations (`rolling`, `ewm`, `expanding`) instead of passing custom Python lambdas to `groupby().transform()`.
