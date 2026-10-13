"""Top-3 scorelines served everywhere (issue #51, parent spec #47).

The forecast dict carries ``top_scorelines`` (headline pick first, probs as
one-decimal percents); the CSV/Markdown/dataset JSON surfaces expose the same
block; the dashboard renders it as text.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from src.feature_engineering import get_feature_column_names
from src.models import MatchPredictorModel


def _fitted_model(seed: int = 7, n: int = 24):
    cols = get_feature_column_names()
    rng = np.random.RandomState(seed)
    X = pd.DataFrame(rng.randn(n, len(cols)), columns=cols)
    model = MatchPredictorModel("rf")
    model.fit(
        X,
        pd.Series(rng.choice([0, 1, 2], size=n)),
        pd.Series(rng.poisson(1.5, size=n)),
        pd.Series(rng.poisson(1.2, size=n)),
    )
    return model, X


def test_top3_headline_first_then_most_likely_with_one_decimal_probs():
    model, X = _fitted_model()
    frame = X.head(3)
    top = model.predict_top_scorelines(frame)
    headline = model.predict_scoreline(frame)
    assert len(top) == 3
    for row, head in zip(top, headline):
        assert len(row) == 3
        # Headline pick first, alternatives most likely first.
        assert (row[0][0], row[0][1]) == head
        assert row[1][2] >= row[2][2]
        assert len({(h, a) for h, a, _ in row}) == 3
        for _, _, prob in row:
            assert prob == round(prob, 1)
            assert 0.0 <= prob <= 100.0


def test_top3_derives_from_fitted_grid_on_raw_means():
    model, X = _fitted_model()
    row = X.head(1)
    lam_h, lam_a = model.predict_expected_goals(row, apply_correction=False)
    grid, _ = model.compute_poisson_grid(
        lam_h,
        lam_a,
        max_goals=10,
        rho=model.scoreline_theta,
        dispersion=model.scoreline_dispersion,
    )
    grid = grid[0]
    ranked = sorted(
        ((h, a, round(float(grid[h, a]) * 100, 1)) for h in range(11) for a in range(11)),
        key=lambda entry: -entry[2],
    )
    head = model.predict_scoreline(row)[0]
    expected = [next(e for e in ranked if (e[0], e[1]) == head)]
    expected += [e for e in ranked if (e[0], e[1]) != head][:2]
    assert [tuple(e) for e in model.predict_top_scorelines(row)[0]] == expected


def test_top3_ignores_hand_bounded_goal_corrections():
    model, X = _fitted_model()
    frame = X.head(3)
    before = model.predict_top_scorelines(frame)
    model.home_goal_correction = 1.3
    model.away_goal_correction = 0.7
    assert model.predict_top_scorelines(frame) == before


def _forecast_row(**over):
    base = {
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
    base.update(over)
    return base


def test_csv_expansion_keeps_headline_first_and_values():
    from src.pipeline import expand_top_scorelines_column

    df = pd.DataFrame([_forecast_row()])
    flat = expand_top_scorelines_column(df)
    assert "top_scorelines" not in flat.columns
    for n, score, prob in ((1, "2 - 1", 11.2), (2, "1 - 0", 9.8), (3, "2 - 0", 8.1)):
        assert flat[f"top{n}_score"].iloc[0] == score
        assert flat[f"top{n}_prob"].iloc[0] == prob
    # The headline pick is the first entry.
    assert flat["top1_score"].iloc[0] == df["predicted_score"].iloc[0]


def test_markdown_report_carries_top3_block(tmp_path):
    from src.pipeline import PremierLeaguePredictionPipeline, expand_top_scorelines_column

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
    flat = expand_top_scorelines_column(pd.DataFrame([_forecast_row()]))
    out = tmp_path / "preds.md"
    pipe._export_markdown_report(flat, str(out))
    text = out.read_text(encoding="utf-8")
    assert "Most likely" in text
    assert "Top 3" in text
    cell = "2 - 1 (11.2%), 1 - 0 (9.8%), 2 - 0 (8.1%)"
    assert cell in text


def test_web_fixture_mapping_mirrors_csv_row():
    from export_web_data import fixture_top_scorelines

    row = pd.Series({"top1_score": "2 - 1", "top1_prob": 11.2,
                     "top2_score": "1 - 0", "top2_prob": 9.8,
                     "top3_score": "2 - 0", "top3_prob": 8.1})
    assert fixture_top_scorelines(row) == [
        {"score": "2 - 1", "prob": 11.2},
        {"score": "1 - 0", "prob": 9.8},
        {"score": "2 - 0", "prob": 8.1},
    ]
    # CSvs predating the block map to an empty list, never to None.
    assert fixture_top_scorelines(pd.Series({"predicted_score": "2 - 1"})) == []
