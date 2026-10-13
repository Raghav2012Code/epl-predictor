"""Suite hermeticity: unit tests never see the committed tuning record.

``models/tuning.json`` drives serving behavior (tree params, and since the
joint receipt landed, the draw rule, blend weights, and scoreline defaults).
Tests asserting default/fallback behavior must not depend on whatever the
last tuning run recorded, so every test runs with an absent record unless
it points TUNING_PATH at its own fixture. End-to-end pipeline and export
runs still exercise the real committed record.
"""

from __future__ import annotations

import pytest


@pytest.fixture(autouse=True)
def _isolated_tuning_record(tmp_path, monkeypatch):
    import src.tuning as tuning_mod

    monkeypatch.setattr(
        tuning_mod, "TUNING_PATH", str(tmp_path / "absent-tuning.json")
    )
