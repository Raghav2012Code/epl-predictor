import type { Fixture } from "../types";

export const pct = (value: number) => `${Number(value).toFixed(1)}%`;

/**
 * Confidence in the outcome the model actually publishes. predictedOutcome
 * comes from the backend's draw-band rule, which can call a draw while the
 * away probability is still the largest, so a plain argmax would print a
 * confidence that disagrees with the published pick.
 */
export const confidenceFor = (fixture: Fixture) => {
  switch (fixture.predictedOutcome) {
    case "Draw":
      return fixture.drawProb;
    case "Away Win":
      return fixture.awayWinProb;
    case "Home Win":
      return fixture.homeWinProb;
    default:
      return Math.max(fixture.homeWinProb, fixture.drawProb, fixture.awayWinProb);
  }
};

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

/**
 * Re-orients a home-first `h - a` scoreline to a club's point of view, so a
 * row marked `@ Opponent` does not show an away win as a defeat.
 */
export const scoreForClub = (score: string, fixture: Fixture, club: string): string => {
  const parts = scoreParts(score);
  if (!parts) return score;
  const [home, away] = parts;
  return fixture.homeTeam === club ? `${home} - ${away}` : `${away} - ${home}`;
};
