import type { Fixture, TeamProfile } from "../types";
import { confidenceFor, pct, scoreParts } from "./format";

export const downloadFixturesCsv = (fixtures: Fixture[]) => {
  const rows = [
    ["Date", "Gameweek", "Home", "Away", "Prediction", "Outcome", "Confidence"],
    ...fixtures.map((fixture) => [
      fixture.date,
      String(fixture.gameweek),
      fixture.homeTeam,
      fixture.awayTeam,
      fixture.predictedScore,
      fixture.predictedOutcome,
      pct(confidenceFor(fixture)),
    ]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "epl-predictor-fixtures.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export type ScenarioResult = {
  homeExpected: number;
  awayExpected: number;
  homeProb: number;
  drawProb: number;
  awayProb: number;
  homeScore: number;
  awayScore: number;
};

export const calculateScenario = (
  home: TeamProfile | undefined,
  away: TeamProfile | undefined,
  homeBoost: number,
  awayBoost: number,
  neutral: boolean,
): ScenarioResult | null => {
  if (!home || !away) return null;
  const homeAttack = Math.max(0.2, home.gfPerMatch * (1 + homeBoost / 100));
  const awayAttack = Math.max(0.2, away.gfPerMatch * (1 + awayBoost / 100));
  const homeExpected = Math.max(
    0.2,
    ((homeAttack + away.gaPerMatch) / 2) * (neutral ? 1 : 1.18),
  );
  const awayExpected = Math.max(
    0.15,
    ((awayAttack + home.gaPerMatch) / 2) * (neutral ? 1 : 0.9),
  );
  const denominator = Math.exp(homeExpected) + Math.exp(awayExpected) + 1.2;
  const homeProb = Math.round((Math.exp(homeExpected) / denominator) * 1000) / 10;
  const drawProb = Math.round(
    (1 - (Math.exp(homeExpected) + Math.exp(awayExpected)) / denominator) * 1000,
  ) / 10;
  const awayProb = Math.round((100 - homeProb - drawProb) * 10) / 10;
  return { homeExpected, awayExpected, homeProb, drawProb, awayProb, homeScore: Math.round(homeExpected), awayScore: Math.round(awayExpected) };
};

export const resultFor = (fixture: Fixture) => {
  const score = scoreParts(fixture.actualScore);
  if (!score) return null;
  return score[0] === score[1]
    ? "Draw"
    : score[0] > score[1]
      ? "Home win"
      : "Away win";
};

export const clubResultFor = (fixture: Fixture, club: string) => {
  const result = resultFor(fixture);
  if (!result) return null;
  if (result === "Draw") return "Draw";
  const clubWasHome = fixture.homeTeam === club;
  const clubWon = result === "Home win" ? clubWasHome : !clubWasHome;
  return clubWon ? "Win" : "Loss";
};
