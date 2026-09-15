"""Evaluation and diagnostic visualization suite for Premier League predictors.

Generates Matplotlib charts for feature importance, confusion matrix,
benchmark metric comparisons, and goal error distributions in a pure
black (#000000) and monochrome workstation aesthetic.
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

# Pure monochrome colormap from dark black-surface to crisp white
MONO_CMAP = LinearSegmentedColormap.from_list(
    "analyst_mono",
    ["#0A0A0C", "#1F1F23", "#3F3F46", "#71717A", "#A1A1AA", "#E4E4E7", "#FFFFFF"],
)


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


def plot_feature_importance(
    rf_importances: pd.Series,
    xgb_importances: pd.Series,
    top_n: int = 15,
    output_path: Optional[str] = None,
    stacked_importances: Optional[pd.Series] = None,
) -> str:
    """Generates horizontal side-by-side bars of top predictive features in monochrome black."""
    os.makedirs(VISUALS_DIR, exist_ok=True)
    if output_path is None:
        output_path = os.path.join(VISUALS_DIR, "feature_importance.png")

    panels = [("Random Forest", rf_importances, "#FFFFFF"), ("XGBoost", xgb_importances, "#A1A1AA")]
    if stacked_importances is not None:
        panels.append(("Stacked", stacked_importances, "#52525B"))
    fig, axes = plt.subplots(1, len(panels), figsize=(8 * len(panels), 8), sharey=False)
    fig.patch.set_facecolor("#000000")
    if len(panels) == 1:
        axes = [axes]

    for ax, (name, s, color) in zip(axes, panels):
        top_s = s.head(top_n).iloc[::-1]
        bars = ax.barh(top_s.index, top_s.values, color=color, alpha=0.9, edgecolor="#1F1F23", linewidth=0.5)
        ax.set_facecolor("#0A0A0C")
        ax.set_title(f"{name} Top {top_n} Features", color="#FFFFFF", fontsize=14, pad=12, fontweight="bold")
        ax.set_xlabel("Relative Importance", color="#A1A1AA", fontsize=11)
        ax.tick_params(colors="#A1A1AA", labelsize=10)
        ax.grid(axis="x", linestyle="--", alpha=0.2, color="#27272A")
        for spine in ax.spines.values():
            spine.set_color("#1F1F23")

        # Value annotations
        for bar in bars:
            width = bar.get_width()
            ax.annotate(
                f"{width:.3f}",
                xy=(width, bar.get_y() + bar.get_height() / 2),
                xytext=(5, 0),
                textcoords="offset points",
                ha="left",
                va="center",
                color="#FFFFFF",
                fontsize=9,
            )

    plt.suptitle(
        "Premier League Match Predictor - Feature Importance Comparison",
        color="#FFFFFF",
        fontsize=16,
        fontweight="bold",
        y=0.98,
    )
    plt.tight_layout()
    plt.savefig(output_path, dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()
    return output_path


def plot_confusion_matrices(
    y_true: np.ndarray,
    rf_preds: np.ndarray,
    xgb_preds: np.ndarray,
    output_path: Optional[str] = None,
    stacked_preds: Optional[np.ndarray] = None,
) -> str:
    """Generates normalized confusion matrix heatmaps in sleek monochrome black."""
    os.makedirs(VISUALS_DIR, exist_ok=True)
    if output_path is None:
        output_path = os.path.join(VISUALS_DIR, "confusion_matrix.png")

    labels = ["Away Win", "Draw", "Home Win"]
    panels = [("Random Forest", rf_preds), ("XGBoost", xgb_preds)]
    if stacked_preds is not None:
        panels.append(("Stacked", stacked_preds))
    fig, axes = plt.subplots(1, len(panels), figsize=(7 * len(panels), 6))
    fig.patch.set_facecolor("#000000")
    if len(panels) == 1:
        axes = [axes]

    for ax, (title, preds) in zip(axes, panels):
        # Calculate confusion matrix
        cm = np.zeros((3, 3), dtype=int)
        for t, p in zip(y_true, preds):
            cm[int(t), int(p)] += 1

        # Normalize by true class
        cm_norm = cm.astype("float") / np.maximum(1, cm.sum(axis=1)[:, np.newaxis])

        cax = ax.imshow(cm_norm, cmap=MONO_CMAP, interpolation="nearest", vmin=0, vmax=1)
        ax.set_facecolor("#0A0A0C")
        ax.set_title(f"{title} Confusion Matrix", color="#FFFFFF", fontsize=14, pad=12, fontweight="bold")
        ax.set_xticks(np.arange(3))
        ax.set_yticks(np.arange(3))
        ax.set_xticklabels(labels, color="#A1A1AA", fontsize=11)
        ax.set_yticklabels(labels, color="#A1A1AA", fontsize=11)
        ax.set_xlabel("Predicted Outcome", color="#A1A1AA", fontsize=12, labelpad=8)
        ax.set_ylabel("Actual Outcome", color="#A1A1AA", fontsize=12, labelpad=8)

        # Annotate percentages and counts
        for i in range(3):
            for j in range(3):
                val_pct = cm_norm[i, j] * 100
                count = cm[i, j]
                txt_color = "#000000" if val_pct > 55 else "#FFFFFF"
                ax.text(
                    j,
                    i,
                    f"{val_pct:.1f}%\n({count})",
                    ha="center",
                    va="center",
                    color=txt_color,
                    fontweight="bold",
                    fontsize=10,
                )

        for spine in ax.spines.values():
            spine.set_color("#1F1F23")

    plt.suptitle("Win / Draw / Loss Confusion Matrix (Normalized)", color="#FFFFFF", fontsize=16, fontweight="bold", y=1.02)
    plt.tight_layout()
    plt.savefig(output_path, dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()
    return output_path


def plot_metrics_comparison(
    metrics: Dict[str, Dict[str, Any]],
    output_path: Optional[str] = None,
) -> str:
    """Plots side-by-side grouped bars with split axes.

    Accuracy/F1/Within-1-Goal (higher-is-better, 0-1) share the left axis;
    Goal MAE (lower-is-better) uses the right axis so magnitudes are not
    visually conflated on a single scale.
    """
    os.makedirs(VISUALS_DIR, exist_ok=True)
    if output_path is None:
        output_path = os.path.join(VISUALS_DIR, "model_metrics_comparison.png")

    higher_keys = [
        ("Accuracy", "accuracy"),
        ("Macro F1", "macro_f1"),
        ("Within 1 Goal Acc", "within_1_goal_acc"),
    ]
    mae_key = ("Goal MAE (lower is better)", "avg_goal_mae")

    models = list(metrics.keys())
    x = np.arange(len(higher_keys))
    width = 0.35

    fig, ax = plt.subplots(figsize=(12, 6))
    fig.patch.set_facecolor("#000000")
    ax.set_facecolor("#0A0A0C")

    colors = ["#FFFFFF", "#71717A"]

    for i, model_name in enumerate(models):
        vals = [metrics[model_name][k[1]] for k in higher_keys]
        offset = (i - 0.5) * width
        rects = ax.bar(x + offset, vals, width, label=model_name, color=colors[i % len(colors)], alpha=0.9, edgecolor="#1F1F23", linewidth=0.5)

        for rect in rects:
            height = rect.get_height()
            ax.annotate(
                f"{height:.3f}",
                xy=(rect.get_x() + rect.get_width() / 2, height),
                xytext=(0, 4),
                textcoords="offset points",
                ha="center",
                va="bottom",
                color="#FFFFFF",
                fontweight="bold",
                fontsize=10,
            )

    ax.set_xticks(x)
    ax.set_xticklabels([k[0] for k in higher_keys], color="#A1A1AA", fontsize=11)
    ax.tick_params(colors="#A1A1AA")
    ax.set_ylim(0, 1.05)
    ax.set_ylabel("Accuracy / F1 (higher is better)", color="#A1A1AA", fontsize=11)
    ax.set_title("Random Forest vs XGBoost Performance Benchmark", color="#FFFFFF", fontsize=15, fontweight="bold", pad=15)
    ax.legend(facecolor="#000000", edgecolor="#1F1F23", labelcolor="#FFFFFF", fontsize=11, loc="upper left")
    ax.grid(axis="y", linestyle="--", alpha=0.2, color="#27272A")
    for spine in ax.spines.values():
        spine.set_color("#1F1F23")

    # Secondary axis for Goal MAE so lower-is-better is not mixed into 0-1 bars.
    ax2 = ax.twinx()
    mae_vals = [metrics[m][mae_key[1]] for m in models]
    ax2.plot(models, mae_vals, color="#E4E4E7", marker="o", linewidth=1.5, markersize=6, label=mae_key[0])
    for m_name, v in zip(models, mae_vals):
        ax2.annotate(f"{v:.3f}", xy=(m_name, v), xytext=(0, 8),
                     textcoords="offset points", ha="center", va="bottom",
                     color="#FFFFFF", fontweight="bold", fontsize=10)
    ax2.set_ylabel(mae_key[0], color="#A1A1AA", fontsize=11)
    ax2.tick_params(colors="#A1A1AA")

    plt.tight_layout()
    plt.savefig(output_path, dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()
    return output_path


def plot_reliability_curves(
    y_true: np.ndarray,
    probability_sets: Dict[str, np.ndarray],
    output_path: Optional[str] = None,
    bins: int = 8,
) -> str:
    """Plots per-class reliability curves for benchmark probability outputs."""
    os.makedirs(VISUALS_DIR, exist_ok=True)
    if output_path is None:
        output_path = os.path.join(VISUALS_DIR, "reliability_curves.png")
    y = np.asarray(y_true, dtype=int)
    fig, axes = plt.subplots(1, 3, figsize=(15, 5), sharex=True, sharey=True)
    labels = ["Away Win", "Draw", "Home Win"]
    edges = np.linspace(0.0, 1.0, bins + 1)
    for cls, ax in enumerate(axes):
        for name, probas in probability_sets.items():
            p = np.asarray(probas, dtype=float)[:, cls]
            centers, observed = [], []
            for lo, hi in zip(edges[:-1], edges[1:]):
                mask = (p >= lo) & ((p < hi) if hi < 1 else (p <= hi))
                if np.any(mask):
                    centers.append(float(np.mean(p[mask])))
                    observed.append(float(np.mean(y[mask] == cls)))
            ax.plot(centers, observed, marker="o", linewidth=1.3, label=name)
        ax.plot([0, 1], [0, 1], linestyle="--", color="#71717A", linewidth=1)
        ax.set_title(labels[cls], color="#FFFFFF")
        ax.set_xlabel("Mean predicted probability", color="#A1A1AA")
        ax.set_facecolor("#0A0A0C")
        ax.tick_params(colors="#A1A1AA")
        ax.grid(alpha=0.2, color="#27272A")
        for spine in ax.spines.values():
            spine.set_color("#1F1F23")
    axes[0].set_ylabel("Observed frequency", color="#A1A1AA")
    axes[-1].legend(facecolor="#000000", edgecolor="#1F1F23", labelcolor="#FFFFFF")
    fig.patch.set_facecolor("#000000")
    fig.suptitle("Outcome Probability Reliability Curves", color="#FFFFFF", fontweight="bold")
    plt.tight_layout()
    plt.savefig(output_path, dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()
    return output_path


def plot_goal_error_distribution(
    y_hg: np.ndarray,
    y_ag: np.ndarray,
    pred_scores: List[Tuple[int, int]],
    output_path: Optional[str] = None,
) -> str:
    """Plots goal prediction error distribution in pure black & white."""
    os.makedirs(VISUALS_DIR, exist_ok=True)
    if output_path is None:
        output_path = os.path.join(VISUALS_DIR, "goal_error_distribution.png")

    pred_hg = np.array([s[0] for s in pred_scores])
    pred_ag = np.array([s[1] for s in pred_scores])

    hg_errors = pred_hg - y_hg
    ag_errors = pred_ag - y_ag

    fig, axes = plt.subplots(1, 2, figsize=(14, 6))
    fig.patch.set_facecolor("#000000")

    bins = np.arange(-4.5, 5.5, 1)

    # Residuals plot
    ax1 = axes[0]
    ax1.set_facecolor("#0A0A0C")
    ax1.hist(
        [hg_errors, ag_errors],
        bins=bins,
        label=["Home Goal Residuals", "Away Goal Residuals"],
        color=["#FFFFFF", "#71717A"],
        alpha=0.85,
        edgecolor="#1F1F23",
        linewidth=0.5,
    )
    ax1.set_title("Goal Prediction Residuals (Pred - Actual)", color="#FFFFFF", fontsize=13, fontweight="bold", pad=10)
    ax1.set_xlabel("Goal Residual", color="#A1A1AA", fontsize=11)
    ax1.set_ylabel("Match Count", color="#A1A1AA", fontsize=11)
    ax1.tick_params(colors="#A1A1AA")
    ax1.legend(facecolor="#000000", edgecolor="#1F1F23", labelcolor="#FFFFFF")
    ax1.grid(axis="y", linestyle="--", alpha=0.2, color="#27272A")
    for spine in ax1.spines.values():
        spine.set_color("#1F1F23")

    # Actual vs Predicted Goal distribution comparison
    ax2 = axes[1]
    ax2.set_facecolor("#0A0A0C")
    all_actual = np.concatenate([y_hg, y_ag])
    all_pred = np.concatenate([pred_hg, pred_ag])
    g_bins = np.arange(-0.5, 6.5, 1)

    ax2.hist(
        [all_actual, all_pred],
        bins=g_bins,
        label=["Actual Goals per Team", "Predicted Goals per Team"],
        color=["#FFFFFF", "#71717A"],
        alpha=0.85,
        edgecolor="#1F1F23",
        linewidth=0.5,
    )
    ax2.set_title("Distribution: Actual vs Predicted Goals per Team", color="#FFFFFF", fontsize=13, fontweight="bold", pad=10)
    ax2.set_xlabel("Goals Count", color="#A1A1AA", fontsize=11)
    ax2.set_ylabel("Frequency", color="#A1A1AA", fontsize=11)
    ax2.tick_params(colors="#A1A1AA")
    ax2.legend(facecolor="#000000", edgecolor="#1F1F23", labelcolor="#FFFFFF")
    ax2.grid(axis="y", linestyle="--", alpha=0.2, color="#27272A")
    for spine in ax2.spines.values():
        spine.set_color("#1F1F23")

    plt.suptitle("Goal Prediction Diagnostic & Error Distributions", color="#FFFFFF", fontsize=15, fontweight="bold", y=1.02)
    plt.tight_layout()
    plt.savefig(output_path, dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()
    return output_path
