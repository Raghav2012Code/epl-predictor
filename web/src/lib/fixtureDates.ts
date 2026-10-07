import type { Fixture } from "../types";

/**
 * Fixture date helpers shared by every view.
 *
 * `status !== "Played"` only means "no official result recorded yet". It is
 * not a statement about time: the generated season slate is produced by a
 * pipeline run, so fixtures whose kickoff has since passed can still carry
 * status "Upcoming". Anything described to a user as *next* or *upcoming* must
 * also compare the date, which is what these helpers centralise so the landing
 * page, club profile and fixture list cannot drift apart again.
 */

/** Midnight today in local time, as a timestamp. */
export const startOfToday = (): number => {
  const day = new Date();
  day.setHours(0, 0, 0, 0);
  return day.getTime();
};

/**
 * Midnight local time for a `YYYY-MM-DD` fixture date.
 *
 * `new Date("2026-08-21")` alone is parsed as UTC midnight by spec, which is
 * the previous day for anyone in a UTC-negative timezone. Pinning the local
 * time component keeps the value on the calendar date it names.
 */
export const fixtureDay = (value: string): number =>
  new Date(`${value}T00:00:00`).getTime();

/** Orders by calendar day; fixtures with no date ("TBC") sort last and tie with each other. */
export const compareDay = (a: string, b: string): number => {
  const x = fixtureDay(a);
  const y = fixtureDay(b);
  if (Number.isNaN(x) || Number.isNaN(y)) return Number.isNaN(x) === Number.isNaN(y) ? 0 : Number.isNaN(x) ? 1 : -1;
  return x - y;
};

/** True when the fixture has no recorded result *and* has not kicked off yet. */
export const isUpcomingFixture = (fixture: Fixture): boolean =>
  fixture.status !== "Played" && fixtureDay(fixture.date) >= startOfToday();

const byKickoff = (a: Fixture, b: Fixture) =>
  fixtureDay(a.date) - fixtureDay(b.date) ||
  a.gameweek - b.gameweek ||
  a.id - b.id;

/** The earliest fixture still to be played, or null when the season is done. */
export const nextFixtureByDate = (
  fixtures: Fixture[],
): Fixture | null =>
  fixtures
    .filter(isUpcomingFixture)
    .slice()
    .sort(byKickoff)[0] ?? null;

/** Fixtures still to be played, earliest first, optionally capped. */
export const upcomingFixtures = (
  fixtures: Fixture[],
  limit?: number,
): Fixture[] => {
  const upcoming = fixtures.filter(isUpcomingFixture).sort(byKickoff);
  return typeof limit === "number" ? upcoming.slice(0, limit) : upcoming;
};