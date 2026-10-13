# Premier League 2026/2027 Season Match Predictions

Generated on: 2026-10-13 17:31:54
Primary Prediction Engine: **Stacked**

## Model Performance Benchmark Summary

| Model         | Accuracy   |   Macro F1 |   Log Loss |   Goal MAE | Within 1 Goal Acc   |   Scoreline KL | Variety   |
|---------------|------------|------------|------------|------------|---------------------|----------------|-----------|
| Random Forest | 47.7%      |      0.443 |      1.008 |       0.92 | 62.7%               |         8.494  | 28.0%     |
| XGBoost       | 48.9%      |      0.431 |      1.012 |       0.92 | 62.7%               |        10.1025 | 26.5%     |
| Stacked       | 48.7%      |      0.445 |      1.006 |       0.92 | 61.4%               |         8.7707 | 26.7%     |

Scoreline quality is measured on the held-out evaluation tail: KL divergence (natural log, 6x6 grid capped at 5 goals, lower is better) between empirical and predicted scoreline distributions, plus argmax-variety (share of argmax picks outside the four most frequent predicted scorelines, higher means more varied). Production (Stacked): KL 8.7707, variety 26.7% over 472 matches.

---

## Season Fixtures and Forecasts

### Gameweek 1

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2026-08-21 | Arsenal           | 2 - 0        | Coventry          | 77.1%    | 15.0%    | 7.9%     | Home Win      | Played   |
| 2026-08-22 | Hull              | 0 - 2        | Manchester United | 12.2%    | 19.2%    | 68.6%    | Away Win      | Played   |
| 2026-08-22 | Ipswich           | 0 - 1        | Sunderland        | 29.0%    | 27.0%    | 44.0%    | Away Win      | Played   |
| 2026-08-22 | Nottingham Forest | 1 - 1        | Leeds             | 39.3%    | 27.8%    | 32.9%    | Draw          | Played   |
| 2026-08-22 | Everton           | 1 - 1        | Crystal Palace    | 39.9%    | 27.0%    | 33.1%    | Draw          | Played   |
| 2026-08-22 | Brentford         | 1 - 0        | Tottenham         | 50.2%    | 24.6%    | 25.2%    | Home Win      | Played   |
| 2026-08-23 | Manchester City   | 2 - 1        | Bournemouth       | 65.0%    | 20.0%    | 15.0%    | Home Win      | Played   |
| 2026-08-23 | Brighton          | 1 - 0        | Aston Villa       | 45.0%    | 26.0%    | 29.0%    | Home Win      | Played   |
| 2026-08-23 | Newcastle         | 0 - 1        | Liverpool         | 27.0%    | 25.4%    | 47.6%    | Away Win      | Played   |
| 2026-08-24 | Fulham            | 1 - 1        | Chelsea           | 31.2%    | 26.7%    | 42.1%    | Draw          | Played   |

### Gameweek 2

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2026-08-28 | Crystal Palace    | 0 - 1        | Manchester City   | 18.0%    | 22.6%    | 59.4%    | Away Win      | Played   |
| 2026-08-29 | Liverpool         | 2 - 1        | Nottingham Forest | 61.0%    | 21.4%    | 17.6%    | Home Win      | Played   |
| 2026-08-29 | Bournemouth       | 1 - 0        | Everton           | 48.5%    | 25.2%    | 26.3%    | Home Win      | Played   |
| 2026-08-29 | Coventry          | 2 - 1        | Hull              | 48.9%    | 25.0%    | 26.1%    | Home Win      | Played   |
| 2026-08-29 | Tottenham         | 1 - 0        | Newcastle         | 44.4%    | 24.5%    | 31.1%    | Home Win      | Played   |
| 2026-08-30 | Sunderland        | 1 - 1        | Fulham            | 39.5%    | 26.7%    | 33.8%    | Draw          | Played   |
| 2026-08-30 | Chelsea           | 2 - 1        | Brighton          | 45.4%    | 25.4%    | 29.2%    | Home Win      | Played   |
| 2026-08-30 | Leeds             | 1 - 1        | Brentford         | 36.1%    | 26.4%    | 37.5%    | Draw          | Played   |
| 2026-08-30 | Manchester United | 2 - 0        | Ipswich           | 70.2%    | 17.8%    | 12.0%    | Home Win      | Played   |
| 2026-08-31 | Aston Villa       | 1 - 2        | Arsenal           | 17.5%    | 22.9%    | 59.6%    | Away Win      | Played   |

### Gameweek 3

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2026-09-04 | Ipswich           | 1 - 2        | Liverpool         | 15.9%    | 20.9%    | 63.2%    | Away Win      | Played   |
| 2026-09-05 | Newcastle         | 2 - 1        | Bournemouth       | 45.4%    | 25.2%    | 29.4%    | Home Win      | Played   |
| 2026-09-05 | Nottingham Forest | 1 - 1        | Tottenham         | 39.9%    | 26.6%    | 33.5%    | Draw          | Played   |
| 2026-09-05 | Manchester City   | 2 - 0        | Coventry          | 79.3%    | 13.6%    | 7.1%     | Home Win      | Played   |
| 2026-09-05 | Brighton          | 2 - 1        | Leeds             | 50.3%    | 24.9%    | 24.8%    | Home Win      | Played   |
| 2026-09-05 | Brentford         | 2 - 1        | Sunderland        | 56.9%    | 23.5%    | 19.6%    | Home Win      | Played   |
| 2026-09-05 | Fulham            | 1 - 0        | Crystal Palace    | 47.8%    | 25.6%    | 26.6%    | Home Win      | Played   |
| 2026-09-05 | Hull              | 1 - 2        | Aston Villa       | 26.5%    | 24.5%    | 49.0%    | Away Win      | Played   |
| 2026-09-06 | Everton           | 0 - 1        | Manchester United | 27.2%    | 25.3%    | 47.5%    | Away Win      | Played   |
| 2026-09-06 | Arsenal           | 2 - 0        | Chelsea           | 60.2%    | 22.2%    | 17.6%    | Home Win      | Played   |

### Gameweek 4

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2026-09-12 | Crystal Palace    | 2 - 1        | Ipswich           | 60.5%    | 22.0%    | 17.5%    | Home Win      | Upcoming |
| 2026-09-12 | Liverpool         | 1 - 0        | Fulham            | 59.0%    | 22.3%    | 18.7%    | Home Win      | Upcoming |
| 2026-09-12 | Aston Villa       | 2 - 1        | Nottingham Forest | 47.4%    | 24.6%    | 28.0%    | Home Win      | Upcoming |
| 2026-09-12 | Bournemouth       | 1 - 0        | Brentford         | 47.9%    | 24.3%    | 27.8%    | Home Win      | Upcoming |
| 2026-09-12 | Chelsea           | 2 - 1        | Hull              | 60.8%    | 21.7%    | 17.5%    | Home Win      | Upcoming |
| 2026-09-12 | Tottenham         | 1 - 0        | Everton           | 44.9%    | 24.1%    | 31.0%    | Home Win      | Upcoming |
| 2026-09-12 | Sunderland        | 1 - 2        | Arsenal           | 24.4%    | 21.2%    | 54.4%    | Away Win      | Upcoming |
| 2026-09-13 | Coventry          | 1 - 2        | Brighton          | 20.1%    | 22.1%    | 57.8%    | Away Win      | Upcoming |
| 2026-09-13 | Manchester United | 1 - 2        | Manchester City   | 34.5%    | 23.9%    | 41.6%    | Away Win      | Upcoming |
| 2026-09-14 | Leeds             | 0 - 1        | Newcastle         | 36.8%    | 24.7%    | 38.5%    | Away Win      | Upcoming |

### Gameweek 5

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2026-09-18 | Brentford         | 1 - 1        | Chelsea           | 40.6%    | 25.1%    | 34.3%    | Draw          | Upcoming |
| 2026-09-19 | Tottenham         | 1 - 0        | Aston Villa       | 40.6%    | 24.2%    | 35.2%    | Home Win      | Upcoming |
| 2026-09-19 | Everton           | 1 - 0        | Ipswich           | 62.0%    | 21.1%    | 16.9%    | Home Win      | Upcoming |
| 2026-09-19 | Leeds             | 1 - 0        | Crystal Palace    | 47.1%    | 23.8%    | 29.1%    | Home Win      | Upcoming |
| 2026-09-19 | Brighton          | 1 - 2        | Arsenal           | 28.8%    | 23.8%    | 47.4%    | Away Win      | Upcoming |
| 2026-09-19 | Newcastle         | 2 - 1        | Hull              | 61.8%    | 21.4%    | 16.8%    | Home Win      | Upcoming |
| 2026-09-19 | Nottingham Forest | 2 - 1        | Coventry          | 62.5%    | 21.0%    | 16.5%    | Home Win      | Upcoming |
| 2026-09-20 | Bournemouth       | 1 - 1        | Liverpool         | 38.7%    | 25.1%    | 36.2%    | Draw          | Upcoming |
| 2026-09-20 | Manchester City   | 2 - 0        | Sunderland        | 72.7%    | 17.0%    | 10.3%    | Home Win      | Upcoming |
| 2026-09-20 | Fulham            | 0 - 1        | Manchester United | 35.7%    | 24.8%    | 39.5%    | Away Win      | Upcoming |

### Gameweek 6

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2026-10-10 | Arsenal           | 2 - 0        | Leeds             | 67.2%    | 19.5%    | 13.3%    | Home Win      | Upcoming |
| 2026-10-10 | Sunderland        | 0 - 1        | Brighton          | 38.0%    | 23.7%    | 38.3%    | Away Win      | Upcoming |
| 2026-10-10 | Chelsea           | 1 - 1        | Bournemouth       | 39.9%    | 25.6%    | 34.5%    | Draw          | Upcoming |
| 2026-10-10 | Ipswich           | 0 - 1        | Fulham            | 21.9%    | 23.9%    | 54.2%    | Away Win      | Upcoming |
| 2026-10-10 | Aston Villa       | 1 - 0        | Brentford         | 45.9%    | 24.7%    | 29.4%    | Home Win      | Upcoming |
| 2026-10-10 | Manchester United | 1 - 0        | Tottenham         | 60.4%    | 21.6%    | 18.0%    | Home Win      | Upcoming |
| 2026-10-11 | Hull              | 1 - 2        | Everton           | 35.7%    | 23.6%    | 40.7%    | Away Win      | Upcoming |
| 2026-10-11 | Crystal Palace    | 1 - 1        | Nottingham Forest | 33.8%    | 26.5%    | 39.7%    | Draw          | Upcoming |
| 2026-10-11 | Liverpool         | 0 - 1        | Manchester City   | 31.8%    | 25.0%    | 43.2%    | Away Win      | Upcoming |
| 2026-10-12 | Coventry          | 1 - 2        | Newcastle         | 20.6%    | 21.7%    | 57.7%    | Away Win      | Upcoming |

### Gameweek 7

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2026-10-17 | Everton           | 1 - 0        | Chelsea           | 39.6%    | 25.0%    | 35.4%    | Home Win      | Upcoming |
| 2026-10-17 | Fulham            | 1 - 0        | Hull              | 59.0%    | 22.1%    | 18.9%    | Home Win      | Upcoming |
| 2026-10-17 | Manchester City   | 2 - 0        | Ipswich           | 76.8%    | 15.2%    | 8.0%     | Home Win      | Upcoming |
| 2026-10-17 | Brentford         | 1 - 1        | Liverpool         | 36.0%    | 25.0%    | 39.0%    | Draw          | Upcoming |
| 2026-10-17 | Newcastle         | 1 - 0        | Aston Villa       | 49.8%    | 23.9%    | 26.3%    | Home Win      | Upcoming |
| 2026-10-18 | Bournemouth       | 2 - 1        | Sunderland        | 58.8%    | 21.9%    | 19.3%    | Home Win      | Upcoming |
| 2026-10-18 | Leeds             | 0 - 1        | Manchester United | 32.5%    | 24.9%    | 42.6%    | Away Win      | Upcoming |
| 2026-10-18 | Brighton          | 2 - 1        | Crystal Palace    | 51.4%    | 23.5%    | 25.1%    | Home Win      | Upcoming |
| 2026-10-18 | Nottingham Forest | 1 - 2        | Arsenal           | 23.8%    | 22.6%    | 53.6%    | Away Win      | Upcoming |
| 2026-10-19 | Tottenham         | 1 - 0        | Coventry          | 63.7%    | 20.8%    | 15.5%    | Home Win      | Upcoming |

### Gameweek 8

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2026-10-23 | Ipswich           | 0 - 1        | Nottingham Forest | 19.6%    | 23.2%    | 57.2%    | Away Win      | Upcoming |
| 2026-10-24 | Aston Villa       | 1 - 2        | Manchester City   | 27.6%    | 24.2%    | 48.2%    | Away Win      | Upcoming |
| 2026-10-24 | Liverpool         | 1 - 0        | Brighton          | 52.6%    | 23.5%    | 23.9%    | Home Win      | Upcoming |
| 2026-10-24 | Arsenal           | 1 - 0        | Everton           | 65.2%    | 20.4%    | 14.4%    | Home Win      | Upcoming |
| 2026-10-24 | Coventry          | 1 - 2        | Fulham            | 22.2%    | 23.8%    | 54.0%    | Away Win      | Upcoming |
| 2026-10-24 | Chelsea           | 1 - 0        | Tottenham         | 55.1%    | 23.4%    | 21.5%    | Home Win      | Upcoming |
| 2026-10-25 | Crystal Palace    | 1 - 1        | Newcastle         | 35.2%    | 25.5%    | 39.3%    | Draw          | Upcoming |
| 2026-10-25 | Manchester United | 2 - 1        | Bournemouth       | 47.6%    | 24.2%    | 28.2%    | Home Win      | Upcoming |
| 2026-10-25 | Hull              | 1 - 2        | Brentford         | 34.8%    | 23.1%    | 42.1%    | Away Win      | Upcoming |
| 2026-10-25 | Sunderland        | 0 - 1        | Leeds             | 37.0%    | 24.9%    | 38.1%    | Away Win      | Upcoming |

### Gameweek 9

| Date       | Home            | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-----------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2026-10-31 | Chelsea         | 1 - 1        | Manchester United | 38.3%    | 25.8%    | 35.9%    | Draw          | Upcoming |
| 2026-10-31 | Manchester City | 1 - 0        | Brighton          | 64.4%    | 20.2%    | 15.4%    | Home Win      | Upcoming |
| 2026-10-31 | Bournemouth     | 1 - 0        | Leeds             | 53.8%    | 23.2%    | 23.0%    | Home Win      | Upcoming |
| 2026-10-31 | Coventry        | 1 - 2        | Sunderland        | 27.4%    | 24.0%    | 48.6%    | Away Win      | Upcoming |
| 2026-10-31 | Hull            | 1 - 0        | Ipswich           | 51.3%    | 23.2%    | 25.5%    | Home Win      | Upcoming |
| 2026-10-31 | Brentford       | 1 - 0        | Nottingham Forest | 44.6%    | 25.3%    | 30.1%    | Home Win      | Upcoming |
| 2026-10-31 | Tottenham       | 1 - 0        | Crystal Palace    | 43.8%    | 24.6%    | 31.6%    | Home Win      | Upcoming |
| 2026-11-01 | Aston Villa     | 1 - 0        | Fulham            | 52.8%    | 23.9%    | 23.3%    | Home Win      | Upcoming |
| 2026-11-01 | Liverpool       | 1 - 2        | Arsenal           | 35.8%    | 24.5%    | 39.7%    | Away Win      | Upcoming |
| 2026-11-02 | Newcastle       | 1 - 0        | Everton           | 48.5%    | 24.7%    | 26.8%    | Home Win      | Upcoming |

### Gameweek 10

| Date       | Home              | Pred Score   | Away            | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-----------------|----------|----------|----------|---------------|----------|
| 2026-11-07 | Arsenal           | 2 - 0        | Hull            | 72.3%    | 17.4%    | 10.3%    | Home Win      | Upcoming |
| 2026-11-07 | Nottingham Forest | 0 - 1        | Manchester City | 21.1%    | 22.4%    | 56.5%    | Away Win      | Upcoming |
| 2026-11-07 | Leeds             | 1 - 0        | Tottenham       | 49.2%    | 24.1%    | 26.7%    | Home Win      | Upcoming |
| 2026-11-07 | Fulham            | 1 - 0        | Newcastle       | 46.4%    | 23.3%    | 30.3%    | Home Win      | Upcoming |
| 2026-11-07 | Everton           | 1 - 0        | Coventry        | 64.7%    | 20.4%    | 14.9%    | Home Win      | Upcoming |
| 2026-11-07 | Crystal Palace    | 0 - 1        | Liverpool       | 26.9%    | 24.9%    | 48.2%    | Away Win      | Upcoming |
| 2026-11-07 | Sunderland        | 1 - 0        | Chelsea         | 39.3%    | 23.3%    | 37.4%    | Home Win      | Upcoming |
| 2026-11-07 | Ipswich           | 1 - 2        | Bournemouth     | 17.0%    | 21.7%    | 61.3%    | Away Win      | Upcoming |
| 2026-11-07 | Brighton          | 2 - 1        | Brentford       | 46.2%    | 24.6%    | 29.2%    | Home Win      | Upcoming |
| 2026-11-07 | Manchester United | 1 - 0        | Aston Villa     | 53.2%    | 23.1%    | 23.7%    | Home Win      | Upcoming |

### Gameweek 11

| Date       | Home            | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-----------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2026-11-21 | Chelsea         | 1 - 0        | Leeds             | 49.2%    | 24.7%    | 26.1%    | Home Win      | Upcoming |
| 2026-11-21 | Manchester City | 2 - 0        | Fulham            | 71.2%    | 17.8%    | 11.0%    | Home Win      | Upcoming |
| 2026-11-21 | Aston Villa     | 1 - 0        | Sunderland        | 57.1%    | 22.3%    | 20.6%    | Home Win      | Upcoming |
| 2026-11-21 | Liverpool       | 2 - 1        | Manchester United | 45.7%    | 24.9%    | 29.4%    | Home Win      | Upcoming |
| 2026-11-21 | Hull            | 1 - 2        | Brighton          | 33.5%    | 23.3%    | 43.2%    | Away Win      | Upcoming |
| 2026-11-21 | Bournemouth     | 1 - 0        | Nottingham Forest | 49.3%    | 24.4%    | 26.3%    | Home Win      | Upcoming |
| 2026-11-21 | Tottenham       | 1 - 0        | Ipswich           | 61.7%    | 21.1%    | 17.2%    | Home Win      | Upcoming |
| 2026-11-21 | Brentford       | 1 - 0        | Everton           | 46.4%    | 24.9%    | 28.7%    | Home Win      | Upcoming |
| 2026-11-21 | Coventry        | 1 - 2        | Crystal Palace    | 25.1%    | 23.5%    | 51.4%    | Away Win      | Upcoming |
| 2026-11-21 | Newcastle       | 1 - 2        | Arsenal           | 32.6%    | 24.1%    | 43.3%    | Away Win      | Upcoming |

### Gameweek 12

| Date       | Home              | Pred Score   | Away            | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-----------------|----------|----------|----------|---------------|----------|
| 2026-11-28 | Leeds             | 1 - 0        | Coventry        | 64.8%    | 20.3%    | 14.9%    | Home Win      | Upcoming |
| 2026-11-28 | Ipswich           | 1 - 2        | Aston Villa     | 18.8%    | 21.9%    | 59.3%    | Away Win      | Upcoming |
| 2026-11-28 | Arsenal           | 2 - 1        | Manchester City | 48.0%    | 24.0%    | 28.0%    | Home Win      | Upcoming |
| 2026-11-28 | Manchester United | 1 - 0        | Brentford       | 55.1%    | 22.6%    | 22.3%    | Home Win      | Upcoming |
| 2026-11-28 | Everton           | 0 - 1        | Liverpool       | 28.2%    | 24.8%    | 47.0%    | Away Win      | Upcoming |
| 2026-11-28 | Fulham            | 1 - 0        | Bournemouth     | 37.8%    | 24.7%    | 37.5%    | Home Win      | Upcoming |
| 2026-11-28 | Nottingham Forest | 2 - 1        | Chelsea         | 37.8%    | 24.7%    | 37.5%    | Home Win      | Upcoming |
| 2026-11-28 | Brighton          | 2 - 1        | Newcastle       | 48.4%    | 23.7%    | 27.9%    | Home Win      | Upcoming |
| 2026-11-28 | Sunderland        | 1 - 0        | Tottenham       | 45.6%    | 23.6%    | 30.8%    | Home Win      | Upcoming |
| 2026-11-28 | Crystal Palace    | 1 - 0        | Hull            | 55.0%    | 23.7%    | 21.3%    | Home Win      | Upcoming |

### Gameweek 13

| Date       | Home            | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-----------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2026-12-02 | Tottenham       | 1 - 1        | Fulham            | 40.9%    | 25.4%    | 33.7%    | Draw          | Upcoming |
| 2026-12-02 | Liverpool       | 2 - 1        | Sunderland        | 61.9%    | 21.2%    | 16.9%    | Home Win      | Upcoming |
| 2026-12-02 | Hull            | 1 - 2        | Nottingham Forest | 35.3%    | 23.6%    | 41.1%    | Away Win      | Upcoming |
| 2026-12-02 | Chelsea         | 1 - 0        | Crystal Palace    | 50.1%    | 24.2%    | 25.7%    | Home Win      | Upcoming |
| 2026-12-02 | Aston Villa     | 1 - 0        | Everton           | 47.7%    | 24.7%    | 27.6%    | Home Win      | Upcoming |
| 2026-12-02 | Brentford       | 0 - 1        | Arsenal           | 25.2%    | 23.8%    | 51.0%    | Away Win      | Upcoming |
| 2026-12-02 | Coventry        | 1 - 1        | Ipswich           | 39.1%    | 25.4%    | 35.5%    | Draw          | Upcoming |
| 2026-12-02 | Manchester City | 2 - 0        | Leeds             | 68.5%    | 18.8%    | 12.7%    | Home Win      | Upcoming |
| 2026-12-02 | Newcastle       | 1 - 1        | Manchester United | 40.6%    | 25.6%    | 33.8%    | Draw          | Upcoming |
| 2026-12-02 | Bournemouth     | 1 - 0        | Brighton          | 45.6%    | 24.9%    | 29.5%    | Home Win      | Upcoming |

### Gameweek 14

| Date       | Home              | Pred Score   | Away            | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-----------------|----------|----------|----------|---------------|----------|
| 2026-12-05 | Tottenham         | 1 - 2        | Arsenal         | 23.0%    | 21.9%    | 55.1%    | Away Win      | Upcoming |
| 2026-12-05 | Manchester United | 2 - 0        | Coventry        | 71.0%    | 18.0%    | 11.0%    | Home Win      | Upcoming |
| 2026-12-05 | Leeds             | 1 - 0        | Ipswich         | 61.2%    | 21.3%    | 17.5%    | Home Win      | Upcoming |
| 2026-12-05 | Newcastle         | 1 - 0        | Sunderland      | 54.4%    | 23.6%    | 22.0%    | Home Win      | Upcoming |
| 2026-12-05 | Chelsea           | 1 - 1        | Liverpool       | 35.6%    | 25.4%    | 39.0%    | Draw          | Upcoming |
| 2026-12-05 | Brentford         | 0 - 1        | Manchester City | 25.0%    | 23.8%    | 51.2%    | Away Win      | Upcoming |
| 2026-12-05 | Bournemouth       | 1 - 0        | Hull            | 62.4%    | 21.4%    | 16.2%    | Home Win      | Upcoming |
| 2026-12-05 | Aston Villa       | 1 - 0        | Crystal Palace  | 52.7%    | 23.4%    | 23.9%    | Home Win      | Upcoming |
| 2026-12-05 | Nottingham Forest | 1 - 0        | Brighton        | 37.7%    | 24.9%    | 37.4%    | Home Win      | Upcoming |
| 2026-12-05 | Everton           | 1 - 0        | Fulham          | 45.5%    | 25.3%    | 29.2%    | Home Win      | Upcoming |

### Gameweek 15

| Date       | Home            | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-----------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2026-12-12 | Sunderland      | 0 - 1        | Nottingham Forest | 36.3%    | 24.9%    | 38.8%    | Away Win      | Upcoming |
| 2026-12-12 | Crystal Palace  | 0 - 1        | Manchester United | 30.4%    | 25.4%    | 44.2%    | Away Win      | Upcoming |
| 2026-12-12 | Hull            | 2 - 1        | Tottenham         | 40.1%    | 23.9%    | 36.0%    | Home Win      | Upcoming |
| 2026-12-12 | Brighton        | 2 - 1        | Everton           | 48.7%    | 24.3%    | 27.0%    | Home Win      | Upcoming |
| 2026-12-12 | Ipswich         | 1 - 2        | Newcastle         | 18.8%    | 22.0%    | 59.2%    | Away Win      | Upcoming |
| 2026-12-12 | Coventry        | 1 - 2        | Aston Villa       | 20.8%    | 21.8%    | 57.4%    | Away Win      | Upcoming |
| 2026-12-12 | Arsenal         | 1 - 0        | Bournemouth       | 60.6%    | 21.7%    | 17.7%    | Home Win      | Upcoming |
| 2026-12-12 | Manchester City | 2 - 0        | Chelsea           | 67.1%    | 19.2%    | 13.7%    | Home Win      | Upcoming |
| 2026-12-12 | Liverpool       | 2 - 1        | Leeds             | 56.4%    | 22.9%    | 20.7%    | Home Win      | Upcoming |
| 2026-12-12 | Fulham          | 1 - 0        | Brentford         | 43.2%    | 24.3%    | 32.5%    | Home Win      | Upcoming |

### Gameweek 16

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2026-12-19 | Leeds             | 1 - 0        | Fulham            | 46.0%    | 24.9%    | 29.1%    | Home Win      | Upcoming |
| 2026-12-19 | Brighton          | 1 - 0        | Ipswich           | 63.9%    | 20.6%    | 15.5%    | Home Win      | Upcoming |
| 2026-12-19 | Nottingham Forest | 1 - 1        | Everton           | 40.9%    | 25.0%    | 34.1%    | Draw          | Upcoming |
| 2026-12-19 | Brentford         | 1 - 0        | Newcastle         | 46.3%    | 24.2%    | 29.5%    | Home Win      | Upcoming |
| 2026-12-19 | Manchester City   | 2 - 0        | Hull              | 73.1%    | 16.8%    | 10.1%    | Home Win      | Upcoming |
| 2026-12-19 | Sunderland        | 1 - 0        | Crystal Palace    | 44.4%    | 23.2%    | 32.4%    | Home Win      | Upcoming |
| 2026-12-19 | Bournemouth       | 1 - 0        | Coventry          | 68.9%    | 19.0%    | 12.1%    | Home Win      | Upcoming |
| 2026-12-19 | Arsenal           | 1 - 0        | Manchester United | 60.9%    | 21.7%    | 17.4%    | Home Win      | Upcoming |
| 2026-12-19 | Liverpool         | 1 - 0        | Tottenham         | 63.2%    | 20.7%    | 16.1%    | Home Win      | Upcoming |
| 2026-12-19 | Chelsea           | 1 - 0        | Aston Villa       | 46.2%    | 24.5%    | 29.3%    | Home Win      | Upcoming |

### Gameweek 17

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2026-12-26 | Aston Villa       | 1 - 0        | Leeds             | 52.1%    | 23.7%    | 24.2%    | Home Win      | Upcoming |
| 2026-12-26 | Manchester United | 2 - 1        | Nottingham Forest | 51.9%    | 23.9%    | 24.2%    | Home Win      | Upcoming |
| 2026-12-26 | Crystal Palace    | 0 - 1        | Arsenal           | 19.6%    | 22.4%    | 58.0%    | Away Win      | Upcoming |
| 2026-12-26 | Everton           | 1 - 0        | Sunderland        | 49.9%    | 24.2%    | 25.9%    | Home Win      | Upcoming |
| 2026-12-26 | Coventry          | 1 - 2        | Chelsea           | 20.6%    | 21.8%    | 57.6%    | Away Win      | Upcoming |
| 2026-12-26 | Newcastle         | 0 - 1        | Manchester City   | 27.5%    | 24.4%    | 48.1%    | Away Win      | Upcoming |
| 2026-12-26 | Fulham            | 1 - 0        | Brighton          | 40.7%    | 24.7%    | 34.6%    | Home Win      | Upcoming |
| 2026-12-26 | Tottenham         | 0 - 1        | Bournemouth       | 33.6%    | 24.8%    | 41.6%    | Away Win      | Upcoming |
| 2026-12-26 | Hull              | 1 - 2        | Liverpool         | 27.5%    | 22.0%    | 50.5%    | Away Win      | Upcoming |
| 2026-12-26 | Ipswich           | 0 - 1        | Brentford         | 18.4%    | 22.4%    | 59.2%    | Away Win      | Upcoming |

### Gameweek 18

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2026-12-30 | Fulham            | 1 - 2        | Arsenal           | 27.1%    | 22.7%    | 50.2%    | Away Win      | Upcoming |
| 2026-12-30 | Coventry          | 1 - 2        | Brentford         | 21.4%    | 22.4%    | 56.2%    | Away Win      | Upcoming |
| 2026-12-30 | Aston Villa       | 1 - 1        | Liverpool         | 36.0%    | 25.1%    | 38.9%    | Draw          | Upcoming |
| 2026-12-30 | Newcastle         | 1 - 0        | Nottingham Forest | 49.9%    | 24.4%    | 25.7%    | Home Win      | Upcoming |
| 2026-12-30 | Hull              | 1 - 2        | Leeds             | 35.8%    | 23.6%    | 40.6%    | Away Win      | Upcoming |
| 2026-12-30 | Manchester United | 2 - 1        | Sunderland        | 61.3%    | 21.0%    | 17.7%    | Home Win      | Upcoming |
| 2026-12-30 | Ipswich           | 1 - 2        | Chelsea           | 17.7%    | 22.0%    | 60.3%    | Away Win      | Upcoming |
| 2026-12-30 | Tottenham         | 0 - 1        | Brighton          | 37.3%    | 24.7%    | 38.0%    | Away Win      | Upcoming |
| 2026-12-30 | Everton           | 0 - 1        | Manchester City   | 20.5%    | 22.8%    | 56.7%    | Away Win      | Upcoming |
| 2026-12-30 | Crystal Palace    | 0 - 1        | Bournemouth       | 28.8%    | 25.8%    | 45.4%    | Away Win      | Upcoming |

### Gameweek 19

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2027-01-02 | Bournemouth       | 1 - 0        | Aston Villa       | 48.5%    | 24.0%    | 27.5%    | Home Win      | Upcoming |
| 2027-01-02 | Brentford         | 1 - 0        | Crystal Palace    | 48.6%    | 24.3%    | 27.1%    | Home Win      | Upcoming |
| 2027-01-02 | Leeds             | 1 - 1        | Everton           | 40.5%    | 25.4%    | 34.1%    | Draw          | Upcoming |
| 2027-01-02 | Arsenal           | 2 - 0        | Ipswich           | 75.2%    | 16.2%    | 8.6%     | Home Win      | Upcoming |
| 2027-01-02 | Sunderland        | 1 - 0        | Hull              | 53.6%    | 22.9%    | 23.5%    | Home Win      | Upcoming |
| 2027-01-02 | Liverpool         | 2 - 0        | Coventry          | 72.0%    | 17.6%    | 10.4%    | Home Win      | Upcoming |
| 2027-01-02 | Chelsea           | 1 - 0        | Newcastle         | 45.9%    | 24.7%    | 29.4%    | Home Win      | Upcoming |
| 2027-01-02 | Nottingham Forest | 1 - 1        | Fulham            | 42.2%    | 25.4%    | 32.4%    | Draw          | Upcoming |
| 2027-01-02 | Brighton          | 1 - 1        | Manchester United | 41.1%    | 25.1%    | 33.8%    | Draw          | Upcoming |
| 2027-01-02 | Manchester City   | 2 - 0        | Tottenham         | 72.0%    | 17.5%    | 10.5%    | Home Win      | Upcoming |

### Gameweek 20

| Date       | Home              | Pred Score   | Away            | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-----------------|----------|----------|----------|---------------|----------|
| 2027-01-06 | Arsenal           | 1 - 0        | Brentford       | 64.3%    | 20.6%    | 15.1%    | Home Win      | Upcoming |
| 2027-01-06 | Leeds             | 0 - 1        | Manchester City | 21.7%    | 22.5%    | 55.8%    | Away Win      | Upcoming |
| 2027-01-06 | Manchester United | 2 - 1        | Newcastle       | 52.6%    | 23.2%    | 24.2%    | Home Win      | Upcoming |
| 2027-01-06 | Brighton          | 1 - 1        | Bournemouth     | 40.6%    | 25.3%    | 34.1%    | Draw          | Upcoming |
| 2027-01-06 | Nottingham Forest | 2 - 1        | Hull            | 56.7%    | 22.7%    | 20.6%    | Home Win      | Upcoming |
| 2027-01-06 | Fulham            | 1 - 0        | Tottenham       | 49.3%    | 24.1%    | 26.6%    | Home Win      | Upcoming |
| 2027-01-06 | Everton           | 1 - 0        | Aston Villa     | 40.5%    | 24.7%    | 34.8%    | Home Win      | Upcoming |
| 2027-01-06 | Sunderland        | 0 - 1        | Liverpool       | 27.4%    | 23.2%    | 49.4%    | Away Win      | Upcoming |
| 2027-01-06 | Crystal Palace    | 1 - 1        | Chelsea         | 31.4%    | 25.7%    | 42.9%    | Draw          | Upcoming |
| 2027-01-06 | Ipswich           | 1 - 0        | Coventry        | 45.7%    | 24.9%    | 29.4%    | Home Win      | Upcoming |

### Gameweek 21

| Date       | Home            | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-----------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2027-01-16 | Bournemouth     | 1 - 0        | Ipswich           | 64.8%    | 20.7%    | 14.5%    | Home Win      | Upcoming |
| 2027-01-16 | Manchester City | 1 - 0        | Nottingham Forest | 66.5%    | 19.6%    | 13.9%    | Home Win      | Upcoming |
| 2027-01-16 | Chelsea         | 1 - 0        | Sunderland        | 55.6%    | 23.0%    | 21.4%    | Home Win      | Upcoming |
| 2027-01-16 | Brentford       | 1 - 1        | Brighton          | 41.7%    | 25.2%    | 33.1%    | Draw          | Upcoming |
| 2027-01-16 | Aston Villa     | 1 - 1        | Manchester United | 37.5%    | 25.8%    | 36.7%    | Draw          | Upcoming |
| 2027-01-16 | Tottenham       | 1 - 0        | Leeds             | 45.0%    | 24.2%    | 30.8%    | Home Win      | Upcoming |
| 2027-01-16 | Coventry        | 1 - 2        | Everton           | 21.8%    | 22.9%    | 55.3%    | Away Win      | Upcoming |
| 2027-01-16 | Liverpool       | 1 - 0        | Crystal Palace    | 59.0%    | 21.9%    | 19.1%    | Home Win      | Upcoming |
| 2027-01-16 | Hull            | 1 - 2        | Arsenal           | 24.1%    | 20.3%    | 55.6%    | Away Win      | Upcoming |
| 2027-01-16 | Newcastle       | 1 - 0        | Fulham            | 54.9%    | 23.5%    | 21.6%    | Home Win      | Upcoming |

### Gameweek 22

| Date       | Home              | Pred Score   | Away            | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-----------------|----------|----------|----------|---------------|----------|
| 2027-01-23 | Ipswich           | 1 - 1        | Hull            | 38.6%    | 25.2%    | 36.2%    | Draw          | Upcoming |
| 2027-01-23 | Everton           | 1 - 1        | Brentford       | 39.5%    | 25.2%    | 35.3%    | Draw          | Upcoming |
| 2027-01-23 | Sunderland        | 1 - 0        | Coventry        | 61.1%    | 21.1%    | 17.8%    | Home Win      | Upcoming |
| 2027-01-23 | Nottingham Forest | 0 - 1        | Bournemouth     | 34.5%    | 25.0%    | 40.5%    | Away Win      | Upcoming |
| 2027-01-23 | Arsenal           | 2 - 0        | Newcastle       | 66.3%    | 19.6%    | 14.1%    | Home Win      | Upcoming |
| 2027-01-23 | Leeds             | 1 - 0        | Chelsea         | 39.2%    | 24.6%    | 36.2%    | Home Win      | Upcoming |
| 2027-01-23 | Fulham            | 2 - 1        | Aston Villa     | 42.5%    | 24.3%    | 33.2%    | Home Win      | Upcoming |
| 2027-01-23 | Manchester United | 2 - 1        | Liverpool       | 41.3%    | 24.8%    | 33.9%    | Home Win      | Upcoming |
| 2027-01-23 | Brighton          | 1 - 2        | Manchester City | 28.8%    | 23.9%    | 47.3%    | Away Win      | Upcoming |
| 2027-01-23 | Crystal Palace    | 1 - 0        | Tottenham       | 44.4%    | 25.4%    | 30.2%    | Home Win      | Upcoming |

### Gameweek 23

| Date       | Home            | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-----------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2027-01-30 | Tottenham       | 1 - 0        | Sunderland        | 51.0%    | 23.1%    | 25.9%    | Home Win      | Upcoming |
| 2027-01-30 | Brentford       | 1 - 1        | Manchester United | 37.5%    | 25.5%    | 37.0%    | Draw          | Upcoming |
| 2027-01-30 | Newcastle       | 1 - 0        | Brighton          | 48.8%    | 24.1%    | 27.1%    | Home Win      | Upcoming |
| 2027-01-30 | Hull            | 2 - 1        | Crystal Palace    | 38.5%    | 23.3%    | 38.2%    | Home Win      | Upcoming |
| 2027-01-30 | Coventry        | 1 - 2        | Leeds             | 24.9%    | 23.2%    | 51.9%    | Away Win      | Upcoming |
| 2027-01-30 | Bournemouth     | 1 - 0        | Fulham            | 52.5%    | 24.2%    | 23.3%    | Home Win      | Upcoming |
| 2027-01-30 | Chelsea         | 1 - 0        | Nottingham Forest | 46.4%    | 25.1%    | 28.5%    | Home Win      | Upcoming |
| 2027-01-30 | Liverpool       | 2 - 1        | Everton           | 52.4%    | 24.1%    | 23.5%    | Home Win      | Upcoming |
| 2027-01-30 | Manchester City | 2 - 1        | Arsenal           | 49.6%    | 23.2%    | 27.2%    | Home Win      | Upcoming |
| 2027-01-30 | Aston Villa     | 1 - 0        | Ipswich           | 64.7%    | 20.4%    | 14.9%    | Home Win      | Upcoming |

### Gameweek 24

| Date       | Home              | Pred Score   | Away            | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-----------------|----------|----------|----------|---------------|----------|
| 2027-02-06 | Arsenal           | 1 - 0        | Liverpool       | 56.3%    | 22.8%    | 20.9%    | Home Win      | Upcoming |
| 2027-02-06 | Brighton          | 2 - 1        | Hull            | 62.2%    | 21.2%    | 16.6%    | Home Win      | Upcoming |
| 2027-02-06 | Sunderland        | 0 - 1        | Aston Villa     | 37.1%    | 23.7%    | 39.2%    | Away Win      | Upcoming |
| 2027-02-06 | Crystal Palace    | 1 - 0        | Coventry        | 62.5%    | 21.6%    | 15.9%    | Home Win      | Upcoming |
| 2027-02-06 | Ipswich           | 0 - 1        | Tottenham       | 25.1%    | 24.2%    | 50.7%    | Away Win      | Upcoming |
| 2027-02-06 | Everton           | 1 - 1        | Newcastle       | 36.1%    | 25.4%    | 38.5%    | Draw          | Upcoming |
| 2027-02-06 | Fulham            | 1 - 2        | Manchester City | 25.5%    | 22.8%    | 51.7%    | Away Win      | Upcoming |
| 2027-02-06 | Leeds             | 1 - 0        | Bournemouth     | 38.3%    | 24.6%    | 37.1%    | Home Win      | Upcoming |
| 2027-02-06 | Manchester United | 2 - 1        | Chelsea         | 53.0%    | 23.0%    | 24.0%    | Home Win      | Upcoming |
| 2027-02-06 | Nottingham Forest | 2 - 1        | Brentford       | 39.8%    | 24.7%    | 35.5%    | Home Win      | Upcoming |

### Gameweek 25

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2027-02-10 | Everton           | 1 - 1        | Leeds             | 42.3%    | 25.3%    | 32.4%    | Draw          | Upcoming |
| 2027-02-10 | Coventry          | 1 - 2        | Liverpool         | 15.9%    | 20.0%    | 64.1%    | Away Win      | Upcoming |
| 2027-02-10 | Hull              | 2 - 1        | Sunderland        | 39.8%    | 23.7%    | 36.5%    | Home Win      | Upcoming |
| 2027-02-10 | Aston Villa       | 1 - 0        | Bournemouth       | 41.7%    | 25.0%    | 33.3%    | Home Win      | Upcoming |
| 2027-02-10 | Crystal Palace    | 1 - 1        | Brentford         | 32.9%    | 26.1%    | 41.0%    | Draw          | Upcoming |
| 2027-02-10 | Newcastle         | 1 - 0        | Chelsea           | 49.9%    | 23.6%    | 26.5%    | Home Win      | Upcoming |
| 2027-02-10 | Fulham            | 2 - 1        | Nottingham Forest | 42.9%    | 24.9%    | 32.2%    | Home Win      | Upcoming |
| 2027-02-10 | Tottenham         | 1 - 2        | Manchester City   | 22.5%    | 21.9%    | 55.6%    | Away Win      | Upcoming |
| 2027-02-10 | Manchester United | 2 - 1        | Brighton          | 51.5%    | 23.5%    | 25.0%    | Home Win      | Upcoming |
| 2027-02-10 | Ipswich           | 0 - 2        | Arsenal           | 13.3%    | 18.0%    | 68.7%    | Away Win      | Upcoming |

### Gameweek 26

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2027-02-20 | Manchester City   | 2 - 0        | Newcastle         | 66.7%    | 19.3%    | 14.0%    | Home Win      | Upcoming |
| 2027-02-20 | Bournemouth       | 1 - 0        | Crystal Palace    | 52.6%    | 23.4%    | 24.0%    | Home Win      | Upcoming |
| 2027-02-20 | Brentford         | 1 - 0        | Coventry          | 66.9%    | 19.7%    | 13.4%    | Home Win      | Upcoming |
| 2027-02-20 | Chelsea           | 1 - 0        | Ipswich           | 62.3%    | 21.5%    | 16.2%    | Home Win      | Upcoming |
| 2027-02-20 | Liverpool         | 2 - 0        | Hull              | 66.4%    | 19.8%    | 13.8%    | Home Win      | Upcoming |
| 2027-02-20 | Arsenal           | 1 - 0        | Fulham            | 67.2%    | 19.9%    | 12.9%    | Home Win      | Upcoming |
| 2027-02-20 | Nottingham Forest | 0 - 1        | Manchester United | 32.5%    | 24.8%    | 42.7%    | Away Win      | Upcoming |
| 2027-02-20 | Brighton          | 1 - 0        | Tottenham         | 55.1%    | 23.1%    | 21.8%    | Home Win      | Upcoming |
| 2027-02-20 | Sunderland        | 0 - 1        | Everton           | 37.2%    | 24.7%    | 38.1%    | Away Win      | Upcoming |
| 2027-02-20 | Leeds             | 1 - 0        | Aston Villa       | 41.6%    | 24.3%    | 34.1%    | Home Win      | Upcoming |

### Gameweek 27

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2027-02-27 | Crystal Palace    | 2 - 1        | Sunderland        | 48.4%    | 24.6%    | 27.0%    | Home Win      | Upcoming |
| 2027-02-27 | Manchester United | 1 - 2        | Arsenal           | 35.8%    | 23.7%    | 40.5%    | Away Win      | Upcoming |
| 2027-02-27 | Ipswich           | 1 - 2        | Brighton          | 17.2%    | 22.1%    | 60.7%    | Away Win      | Upcoming |
| 2027-02-27 | Coventry          | 1 - 2        | Bournemouth       | 18.1%    | 21.3%    | 60.6%    | Away Win      | Upcoming |
| 2027-02-27 | Everton           | 1 - 1        | Nottingham Forest | 41.3%    | 25.4%    | 33.3%    | Draw          | Upcoming |
| 2027-02-27 | Fulham            | 2 - 1        | Leeds             | 47.4%    | 24.2%    | 28.4%    | Home Win      | Upcoming |
| 2027-02-27 | Aston Villa       | 2 - 1        | Chelsea           | 45.3%    | 24.7%    | 30.0%    | Home Win      | Upcoming |
| 2027-02-27 | Tottenham         | 0 - 1        | Liverpool         | 30.1%    | 23.9%    | 46.0%    | Away Win      | Upcoming |
| 2027-02-27 | Newcastle         | 2 - 1        | Brentford         | 50.8%    | 23.7%    | 25.5%    | Home Win      | Upcoming |
| 2027-02-27 | Hull              | 1 - 2        | Manchester City   | 22.5%    | 20.0%    | 57.5%    | Away Win      | Upcoming |

### Gameweek 28

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2027-03-03 | Nottingham Forest | 1 - 0        | Newcastle         | 37.7%    | 24.6%    | 37.7%    | Home Win      | Upcoming |
| 2027-03-03 | Bournemouth       | 1 - 0        | Tottenham         | 56.1%    | 23.1%    | 20.8%    | Home Win      | Upcoming |
| 2027-03-03 | Manchester City   | 1 - 0        | Everton           | 66.6%    | 19.7%    | 13.7%    | Home Win      | Upcoming |
| 2027-03-03 | Arsenal           | 2 - 0        | Crystal Palace    | 67.4%    | 19.4%    | 13.2%    | Home Win      | Upcoming |
| 2027-03-03 | Leeds             | 2 - 1        | Hull              | 56.4%    | 22.6%    | 21.0%    | Home Win      | Upcoming |
| 2027-03-03 | Sunderland        | 0 - 1        | Manchester United | 29.3%    | 23.9%    | 46.8%    | Away Win      | Upcoming |
| 2027-03-03 | Liverpool         | 1 - 0        | Aston Villa       | 55.3%    | 22.8%    | 21.9%    | Home Win      | Upcoming |
| 2027-03-03 | Brighton          | 1 - 0        | Fulham            | 50.6%    | 24.6%    | 24.8%    | Home Win      | Upcoming |
| 2027-03-03 | Brentford         | 1 - 0        | Ipswich           | 63.9%    | 20.7%    | 15.4%    | Home Win      | Upcoming |
| 2027-03-03 | Chelsea           | 1 - 0        | Coventry          | 67.7%    | 19.6%    | 12.7%    | Home Win      | Upcoming |

### Gameweek 29

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2027-03-13 | Leeds             | 1 - 0        | Brighton          | 40.4%    | 24.7%    | 34.9%    | Home Win      | Upcoming |
| 2027-03-13 | Tottenham         | 1 - 1        | Nottingham Forest | 39.3%    | 25.2%    | 35.5%    | Draw          | Upcoming |
| 2027-03-13 | Crystal Palace    | 1 - 1        | Fulham            | 38.8%    | 26.3%    | 34.9%    | Draw          | Upcoming |
| 2027-03-13 | Liverpool         | 2 - 0        | Ipswich           | 70.0%    | 18.3%    | 11.7%    | Home Win      | Upcoming |
| 2027-03-13 | Coventry          | 0 - 2        | Manchester City   | 13.4%    | 17.9%    | 68.7%    | Away Win      | Upcoming |
| 2027-03-13 | Bournemouth       | 1 - 0        | Newcastle         | 49.5%    | 23.6%    | 26.9%    | Home Win      | Upcoming |
| 2027-03-13 | Chelsea           | 0 - 1        | Arsenal           | 24.9%    | 24.1%    | 51.0%    | Away Win      | Upcoming |
| 2027-03-13 | Aston Villa       | 2 - 1        | Hull              | 60.3%    | 21.9%    | 17.8%    | Home Win      | Upcoming |
| 2027-03-13 | Manchester United | 2 - 1        | Everton           | 52.9%    | 23.4%    | 23.7%    | Home Win      | Upcoming |
| 2027-03-13 | Sunderland        | 1 - 0        | Brentford         | 38.1%    | 23.9%    | 38.0%    | Home Win      | Upcoming |

### Gameweek 30

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2027-03-20 | Brentford         | 1 - 1        | Bournemouth       | 39.3%    | 25.3%    | 35.4%    | Draw          | Upcoming |
| 2027-03-20 | Brighton          | 1 - 0        | Coventry          | 67.9%    | 19.4%    | 12.7%    | Home Win      | Upcoming |
| 2027-03-20 | Manchester City   | 1 - 0        | Manchester United | 61.4%    | 21.2%    | 17.4%    | Home Win      | Upcoming |
| 2027-03-20 | Ipswich           | 0 - 1        | Crystal Palace    | 23.3%    | 23.6%    | 53.1%    | Away Win      | Upcoming |
| 2027-03-20 | Arsenal           | 2 - 0        | Sunderland        | 71.3%    | 17.8%    | 10.9%    | Home Win      | Upcoming |
| 2027-03-20 | Fulham            | 0 - 1        | Liverpool         | 35.0%    | 24.1%    | 40.9%    | Away Win      | Upcoming |
| 2027-03-20 | Hull              | 1 - 2        | Chelsea           | 32.3%    | 22.9%    | 44.8%    | Away Win      | Upcoming |
| 2027-03-20 | Nottingham Forest | 1 - 0        | Aston Villa       | 38.8%    | 24.6%    | 36.6%    | Home Win      | Upcoming |
| 2027-03-20 | Everton           | 1 - 0        | Tottenham         | 49.9%    | 24.4%    | 25.7%    | Home Win      | Upcoming |
| 2027-03-20 | Newcastle         | 1 - 0        | Leeds             | 50.4%    | 24.5%    | 25.1%    | Home Win      | Upcoming |

### Gameweek 31

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2027-04-10 | Sunderland        | 1 - 0        | Ipswich           | 57.4%    | 21.8%    | 20.8%    | Home Win      | Upcoming |
| 2027-04-10 | Leeds             | 1 - 1        | Nottingham Forest | 39.9%    | 25.5%    | 34.6%    | Draw          | Upcoming |
| 2027-04-10 | Manchester United | 2 - 1        | Hull              | 65.2%    | 20.2%    | 14.6%    | Home Win      | Upcoming |
| 2027-04-10 | Chelsea           | 1 - 0        | Fulham            | 49.6%    | 25.0%    | 25.4%    | Home Win      | Upcoming |
| 2027-04-10 | Liverpool         | 2 - 1        | Newcastle         | 53.4%    | 23.2%    | 23.4%    | Home Win      | Upcoming |
| 2027-04-10 | Coventry          | 0 - 2        | Arsenal           | 15.3%    | 18.2%    | 66.5%    | Away Win      | Upcoming |
| 2027-04-10 | Bournemouth       | 0 - 1        | Manchester City   | 28.8%    | 24.2%    | 47.0%    | Away Win      | Upcoming |
| 2027-04-10 | Crystal Palace    | 1 - 1        | Everton           | 36.3%    | 26.2%    | 37.5%    | Draw          | Upcoming |
| 2027-04-10 | Tottenham         | 1 - 0        | Brentford         | 40.1%    | 24.3%    | 35.6%    | Home Win      | Upcoming |
| 2027-04-10 | Aston Villa       | 1 - 0        | Brighton          | 44.5%    | 25.1%    | 30.4%    | Home Win      | Upcoming |

### Gameweek 32

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2027-04-17 | Brighton          | 2 - 1        | Chelsea           | 45.2%    | 24.4%    | 30.4%    | Home Win      | Upcoming |
| 2027-04-17 | Fulham            | 2 - 1        | Sunderland        | 54.9%    | 22.3%    | 22.8%    | Home Win      | Upcoming |
| 2027-04-17 | Brentford         | 1 - 0        | Leeds             | 48.2%    | 24.6%    | 27.2%    | Home Win      | Upcoming |
| 2027-04-17 | Nottingham Forest | 0 - 1        | Liverpool         | 29.1%    | 24.2%    | 46.7%    | Away Win      | Upcoming |
| 2027-04-17 | Hull              | 1 - 0        | Coventry          | 57.1%    | 22.0%    | 20.9%    | Home Win      | Upcoming |
| 2027-04-17 | Arsenal           | 1 - 0        | Aston Villa       | 66.2%    | 19.8%    | 14.0%    | Home Win      | Upcoming |
| 2027-04-17 | Ipswich           | 1 - 2        | Manchester United | 16.4%    | 21.1%    | 62.5%    | Away Win      | Upcoming |
| 2027-04-17 | Manchester City   | 2 - 0        | Crystal Palace    | 70.6%    | 17.9%    | 11.5%    | Home Win      | Upcoming |
| 2027-04-17 | Newcastle         | 1 - 0        | Tottenham         | 59.4%    | 22.0%    | 18.6%    | Home Win      | Upcoming |
| 2027-04-17 | Everton           | 1 - 1        | Bournemouth       | 36.3%    | 25.2%    | 38.5%    | Draw          | Upcoming |

### Gameweek 33

| Date       | Home              | Pred Score   | Away            | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-----------------|----------|----------|----------|---------------|----------|
| 2027-04-24 | Chelsea           | 0 - 1        | Manchester City | 24.7%    | 24.3%    | 51.0%    | Away Win      | Upcoming |
| 2027-04-24 | Bournemouth       | 0 - 1        | Arsenal         | 29.9%    | 24.4%    | 45.7%    | Away Win      | Upcoming |
| 2027-04-24 | Tottenham         | 1 - 0        | Hull            | 56.8%    | 22.5%    | 20.7%    | Home Win      | Upcoming |
| 2027-04-24 | Manchester United | 1 - 0        | Crystal Palace  | 57.6%    | 22.1%    | 20.3%    | Home Win      | Upcoming |
| 2027-04-24 | Everton           | 1 - 1        | Brighton        | 41.0%    | 25.0%    | 34.0%    | Draw          | Upcoming |
| 2027-04-24 | Nottingham Forest | 2 - 1        | Sunderland      | 50.6%    | 23.3%    | 26.1%    | Home Win      | Upcoming |
| 2027-04-24 | Newcastle         | 1 - 0        | Ipswich         | 66.3%    | 19.9%    | 13.8%    | Home Win      | Upcoming |
| 2027-04-24 | Aston Villa       | 1 - 0        | Coventry        | 67.4%    | 19.6%    | 13.0%    | Home Win      | Upcoming |
| 2027-04-24 | Brentford         | 1 - 0        | Fulham          | 48.0%    | 25.1%    | 26.9%    | Home Win      | Upcoming |
| 2027-04-24 | Leeds             | 0 - 1        | Liverpool       | 30.3%    | 24.3%    | 45.4%    | Away Win      | Upcoming |

### Gameweek 34

| Date       | Home            | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-----------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2027-05-01 | Sunderland      | 0 - 1        | Newcastle         | 33.0%    | 24.2%    | 42.8%    | Away Win      | Upcoming |
| 2027-05-01 | Brighton        | 2 - 1        | Nottingham Forest | 47.3%    | 25.0%    | 27.7%    | Home Win      | Upcoming |
| 2027-05-01 | Coventry        | 1 - 2        | Manchester United | 17.6%    | 21.0%    | 61.4%    | Away Win      | Upcoming |
| 2027-05-01 | Hull            | 1 - 2        | Bournemouth       | 33.0%    | 22.5%    | 44.5%    | Away Win      | Upcoming |
| 2027-05-01 | Manchester City | 2 - 0        | Brentford         | 68.6%    | 18.7%    | 12.7%    | Home Win      | Upcoming |
| 2027-05-01 | Fulham          | 2 - 1        | Everton           | 44.9%    | 24.6%    | 30.5%    | Home Win      | Upcoming |
| 2027-05-01 | Liverpool       | 2 - 1        | Chelsea           | 54.2%    | 23.0%    | 22.8%    | Home Win      | Upcoming |
| 2027-05-01 | Arsenal         | 2 - 0        | Tottenham         | 70.3%    | 18.4%    | 11.3%    | Home Win      | Upcoming |
| 2027-05-01 | Crystal Palace  | 1 - 1        | Aston Villa       | 36.3%    | 25.2%    | 38.5%    | Draw          | Upcoming |
| 2027-05-01 | Ipswich         | 0 - 1        | Leeds             | 23.8%    | 23.7%    | 52.5%    | Away Win      | Upcoming |

### Gameweek 35

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2027-05-08 | Manchester City   | 1 - 0        | Liverpool         | 57.5%    | 22.1%    | 20.4%    | Home Win      | Upcoming |
| 2027-05-08 | Leeds             | 0 - 1        | Arsenal           | 24.2%    | 22.6%    | 53.2%    | Away Win      | Upcoming |
| 2027-05-08 | Fulham            | 1 - 0        | Ipswich           | 62.8%    | 20.8%    | 16.4%    | Home Win      | Upcoming |
| 2027-05-08 | Nottingham Forest | 2 - 1        | Crystal Palace    | 44.8%    | 24.3%    | 30.9%    | Home Win      | Upcoming |
| 2027-05-08 | Brentford         | 1 - 0        | Aston Villa       | 44.8%    | 24.7%    | 30.5%    | Home Win      | Upcoming |
| 2027-05-08 | Newcastle         | 1 - 0        | Coventry          | 69.6%    | 18.8%    | 11.6%    | Home Win      | Upcoming |
| 2027-05-08 | Brighton          | 2 - 1        | Sunderland        | 58.3%    | 21.8%    | 19.9%    | Home Win      | Upcoming |
| 2027-05-08 | Tottenham         | 1 - 0        | Chelsea           | 38.1%    | 24.3%    | 37.6%    | Home Win      | Upcoming |
| 2027-05-08 | Everton           | 2 - 1        | Hull              | 56.6%    | 22.9%    | 20.5%    | Home Win      | Upcoming |
| 2027-05-08 | Bournemouth       | 1 - 1        | Manchester United | 41.4%    | 25.0%    | 33.6%    | Draw          | Upcoming |

### Gameweek 36

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2027-05-15 | Hull              | 2 - 1        | Fulham            | 38.7%    | 24.0%    | 37.3%    | Home Win      | Upcoming |
| 2027-05-15 | Manchester United | 2 - 1        | Leeds             | 56.2%    | 22.5%    | 21.3%    | Home Win      | Upcoming |
| 2027-05-15 | Crystal Palace    | 1 - 1        | Brighton          | 31.4%    | 26.2%    | 42.4%    | Draw          | Upcoming |
| 2027-05-15 | Aston Villa       | 1 - 0        | Newcastle         | 45.5%    | 24.6%    | 29.9%    | Home Win      | Upcoming |
| 2027-05-15 | Chelsea           | 1 - 0        | Everton           | 47.1%    | 25.0%    | 27.9%    | Home Win      | Upcoming |
| 2027-05-15 | Coventry          | 0 - 1        | Tottenham         | 26.4%    | 23.9%    | 49.7%    | Away Win      | Upcoming |
| 2027-05-15 | Sunderland        | 0 - 1        | Bournemouth       | 35.6%    | 23.6%    | 40.8%    | Away Win      | Upcoming |
| 2027-05-15 | Liverpool         | 1 - 0        | Brentford         | 55.9%    | 22.7%    | 21.4%    | Home Win      | Upcoming |
| 2027-05-15 | Ipswich           | 0 - 2        | Manchester City   | 12.8%    | 18.2%    | 69.0%    | Away Win      | Upcoming |
| 2027-05-15 | Arsenal           | 1 - 0        | Nottingham Forest | 64.5%    | 20.7%    | 14.8%    | Home Win      | Upcoming |

### Gameweek 37

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2027-05-23 | Brentford         | 1 - 0        | Hull              | 60.0%    | 22.0%    | 18.0%    | Home Win      | Upcoming |
| 2027-05-23 | Newcastle         | 1 - 0        | Crystal Palace    | 55.5%    | 22.6%    | 21.9%    | Home Win      | Upcoming |
| 2027-05-23 | Tottenham         | 0 - 1        | Manchester United | 32.6%    | 24.5%    | 42.9%    | Away Win      | Upcoming |
| 2027-05-23 | Leeds             | 1 - 0        | Sunderland        | 47.5%    | 24.2%    | 28.3%    | Home Win      | Upcoming |
| 2027-05-23 | Brighton          | 1 - 0        | Liverpool         | 38.8%    | 24.6%    | 36.6%    | Home Win      | Upcoming |
| 2027-05-23 | Nottingham Forest | 1 - 0        | Ipswich           | 60.6%    | 21.4%    | 18.0%    | Home Win      | Upcoming |
| 2027-05-23 | Bournemouth       | 1 - 0        | Chelsea           | 45.9%    | 24.6%    | 29.5%    | Home Win      | Upcoming |
| 2027-05-23 | Fulham            | 1 - 0        | Coventry          | 64.2%    | 20.7%    | 15.1%    | Home Win      | Upcoming |
| 2027-05-23 | Everton           | 0 - 1        | Arsenal           | 23.4%    | 23.0%    | 53.6%    | Away Win      | Upcoming |
| 2027-05-23 | Manchester City   | 1 - 0        | Aston Villa       | 67.5%    | 19.0%    | 13.5%    | Home Win      | Upcoming |

### Gameweek 38

| Date       | Home              | Pred Score   | Away              | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|--------------|-------------------|----------|----------|----------|---------------|----------|
| 2027-05-30 | Ipswich           | 1 - 2        | Everton           | 20.6%    | 23.2%    | 56.2%    | Away Win      | Upcoming |
| 2027-05-30 | Arsenal           | 1 - 0        | Brighton          | 61.5%    | 21.6%    | 16.9%    | Home Win      | Upcoming |
| 2027-05-30 | Liverpool         | 1 - 0        | Bournemouth       | 51.6%    | 23.5%    | 24.9%    | Home Win      | Upcoming |
| 2027-05-30 | Coventry          | 1 - 2        | Nottingham Forest | 19.9%    | 22.7%    | 57.4%    | Away Win      | Upcoming |
| 2027-05-30 | Aston Villa       | 1 - 0        | Tottenham         | 54.4%    | 23.5%    | 22.1%    | Home Win      | Upcoming |
| 2027-05-30 | Hull              | 1 - 2        | Newcastle         | 32.7%    | 22.9%    | 44.4%    | Away Win      | Upcoming |
| 2027-05-30 | Manchester United | 1 - 0        | Fulham            | 57.1%    | 22.7%    | 20.2%    | Home Win      | Upcoming |
| 2027-05-30 | Sunderland        | 0 - 1        | Manchester City   | 19.6%    | 21.2%    | 59.2%    | Away Win      | Upcoming |
| 2027-05-30 | Chelsea           | 1 - 1        | Brentford         | 42.6%    | 25.6%    | 31.8%    | Draw          | Upcoming |
| 2027-05-30 | Crystal Palace    | 1 - 1        | Leeds             | 41.7%    | 25.4%    | 32.9%    | Draw          | Upcoming |

