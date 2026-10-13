import { describe, expect, it } from "vitest";
import { pickWasRight, recentForm, topScorelinesFor } from "./fixtures";
import type { Fixture } from "../types";

const make = (over: Partial<Fixture> & { id: number }): Fixture =>
  ({
    date: "2026-08-21",
    time: "15:00",
    gameweek: 1,
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    status: "Played",
    actualScore: "1 - 0",
    predictedScore: "1 - 0",
    predictedOutcome: "Home Win",
    homeWinProb: 50,
    drawProb: 25,
    awayWinProb: 25,
    ...over,
  }) as Fixture;

describe("recentForm", () => {
  const fixtures = [
    make({ id: 3, date: "2026-09-05", actualScore: "0 - 2" }),
    make({ id: 1, date: "2026-08-21", actualScore: "2 - 0" }),
    make({ id: 2, date: "2026-08-28", homeTeam: "Chelsea", awayTeam: "Arsenal", actualScore: "1 - 1" }),
    make({ id: 4, date: "2026-09-12", status: "Upcoming", actualScore: "TBC" }),
    make({ id: 5, date: "2026-09-12", homeTeam: "Leeds", awayTeam: "Fulham" }),
  ];

  it("uses only official results for the club, oldest first", () => {
    expect(recentForm(fixtures, "Arsenal")).toEqual(["W", "D", "L"]);
  });

  it("respects the limit and the before fixture", () => {
    expect(recentForm(fixtures, "Arsenal", 2)).toEqual(["D", "L"]);
    expect(recentForm(fixtures, "Arsenal", 5, fixtures[0])).toEqual(["W", "D"]);
  });
});

describe("pickWasRight", () => {
  it("compares the published pick with the result", () => {
    expect(pickWasRight(make({ id: 1, actualScore: "2 - 1" }))).toBe(true);
    expect(pickWasRight(make({ id: 2, actualScore: "1 - 1" }))).toBe(false);
    expect(pickWasRight(make({ id: 3, status: "Upcoming", actualScore: "TBC" }))).toBeNull();
  });
});

describe("topScorelinesFor", () => {
  const block = [
    { score: "2 - 1", prob: 11.2 },
    { score: "1 - 0", prob: 9.8 },
    { score: "2 - 0", prob: 8.1 },
  ];
  it("passes the served block through with the headline pick first", () => {
    expect(topScorelinesFor(make({ id: 1, topScorelines: block }))).toEqual(block);
  });

  it("falls back to the headline score for datasets predating the block", () => {
    expect(topScorelinesFor(make({ id: 1, topScorelines: undefined }))).toEqual([
      { score: "1 - 0", prob: 50 },
    ]);
    expect(topScorelinesFor(make({ id: 1, topScorelines: [] }))).toEqual([
      { score: "1 - 0", prob: 50 },
    ]);
  });
});
