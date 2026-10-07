import { describe, expect, it } from "vitest";
import { pickWasRight, recentForm } from "./fixtures";
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
