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
            "scoreline_kl": cells[6],
            "variety": cells[7],
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
        quality = source.get("scoreline_quality") or {}
        assert documented["scoreline_kl"] == f"{round(float(quality.get('kl_divergence', 0.0)), 4):.4f}", name
        assert documented["variety"] == f"{round(float(quality.get('argmax_variety', 0.0)) * 100, 1)}%", name

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
        quality = source.get("scoreline_quality") or {}
        assert f"{round(float(quality.get('kl_divergence', 0.0)), 4):.4f}" in docs, f"{name} scoreline KL missing from docs"
        assert f"{round(float(quality.get('argmax_variety', 0.0)) * 100, 1)}%" in docs, f"{name} variety missing from docs"


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
        quality = source.get("scoreline_quality") or {}
        assert model["scorelineKl"] == round(float(quality.get("kl_divergence", 0.0)), 4)
        assert model["argmaxVariety"] == round(float(quality.get("argmax_variety", 0.0)) * 100, 1)

    production_quality = metrics.get("scoreline_quality") or {}
    receipt = benchmark.get("scorelineQuality") or {}
    assert receipt.get("klDivergence") == round(float(production_quality.get("kl_divergence", 0.0)), 4)
    assert receipt.get("argmaxVariety") == round(float(production_quality.get("argmax_variety", 0.0)) * 100, 1)


def test_metrics_artifact_carries_fold_receipts():
    metrics = json.loads((REPOSITORY_ROOT / "models/metrics.json").read_text(encoding="utf-8"))
    validation = metrics.get("validation") or {}
    assert validation.get("n_folds") == 3
    assert len(validation.get("fold_train_rows", [])) == 3
    assert len(validation.get("fold_val_rows", [])) == 3
    assert len(validation.get("fold_val_starts", [])) == 3
    pooled = validation.get("pooled_metrics") or {}
    assert set(pooled) == set(metrics["models"])
    assert metrics["production_model"] in pooled


def test_top_scorelines_consistent_across_csv_markdown_and_dataset(tmp_path):
    """The top-3 block reads identically on every surface for the same fixture.

    Builds one forecast row in memory, serializes it through the real CSV
    expansion, Markdown report, and dataset-JSON mapping, then checks the
    values agree byte-for-byte (headline pick first, one-decimal percents).
    The committed artifacts cannot be regenerated in this worktree, so the
    pipeline/export entry points are not run here.
    """
    import pandas as pd

    from export_web_data import fixture_top_scorelines
    from src.pipeline import PremierLeaguePredictionPipeline, expand_top_scorelines_column

    row = {
        "gameweek": 1,
        "date": "2026-08-15",
        "time": "15:00",
        "home_team": "Arsenal",
        "away_team": "Chelsea",
        "home_win_prob": 50.0,
        "draw_prob": 27.0,
        "away_win_prob": 23.0,
        "predicted_outcome": "Home Win",
        "predicted_score": "2 - 1",
        "pred_home_goals": 2,
        "pred_away_goals": 1,
        "actual_score": "-",
        "status": "Upcoming",
        "top_scorelines": [
            {"score": "2 - 1", "prob": 11.2},
            {"score": "1 - 0", "prob": 9.8},
            {"score": "2 - 0", "prob": 8.1},
        ],
    }
    flat = expand_top_scorelines_column(pd.DataFrame([row]))
    csv_path = tmp_path / "preds.csv"
    flat.to_csv(csv_path, index=False)
    csv_row = pd.read_csv(csv_path).iloc[0]

    pipe = PremierLeaguePredictionPipeline()
    pipe.best_model_name = "Stacked"
    pipe.metrics = {
        "Stacked": {
            "accuracy": 0.5,
            "macro_f1": 0.4,
            "log_loss": 1.0,
            "avg_goal_mae": 0.9,
            "within_1_goal_acc": 0.6,
            "scoreline_quality": {"kl_divergence": 1.0, "argmax_variety": 0.2, "n_matches": 10},
        }
    }
    md_path = tmp_path / "preds.md"
    pipe._export_markdown_report(flat, str(md_path))
    md = md_path.read_text(encoding="utf-8")

    dataset_block = fixture_top_scorelines(csv_row)

    # Field presence on every surface.
    for n in (1, 2, 3):
        assert f"top{n}_score" in flat.columns
        assert f"top{n}_prob" in flat.columns
    assert "Top 3" in md
    assert len(dataset_block) == 3

    # Cross-surface byte-consistency: the same fixture, the same strings.
    for n, entry in enumerate(dataset_block, 1):
        assert entry["score"] == str(csv_row[f"top{n}_score"])
        assert entry["prob"] == round(float(csv_row[f"top{n}_prob"]), 1)
        assert f"{entry['score']} ({entry['prob']:.1f}%)" in md
    # Headline pick first, alternatives most likely first.
    assert dataset_block[0]["score"] == str(csv_row["predicted_score"])
    assert dataset_block[1]["prob"] >= dataset_block[2]["prob"]


def test_markdown_report_carries_scoreline_quality():
    from pathlib import Path as _Path

    md = (_Path(__file__).resolve().parents[1] / "data" / "predictions_2026_2027.md").read_text(encoding="utf-8")
    metrics = json.loads((REPOSITORY_ROOT / "models/metrics.json").read_text(encoding="utf-8"))
    assert "Scoreline KL" in md
    assert "Variety" in md
    rows = {}
    for line in md.splitlines():
        match = re.match(r"^\|\s*(Random Forest|XGBoost|Stacked)\s*\|(.+)\|$", line.strip())
        if match:
            rows[match.group(1)] = [cell.strip() for cell in match.group(2).split("|")]
    for name, source in metrics["models"].items():
        quality = source.get("scoreline_quality") or {}
        # The Markdown table formatter strips trailing zeros (8.4940 -> 8.494),
        # so compare values, not substrings; a stale number still fails.
        kl_cell = float(rows[name][-2])
        assert abs(kl_cell - round(float(quality.get("kl_divergence", 0.0)), 4)) < 5e-5, name
        assert rows[name][-1] == f"{round(float(quality.get('argmax_variety', 0.0)) * 100, 1)}%", name
