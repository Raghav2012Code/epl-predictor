import type { Fixture } from "../types";

export const pct = (value: number) => `${Number(value).toFixed(1)}%`;

export const confidenceFor = (fixture: Fixture) =>
  Math.max(fixture.homeWinProb, fixture.drawProb, fixture.awayWinProb);

export const deltaLabel = (value: number) =>
  `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

export const displayDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));

export const scoreParts = (score: string): [number, number] | null => {
  const match = score.match(/(\d+)\s*[-–]\s*(\d+)/);
  return match ? [Number(match[1]), Number(match[2])] : null;
};

export const startOfToday = () => {
  const day = new Date();
  day.setHours(0, 0, 0, 0);
  return day.getTime();
};

export const fixtureDay = (value: string) =>
  new Date(`${value}T00:00:00`).getTime();

export const resultTone = (result: string | null) =>
  result === "Home win" || result === "Win"
    ? "tone-win"
    : result === "Away win" || result === "Loss"
      ? "tone-loss"
      : "tone-draw";
