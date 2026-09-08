export type MatchOutcome = 'Home Win' | 'Draw' | 'Away Win';

export interface Fixture {
  id: number;
  gameweek: number;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeShort: string;
  awayShort: string;
  homeColor: string;
  awayColor: string;
  stadium: string;
  predictedScore: string;
  predHomeGoals: number;
  predAwayGoals: number;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  predictedOutcome: MatchOutcome | string;
  status: 'Played' | 'Upcoming';
  actualScore: string;
}

export interface StandingsRow {
  rank: number;
  team: string;
  short: string;
  color: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  last5: string[];
}

export interface ModelMetric {
  name: string;
  isProduction: boolean;
  accuracy: number;
  macroF1: number;
  logLoss: number;
  homeGoalMae: number;
  awayGoalMae: number;
  avgGoalMae: number;
  within1Goal: number;
}

export interface FeatureImportance {
  name: string;
  importance: number;
  category: string;
  desc: string;
}

export interface DiagnosticImage {
  id: string;
  title: string;
  src: string;
  caption: string;
}

export interface TeamProfile {
  name: string;
  short: string;
  color: string;
  stadium: string;
  rank: number;
  points: number;
  gfPerMatch: number;
  gaPerMatch: number;
  winRate: number;
  last5Form: string[];
  restDaysAvg: number;
  possessionAvg: number;
  shotsTargetAvg: number;
}

export interface EPLDataset {
  season: string;
  totalMatches: number;
  gameweeksTotal: number;
  fixtures: Fixture[];
  standings: StandingsRow[];
  benchmark: {
    productionModel: string;
    models: ModelMetric[];
    topFeatures: FeatureImportance[];
    diagnostics: DiagnosticImage[];
  };
  teams: Record<string, TeamProfile>;
}

export interface WhatIfConfig {
  homeRestDays: number;
  awayRestDays: number;
  homeFormMultiplier: number;
  awayFormMultiplier: number;
  homeAdvantageBoost: number;
}
