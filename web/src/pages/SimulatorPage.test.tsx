// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { SimulatorPage } from "./SimulatorPage";
import type { EPLDataset, Fixture, TeamProfile } from "../types";

afterEach(cleanup);

const block = [
  { score: "2 - 1", prob: 11.2 },
  { score: "1 - 0", prob: 9.8 },
  { score: "2 - 0", prob: 8.1 },
];

const fixture = {
  id: 1,
  gameweek: 1,
  date: "2026-08-15",
  time: "15:00",
  homeTeam: "Arsenal",
  awayTeam: "Chelsea",
  homeShort: "ARS",
  awayShort: "CHE",
  homeBadge: "",
  awayBadge: "",
  homeColor: "#ef0107",
  awayColor: "#034694",
  stadium: "Emirates Stadium",
  predictedScore: "2 - 1",
  predHomeGoals: 2,
  predAwayGoals: 1,
  topScorelines: block,
  homeWinProb: 50,
  drawProb: 27,
  awayWinProb: 23,
  predictedOutcome: "Home Win",
  status: "Upcoming",
  actualScore: "-",
} as Fixture;

const team = (over: Partial<TeamProfile> & { name: string }): TeamProfile =>
  ({
    short: over.name.slice(0, 3).toUpperCase(),
    color: "#000000",
    badge: "",
    stadium: `${over.name} Stadium`,
    rank: 1,
    points: 0,
    gfPerMatch: 1.6,
    gaPerMatch: 1.1,
    winRate: 50,
    last5Form: [],
    restDaysAvg: 6.9,
    possessionAvg: 50,
    shotsTargetAvg: 4.5,
    ...over,
  }) as TeamProfile;

const dataset = {
  fixtures: [fixture],
  teams: { Arsenal: team({ name: "Arsenal" }), Chelsea: team({ name: "Chelsea" }) },
  benchmark: { productionModel: "Stacked" },
} as unknown as EPLDataset;

describe("SimulatorPage top-three block", () => {
  it("renders the served block as text with the headline pick first", () => {
    const { getByText, container } = render(
      <SimulatorPage dataset={dataset} initialHome="Arsenal" initialAway="Chelsea" />,
    );
    expect(getByText("Most likely score")).toBeTruthy();
    const text = container.textContent ?? "";
    expect(text).toContain("2 - 1");
    expect(text).toContain("11.2%");
    expect(text).toContain("1 - 0");
    expect(text).toContain("9.8%");
    expect(text).toContain("model pick");
  });

  it("re-orients the block when the fixture is found reversed", () => {
    const { container } = render(
      <SimulatorPage dataset={dataset} initialHome="Chelsea" initialAway="Arsenal" />,
    );
    const text = container.textContent ?? "";
    expect(text).toContain("1 - 2");
    expect(text).toContain("11.2%");
  });
});
