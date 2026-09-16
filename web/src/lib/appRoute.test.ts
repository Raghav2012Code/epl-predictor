import { describe, expect, it } from "vitest";
import { appRouteForPath, pathForAppRoute, type AppRoute } from "./appRoute";
import { getLandingData } from "./landingData";

describe("app routes", () => {
  it("opens the root path on the landing page", () => {
    expect(appRouteForPath("/")).toBe("landing");
  });

  it("keeps dashboard sections available as direct routes", () => {
    const routes: AppRoute[] = ["fixtures", "simulator", "standings", "clubs", "analytics"];

    for (const route of routes) {
      expect(appRouteForPath(pathForAppRoute(route))).toBe(route);
    }
  });

  it("falls back safely for unknown paths", () => {
    expect(appRouteForPath("/not-a-real-section")).toBe("landing");
  });

  it("provides a stable landing shell before the dataset is ready", () => {
    expect(getLandingData(undefined)).toEqual({
      season: "2026/2027",
      totalMatches: 380,
      playedMatches: 0,
      fixture: undefined,
      productionModel: "Stacked",
      productionRps: 0.2044,
    });
  });
});
