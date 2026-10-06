"""Centralized structured logging for the predictor library.

CLI scripts may still ``print`` user-facing output, but everything under
``src/`` must log through here so deployments can control verbosity and
routing via the ``LOG_LEVEL`` environment variable (e.g. ``LOG_LEVEL=DEBUG``).

Usage:
    from src.logging_config import get_logger
    logger = get_logger(__name__)
"""

from __future__ import annotations

import logging
import os
import sys

_CONFIGURED = False
_CONFIGURED_LEVEL = logging.INFO


def configure_logging(level: str | None = None) -> logging.Logger:
    """Configures the root ``epl`` logger once and returns it."""
    global _CONFIGURED, _CONFIGURED_LEVEL
    root = logging.getLogger("epl")
    chosen = (level or os.environ.get("LOG_LEVEL", "INFO")).upper()
    _CONFIGURED_LEVEL = getattr(logging, chosen, logging.INFO)
    root.setLevel(_CONFIGURED_LEVEL)
    if not _CONFIGURED:
        handler = logging.StreamHandler(sys.stderr)
        handler.setFormatter(
            logging.Formatter(
                fmt="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S",
            )
        )
        root.addHandler(handler)
        # Don't double-emit through the root logger's handlers.
        root.propagate = False
        _CONFIGURED = True
    return root


def get_logger(name: str) -> logging.Logger:
    """Returns a child logger under ``epl``, configuring once on first use.

    The configured level is applied to each logger as it is created. The CLI
    scripts import modules lazily after configure_logging() runs, so a child
    logger created later would otherwise inherit whatever the root level
    happened to be at that moment and silently ignore --verbose/--quiet.
    """
    configure_logging()
    logger = logging.getLogger(f"epl.{name}")
    logger.setLevel(_CONFIGURED_LEVEL)
    return logger
