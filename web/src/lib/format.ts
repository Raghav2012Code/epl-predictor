import type { Fixture } from "../types";

export const pct = (value: number) => `${Number(value).toFixed(1)}%`;

export const confidenceFor = (fixture: Fixture) =>
  Math.max(fixture.homeWinProb, fixture.drawProb, fixture.awayWinProb);

export const deltaLabel = (value: number) =>
  `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

const dayOf = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : null;

/** "Friday 21 August", or "Date to be confirmed" when the schedule has no date. */
export const longDay = (value: string) => {
  const day = dayOf(value);
  return day
    ? new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(day)
    : "Date to be confirmed";
};

/** "Fri 21 Aug", or "Date TBC". */
export const shortDay = (value: string) => {
  const day = dayOf(value);
  return day
    ? new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(day)
    : "Date TBC";
};

export const kickoff = (time: string) => (time === "TBC" ? "TBC" : time);

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
