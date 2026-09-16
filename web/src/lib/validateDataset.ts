import type { EPLDataset, Fixture } from '../types';

const fixtureStringFields: Array<keyof Fixture> = [
  'date', 'time', 'homeTeam', 'awayTeam', 'homeShort', 'awayShort', 'homeBadge',
  'awayBadge', 'homeColor', 'awayColor', 'stadium', 'predictedScore',
  'predictedOutcome', 'status', 'actualScore',
];

const fixtureNumberFields: Array<keyof Fixture> = [
  'id', 'gameweek', 'predHomeGoals', 'predAwayGoals', 'homeWinProb', 'drawProb', 'awayWinProb',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isFixture(value: unknown): value is Fixture {
  if (!isRecord(value)) return false;
  if (!fixtureStringFields.every((field) => isNonEmptyString(value[field]))) return false;
  if (!fixtureNumberFields.every((field) => isFiniteNumber(value[field]))) return false;
  const gameweek = value.gameweek;
  if (typeof gameweek !== 'number' || !Number.isInteger(gameweek) || gameweek < 1 || gameweek > 38) return false;
  const probabilities = ['homeWinProb', 'drawProb', 'awayWinProb'].map((field) => value[field]);
  const numericProbabilities = probabilities.filter(isFiniteNumber);
  if (numericProbabilities.length !== 3) return false;
  const probabilityTotal = numericProbabilities.reduce((total, probability) => total + probability, 0);
  if (Math.abs(probabilityTotal - 100) > 0.15) return false;
  return ['homeWinProb', 'drawProb', 'awayWinProb'].every((field) => {
    const probability = value[field];
    return isFiniteNumber(probability) && probability >= 0 && probability <= 100;
  });
}

/** Validate the minimum shape required by every dashboard view. */
export function isEPLDataset(value: unknown): value is EPLDataset {
  if (!isRecord(value)) return false;
  if (!isNonEmptyString(value.season) || !Array.isArray(value.fixtures) || value.fixtures.length === 0) return false;
  if (!value.fixtures.every(isFixture)) return false;
  const fixtureIds = value.fixtures.map((fixture) => fixture.id);
  if (new Set(fixtureIds).size !== fixtureIds.length) return false;
  if ('totalMatches' in value && value.totalMatches !== value.fixtures.length) return false;
  if (!isRecord(value.benchmark) || !Array.isArray(value.benchmark.models)) return false;
  if (!isRecord(value.analytics) || !Array.isArray(value.analytics.goalsPerGameweek)) return false;
  const distribution = value.analytics.outcomeDistribution;
  if (!isRecord(distribution)) return false;
  if (!['home', 'draw', 'away', 'homePct', 'drawPct', 'awayPct'].every((field) => isFiniteNumber(distribution[field]))) return false;
  return isRecord(value.teams) && isRecord(value.clubSeries) && isRecord(value.meta);
}
