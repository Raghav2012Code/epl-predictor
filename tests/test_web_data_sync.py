import json
import re
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]


def _readme_benchmark_rows() -> dict[str, dict[str, str]]:
    """Parses the README benchmark table into per-model cell values."""
    text = (REPOSITORY_ROOT / "README.md").read_text(encoding="utf-8")
    rows: dict[str, dict[str, str]] = {}
    for line in text.splitlines():
        match = re.match(
            r"^\|\s*(Random Forest|XGBoost|Stacked)\s*\|(.+)\|\s*(Benchmark|Production)\s*\|$",
            line.strip(),
        )
        if not match:
            continue
        cells = [cell.strip() for cell in match.group(2).split("|") if cell.strip()]
        rows[match.group(1)] = {
            "accuracy": cells[0],
            "macro_f1": cells[1],
            "log_loss": cells[2],
            "rps": cells[3],
            "goal_mae": cells[4],
            "within_1": cells[5],
            "selection": match.group(3),
        }
    return rows


def test_documented_benchmark_matches_authoritative_model_metrics():
    """README and docs must transcribe models/metrics.json, not improvise it.

    The tables had drifted: Random Forest accuracy was documented as 48.3%
    against a real 47.7%, the stacked RPS as 0.2044 against a real 0.2043, and
    all three "within one goal" values were wrong. Two commits titled
    "synchronize release benchmark status" had re-published the same stale
    numbers. models/metrics.json is generated; the prose is not.
    """
    metrics = json.loads((REPOSITORY_ROOT / "models/metrics.json").read_text(encoding="utf-8"))
    rows = _readme_benchmark_rows()
    assert set(rows) == set(metrics["models"]), "README benchmark table is missing models"

    for name, source in metrics["models"].items():
        documented = rows[name]
        assert documented["accuracy"] == f"{round(source['accuracy'] * 100, 1)}%", name
        assert documented["macro_f1"] == f"{round(source['macro_f1'], 3):.3f}", name
        assert documented["log_loss"] == f"{round(source['log_loss'], 3):.3f}", name
        assert documented["rps"] == f"{round(source['rps'], 4):.4f}", name
        assert documented["goal_mae"] == f"{round(source['avg_goal_mae'], 2):.2f}", name
        assert documented["within_1"] == f"{round(source['within_1_goal_acc'] * 100, 1)}%", name

    production = metrics["production_model"]
    assert rows[production]["selection"] == "Production"
    for name, documented in rows.items():
        expected = "Production" if name == production else "Benchmark"
        assert documented["selection"] == expected, name


def test_documented_status_table_matches_authoritative_model_metrics():
    docs = (REPOSITORY_ROOT / "docs" / "remaining-phases.md").read_text(encoding="utf-8")
    metrics = json.loads((REPOSITORY_ROOT / "models/metrics.json").read_text(encoding="utf-8"))

    for name, source in metrics["models"].items():
        assert f"{round(source['rps'], 4):.4f}" in docs, f"{name} RPS missing from docs"
        assert f"{round(source['accuracy'] * 100, 1)}%" in docs, f"{name} accuracy missing from docs"
        assert f"{round(source['avg_goal_mae'], 2):.2f}" in docs, f"{name} goal MAE missing from docs"


def test_dashboard_benchmark_matches_authoritative_model_metrics():
    metrics = json.loads((REPOSITORY_ROOT / "models/metrics.json").read_text(encoding="utf-8"))
    dashboard = json.loads(
        (REPOSITORY_ROOT / "web/src/data/eplData.json").read_text(encoding="utf-8")
    )

    benchmark = dashboard["benchmark"]
    assert benchmark["productionModel"] == metrics["production_model"]
    assert len(benchmark["models"]) == len(metrics["models"])

    for model in benchmark["models"]:
        source = metrics["models"][model["name"]]
        assert model["accuracy"] == round(source["accuracy"] * 100, 1)
        assert model["rps"] == round(source["rps"], 4)
        assert model["avgGoalMae"] == round(source["avg_goal_mae"], 2)
