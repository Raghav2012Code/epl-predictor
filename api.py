"""Production HTTP serving surface for the Premier League predictor.

Endpoints:
    GET /health          liveness + model load state
    GET /model-info      checkpoint metadata (engine, features, calibration)
    GET /predict         single matchup (?home=Arsenal&away=Chelsea)
    GET /gameweek/{n}    all fixtures for gameweek 1-38 with probabilities

Run:
    uvicorn api:app --host 0.0.0.0 --port 8000

The service loads the cached checkpoint (offline data) at startup and
refuses to serve predictions when the checkpoint is missing or has
drifted from the current feature set.
"""

from __future__ import annotations

import hashlib
import os
import sys
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from src.logging_config import get_logger
from src.pipeline import DEFAULT_MODEL_PATH, PremierLeaguePredictionPipeline
from src.validation import assert_model_compatible, canonical_team, validate_gameweek

logger = get_logger(__name__)

_pipeline: Optional[PremierLeaguePredictionPipeline] = None
_model_error: Optional[str] = None


class OutcomePrediction(BaseModel):
    home_team: str = Field(examples=["Arsenal"])
    away_team: str = Field(examples=["Chelsea"])
    match_date: str = Field(examples=["2026-09-12"])
    predicted_score: str = Field(examples=["2 - 1"])
    pred_home_goals: int
    pred_away_goals: int
    expected_home_goals: float
    expected_away_goals: float
    home_win_prob: float
    draw_prob: float
    away_win_prob: float
    predicted_outcome: str
    model_used: str


class GameweekFixture(BaseModel):
    date: str
    time: str
    home_team: str
    away_team: str
    home_win_prob: float
    draw_prob: float
    away_win_prob: float
    predicted_outcome: str
    predicted_score: str
    status: str
    actual_score: str


def _load_pipeline() -> PremierLeaguePredictionPipeline:
    pipe = PremierLeaguePredictionPipeline()
    if not os.path.exists(DEFAULT_MODEL_PATH):
        raise RuntimeError(
            f"No checkpoint at {DEFAULT_MODEL_PATH}. Train first with `python run_pipeline.py`."
        )
    pipe.load_data(offline=None)
    pipe.load_model(DEFAULT_MODEL_PATH)
    assert_model_compatible(pipe.best_model, strict=True)
    return pipe


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _pipeline, _model_error
    try:
        _pipeline = _load_pipeline()
        logger.info("API model loaded: %s", _pipeline.best_model_name)
    except Exception as exc:
        _model_error = str(exc)
        logger.warning("API started without model: %s", exc)
    yield


app = FastAPI(title="EPL Predictor API", version="1.0.0", lifespan=lifespan)
cors_origins = [origin.strip() for origin in os.environ.get("EPL_CORS_ORIGINS", "*").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)


def _require_pipeline() -> PremierLeaguePredictionPipeline:
    if _pipeline is None or _pipeline.best_model is None:
        raise HTTPException(status_code=503, detail=_model_error or "Model not loaded.")
    return _pipeline


def _checkpoint_sha() -> Optional[str]:
    try:
        h = hashlib.sha256()
        with open(DEFAULT_MODEL_PATH, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                h.update(chunk)
        return h.hexdigest()[:16]
    except Exception:
        return None


@app.get("/health")
def health() -> Dict[str, Any]:
    payload = {
        "status": "ok" if _pipeline is not None else "degraded",
        "model_loaded": _pipeline is not None and _pipeline.best_model is not None,
        "model_error": _model_error,
    }
    if _pipeline is None:
        return JSONResponse(status_code=503, content=payload)  # type: ignore[return-value]
    return payload


@app.get("/dataset")
def dataset() -> Dict[str, Any]:
    """Return the same validated dataset consumed by the static dashboard."""
    import json

    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web", "src", "data", "eplData.json")
    if not os.path.exists(path):
        raise HTTPException(status_code=503, detail="Web dataset missing. Run export_web_data.py first.")
    try:
        with open(path, "r", encoding="utf-8") as handle:
            payload = json.load(handle)
        return payload
    except (OSError, ValueError) as exc:
        logger.warning("Dataset load failed: %s", exc)
        raise HTTPException(status_code=503, detail="Web dataset is invalid.") from exc


@app.get("/model-info")
def model_info() -> Dict[str, Any]:
    pipe = _require_pipeline()
    model = pipe.best_model
    assert model is not None
    return {
        "production_model": pipe.best_model_name,
        "model_type": model.model_type,
        "feature_count": len(model.feature_names),
        "calibration_temperature": getattr(model, "calibration_temperature", 1.0),
        "home_goal_correction": getattr(model, "home_goal_correction", 1.0),
        "away_goal_correction": getattr(model, "away_goal_correction", 1.0),
        "checkpoint_sha": _checkpoint_sha(),
    }


@app.get("/predict", response_model=OutcomePrediction)
def predict(
    home: str = Query(..., description="Home club, e.g. Arsenal"),
    away: str = Query(..., description="Away club, e.g. Chelsea"),
) -> Dict[str, Any]:
    pipe = _require_pipeline()
    try:
        home_std = canonical_team(home)
        away_std = canonical_team(away)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if home_std == away_std:
        raise HTTPException(status_code=400, detail="Home and away clubs must differ.")
    try:
        return pipe.predict_custom_match(home_std, away_std)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.warning("Prediction failed: %s", exc)
        raise HTTPException(status_code=500, detail="Prediction failed.") from exc


@app.get("/gameweek/{gameweek}", response_model=List[GameweekFixture])
def gameweek(gameweek: int) -> List[Dict[str, Any]]:
    import pandas as pd

    pipe = _require_pipeline()
    try:
        gw = validate_gameweek(gameweek)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "predictions_2026_2027.csv")
    if not os.path.exists(csv_path):
        raise HTTPException(status_code=503, detail="Predictions CSV missing. Run the pipeline first.")
    df = pd.read_csv(csv_path)
    gw_df = df[df["gameweek"] == gw]
    if gw_df.empty:
        raise HTTPException(status_code=404, detail=f"No fixtures for gameweek {gw}.")
    out: List[Dict[str, Any]] = []
    for _, r in gw_df.iterrows():
        time_val = r.get("time", "TBC")
        if not isinstance(time_val, str) or not time_val.strip():
            time_val = "TBC"
        out.append(
            {
                "date": str(r["date"]),
                "time": time_val,
                "home_team": str(r["home_team"]),
                "away_team": str(r["away_team"]),
                "home_win_prob": float(r["home_win_prob"]),
                "draw_prob": float(r["draw_prob"]),
                "away_win_prob": float(r["away_win_prob"]),
                "predicted_outcome": str(r["predicted_outcome"]),
                "predicted_score": str(r["predicted_score"]),
                "status": str(r["status"]),
                "actual_score": str(r["actual_score"]),
            }
        )
    return out


@app.exception_handler(HTTPException)
async def _http_error_handler(request, exc: HTTPException):  # type: ignore[no-untyped-def]
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})


@app.exception_handler(RequestValidationError)
async def _validation_error_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"error": "Invalid request.", "details": exc.errors()})
