"""Regression coverage for the intentionally disabled external live-odds API."""

from src.pipeline import PremierLeaguePredictionPipeline


def test_pipeline_does_not_expose_external_live_odds_client():
    pipeline = PremierLeaguePredictionPipeline()

    assert not hasattr(pipeline, "live_odds_df")
    assert not hasattr(pipeline, "refresh_live_odds")
