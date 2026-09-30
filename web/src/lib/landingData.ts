import type { EPLDataset, Fixture } from "../types";
import { nextFixtureByDate } from "./fixtureDates";

export type LandingData = {
  season: string;
  totalMatches: number;
  playedMatches: number;
  fixture: Fixture | undefined;
  productionModel: string;
  productionRps: number;
};

export const getLandingData = (dataset?: EPLDataset | null): LandingData => {
  const productionModel = dataset?.benchmark.productionModel ?? "Stacked";
  const productionRps = dataset?.benchmark.models.find(
    (model) => model.name === productionModel,
  )?.rps ?? 0.2044;

  return {
    season: dataset?.season ?? "2026/2027",
    totalMatches: dataset?.totalMatches ?? 380,
    playedMatches: dataset?.fixtures.filter((fixture) => fixture.status === "Played").length ?? 0,
    // "Next" must mean not yet played *and* not already kicked off; a stale
    // pipeline run can leave past fixtures marked Upcoming.
    fixture: nextFixtureByDate(dataset?.fixtures ?? []) ?? dataset?.fixtures[0],
    productionModel,
    productionRps,
  };
};
