"""Utility script to serialize predictions, historical statistics, benchmarks,
and simulated standings into an optimized JSON dataset for the web dashboard.

Industry notes:
- Benchmark metrics are NEVER hardcoded. They are computed live by training
  and evaluating the pipeline (time-series split), so the dashboard always
  reflects the true model state.
- Diagnostics image paths are stored relative ("visuals/<id>.png") so the
  Vite build works with any `base` (see vite.config.ts `base: './'`).
  The frontend resolves them via `import.meta.env.BASE_URL`.
- Club analytics (cumulative gameweek series, venue splits, rest-day means,
  historical possession / shots averages) are derived deterministically from
  real fixtures + historical data. No synthetic placeholder stats.
"""

from __future__ import annotations

import json
import os
import shutil
from typing import Any, Dict, List

import numpy as np
import pandas as pd

from src.data_loader import load_historical_stats
from src.pipeline import PremierLeaguePredictionPipeline

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DATA_DIR = os.path.join(BASE_DIR, "web", "src", "data")
WEB_PUBLIC_VISUALS = os.path.join(BASE_DIR, "web", "public", "visuals")
CSV_PREDICTIONS = os.path.join(BASE_DIR, "data", "predictions_2026_2027.csv")

# Team primary accent colors for professional sports styling
CLUB_METADATA: Dict[str, Dict[str, str]] = {
    "Arsenal": {"short": "ARS", "color": "#EF0107", "stadium": "Emirates Stadium"},
    "Aston Villa": {"short": "AVL", "color": "#95BFE5", "stadium": "Villa Park"},
    "Bournemouth": {"short": "BOU", "color": "#DA291C", "stadium": "Vitality Stadium"},
    "Brentford": {"short": "BRE", "color": "#E30613", "stadium": "Gtech Community Stadium"},
    "Brighton": {"short": "BHA", "color": "#0057B8", "stadium": "Amex Stadium"},
    "Chelsea": {"short": "CHE", "color": "#034694", "stadium": "Stamford Bridge"},
    "Crystal Palace": {"short": "CRY", "color": "#1B458F", "stadium": "Selhurst Park"},
    "Everton": {"short": "EVE", "color": "#003399", "stadium": "Goodison Park"},
    "Fulham": {"short": "FUL", "color": "#FFFFFF", "stadium": "Craven Cottage"},
    "Ipswich": {"short": "IPS", "color": "#0053A0", "stadium": "Portman Road"},
    "Leeds": {"short": "LEE", "color": "#FFCD00", "stadium": "Elland Road"},
    "Liverpool": {"short": "LIV", "color": "#C8102E", "stadium": "Anfield"},
    "Manchester City": {"short": "MCI", "color": "#6CABDD", "stadium": "Etihad Stadium"},
    "Manchester United": {"short": "MUN", "color": "#DA291C", "stadium": "Old Trafford"},
    "Newcastle": {"short": "NEW", "color": "#241F20", "stadium": "St. James' Park"},
    "Nottingham Forest": {"short": "NFO", "color": "#DD0000", "stadium": "City Ground"},
    "Sunderland": {"short": "SUN", "color": "#EB172B", "stadium": "Stadium of Light"},
    "Tottenham": {"short": "TOT", "color": "#132257", "stadium": "Tottenham Hotspur Stadium"},
    "Coventry": {"short": "COV", "color": "#0099FF", "stadium": "Coventry Building Society Arena"},
    "Hull": {"short": "HUL", "color": "#FFA500", "stadium": "MKM Stadium"},
}

FEATURE_CATEGORIES: Dict[str, str] = {
    "elo_diff": "Elo Rating",
    "home_elo": "Elo Rating",
    "away_elo": "Elo Rating",
    "home_elo_momentum_3": "Momentum",
    "away_elo_momentum_3": "Momentum",
    "diff_elo_momentum_3": "Momentum",
    "home_elo_momentum_5": "Momentum",
    "away_elo_momentum_5": "Momentum",
    "diff_elo_momentum_5": "Momentum",
    "h2h_home_win_rate": "H2H",
    "h2h_goal_diff": "H2H",
    "h2h_matches_count": "H2H",
    "diff_rest_days": "Fatigue",
}

FEATURE_DESCRIPTIONS: Dict[str, str] = {
    "elo_diff": "Pre-match Elo differential incl. home advantage (+65 pts)",
    "home_elo": "Home club dynamic Elo rating (zero-leakage chronological)",
    "away_elo": "Away club dynamic pre-match Elo rating",
    "home_elo_momentum_3": "Home Elo velocity over last 3 matches",
    "away_elo_momentum_3": "Away Elo velocity over last 3 matches",
    "diff_elo_momentum_3": "Elo momentum differential (3-match window)",
    "home_elo_momentum_5": "Home Elo velocity over last 5 matches",
    "away_elo_momentum_5": "Away Elo velocity over last 5 matches",
    "diff_elo_momentum_5": "Elo momentum differential (5-match window)",
    "h2h_home_win_rate": "Head-to-head home win rate (last 5 meetings)",
    "h2h_goal_diff": "Head-to-head average goal difference",
    "h2h_matches_count": "Head-to-head sample size (prior meetings)",
    "diff_rest_days": "Rest-day differential (home minus away)",
}


def _feature_category(name: str) -> str:
    if name in FEATURE_CATEGORIES:
        return FEATURE_CATEGORIES[name]
    if "possession" in name:
        return "Momentum" if "_3" in name else "Control"
    if "shots_target" in name:
        return "Attack"
    if "goals" in name:
        return "Attack" if "for" in name else "Defense"
    if "points" in name:
        return "Form"
    if "rest_days" in name:
        return "Fatigue"
    if "venue" in name:
        return "Venue"
    return "Form"


def _feature_description(name: str) -> str:
    if name in FEATURE_DESCRIPTIONS:
        return FEATURE_DESCRIPTIONS[name]
    parts = name.replace("diff_roll_", "Rolling differential ").replace("home_roll_", "Home rolling ").replace(
        "away_roll_", "Away rolling "
    ).replace("venue_roll_", "Venue rolling ").replace("_", " ")
    return f"{parts.strip().capitalize()} (zero-leakage rolling average)"


def _copy_visuals() -> None:
    os.makedirs(WEB_PUBLIC_VISUALS, exist_ok=True)
    visuals_src = os.path.join(BASE_DIR, "visuals")
    if os.path.exists(visuals_src):
        for img in sorted(os.listdir(visuals_src)):
            if img.endswith(".png"):
                shutil.copy2(os.path.join(visuals_src, img), os.path.join(WEB_PUBLIC_VISUALS, img))
        print("      - Copied diagnostic visuals to web/public/visuals/")


def _resolve_result(hg: int, ag: int) -> str:
    if hg > ag:
        return "H"
    if hg < ag:
        return "A"
    return "D"


def build_benchmark(pipeline: PremierLeaguePredictionPipeline) -> Dict[str, Any]:
    """Builds benchmark payload from LIVE pipeline metrics (never hardcoded)."""
    metrics = pipeline.metrics
    best = pipeline.best_model_name

    models_payload: List[Dict[str, Any]] = []
    for name in ("Random Forest", "XGBoost"):
        if name not in metrics:
            continue
        m = metrics[name]
        models_payload.append(
            {
                "name": name,
                "isProduction": name == best,
                "accuracy": round(float(m["accuracy"]) * 100, 1),
                "macroF1": round(float(m["macro_f1"]), 3),
                "logLoss": round(float(m["log_loss"]), 3),
                "homeGoalMae": round(float(m["mae_home_goals"]), 2),
                "awayGoalMae": round(float(m["mae_away_goals"]), 2),
                "avgGoalMae": round(float(m["avg_goal_mae"]), 2),
                "within1Goal": round(float(m["within_1_goal_acc"]) * 100, 1),
                "exactScoreAcc": round(float(m.get("exact_score_acc", 0.0)) * 100, 1),
            }
        )

    # Production feature importances (top 8, deterministic order)
    fi_series = metrics[best]["feature_importances"]
    top_features: List[Dict[str, Any]] = []
    for feat_name, importance in list(fi_series.head(8).items()):
        top_features.append(
            {
                "name": str(feat_name),
                "importance": round(float(importance), 4),
                "category": _feature_category(str(feat_name)),
                "desc": _feature_description(str(feat_name)),
            }
        )

    return {
        "productionModel": best,
        "models": models_payload,
        "topFeatures": top_features,
        # Relative paths: frontend prefixes with import.meta.env.BASE_URL
        "diagnostics": [
            {
                "id": "confusion_matrix",
                "title": "Confusion Matrix",
                "src": "visuals/confusion_matrix.png",
                "caption": "Normalized class accuracy across Home Win, Draw, and Away Win (time-series validation).",
            },
            {
                "id": "feature_importance",
                "title": "Feature Importance",
                "src": "visuals/feature_importance.png",
                "caption": "Relative predictive weights from the production classifier.",
            },
            {
                "id": "model_metrics",
                "title": "Model Comparison",
                "src": "visuals/model_metrics_comparison.png",
                "caption": "Multi-metric evaluation across accuracy, F1, log loss, and goal MAE.",
            },
            {
                "id": "goal_error",
                "title": "Goal Error Residuals",
                "src": "visuals/goal_error_distribution.png",
                "caption": "Poisson goal residuals and actual vs predicted frequency.",
            },
        ],
    }


def build_historical_club_averages(raw_historical: pd.DataFrame) -> Dict[str, Dict[str, float]]:
    """Computes real per-club historical possession / shots-on-target averages."""
    poss_sum: Dict[str, float] = {}
    poss_n: Dict[str, int] = {}
    st_sum: Dict[str, float] = {}
    st_n: Dict[str, int] = {}

    for _, r in raw_historical.iterrows():
        try:
            ht, at = str(r["home_team"]), str(r["away_team"])
            hp = float(r.get("home_possession", np.nan))
            ap = float(r.get("away_possession", np.nan))
            hs = float(r.get("home_shots_target", np.nan))
            aws = float(r.get("away_shots_target", np.nan))
        except (ValueError, TypeError):
            continue
        for club, poss, st in ((ht, hp, hs), (at, ap, aws)):
            if np.isfinite(poss):
                poss_sum[club] = poss_sum.get(club, 0.0) + poss
                poss_n[club] = poss_n.get(club, 0) + 1
            if np.isfinite(st):
                st_sum[club] = st_sum.get(club, 0.0) + st
                st_n[club] = st_n.get(club, 0) + 1

    out: Dict[str, Dict[str, float]] = {}
    for club in set(list(poss_sum.keys()) + list(st_sum.keys())):
        out[club] = {
            "possession": round(poss_sum.get(club, 50.0) / max(1, poss_n.get(club, 1)), 1),
            "shotsTarget": round(st_sum.get(club, 4.0) / max(1, st_n.get(club, 1)), 1),
        }
    return out


def build_web_dataset() -> str:
    print("[1/3] Preparing web data export...")
    os.makedirs(WEB_DATA_DIR, exist_ok=True)

    # Train + evaluate live so benchmark reflects the true model state.
    # This also refreshes visuals/ via pipeline plots.
    pipeline = PremierLeaguePredictionPipeline()
    pipeline.prepare_data()
    pipeline.train_and_evaluate()
    if not os.path.exists(CSV_PREDICTIONS):
        pipeline.forecast_2026_2027_season()
    else:
        # Re-forecast on the freshly fitted best model so predictions,
        # standings, and benchmark can never drift out of sync.
        pipeline.forecast_2026_2027_season()

    _copy_visuals()

    df_preds = pd.read_csv(CSV_PREDICTIONS)
    df_preds["date"] = pd.to_datetime(df_preds["date"])

    # 1. Fixtures (chronological, stable ids)
    fixtures: List[Dict[str, Any]] = []
    for idx, r in df_preds.sort_values(["gameweek", "date"]).reset_index(drop=True).iterrows():
        ht, at = str(r["home_team"]), str(r["away_team"])
        fixtures.append(
            {
                "id": int(idx) + 1,
                "gameweek": int(r["gameweek"]),
                "date": str(pd.to_datetime(r["date"]).strftime("%Y-%m-%d")),
                "time": str(r.get("time", "15:00")),
                "homeTeam": ht,
                "awayTeam": at,
                "homeShort": CLUB_METADATA.get(ht, {}).get("short", ht[:3].upper()),
                "awayShort": CLUB_METADATA.get(at, {}).get("short", at[:3].upper()),
                "homeColor": CLUB_METADATA.get(ht, {}).get("color", "#38BDF8"),
                "awayColor": CLUB_METADATA.get(at, {}).get("color", "#F43F5E"),
                "stadium": CLUB_METADATA.get(ht, {}).get("stadium", f"{ht} Stadium"),
                "predictedScore": str(r["predicted_score"]),
                "predHomeGoals": int(r["pred_home_goals"]),
                "predAwayGoals": int(r["pred_away_goals"]),
                "homeWinProb": float(r["home_win_prob"]),
                "drawProb": float(r["draw_prob"]),
                "awayWinProb": float(r["away_win_prob"]),
                "predictedOutcome": str(r["predicted_outcome"]),
                "status": str(r["status"]),
                "actualScore": str(r["actual_score"]) if pd.notna(r.get("actual_score")) else "-",
            }
        )

    # 2. Standings + per-club gameweek series (single chronological pass)
    standings_map: Dict[str, Dict[str, Any]] = {}
    for club in CLUB_METADATA.keys():
        standings_map[club] = {
            "team": club,
            "short": CLUB_METADATA[club]["short"],
            "color": CLUB_METADATA[club]["color"],
            "played": 0,
            "won": 0,
            "drawn": 0,
            "lost": 0,
            "gf": 0,
            "ga": 0,
            "gd": 0,
            "points": 0,
            "form": [],
            "home": {"w": 0, "d": 0, "l": 0, "gf": 0, "ga": 0},
            "away": {"w": 0, "d": 0, "l": 0, "gf": 0, "ga": 0},
            "series": [],
        }

    def effective_goals(f: Dict[str, Any]) -> tuple[int, int]:
        if f["status"] == "Played" and f["actualScore"] != "-":
            try:
                parts = f["actualScore"].split("-")
                return int(parts[0].strip()), int(parts[1].strip())
            except (ValueError, IndexError):
                pass
        return int(f["predHomeGoals"]), int(f["predAwayGoals"])

    # Rest-day tracking from real fixture dates
    last_date: Dict[str, pd.Timestamp] = {}
    rest_gaps: Dict[str, List[float]] = {c: [] for c in CLUB_METADATA.keys()}

    for f in fixtures:
        ht, at = f["homeTeam"], f["awayTeam"]
        for club in (ht, at):
            if club not in standings_map:
                standings_map[club] = {
                    "team": club, "short": club[:3].upper(), "color": "#38BDF8",
                    "played": 0, "won": 0, "drawn": 0, "lost": 0,
                    "gf": 0, "ga": 0, "gd": 0, "points": 0, "form": [],
                    "home": {"w": 0, "d": 0, "l": 0, "gf": 0, "ga": 0},
                    "away": {"w": 0, "d": 0, "l": 0, "gf": 0, "ga": 0},
                    "series": [],
                }
                rest_gaps[club] = []
        f_date = pd.to_datetime(f["date"])
        for club in (ht, at):
            if club in last_date:
                gap = (f_date - last_date[club]).days
                if 0 < gap < 60:
                    rest_gaps.setdefault(club, []).append(float(gap))
            last_date[club] = f_date

        hg, ag = effective_goals(f)
        res = _resolve_result(hg, ag)

        for club, scored, conceded, venue in ((ht, hg, ag, "home"), (at, ag, hg, "away")):
            row = standings_map[club]
            row["played"] += 1
            row["gf"] += scored
            row["ga"] += conceded
            row[venue]["gf"] += scored
            row[venue]["ga"] += conceded
            is_home = venue == "home"
            won = (res == "H" and is_home) or (res == "A" and not is_home)
            drawn = res == "D"
            if won:
                row["won"] += 1
                row["points"] += 3
                row["form"].append("W")
                row[venue]["w"] += 1
                pts = 3
            elif drawn:
                row["drawn"] += 1
                row["points"] += 1
                row["form"].append("D")
                row[venue]["d"] += 1
                pts = 1
            else:
                row["lost"] += 1
                row["form"].append("L")
                row[venue]["l"] += 1
                pts = 0
            row["gd"] = row["gf"] - row["ga"]
            row["series"].append(
                {
                    "gw": int(f["gameweek"]),
                    "gf": int(scored),
                    "ga": int(conceded),
                    "points": int(pts),
                    "cumPoints": int(row["points"]),
                    "cumGF": int(row["gf"]),
                    "cumGA": int(row["ga"]),
                    "cumGD": int(row["gd"]),
                }
            )

    standings_list = list(standings_map.values())
    standings_list.sort(key=lambda x: (x["points"], x["gd"], x["gf"]), reverse=True)
    for rank, item in enumerate(standings_list, 1):
        item["rank"] = rank
        item["last5"] = item["form"][-5:] if len(item["form"]) >= 5 else item["form"]

    # 3. League-wide analytics derived from the same fixtures
    home_wins = sum(1 for f in fixtures if f["predictedOutcome"] == "Home Win")
    draws = sum(1 for f in fixtures if f["predictedOutcome"] == "Draw")
    away_wins = sum(1 for f in fixtures if f["predictedOutcome"] == "Away Win")
    goals_per_gw: List[Dict[str, Any]] = []
    for gw in range(1, 39):
        gw_f = [f for f in fixtures if f["gameweek"] == gw]
        gh = sum(int(f["predHomeGoals"]) for f in gw_f)
        ga = sum(int(f["predAwayGoals"]) for f in gw_f)
        goals_per_gw.append(
            {"gw": gw, "goals": gh + ga, "homeGoals": gh, "awayGoals": ga,
             "avgPerMatch": round((gh + ga) / max(1, len(gw_f)), 2)}
        )
    analytics = {
        "outcomeDistribution": {
            "home": home_wins, "draw": draws, "away": away_wins,
            "homePct": round(home_wins / max(1, len(fixtures)) * 100, 1),
            "drawPct": round(draws / max(1, len(fixtures)) * 100, 1),
            "awayPct": round(away_wins / max(1, len(fixtures)) * 100, 1),
        },
        "goalsPerGameweek": goals_per_gw,
        "totalGoals": sum(g["goals"] for g in goals_per_gw),
        "avgGoalsPerMatch": round(sum(g["goals"] for g in goals_per_gw) / max(1, len(fixtures)), 2),
    }

    # 4. Benchmark from live metrics
    benchmark_data = build_benchmark(pipeline)

    # 5. Club profiles with REAL historical averages + derived splits
    hist_avgs = build_historical_club_averages(pipeline.raw_historical)
    teams_database: Dict[str, Dict[str, Any]] = {}
    for item in standings_list:
        club = item["team"]
        gaps = rest_gaps.get(club, [])
        avg_rest = round(float(np.mean(gaps)), 1) if gaps else 6.9
        ha = hist_avgs.get(club, {"possession": 50.0, "shotsTarget": 4.5})
        played = max(1, item["played"])
        teams_database[club] = {
            "name": club,
            "short": item["short"],
            "color": item["color"],
            "stadium": CLUB_METADATA.get(club, {}).get("stadium", f"{club} Stadium"),
            "rank": item["rank"],
            "points": item["points"],
            "played": item["played"],
            "won": item["won"],
            "drawn": item["drawn"],
            "lost": item["lost"],
            "gf": item["gf"],
            "ga": item["ga"],
            "gd": item["gd"],
            "gfPerMatch": round(item["gf"] / played, 2),
            "gaPerMatch": round(item["ga"] / played, 2),
            "winRate": round((item["won"] / played) * 100, 1),
            "last5Form": item["last5"],
            "restDaysAvg": avg_rest,
            "possessionAvg": ha["possession"],
            "shotsTargetAvg": ha["shotsTarget"],
            "homeSplit": item["home"],
            "awaySplit": item["away"],
        }

    club_series: Dict[str, List[Dict[str, Any]]] = {
        club: row["series"] for club, row in standings_map.items()
    }

    standings_out = [
        {k: v for k, v in item.items() if k not in ("series", "form", "home", "away")}
        for item in standings_list
    ]

    output_payload = {
        "season": "2026/2027",
        "totalMatches": len(fixtures),
        "gameweeksTotal": 38,
        "fixtures": fixtures,
        "standings": standings_out,
        "benchmark": benchmark_data,
        "teams": teams_database,
        "analytics": analytics,
        "clubSeries": club_series,
        "meta": {
            "productionModel": pipeline.best_model_name,
            "generatedBy": "export_web_data.py (live pipeline metrics)",
        },
    }

    json_path = os.path.join(WEB_DATA_DIR, "eplData.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(output_payload, f, indent=2)

    print(f"[3/3] Exported {json_path} ({len(fixtures)} fixtures, {len(standings_list)} teams)")
    print(f"      - Production model: {pipeline.best_model_name}")
    return json_path


if __name__ == "__main__":
    build_web_dataset()
