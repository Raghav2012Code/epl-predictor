"""Dependency pins must describe the environment that actually runs the code.

The previous pins described a stack nobody was running. The working
environment resolved to pandas 3.0.5, numpy 2.4.6, scikit-learn 1.9.0 and
xgboost 3.2.0 while CI installed scikit-learn 1.4.2, so CI validated a
different stack than the one that trained the checkpoint. A scikit-learn API
removal that silently disabled two of the three calibration paths reached main
because the build was never exercising the failing version.
"""

from __future__ import annotations

import importlib.metadata as metadata
from pathlib import Path

import pytest

REQUIREMENTS = Path(__file__).resolve().parents[1] / "requirements.txt"


def _pins() -> dict[str, str]:
    pins: dict[str, str] = {}
    for line in REQUIREMENTS.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        assert "==" in stripped, f"requirements must be exactly pinned, got: {stripped}"
        name, _, version = stripped.partition("==")
        pins[name.strip()] = version.strip()
    return pins


def test_requirements_are_exactly_pinned() -> None:
    pins = _pins()
    assert len(pins) >= 15, "the dependency set looks truncated"
    for name, version in pins.items():
        assert version, f"{name} has an empty version pin"


@pytest.mark.parametrize("package", sorted(_pins()))
def test_installed_version_matches_the_pin(package: str) -> None:
    pinned = _pins()[package]
    try:
        installed = metadata.version(package)
    except metadata.PackageNotFoundError:  # pragma: no cover - environment issue
        pytest.fail(f"{package} is pinned at {pinned} but is not installed")

    assert installed == pinned, (
        f"{package}: installed {installed} but requirements.txt pins {pinned}. "
        "Reinstall from requirements.txt, or update the pin to match the "
        "environment that actually runs the pipeline."
    )
