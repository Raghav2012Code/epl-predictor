import { describe, expect, it } from "vitest";
import {
  fixtureDay,
  isUpcomingFixture,
  nextFixtureByDate,
  startOfToday,
  upcomingFixtures,
} from "./fixtureDates";
import type { Fixture } from "../types";

const make = (over: Partial<Fixture> & { id: number }): Fixture => ({
  date: "2026-08-21",
  time: "15:00",
  homeTeam: "Arsenal",
  awayTeam: "Chelsea",
  homeWinProb: 50,
  drawProb: 25,
  awayWinProb: 25,
  predictedOutcome: "Home Win",
  predictedScore: "2 - 1",
  status: "Upcoming",
  actualScore: "-",
  gameweek: 1,
  ...over,
});

const offsetDays = (date: string, days: number): string => {
  const base = new Date(`${date}T12:00:00`);
  base.setDate(base.getDate() + days);
  const y = base.getFullYear();
  const m = String(base.getMonth() + 1).padStart(2, "0");
  const d = String(base.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

describe("fixture date helpers", () => {
  it("treats an unplayed but already-kicked-off fixture as not upcoming", () => {
    // `status !== "Played"` only means "no result recorded yet". A pipeline run
    // can leave a fixture that has already been played still marked Upcoming,
    // and the landing page then advertised it as the next match.
    const past = make({ id: 1, date: offsetDays(new Date().toISOString().slice(0, 10), -3) });
    expect(past.status).toBe("Upcoming");
    expect(isUpcomingFixture(past)).toBe(false);
    expect(nextFixtureByDate([past])).toBeNull();
    expect(upcomingFixtures([past])).toEqual([]);
  });

  it("keeps a fixture scheduled for later today or later as upcoming", () => {
    const future = make({ id: 2, date: offsetDays(new Date().toISOString().slice(0, 10), 2) });
    expect(isUpcomingFixture(future)).toBe(true);
    expect(nextFixtureByDate([future])?.id).toBe(2);
  });

  it("picks the earliest future fixture and orders upcoming fixtures by kickoff", () => {
    const later = make({ id: 10, date: offsetDays(new Date().toISOString().slice(0, 10), 9), gameweek: 9 });
    const sooner = make({ id: 11, date: offsetDays(new Date().toISOString().slice(0, 10), 4), gameweek: 8 });

    expect(nextFixtureByDate([later, sooner])?.id).toBe(11);
    expect(upcomingFixtures([later, sooner]).map((f) => f.id)).toEqual([11, 10]);
    expect(upcomingFixtures([later, sooner], 1).map((f) => f.id)).toEqual([11]);
  });

  it("never returns a played fixture", () => {
    const done = make({ id: 20, date: offsetDays(new Date().toISOString().slice(0, 10), 5), status: "Played" });
    expect(isUpcomingFixture(done)).toBe(false);
    expect(nextFixtureByDate([done])).toBeNull();
  });

  it("parses a YYYY-MM-DD date on its own calendar day", () => {
    // `new Date("2026-08-21")` is UTC midnight by spec, which is the previous
    // day for anyone west of Greenwich.
    const parsed = new Date(fixtureDay("2026-08-21"));
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(7);
    expect(parsed.getDate()).toBe(21);
  });

  it("exposes a local midnight boundary for today", () => {
    const today = new Date(startOfToday());
    expect(today.getHours()).toBe(0);
    expect(today.getMinutes()).toBe(0);
  });
});