"""Evaluation and diagnostic visualization suite for Premier League predictors.

Generates Matplotlib charts for feature importance, confusion matrix,
benchmark metric comparisons, reliability and goal error distributions. The
images are styled to match the dashboard (docs/design-system.md): white paper,
navy ink, the home/draw/away outcome colours, and the production model in ink.
Figures are 10in wide so text displays near 1:1 at the dashboard's ~1000px plate
width; titles live in the dashboard, not the image.
"""

from __future__ import annotations

import os
from typing import Any, Dict, List, Optional, Tuple

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
import numpy as np
import pandas as pd

VISUALS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "visuals")

# Dashboard tokens (web/src/styles/tokens.css).
PAPER = "#ffffff"
LINE = "#dce1e8"
INK = "#13233a"
INK_SOFT = "#55657a"
HOME = "#1e7a4c"
DRAW = "#aeb7c2"
AWAY = "#2d5bd0"

# Models read as a ramp: the production (stacked) model is ink, benchmarks are lighter.
MODEL_COLORS = {"Random Forest": DRAW, "XGBoost": INK_SOFT, "Stacked": INK}
_FALLBACK_COLORS = [DRAW, INK_SOFT, INK, AWAY, HOME]

MONO_CMAP = LinearSegmentedColormap.from_list("dashboard_ink", [PAPER, "#c9d1dc", "#6f7f94", INK])

FIG_WIDTH = 10.0
DPI = 200


def ranked_probability_score(y_true, probas) -> float:
    """Ranked Probability Score for ordered Home/Draw/Away outcomes.

    Classes are ordered Away(0) < Draw(1) < Home(2); RPS averages the
    squared error of cumulative (threshold) forecasts, so near-misses
    (predicted Home, actual Draw) score better than far misses. Lower
    is better.
    """
    y = np.asarray(list(y_true), dtype=int).ravel()
    proba = np.asarray(probas, dtype=float)
    if proba.ndim != 2 or len(y) != len(proba):
        raise ValueError("probas must be an (N, K) matrix matching y_true.")
    n_classes = proba.shape[1]
    if n_classes < 2:
        raise ValueError("RPS needs at least 2 ordered classes.")
    thresholds = np.arange(n_classes - 1)
    cum_pred = np.cumsum(proba, axis=1)[:, thresholds]
    cum_true = (y[:, None] <= thresholds[None, :]).astype(float)
    return float(np.mean(np.sum((cum_pred - cum_true) ** 2, axis=1)) / (n_classes - 1))


# Shared by the plots and the dashboard export so both show identical numbers.
RESIDUAL_BINS = np.arange(-4.5, 5.5, 1)  # integer residuals -4..4
GOAL_BINS = np.arange(-0.5, 6.5, 1)  # goals per team 0..5
RELIABILITY_BINS = 8


def confusion_counts(y_true, preds) -> np.ndarray:
    """3x3 counts, rows actual and columns predicted, in Away/Draw/Home order."""
    cm = np.zeros((3, 3), dtype=int)
    for t, p in zip(y_true, preds):
        cm[int(t), int(p)] += 1
    return cm


def reliability_points(y_true, probas, cls: int, bins: int = RELIABILITY_BINS) -> List[Tuple[float, float, int]]:
    """(mean predicted, observed frequency, matches) per non-empty probability bin for one class."""
    y = np.asarray(y_true, dtype=int)
    p = np.asarray(probas, dtype=float)[:, cls]
    edges = np.linspace(0.0, 1.0, bins + 1)
    points = []
    for lo, hi in zip(edges[:-1], edges[1:]):
        mask = (p >= lo) & ((p < hi) if hi < 1 else (p <= hi))
        if np.any(mask):
            points.append((float(np.mean(p[mask])), float(np.mean(y[mask] == cls)), int(mask.sum())))
    return points


def goal_error_counts(y_hg, y_ag, pred_scores: List[Tuple[int, int]]) -> Dict[str, np.ndarray]:
    """Histogram counts for goal residuals (predicted minus actual) and goals per team."""
    pred_hg = np.array([s[0] for s in pred_scores])
    pred_ag = np.array([s[1] for s in pred_scores])
    y_hg = np.asarray(y_hg)
    y_ag = np.asarray(y_ag)
    return {
        "home_residuals": np.histogram(pred_hg - y_hg, bins=RESIDUAL_BINS)[0],
        "away_residuals": np.histogram(pred_ag - y_ag, bins=RESIDUAL_BINS)[0],
        "actual_goals": np.histogram(np.concatenate([y_hg, y_ag]), bins=GOAL_BINS)[0],
        "predicted_goals": np.histogram(np.concatenate([pred_hg, pred_ag]), bins=GOAL_BINS)[0],
    }


def _color(name: str, index: int) -> str:
    return MODEL_COLORS.get(name, _FALLBACK_COLORS[index % len(_FALLBACK_COLORS)])


def _setup() -> None:
    plt.rcParams.update(
        {
            "font.family": "sans-serif",
            "font.sans-serif": ["Segoe UI", "Arial", "DejaVu Sans"],
            "font.size": 9.5,
            "text.color": INK,
            "axes.labelcolor": INK_SOFT,
            "axes.edgecolor": LINE,
            "axes.titlecolor": INK,
            "axes.titlesize": 11,
            "axes.titleweight": "bold",
            "axes.titlelocation": "left",
            "axes.titlepad": 12,
            "xtick.color": INK_SOFT,
            "ytick.color": INK_SOFT,
            "figure.facecolor": PAPER,
            "axes.facecolor": PAPER,
            "legend.frameon": False,
            "legend.labelcolor": INK,
        }
    )


def _clean(ax, grid: str = "y") -> None:
    """Hairline grid on one axis, no top/right spines, ticks without marks."""
    ax.set_axisbelow(True)
    if grid:
        ax.grid(axis=grid, color=LINE, linewidth=0.8)
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    ax.tick_params(length=0)


def _save(fig, output_path: str) -> str:
    fig.savefig(output_path, dpi=DPI, bbox_inches="tight", pad_inches=0.15, facecolor=PAPER)
    plt.close(fig)
    return output_path


def _prepare(output_path: Optional[str], default_name: str) -> str:
    os.makedirs(VISUALS_DIR, exist_ok=True)
    _setup()
    return output_path or os.path.join(VISUALS_DIR, default_name)


def plot_feature_importance(
    rf_importances: pd.Series,
    xgb_importances: pd.Series,
    top_n: int = 10,
    output_path: Optional[str] = None,
    stacked_importances: Optional[pd.Series] = None,
) -> str:
    """Horizontal feature-importance bars, one panel per model."""
    output_path = _prepare(output_path, "feature_importance.png")
    panels = [("Random Forest", rf_importances), ("XGBoost", xgb_importances)]
    if stacked_importances is not None:
        panels.append(("Stacked", stacked_importances))
    fig, axes = plt.subplots(1, len(panels), figsize=(FIG_WIDTH, 4.6), sharey=False)
    axes = np.atleast_1d(axes)
    for index, (ax, (name, series)) in enumerate(zip(axes, panels)):
        top = series.head(top_n).iloc[::-1]
        labels = [str(label).replace("_", " ") for label in top.index]
        bars = ax.barh(labels, top.values, color=_color(name, index), height=0.68)
        ax.set_title(name)
        ax.tick_params(axis="y", labelsize=7.5)
        ax.xaxis.set_visible(False)
        _clean(ax, grid="")
        ax.spines["bottom"].set_visible(False)
        for bar in bars:
            ax.annotate(
                f"{bar.get_width():.3f}",
                xy=(bar.get_width(), bar.get_y() + bar.get_height() / 2),
                xytext=(4, 0),
                textcoords="offset points",
                va="center",
                color=INK,
                fontsize=7.5,
            )
        ax.set_xlim(0, float(top.values.max()) * 1.2 if len(top) else 1)
    fig.tight_layout(w_pad=2.5)
    return _save(fig, output_path)


def plot_confusion_matrices(
    y_true: np.ndarray,
    rf_preds: np.ndarray,
    xgb_preds: np.ndarray,
    output_path: Optional[str] = None,
    stacked_preds: Optional[np.ndarray] = None,
) -> str:
    """Row-normalised confusion matrices, one panel per model."""
    output_path = _prepare(output_path, "confusion_matrix.png")
    labels = ["Away", "Draw", "Home"]
    panels = [("Random Forest", rf_preds), ("XGBoost", xgb_preds)]
    if stacked_preds is not None:
        panels.append(("Stacked", stacked_preds))
    fig, axes = plt.subplots(1, len(panels), figsize=(FIG_WIDTH, 3.7))
    axes = np.atleast_1d(axes)
    for ax, (title, preds) in zip(axes, panels):
        cm = confusion_counts(y_true, preds)
        cm_norm = cm.astype("float") / np.maximum(1, cm.sum(axis=1)[:, np.newaxis])
        ax.imshow(cm_norm, cmap=MONO_CMAP, interpolation="nearest", vmin=0, vmax=1)
        ax.set_title(title)
        ax.set_xticks(range(3))
        ax.set_yticks(range(3))
        ax.set_xticklabels(labels)
        ax.set_yticklabels(labels if ax is axes[0] else [])
        ax.set_xlabel("Predicted")
        ax.set_ylabel("Actual" if ax is axes[0] else "")
        ax.tick_params(length=0)
        for spine in ax.spines.values():
            spine.set_visible(False)
        for i in range(3):
            for j in range(3):
                pct = cm_norm[i, j] * 100
                ax.text(
                    j,
                    i,
                    f"{pct:.0f}%\n{cm[i, j]}",
                    ha="center",
                    va="center",
                    fontsize=8.5,
                    fontweight="bold",
                    color=PAPER if pct > 50 else INK,
                )
    fig.tight_layout(w_pad=1.5)
    return _save(fig, output_path)


def plot_metrics_comparison(
    metrics: Dict[str, Dict[str, Any]],
    output_path: Optional[str] = None,
) -> str:
    """Grouped bars for accuracy / macro F1 / within-1-goal (0-1) and a
    separate panel for goal MAE (lower is better), so magnitudes are never
    mixed on one scale."""
    output_path = _prepare(output_path, "model_metrics_comparison.png")
    higher_keys = [("Accuracy", "accuracy"), ("Macro F1", "macro_f1"), ("Within 1 goal", "within_1_goal_acc")]
    models = list(metrics.keys())
    fig, (ax, ax2) = plt.subplots(1, 2, figsize=(FIG_WIDTH, 4.0), gridspec_kw={"width_ratios": [3, 1.4]})
    x = np.arange(len(higher_keys))
    width = 0.8 / max(1, len(models))
    for i, name in enumerate(models):
        vals = [metrics[name][key] for _, key in higher_keys]
        rects = ax.bar(
            x + (i - (len(models) - 1) / 2) * width, vals, width * 0.92, label=name, color=_color(name, i)
        )
        for rect in rects:
            ax.annotate(
                f"{rect.get_height():.3f}",
                (rect.get_x() + rect.get_width() / 2, rect.get_height()),
                xytext=(0, 3),
                textcoords="offset points",
                ha="center",
                fontsize=7.5,
                color=INK,
            )
    ax.set_xticks(x)
    ax.set_xticklabels([label for label, _ in higher_keys])
    ax.set_ylim(0, 1.0)
    ax.set_title("Higher is better")
    ax.legend(loc="upper right", ncol=len(models), fontsize=8)
    _clean(ax)
    mae = [metrics[name]["avg_goal_mae"] for name in models]
    bars = ax2.bar(models, mae, width=0.6, color=[_color(n, i) for i, n in enumerate(models)])
    for bar, value in zip(bars, mae):
        ax2.annotate(
            f"{value:.3f}",
            (bar.get_x() + bar.get_width() / 2, value),
            xytext=(0, 3),
            textcoords="offset points",
            ha="center",
            fontsize=7.5,
            color=INK,
        )
    ax2.set_ylim(0, max(mae) * 1.25)
    ax2.set_title("Goal error, lower is better")
    ax2.tick_params(axis="x", labelsize=7.5)
    _clean(ax2)
    fig.tight_layout(w_pad=2.5)
    return _save(fig, output_path)


def plot_reliability_curves(
    y_true: np.ndarray,
    probability_sets: Dict[str, np.ndarray],
    output_path: Optional[str] = None,
    bins: int = RELIABILITY_BINS,
) -> str:
    """Per-class reliability curves: observed frequency against predicted probability."""
    output_path = _prepare(output_path, "reliability_curves.png")
    fig, axes = plt.subplots(1, 3, figsize=(FIG_WIDTH, 3.6), sharex=True, sharey=True)
    labels = ["Away win", "Draw", "Home win"]
    for cls, ax in enumerate(axes):
        ax.plot([0, 1], [0, 1], linestyle=(0, (3, 3)), color=DRAW, linewidth=1)
        for i, (name, probas) in enumerate(probability_sets.items()):
            points = reliability_points(y_true, probas, cls, bins)
            centers = [point[0] for point in points]
            observed = [point[1] for point in points]
            ax.plot(centers, observed, marker="o", markersize=4, linewidth=1.6, label=name, color=_color(name, i))
        ax.set_title(labels[cls])
        ax.set_xlabel("Predicted probability")
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        _clean(ax, grid="both")
    axes[0].set_ylabel("Observed frequency")
    axes[-1].legend(loc="lower right", fontsize=8)
    fig.tight_layout(w_pad=1.5)
    return _save(fig, output_path)


def plot_rps_comparison(
    metrics: Dict[str, Dict[str, Any]] | Dict[str, float],
    output_path: Optional[str] = None,
) -> str:
    """RPS per model, making the production selection criterion explicit."""
    output_path = _prepare(output_path, "rps_comparison.png")
    values = {
        name: float(value.get("rps", 0.0)) if isinstance(value, dict) else float(value)
        for name, value in metrics.items()
    }
    names = list(values)
    scores = [values[name] for name in names]
    fig, ax = plt.subplots(figsize=(FIG_WIDTH * 0.7, 3.4))
    bars = ax.bar(names, scores, width=0.55, color=[_color(n, i) for i, n in enumerate(names)])
    for bar, score in zip(bars, scores):
        ax.annotate(
            f"{score:.4f}",
            (bar.get_x() + bar.get_width() / 2, score),
            xytext=(0, 3),
            textcoords="offset points",
            ha="center",
            fontsize=8.5,
            color=INK,
        )
    ax.set_ylim(0, max(scores) * 1.18 if scores else 1)
    ax.set_title("Ranked probability score, lower is better")
    _clean(ax)
    fig.tight_layout()
    return _save(fig, output_path)


def plot_goal_error_distribution(
    y_hg: np.ndarray,
    y_ag: np.ndarray,
    pred_scores: List[Tuple[int, int]],
    output_path: Optional[str] = None,
) -> str:
    """Goal residuals (home and away) and actual versus predicted goal counts."""
    output_path = _prepare(output_path, "goal_error_distribution.png")
    counts = goal_error_counts(y_hg, y_ag, pred_scores)
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(FIG_WIDTH, 3.8))
    residuals = (RESIDUAL_BINS[:-1] + RESIDUAL_BINS[1:]) / 2
    goals = (GOAL_BINS[:-1] + GOAL_BINS[1:]) / 2
    ax1.bar(residuals - 0.21, counts["home_residuals"], width=0.4, label="Home goals", color=HOME)
    ax1.bar(residuals + 0.21, counts["away_residuals"], width=0.4, label="Away goals", color=AWAY)
    ax1.set_title("Prediction error (predicted minus actual)")
    ax1.set_xlabel("Goals")
    ax1.set_ylabel("Matches")
    ax1.legend(fontsize=8)
    _clean(ax1)
    ax2.bar(goals - 0.21, counts["actual_goals"], width=0.4, label="Actual", color=INK)
    ax2.bar(goals + 0.21, counts["predicted_goals"], width=0.4, label="Predicted", color=DRAW)
    ax2.set_title("Goals per team per match")
    ax2.set_xlabel("Goals")
    ax2.legend(fontsize=8)
    _clean(ax2)
    fig.tight_layout(w_pad=2.5)
    return _save(fig, output_path)
