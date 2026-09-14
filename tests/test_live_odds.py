"""Unit tests for the live odds client (all network mocked)."""

import io
import json
import os
from datetime import datetime

import pandas as pd
import pytest

import src.live_odds as live_mod
from src.live_odds import (
    fetch_live_odds,
    get_api_key,
    lookup_live_odds,
    parse_live_odds,
)


def _event(home, away, commence, books):
    return {
        "home_team": home,
        "away_team": away,
        "commence_time": commence,
        "bookmakers": books,
    }


def _book(prices, key="h2h", book="testbook"):
    home, draw, away = prices
    return {"key": book, "markets": [{"key": key, "outcomes": [
        {"name": "Home", "price": home},
        {"name": "Draw", "price": draw},
        {"name": "Away", "price": away},
    ]}]}


def test_get_api_key_absent_and_present(monkeypatch):
    monkeypatch.delenv("EPL_ODDS_API_KEY", raising=False)
    assert get_api_key() is None
    monkeypatch.setenv("EPL_ODDS_API_KEY", "  secret  ")
    assert get_api_key() == "secret"


def test_fetch_returns_none_without_key(monkeypatch):
    monkeypatch.delenv("EPL_ODDS_API_KEY", raising=False)
    assert fetch_live_odds() is None


def test_fetch_returns_none_on_transport_error(monkeypatch):
    monkeypatch.setenv("EPL_ODDS_API_KEY", "k")
    def boom(*a, **k):
        raise OSError("no route")
    monkeypatch.setattr(live_mod.urllib.request, "urlopen", boom)
    assert fetch_live_odds() is None


def test_fetch_caches_success(monkeypatch, tmp_path):
    monkeypatch.setenv("EPL_ODDS_API_KEY", "k")
    monkeypatch.setattr(live_mod, "LIVE_CACHE_DIR", str(tmp_path))
    body = json.dumps([_event("Arsenal", "Chelsea", "2026-10-01T12:00:00Z",
                              _book((2.0, 3.6, 4.0)))]) .encode()

    class Resp:
        def __enter__(self): return self
        def __exit__(self, *a): return False
        def read(self): return body

    monkeypatch.setattr(live_mod.urllib.request, "urlopen", lambda *a, **k: Resp())
    events = fetch_live_odds()
    assert isinstance(events, list) and len(events) == 1
    cached = os.listdir(str(tmp_path))
    assert len(cached) == 1 and cached[0].endswith(".json")


def test_parse_live_odds_consensus_and_names():
    events = [
        _event("Manchester City", "Wolverhampton Wanderers", "2026-10-01T12:00:00Z", [
            {"key": "book-a", "markets": [{"key": "h2h", "outcomes": [
                {"name": "Home", "price": 1.5},
                {"name": "Draw", "price": 4.5},
                {"name": "Away", "price": 7.0}]}]},
            {"key": "book-b", "markets": [{"key": "h2h", "outcomes": [
                {"name": "Home", "price": 1.6},
                {"name": "Draw", "price": 4.0},
                {"name": "Away", "price": 6.0}]}]},
        ]),
        _event("No Books", "Nowhere", "2026-10-01T12:00:00Z", []),  # skipped
        {"home_team": "Broken"},  # skipped
    ]
    frame = parse_live_odds(events)
    assert len(frame) == 1
    row = frame.iloc[0]
    assert row["home_team"] == "Manchester City"
    assert row["away_team"] == "Wolves"
    assert row["odds_source"] == "live:consensus"
    mean_h, mean_d, mean_a = 1.55, 4.25, 6.5
    tot = 1 / mean_h + 1 / mean_d + 1 / mean_a
    assert row["odds_implied_home"] == pytest.approx((1 / mean_h) / tot)
    assert row["odds_implied_home"] + row["odds_implied_draw"] + row["odds_implied_away"] == pytest.approx(1.0)
    assert pd.isna(row["odds_move_home"])


def test_lookup_live_odds_window_matching():
    frame = pd.DataFrame({
        "date": pd.to_datetime(["2026-10-03"]),
        "home_team": ["Arsenal"],
        "away_team": ["Chelsea"],
        "odds_implied_home": [0.55],
        "odds_implied_draw": [0.26],
        "odds_implied_away": [0.19],
        "odds_overround": [0.05],
        "odds_move_home": [float("nan")],
        "odds_source": ["live:consensus"],
        "season": ["live"],
    })
    # Fixture listed two days earlier still matches inside the window.
    hit = lookup_live_odds(frame, "Arsenal", "Chelsea", datetime(2026, 10, 1), window_days=9)
    assert hit is not None
    assert hit["odds_implied_home"] == pytest.approx(0.55)
    assert hit["odds_move_home"] == 0.0  # live board carries no movement leg
    # Outside the window, or wrong teams, or empty board: no match.
    assert lookup_live_odds(frame, "Arsenal", "Chelsea", datetime(2026, 9, 1)) is None
    assert lookup_live_odds(frame, "Arsenal", "Fulham", datetime(2026, 10, 1)) is None
    assert lookup_live_odds(pd.DataFrame(), "Arsenal", "Chelsea", datetime(2026, 10, 1)) is None
