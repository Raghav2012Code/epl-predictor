// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { FixturesPage } from "./FixturesPage";
import type { EPLDataset, Fixture } from "../types";

afterEach(cleanup);

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
  topScorelines: [
    { score: "2 - 1", prob: 11.2 },
    { score: "1 - 0", prob: 9.8 },
    { score: "2 - 0", prob: 8.1 },
  ],
  homeWinProb: 50,
  drawProb: 27,
  awayWinProb: 23,
  predictedOutcome: "Home Win",
  status: "Upcoming",
  actualScore: "-",
} as Fixture;

const dataset = {
  fixtures: [fixture],
  benchmark: { models: [{ name: "Stacked", isProduction: true, accuracy: 48.7 }] },
} as unknown as EPLDataset;

describe("FixturesPage detail top-three block", () => {
  it("shows the first pick plus two alternatives as text percentages", () => {
    const { container } = render(
      <FixturesPage dataset={dataset} query="" onSimulate={() => {}} />,
    );
    const block = container.querySelector('section[aria-label="Most likely score"]');
    expect(block).toBeTruthy();
    const text = container.textContent ?? "";
    expect(text).toContain("2 - 1");
    expect(text).toContain("11.2%");
    expect(text).toContain("9.8%");
    expect(text).toContain("8.1%");
  });
});
