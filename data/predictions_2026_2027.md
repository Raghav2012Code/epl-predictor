# Premier League 2026/2027 Season Match Predictions

Generated on: 2026-10-13 18:33:31
Primary Prediction Engine: **Random Forest**

## Model Performance Benchmark Summary

| Model         | Accuracy   |   Macro F1 |   Log Loss |   Goal MAE | Within 1 Goal Acc   |   Scoreline KL | Variety   |
|---------------|------------|------------|------------|------------|---------------------|----------------|-----------|
| Random Forest | 50.6%      |      0.42  |      1.03  |       0.89 | 60.8%               |         8.5639 | 21.5%     |
| XGBoost       | 48.1%      |      0.381 |      1.043 |       0.87 | 56.3%               |        10.3027 | 16.5%     |
| Stacked       | 48.1%      |      0.372 |      1.03  |       0.87 | 58.2%               |         8.658  | 18.4%     |

Scoreline quality is measured on the held-out evaluation tail: KL divergence (natural log, 6x6 grid capped at 5 goals, lower is better) between empirical and predicted scoreline distributions, plus argmax-variety (share of argmax picks outside the four most frequent predicted scorelines, higher means more varied). Production (Random Forest): KL 8.5639, variety 21.5% over 158 matches.

---

## Season Fixtures and Forecasts

### Gameweek 1

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-08-21 | Arsenal           | 2 - 0         | Coventry          | 2 - 0 (10.7%), 1 - 1 (10.8%), 1 - 0 (10.4%) | 72.1%    | 17.4%    | 10.5%    | Home Win      | Played   |
| 2026-08-22 | Hull              | 0 - 2         | Manchester United | 0 - 2 (12.5%), 0 - 1 (12.1%), 1 - 1 (10.5%) | 11.7%    | 20.6%    | 67.7%    | Away Win      | Played   |
| 2026-08-22 | Ipswich           | 1 - 2         | Sunderland        | 1 - 2 (9.8%), 1 - 1 (11.3%), 0 - 1 (8.9%)   | 26.8%    | 27.4%    | 45.8%    | Away Win      | Played   |
| 2026-08-22 | Nottingham Forest | 0 - 1         | Leeds             | 0 - 1 (11.4%), 1 - 1 (13.6%), 0 - 0 (9.7%)  | 33.1%    | 29.7%    | 37.2%    | Away Win      | Played   |
| 2026-08-22 | Everton           | 1 - 1         | Crystal Palace    | 1 - 1 (12.8%), 0 - 1 (9.4%), 1 - 2 (9.1%)   | 37.3%    | 27.4%    | 35.3%    | Draw          | Played   |
| 2026-08-22 | Brentford         | 2 - 1         | Tottenham         | 2 - 1 (9.5%), 1 - 1 (11.9%), 1 - 0 (8.6%)   | 51.2%    | 25.0%    | 23.8%    | Home Win      | Played   |
| 2026-08-23 | Manchester City   | 2 - 1         | Bournemouth       | 2 - 1 (9.8%), 1 - 1 (9.7%), 2 - 0 (8.7%)    | 63.2%    | 20.2%    | 16.6%    | Home Win      | Played   |
| 2026-08-23 | Brighton          | 1 - 0         | Aston Villa       | 1 - 0 (10.3%), 1 - 1 (12.9%), 2 - 1 (9.3%)  | 46.3%    | 27.3%    | 26.4%    | Home Win      | Played   |
| 2026-08-23 | Newcastle         | 0 - 1         | Liverpool         | 0 - 1 (10.1%), 1 - 1 (13.0%), 1 - 2 (9.1%)  | 27.1%    | 26.8%    | 46.1%    | Away Win      | Played   |
| 2026-08-24 | Fulham            | 0 - 1         | Chelsea           | 0 - 1 (8.9%), 1 - 1 (13.1%), 1 - 2 (8.4%)   | 29.7%    | 28.3%    | 42.0%    | Away Win      | Played   |

### Gameweek 2

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-08-28 | Crystal Palace    | 0 - 1         | Manchester City   | 0 - 1 (12.7%), 1 - 1 (12.9%), 0 - 2 (10.2%) | 20.3%    | 24.2%    | 55.5%    | Away Win      | Played   |
| 2026-08-29 | Liverpool         | 2 - 1         | Nottingham Forest | 2 - 1 (9.5%), 1 - 1 (10.1%), 2 - 0 (7.1%)   | 56.9%    | 21.5%    | 21.6%    | Home Win      | Played   |
| 2026-08-29 | Bournemouth       | 1 - 0         | Everton           | 1 - 0 (10.9%), 1 - 1 (13.6%), 0 - 0 (9.5%)  | 42.9%    | 27.4%    | 29.7%    | Home Win      | Played   |
| 2026-08-29 | Coventry          | 2 - 1         | Hull              | 2 - 1 (8.7%), 1 - 1 (8.9%), 2 - 2 (7.0%)    | 50.8%    | 25.1%    | 24.1%    | Home Win      | Played   |
| 2026-08-29 | Tottenham         | 1 - 0         | Newcastle         | 1 - 0 (12.7%), 1 - 1 (12.7%), 2 - 0 (10.5%) | 47.5%    | 25.7%    | 26.8%    | Home Win      | Played   |
| 2026-08-30 | Sunderland        | 1 - 0         | Fulham            | 1 - 0 (11.4%), 1 - 1 (13.0%), 2 - 1 (9.3%)  | 43.3%    | 28.5%    | 28.2%    | Home Win      | Played   |
| 2026-08-30 | Chelsea           | 2 - 1         | Brighton          | 2 - 1 (9.1%), 1 - 1 (11.8%), 1 - 2 (7.6%)   | 46.4%    | 25.5%    | 28.1%    | Home Win      | Played   |
| 2026-08-30 | Leeds             | 0 - 1         | Brentford         | 0 - 1 (9.9%), 1 - 1 (13.1%), 1 - 2 (8.9%)   | 32.1%    | 28.4%    | 39.5%    | Away Win      | Played   |
| 2026-08-30 | Manchester United | 2 - 0         | Ipswich           | 2 - 0 (11.9%), 1 - 0 (10.7%), 1 - 1 (9.8%)  | 65.5%    | 19.7%    | 14.8%    | Home Win      | Played   |
| 2026-08-31 | Aston Villa       | 1 - 2         | Arsenal           | 1 - 2 (9.9%), 1 - 1 (10.4%), 0 - 2 (9.3%)   | 15.4%    | 21.7%    | 62.9%    | Away Win      | Played   |

### Gameweek 3

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-09-04 | Ipswich           | 1 - 2         | Liverpool         | 1 - 2 (8.6%), 0 - 2 (8.5%), 1 - 3 (8.2%)    | 15.1%    | 19.3%    | 65.6%    | Away Win      | Played   |
| 2026-09-05 | Newcastle         | 2 - 1         | Bournemouth       | 2 - 1 (9.5%), 1 - 1 (11.9%), 1 - 0 (8.4%)   | 44.2%    | 26.3%    | 29.5%    | Home Win      | Played   |
| 2026-09-05 | Nottingham Forest | 1 - 1         | Tottenham         | 1 - 1 (12.5%), 1 - 2 (8.6%), 2 - 1 (8.1%)   | 36.8%    | 27.9%    | 35.3%    | Draw          | Played   |
| 2026-09-05 | Manchester City   | 2 - 0         | Coventry          | 2 - 0 (11.5%), 3 - 0 (9.8%), 2 - 1 (9.1%)   | 78.0%    | 14.4%    | 7.6%     | Home Win      | Played   |
| 2026-09-05 | Brighton          | 2 - 1         | Leeds             | 2 - 1 (9.4%), 1 - 1 (12.2%), 1 - 0 (8.9%)   | 45.8%    | 26.2%    | 28.0%    | Home Win      | Played   |
| 2026-09-05 | Brentford         | 2 - 1         | Sunderland        | 2 - 1 (9.8%), 1 - 1 (11.1%), 2 - 0 (8.7%)   | 54.9%    | 24.3%    | 20.8%    | Home Win      | Played   |
| 2026-09-05 | Fulham            | 1 - 0         | Crystal Palace    | 1 - 0 (11.1%), 1 - 1 (13.1%), 2 - 1 (9.2%)  | 46.0%    | 27.8%    | 26.2%    | Home Win      | Played   |
| 2026-09-05 | Hull              | 1 - 2         | Aston Villa       | 1 - 2 (9.1%), 1 - 1 (10.8%), 2 - 1 (7.4%)   | 27.6%    | 26.9%    | 45.5%    | Away Win      | Played   |
| 2026-09-06 | Everton           | 0 - 1         | Manchester United | 0 - 1 (13.7%), 1 - 1 (14.0%), 0 - 0 (12.7%) | 27.1%    | 27.7%    | 45.2%    | Away Win      | Played   |
| 2026-09-06 | Arsenal           | 2 - 0         | Chelsea           | 2 - 0 (10.0%), 2 - 1 (9.8%), 1 - 1 (9.3%)   | 58.5%    | 23.4%    | 18.1%    | Home Win      | Played   |

### Gameweek 4

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-09-12 | Crystal Palace    | 2 - 1         | Ipswich           | 2 - 1 (9.8%), 1 - 1 (11.3%), 1 - 0 (9.0%)   | 60.6%    | 22.8%    | 16.6%    | Home Win      | Upcoming |
| 2026-09-12 | Liverpool         | 1 - 0         | Fulham            | 1 - 0 (12.1%), 1 - 1 (11.9%), 2 - 0 (11.0%) | 57.4%    | 25.2%    | 17.4%    | Home Win      | Upcoming |
| 2026-09-12 | Aston Villa       | 1 - 0         | Nottingham Forest | 1 - 0 (9.7%), 1 - 1 (12.4%), 2 - 1 (9.5%)   | 46.5%    | 25.2%    | 28.3%    | Home Win      | Upcoming |
| 2026-09-12 | Bournemouth       | 1 - 0         | Brentford         | 1 - 0 (10.2%), 1 - 1 (13.4%), 2 - 1 (8.7%)  | 44.4%    | 26.8%    | 28.8%    | Home Win      | Upcoming |
| 2026-09-12 | Chelsea           | 2 - 1         | Hull              | 2 - 1 (9.9%), 1 - 1 (10.6%), 2 - 0 (8.8%)   | 56.0%    | 24.3%    | 19.7%    | Home Win      | Upcoming |
| 2026-09-12 | Tottenham         | 1 - 0         | Everton           | 1 - 0 (12.1%), 1 - 1 (12.8%), 2 - 0 (9.9%)  | 50.7%    | 25.6%    | 23.7%    | Home Win      | Upcoming |
| 2026-09-12 | Sunderland        | 1 - 2         | Arsenal           | 1 - 2 (8.9%), 1 - 1 (11.5%), 2 - 1 (7.9%)   | 36.7%    | 25.6%    | 37.7%    | Away Win      | Upcoming |
| 2026-09-13 | Coventry          | 1 - 2         | Brighton          | 1 - 2 (9.5%), 1 - 1 (8.5%), 0 - 2 (8.0%)    | 17.1%    | 22.4%    | 60.5%    | Away Win      | Upcoming |
| 2026-09-13 | Manchester United | 2 - 1         | Manchester City   | 2 - 1 (9.0%), 1 - 1 (12.3%), 1 - 0 (8.3%)   | 40.9%    | 26.2%    | 32.9%    | Home Win      | Upcoming |
| 2026-09-14 | Leeds             | 1 - 0         | Newcastle         | 1 - 0 (11.6%), 1 - 1 (14.2%), 0 - 0 (12.2%) | 37.8%    | 28.1%    | 34.1%    | Home Win      | Upcoming |

### Gameweek 5

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-09-18 | Brentford         | 1 - 0         | Chelsea           | 1 - 0 (11.9%), 1 - 1 (14.0%), 0 - 0 (11.0%) | 42.1%    | 28.5%    | 29.4%    | Home Win      | Upcoming |
| 2026-09-19 | Tottenham         | 1 - 0         | Aston Villa       | 1 - 0 (11.2%), 1 - 1 (13.9%), 0 - 0 (10.3%) | 40.3%    | 28.8%    | 30.9%    | Home Win      | Upcoming |
| 2026-09-19 | Everton           | 1 - 0         | Ipswich           | 1 - 0 (11.1%), 1 - 1 (12.4%), 2 - 0 (9.7%)  | 57.3%    | 26.2%    | 16.5%    | Home Win      | Upcoming |
| 2026-09-19 | Leeds             | 1 - 0         | Crystal Palace    | 1 - 0 (10.9%), 1 - 1 (13.6%), 0 - 0 (9.4%)  | 43.7%    | 29.2%    | 27.1%    | Home Win      | Upcoming |
| 2026-09-19 | Brighton          | 1 - 2         | Arsenal           | 1 - 2 (8.9%), 1 - 1 (12.6%), 0 - 1 (8.5%)   | 34.4%    | 26.2%    | 39.4%    | Away Win      | Upcoming |
| 2026-09-19 | Newcastle         | 2 - 1         | Hull              | 2 - 1 (9.9%), 1 - 1 (10.7%), 2 - 0 (9.1%)   | 57.2%    | 23.8%    | 19.0%    | Home Win      | Upcoming |
| 2026-09-19 | Nottingham Forest | 2 - 1         | Coventry          | 2 - 1 (9.6%), 1 - 1 (11.7%), 1 - 0 (8.4%)   | 53.2%    | 25.3%    | 21.5%    | Home Win      | Upcoming |
| 2026-09-20 | Bournemouth       | 1 - 0         | Liverpool         | 1 - 0 (12.1%), 1 - 1 (13.4%), 0 - 0 (9.8%)  | 43.5%    | 27.9%    | 28.6%    | Home Win      | Upcoming |
| 2026-09-20 | Manchester City   | 2 - 0         | Sunderland        | 2 - 0 (13.6%), 1 - 0 (11.2%), 3 - 0 (10.5%) | 75.6%    | 16.8%    | 7.6%     | Home Win      | Upcoming |
| 2026-09-20 | Fulham            | 1 - 0         | Manchester United | 1 - 0 (8.9%), 1 - 1 (13.3%), 0 - 1 (8.8%)   | 37.6%    | 27.9%    | 34.5%    | Home Win      | Upcoming |

### Gameweek 6

| Date       | Home              | Most likely   | Away              | Top 3                                      | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|--------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-10-10 | Arsenal           | 2 - 1         | Leeds             | 2 - 1 (9.9%), 1 - 1 (10.8%), 2 - 0 (8.7%)  | 57.6%    | 23.8%    | 18.6%    | Home Win      | Upcoming |
| 2026-10-10 | Sunderland        | 1 - 0         | Brighton          | 1 - 0 (11.3%), 1 - 1 (12.8%), 2 - 1 (9.4%) | 47.8%    | 28.0%    | 24.2%    | Home Win      | Upcoming |
| 2026-10-10 | Chelsea           | 1 - 0         | Bournemouth       | 1 - 0 (10.5%), 1 - 1 (13.8%), 0 - 0 (9.7%) | 42.3%    | 28.0%    | 29.7%    | Home Win      | Upcoming |
| 2026-10-10 | Ipswich           | 1 - 2         | Fulham            | 1 - 2 (9.9%), 1 - 1 (11.1%), 0 - 2 (9.1%)  | 18.8%    | 23.6%    | 57.6%    | Away Win      | Upcoming |
| 2026-10-10 | Aston Villa       | 1 - 0         | Brentford         | 1 - 0 (9.2%), 1 - 1 (12.6%), 2 - 1 (9.2%)  | 44.7%    | 27.7%    | 27.6%    | Home Win      | Upcoming |
| 2026-10-10 | Manchester United | 1 - 0         | Tottenham         | 1 - 0 (10.4%), 1 - 1 (11.8%), 2 - 1 (9.8%) | 58.7%    | 24.1%    | 17.2%    | Home Win      | Upcoming |
| 2026-10-11 | Hull              | 2 - 1         | Everton           | 2 - 1 (8.4%), 1 - 1 (11.7%), 1 - 2 (8.4%)  | 39.0%    | 27.3%    | 33.7%    | Home Win      | Upcoming |
| 2026-10-11 | Crystal Palace    | 0 - 1         | Nottingham Forest | 0 - 1 (11.3%), 1 - 1 (13.4%), 0 - 0 (9.4%) | 30.2%    | 28.6%    | 41.2%    | Away Win      | Upcoming |
| 2026-10-11 | Liverpool         | 0 - 1         | Manchester City   | 0 - 1 (9.0%), 1 - 1 (13.5%), 1 - 0 (9.4%)  | 36.0%    | 27.7%    | 36.3%    | Away Win      | Upcoming |
| 2026-10-12 | Coventry          | 1 - 2         | Newcastle         | 1 - 2 (9.7%), 1 - 1 (9.3%), 0 - 2 (8.4%)   | 21.1%    | 24.4%    | 54.5%    | Away Win      | Upcoming |

### Gameweek 7

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-10-17 | Everton           | 1 - 0         | Chelsea           | 1 - 0 (10.5%), 1 - 1 (13.4%), 0 - 0 (8.8%)  | 43.3%    | 27.3%    | 29.4%    | Home Win      | Upcoming |
| 2026-10-17 | Fulham            | 2 - 1         | Hull              | 2 - 1 (9.8%), 1 - 1 (11.6%), 1 - 0 (9.6%)   | 55.6%    | 23.9%    | 20.5%    | Home Win      | Upcoming |
| 2026-10-17 | Manchester City   | 2 - 0         | Ipswich           | 2 - 0 (14.5%), 1 - 0 (12.5%), 3 - 0 (10.9%) | 75.9%    | 17.5%    | 6.6%     | Home Win      | Upcoming |
| 2026-10-17 | Brentford         | 1 - 0         | Liverpool         | 1 - 0 (12.1%), 1 - 1 (13.8%), 0 - 0 (10.6%) | 40.8%    | 29.1%    | 30.1%    | Home Win      | Upcoming |
| 2026-10-17 | Newcastle         | 1 - 0         | Aston Villa       | 1 - 0 (10.9%), 1 - 1 (13.2%), 2 - 1 (9.1%)  | 47.5%    | 28.2%    | 24.3%    | Home Win      | Upcoming |
| 2026-10-18 | Bournemouth       | 2 - 1         | Sunderland        | 2 - 1 (9.9%), 1 - 1 (10.4%), 2 - 0 (9.2%)   | 58.3%    | 23.4%    | 18.3%    | Home Win      | Upcoming |
| 2026-10-18 | Leeds             | 0 - 1         | Manchester United | 0 - 1 (12.2%), 1 - 1 (14.1%), 0 - 0 (11.5%) | 29.9%    | 30.4%    | 39.7%    | Away Win      | Upcoming |
| 2026-10-18 | Brighton          | 2 - 1         | Crystal Palace    | 2 - 1 (9.3%), 1 - 1 (12.5%), 1 - 0 (9.1%)   | 49.5%    | 26.9%    | 23.6%    | Home Win      | Upcoming |
| 2026-10-18 | Nottingham Forest | 0 - 1         | Arsenal           | 0 - 1 (9.7%), 1 - 1 (12.0%), 1 - 2 (9.7%)   | 28.3%    | 25.8%    | 45.9%    | Away Win      | Upcoming |
| 2026-10-19 | Tottenham         | 2 - 1         | Coventry          | 2 - 1 (9.9%), 1 - 1 (11.0%), 2 - 0 (9.8%)   | 59.9%    | 23.8%    | 16.3%    | Home Win      | Upcoming |

### Gameweek 8

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-10-23 | Ipswich           | 1 - 2         | Nottingham Forest | 1 - 2 (9.8%), 1 - 1 (11.7%), 0 - 1 (9.4%)   | 18.4%    | 23.5%    | 58.1%    | Away Win      | Upcoming |
| 2026-10-24 | Aston Villa       | 1 - 2         | Manchester City   | 1 - 2 (8.4%), 1 - 1 (12.9%), 0 - 1 (8.3%)   | 34.6%    | 28.1%    | 37.3%    | Away Win      | Upcoming |
| 2026-10-24 | Liverpool         | 1 - 0         | Brighton          | 1 - 0 (10.2%), 1 - 1 (12.0%), 2 - 1 (9.7%)  | 48.4%    | 25.8%    | 25.8%    | Home Win      | Upcoming |
| 2026-10-24 | Arsenal           | 2 - 1         | Everton           | 2 - 1 (9.6%), 1 - 1 (11.9%), 1 - 0 (8.9%)   | 50.7%    | 25.9%    | 23.4%    | Home Win      | Upcoming |
| 2026-10-24 | Coventry          | 1 - 2         | Fulham            | 1 - 2 (9.8%), 1 - 1 (9.5%), 0 - 2 (8.9%)    | 15.9%    | 23.0%    | 61.1%    | Away Win      | Upcoming |
| 2026-10-24 | Chelsea           | 1 - 0         | Tottenham         | 1 - 0 (12.0%), 1 - 1 (12.8%), 2 - 0 (9.9%)  | 54.5%    | 27.1%    | 18.4%    | Home Win      | Upcoming |
| 2026-10-25 | Crystal Palace    | 2 - 1         | Newcastle         | 2 - 1 (9.0%), 1 - 1 (12.6%), 1 - 0 (8.7%)   | 40.4%    | 26.0%    | 33.6%    | Home Win      | Upcoming |
| 2026-10-25 | Manchester United | 2 - 1         | Bournemouth       | 2 - 1 (9.4%), 1 - 1 (11.4%), 1 - 0 (7.6%)   | 47.5%    | 25.4%    | 27.1%    | Home Win      | Upcoming |
| 2026-10-25 | Hull              | 1 - 2         | Brentford         | 1 - 2 (8.7%), 1 - 1 (10.7%), 2 - 1 (7.9%)   | 36.1%    | 26.7%    | 37.2%    | Away Win      | Upcoming |
| 2026-10-25 | Sunderland        | 1 - 0         | Leeds             | 1 - 0 (10.5%), 1 - 1 (14.0%), 0 - 1 (10.8%) | 38.3%    | 28.6%    | 33.1%    | Home Win      | Upcoming |

### Gameweek 9

| Date       | Home            | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-----------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-10-31 | Chelsea         | 0 - 1         | Manchester United | 0 - 1 (10.6%), 1 - 1 (13.9%), 0 - 0 (10.0%) | 34.9%    | 28.6%    | 36.5%    | Away Win      | Upcoming |
| 2026-10-31 | Manchester City | 1 - 0         | Brighton          | 1 - 0 (12.4%), 2 - 0 (11.7%), 1 - 1 (11.4%) | 56.2%    | 24.4%    | 19.4%    | Home Win      | Upcoming |
| 2026-10-31 | Bournemouth     | 1 - 0         | Leeds             | 1 - 0 (9.9%), 1 - 1 (12.4%), 2 - 1 (9.5%)   | 51.3%    | 26.2%    | 22.5%    | Home Win      | Upcoming |
| 2026-10-31 | Coventry        | 1 - 2         | Sunderland        | 1 - 2 (9.8%), 1 - 1 (11.2%), 0 - 1 (8.6%)   | 23.8%    | 25.4%    | 50.8%    | Away Win      | Upcoming |
| 2026-10-31 | Hull            | 2 - 1         | Ipswich           | 2 - 1 (9.2%), 1 - 1 (12.6%), 1 - 0 (9.1%)   | 50.2%    | 26.7%    | 23.1%    | Home Win      | Upcoming |
| 2026-10-31 | Brentford       | 1 - 0         | Nottingham Forest | 1 - 0 (10.1%), 1 - 1 (13.3%), 2 - 1 (8.8%)  | 42.4%    | 28.0%    | 29.6%    | Home Win      | Upcoming |
| 2026-10-31 | Tottenham       | 1 - 0         | Crystal Palace    | 1 - 0 (10.6%), 1 - 1 (13.1%), 2 - 1 (9.1%)  | 44.2%    | 27.2%    | 28.6%    | Home Win      | Upcoming |
| 2026-11-01 | Aston Villa     | 1 - 0         | Fulham            | 1 - 0 (12.1%), 1 - 1 (12.6%), 2 - 0 (10.2%) | 53.9%    | 26.7%    | 19.4%    | Home Win      | Upcoming |
| 2026-11-01 | Liverpool       | 2 - 1         | Arsenal           | 2 - 1 (8.7%), 1 - 1 (12.3%), 1 - 2 (8.0%)   | 39.5%    | 25.9%    | 34.6%    | Home Win      | Upcoming |
| 2026-11-02 | Newcastle       | 1 - 0         | Everton           | 1 - 0 (9.9%), 1 - 1 (13.3%), 2 - 1 (8.8%)   | 45.2%    | 27.2%    | 27.6%    | Home Win      | Upcoming |

### Gameweek 10

| Date       | Home              | Most likely   | Away            | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-----------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-11-07 | Arsenal           | 2 - 1         | Hull            | 2 - 1 (9.7%), 1 - 1 (9.4%), 2 - 0 (7.9%)    | 63.5%    | 20.7%    | 15.8%    | Home Win      | Upcoming |
| 2026-11-07 | Nottingham Forest | 0 - 1         | Manchester City | 0 - 1 (11.1%), 1 - 1 (13.3%), 1 - 2 (9.0%)  | 28.2%    | 27.2%    | 44.6%    | Away Win      | Upcoming |
| 2026-11-07 | Leeds             | 1 - 0         | Tottenham       | 1 - 0 (11.4%), 1 - 1 (13.8%), 0 - 0 (10.1%) | 44.5%    | 30.5%    | 25.0%    | Home Win      | Upcoming |
| 2026-11-07 | Fulham            | 1 - 0         | Newcastle       | 1 - 0 (10.2%), 1 - 1 (12.6%), 2 - 1 (9.4%)  | 51.4%    | 25.6%    | 23.0%    | Home Win      | Upcoming |
| 2026-11-07 | Everton           | 1 - 0         | Coventry        | 1 - 0 (10.2%), 1 - 1 (12.2%), 2 - 1 (9.7%)  | 54.1%    | 27.0%    | 18.9%    | Home Win      | Upcoming |
| 2026-11-07 | Crystal Palace    | 0 - 1         | Liverpool       | 0 - 1 (10.8%), 1 - 1 (13.2%), 1 - 2 (9.1%)  | 29.5%    | 28.4%    | 42.1%    | Away Win      | Upcoming |
| 2026-11-07 | Sunderland        | 1 - 0         | Chelsea         | 1 - 0 (9.6%), 1 - 1 (12.6%), 2 - 1 (9.3%)   | 44.9%    | 28.3%    | 26.8%    | Home Win      | Upcoming |
| 2026-11-07 | Ipswich           | 0 - 1         | Bournemouth     | 0 - 1 (9.9%), 1 - 1 (11.6%), 1 - 2 (9.8%)   | 18.5%    | 23.7%    | 57.8%    | Away Win      | Upcoming |
| 2026-11-07 | Brighton          | 2 - 1         | Brentford       | 2 - 1 (8.5%), 1 - 1 (11.6%), 1 - 2 (8.3%)   | 44.0%    | 25.7%    | 30.3%    | Home Win      | Upcoming |
| 2026-11-07 | Manchester United | 1 - 0         | Aston Villa     | 1 - 0 (9.7%), 1 - 1 (12.5%), 2 - 1 (9.4%)   | 50.8%    | 26.3%    | 22.9%    | Home Win      | Upcoming |

### Gameweek 11

| Date       | Home            | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-----------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-11-21 | Chelsea         | 1 - 0         | Leeds             | 1 - 0 (10.8%), 1 - 1 (12.7%), 2 - 1 (9.5%)  | 49.3%    | 27.0%    | 23.7%    | Home Win      | Upcoming |
| 2026-11-21 | Manchester City | 2 - 0         | Fulham            | 2 - 0 (12.9%), 1 - 0 (12.5%), 1 - 1 (10.3%) | 69.2%    | 20.8%    | 10.0%    | Home Win      | Upcoming |
| 2026-11-21 | Aston Villa     | 2 - 0         | Sunderland        | 2 - 0 (11.1%), 1 - 0 (10.9%), 1 - 1 (10.8%) | 58.1%    | 25.1%    | 16.8%    | Home Win      | Upcoming |
| 2026-11-21 | Liverpool       | 1 - 0         | Manchester United | 1 - 0 (10.5%), 1 - 1 (12.9%), 2 - 1 (9.3%)  | 46.4%    | 26.8%    | 26.8%    | Home Win      | Upcoming |
| 2026-11-21 | Hull            | 1 - 2         | Brighton          | 1 - 2 (8.6%), 1 - 1 (10.2%), 2 - 1 (7.7%)   | 36.6%    | 26.8%    | 36.6%    | Away Win      | Upcoming |
| 2026-11-21 | Bournemouth     | 1 - 0         | Nottingham Forest | 1 - 0 (10.1%), 1 - 1 (13.1%), 2 - 1 (9.0%)  | 44.8%    | 27.3%    | 27.9%    | Home Win      | Upcoming |
| 2026-11-21 | Tottenham       | 1 - 0         | Ipswich           | 1 - 0 (11.4%), 1 - 1 (11.3%), 2 - 0 (11.2%) | 65.6%    | 21.8%    | 12.6%    | Home Win      | Upcoming |
| 2026-11-21 | Brentford       | 1 - 0         | Everton           | 1 - 0 (11.2%), 1 - 1 (13.5%), 0 - 0 (9.3%)  | 46.3%    | 27.7%    | 26.0%    | Home Win      | Upcoming |
| 2026-11-21 | Coventry        | 1 - 2         | Crystal Palace    | 1 - 2 (9.9%), 1 - 1 (10.2%), 0 - 2 (8.6%)   | 19.0%    | 24.3%    | 56.7%    | Away Win      | Upcoming |
| 2026-11-21 | Newcastle       | 2 - 1         | Arsenal           | 2 - 1 (8.4%), 1 - 1 (11.9%), 1 - 2 (8.4%)   | 38.8%    | 26.7%    | 34.5%    | Home Win      | Upcoming |

### Gameweek 12

| Date       | Home              | Most likely   | Away            | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-----------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-11-28 | Leeds             | 1 - 0         | Coventry        | 1 - 0 (11.0%), 1 - 1 (12.2%), 2 - 0 (9.8%)  | 55.8%    | 26.3%    | 17.9%    | Home Win      | Upcoming |
| 2026-11-28 | Ipswich           | 1 - 2         | Aston Villa     | 1 - 2 (9.9%), 1 - 1 (10.0%), 0 - 2 (9.1%)   | 13.7%    | 21.9%    | 64.4%    | Away Win      | Upcoming |
| 2026-11-28 | Arsenal           | 2 - 1         | Manchester City | 2 - 1 (8.9%), 1 - 1 (11.7%), 1 - 2 (7.8%)   | 44.9%    | 27.2%    | 27.9%    | Home Win      | Upcoming |
| 2026-11-28 | Manchester United | 1 - 0         | Brentford       | 1 - 0 (9.9%), 1 - 1 (11.7%), 2 - 1 (9.8%)   | 53.7%    | 24.5%    | 21.8%    | Home Win      | Upcoming |
| 2026-11-28 | Everton           | 0 - 1         | Liverpool       | 0 - 1 (11.6%), 1 - 1 (14.1%), 0 - 0 (11.3%) | 32.5%    | 30.0%    | 37.5%    | Away Win      | Upcoming |
| 2026-11-28 | Fulham            | 1 - 0         | Bournemouth     | 1 - 0 (9.4%), 1 - 1 (13.2%), 2 - 1 (8.6%)   | 42.6%    | 27.6%    | 29.8%    | Home Win      | Upcoming |
| 2026-11-28 | Nottingham Forest | 1 - 0         | Chelsea         | 1 - 0 (9.3%), 1 - 1 (13.5%), 0 - 1 (9.4%)   | 36.5%    | 27.3%    | 36.2%    | Home Win      | Upcoming |
| 2026-11-28 | Brighton          | 2 - 1         | Newcastle       | 2 - 1 (9.7%), 1 - 1 (11.1%), 1 - 0 (8.0%)   | 51.0%    | 24.6%    | 24.4%    | Home Win      | Upcoming |
| 2026-11-28 | Sunderland        | 1 - 0         | Tottenham       | 1 - 0 (11.6%), 1 - 1 (13.9%), 0 - 0 (10.7%) | 42.5%    | 30.1%    | 27.4%    | Home Win      | Upcoming |
| 2026-11-28 | Crystal Palace    | 2 - 1         | Hull            | 2 - 1 (9.8%), 1 - 1 (11.5%), 1 - 0 (9.2%)   | 57.5%    | 23.9%    | 18.6%    | Home Win      | Upcoming |

### Gameweek 13

| Date       | Home            | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-----------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-12-02 | Tottenham       | 1 - 0         | Fulham            | 1 - 0 (11.1%), 1 - 1 (13.6%), 0 - 0 (9.6%)  | 41.7%    | 28.1%    | 30.2%    | Home Win      | Upcoming |
| 2026-12-02 | Liverpool       | 2 - 1         | Sunderland        | 2 - 1 (9.9%), 1 - 1 (9.7%), 2 - 0 (9.6%)    | 61.6%    | 21.9%    | 16.5%    | Home Win      | Upcoming |
| 2026-12-02 | Hull            | 1 - 2         | Nottingham Forest | 1 - 2 (8.8%), 1 - 1 (11.7%), 2 - 1 (7.9%)   | 36.2%    | 27.0%    | 36.8%    | Away Win      | Upcoming |
| 2026-12-02 | Chelsea         | 1 - 0         | Crystal Palace    | 1 - 0 (11.3%), 1 - 1 (13.1%), 2 - 1 (9.2%)  | 48.3%    | 27.5%    | 24.2%    | Home Win      | Upcoming |
| 2026-12-02 | Aston Villa     | 1 - 0         | Everton           | 1 - 0 (10.4%), 1 - 1 (12.5%), 2 - 1 (9.5%)  | 48.2%    | 26.9%    | 24.9%    | Home Win      | Upcoming |
| 2026-12-02 | Brentford       | 0 - 1         | Arsenal           | 0 - 1 (10.6%), 1 - 1 (12.7%), 1 - 2 (9.4%)  | 28.4%    | 27.4%    | 44.2%    | Away Win      | Upcoming |
| 2026-12-02 | Coventry        | 1 - 2         | Ipswich           | 1 - 2 (9.0%), 1 - 1 (12.3%), 0 - 1 (8.1%)   | 32.6%    | 28.0%    | 39.4%    | Away Win      | Upcoming |
| 2026-12-02 | Manchester City | 2 - 0         | Leeds             | 2 - 0 (12.0%), 1 - 0 (11.7%), 1 - 1 (10.6%) | 62.3%    | 22.4%    | 15.3%    | Home Win      | Upcoming |
| 2026-12-02 | Newcastle       | 1 - 0         | Manchester United | 1 - 0 (10.7%), 1 - 1 (14.0%), 0 - 0 (10.6%) | 37.7%    | 28.6%    | 33.7%    | Home Win      | Upcoming |
| 2026-12-02 | Bournemouth     | 1 - 0         | Brighton          | 1 - 0 (11.6%), 1 - 1 (13.2%), 0 - 0 (9.2%)  | 45.0%    | 27.5%    | 27.5%    | Home Win      | Upcoming |

### Gameweek 14

| Date       | Home              | Most likely   | Away            | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-----------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-12-05 | Tottenham         | 1 - 2         | Arsenal         | 1 - 2 (9.5%), 1 - 1 (11.3%), 0 - 1 (7.6%)   | 29.0%    | 26.3%    | 44.7%    | Away Win      | Upcoming |
| 2026-12-05 | Manchester United | 2 - 1         | Coventry        | 2 - 1 (9.9%), 1 - 1 (9.9%), 2 - 0 (9.8%)    | 63.1%    | 22.6%    | 14.3%    | Home Win      | Upcoming |
| 2026-12-05 | Leeds             | 1 - 0         | Ipswich         | 1 - 0 (12.1%), 1 - 1 (12.4%), 2 - 0 (10.4%) | 57.6%    | 26.5%    | 15.9%    | Home Win      | Upcoming |
| 2026-12-05 | Newcastle         | 1 - 0         | Sunderland      | 1 - 0 (9.9%), 1 - 1 (11.9%), 2 - 1 (9.8%)   | 53.9%    | 25.6%    | 20.5%    | Home Win      | Upcoming |
| 2026-12-05 | Chelsea           | 1 - 0         | Liverpool       | 1 - 0 (11.0%), 1 - 1 (13.7%), 0 - 0 (9.8%)  | 39.9%    | 28.3%    | 31.8%    | Home Win      | Upcoming |
| 2026-12-05 | Brentford         | 0 - 1         | Manchester City | 0 - 1 (12.0%), 1 - 1 (14.0%), 0 - 0 (11.2%) | 30.3%    | 29.6%    | 40.1%    | Away Win      | Upcoming |
| 2026-12-05 | Bournemouth       | 2 - 1         | Hull            | 2 - 1 (10.0%), 1 - 1 (10.4%), 2 - 0 (9.9%)  | 61.4%    | 22.4%    | 16.2%    | Home Win      | Upcoming |
| 2026-12-05 | Aston Villa       | 1 - 0         | Crystal Palace  | 1 - 0 (10.4%), 1 - 1 (12.2%), 2 - 1 (9.7%)  | 53.4%    | 26.2%    | 20.4%    | Home Win      | Upcoming |
| 2026-12-05 | Nottingham Forest | 1 - 0         | Brighton        | 1 - 0 (8.8%), 1 - 1 (13.5%), 0 - 1 (9.9%)   | 36.2%    | 28.4%    | 35.4%    | Home Win      | Upcoming |
| 2026-12-05 | Everton           | 1 - 0         | Fulham          | 1 - 0 (11.2%), 1 - 1 (13.5%), 0 - 0 (9.5%)  | 44.7%    | 28.6%    | 26.7%    | Home Win      | Upcoming |

### Gameweek 15

| Date       | Home            | Most likely   | Away              | Top 3                                      | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-----------------|---------------|-------------------|--------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-12-12 | Sunderland      | 1 - 0         | Nottingham Forest | 1 - 0 (9.7%), 1 - 1 (13.7%), 0 - 1 (10.0%) | 37.3%    | 28.9%    | 33.8%    | Home Win      | Upcoming |
| 2026-12-12 | Crystal Palace  | 0 - 1         | Manchester United | 0 - 1 (11.2%), 1 - 1 (13.2%), 1 - 2 (9.1%) | 27.1%    | 28.3%    | 44.6%    | Away Win      | Upcoming |
| 2026-12-12 | Hull            | 2 - 1         | Tottenham         | 2 - 1 (8.2%), 1 - 1 (11.8%), 1 - 2 (8.6%)  | 36.5%    | 28.4%    | 35.1%    | Home Win      | Upcoming |
| 2026-12-12 | Brighton        | 2 - 1         | Everton           | 2 - 1 (9.1%), 1 - 1 (11.7%), 1 - 2 (7.6%)  | 47.0%    | 26.1%    | 26.9%    | Home Win      | Upcoming |
| 2026-12-12 | Ipswich         | 1 - 2         | Newcastle         | 1 - 2 (9.8%), 1 - 1 (10.0%), 0 - 2 (8.4%)  | 19.3%    | 22.9%    | 57.8%    | Away Win      | Upcoming |
| 2026-12-12 | Coventry        | 1 - 2         | Aston Villa       | 1 - 2 (9.6%), 1 - 1 (8.6%), 0 - 2 (8.6%)   | 15.9%    | 23.5%    | 60.6%    | Away Win      | Upcoming |
| 2026-12-12 | Arsenal         | 2 - 1         | Bournemouth       | 2 - 1 (9.5%), 1 - 1 (12.1%), 1 - 0 (9.1%)  | 52.9%    | 25.4%    | 21.7%    | Home Win      | Upcoming |
| 2026-12-12 | Manchester City | 2 - 0         | Chelsea           | 2 - 0 (12.7%), 1 - 0 (11.7%), 1 - 1 (9.8%) | 67.4%    | 19.6%    | 13.0%    | Home Win      | Upcoming |
| 2026-12-12 | Liverpool       | 2 - 1         | Leeds             | 2 - 1 (9.8%), 1 - 1 (10.9%), 2 - 0 (8.3%)  | 54.7%    | 24.2%    | 21.1%    | Home Win      | Upcoming |
| 2026-12-12 | Fulham          | 1 - 0         | Brentford         | 1 - 0 (8.7%), 1 - 1 (12.9%), 2 - 1 (8.6%)  | 42.8%    | 26.5%    | 30.7%    | Home Win      | Upcoming |

### Gameweek 16

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-12-19 | Leeds             | 1 - 0         | Fulham            | 1 - 0 (10.9%), 1 - 1 (13.5%), 0 - 0 (9.2%)  | 45.0%    | 29.3%    | 25.7%    | Home Win      | Upcoming |
| 2026-12-19 | Brighton          | 2 - 1         | Ipswich           | 2 - 1 (9.9%), 1 - 1 (11.3%), 1 - 0 (9.5%)   | 59.4%    | 24.6%    | 16.0%    | Home Win      | Upcoming |
| 2026-12-19 | Nottingham Forest | 1 - 0         | Everton           | 1 - 0 (8.2%), 1 - 1 (13.1%), 0 - 1 (9.0%)   | 39.7%    | 27.8%    | 32.5%    | Home Win      | Upcoming |
| 2026-12-19 | Brentford         | 1 - 0         | Newcastle         | 1 - 0 (10.8%), 1 - 1 (12.1%), 2 - 0 (9.8%)  | 51.8%    | 25.9%    | 22.3%    | Home Win      | Upcoming |
| 2026-12-19 | Manchester City   | 2 - 0         | Hull              | 2 - 0 (10.4%), 2 - 1 (9.8%), 1 - 1 (9.2%)   | 66.5%    | 19.4%    | 14.1%    | Home Win      | Upcoming |
| 2026-12-19 | Sunderland        | 1 - 0         | Crystal Palace    | 1 - 0 (11.1%), 1 - 1 (12.8%), 2 - 1 (9.4%)  | 46.3%    | 28.6%    | 25.1%    | Home Win      | Upcoming |
| 2026-12-19 | Bournemouth       | 2 - 1         | Coventry          | 2 - 1 (9.9%), 1 - 1 (11.3%), 1 - 0 (9.8%)   | 61.7%    | 23.6%    | 14.7%    | Home Win      | Upcoming |
| 2026-12-19 | Arsenal           | 2 - 1         | Manchester United | 2 - 1 (9.7%), 1 - 1 (11.8%), 1 - 0 (9.1%)   | 52.9%    | 25.7%    | 21.4%    | Home Win      | Upcoming |
| 2026-12-19 | Liverpool         | 2 - 0         | Tottenham         | 2 - 0 (10.8%), 1 - 1 (11.1%), 1 - 0 (10.8%) | 63.1%    | 23.5%    | 13.4%    | Home Win      | Upcoming |
| 2026-12-19 | Chelsea           | 1 - 0         | Aston Villa       | 1 - 0 (10.7%), 1 - 1 (13.4%), 0 - 0 (9.0%)  | 42.9%    | 29.5%    | 27.6%    | Home Win      | Upcoming |

### Gameweek 17

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-12-26 | Aston Villa       | 1 - 0         | Leeds             | 1 - 0 (11.5%), 1 - 1 (11.9%), 2 - 0 (10.6%) | 55.8%    | 25.4%    | 18.8%    | Home Win      | Upcoming |
| 2026-12-26 | Manchester United | 2 - 1         | Nottingham Forest | 2 - 1 (9.7%), 1 - 1 (11.8%), 1 - 0 (9.4%)   | 50.5%    | 25.0%    | 24.5%    | Home Win      | Upcoming |
| 2026-12-26 | Crystal Palace    | 0 - 1         | Arsenal           | 0 - 1 (11.1%), 1 - 1 (12.4%), 0 - 2 (9.8%)  | 25.0%    | 26.5%    | 48.5%    | Away Win      | Upcoming |
| 2026-12-26 | Everton           | 1 - 0         | Sunderland        | 1 - 0 (10.4%), 1 - 1 (12.2%), 2 - 1 (9.7%)  | 54.6%    | 25.1%    | 20.3%    | Home Win      | Upcoming |
| 2026-12-26 | Coventry          | 1 - 2         | Chelsea           | 1 - 2 (9.7%), 1 - 1 (9.4%), 0 - 2 (8.3%)    | 20.1%    | 23.3%    | 56.6%    | Away Win      | Upcoming |
| 2026-12-26 | Newcastle         | 0 - 1         | Manchester City   | 0 - 1 (11.1%), 1 - 1 (13.9%), 0 - 0 (10.5%) | 33.5%    | 28.8%    | 37.7%    | Away Win      | Upcoming |
| 2026-12-26 | Fulham            | 1 - 0         | Brighton          | 1 - 0 (10.0%), 1 - 1 (13.0%), 2 - 1 (9.1%)  | 44.4%    | 27.5%    | 28.1%    | Home Win      | Upcoming |
| 2026-12-26 | Tottenham         | 1 - 0         | Bournemouth       | 1 - 0 (10.2%), 1 - 1 (13.8%), 0 - 1 (9.9%)  | 38.6%    | 28.3%    | 33.1%    | Home Win      | Upcoming |
| 2026-12-26 | Hull              | 1 - 2         | Liverpool         | 1 - 2 (9.3%), 1 - 1 (10.9%), 2 - 1 (7.1%)   | 30.4%    | 26.9%    | 42.7%    | Away Win      | Upcoming |
| 2026-12-26 | Ipswich           | 0 - 1         | Brentford         | 0 - 1 (10.3%), 1 - 1 (11.7%), 1 - 2 (9.8%)  | 17.3%    | 23.6%    | 59.1%    | Away Win      | Upcoming |

### Gameweek 18

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2026-12-30 | Fulham            | 1 - 2         | Arsenal           | 1 - 2 (8.9%), 1 - 1 (12.4%), 0 - 1 (8.2%)   | 35.9%    | 26.2%    | 37.9%    | Away Win      | Upcoming |
| 2026-12-30 | Coventry          | 1 - 2         | Brentford         | 1 - 2 (9.8%), 1 - 1 (10.1%), 0 - 2 (8.5%)   | 21.0%    | 24.8%    | 54.2%    | Away Win      | Upcoming |
| 2026-12-30 | Aston Villa       | 1 - 0         | Liverpool         | 1 - 0 (10.3%), 1 - 1 (13.3%), 2 - 1 (8.9%)  | 39.9%    | 28.9%    | 31.2%    | Home Win      | Upcoming |
| 2026-12-30 | Newcastle         | 1 - 0         | Nottingham Forest | 1 - 0 (11.5%), 1 - 1 (13.4%), 0 - 0 (9.4%)  | 46.8%    | 27.4%    | 25.8%    | Home Win      | Upcoming |
| 2026-12-30 | Hull              | 1 - 2         | Leeds             | 1 - 2 (8.8%), 1 - 1 (12.0%), 2 - 1 (7.9%)   | 35.9%    | 27.5%    | 36.6%    | Away Win      | Upcoming |
| 2026-12-30 | Manchester United | 2 - 0         | Sunderland        | 2 - 0 (10.1%), 2 - 1 (9.9%), 1 - 1 (9.8%)   | 61.2%    | 21.8%    | 17.0%    | Home Win      | Upcoming |
| 2026-12-30 | Ipswich           | 1 - 2         | Chelsea           | 1 - 2 (9.9%), 1 - 1 (10.1%), 0 - 2 (9.6%)   | 15.9%    | 21.7%    | 62.4%    | Away Win      | Upcoming |
| 2026-12-30 | Tottenham         | 1 - 0         | Brighton          | 1 - 0 (11.5%), 1 - 1 (13.8%), 0 - 0 (10.1%) | 42.5%    | 28.0%    | 29.5%    | Home Win      | Upcoming |
| 2026-12-30 | Everton           | 0 - 1         | Manchester City   | 0 - 1 (12.4%), 1 - 1 (13.6%), 0 - 0 (10.5%) | 27.1%    | 27.9%    | 45.0%    | Away Win      | Upcoming |
| 2026-12-30 | Crystal Palace    | 0 - 1         | Bournemouth       | 0 - 1 (11.5%), 1 - 1 (13.6%), 0 - 0 (9.9%)  | 30.8%    | 27.8%    | 41.4%    | Away Win      | Upcoming |

### Gameweek 19

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-01-02 | Bournemouth       | 1 - 0         | Aston Villa       | 1 - 0 (11.5%), 1 - 1 (13.4%), 0 - 0 (9.4%)  | 47.0%    | 27.9%    | 25.1%    | Home Win      | Upcoming |
| 2027-01-02 | Brentford         | 1 - 0         | Crystal Palace    | 1 - 0 (11.1%), 1 - 1 (13.6%), 0 - 0 (9.5%)  | 45.0%    | 28.8%    | 26.2%    | Home Win      | Upcoming |
| 2027-01-02 | Leeds             | 1 - 0         | Everton           | 1 - 0 (11.1%), 1 - 1 (13.8%), 0 - 0 (10.0%) | 42.7%    | 28.5%    | 28.8%    | Home Win      | Upcoming |
| 2027-01-02 | Arsenal           | 2 - 0         | Ipswich           | 2 - 0 (10.1%), 1 - 1 (10.5%), 2 - 1 (10.0%) | 69.0%    | 20.5%    | 10.5%    | Home Win      | Upcoming |
| 2027-01-02 | Sunderland        | 1 - 0         | Hull              | 1 - 0 (10.1%), 1 - 1 (11.4%), 2 - 0 (9.9%)  | 58.7%    | 23.7%    | 17.6%    | Home Win      | Upcoming |
| 2027-01-02 | Liverpool         | 2 - 0         | Coventry          | 2 - 0 (10.1%), 1 - 1 (10.4%), 2 - 1 (10.0%) | 64.3%    | 22.6%    | 13.1%    | Home Win      | Upcoming |
| 2027-01-02 | Chelsea           | 1 - 0         | Newcastle         | 1 - 0 (9.8%), 1 - 1 (11.8%), 2 - 1 (9.8%)   | 51.6%    | 25.3%    | 23.1%    | Home Win      | Upcoming |
| 2027-01-02 | Nottingham Forest | 1 - 0         | Fulham            | 1 - 0 (9.0%), 1 - 1 (13.5%), 0 - 1 (9.7%)   | 38.8%    | 28.2%    | 33.0%    | Home Win      | Upcoming |
| 2027-01-02 | Brighton          | 2 - 1         | Manchester United | 2 - 1 (9.0%), 1 - 1 (12.7%), 1 - 0 (8.8%)   | 42.1%    | 26.9%    | 31.0%    | Home Win      | Upcoming |
| 2027-01-02 | Manchester City   | 2 - 0         | Tottenham         | 2 - 0 (11.5%), 1 - 0 (11.0%), 1 - 1 (10.6%) | 70.0%    | 20.3%    | 9.7%     | Home Win      | Upcoming |

### Gameweek 20

| Date       | Home              | Most likely   | Away            | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-----------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-01-06 | Arsenal           | 2 - 1         | Brentford       | 2 - 1 (9.9%), 1 - 1 (11.5%), 1 - 0 (9.5%)   | 54.3%    | 24.8%    | 20.9%    | Home Win      | Upcoming |
| 2027-01-06 | Leeds             | 0 - 1         | Manchester City | 0 - 1 (12.9%), 1 - 1 (13.6%), 0 - 0 (10.8%) | 26.3%    | 29.3%    | 44.4%    | Away Win      | Upcoming |
| 2027-01-06 | Manchester United | 2 - 1         | Newcastle       | 2 - 1 (9.8%), 1 - 1 (11.1%), 2 - 0 (8.3%)   | 53.5%    | 23.4%    | 23.1%    | Home Win      | Upcoming |
| 2027-01-06 | Brighton          | 2 - 1         | Bournemouth     | 2 - 1 (8.8%), 1 - 1 (12.8%), 1 - 0 (8.6%)   | 42.9%    | 27.2%    | 29.9%    | Home Win      | Upcoming |
| 2027-01-06 | Nottingham Forest | 2 - 1         | Hull            | 2 - 1 (9.8%), 1 - 1 (11.2%), 1 - 0 (8.5%)   | 56.5%    | 23.4%    | 20.1%    | Home Win      | Upcoming |
| 2027-01-06 | Fulham            | 1 - 0         | Tottenham       | 1 - 0 (10.0%), 1 - 1 (13.4%), 0 - 0 (8.7%)  | 45.1%    | 27.8%    | 27.1%    | Home Win      | Upcoming |
| 2027-01-06 | Everton           | 1 - 0         | Aston Villa     | 1 - 0 (10.0%), 1 - 1 (13.7%), 0 - 1 (9.3%)  | 39.4%    | 29.2%    | 31.4%    | Home Win      | Upcoming |
| 2027-01-06 | Sunderland        | 0 - 1         | Liverpool       | 0 - 1 (12.6%), 1 - 1 (14.2%), 0 - 0 (12.3%) | 32.1%    | 30.4%    | 37.5%    | Away Win      | Upcoming |
| 2027-01-06 | Crystal Palace    | 0 - 1         | Chelsea         | 0 - 1 (11.0%), 1 - 1 (13.8%), 0 - 0 (10.0%) | 32.6%    | 26.9%    | 40.5%    | Away Win      | Upcoming |
| 2027-01-06 | Ipswich           | 2 - 1         | Coventry        | 2 - 1 (8.9%), 1 - 1 (12.2%), 1 - 0 (7.8%)   | 43.6%    | 27.1%    | 29.3%    | Home Win      | Upcoming |

### Gameweek 21

| Date       | Home            | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-----------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-01-16 | Bournemouth     | 1 - 0         | Ipswich           | 1 - 0 (11.2%), 1 - 1 (11.8%), 2 - 0 (10.4%) | 59.6%    | 24.8%    | 15.6%    | Home Win      | Upcoming |
| 2027-01-16 | Manchester City | 1 - 0         | Nottingham Forest | 1 - 0 (12.6%), 2 - 0 (12.1%), 1 - 1 (11.2%) | 58.7%    | 23.9%    | 17.4%    | Home Win      | Upcoming |
| 2027-01-16 | Chelsea         | 2 - 1         | Sunderland        | 2 - 1 (9.9%), 1 - 1 (11.2%), 2 - 0 (9.3%)   | 57.2%    | 24.4%    | 18.4%    | Home Win      | Upcoming |
| 2027-01-16 | Brentford       | 1 - 0         | Brighton          | 1 - 0 (11.6%), 1 - 1 (13.6%), 0 - 0 (9.9%)  | 43.0%    | 28.8%    | 28.2%    | Home Win      | Upcoming |
| 2027-01-16 | Aston Villa     | 0 - 1         | Manchester United | 0 - 1 (9.0%), 1 - 1 (13.4%), 1 - 0 (9.2%)   | 35.6%    | 28.8%    | 35.6%    | Away Win      | Upcoming |
| 2027-01-16 | Tottenham       | 1 - 0         | Leeds             | 1 - 0 (10.7%), 1 - 1 (13.1%), 2 - 1 (9.1%)  | 47.1%    | 27.4%    | 25.5%    | Home Win      | Upcoming |
| 2027-01-16 | Coventry        | 1 - 2         | Everton           | 1 - 2 (9.8%), 1 - 1 (9.7%), 0 - 2 (8.4%)    | 19.8%    | 24.4%    | 55.8%    | Away Win      | Upcoming |
| 2027-01-16 | Liverpool       | 1 - 0         | Crystal Palace    | 1 - 0 (9.8%), 1 - 1 (12.0%), 2 - 1 (9.7%)   | 53.3%    | 25.7%    | 21.0%    | Home Win      | Upcoming |
| 2027-01-16 | Hull            | 1 - 2         | Arsenal           | 1 - 2 (9.3%), 1 - 1 (10.9%), 2 - 1 (7.0%)   | 28.9%    | 26.4%    | 44.7%    | Away Win      | Upcoming |
| 2027-01-16 | Newcastle       | 1 - 0         | Fulham            | 1 - 0 (11.5%), 1 - 1 (11.8%), 2 - 0 (10.7%) | 55.0%    | 25.6%    | 19.4%    | Home Win      | Upcoming |

### Gameweek 22

| Date       | Home              | Most likely   | Away            | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-----------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-01-23 | Ipswich           | 1 - 0         | Hull            | 1 - 0 (8.7%), 1 - 1 (13.1%), 2 - 1 (8.4%)   | 42.7%    | 26.7%    | 30.6%    | Home Win      | Upcoming |
| 2027-01-23 | Everton           | 1 - 0         | Brentford       | 1 - 0 (8.6%), 1 - 1 (13.0%), 2 - 1 (8.4%)   | 39.7%    | 27.1%    | 33.2%    | Home Win      | Upcoming |
| 2027-01-23 | Sunderland        | 1 - 0         | Coventry        | 1 - 0 (12.4%), 1 - 1 (12.7%), 2 - 0 (10.2%) | 55.1%    | 27.1%    | 17.8%    | Home Win      | Upcoming |
| 2027-01-23 | Nottingham Forest | 0 - 1         | Bournemouth     | 0 - 1 (12.1%), 1 - 1 (13.9%), 0 - 0 (10.9%) | 35.1%    | 28.3%    | 36.6%    | Away Win      | Upcoming |
| 2027-01-23 | Arsenal           | 2 - 1         | Newcastle       | 2 - 1 (9.9%), 1 - 1 (10.9%), 2 - 0 (9.5%)   | 59.1%    | 23.7%    | 17.2%    | Home Win      | Upcoming |
| 2027-01-23 | Leeds             | 1 - 0         | Chelsea         | 1 - 0 (11.6%), 1 - 1 (14.1%), 0 - 0 (11.5%) | 38.7%    | 28.9%    | 32.4%    | Home Win      | Upcoming |
| 2027-01-23 | Fulham            | 1 - 0         | Aston Villa     | 1 - 0 (9.4%), 1 - 1 (13.0%), 2 - 1 (8.9%)   | 43.6%    | 27.4%    | 29.0%    | Home Win      | Upcoming |
| 2027-01-23 | Manchester United | 2 - 1         | Liverpool       | 2 - 1 (9.2%), 1 - 1 (12.6%), 1 - 0 (9.0%)   | 43.5%    | 26.1%    | 30.4%    | Home Win      | Upcoming |
| 2027-01-23 | Brighton          | 1 - 0         | Manchester City | 1 - 0 (9.4%), 1 - 1 (13.0%), 2 - 1 (8.9%)   | 39.3%    | 27.0%    | 33.7%    | Home Win      | Upcoming |
| 2027-01-23 | Crystal Palace    | 1 - 0         | Tottenham       | 1 - 0 (10.4%), 1 - 1 (13.9%), 0 - 1 (10.3%) | 41.3%    | 30.0%    | 28.7%    | Home Win      | Upcoming |

### Gameweek 23

| Date       | Home            | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-----------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-01-30 | Tottenham       | 1 - 0         | Sunderland        | 1 - 0 (10.6%), 1 - 1 (12.6%), 2 - 1 (9.5%)  | 51.2%    | 26.1%    | 22.7%    | Home Win      | Upcoming |
| 2027-01-30 | Brentford       | 0 - 1         | Manchester United | 0 - 1 (11.2%), 1 - 1 (14.1%), 0 - 0 (11.4%) | 33.9%    | 29.1%    | 37.0%    | Away Win      | Upcoming |
| 2027-01-30 | Newcastle       | 2 - 1         | Brighton          | 2 - 1 (9.9%), 1 - 1 (11.1%), 2 - 0 (9.4%)   | 52.0%    | 25.5%    | 22.5%    | Home Win      | Upcoming |
| 2027-01-30 | Hull            | 2 - 1         | Crystal Palace    | 2 - 1 (8.2%), 1 - 1 (12.0%), 1 - 2 (8.5%)   | 37.1%    | 27.7%    | 35.2%    | Home Win      | Upcoming |
| 2027-01-30 | Coventry        | 1 - 2         | Leeds             | 1 - 2 (9.7%), 1 - 1 (11.5%), 0 - 1 (8.5%)   | 24.6%    | 26.7%    | 48.7%    | Away Win      | Upcoming |
| 2027-01-30 | Bournemouth     | 1 - 0         | Fulham            | 1 - 0 (12.1%), 1 - 1 (12.9%), 2 - 0 (9.8%)  | 51.6%    | 26.5%    | 21.9%    | Home Win      | Upcoming |
| 2027-01-30 | Chelsea         | 1 - 0         | Nottingham Forest | 1 - 0 (10.9%), 1 - 1 (13.2%), 2 - 1 (9.1%)  | 45.3%    | 27.9%    | 26.8%    | Home Win      | Upcoming |
| 2027-01-30 | Liverpool       | 2 - 1         | Everton           | 2 - 1 (9.5%), 1 - 1 (12.1%), 1 - 0 (9.1%)   | 48.4%    | 25.5%    | 26.1%    | Home Win      | Upcoming |
| 2027-01-30 | Manchester City | 2 - 1         | Arsenal           | 2 - 1 (8.8%), 1 - 1 (12.3%), 1 - 2 (7.9%)   | 44.2%    | 26.5%    | 29.3%    | Home Win      | Upcoming |
| 2027-01-30 | Aston Villa     | 1 - 0         | Ipswich           | 1 - 0 (11.1%), 1 - 1 (11.4%), 2 - 0 (10.7%) | 63.0%    | 23.4%    | 13.6%    | Home Win      | Upcoming |

### Gameweek 24

| Date       | Home              | Most likely   | Away            | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-----------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-02-06 | Arsenal           | 1 - 0         | Liverpool       | 1 - 0 (10.1%), 1 - 1 (12.6%), 2 - 1 (9.4%)  | 49.4%    | 26.6%    | 24.0%    | Home Win      | Upcoming |
| 2027-02-06 | Brighton          | 2 - 1         | Hull            | 2 - 1 (9.8%), 1 - 1 (10.2%), 2 - 0 (8.3%)   | 57.6%    | 23.0%    | 19.4%    | Home Win      | Upcoming |
| 2027-02-06 | Sunderland        | 1 - 0         | Aston Villa     | 1 - 0 (10.3%), 1 - 1 (14.0%), 0 - 1 (10.6%) | 37.2%    | 30.5%    | 32.3%    | Home Win      | Upcoming |
| 2027-02-06 | Crystal Palace    | 2 - 1         | Coventry        | 2 - 1 (9.6%), 1 - 1 (11.7%), 1 - 0 (8.6%)   | 55.2%    | 25.5%    | 19.3%    | Home Win      | Upcoming |
| 2027-02-06 | Ipswich           | 1 - 2         | Tottenham       | 1 - 2 (9.8%), 1 - 1 (11.5%), 0 - 1 (9.1%)   | 18.0%    | 24.6%    | 57.4%    | Away Win      | Upcoming |
| 2027-02-06 | Everton           | 1 - 0         | Newcastle       | 1 - 0 (10.7%), 1 - 1 (13.9%), 0 - 0 (10.2%) | 38.0%    | 27.6%    | 34.4%    | Home Win      | Upcoming |
| 2027-02-06 | Fulham            | 2 - 1         | Manchester City | 2 - 1 (8.0%), 1 - 1 (12.9%), 0 - 1 (8.5%)   | 36.7%    | 26.9%    | 36.4%    | Home Win      | Upcoming |
| 2027-02-06 | Leeds             | 1 - 0         | Bournemouth     | 1 - 0 (10.4%), 1 - 1 (13.8%), 0 - 0 (9.8%)  | 42.7%    | 28.4%    | 28.9%    | Home Win      | Upcoming |
| 2027-02-06 | Manchester United | 2 - 1         | Chelsea         | 2 - 1 (9.6%), 1 - 1 (11.4%), 1 - 0 (8.2%)   | 52.5%    | 23.6%    | 23.9%    | Home Win      | Upcoming |
| 2027-02-06 | Nottingham Forest | 0 - 1         | Brentford       | 0 - 1 (9.6%), 1 - 1 (12.9%), 1 - 2 (9.0%)   | 35.1%    | 27.4%    | 37.5%    | Away Win      | Upcoming |

### Gameweek 25

| Date       | Home              | Most likely   | Away              | Top 3                                      | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|--------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-02-10 | Everton           | 1 - 0         | Leeds             | 1 - 0 (9.8%), 1 - 1 (13.7%), 0 - 1 (9.6%)  | 41.1%    | 28.2%    | 30.7%    | Home Win      | Upcoming |
| 2027-02-10 | Coventry          | 1 - 2         | Liverpool         | 1 - 2 (9.7%), 0 - 2 (9.5%), 1 - 1 (8.9%)   | 16.0%    | 23.6%    | 60.4%    | Away Win      | Upcoming |
| 2027-02-10 | Hull              | 1 - 2         | Sunderland        | 1 - 2 (8.8%), 1 - 1 (12.0%), 2 - 1 (8.0%)  | 36.2%    | 27.2%    | 36.6%    | Away Win      | Upcoming |
| 2027-02-10 | Aston Villa       | 1 - 0         | Bournemouth       | 1 - 0 (9.2%), 1 - 1 (12.7%), 2 - 1 (9.1%)  | 43.2%    | 27.7%    | 29.1%    | Home Win      | Upcoming |
| 2027-02-10 | Crystal Palace    | 0 - 1         | Brentford         | 0 - 1 (10.8%), 1 - 1 (13.5%), 0 - 0 (9.3%) | 31.0%    | 27.7%    | 41.3%    | Away Win      | Upcoming |
| 2027-02-10 | Newcastle         | 1 - 0         | Chelsea           | 1 - 0 (10.2%), 1 - 1 (11.4%), 2 - 0 (9.9%) | 53.1%    | 25.9%    | 21.0%    | Home Win      | Upcoming |
| 2027-02-10 | Fulham            | 2 - 1         | Nottingham Forest | 2 - 1 (8.7%), 1 - 1 (12.7%), 1 - 0 (8.2%)  | 41.7%    | 27.2%    | 31.1%    | Home Win      | Upcoming |
| 2027-02-10 | Tottenham         | 1 - 2         | Manchester City   | 1 - 2 (9.1%), 1 - 1 (12.4%), 0 - 1 (8.5%)  | 29.5%    | 27.7%    | 42.8%    | Away Win      | Upcoming |
| 2027-02-10 | Manchester United | 2 - 1         | Brighton          | 2 - 1 (9.5%), 1 - 1 (11.9%), 1 - 0 (8.7%)  | 48.3%    | 25.4%    | 26.3%    | Home Win      | Upcoming |
| 2027-02-10 | Ipswich           | 0 - 1         | Arsenal           | 0 - 1 (9.9%), 1 - 1 (11.5%), 1 - 2 (9.9%)  | 17.9%    | 24.0%    | 58.1%    | Away Win      | Upcoming |

### Gameweek 26

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-02-20 | Manchester City   | 2 - 0         | Newcastle         | 2 - 0 (12.8%), 1 - 0 (12.2%), 1 - 1 (10.2%) | 66.2%    | 20.2%    | 13.6%    | Home Win      | Upcoming |
| 2027-02-20 | Bournemouth       | 1 - 0         | Crystal Palace    | 1 - 0 (9.6%), 1 - 1 (12.7%), 2 - 1 (9.3%)   | 48.1%    | 27.2%    | 24.7%    | Home Win      | Upcoming |
| 2027-02-20 | Brentford         | 1 - 0         | Coventry          | 1 - 0 (10.5%), 1 - 1 (11.9%), 2 - 1 (9.8%)  | 57.5%    | 25.6%    | 16.9%    | Home Win      | Upcoming |
| 2027-02-20 | Chelsea           | 1 - 0         | Ipswich           | 1 - 0 (10.9%), 1 - 1 (12.3%), 2 - 0 (9.7%)  | 57.9%    | 25.6%    | 16.5%    | Home Win      | Upcoming |
| 2027-02-20 | Liverpool         | 2 - 1         | Hull              | 2 - 1 (9.7%), 2 - 0 (9.4%), 1 - 1 (9.0%)    | 66.0%    | 20.0%    | 14.0%    | Home Win      | Upcoming |
| 2027-02-20 | Arsenal           | 1 - 0         | Fulham            | 1 - 0 (10.0%), 1 - 1 (11.9%), 2 - 1 (9.8%)  | 59.8%    | 24.0%    | 16.2%    | Home Win      | Upcoming |
| 2027-02-20 | Nottingham Forest | 0 - 1         | Manchester United | 0 - 1 (12.3%), 1 - 1 (13.7%), 0 - 0 (10.6%) | 30.7%    | 28.3%    | 41.0%    | Away Win      | Upcoming |
| 2027-02-20 | Brighton          | 1 - 0         | Tottenham         | 1 - 0 (10.2%), 1 - 1 (12.2%), 2 - 1 (9.7%)  | 55.3%    | 25.3%    | 19.4%    | Home Win      | Upcoming |
| 2027-02-20 | Sunderland        | 1 - 0         | Everton           | 1 - 0 (12.4%), 1 - 1 (14.0%), 0 - 0 (11.5%) | 40.7%    | 28.8%    | 30.5%    | Home Win      | Upcoming |
| 2027-02-20 | Leeds             | 1 - 0         | Aston Villa       | 1 - 0 (10.9%), 1 - 1 (14.1%), 0 - 0 (11.1%) | 39.2%    | 30.7%    | 30.1%    | Home Win      | Upcoming |

### Gameweek 27

| Date       | Home              | Most likely   | Away              | Top 3                                      | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|--------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-02-27 | Crystal Palace    | 2 - 1         | Sunderland        | 2 - 1 (9.8%), 1 - 1 (11.6%), 1 - 0 (9.1%)  | 54.7%    | 24.3%    | 21.0%    | Home Win      | Upcoming |
| 2027-02-27 | Manchester United | 2 - 1         | Arsenal           | 2 - 1 (8.6%), 1 - 1 (12.1%), 1 - 2 (8.2%)  | 37.3%    | 25.6%    | 37.1%    | Home Win      | Upcoming |
| 2027-02-27 | Ipswich           | 1 - 2         | Brighton          | 1 - 2 (9.9%), 1 - 1 (10.0%), 0 - 2 (9.5%)  | 15.6%    | 22.0%    | 62.4%    | Away Win      | Upcoming |
| 2027-02-27 | Coventry          | 1 - 2         | Bournemouth       | 1 - 2 (9.9%), 1 - 1 (10.0%), 0 - 2 (9.2%)  | 18.8%    | 24.0%    | 57.2%    | Away Win      | Upcoming |
| 2027-02-27 | Everton           | 1 - 0         | Nottingham Forest | 1 - 0 (9.8%), 1 - 1 (13.6%), 0 - 1 (9.1%)  | 40.9%    | 28.6%    | 30.5%    | Home Win      | Upcoming |
| 2027-02-27 | Fulham            | 1 - 0         | Leeds             | 1 - 0 (9.8%), 1 - 1 (13.2%), 2 - 1 (8.8%)  | 44.1%    | 27.4%    | 28.5%    | Home Win      | Upcoming |
| 2027-02-27 | Aston Villa       | 1 - 0         | Chelsea           | 1 - 0 (10.4%), 1 - 1 (12.2%), 2 - 1 (9.7%) | 48.9%    | 26.1%    | 25.0%    | Home Win      | Upcoming |
| 2027-02-27 | Tottenham         | 0 - 1         | Liverpool         | 0 - 1 (9.3%), 1 - 1 (13.3%), 1 - 0 (8.5%)  | 35.0%    | 28.6%    | 36.4%    | Away Win      | Upcoming |
| 2027-02-27 | Newcastle         | 2 - 1         | Brentford         | 2 - 1 (9.7%), 1 - 1 (11.2%), 1 - 0 (8.3%)  | 50.5%    | 25.2%    | 24.3%    | Home Win      | Upcoming |
| 2027-02-27 | Hull              | 1 - 2         | Manchester City   | 1 - 2 (9.2%), 1 - 1 (11.3%), 2 - 1 (7.4%)  | 30.3%    | 27.4%    | 42.3%    | Away Win      | Upcoming |

### Gameweek 28

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-03-03 | Nottingham Forest | 1 - 0         | Newcastle         | 1 - 0 (9.1%), 1 - 1 (13.5%), 0 - 1 (9.5%)   | 36.9%    | 27.4%    | 35.7%    | Home Win      | Upcoming |
| 2027-03-03 | Bournemouth       | 1 - 0         | Tottenham         | 1 - 0 (11.0%), 1 - 1 (12.9%), 2 - 1 (9.3%)  | 52.3%    | 27.0%    | 20.7%    | Home Win      | Upcoming |
| 2027-03-03 | Manchester City   | 1 - 0         | Everton           | 1 - 0 (12.3%), 2 - 0 (12.1%), 1 - 1 (11.0%) | 59.3%    | 23.1%    | 17.6%    | Home Win      | Upcoming |
| 2027-03-03 | Arsenal           | 2 - 1         | Crystal Palace    | 2 - 1 (9.8%), 1 - 1 (11.6%), 1 - 0 (9.1%)   | 55.7%    | 24.8%    | 19.5%    | Home Win      | Upcoming |
| 2027-03-03 | Leeds             | 2 - 1         | Hull              | 2 - 1 (9.8%), 1 - 1 (11.4%), 1 - 0 (9.2%)   | 57.3%    | 24.4%    | 18.3%    | Home Win      | Upcoming |
| 2027-03-03 | Sunderland        | 0 - 1         | Manchester United | 0 - 1 (12.0%), 1 - 1 (13.7%), 0 - 0 (10.4%) | 30.4%    | 29.4%    | 40.2%    | Away Win      | Upcoming |
| 2027-03-03 | Liverpool         | 1 - 0         | Aston Villa       | 1 - 0 (11.3%), 1 - 1 (12.3%), 2 - 0 (10.0%) | 56.1%    | 25.3%    | 18.6%    | Home Win      | Upcoming |
| 2027-03-03 | Brighton          | 1 - 0         | Fulham            | 1 - 0 (10.2%), 1 - 1 (12.6%), 2 - 1 (9.4%)  | 51.9%    | 26.2%    | 21.9%    | Home Win      | Upcoming |
| 2027-03-03 | Brentford         | 1 - 0         | Ipswich           | 1 - 0 (11.3%), 1 - 1 (12.3%), 2 - 0 (9.9%)  | 58.1%    | 25.7%    | 16.2%    | Home Win      | Upcoming |
| 2027-03-03 | Chelsea           | 1 - 0         | Coventry          | 1 - 0 (9.8%), 1 - 1 (11.9%), 2 - 1 (9.8%)   | 60.0%    | 24.9%    | 15.1%    | Home Win      | Upcoming |

### Gameweek 29

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-03-13 | Leeds             | 1 - 0         | Brighton          | 1 - 0 (11.4%), 1 - 1 (13.9%), 0 - 0 (10.4%) | 43.1%    | 29.4%    | 27.5%    | Home Win      | Upcoming |
| 2027-03-13 | Tottenham         | 1 - 0         | Nottingham Forest | 1 - 0 (9.3%), 1 - 1 (13.4%), 0 - 1 (9.0%)   | 41.5%    | 27.6%    | 30.9%    | Home Win      | Upcoming |
| 2027-03-13 | Crystal Palace    | 1 - 0         | Fulham            | 1 - 0 (9.7%), 1 - 1 (13.8%), 0 - 1 (10.1%)  | 38.8%    | 28.7%    | 32.5%    | Home Win      | Upcoming |
| 2027-03-13 | Liverpool         | 2 - 0         | Ipswich           | 2 - 0 (11.1%), 1 - 0 (10.0%), 1 - 1 (10.0%) | 67.4%    | 21.5%    | 11.1%    | Home Win      | Upcoming |
| 2027-03-13 | Coventry          | 1 - 2         | Manchester City   | 1 - 2 (9.9%), 1 - 1 (10.5%), 0 - 2 (9.2%)   | 19.6%    | 25.3%    | 55.1%    | Away Win      | Upcoming |
| 2027-03-13 | Bournemouth       | 1 - 0         | Newcastle         | 1 - 0 (10.7%), 1 - 1 (11.6%), 2 - 0 (10.2%) | 54.6%    | 24.6%    | 20.8%    | Home Win      | Upcoming |
| 2027-03-13 | Chelsea           | 0 - 1         | Arsenal           | 0 - 1 (10.7%), 1 - 1 (12.7%), 1 - 2 (9.4%)  | 26.6%    | 27.6%    | 45.8%    | Away Win      | Upcoming |
| 2027-03-13 | Aston Villa       | 2 - 1         | Hull              | 2 - 1 (9.9%), 1 - 1 (10.1%), 2 - 0 (9.0%)   | 59.9%    | 22.2%    | 17.9%    | Home Win      | Upcoming |
| 2027-03-13 | Manchester United | 2 - 1         | Everton           | 2 - 1 (9.7%), 1 - 1 (11.6%), 1 - 0 (9.0%)   | 48.6%    | 25.4%    | 26.0%    | Home Win      | Upcoming |
| 2027-03-13 | Sunderland        | 1 - 0         | Brentford         | 1 - 0 (9.9%), 1 - 1 (12.6%), 2 - 1 (9.4%)   | 44.8%    | 27.3%    | 27.9%    | Home Win      | Upcoming |

### Gameweek 30

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-03-20 | Brentford         | 1 - 0         | Bournemouth       | 1 - 0 (10.8%), 1 - 1 (13.8%), 0 - 0 (9.9%)  | 40.7%    | 28.1%    | 31.2%    | Home Win      | Upcoming |
| 2027-03-20 | Brighton          | 2 - 1         | Coventry          | 2 - 1 (9.8%), 1 - 1 (11.2%), 2 - 0 (8.6%)   | 60.3%    | 24.2%    | 15.5%    | Home Win      | Upcoming |
| 2027-03-20 | Manchester City   | 1 - 0         | Manchester United | 1 - 0 (11.9%), 1 - 1 (11.7%), 2 - 0 (11.1%) | 57.7%    | 24.4%    | 17.9%    | Home Win      | Upcoming |
| 2027-03-20 | Ipswich           | 1 - 2         | Crystal Palace    | 1 - 2 (9.8%), 1 - 1 (11.6%), 0 - 1 (9.5%)   | 18.5%    | 23.5%    | 58.0%    | Away Win      | Upcoming |
| 2027-03-20 | Arsenal           | 2 - 0         | Sunderland        | 2 - 0 (10.0%), 1 - 1 (10.1%), 2 - 1 (9.9%)  | 66.8%    | 20.9%    | 12.3%    | Home Win      | Upcoming |
| 2027-03-20 | Fulham            | 1 - 0         | Liverpool         | 1 - 0 (9.7%), 1 - 1 (13.3%), 2 - 1 (8.7%)   | 42.7%    | 27.5%    | 29.8%    | Home Win      | Upcoming |
| 2027-03-20 | Hull              | 1 - 2         | Chelsea           | 1 - 2 (8.6%), 1 - 1 (10.3%), 2 - 1 (7.8%)   | 33.1%    | 26.7%    | 40.2%    | Away Win      | Upcoming |
| 2027-03-20 | Nottingham Forest | 1 - 0         | Aston Villa       | 1 - 0 (9.0%), 1 - 1 (13.6%), 0 - 1 (10.2%)  | 37.2%    | 28.5%    | 34.3%    | Home Win      | Upcoming |
| 2027-03-20 | Everton           | 1 - 0         | Tottenham         | 1 - 0 (11.4%), 1 - 1 (13.3%), 0 - 0 (9.2%)  | 49.5%    | 28.2%    | 22.3%    | Home Win      | Upcoming |
| 2027-03-20 | Newcastle         | 1 - 0         | Leeds             | 1 - 0 (10.6%), 1 - 1 (12.9%), 2 - 1 (9.3%)  | 50.2%    | 26.4%    | 23.4%    | Home Win      | Upcoming |

### Gameweek 31

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-04-10 | Sunderland        | 1 - 0         | Ipswich           | 1 - 0 (13.3%), 1 - 1 (12.8%), 2 - 0 (10.7%) | 57.6%    | 26.5%    | 15.9%    | Home Win      | Upcoming |
| 2027-04-10 | Leeds             | 1 - 0         | Nottingham Forest | 1 - 0 (9.7%), 1 - 1 (13.9%), 0 - 1 (11.2%)  | 36.1%    | 29.6%    | 34.3%    | Home Win      | Upcoming |
| 2027-04-10 | Manchester United | 2 - 1         | Hull              | 2 - 1 (9.7%), 1 - 1 (8.9%), 2 - 0 (8.7%)    | 64.5%    | 19.9%    | 15.6%    | Home Win      | Upcoming |
| 2027-04-10 | Chelsea           | 1 - 0         | Fulham            | 1 - 0 (11.2%), 1 - 1 (12.6%), 2 - 1 (9.5%)  | 52.8%    | 26.5%    | 20.7%    | Home Win      | Upcoming |
| 2027-04-10 | Liverpool         | 2 - 1         | Newcastle         | 2 - 1 (9.9%), 1 - 1 (11.1%), 2 - 0 (9.8%)   | 56.6%    | 23.3%    | 20.1%    | Home Win      | Upcoming |
| 2027-04-10 | Coventry          | 1 - 2         | Arsenal           | 1 - 2 (9.9%), 1 - 1 (10.7%), 0 - 2 (8.9%)   | 22.1%    | 25.5%    | 52.4%    | Away Win      | Upcoming |
| 2027-04-10 | Bournemouth       | 1 - 0         | Manchester City   | 1 - 0 (10.2%), 1 - 1 (13.5%), 0 - 0 (9.0%)  | 37.9%    | 28.3%    | 33.8%    | Home Win      | Upcoming |
| 2027-04-10 | Crystal Palace    | 1 - 0         | Everton           | 1 - 0 (9.2%), 1 - 1 (13.5%), 0 - 1 (9.3%)   | 36.7%    | 27.6%    | 35.7%    | Home Win      | Upcoming |
| 2027-04-10 | Tottenham         | 1 - 0         | Brentford         | 1 - 0 (10.0%), 1 - 1 (13.2%), 2 - 1 (8.9%)  | 41.9%    | 27.7%    | 30.4%    | Home Win      | Upcoming |
| 2027-04-10 | Aston Villa       | 1 - 0         | Brighton          | 1 - 0 (10.5%), 1 - 1 (12.8%), 2 - 1 (9.4%)  | 44.3%    | 27.8%    | 27.9%    | Home Win      | Upcoming |

### Gameweek 32

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-04-17 | Brighton          | 2 - 1         | Chelsea           | 2 - 1 (9.3%), 1 - 1 (12.4%), 1 - 0 (9.0%)   | 46.0%    | 26.1%    | 27.9%    | Home Win      | Upcoming |
| 2027-04-17 | Fulham            | 2 - 1         | Sunderland        | 2 - 1 (9.7%), 1 - 1 (11.3%), 1 - 0 (8.4%)   | 52.7%    | 24.7%    | 22.6%    | Home Win      | Upcoming |
| 2027-04-17 | Brentford         | 1 - 0         | Leeds             | 1 - 0 (10.7%), 1 - 1 (13.2%), 2 - 1 (9.1%)  | 47.4%    | 27.5%    | 25.1%    | Home Win      | Upcoming |
| 2027-04-17 | Nottingham Forest | 0 - 1         | Liverpool         | 0 - 1 (12.8%), 1 - 1 (13.7%), 0 - 0 (11.1%) | 29.5%    | 28.3%    | 42.2%    | Away Win      | Upcoming |
| 2027-04-17 | Hull              | 2 - 1         | Coventry          | 2 - 1 (9.6%), 1 - 1 (12.0%), 1 - 0 (9.2%)   | 52.2%    | 26.4%    | 21.4%    | Home Win      | Upcoming |
| 2027-04-17 | Arsenal           | 2 - 1         | Aston Villa       | 2 - 1 (9.8%), 1 - 1 (11.6%), 1 - 0 (9.7%)   | 58.5%    | 24.5%    | 17.0%    | Home Win      | Upcoming |
| 2027-04-17 | Ipswich           | 1 - 2         | Manchester United | 1 - 2 (9.9%), 1 - 1 (9.7%), 0 - 2 (9.4%)    | 14.1%    | 21.3%    | 64.6%    | Away Win      | Upcoming |
| 2027-04-17 | Manchester City   | 2 - 0         | Crystal Palace    | 2 - 0 (13.9%), 1 - 0 (13.6%), 1 - 1 (10.0%) | 63.7%    | 22.7%    | 13.6%    | Home Win      | Upcoming |
| 2027-04-17 | Newcastle         | 1 - 0         | Tottenham         | 1 - 0 (12.3%), 1 - 1 (12.3%), 2 - 0 (10.6%) | 58.3%    | 25.7%    | 16.0%    | Home Win      | Upcoming |
| 2027-04-17 | Everton           | 2 - 1         | Bournemouth       | 2 - 1 (8.9%), 1 - 1 (12.7%), 1 - 0 (8.8%)   | 42.4%    | 27.5%    | 30.1%    | Home Win      | Upcoming |

### Gameweek 33

| Date       | Home              | Most likely   | Away            | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-----------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-04-24 | Chelsea           | 0 - 1         | Manchester City | 0 - 1 (11.0%), 1 - 1 (13.6%), 0 - 0 (9.6%)  | 29.8%    | 28.5%    | 41.7%    | Away Win      | Upcoming |
| 2027-04-24 | Bournemouth       | 0 - 1         | Arsenal         | 0 - 1 (9.4%), 1 - 1 (13.2%), 1 - 2 (8.7%)   | 33.8%    | 27.2%    | 39.0%    | Away Win      | Upcoming |
| 2027-04-24 | Tottenham         | 1 - 0         | Hull            | 1 - 0 (10.2%), 1 - 1 (11.6%), 2 - 1 (9.9%)  | 57.5%    | 23.7%    | 18.8%    | Home Win      | Upcoming |
| 2027-04-24 | Manchester United | 2 - 1         | Crystal Palace  | 2 - 1 (9.7%), 1 - 1 (11.9%), 1 - 0 (9.4%)   | 51.8%    | 25.8%    | 22.4%    | Home Win      | Upcoming |
| 2027-04-24 | Everton           | 1 - 0         | Brighton        | 1 - 0 (9.7%), 1 - 1 (12.7%), 2 - 1 (9.3%)   | 47.4%    | 27.3%    | 25.3%    | Home Win      | Upcoming |
| 2027-04-24 | Nottingham Forest | 2 - 1         | Sunderland      | 2 - 1 (9.3%), 1 - 1 (11.9%), 1 - 0 (8.1%)   | 50.2%    | 25.3%    | 24.5%    | Home Win      | Upcoming |
| 2027-04-24 | Newcastle         | 1 - 0         | Ipswich         | 1 - 0 (11.5%), 1 - 1 (11.7%), 2 - 0 (10.8%) | 59.9%    | 25.1%    | 15.0%    | Home Win      | Upcoming |
| 2027-04-24 | Aston Villa       | 2 - 1         | Coventry        | 2 - 1 (9.9%), 1 - 1 (11.2%), 2 - 0 (9.2%)   | 61.2%    | 23.4%    | 15.4%    | Home Win      | Upcoming |
| 2027-04-24 | Brentford         | 1 - 0         | Fulham          | 1 - 0 (12.4%), 1 - 1 (13.4%), 0 - 0 (10.0%) | 48.7%    | 28.0%    | 23.3%    | Home Win      | Upcoming |
| 2027-04-24 | Leeds             | 0 - 1         | Liverpool       | 0 - 1 (12.0%), 1 - 1 (14.2%), 0 - 0 (11.8%) | 32.2%    | 31.3%    | 36.5%    | Away Win      | Upcoming |

### Gameweek 34

| Date       | Home            | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-----------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-05-01 | Sunderland      | 0 - 1         | Newcastle         | 0 - 1 (10.3%), 1 - 1 (14.0%), 1 - 0 (10.6%) | 34.9%    | 29.1%    | 36.0%    | Away Win      | Upcoming |
| 2027-05-01 | Brighton        | 2 - 1         | Nottingham Forest | 2 - 1 (8.8%), 1 - 1 (11.6%), 1 - 2 (7.9%)   | 44.4%    | 26.5%    | 29.1%    | Home Win      | Upcoming |
| 2027-05-01 | Coventry        | 1 - 2         | Manchester United | 1 - 2 (9.7%), 0 - 2 (9.2%), 1 - 1 (8.8%)    | 15.4%    | 22.8%    | 61.8%    | Away Win      | Upcoming |
| 2027-05-01 | Hull            | 2 - 1         | Bournemouth       | 2 - 1 (7.6%), 1 - 1 (10.7%), 1 - 2 (8.9%)   | 38.3%    | 26.7%    | 35.0%    | Home Win      | Upcoming |
| 2027-05-01 | Manchester City | 2 - 0         | Brentford         | 2 - 0 (13.9%), 1 - 0 (13.2%), 1 - 1 (9.7%)  | 66.7%    | 20.8%    | 12.5%    | Home Win      | Upcoming |
| 2027-05-01 | Fulham          | 1 - 0         | Everton           | 1 - 0 (10.1%), 1 - 1 (13.0%), 2 - 1 (9.1%)  | 45.9%    | 27.3%    | 26.8%    | Home Win      | Upcoming |
| 2027-05-01 | Liverpool       | 2 - 1         | Chelsea           | 2 - 1 (9.9%), 1 - 1 (11.3%), 1 - 0 (9.4%)   | 54.5%    | 24.0%    | 21.5%    | Home Win      | Upcoming |
| 2027-05-01 | Arsenal         | 2 - 1         | Tottenham         | 2 - 1 (9.8%), 1 - 1 (11.4%), 1 - 0 (9.1%)   | 63.3%    | 22.7%    | 14.0%    | Home Win      | Upcoming |
| 2027-05-01 | Crystal Palace  | 0 - 1         | Aston Villa       | 0 - 1 (10.9%), 1 - 1 (13.8%), 0 - 0 (9.9%)  | 32.3%    | 29.5%    | 38.2%    | Away Win      | Upcoming |
| 2027-05-01 | Ipswich         | 0 - 1         | Leeds             | 0 - 1 (11.0%), 1 - 1 (12.9%), 1 - 2 (9.3%)  | 24.4%    | 26.8%    | 48.8%    | Away Win      | Upcoming |

### Gameweek 35

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-05-08 | Manchester City   | 1 - 0         | Liverpool         | 1 - 0 (13.7%), 1 - 1 (12.5%), 2 - 0 (11.3%) | 54.3%    | 25.7%    | 20.0%    | Home Win      | Upcoming |
| 2027-05-08 | Leeds             | 0 - 1         | Arsenal           | 0 - 1 (11.1%), 1 - 1 (12.5%), 1 - 2 (9.5%)  | 27.6%    | 28.3%    | 44.1%    | Away Win      | Upcoming |
| 2027-05-08 | Fulham            | 1 - 0         | Ipswich           | 1 - 0 (10.5%), 1 - 1 (11.2%), 2 - 0 (10.4%) | 64.9%    | 21.9%    | 13.2%    | Home Win      | Upcoming |
| 2027-05-08 | Nottingham Forest | 1 - 0         | Crystal Palace    | 1 - 0 (9.1%), 1 - 1 (13.2%), 0 - 1 (8.5%)   | 42.8%    | 27.4%    | 29.8%    | Home Win      | Upcoming |
| 2027-05-08 | Brentford         | 1 - 0         | Aston Villa       | 1 - 0 (11.3%), 1 - 1 (13.7%), 0 - 0 (9.9%)  | 42.1%    | 29.4%    | 28.5%    | Home Win      | Upcoming |
| 2027-05-08 | Newcastle         | 1 - 0         | Coventry          | 1 - 0 (10.8%), 1 - 1 (11.6%), 2 - 0 (10.3%) | 60.9%    | 24.4%    | 14.7%    | Home Win      | Upcoming |
| 2027-05-08 | Brighton          | 2 - 1         | Sunderland        | 2 - 1 (9.7%), 1 - 1 (9.9%), 2 - 0 (7.9%)    | 57.4%    | 23.4%    | 19.2%    | Home Win      | Upcoming |
| 2027-05-08 | Tottenham         | 1 - 0         | Chelsea           | 1 - 0 (12.1%), 1 - 1 (13.8%), 0 - 0 (10.6%) | 41.8%    | 28.7%    | 29.5%    | Home Win      | Upcoming |
| 2027-05-08 | Everton           | 2 - 1         | Hull              | 2 - 1 (9.9%), 1 - 1 (11.0%), 2 - 0 (8.7%)   | 57.4%    | 24.0%    | 18.6%    | Home Win      | Upcoming |
| 2027-05-08 | Bournemouth       | 1 - 0         | Manchester United | 1 - 0 (10.6%), 1 - 1 (13.6%), 0 - 0 (9.2%)  | 40.3%    | 28.1%    | 31.6%    | Home Win      | Upcoming |

### Gameweek 36

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-05-15 | Hull              | 2 - 1         | Fulham            | 2 - 1 (8.1%), 1 - 1 (11.0%), 1 - 2 (8.5%)   | 37.8%    | 27.2%    | 35.0%    | Home Win      | Upcoming |
| 2027-05-15 | Manchester United | 2 - 1         | Leeds             | 2 - 1 (9.9%), 1 - 1 (11.1%), 2 - 0 (9.2%)   | 54.0%    | 24.6%    | 21.4%    | Home Win      | Upcoming |
| 2027-05-15 | Crystal Palace    | 0 - 1         | Brighton          | 0 - 1 (11.1%), 1 - 1 (13.9%), 0 - 0 (10.3%) | 31.6%    | 28.4%    | 40.0%    | Away Win      | Upcoming |
| 2027-05-15 | Aston Villa       | 1 - 0         | Newcastle         | 1 - 0 (10.5%), 1 - 1 (12.2%), 2 - 1 (9.7%)  | 49.2%    | 26.8%    | 24.0%    | Home Win      | Upcoming |
| 2027-05-15 | Chelsea           | 1 - 0         | Everton           | 1 - 0 (10.6%), 1 - 1 (13.0%), 2 - 1 (9.2%)  | 45.8%    | 27.5%    | 26.7%    | Home Win      | Upcoming |
| 2027-05-15 | Coventry          | 1 - 2         | Tottenham         | 1 - 2 (9.9%), 1 - 1 (10.9%), 0 - 2 (8.9%)   | 19.3%    | 26.3%    | 54.4%    | Away Win      | Upcoming |
| 2027-05-15 | Sunderland        | 1 - 0         | Bournemouth       | 1 - 0 (9.3%), 1 - 1 (12.8%), 2 - 1 (9.1%)   | 44.2%    | 27.7%    | 28.1%    | Home Win      | Upcoming |
| 2027-05-15 | Liverpool         | 2 - 1         | Brentford         | 2 - 1 (9.9%), 1 - 1 (11.2%), 2 - 0 (9.8%)   | 54.9%    | 24.5%    | 20.6%    | Home Win      | Upcoming |
| 2027-05-15 | Ipswich           | 0 - 1         | Manchester City   | 0 - 1 (9.8%), 1 - 1 (12.2%), 1 - 2 (9.6%)   | 18.9%    | 24.7%    | 56.4%    | Away Win      | Upcoming |
| 2027-05-15 | Arsenal           | 2 - 1         | Nottingham Forest | 2 - 1 (9.6%), 1 - 1 (12.0%), 1 - 0 (9.3%)   | 53.2%    | 25.7%    | 21.1%    | Home Win      | Upcoming |

### Gameweek 37

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-05-23 | Brentford         | 2 - 1         | Hull              | 2 - 1 (9.9%), 1 - 1 (11.0%), 2 - 0 (9.8%)   | 59.6%    | 23.4%    | 17.0%    | Home Win      | Upcoming |
| 2027-05-23 | Newcastle         | 1 - 0         | Crystal Palace    | 1 - 0 (9.9%), 1 - 1 (12.1%), 2 - 1 (9.7%)   | 51.9%    | 26.7%    | 21.4%    | Home Win      | Upcoming |
| 2027-05-23 | Tottenham         | 0 - 1         | Manchester United | 0 - 1 (9.9%), 1 - 1 (12.9%), 1 - 2 (9.1%)   | 30.8%    | 28.0%    | 41.2%    | Away Win      | Upcoming |
| 2027-05-23 | Leeds             | 1 - 0         | Sunderland        | 1 - 0 (10.5%), 1 - 1 (13.0%), 2 - 1 (9.2%)  | 47.1%    | 28.0%    | 24.9%    | Home Win      | Upcoming |
| 2027-05-23 | Brighton          | 2 - 1         | Liverpool         | 2 - 1 (9.2%), 1 - 1 (12.6%), 1 - 0 (9.1%)   | 45.0%    | 26.7%    | 28.3%    | Home Win      | Upcoming |
| 2027-05-23 | Nottingham Forest | 2 - 1         | Ipswich           | 2 - 1 (9.7%), 1 - 1 (11.9%), 1 - 0 (9.3%)   | 57.3%    | 24.3%    | 18.4%    | Home Win      | Upcoming |
| 2027-05-23 | Bournemouth       | 1 - 0         | Chelsea           | 1 - 0 (11.0%), 1 - 1 (12.9%), 2 - 1 (9.3%)  | 49.6%    | 25.8%    | 24.6%    | Home Win      | Upcoming |
| 2027-05-23 | Fulham            | 2 - 1         | Coventry          | 2 - 1 (9.9%), 1 - 1 (11.2%), 1 - 0 (9.3%)   | 56.4%    | 24.9%    | 18.7%    | Home Win      | Upcoming |
| 2027-05-23 | Everton           | 0 - 1         | Arsenal           | 0 - 1 (10.5%), 1 - 1 (12.7%), 1 - 2 (9.4%)  | 28.7%    | 26.8%    | 44.5%    | Away Win      | Upcoming |
| 2027-05-23 | Manchester City   | 2 - 0         | Aston Villa       | 2 - 0 (11.8%), 1 - 0 (11.8%), 1 - 1 (10.8%) | 64.4%    | 22.6%    | 13.0%    | Home Win      | Upcoming |

### Gameweek 38

| Date       | Home              | Most likely   | Away              | Top 3                                       | Home %   | Draw %   | Away %   | Fav Outcome   | Status   |
|------------|-------------------|---------------|-------------------|---------------------------------------------|----------|----------|----------|---------------|----------|
| 2027-05-30 | Ipswich           | 1 - 2         | Everton           | 1 - 2 (9.8%), 1 - 1 (11.6%), 0 - 1 (9.5%)   | 21.4%    | 24.2%    | 54.4%    | Away Win      | Upcoming |
| 2027-05-30 | Arsenal           | 2 - 1         | Brighton          | 2 - 1 (9.4%), 1 - 1 (12.4%), 1 - 0 (9.4%)   | 49.2%    | 26.3%    | 24.5%    | Home Win      | Upcoming |
| 2027-05-30 | Liverpool         | 1 - 0         | Bournemouth       | 1 - 0 (10.0%), 1 - 1 (11.8%), 2 - 1 (9.8%)  | 52.6%    | 25.4%    | 22.0%    | Home Win      | Upcoming |
| 2027-05-30 | Coventry          | 1 - 2         | Nottingham Forest | 1 - 2 (9.8%), 1 - 1 (9.9%), 0 - 2 (8.3%)    | 17.9%    | 23.3%    | 58.8%    | Away Win      | Upcoming |
| 2027-05-30 | Aston Villa       | 1 - 0         | Tottenham         | 1 - 0 (10.9%), 1 - 1 (13.0%), 2 - 1 (9.3%)  | 52.3%    | 27.5%    | 20.2%    | Home Win      | Upcoming |
| 2027-05-30 | Hull              | 1 - 2         | Newcastle         | 1 - 2 (8.7%), 1 - 1 (10.8%), 2 - 1 (7.9%)   | 35.9%    | 26.8%    | 37.3%    | Away Win      | Upcoming |
| 2027-05-30 | Manchester United | 1 - 0         | Fulham            | 1 - 0 (11.7%), 1 - 1 (12.4%), 2 - 0 (10.2%) | 54.5%    | 25.5%    | 20.0%    | Home Win      | Upcoming |
| 2027-05-30 | Sunderland        | 0 - 1         | Manchester City   | 0 - 1 (11.9%), 1 - 1 (13.3%), 0 - 0 (9.6%)  | 27.8%    | 28.8%    | 43.4%    | Away Win      | Upcoming |
| 2027-05-30 | Chelsea           | 1 - 0         | Brentford         | 1 - 0 (9.5%), 1 - 1 (13.4%), 0 - 1 (8.8%)   | 40.7%    | 28.0%    | 31.3%    | Home Win      | Upcoming |
| 2027-05-30 | Crystal Palace    | 1 - 0         | Leeds             | 1 - 0 (9.2%), 1 - 1 (13.5%), 0 - 1 (9.6%)   | 40.4%    | 28.0%    | 31.6%    | Home Win      | Upcoming |

