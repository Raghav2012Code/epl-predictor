# Premier League 2026/2027 Season Match Predictions

Generated on: 2026-10-28 12:36:55
Primary Prediction Engine: **Random Forest**

## Model Performance Benchmark Summary

| Model         | Accuracy   |   Macro F1 |   Log Loss |   Goal MAE | Within 1 Goal Acc   |   Scoreline KL | Variety   |
|---------------|------------|------------|------------|------------|---------------------|----------------|-----------|
| Random Forest | 50.6%      |      0.472 |      1.031 |       0.89 | 61.4%               |         7.1373 | 25.3%     |
| XGBoost       | 50.6%      |      0.464 |      1.041 |       0.87 | 58.9%               |        10.1708 | 20.9%     |
| Stacked       | 50.0%      |      0.462 |      1.027 |       0.87 | 59.5%               |         8.4604 | 24.7%     |

Scoreline quality is measured on the held-out evaluation tail: KL divergence (natural log, 6x6 grid capped at 5 goals, lower is better) between empirical and predicted scoreline distributions, plus argmax-variety (share of argmax picks outside the four most frequent predicted scorelines, higher means more varied). Production (Random Forest): KL 7.1373, variety 25.3% over 158 matches.

---

## Season Fixtures and Forecasts

### Gameweek 1

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-08-21 | Arsenal           | 2 - 0         | Coventry          | 2 - 0 (10.7%), 1 - 1 (10.8%), 1 - 0 (10.4%) | 69.7%    | 17.2%    | 13.1%    | Home Win      | Played   |
| 2026-08-22 | Hull              | 0 - 2         | Manchester United | 0 - 2 (12.5%), 0 - 1 (12.1%), 1 - 1 (10.5%) | 11.2%    | 20.6%    | 68.2%    | Away Win      | Played   |
| 2026-08-22 | Ipswich           | 1 - 2         | Sunderland        | 1 - 2 (9.8%), 1 - 1 (11.3%), 0 - 1 (8.9%)   | 23.7%    | 27.9%    | 48.4%    | Away Win      | Played   |
| 2026-08-22 | Nottingham Forest | 1 - 1         | Leeds             | 1 - 1 (13.6%), 0 - 1 (11.4%), 0 - 0 (9.7%)  | 30.4%    | 30.5%    | 39.1%    | Draw          | Played   |
| 2026-08-22 | Everton           | 1 - 1         | Crystal Palace    | 1 - 1 (12.8%), 0 - 1 (9.4%), 1 - 2 (9.1%)   | 35.4%    | 27.9%    | 36.7%    | Draw          | Played   |
| 2026-08-22 | Brentford         | 2 - 1         | Tottenham         | 2 - 1 (9.5%), 1 - 1 (11.9%), 1 - 0 (8.6%)   | 45.4%    | 28.5%    | 26.1%    | Home Win      | Played   |
| 2026-08-23 | Manchester City   | 2 - 1         | Bournemouth       | 2 - 1 (9.8%), 1 - 1 (9.7%), 2 - 0 (8.7%)    | 62.8%    | 18.9%    | 18.3%    | Home Win      | Played   |
| 2026-08-23 | Brighton          | 1 - 0         | Aston Villa       | 1 - 0 (10.3%), 1 - 1 (12.9%), 2 - 1 (9.3%)  | 47.6%    | 25.8%    | 26.6%    | Home Win      | Played   |
| 2026-08-23 | Newcastle         | 0 - 1         | Liverpool         | 0 - 1 (10.1%), 1 - 1 (13.0%), 1 - 2 (9.1%)  | 28.6%    | 28.8%    | 42.6%    | Away Win      | Played   |
| 2026-08-24 | Fulham            | 1 - 1         | Chelsea           | 1 - 1 (13.1%), 0 - 1 (8.9%), 1 - 2 (8.4%)   | 34.7%    | 26.7%    | 38.6%    | Draw          | Played   |

### Gameweek 2

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-08-28 | Crystal Palace    | 0 - 1         | Manchester City   | 0 - 1 (12.7%), 1 - 1 (12.9%), 0 - 2 (10.2%) | 17.6%    | 25.0%    | 57.4%    | Away Win      | Played   |
| 2026-08-29 | Liverpool         | 2 - 1         | Nottingham Forest | 2 - 1 (9.5%), 1 - 1 (10.1%), 2 - 0 (7.1%)   | 52.8%    | 20.8%    | 26.4%    | Home Win      | Played   |
| 2026-08-29 | Bournemouth       | 1 - 0         | Everton           | 1 - 0 (10.9%), 1 - 1 (13.6%), 0 - 0 (9.5%)  | 44.6%    | 27.3%    | 28.1%    | Home Win      | Played   |
| 2026-08-29 | Coventry          | 2 - 1         | Hull              | 2 - 1 (8.7%), 1 - 1 (8.9%), 2 - 2 (7.0%)    | 44.6%    | 26.6%    | 28.8%    | Home Win      | Played   |
| 2026-08-29 | Tottenham         | 1 - 0         | Newcastle         | 1 - 0 (12.7%), 1 - 1 (12.7%), 2 - 0 (10.5%) | 48.5%    | 24.4%    | 27.1%    | Home Win      | Played   |
| 2026-08-30 | Sunderland        | 1 - 1         | Fulham            | 1 - 1 (13.0%), 1 - 0 (11.4%), 2 - 1 (9.3%)  | 38.8%    | 30.4%    | 30.8%    | Draw          | Played   |
| 2026-08-30 | Chelsea           | 1 - 1         | Brighton          | 1 - 1 (11.8%), 2 - 1 (9.1%), 1 - 2 (7.6%)   | 41.0%    | 25.4%    | 33.6%    | Draw          | Played   |
| 2026-08-30 | Leeds             | 1 - 1         | Brentford         | 1 - 1 (13.1%), 0 - 1 (9.9%), 1 - 2 (8.9%)   | 33.1%    | 30.4%    | 36.5%    | Draw          | Played   |
| 2026-08-30 | Manchester United | 2 - 0         | Ipswich           | 2 - 0 (11.9%), 1 - 0 (10.7%), 1 - 1 (9.8%)  | 63.4%    | 21.0%    | 15.6%    | Home Win      | Played   |
| 2026-08-31 | Aston Villa       | 1 - 2         | Arsenal           | 1 - 2 (9.9%), 1 - 1 (10.4%), 0 - 2 (9.3%)   | 15.7%    | 23.3%    | 61.0%    | Away Win      | Played   |

### Gameweek 3

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-09-04 | Ipswich           | 1 - 2         | Liverpool         | 1 - 2 (8.6%), 0 - 2 (8.5%), 1 - 3 (8.2%)    | 13.1%    | 19.5%    | 67.4%    | Away Win      | Played   |
| 2026-09-05 | Newcastle         | 1 - 1         | Bournemouth       | 1 - 1 (11.9%), 2 - 1 (9.5%), 1 - 0 (8.4%)   | 41.4%    | 27.9%    | 30.7%    | Draw          | Played   |
| 2026-09-05 | Nottingham Forest | 1 - 1         | Tottenham         | 1 - 1 (12.5%), 1 - 2 (8.6%), 2 - 1 (8.1%)   | 37.4%    | 27.7%    | 34.9%    | Draw          | Played   |
| 2026-09-05 | Manchester City   | 2 - 0         | Coventry          | 2 - 0 (11.5%), 3 - 0 (9.8%), 2 - 1 (9.1%)   | 76.1%    | 14.9%    | 9.0%     | Home Win      | Played   |
| 2026-09-05 | Brighton          | 2 - 1         | Leeds             | 2 - 1 (9.4%), 1 - 1 (12.2%), 1 - 0 (8.9%)   | 47.1%    | 24.9%    | 28.0%    | Home Win      | Played   |
| 2026-09-05 | Brentford         | 2 - 1         | Sunderland        | 2 - 1 (9.8%), 1 - 1 (11.1%), 2 - 0 (8.7%)   | 49.0%    | 27.8%    | 23.2%    | Home Win      | Played   |
| 2026-09-05 | Fulham            | 1 - 0         | Crystal Palace    | 1 - 0 (11.1%), 1 - 1 (13.1%), 2 - 1 (9.2%)  | 49.5%    | 25.8%    | 24.7%    | Home Win      | Played   |
| 2026-09-05 | Hull              | 1 - 1         | Aston Villa       | 1 - 1 (10.8%), 1 - 2 (9.1%), 2 - 1 (7.4%)   | 31.5%    | 30.0%    | 38.5%    | Draw          | Played   |
| 2026-09-06 | Everton           | 0 - 1         | Manchester United | 0 - 1 (13.7%), 1 - 1 (14.0%), 0 - 0 (12.7%) | 25.2%    | 29.3%    | 45.5%    | Away Win      | Played   |
| 2026-09-06 | Arsenal           | 2 - 0         | Chelsea           | 2 - 0 (10.0%), 2 - 1 (9.8%), 1 - 1 (9.3%)   | 57.4%    | 24.4%    | 18.2%    | Home Win      | Played   |

### Gameweek 4

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-09-12 | Crystal Palace    | 2 - 1         | Ipswich           | 2 - 1 (9.8%), 1 - 1 (11.3%), 1 - 0 (9.0%)   | 52.3%    | 23.5%    | 24.2%    | Home Win      | Played   |
| 2026-09-12 | Liverpool         | 1 - 0         | Fulham            | 1 - 0 (12.1%), 1 - 1 (11.9%), 2 - 0 (11.0%) | 52.5%    | 28.8%    | 18.7%    | Home Win      | Played   |
| 2026-09-12 | Aston Villa       | 1 - 0         | Nottingham Forest | 1 - 0 (9.7%), 1 - 1 (12.4%), 2 - 1 (9.5%)   | 43.0%    | 26.1%    | 30.9%    | Home Win      | Played   |
| 2026-09-12 | Bournemouth       | 1 - 0         | Brentford         | 1 - 0 (10.2%), 1 - 1 (13.4%), 2 - 1 (8.7%)  | 41.3%    | 27.5%    | 31.2%    | Home Win      | Played   |
| 2026-09-12 | Chelsea           | 2 - 1         | Hull              | 2 - 1 (9.9%), 1 - 1 (10.6%), 2 - 0 (8.8%)   | 46.5%    | 26.1%    | 27.4%    | Home Win      | Played   |
| 2026-09-12 | Tottenham         | 1 - 0         | Everton           | 1 - 0 (12.1%), 1 - 1 (12.8%), 2 - 0 (9.9%)  | 49.4%    | 24.5%    | 26.1%    | Home Win      | Played   |
| 2026-09-12 | Sunderland        | 1 - 2         | Arsenal           | 1 - 2 (8.9%), 1 - 1 (11.5%), 2 - 1 (7.9%)   | 31.8%    | 27.0%    | 41.2%    | Away Win      | Played   |
| 2026-09-13 | Coventry          | 1 - 2         | Brighton          | 1 - 2 (9.5%), 1 - 1 (8.5%), 0 - 2 (8.0%)    | 20.0%    | 25.7%    | 54.3%    | Away Win      | Played   |
| 2026-09-13 | Manchester United | 2 - 1         | Manchester City   | 2 - 1 (9.0%), 1 - 1 (12.3%), 1 - 0 (8.3%)   | 41.6%    | 25.3%    | 33.1%    | Home Win      | Played   |
| 2026-09-14 | Leeds             | 1 - 1         | Newcastle         | 1 - 1 (14.2%), 0 - 0 (12.2%), 1 - 0 (11.6%) | 37.4%    | 28.2%    | 34.4%    | Draw          | Played   |

### Gameweek 5

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-09-18 | Brentford         | 1 - 0         | Chelsea           | 1 - 0 (11.9%), 1 - 1 (13.9%), 0 - 0 (10.9%) | 39.7%    | 28.9%    | 31.4%    | Home Win      | Played   |
| 2026-09-19 | Tottenham         | 1 - 0         | Aston Villa       | 1 - 0 (11.6%), 1 - 1 (13.3%), 0 - 0 (9.3%)  | 45.2%    | 25.3%    | 29.5%    | Home Win      | Played   |
| 2026-09-19 | Everton           | 1 - 0         | Ipswich           | 1 - 0 (11.4%), 1 - 1 (11.6%), 2 - 0 (10.8%) | 54.7%    | 27.2%    | 18.1%    | Home Win      | Played   |
| 2026-09-19 | Leeds             | 2 - 1         | Crystal Palace    | 2 - 1 (9.4%), 1 - 1 (12.3%), 1 - 0 (9.2%)   | 47.2%    | 27.5%    | 25.3%    | Home Win      | Played   |
| 2026-09-19 | Brighton          | 1 - 1         | Arsenal           | 1 - 1 (11.3%), 1 - 2 (8.6%), 2 - 1 (8.2%)   | 33.7%    | 27.2%    | 39.1%    | Draw          | Played   |
| 2026-09-19 | Newcastle         | 2 - 1         | Hull              | 2 - 1 (9.9%), 1 - 1 (11.0%), 2 - 0 (9.9%)   | 51.7%    | 21.6%    | 26.7%    | Home Win      | Played   |
| 2026-09-19 | Nottingham Forest | 1 - 0         | Coventry          | 1 - 0 (10.2%), 1 - 1 (11.6%), 2 - 1 (9.9%)  | 55.9%    | 25.0%    | 19.1%    | Home Win      | Played   |
| 2026-09-20 | Bournemouth       | 1 - 0         | Liverpool         | 1 - 0 (9.5%), 1 - 1 (12.8%), 2 - 1 (9.2%)   | 41.4%    | 26.0%    | 32.6%    | Home Win      | Played   |
| 2026-09-20 | Manchester City   | 2 - 0         | Sunderland        | 2 - 0 (12.7%), 1 - 0 (11.8%), 1 - 1 (9.9%)  | 64.0%    | 19.9%    | 16.1%    | Home Win      | Played   |
| 2026-09-20 | Fulham            | 1 - 1         | Manchester United | 1 - 1 (14.1%), 1 - 0 (11.5%), 0 - 0 (11.1%) | 35.8%    | 26.7%    | 37.5%    | Draw          | Played   |

### Gameweek 6

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-10-10 | Arsenal           | 2 - 1         | Leeds             | 2 - 1 (9.8%), 1 - 1 (9.2%), 2 - 0 (8.8%)    | 60.6%    | 20.6%    | 18.8%    | Home Win      | Played   |
| 2026-10-10 | Sunderland        | 1 - 1         | Brighton          | 1 - 1 (11.4%), 2 - 1 (8.5%), 1 - 2 (8.3%)   | 35.4%    | 24.3%    | 40.3%    | Draw          | Played   |
| 2026-10-10 | Chelsea           | 1 - 1         | Bournemouth       | 1 - 1 (13.6%), 1 - 0 (9.9%), 0 - 1 (9.0%)   | 34.1%    | 27.2%    | 38.7%    | Draw          | Played   |
| 2026-10-10 | Ipswich           | 0 - 1         | Fulham            | 0 - 1 (9.7%), 1 - 1 (13.1%), 1 - 2 (8.9%)   | 29.3%    | 28.1%    | 42.6%    | Away Win      | Played   |
| 2026-10-10 | Aston Villa       | 1 - 1         | Brentford         | 1 - 1 (11.1%), 1 - 2 (8.6%), 2 - 1 (8.0%)   | 39.9%    | 26.0%    | 34.1%    | Draw          | Played   |
| 2026-10-10 | Manchester United | 2 - 1         | Tottenham         | 2 - 1 (9.7%), 1 - 1 (11.5%), 1 - 0 (8.7%)   | 48.8%    | 24.4%    | 26.8%    | Home Win      | Played   |
| 2026-10-11 | Hull              | 1 - 1         | Everton           | 1 - 1 (13.6%), 0 - 1 (10.0%), 0 - 0 (9.0%)  | 37.2%    | 28.2%    | 34.6%    | Draw          | Played   |
| 2026-10-11 | Crystal Palace    | 0 - 1         | Nottingham Forest | 0 - 1 (11.8%), 1 - 1 (13.7%), 0 - 0 (10.3%) | 27.3%    | 26.8%    | 45.9%    | Away Win      | Played   |
| 2026-10-11 | Liverpool         | 1 - 1         | Manchester City   | 1 - 1 (12.1%), 2 - 1 (8.6%), 1 - 2 (8.2%)   | 37.0%    | 24.7%    | 38.3%    | Draw          | Played   |
| 2026-10-12 | Coventry          | 1 - 2         | Newcastle         | 1 - 2 (9.7%), 0 - 2 (8.9%), 1 - 1 (8.8%)    | 18.9%    | 22.7%    | 58.4%    | Away Win      | Played   |

### Gameweek 7

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-10-17 | Everton           | 1 - 0         | Chelsea           | 1 - 0 (12.1%), 1 - 1 (13.6%), 0 - 0 (10.2%) | 42.4%    | 28.1%    | 29.5%    | Home Win      | Played   |
| 2026-10-17 | Fulham            | 1 - 0         | Hull              | 1 - 0 (11.0%), 1 - 1 (11.7%), 2 - 0 (10.4%) | 53.4%    | 22.6%    | 24.0%    | Home Win      | Played   |
| 2026-10-17 | Manchester City   | 2 - 0         | Ipswich           | 2 - 0 (10.2%), 2 - 1 (9.6%), 1 - 1 (8.5%)   | 62.4%    | 22.5%    | 15.1%    | Home Win      | Played   |
| 2026-10-17 | Brentford         | 1 - 0         | Liverpool         | 1 - 0 (10.4%), 1 - 1 (13.2%), 2 - 1 (9.0%)  | 40.7%    | 29.1%    | 30.2%    | Home Win      | Played   |
| 2026-10-17 | Newcastle         | 1 - 0         | Aston Villa       | 1 - 0 (9.2%), 1 - 1 (12.8%), 2 - 1 (9.0%)   | 40.7%    | 28.1%    | 31.2%    | Home Win      | Played   |
| 2026-10-18 | Bournemouth       | 2 - 1         | Sunderland        | 2 - 1 (9.9%), 1 - 1 (11.4%), 1 - 0 (9.3%)   | 51.3%    | 22.9%    | 25.8%    | Home Win      | Played   |
| 2026-10-18 | Leeds             | 1 - 1         | Manchester United | 1 - 1 (13.6%), 1 - 0 (10.1%), 0 - 0 (9.2%)  | 38.7%    | 26.5%    | 34.8%    | Draw          | Played   |
| 2026-10-18 | Brighton          | 1 - 0         | Crystal Palace    | 1 - 0 (10.5%), 1 - 1 (11.4%), 2 - 0 (10.2%) | 52.7%    | 24.6%    | 22.7%    | Home Win      | Played   |
| 2026-10-18 | Nottingham Forest | 0 - 1         | Arsenal           | 0 - 1 (11.4%), 1 - 1 (13.5%), 0 - 0 (9.5%)  | 29.8%    | 25.9%    | 44.3%    | Away Win      | Played   |
| 2026-10-19 | Tottenham         | 1 - 0         | Coventry          | 1 - 0 (11.3%), 1 - 1 (11.8%), 2 - 0 (10.5%) | 57.5%    | 22.0%    | 20.5%    | Home Win      | Played   |

### Gameweek 8

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-10-23 | Ipswich           | 1 - 1         | Nottingham Forest | 1 - 1 (12.0%), 2 - 1 (8.6%), 1 - 2 (8.1%)   | 35.9%    | 31.9%    | 32.2%    | Draw          | Played   |
| 2026-10-24 | Aston Villa       | 1 - 1         | Manchester City   | 1 - 1 (10.1%), 2 - 1 (8.4%), 1 - 2 (8.0%)   | 37.2%    | 23.5%    | 39.3%    | Draw          | Played   |
| 2026-10-24 | Liverpool         | 2 - 1         | Brighton          | 2 - 1 (9.5%), 1 - 1 (9.2%), 2 - 0 (7.3%)    | 51.6%    | 23.5%    | 24.9%    | Home Win      | Played   |
| 2026-10-24 | Arsenal           | 2 - 1         | Everton           | 2 - 1 (9.9%), 1 - 1 (11.1%), 2 - 0 (8.9%)   | 53.1%    | 23.1%    | 23.8%    | Home Win      | Played   |
| 2026-10-24 | Coventry          | 1 - 2         | Fulham            | 1 - 2 (9.7%), 1 - 1 (10.8%), 0 - 2 (7.8%)   | 27.6%    | 26.8%    | 45.6%    | Away Win      | Played   |
| 2026-10-24 | Chelsea           | 1 - 0         | Tottenham         | 1 - 0 (10.9%), 1 - 1 (11.1%), 2 - 0 (10.9%) | 52.7%    | 24.1%    | 23.2%    | Home Win      | Played   |
| 2026-10-25 | Crystal Palace    | 1 - 1         | Newcastle         | 1 - 1 (11.7%), 2 - 1 (9.1%), 1 - 2 (7.6%)   | 34.5%    | 26.6%    | 38.9%    | Draw          | Played   |
| 2026-10-25 | Manchester United | 1 - 0         | Bournemouth       | 1 - 0 (10.3%), 1 - 1 (12.3%), 2 - 1 (9.6%)  | 47.5%    | 26.0%    | 26.5%    | Home Win      | Played   |
| 2026-10-25 | Hull              | 1 - 1         | Brentford         | 1 - 1 (13.7%), 0 - 1 (10.4%), 0 - 0 (9.4%)  | 35.3%    | 28.2%    | 36.5%    | Draw          | Played   |
| 2026-10-25 | Sunderland        | 1 - 1         | Leeds             | 1 - 1 (13.9%), 0 - 1 (10.5%), 0 - 0 (10.0%) | 35.7%    | 23.7%    | 40.6%    | Draw          | Played   |

### Gameweek 9

| Date       | Home            | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-----------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-10-31 | Chelsea         | 1 - 0         | Manchester United | 1 - 0 (11.0%), 1 - 1 (13.1%), 2 - 1 (9.2%)  | 45.4%    | 30.3%    | 24.3%    | Home Win      | Upcoming |
| 2026-10-31 | Manchester City | 2 - 1         | Brighton          | 2 - 1 (9.7%), 1 - 1 (9.0%), 2 - 0 (8.6%)    | 60.4%    | 21.5%    | 18.1%    | Home Win      | Upcoming |
| 2026-10-31 | Bournemouth     | 1 - 0         | Leeds             | 1 - 0 (10.5%), 1 - 1 (11.7%), 2 - 0 (9.9%)  | 50.7%    | 23.7%    | 25.6%    | Home Win      | Upcoming |
| 2026-10-31 | Coventry        | 1 - 1         | Sunderland        | 1 - 1 (12.0%), 1 - 2 (9.4%), 0 - 1 (8.3%)   | 33.6%    | 29.4%    | 37.0%    | Draw          | Upcoming |
| 2026-10-31 | Hull            | 1 - 0         | Ipswich           | 1 - 0 (12.9%), 1 - 1 (13.7%), 0 - 0 (11.0%) | 45.2%    | 27.2%    | 27.6%    | Home Win      | Upcoming |
| 2026-10-31 | Brentford       | 1 - 0         | Nottingham Forest | 1 - 0 (10.3%), 1 - 1 (13.1%), 2 - 1 (9.0%)  | 41.8%    | 28.7%    | 29.5%    | Home Win      | Upcoming |
| 2026-10-31 | Tottenham       | 1 - 0         | Crystal Palace    | 1 - 0 (12.3%), 1 - 1 (13.1%), 2 - 0 (9.6%)  | 48.4%    | 27.8%    | 23.8%    | Home Win      | Upcoming |
| 2026-11-01 | Aston Villa     | 2 - 1         | Fulham            | 2 - 1 (9.9%), 1 - 1 (11.3%), 1 - 0 (9.4%)   | 52.7%    | 23.2%    | 24.1%    | Home Win      | Upcoming |
| 2026-11-01 | Liverpool       | 2 - 1         | Arsenal           | 2 - 1 (9.0%), 1 - 1 (10.9%), 1 - 2 (7.6%)   | 43.3%    | 24.1%    | 32.6%    | Home Win      | Upcoming |
| 2026-11-02 | Newcastle       | 1 - 1         | Everton           | 1 - 1 (12.8%), 2 - 1 (8.3%), 1 - 2 (8.3%)   | 37.8%    | 28.1%    | 34.1%    | Draw          | Upcoming |

### Gameweek 10

| Date       | Home              | Most likely   | Away            | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-----------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-11-07 | Arsenal           | 2 - 1         | Hull            | 2 - 1 (9.9%), 1 - 1 (10.0%), 2 - 0 (9.4%)   | 61.3%    | 21.3%    | 17.4%    | Home Win      | Upcoming |
| 2026-11-07 | Nottingham Forest | 0 - 1         | Manchester City | 0 - 1 (10.9%), 1 - 1 (12.8%), 1 - 2 (9.4%)  | 28.9%    | 27.9%    | 43.2%    | Away Win      | Upcoming |
| 2026-11-07 | Leeds             | 1 - 0         | Tottenham       | 1 - 0 (10.1%), 1 - 1 (13.4%), 2 - 1 (8.7%)  | 44.9%    | 27.5%    | 27.6%    | Home Win      | Upcoming |
| 2026-11-07 | Fulham            | 1 - 0         | Newcastle       | 1 - 0 (10.5%), 1 - 1 (12.8%), 2 - 1 (9.4%)  | 48.1%    | 27.7%    | 24.2%    | Home Win      | Upcoming |
| 2026-11-07 | Everton           | 1 - 0         | Coventry        | 1 - 0 (11.4%), 1 - 1 (11.3%), 2 - 0 (11.2%) | 55.6%    | 23.9%    | 20.5%    | Home Win      | Upcoming |
| 2026-11-07 | Crystal Palace    | 0 - 1         | Liverpool       | 0 - 1 (10.6%), 1 - 1 (13.4%), 0 - 0 (8.9%)  | 27.7%    | 24.0%    | 48.3%    | Away Win      | Upcoming |
| 2026-11-07 | Sunderland        | 1 - 1         | Chelsea         | 1 - 1 (13.5%), 1 - 0 (9.8%), 0 - 1 (8.8%)   | 36.9%    | 27.5%    | 35.6%    | Draw          | Upcoming |
| 2026-11-07 | Ipswich           | 1 - 1         | Bournemouth     | 1 - 1 (12.5%), 2 - 1 (8.5%), 1 - 2 (8.3%)   | 39.4%    | 24.6%    | 36.0%    | Draw          | Upcoming |
| 2026-11-07 | Brighton          | 1 - 0         | Brentford       | 1 - 0 (10.3%), 1 - 1 (12.9%), 2 - 1 (9.2%)  | 44.7%    | 27.4%    | 27.9%    | Home Win      | Upcoming |
| 2026-11-07 | Manchester United | 2 - 1         | Aston Villa     | 2 - 1 (9.6%), 1 - 1 (12.1%), 1 - 0 (9.1%)   | 48.1%    | 23.4%    | 28.5%    | Home Win      | Upcoming |

### Gameweek 11

| Date       | Home            | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-----------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-11-21 | Chelsea         | 1 - 0         | Leeds             | 1 - 0 (10.1%), 1 - 1 (12.3%), 2 - 1 (9.6%)  | 46.6%    | 25.1%    | 28.3%    | Home Win      | Upcoming |
| 2026-11-21 | Manchester City | 2 - 1         | Fulham            | 2 - 1 (10.0%), 1 - 1 (10.3%), 2 - 0 (9.9%)  | 57.9%    | 22.3%    | 19.8%    | Home Win      | Upcoming |
| 2026-11-21 | Aston Villa     | 1 - 0         | Sunderland        | 1 - 0 (10.8%), 1 - 1 (11.8%), 2 - 0 (10.1%) | 52.9%    | 26.4%    | 20.7%    | Home Win      | Upcoming |
| 2026-11-21 | Liverpool       | 1 - 0         | Manchester United | 1 - 0 (10.4%), 1 - 1 (12.4%), 2 - 1 (9.6%)  | 51.3%    | 27.6%    | 21.1%    | Home Win      | Upcoming |
| 2026-11-21 | Hull            | 1 - 1         | Brighton          | 1 - 1 (12.5%), 1 - 2 (9.2%), 0 - 1 (8.9%)   | 35.7%    | 25.0%    | 39.3%    | Draw          | Upcoming |
| 2026-11-21 | Bournemouth     | 1 - 0         | Nottingham Forest | 1 - 0 (12.3%), 1 - 1 (13.2%), 0 - 0 (9.6%)  | 46.8%    | 28.8%    | 24.4%    | Home Win      | Upcoming |
| 2026-11-21 | Tottenham       | 1 - 0         | Ipswich           | 1 - 0 (12.2%), 1 - 1 (11.6%), 2 - 0 (11.3%) | 53.4%    | 26.5%    | 20.1%    | Home Win      | Upcoming |
| 2026-11-21 | Brentford       | 1 - 0         | Everton           | 1 - 0 (10.7%), 1 - 1 (13.1%), 2 - 1 (9.1%)  | 42.3%    | 30.1%    | 27.6%    | Home Win      | Upcoming |
| 2026-11-21 | Coventry        | 1 - 2         | Crystal Palace    | 1 - 2 (9.6%), 1 - 1 (11.4%), 0 - 1 (8.1%)   | 32.1%    | 28.4%    | 39.5%    | Away Win      | Upcoming |
| 2026-11-21 | Newcastle       | 1 - 1         | Arsenal           | 1 - 1 (11.5%), 2 - 1 (8.9%), 1 - 2 (7.8%)   | 39.1%    | 23.2%    | 37.7%    | Draw          | Upcoming |

### Gameweek 12

| Date       | Home              | Most likely   | Away            | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-----------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-11-28 | Leeds             | 1 - 0         | Coventry        | 1 - 0 (11.6%), 1 - 1 (12.2%), 2 - 0 (10.3%) | 54.1%    | 26.2%    | 19.7%    | Home Win      | Upcoming |
| 2026-11-28 | Ipswich           | 1 - 1         | Aston Villa     | 1 - 1 (12.1%), 1 - 2 (8.4%), 2 - 1 (8.4%)   | 37.0%    | 25.0%    | 38.0%    | Draw          | Upcoming |
| 2026-11-28 | Arsenal           | 2 - 1         | Manchester City | 2 - 1 (9.3%), 1 - 1 (11.6%), 1 - 0 (7.7%)   | 49.2%    | 25.9%    | 24.9%    | Home Win      | Upcoming |
| 2026-11-28 | Manchester United | 1 - 1         | Brentford       | 1 - 1 (12.4%), 2 - 1 (8.9%), 1 - 0 (8.2%)   | 41.5%    | 23.8%    | 34.7%    | Draw          | Upcoming |
| 2026-11-28 | Everton           | 1 - 1         | Liverpool       | 1 - 1 (14.2%), 0 - 0 (11.7%), 1 - 0 (11.6%) | 34.1%    | 27.0%    | 38.9%    | Draw          | Upcoming |
| 2026-11-28 | Fulham            | 1 - 0         | Bournemouth     | 1 - 0 (11.1%), 1 - 1 (13.8%), 0 - 0 (10.1%) | 40.9%    | 31.0%    | 28.1%    | Home Win      | Upcoming |
| 2026-11-28 | Nottingham Forest | 1 - 1         | Chelsea         | 1 - 1 (14.3%), 0 - 0 (13.7%), 1 - 0 (13.0%) | 35.5%    | 29.1%    | 35.4%    | Draw          | Upcoming |
| 2026-11-28 | Brighton          | 1 - 0         | Newcastle       | 1 - 0 (10.0%), 1 - 1 (11.6%), 2 - 1 (9.8%)  | 49.0%    | 28.3%    | 22.7%    | Home Win      | Upcoming |
| 2026-11-28 | Sunderland        | 1 - 0         | Tottenham       | 1 - 0 (9.4%), 1 - 1 (13.5%), 0 - 1 (9.1%)   | 42.7%    | 24.8%    | 32.5%    | Home Win      | Upcoming |
| 2026-11-28 | Crystal Palace    | 1 - 0         | Hull            | 1 - 0 (11.5%), 1 - 1 (11.7%), 2 - 0 (10.8%) | 50.5%    | 21.1%    | 28.4%    | Home Win      | Upcoming |

### Gameweek 13

| Date       | Home            | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-----------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-12-02 | Tottenham       | 1 - 0         | Fulham            | 1 - 0 (9.8%), 1 - 1 (13.3%), 2 - 1 (8.7%)   | 40.2%    | 27.9%    | 31.9%    | Home Win      | Upcoming |
| 2026-12-02 | Liverpool       | 1 - 0         | Sunderland        | 1 - 0 (10.5%), 1 - 1 (11.5%), 2 - 0 (10.2%) | 56.1%    | 25.2%    | 18.7%    | Home Win      | Upcoming |
| 2026-12-02 | Hull            | 1 - 1         | Nottingham Forest | 1 - 1 (13.9%), 0 - 1 (11.2%), 0 - 0 (10.4%) | 36.7%    | 28.8%    | 34.5%    | Draw          | Upcoming |
| 2026-12-02 | Chelsea         | 1 - 0         | Crystal Palace    | 1 - 0 (11.8%), 1 - 1 (13.1%), 2 - 0 (9.3%)  | 48.4%    | 28.9%    | 22.7%    | Home Win      | Upcoming |
| 2026-12-02 | Aston Villa     | 1 - 0         | Everton           | 1 - 0 (11.1%), 1 - 1 (12.6%), 2 - 1 (9.5%)  | 47.7%    | 27.0%    | 25.3%    | Home Win      | Upcoming |
| 2026-12-02 | Brentford       | 0 - 1         | Arsenal           | 0 - 1 (9.5%), 1 - 1 (13.1%), 1 - 2 (8.8%)   | 31.8%    | 25.9%    | 42.3%    | Away Win      | Upcoming |
| 2026-12-02 | Coventry        | 1 - 1         | Ipswich           | 1 - 1 (13.1%), 0 - 1 (9.1%), 1 - 2 (8.7%)   | 37.6%    | 25.3%    | 37.1%    | Draw          | Upcoming |
| 2026-12-02 | Manchester City | 2 - 0         | Leeds             | 2 - 0 (10.9%), 1 - 1 (10.3%), 1 - 0 (10.1%) | 60.6%    | 21.7%    | 17.7%    | Home Win      | Upcoming |
| 2026-12-02 | Newcastle       | 1 - 1         | Manchester United | 1 - 1 (13.4%), 1 - 0 (9.3%), 0 - 1 (9.1%)   | 38.8%    | 28.8%    | 32.4%    | Draw          | Upcoming |
| 2026-12-02 | Bournemouth     | 1 - 1         | Brighton          | 1 - 1 (13.5%), 1 - 0 (10.1%), 0 - 0 (8.9%)  | 41.7%    | 23.4%    | 34.9%    | Draw          | Upcoming |

### Gameweek 14

| Date       | Home              | Most likely   | Away            | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-----------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-12-05 | Tottenham         | 1 - 2         | Arsenal         | 1 - 2 (9.2%), 1 - 1 (11.8%), 0 - 1 (7.7%)   | 31.7%    | 26.5%    | 41.8%    | Away Win      | Upcoming |
| 2026-12-05 | Manchester United | 2 - 1         | Coventry        | 2 - 1 (9.9%), 1 - 1 (10.2%), 2 - 0 (9.4%)   | 57.4%    | 22.1%    | 20.5%    | Home Win      | Upcoming |
| 2026-12-05 | Leeds             | 1 - 0         | Ipswich         | 1 - 0 (11.3%), 1 - 1 (12.8%), 2 - 1 (9.4%)  | 51.5%    | 27.9%    | 20.6%    | Home Win      | Upcoming |
| 2026-12-05 | Newcastle         | 2 - 1         | Sunderland      | 2 - 1 (8.5%), 1 - 1 (12.8%), 1 - 0 (8.3%)   | 41.6%    | 29.0%    | 29.4%    | Home Win      | Upcoming |
| 2026-12-05 | Chelsea           | 2 - 1         | Liverpool       | 2 - 1 (8.9%), 1 - 1 (12.8%), 1 - 0 (8.9%)   | 42.0%    | 26.1%    | 31.9%    | Home Win      | Upcoming |
| 2026-12-05 | Brentford         | 0 - 1         | Manchester City | 0 - 1 (10.0%), 1 - 1 (13.5%), 0 - 0 (8.8%)  | 33.5%    | 25.6%    | 40.9%    | Away Win      | Upcoming |
| 2026-12-05 | Bournemouth       | 1 - 0         | Hull            | 1 - 0 (12.1%), 1 - 1 (11.6%), 2 - 0 (11.3%) | 51.1%    | 25.1%    | 23.8%    | Home Win      | Upcoming |
| 2026-12-05 | Aston Villa       | 1 - 0         | Crystal Palace  | 1 - 0 (11.6%), 1 - 1 (12.5%), 2 - 0 (10.0%) | 51.5%    | 28.1%    | 20.4%    | Home Win      | Upcoming |
| 2026-12-05 | Nottingham Forest | 1 - 1         | Brighton        | 1 - 1 (14.1%), 0 - 0 (10.9%), 0 - 1 (10.8%) | 36.0%    | 28.0%    | 36.0%    | Draw          | Upcoming |
| 2026-12-05 | Everton           | 1 - 0         | Fulham          | 1 - 0 (12.1%), 1 - 1 (14.0%), 0 - 0 (11.1%) | 42.8%    | 24.3%    | 32.9%    | Home Win      | Upcoming |

### Gameweek 15

| Date       | Home            | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-----------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-12-12 | Sunderland      | 1 - 1         | Nottingham Forest | 1 - 1 (14.2%), 0 - 0 (11.8%), 0 - 1 (11.7%) | 35.7%    | 28.6%    | 35.7%    | Draw          | Upcoming |
| 2026-12-12 | Crystal Palace  | 0 - 1         | Manchester United | 0 - 1 (11.3%), 1 - 1 (13.7%), 0 - 0 (9.9%)  | 28.0%    | 27.8%    | 44.2%    | Away Win      | Upcoming |
| 2026-12-12 | Hull            | 1 - 1         | Tottenham         | 1 - 1 (13.5%), 1 - 0 (9.5%), 0 - 1 (9.2%)   | 40.2%    | 26.2%    | 33.6%    | Draw          | Upcoming |
| 2026-12-12 | Brighton        | 1 - 0         | Everton           | 1 - 0 (12.1%), 1 - 1 (12.4%), 2 - 0 (10.5%) | 48.8%    | 29.2%    | 22.0%    | Home Win      | Upcoming |
| 2026-12-12 | Ipswich         | 2 - 1         | Newcastle         | 2 - 1 (9.4%), 1 - 1 (10.9%), 1 - 2 (7.0%)   | 43.0%    | 25.7%    | 31.3%    | Home Win      | Upcoming |
| 2026-12-12 | Coventry        | 1 - 2         | Aston Villa       | 1 - 2 (9.8%), 1 - 1 (11.0%), 0 - 2 (8.6%)   | 25.9%    | 25.0%    | 49.1%    | Away Win      | Upcoming |
| 2026-12-12 | Arsenal         | 2 - 1         | Bournemouth       | 2 - 1 (9.7%), 1 - 1 (11.9%), 1 - 0 (9.5%)   | 54.2%    | 24.4%    | 21.4%    | Home Win      | Upcoming |
| 2026-12-12 | Manchester City | 2 - 1         | Chelsea           | 2 - 1 (9.9%), 1 - 1 (11.3%), 1 - 0 (9.2%)   | 50.8%    | 25.1%    | 24.1%    | Home Win      | Upcoming |
| 2026-12-12 | Liverpool       | 2 - 1         | Leeds             | 2 - 1 (10.0%), 1 - 1 (10.8%), 2 - 0 (9.8%)  | 55.5%    | 23.7%    | 20.8%    | Home Win      | Upcoming |
| 2026-12-12 | Fulham          | 1 - 0         | Brentford         | 1 - 0 (10.6%), 1 - 1 (13.7%), 0 - 0 (9.6%)  | 38.7%    | 30.5%    | 30.8%    | Home Win      | Upcoming |

### Gameweek 16

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-12-19 | Leeds             | 1 - 0         | Fulham            | 1 - 0 (10.9%), 1 - 1 (13.9%), 0 - 0 (10.2%) | 42.9%    | 27.7%    | 29.4%    | Home Win      | Upcoming |
| 2026-12-19 | Brighton          | 1 - 0         | Ipswich           | 1 - 0 (10.4%), 1 - 1 (11.2%), 2 - 0 (10.4%) | 53.8%    | 26.0%    | 20.2%    | Home Win      | Upcoming |
| 2026-12-19 | Nottingham Forest | 1 - 1         | Everton           | 1 - 1 (14.2%), 0 - 0 (12.2%), 1 - 0 (11.8%) | 37.4%    | 30.0%    | 32.6%    | Draw          | Upcoming |
| 2026-12-19 | Brentford         | 1 - 0         | Newcastle         | 1 - 0 (10.4%), 1 - 1 (12.2%), 2 - 1 (9.7%)  | 46.4%    | 25.8%    | 27.8%    | Home Win      | Upcoming |
| 2026-12-19 | Manchester City   | 2 - 0         | Hull              | 2 - 0 (11.1%), 1 - 0 (10.1%), 1 - 1 (10.1%) | 58.9%    | 23.0%    | 18.1%    | Home Win      | Upcoming |
| 2026-12-19 | Sunderland        | 1 - 0         | Crystal Palace    | 1 - 0 (12.0%), 1 - 1 (13.7%), 0 - 0 (10.2%) | 42.6%    | 28.2%    | 29.2%    | Home Win      | Upcoming |
| 2026-12-19 | Bournemouth       | 1 - 0         | Coventry          | 1 - 0 (11.6%), 1 - 1 (11.8%), 2 - 0 (10.7%) | 53.6%    | 25.5%    | 20.9%    | Home Win      | Upcoming |
| 2026-12-19 | Arsenal           | 2 - 1         | Manchester United | 2 - 1 (9.8%), 1 - 1 (11.7%), 1 - 0 (9.7%)   | 56.7%    | 24.2%    | 19.1%    | Home Win      | Upcoming |
| 2026-12-19 | Liverpool         | 2 - 1         | Tottenham         | 2 - 1 (10.0%), 1 - 1 (10.5%), 2 - 0 (9.9%)  | 57.6%    | 24.0%    | 18.4%    | Home Win      | Upcoming |
| 2026-12-19 | Chelsea           | 1 - 0         | Aston Villa       | 1 - 0 (10.8%), 1 - 1 (13.3%), 2 - 1 (8.9%)  | 44.3%    | 25.7%    | 30.0%    | Home Win      | Upcoming |

### Gameweek 17

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-12-26 | Aston Villa       | 1 - 0         | Leeds             | 1 - 0 (10.4%), 1 - 1 (11.2%), 2 - 0 (10.4%) | 53.9%    | 22.8%    | 23.3%    | Home Win      | Upcoming |
| 2026-12-26 | Manchester United | 2 - 1         | Nottingham Forest | 2 - 1 (9.5%), 1 - 1 (12.1%), 1 - 0 (9.0%)   | 47.4%    | 24.2%    | 28.4%    | Home Win      | Upcoming |
| 2026-12-26 | Crystal Palace    | 0 - 1         | Arsenal           | 0 - 1 (10.5%), 1 - 1 (12.6%), 1 - 2 (9.5%)  | 25.7%    | 23.3%    | 51.0%    | Away Win      | Upcoming |
| 2026-12-26 | Everton           | 1 - 0         | Sunderland        | 1 - 0 (11.6%), 1 - 1 (12.8%), 2 - 0 (9.6%)  | 49.8%    | 25.3%    | 24.9%    | Home Win      | Upcoming |
| 2026-12-26 | Coventry          | 1 - 2         | Chelsea           | 1 - 2 (9.9%), 1 - 1 (10.4%), 0 - 2 (8.7%)   | 26.4%    | 25.2%    | 48.4%    | Away Win      | Upcoming |
| 2026-12-26 | Newcastle         | 0 - 1         | Manchester City   | 0 - 1 (9.1%), 1 - 1 (12.8%), 1 - 2 (9.0%)   | 33.3%    | 25.1%    | 41.6%    | Away Win      | Upcoming |
| 2026-12-26 | Fulham            | 1 - 1         | Brighton          | 1 - 1 (13.5%), 1 - 0 (9.4%), 0 - 1 (9.2%)   | 36.7%    | 27.8%    | 35.5%    | Draw          | Upcoming |
| 2026-12-26 | Tottenham         | 1 - 0         | Bournemouth       | 1 - 0 (10.6%), 1 - 1 (13.5%), 0 - 0 (9.2%)  | 42.7%    | 27.6%    | 29.7%    | Home Win      | Upcoming |
| 2026-12-26 | Hull              | 0 - 1         | Liverpool         | 0 - 1 (11.8%), 1 - 1 (13.5%), 0 - 0 (9.8%)  | 31.4%    | 27.4%    | 41.2%    | Away Win      | Upcoming |
| 2026-12-26 | Ipswich           | 1 - 1         | Brentford         | 1 - 1 (12.4%), 2 - 1 (8.6%), 1 - 2 (8.1%)   | 38.4%    | 24.4%    | 37.2%    | Draw          | Upcoming |

### Gameweek 18

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-12-30 | Fulham            | 1 - 2         | Arsenal           | 1 - 2 (9.2%), 1 - 1 (12.4%), 0 - 1 (8.6%)   | 32.1%    | 27.4%    | 40.5%    | Away Win      | Upcoming |
| 2026-12-30 | Coventry          | 1 - 2         | Brentford         | 1 - 2 (9.9%), 1 - 1 (10.3%), 0 - 2 (8.7%)   | 24.7%    | 23.9%    | 51.4%    | Away Win      | Upcoming |
| 2026-12-30 | Aston Villa       | 2 - 1         | Liverpool         | 2 - 1 (8.8%), 1 - 1 (12.5%), 1 - 0 (8.2%)   | 42.7%    | 26.1%    | 31.2%    | Home Win      | Upcoming |
| 2026-12-30 | Newcastle         | 2 - 1         | Nottingham Forest | 2 - 1 (8.2%), 1 - 1 (12.8%), 1 - 2 (8.4%)   | 41.3%    | 28.3%    | 30.4%    | Home Win      | Upcoming |
| 2026-12-30 | Hull              | 1 - 1         | Leeds             | 1 - 1 (14.1%), 0 - 1 (11.4%), 0 - 0 (11.2%) | 35.0%    | 27.3%    | 37.7%    | Draw          | Upcoming |
| 2026-12-30 | Manchester United | 2 - 1         | Sunderland        | 2 - 1 (9.7%), 1 - 1 (11.7%), 1 - 0 (8.9%)   | 51.6%    | 22.9%    | 25.5%    | Home Win      | Upcoming |
| 2026-12-30 | Ipswich           | 1 - 1         | Chelsea           | 1 - 1 (12.4%), 2 - 1 (8.4%), 1 - 2 (8.3%)   | 36.9%    | 25.8%    | 37.3%    | Draw          | Upcoming |
| 2026-12-30 | Tottenham         | 1 - 1         | Brighton          | 1 - 1 (13.5%), 1 - 0 (9.8%), 0 - 1 (8.9%)   | 38.5%    | 25.4%    | 36.1%    | Draw          | Upcoming |
| 2026-12-30 | Everton           | 0 - 1         | Manchester City   | 0 - 1 (10.7%), 1 - 1 (12.6%), 1 - 2 (9.5%)  | 28.1%    | 26.5%    | 45.4%    | Away Win      | Upcoming |
| 2026-12-30 | Crystal Palace    | 0 - 1         | Bournemouth       | 0 - 1 (11.4%), 1 - 1 (13.7%), 0 - 0 (9.9%)  | 30.3%    | 24.0%    | 45.7%    | Away Win      | Upcoming |

### Gameweek 19

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-01-02 | Bournemouth       | 1 - 0         | Aston Villa       | 1 - 0 (10.9%), 1 - 1 (13.6%), 0 - 0 (9.4%)  | 43.2%    | 25.0%    | 31.8%    | Home Win      | Upcoming |
| 2027-01-02 | Brentford         | 1 - 0         | Crystal Palace    | 1 - 0 (10.7%), 1 - 1 (13.2%), 2 - 1 (9.0%)  | 44.4%    | 30.6%    | 25.0%    | Home Win      | Upcoming |
| 2027-01-02 | Leeds             | 1 - 0         | Everton           | 1 - 0 (11.5%), 1 - 1 (13.9%), 0 - 0 (10.6%) | 42.1%    | 30.6%    | 27.3%    | Home Win      | Upcoming |
| 2027-01-02 | Arsenal           | 2 - 1         | Ipswich           | 2 - 1 (9.9%), 1 - 1 (9.7%), 2 - 0 (9.4%)    | 62.1%    | 21.6%    | 16.3%    | Home Win      | Upcoming |
| 2027-01-02 | Sunderland        | 1 - 0         | Hull              | 1 - 0 (12.4%), 1 - 1 (12.3%), 2 - 0 (10.7%) | 52.5%    | 21.9%    | 25.6%    | Home Win      | Upcoming |
| 2027-01-02 | Liverpool         | 2 - 0         | Coventry          | 2 - 0 (10.2%), 1 - 1 (10.0%), 2 - 1 (9.9%)  | 60.3%    | 23.2%    | 16.5%    | Home Win      | Upcoming |
| 2027-01-02 | Chelsea           | 2 - 1         | Newcastle         | 2 - 1 (9.9%), 1 - 1 (11.1%), 2 - 0 (9.9%)   | 50.0%    | 25.1%    | 24.9%    | Home Win      | Upcoming |
| 2027-01-02 | Nottingham Forest | 1 - 1         | Fulham            | 1 - 1 (14.2%), 0 - 0 (12.3%), 1 - 0 (12.3%) | 39.2%    | 26.4%    | 34.4%    | Draw          | Upcoming |
| 2027-01-02 | Brighton          | 1 - 0         | Manchester United | 1 - 0 (10.1%), 1 - 1 (12.2%), 2 - 1 (9.7%)  | 45.6%    | 31.5%    | 22.9%    | Home Win      | Upcoming |
| 2027-01-02 | Manchester City   | 2 - 0         | Tottenham         | 2 - 0 (10.0%), 1 - 1 (10.1%), 2 - 1 (9.9%)  | 57.9%    | 23.3%    | 18.8%    | Home Win      | Upcoming |

### Gameweek 20

| Date       | Home              | Most likely   | Away            | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-----------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-01-06 | Arsenal           | 2 - 1         | Brentford       | 2 - 1 (9.8%), 1 - 1 (11.7%), 1 - 0 (9.6%)   | 54.9%    | 23.6%    | 21.5%    | Home Win      | Upcoming |
| 2027-01-06 | Leeds             | 0 - 1         | Manchester City | 0 - 1 (11.8%), 1 - 1 (13.2%), 0 - 2 (9.3%)  | 29.9%    | 28.4%    | 41.7%    | Away Win      | Upcoming |
| 2027-01-06 | Manchester United | 2 - 1         | Newcastle       | 2 - 1 (9.0%), 1 - 1 (11.7%), 1 - 2 (7.7%)   | 42.8%    | 24.0%    | 33.2%    | Home Win      | Upcoming |
| 2027-01-06 | Brighton          | 1 - 0         | Bournemouth     | 1 - 0 (11.1%), 1 - 1 (13.1%), 2 - 1 (9.2%)  | 43.4%    | 28.8%    | 27.8%    | Home Win      | Upcoming |
| 2027-01-06 | Nottingham Forest | 1 - 0         | Hull            | 1 - 0 (13.0%), 1 - 1 (11.9%), 2 - 0 (11.6%) | 52.3%    | 24.2%    | 23.5%    | Home Win      | Upcoming |
| 2027-01-06 | Fulham            | 1 - 0         | Tottenham       | 1 - 0 (9.9%), 1 - 1 (13.0%), 2 - 1 (9.0%)   | 46.8%    | 28.5%    | 24.7%    | Home Win      | Upcoming |
| 2027-01-06 | Everton           | 1 - 1         | Aston Villa     | 1 - 1 (14.1%), 1 - 0 (12.5%), 0 - 0 (12.1%) | 37.2%    | 27.7%    | 35.1%    | Draw          | Upcoming |
| 2027-01-06 | Sunderland        | 0 - 1         | Liverpool       | 0 - 1 (11.8%), 1 - 1 (13.7%), 0 - 0 (10.2%) | 30.1%    | 26.1%    | 43.8%    | Away Win      | Upcoming |
| 2027-01-06 | Crystal Palace    | 0 - 1         | Chelsea         | 0 - 1 (11.6%), 1 - 1 (13.9%), 0 - 0 (10.5%) | 30.1%    | 24.7%    | 45.2%    | Away Win      | Upcoming |
| 2027-01-06 | Ipswich           | 1 - 0         | Coventry        | 1 - 0 (10.5%), 1 - 1 (12.2%), 2 - 1 (9.7%)  | 50.9%    | 25.7%    | 23.4%    | Home Win      | Upcoming |

### Gameweek 21

| Date       | Home            | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-----------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-01-16 | Bournemouth     | 1 - 0         | Ipswich           | 1 - 0 (11.1%), 1 - 1 (12.0%), 2 - 0 (10.1%) | 52.8%    | 25.5%    | 21.7%    | Home Win      | Upcoming |
| 2027-01-16 | Manchester City | 1 - 0         | Nottingham Forest | 1 - 0 (10.4%), 1 - 1 (11.5%), 2 - 0 (10.1%) | 54.9%    | 25.8%    | 19.3%    | Home Win      | Upcoming |
| 2027-01-16 | Chelsea         | 2 - 1         | Sunderland        | 2 - 1 (9.8%), 1 - 1 (11.6%), 1 - 0 (9.7%)   | 49.5%    | 28.5%    | 22.0%    | Home Win      | Upcoming |
| 2027-01-16 | Brentford       | 1 - 1         | Brighton          | 1 - 1 (13.3%), 1 - 0 (10.3%), 2 - 1 (8.9%)  | 41.5%    | 23.9%    | 34.6%    | Draw          | Upcoming |
| 2027-01-16 | Aston Villa     | 1 - 0         | Manchester United | 1 - 0 (10.1%), 1 - 1 (12.5%), 2 - 1 (9.5%)  | 45.0%    | 29.9%    | 25.1%    | Home Win      | Upcoming |
| 2027-01-16 | Tottenham       | 1 - 0         | Leeds             | 1 - 0 (10.2%), 1 - 1 (13.4%), 2 - 1 (8.7%)  | 40.5%    | 28.1%    | 31.4%    | Home Win      | Upcoming |
| 2027-01-16 | Coventry        | 1 - 2         | Everton           | 1 - 2 (9.7%), 1 - 1 (11.2%), 0 - 1 (8.3%)   | 29.3%    | 28.2%    | 42.5%    | Away Win      | Upcoming |
| 2027-01-16 | Liverpool       | 1 - 0         | Crystal Palace    | 1 - 0 (11.0%), 1 - 1 (12.0%), 2 - 0 (10.0%) | 55.2%    | 26.1%    | 18.7%    | Home Win      | Upcoming |
| 2027-01-16 | Hull            | 0 - 1         | Arsenal           | 0 - 1 (10.2%), 1 - 1 (12.6%), 1 - 2 (9.4%)  | 29.7%    | 27.0%    | 43.3%    | Away Win      | Upcoming |
| 2027-01-16 | Newcastle       | 2 - 1         | Fulham            | 2 - 1 (8.8%), 1 - 1 (10.7%), 1 - 2 (7.7%)   | 44.7%    | 22.8%    | 32.5%    | Home Win      | Upcoming |

### Gameweek 22

| Date       | Home              | Most likely   | Away            | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-----------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-01-23 | Ipswich           | 1 - 0         | Hull            | 1 - 0 (9.3%), 1 - 1 (12.6%), 2 - 1 (9.3%)   | 45.2%    | 24.3%    | 30.5%    | Home Win      | Upcoming |
| 2027-01-23 | Everton           | 1 - 1         | Brentford       | 1 - 1 (14.2%), 0 - 0 (12.2%), 1 - 0 (11.9%) | 38.4%    | 25.1%    | 36.5%    | Draw          | Upcoming |
| 2027-01-23 | Sunderland        | 1 - 0         | Coventry        | 1 - 0 (12.0%), 1 - 1 (12.3%), 2 - 0 (10.6%) | 56.3%    | 22.5%    | 21.2%    | Home Win      | Upcoming |
| 2027-01-23 | Nottingham Forest | 1 - 1         | Bournemouth     | 1 - 1 (14.3%), 0 - 0 (14.2%), 1 - 0 (13.4%) | 37.3%    | 28.9%    | 33.8%    | Draw          | Upcoming |
| 2027-01-23 | Arsenal           | 2 - 1         | Newcastle       | 2 - 1 (9.8%), 1 - 1 (11.7%), 1 - 0 (9.7%)   | 57.9%    | 23.5%    | 18.6%    | Home Win      | Upcoming |
| 2027-01-23 | Leeds             | 1 - 0         | Chelsea         | 1 - 0 (12.1%), 1 - 1 (14.1%), 0 - 0 (11.7%) | 41.7%    | 29.1%    | 29.2%    | Home Win      | Upcoming |
| 2027-01-23 | Fulham            | 1 - 0         | Aston Villa     | 1 - 0 (10.3%), 1 - 1 (13.3%), 2 - 1 (8.9%)  | 40.0%    | 29.3%    | 30.7%    | Home Win      | Upcoming |
| 2027-01-23 | Manchester United | 2 - 1         | Liverpool       | 2 - 1 (8.7%), 1 - 1 (12.4%), 1 - 2 (8.0%)   | 42.0%    | 23.3%    | 34.7%    | Home Win      | Upcoming |
| 2027-01-23 | Brighton          | 2 - 1         | Manchester City | 2 - 1 (9.0%), 1 - 1 (11.8%), 1 - 2 (7.7%)   | 42.5%    | 26.2%    | 31.3%    | Home Win      | Upcoming |
| 2027-01-23 | Crystal Palace    | 1 - 1         | Tottenham       | 1 - 1 (13.1%), 0 - 1 (9.2%), 1 - 2 (8.7%)   | 35.5%    | 23.1%    | 41.4%    | Draw          | Upcoming |

### Gameweek 23

| Date       | Home            | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-----------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-01-30 | Tottenham       | 1 - 0         | Sunderland        | 1 - 0 (11.5%), 1 - 1 (12.5%), 2 - 0 (9.9%)  | 49.2%    | 29.5%    | 21.3%    | Home Win      | Upcoming |
| 2027-01-30 | Brentford       | 1 - 0         | Manchester United | 1 - 0 (11.6%), 1 - 1 (13.7%), 0 - 0 (10.1%) | 40.3%    | 30.5%    | 29.2%    | Home Win      | Upcoming |
| 2027-01-30 | Newcastle       | 2 - 1         | Brighton          | 2 - 1 (8.7%), 1 - 1 (10.7%), 1 - 2 (7.9%)   | 43.1%    | 24.1%    | 32.8%    | Home Win      | Upcoming |
| 2027-01-30 | Hull            | 1 - 0         | Crystal Palace    | 1 - 0 (9.4%), 1 - 1 (13.5%), 0 - 1 (9.3%)   | 40.6%    | 29.1%    | 30.3%    | Home Win      | Upcoming |
| 2027-01-30 | Coventry        | 1 - 2         | Leeds             | 1 - 2 (9.5%), 1 - 1 (12.0%), 0 - 1 (9.0%)   | 28.3%    | 27.8%    | 43.9%    | Away Win      | Upcoming |
| 2027-01-30 | Bournemouth     | 1 - 0         | Fulham            | 1 - 0 (10.3%), 1 - 1 (12.7%), 2 - 1 (9.4%)  | 48.2%    | 23.7%    | 28.1%    | Home Win      | Upcoming |
| 2027-01-30 | Chelsea         | 1 - 0         | Nottingham Forest | 1 - 0 (11.4%), 1 - 1 (12.9%), 2 - 1 (9.3%)  | 47.3%    | 29.0%    | 23.7%    | Home Win      | Upcoming |
| 2027-01-30 | Liverpool       | 1 - 0         | Everton           | 1 - 0 (10.7%), 1 - 1 (12.3%), 2 - 1 (9.7%)  | 51.4%    | 25.7%    | 22.9%    | Home Win      | Upcoming |
| 2027-01-30 | Manchester City | 2 - 1         | Arsenal           | 2 - 1 (9.4%), 1 - 1 (11.8%), 1 - 0 (8.2%)   | 43.4%    | 27.6%    | 29.0%    | Home Win      | Upcoming |
| 2027-01-30 | Aston Villa     | 2 - 0         | Ipswich           | 2 - 0 (10.2%), 1 - 1 (11.1%), 1 - 0 (10.1%) | 53.4%    | 25.7%    | 20.9%    | Home Win      | Upcoming |

### Gameweek 24

| Date       | Home              | Most likely   | Away            | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-----------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-02-06 | Arsenal           | 2 - 1         | Liverpool       | 2 - 1 (9.8%), 1 - 1 (11.2%), 1 - 0 (8.6%)   | 56.2%    | 23.4%    | 20.4%    | Home Win      | Upcoming |
| 2027-02-06 | Brighton          | 1 - 0         | Hull            | 1 - 0 (11.1%), 1 - 1 (11.3%), 2 - 0 (10.9%) | 53.1%    | 26.1%    | 20.8%    | Home Win      | Upcoming |
| 2027-02-06 | Sunderland        | 1 - 1         | Aston Villa     | 1 - 1 (14.1%), 0 - 1 (11.1%), 0 - 0 (10.9%) | 35.9%    | 27.8%    | 36.3%    | Draw          | Upcoming |
| 2027-02-06 | Crystal Palace    | 1 - 0         | Coventry        | 1 - 0 (10.7%), 1 - 1 (11.2%), 2 - 0 (10.7%) | 56.0%    | 21.1%    | 22.9%    | Home Win      | Upcoming |
| 2027-02-06 | Ipswich           | 1 - 1         | Tottenham       | 1 - 1 (11.9%), 2 - 1 (9.0%), 1 - 2 (7.8%)   | 39.4%    | 23.7%    | 36.9%    | Draw          | Upcoming |
| 2027-02-06 | Everton           | 1 - 1         | Newcastle       | 1 - 1 (14.2%), 1 - 0 (12.1%), 0 - 0 (12.0%) | 39.1%    | 26.1%    | 34.8%    | Draw          | Upcoming |
| 2027-02-06 | Fulham            | 1 - 1         | Manchester City | 1 - 1 (12.5%), 1 - 2 (9.2%), 0 - 1 (8.9%)   | 33.8%    | 27.1%    | 39.1%    | Draw          | Upcoming |
| 2027-02-06 | Leeds             | 1 - 0         | Bournemouth     | 1 - 0 (12.3%), 1 - 1 (14.1%), 0 - 0 (11.6%) | 45.9%    | 28.7%    | 25.4%    | Home Win      | Upcoming |
| 2027-02-06 | Manchester United | 2 - 1         | Chelsea         | 2 - 1 (8.9%), 1 - 1 (12.7%), 1 - 0 (8.8%)   | 41.6%    | 24.8%    | 33.6%    | Home Win      | Upcoming |
| 2027-02-06 | Nottingham Forest | 1 - 1         | Brentford       | 1 - 1 (14.3%), 0 - 0 (13.1%), 0 - 1 (12.3%) | 35.0%    | 28.3%    | 36.7%    | Draw          | Upcoming |

### Gameweek 25

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-02-10 | Everton           | 1 - 1         | Leeds             | 1 - 1 (13.9%), 1 - 0 (10.6%), 0 - 0 (10.1%) | 39.7%    | 24.3%    | 36.0%    | Draw          | Upcoming |
| 2027-02-10 | Coventry          | 1 - 2         | Liverpool         | 1 - 2 (9.8%), 1 - 1 (11.4%), 0 - 1 (9.1%)   | 23.0%    | 25.8%    | 51.2%    | Away Win      | Upcoming |
| 2027-02-10 | Hull              | 1 - 0         | Sunderland        | 1 - 0 (11.7%), 1 - 1 (14.1%), 0 - 0 (11.3%) | 40.0%    | 28.6%    | 31.4%    | Home Win      | Upcoming |
| 2027-02-10 | Aston Villa       | 1 - 0         | Bournemouth       | 1 - 0 (10.3%), 1 - 1 (11.9%), 2 - 1 (9.8%)  | 49.5%    | 25.1%    | 25.4%    | Home Win      | Upcoming |
| 2027-02-10 | Crystal Palace    | 0 - 1         | Brentford         | 0 - 1 (11.5%), 1 - 1 (13.6%), 0 - 0 (9.7%)  | 28.4%    | 22.3%    | 49.3%    | Away Win      | Upcoming |
| 2027-02-10 | Newcastle         | 2 - 1         | Chelsea           | 2 - 1 (9.2%), 1 - 1 (11.6%), 1 - 2 (7.4%)   | 43.7%    | 25.4%    | 30.9%    | Home Win      | Upcoming |
| 2027-02-10 | Fulham            | 1 - 0         | Nottingham Forest | 1 - 0 (11.7%), 1 - 1 (13.8%), 0 - 0 (10.4%) | 43.6%    | 31.2%    | 25.2%    | Home Win      | Upcoming |
| 2027-02-10 | Tottenham         | 1 - 1         | Manchester City   | 1 - 1 (12.8%), 1 - 2 (8.6%), 0 - 1 (8.5%)   | 35.1%    | 27.0%    | 37.9%    | Draw          | Upcoming |
| 2027-02-10 | Manchester United | 2 - 1         | Brighton          | 2 - 1 (9.1%), 1 - 1 (11.4%), 1 - 2 (7.5%)   | 46.3%    | 22.9%    | 30.8%    | Home Win      | Upcoming |
| 2027-02-10 | Ipswich           | 1 - 2         | Arsenal           | 1 - 2 (8.9%), 1 - 1 (11.8%), 2 - 1 (7.9%)   | 32.7%    | 23.1%    | 44.2%    | Away Win      | Upcoming |

### Gameweek 26

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-02-20 | Manchester City   | 1 - 0         | Newcastle         | 1 - 0 (11.2%), 1 - 1 (11.6%), 2 - 0 (10.6%) | 54.0%    | 24.9%    | 21.1%    | Home Win      | Upcoming |
| 2027-02-20 | Bournemouth       | 1 - 0         | Crystal Palace    | 1 - 0 (12.7%), 1 - 1 (13.1%), 2 - 0 (9.9%)  | 49.1%    | 28.4%    | 22.5%    | Home Win      | Upcoming |
| 2027-02-20 | Brentford         | 1 - 0         | Coventry          | 1 - 0 (10.1%), 1 - 1 (11.4%), 2 - 0 (9.9%)  | 51.0%    | 27.5%    | 21.5%    | Home Win      | Upcoming |
| 2027-02-20 | Chelsea           | 2 - 1         | Ipswich           | 2 - 1 (9.9%), 1 - 1 (11.5%), 1 - 0 (9.7%)   | 50.6%    | 26.5%    | 22.9%    | Home Win      | Upcoming |
| 2027-02-20 | Liverpool         | 2 - 0         | Hull              | 2 - 0 (10.2%), 1 - 1 (10.2%), 2 - 1 (9.9%)  | 58.0%    | 23.8%    | 18.2%    | Home Win      | Upcoming |
| 2027-02-20 | Arsenal           | 2 - 1         | Fulham            | 2 - 1 (9.8%), 1 - 1 (11.1%), 2 - 0 (8.5%)   | 54.4%    | 23.4%    | 22.2%    | Home Win      | Upcoming |
| 2027-02-20 | Nottingham Forest | 1 - 1         | Manchester United | 1 - 1 (14.2%), 0 - 0 (12.0%), 1 - 0 (11.8%) | 37.1%    | 30.6%    | 32.3%    | Draw          | Upcoming |
| 2027-02-20 | Brighton          | 1 - 0         | Tottenham         | 1 - 0 (10.4%), 1 - 1 (11.4%), 2 - 0 (10.2%) | 50.2%    | 27.0%    | 22.8%    | Home Win      | Upcoming |
| 2027-02-20 | Sunderland        | 1 - 1         | Everton           | 1 - 1 (14.2%), 0 - 0 (11.9%), 0 - 1 (11.7%) | 36.0%    | 27.8%    | 36.2%    | Draw          | Upcoming |
| 2027-02-20 | Leeds             | 1 - 0         | Aston Villa       | 1 - 0 (12.1%), 1 - 1 (14.1%), 0 - 0 (11.7%) | 40.8%    | 30.1%    | 29.1%    | Home Win      | Upcoming |

### Gameweek 27

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-02-27 | Crystal Palace    | 2 - 1         | Sunderland        | 2 - 1 (9.7%), 1 - 1 (11.8%), 1 - 0 (9.1%)   | 44.6%    | 26.8%    | 28.6%    | Home Win      | Upcoming |
| 2027-02-27 | Manchester United | 1 - 1         | Arsenal           | 1 - 1 (12.5%), 2 - 1 (8.9%), 1 - 0 (8.4%)   | 41.2%    | 23.5%    | 35.3%    | Draw          | Upcoming |
| 2027-02-27 | Ipswich           | 1 - 2         | Brighton          | 1 - 2 (9.0%), 1 - 1 (11.8%), 2 - 1 (7.7%)   | 34.5%    | 22.6%    | 42.9%    | Away Win      | Upcoming |
| 2027-02-27 | Coventry          | 1 - 2         | Bournemouth       | 1 - 2 (9.9%), 1 - 1 (10.3%), 0 - 2 (9.3%)   | 26.7%    | 24.4%    | 48.9%    | Away Win      | Upcoming |
| 2027-02-27 | Everton           | 1 - 0         | Nottingham Forest | 1 - 0 (12.3%), 1 - 1 (14.1%), 0 - 0 (11.7%) | 42.1%    | 26.9%    | 31.0%    | Home Win      | Upcoming |
| 2027-02-27 | Fulham            | 1 - 0         | Leeds             | 1 - 0 (10.4%), 1 - 1 (13.7%), 0 - 0 (9.6%)  | 40.4%    | 29.3%    | 30.3%    | Home Win      | Upcoming |
| 2027-02-27 | Aston Villa       | 1 - 0         | Chelsea           | 1 - 0 (10.2%), 1 - 1 (12.6%), 2 - 1 (9.5%)  | 46.2%    | 24.7%    | 29.1%    | Home Win      | Upcoming |
| 2027-02-27 | Tottenham         | 1 - 1         | Liverpool         | 1 - 1 (12.9%), 1 - 0 (9.3%), 2 - 1 (9.0%)   | 38.6%    | 27.8%    | 33.6%    | Draw          | Upcoming |
| 2027-02-27 | Newcastle         | 2 - 1         | Brentford         | 2 - 1 (9.0%), 1 - 1 (11.0%), 1 - 2 (7.6%)   | 43.8%    | 24.0%    | 32.2%    | Home Win      | Upcoming |
| 2027-02-27 | Hull              | 0 - 1         | Manchester City   | 0 - 1 (11.1%), 1 - 1 (13.0%), 1 - 2 (9.3%)  | 30.4%    | 27.2%    | 42.4%    | Away Win      | Upcoming |

### Gameweek 28

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-03-03 | Nottingham Forest | 1 - 1         | Newcastle         | 1 - 1 (14.3%), 0 - 0 (13.2%), 1 - 0 (12.5%) | 37.3%    | 29.3%    | 33.4%    | Draw          | Upcoming |
| 2027-03-03 | Bournemouth       | 1 - 0         | Tottenham         | 1 - 0 (10.0%), 1 - 1 (12.1%), 2 - 1 (9.7%)  | 51.0%    | 23.7%    | 25.3%    | Home Win      | Upcoming |
| 2027-03-03 | Manchester City   | 1 - 0         | Everton           | 1 - 0 (11.0%), 1 - 1 (11.5%), 2 - 0 (10.5%) | 52.9%    | 26.8%    | 20.3%    | Home Win      | Upcoming |
| 2027-03-03 | Arsenal           | 2 - 1         | Crystal Palace    | 2 - 1 (9.9%), 1 - 1 (11.3%), 1 - 0 (9.3%)   | 61.3%    | 21.7%    | 17.0%    | Home Win      | Upcoming |
| 2027-03-03 | Leeds             | 1 - 0         | Hull              | 1 - 0 (11.8%), 1 - 1 (12.6%), 2 - 0 (10.0%) | 51.6%    | 26.6%    | 21.8%    | Home Win      | Upcoming |
| 2027-03-03 | Sunderland        | 1 - 1         | Manchester United | 1 - 1 (13.8%), 0 - 1 (11.2%), 0 - 0 (10.0%) | 33.1%    | 28.8%    | 38.1%    | Draw          | Upcoming |
| 2027-03-03 | Liverpool         | 2 - 1         | Aston Villa       | 2 - 1 (9.9%), 1 - 1 (11.3%), 1 - 0 (9.3%)   | 54.6%    | 25.3%    | 20.1%    | Home Win      | Upcoming |
| 2027-03-03 | Brighton          | 2 - 1         | Fulham            | 2 - 1 (9.6%), 1 - 1 (12.1%), 1 - 0 (9.6%)   | 48.0%    | 26.2%    | 25.8%    | Home Win      | Upcoming |
| 2027-03-03 | Brentford         | 1 - 0         | Ipswich           | 1 - 0 (11.0%), 1 - 1 (11.8%), 2 - 0 (10.3%) | 51.2%    | 27.2%    | 21.6%    | Home Win      | Upcoming |
| 2027-03-03 | Chelsea           | 1 - 0         | Coventry          | 1 - 0 (10.6%), 1 - 1 (11.3%), 2 - 0 (10.4%) | 54.0%    | 25.6%    | 20.4%    | Home Win      | Upcoming |

### Gameweek 29

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-03-13 | Leeds             | 1 - 0         | Brighton          | 1 - 0 (10.5%), 1 - 1 (13.7%), 0 - 0 (9.6%)  | 43.9%    | 25.7%    | 30.4%    | Home Win      | Upcoming |
| 2027-03-13 | Tottenham         | 1 - 0         | Nottingham Forest | 1 - 0 (10.5%), 1 - 1 (13.4%), 2 - 1 (8.8%)  | 41.7%    | 32.3%    | 26.0%    | Home Win      | Upcoming |
| 2027-03-13 | Crystal Palace    | 0 - 1         | Fulham            | 0 - 1 (10.3%), 1 - 1 (13.4%), 0 - 0 (8.8%)  | 32.5%    | 22.8%    | 44.7%    | Away Win      | Upcoming |
| 2027-03-13 | Liverpool         | 2 - 0         | Ipswich           | 2 - 0 (10.5%), 2 - 1 (9.9%), 1 - 1 (9.5%)   | 61.3%    | 23.6%    | 15.1%    | Home Win      | Upcoming |
| 2027-03-13 | Coventry          | 1 - 2         | Manchester City   | 1 - 2 (9.9%), 1 - 1 (9.9%), 0 - 2 (9.3%)    | 24.0%    | 24.4%    | 51.6%    | Away Win      | Upcoming |
| 2027-03-13 | Bournemouth       | 1 - 0         | Newcastle         | 1 - 0 (10.7%), 1 - 1 (12.0%), 2 - 0 (9.8%)  | 49.1%    | 24.7%    | 26.2%    | Home Win      | Upcoming |
| 2027-03-13 | Chelsea           | 0 - 1         | Arsenal           | 0 - 1 (9.9%), 1 - 1 (13.2%), 1 - 2 (8.9%)   | 31.3%    | 24.1%    | 44.6%    | Away Win      | Upcoming |
| 2027-03-13 | Aston Villa       | 2 - 0         | Hull              | 2 - 0 (10.6%), 1 - 1 (11.0%), 1 - 0 (10.4%) | 55.2%    | 24.0%    | 20.8%    | Home Win      | Upcoming |
| 2027-03-13 | Manchester United | 1 - 0         | Everton           | 1 - 0 (10.2%), 1 - 1 (12.3%), 2 - 1 (9.6%)  | 49.9%    | 23.3%    | 26.8%    | Home Win      | Upcoming |
| 2027-03-13 | Sunderland        | 1 - 1         | Brentford         | 1 - 1 (13.4%), 1 - 0 (9.5%), 0 - 1 (8.6%)   | 37.9%    | 25.8%    | 36.3%    | Draw          | Upcoming |

### Gameweek 30

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-03-20 | Brentford         | 1 - 0         | Bournemouth       | 1 - 0 (12.2%), 1 - 1 (13.7%), 0 - 0 (10.5%) | 42.7%    | 27.8%    | 29.5%    | Home Win      | Upcoming |
| 2027-03-20 | Brighton          | 2 - 0         | Coventry          | 2 - 0 (10.6%), 1 - 1 (10.3%), 2 - 1 (9.9%)  | 58.9%    | 22.4%    | 18.7%    | Home Win      | Upcoming |
| 2027-03-20 | Manchester City   | 1 - 0         | Manchester United | 1 - 0 (10.7%), 1 - 1 (11.7%), 2 - 0 (10.2%) | 52.5%    | 26.4%    | 21.1%    | Home Win      | Upcoming |
| 2027-03-20 | Ipswich           | 2 - 1         | Crystal Palace    | 2 - 1 (8.9%), 1 - 1 (12.6%), 1 - 0 (8.4%)   | 42.4%    | 27.9%    | 29.7%    | Home Win      | Upcoming |
| 2027-03-20 | Arsenal           | 2 - 1         | Sunderland        | 2 - 1 (9.9%), 1 - 1 (10.5%), 2 - 0 (9.2%)   | 60.9%    | 22.9%    | 16.2%    | Home Win      | Upcoming |
| 2027-03-20 | Fulham            | 1 - 1         | Liverpool         | 1 - 1 (13.6%), 1 - 0 (10.0%), 0 - 1 (9.1%)  | 38.4%    | 29.0%    | 32.6%    | Draw          | Upcoming |
| 2027-03-20 | Hull              | 1 - 1         | Chelsea           | 1 - 1 (13.5%), 0 - 1 (10.7%), 0 - 0 (9.2%)  | 33.6%    | 28.6%    | 37.8%    | Draw          | Upcoming |
| 2027-03-20 | Nottingham Forest | 1 - 1         | Aston Villa       | 1 - 1 (14.2%), 1 - 0 (12.6%), 0 - 0 (12.3%) | 37.1%    | 28.9%    | 34.0%    | Draw          | Upcoming |
| 2027-03-20 | Everton           | 1 - 0         | Tottenham         | 1 - 0 (10.1%), 1 - 1 (13.2%), 2 - 1 (8.9%)  | 44.5%    | 25.2%    | 30.3%    | Home Win      | Upcoming |
| 2027-03-20 | Newcastle         | 1 - 1         | Leeds             | 1 - 1 (12.3%), 1 - 2 (8.9%), 0 - 1 (8.0%)   | 39.0%    | 25.8%    | 35.2%    | Draw          | Upcoming |

### Gameweek 31

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-04-10 | Sunderland        | 1 - 0         | Ipswich           | 1 - 0 (10.9%), 1 - 1 (11.9%), 2 - 0 (10.1%) | 54.6%    | 23.1%    | 22.3%    | Home Win      | Upcoming |
| 2027-04-10 | Leeds             | 1 - 0         | Nottingham Forest | 1 - 0 (11.5%), 1 - 1 (14.0%), 0 - 0 (10.7%) | 43.9%    | 29.5%    | 26.6%    | Home Win      | Upcoming |
| 2027-04-10 | Manchester United | 2 - 1         | Hull              | 2 - 1 (9.9%), 1 - 1 (10.3%), 2 - 0 (9.3%)   | 53.8%    | 22.5%    | 23.7%    | Home Win      | Upcoming |
| 2027-04-10 | Chelsea           | 1 - 0         | Fulham            | 1 - 0 (10.1%), 1 - 1 (12.6%), 2 - 1 (9.4%)  | 46.9%    | 23.6%    | 29.5%    | Home Win      | Upcoming |
| 2027-04-10 | Liverpool         | 1 - 0         | Newcastle         | 1 - 0 (11.3%), 1 - 1 (12.7%), 2 - 1 (9.4%)  | 52.4%    | 24.7%    | 22.9%    | Home Win      | Upcoming |
| 2027-04-10 | Coventry          | 1 - 2         | Arsenal           | 1 - 2 (9.8%), 1 - 1 (10.9%), 0 - 2 (8.3%)   | 23.4%    | 24.9%    | 51.7%    | Away Win      | Upcoming |
| 2027-04-10 | Bournemouth       | 1 - 1         | Manchester City   | 1 - 1 (12.5%), 2 - 1 (8.8%), 1 - 0 (8.1%)   | 39.5%    | 23.0%    | 37.5%    | Draw          | Upcoming |
| 2027-04-10 | Crystal Palace    | 0 - 1         | Everton           | 0 - 1 (11.0%), 1 - 1 (13.6%), 0 - 0 (9.6%)  | 29.9%    | 26.1%    | 44.0%    | Away Win      | Upcoming |
| 2027-04-10 | Tottenham         | 1 - 0         | Brentford         | 1 - 0 (9.6%), 1 - 1 (13.2%), 2 - 1 (8.8%)   | 42.0%    | 27.1%    | 30.9%    | Home Win      | Upcoming |
| 2027-04-10 | Aston Villa       | 2 - 1         | Brighton          | 2 - 1 (9.5%), 1 - 1 (11.6%), 1 - 0 (8.0%)   | 49.9%    | 23.9%    | 26.2%    | Home Win      | Upcoming |

### Gameweek 32

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-04-17 | Brighton          | 1 - 0         | Chelsea           | 1 - 0 (10.5%), 1 - 1 (13.1%), 2 - 1 (9.1%)  | 42.8%    | 27.6%    | 29.6%    | Home Win      | Upcoming |
| 2027-04-17 | Fulham            | 1 - 0         | Sunderland        | 1 - 0 (11.7%), 1 - 1 (12.3%), 2 - 0 (10.3%) | 52.3%    | 28.9%    | 18.8%    | Home Win      | Upcoming |
| 2027-04-17 | Brentford         | 1 - 0         | Leeds             | 1 - 0 (10.4%), 1 - 1 (12.7%), 2 - 1 (9.4%)  | 45.2%    | 25.0%    | 29.8%    | Home Win      | Upcoming |
| 2027-04-17 | Nottingham Forest | 1 - 1         | Liverpool         | 1 - 1 (14.2%), 0 - 0 (12.1%), 1 - 0 (11.8%) | 34.4%    | 28.3%    | 37.3%    | Draw          | Upcoming |
| 2027-04-17 | Hull              | 1 - 0         | Coventry          | 1 - 0 (12.8%), 1 - 1 (13.8%), 0 - 0 (11.2%) | 48.5%    | 26.8%    | 24.7%    | Home Win      | Upcoming |
| 2027-04-17 | Arsenal           | 2 - 1         | Aston Villa       | 2 - 1 (9.8%), 1 - 1 (11.1%), 2 - 0 (8.5%)   | 56.6%    | 22.4%    | 21.0%    | Home Win      | Upcoming |
| 2027-04-17 | Ipswich           | 1 - 1         | Manchester United | 1 - 1 (11.5%), 2 - 1 (8.6%), 1 - 2 (8.2%)   | 36.4%    | 30.3%    | 33.3%    | Draw          | Upcoming |
| 2027-04-17 | Manchester City   | 2 - 0         | Crystal Palace    | 2 - 0 (11.0%), 1 - 1 (10.8%), 1 - 0 (10.7%) | 59.0%    | 24.5%    | 16.5%    | Home Win      | Upcoming |
| 2027-04-17 | Newcastle         | 2 - 1         | Tottenham         | 2 - 1 (9.3%), 1 - 1 (10.5%), 1 - 2 (7.0%)   | 47.1%    | 24.8%    | 28.1%    | Home Win      | Upcoming |
| 2027-04-17 | Everton           | 1 - 0         | Bournemouth       | 1 - 0 (13.5%), 1 - 1 (14.0%), 0 - 0 (12.4%) | 41.0%    | 27.1%    | 31.9%    | Home Win      | Upcoming |

### Gameweek 33

| Date       | Home              | Most likely   | Away            | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-----------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-04-24 | Chelsea           | 1 - 1         | Manchester City | 1 - 1 (13.2%), 0 - 1 (9.3%), 1 - 2 (8.6%)   | 37.2%    | 23.9%    | 38.9%    | Draw          | Upcoming |
| 2027-04-24 | Bournemouth       | 0 - 1         | Arsenal         | 0 - 1 (10.1%), 1 - 1 (13.4%), 1 - 2 (8.7%)  | 32.4%    | 24.8%    | 42.8%    | Away Win      | Upcoming |
| 2027-04-24 | Tottenham         | 1 - 0         | Hull            | 1 - 0 (12.6%), 1 - 1 (12.1%), 2 - 0 (11.1%) | 50.3%    | 26.7%    | 23.0%    | Home Win      | Upcoming |
| 2027-04-24 | Manchester United | 1 - 0         | Crystal Palace  | 1 - 0 (10.5%), 1 - 1 (12.5%), 2 - 1 (9.5%)  | 53.9%    | 24.1%    | 22.0%    | Home Win      | Upcoming |
| 2027-04-24 | Everton           | 1 - 0         | Brighton        | 1 - 0 (10.8%), 1 - 1 (13.7%), 0 - 0 (9.6%)  | 41.0%    | 25.6%    | 33.4%    | Home Win      | Upcoming |
| 2027-04-24 | Nottingham Forest | 1 - 0         | Sunderland      | 1 - 0 (12.8%), 1 - 1 (12.7%), 2 - 0 (10.5%) | 49.3%    | 27.5%    | 23.2%    | Home Win      | Upcoming |
| 2027-04-24 | Newcastle         | 2 - 1         | Ipswich         | 2 - 1 (9.9%), 1 - 1 (11.1%), 2 - 0 (9.0%)   | 53.1%    | 25.3%    | 21.6%    | Home Win      | Upcoming |
| 2027-04-24 | Aston Villa       | 2 - 0         | Coventry        | 2 - 0 (10.6%), 1 - 1 (10.5%), 1 - 0 (10.0%) | 57.6%    | 24.2%    | 18.2%    | Home Win      | Upcoming |
| 2027-04-24 | Brentford         | 1 - 0         | Fulham          | 1 - 0 (9.7%), 1 - 1 (13.1%), 2 - 1 (8.9%)   | 42.4%    | 25.8%    | 31.8%    | Home Win      | Upcoming |
| 2027-04-24 | Leeds             | 1 - 1         | Liverpool       | 1 - 1 (14.3%), 0 - 0 (12.5%), 0 - 1 (12.2%) | 34.4%    | 29.8%    | 35.8%    | Draw          | Upcoming |

### Gameweek 34

| Date       | Home            | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-----------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-05-01 | Sunderland      | 1 - 1         | Newcastle         | 1 - 1 (14.1%), 0 - 0 (11.4%), 0 - 1 (11.3%) | 32.7%    | 28.0%    | 39.3%    | Draw          | Upcoming |
| 2027-05-01 | Brighton        | 1 - 0         | Nottingham Forest | 1 - 0 (11.7%), 1 - 1 (12.9%), 2 - 0 (9.6%)  | 48.4%    | 28.7%    | 22.9%    | Home Win      | Upcoming |
| 2027-05-01 | Coventry        | 1 - 2         | Manchester United | 1 - 2 (9.7%), 1 - 1 (9.5%), 0 - 2 (7.9%)    | 24.5%    | 28.5%    | 47.0%    | Away Win      | Upcoming |
| 2027-05-01 | Hull            | 1 - 1         | Bournemouth       | 1 - 1 (13.0%), 0 - 1 (9.0%), 1 - 2 (8.8%)   | 40.0%    | 26.7%    | 33.3%    | Draw          | Upcoming |
| 2027-05-01 | Manchester City | 2 - 0         | Brentford         | 2 - 0 (10.5%), 1 - 1 (10.9%), 1 - 0 (10.3%) | 55.7%    | 24.2%    | 20.1%    | Home Win      | Upcoming |
| 2027-05-01 | Fulham          | 1 - 0         | Everton           | 1 - 0 (11.8%), 1 - 1 (13.7%), 0 - 0 (10.3%) | 43.5%    | 31.9%    | 24.6%    | Home Win      | Upcoming |
| 2027-05-01 | Liverpool       | 2 - 1         | Chelsea           | 2 - 1 (9.6%), 1 - 1 (12.0%), 1 - 0 (9.2%)   | 49.4%    | 25.7%    | 24.9%    | Home Win      | Upcoming |
| 2027-05-01 | Arsenal         | 2 - 1         | Tottenham         | 2 - 1 (9.9%), 1 - 1 (10.6%), 2 - 0 (8.8%)   | 57.9%    | 22.5%    | 19.6%    | Home Win      | Upcoming |
| 2027-05-01 | Crystal Palace  | 0 - 1         | Aston Villa       | 0 - 1 (10.5%), 1 - 1 (13.4%), 0 - 0 (8.9%)  | 30.9%    | 23.9%    | 45.2%    | Away Win      | Upcoming |
| 2027-05-01 | Ipswich         | 1 - 1         | Leeds             | 1 - 1 (12.7%), 2 - 1 (8.9%), 1 - 0 (8.6%)   | 39.9%    | 25.3%    | 34.8%    | Draw          | Upcoming |

### Gameweek 35

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-05-08 | Manchester City   | 1 - 0         | Liverpool         | 1 - 0 (11.0%), 1 - 1 (11.4%), 2 - 0 (10.7%) | 56.0%    | 23.5%    | 20.5%    | Home Win      | Upcoming |
| 2027-05-08 | Leeds             | 0 - 1         | Arsenal           | 0 - 1 (10.2%), 1 - 1 (12.8%), 1 - 2 (9.3%)  | 31.7%    | 26.8%    | 41.5%    | Away Win      | Upcoming |
| 2027-05-08 | Fulham            | 1 - 0         | Ipswich           | 1 - 0 (10.6%), 1 - 1 (11.5%), 2 - 0 (10.2%) | 54.1%    | 27.9%    | 18.0%    | Home Win      | Upcoming |
| 2027-05-08 | Nottingham Forest | 1 - 0         | Crystal Palace    | 1 - 0 (13.4%), 1 - 1 (13.8%), 0 - 0 (11.6%) | 45.6%    | 29.7%    | 24.7%    | Home Win      | Upcoming |
| 2027-05-08 | Brentford         | 1 - 0         | Aston Villa       | 1 - 0 (11.5%), 1 - 1 (13.4%), 0 - 0 (9.4%)  | 41.7%    | 27.3%    | 31.0%    | Home Win      | Upcoming |
| 2027-05-08 | Newcastle         | 2 - 1         | Coventry          | 2 - 1 (9.7%), 1 - 1 (10.6%), 2 - 0 (7.8%)   | 50.7%    | 25.9%    | 23.4%    | Home Win      | Upcoming |
| 2027-05-08 | Brighton          | 2 - 1         | Sunderland        | 2 - 1 (9.9%), 1 - 1 (11.3%), 1 - 0 (9.8%)   | 53.3%    | 27.9%    | 18.8%    | Home Win      | Upcoming |
| 2027-05-08 | Tottenham         | 1 - 0         | Chelsea           | 1 - 0 (10.1%), 1 - 1 (13.1%), 2 - 1 (9.0%)  | 41.2%    | 26.6%    | 32.2%    | Home Win      | Upcoming |
| 2027-05-08 | Everton           | 1 - 0         | Hull              | 1 - 0 (12.5%), 1 - 1 (11.8%), 2 - 0 (11.4%) | 52.5%    | 23.5%    | 24.0%    | Home Win      | Upcoming |
| 2027-05-08 | Bournemouth       | 1 - 0         | Manchester United | 1 - 0 (11.8%), 1 - 1 (12.9%), 2 - 0 (9.6%)  | 45.0%    | 29.4%    | 25.6%    | Home Win      | Upcoming |

### Gameweek 36

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-05-15 | Hull              | 1 - 1         | Fulham            | 1 - 1 (14.0%), 0 - 1 (11.3%), 0 - 0 (10.9%) | 36.0%    | 26.9%    | 37.1%    | Draw          | Upcoming |
| 2027-05-15 | Manchester United | 2 - 1         | Leeds             | 2 - 1 (9.8%), 1 - 1 (11.0%), 2 - 0 (8.3%)   | 51.4%    | 20.4%    | 28.2%    | Home Win      | Upcoming |
| 2027-05-15 | Crystal Palace    | 0 - 1         | Brighton          | 0 - 1 (9.8%), 1 - 1 (12.6%), 1 - 2 (9.4%)   | 29.4%    | 21.7%    | 48.9%    | Away Win      | Upcoming |
| 2027-05-15 | Aston Villa       | 1 - 0         | Newcastle         | 1 - 0 (11.5%), 1 - 1 (12.5%), 2 - 0 (9.9%)  | 50.5%    | 24.9%    | 24.6%    | Home Win      | Upcoming |
| 2027-05-15 | Chelsea           | 1 - 0         | Everton           | 1 - 0 (12.0%), 1 - 1 (12.7%), 2 - 0 (10.0%) | 46.6%    | 29.9%    | 23.5%    | Home Win      | Upcoming |
| 2027-05-15 | Coventry          | 1 - 2         | Tottenham         | 1 - 2 (9.5%), 1 - 1 (12.0%), 0 - 1 (8.8%)   | 29.1%    | 24.5%    | 46.4%    | Away Win      | Upcoming |
| 2027-05-15 | Sunderland        | 1 - 0         | Bournemouth       | 1 - 0 (10.4%), 1 - 1 (13.4%), 2 - 1 (8.8%)  | 41.5%    | 25.6%    | 32.9%    | Home Win      | Upcoming |
| 2027-05-15 | Liverpool         | 1 - 0         | Brentford         | 1 - 0 (10.6%), 1 - 1 (12.2%), 2 - 1 (9.7%)  | 51.4%    | 25.7%    | 22.9%    | Home Win      | Upcoming |
| 2027-05-15 | Ipswich           | 1 - 1         | Manchester City   | 1 - 1 (11.1%), 1 - 2 (8.6%), 2 - 1 (8.1%)   | 35.9%    | 23.2%    | 40.9%    | Draw          | Upcoming |
| 2027-05-15 | Arsenal           | 2 - 1         | Nottingham Forest | 2 - 1 (9.8%), 1 - 1 (11.4%), 1 - 0 (9.2%)   | 56.7%    | 23.9%    | 19.4%    | Home Win      | Upcoming |

### Gameweek 37

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-05-23 | Brentford         | 1 - 0         | Hull              | 1 - 0 (11.1%), 1 - 1 (11.9%), 2 - 0 (10.3%) | 48.1%    | 26.0%    | 25.9%    | Home Win      | Upcoming |
| 2027-05-23 | Newcastle         | 2 - 1         | Crystal Palace    | 2 - 1 (9.4%), 1 - 1 (12.3%), 1 - 0 (9.1%)   | 46.6%    | 29.3%    | 24.1%    | Home Win      | Upcoming |
| 2027-05-23 | Tottenham         | 1 - 0         | Manchester United | 1 - 0 (10.8%), 1 - 1 (13.3%), 2 - 1 (9.0%)  | 42.2%    | 31.0%    | 26.8%    | Home Win      | Upcoming |
| 2027-05-23 | Leeds             | 1 - 0         | Sunderland        | 1 - 0 (11.5%), 1 - 1 (13.3%), 0 - 0 (9.3%)  | 49.6%    | 27.8%    | 22.6%    | Home Win      | Upcoming |
| 2027-05-23 | Brighton          | 2 - 1         | Liverpool         | 2 - 1 (9.6%), 1 - 1 (12.1%), 1 - 0 (9.6%)   | 44.0%    | 29.3%    | 26.7%    | Home Win      | Upcoming |
| 2027-05-23 | Nottingham Forest | 1 - 0         | Ipswich           | 1 - 0 (12.7%), 2 - 0 (11.7%), 1 - 1 (11.6%) | 53.8%    | 25.2%    | 21.0%    | Home Win      | Upcoming |
| 2027-05-23 | Bournemouth       | 1 - 0         | Chelsea           | 1 - 0 (11.5%), 1 - 1 (13.7%), 0 - 0 (10.0%) | 41.7%    | 25.5%    | 32.8%    | Home Win      | Upcoming |
| 2027-05-23 | Fulham            | 1 - 0         | Coventry          | 1 - 0 (11.6%), 1 - 1 (11.5%), 2 - 0 (11.1%) | 57.5%    | 25.6%    | 16.9%    | Home Win      | Upcoming |
| 2027-05-23 | Everton           | 0 - 1         | Arsenal           | 0 - 1 (9.7%), 1 - 1 (13.3%), 1 - 2 (8.7%)   | 32.2%    | 26.5%    | 41.3%    | Away Win      | Upcoming |
| 2027-05-23 | Manchester City   | 2 - 1         | Aston Villa       | 2 - 1 (9.9%), 1 - 1 (10.6%), 2 - 0 (9.4%)   | 56.7%    | 23.2%    | 20.1%    | Home Win      | Upcoming |

### Gameweek 38

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-05-30 | Ipswich           | 2 - 1         | Everton           | 2 - 1 (9.1%), 1 - 1 (11.3%), 1 - 2 (7.5%)   | 41.9%    | 28.4%    | 29.7%    | Home Win      | Upcoming |
| 2027-05-30 | Arsenal           | 2 - 1         | Brighton          | 2 - 1 (9.5%), 1 - 1 (9.2%), 2 - 0 (7.2%)    | 59.0%    | 21.9%    | 19.1%    | Home Win      | Upcoming |
| 2027-05-30 | Liverpool         | 1 - 0         | Bournemouth       | 1 - 0 (10.7%), 1 - 1 (12.0%), 2 - 0 (9.8%)  | 53.4%    | 26.5%    | 20.1%    | Home Win      | Upcoming |
| 2027-05-30 | Coventry          | 1 - 2         | Nottingham Forest | 1 - 2 (9.8%), 1 - 1 (11.2%), 0 - 1 (8.3%)   | 29.0%    | 27.6%    | 43.4%    | Away Win      | Upcoming |
| 2027-05-30 | Aston Villa       | 2 - 1         | Tottenham         | 2 - 1 (9.9%), 1 - 1 (11.1%), 2 - 0 (9.2%)   | 52.5%    | 24.2%    | 23.3%    | Home Win      | Upcoming |
| 2027-05-30 | Hull              | 1 - 1         | Newcastle         | 1 - 1 (13.4%), 0 - 1 (10.3%), 0 - 0 (8.8%)  | 35.2%    | 27.2%    | 37.6%    | Draw          | Upcoming |
| 2027-05-30 | Manchester United | 2 - 1         | Fulham            | 2 - 1 (9.7%), 1 - 1 (11.4%), 1 - 0 (8.4%)   | 52.9%    | 21.4%    | 25.7%    | Home Win      | Upcoming |
| 2027-05-30 | Sunderland        | 0 - 1         | Manchester City   | 0 - 1 (10.9%), 1 - 1 (12.0%), 0 - 2 (10.0%) | 27.1%    | 26.1%    | 46.8%    | Away Win      | Upcoming |
| 2027-05-30 | Chelsea           | 1 - 0         | Brentford         | 1 - 0 (10.9%), 1 - 1 (13.6%), 0 - 0 (9.4%)  | 43.1%    | 25.5%    | 31.4%    | Home Win      | Upcoming |
| 2027-05-30 | Crystal Palace    | 0 - 1         | Leeds             | 0 - 1 (10.4%), 1 - 1 (13.6%), 0 - 0 (9.2%)  | 32.0%    | 25.6%    | 42.4%    | Away Win      | Upcoming |

