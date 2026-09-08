# Premier League Match Outcome & Scoreline Predictor (2026/27)

A complete machine learning system and interactive CLI for predicting English Premier League match outcomes (Win / Draw / Loss probabilities) and exact scorelines for the 2026/2027 season. Sourced from [`openfootball/england`](https://github.com/openfootball/england) schedules and historical Premier League match datasets (with shots, possession, corners, and goals).

---

## Key Features

1. **Dual-Model Architecture**:
   - **Win / Draw / Loss Classifier**: Outputs calibrated 3-way probabilities (`Home Win %`, `Draw %`, `Away Win %`).
   - **Scoreline Goal Regressors**: Poisson/Regression models predicting expected continuous goals (`Home xG` and `Away xG`) reconciled into exact predicted scorelines (e.g. `2 - 1`).
2. **Model Benchmarking**:
   - Side-by-side comparison between **Random Forest** and **XGBoost** trained strictly on chronological data (time-series split: pre-2024 train, 2024-2026 validation).
   - Evaluated on Classification Accuracy, Multi-class Log Loss, Macro F1, and Goal MAE.
3. **Zero-Leakage Rolling Feature Engineering**:
   - 3, 5, and 10-match rolling averages of goals scored, goals conceded, goal difference, shots, shots on target, possession %, and points momentum.
   - Venue-specific form (home performance at home, away performance away).
   - Head-to-Head (H2H) recent history between clubs.
   - Rest days between matches.
4. **2026/2027 Fixture Forecasting**:
   - All 380 fixtures for the 2026/27 Premier League parsed from `openfootball/england`.
   - Continuous simulation where played matches update future rolling form.
   - Exported to both [`data/predictions_2026_2027.csv`](data/predictions_2026_2027.csv) and [`data/predictions_2026_2027.md`](data/predictions_2026_2027.md).
5. **Matplotlib Visual Diagnostics**:
   - Feature importance comparison (`visuals/feature_importance.png`)
   - Confusion matrix heatmaps (`visuals/confusion_matrix.png`)
   - Model benchmark metrics bar chart (`visuals/model_metrics_comparison.png`)
   - Goal prediction residual distributions (`visuals/goal_error_distribution.png`)

---

## Project Structure

```
elegant-franklin/
├── data/
│   ├── raw/                       # Cached raw CSVs & openfootball text
│   ├── predictions_2026_2027.csv  # Full 380 fixture forecasts (CSV)
│   └── predictions_2026_2027.md   # Formatted markdown season predictions
├── visuals/                       # Generated Matplotlib diagnostic charts
│   ├── feature_importance.png
│   ├── confusion_matrix.png
│   ├── model_metrics_comparison.png
│   └── goal_error_distribution.png
├── src/
│   ├── __init__.py
│   ├── data_loader.py             # openfootball parser & match stats ingestion
│   ├── feature_engineering.py     # Rolling stats, venue splits, H2H, rest days
│   ├── models.py                  # Random Forest & XGBoost classifiers and regressors
│   ├── evaluate.py                # Validation metrics & Matplotlib plotting
│   └── pipeline.py                # Pipeline orchestrator
├── predict.py                     # Interactive CLI tool
├── run_pipeline.py                # One-command training & prediction pipeline
├── tests/
│   └── test_pipeline.py           # Pytest test suite
└── pyproject.toml / requirements.txt
```

---

## Getting Started

### 1. Setup Environment
```powershell
uv venv --python 3.11 .venv
uv pip install -r requirements.txt
```

### 2. Run the Full Pipeline
To retrain models, refresh data, plot diagnostics, and re-export 2026/27 predictions:
```powershell
.venv\Scripts\python run_pipeline.py
```

### 3. Interactive CLI Usage

#### View Specific Gameweek Predictions (e.g. Gameweek 7):
```powershell
.venv\Scripts\python predict.py --gameweek 7
```

#### Predict Any Custom Matchup (e.g. Arsenal vs Chelsea):
```powershell
.venv\Scripts\python predict.py --match "Arsenal" "Chelsea"
```

#### View Model Benchmarks:
```powershell
.venv\Scripts\python predict.py --benchmark
```

### 4. Run Automated Tests
```powershell
.venv\Scripts\pytest tests/ -v
```
