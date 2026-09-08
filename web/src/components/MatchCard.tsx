import React from 'react';
import { Fixture } from '../types';
import { ChevronRight } from 'lucide-react';

interface MatchCardProps {
  fixture: Fixture;
  onSelect: (fixture: Fixture) => void;
  isSelected?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  fixture,
  onSelect,
  isSelected = false,
}) => {
  const isPlayed = fixture.status === 'Played';

  return (
    <div
      onClick={() => onSelect(fixture)}
      className={`group relative flex flex-col justify-between border bg-surface p-3.5 transition-all duration-150 cursor-pointer rounded-sm ${
        isSelected
          ? 'border-pl-purpleLight bg-surface-hover shadow-md ring-1 ring-pl-purpleLight'
          : 'border-border hover:border-border-active hover:bg-surface-hover'
      }`}
    >
      {/* Header: Date, Kickoff Time & Status */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-2 text-[11px]">
        <div className="flex items-center space-x-2 text-text-muted">
          <span className="font-mono text-text-secondary">{fixture.date}</span>
          <span>•</span>
          <span className="font-mono">{fixture.time}</span>
          <span className="hidden sm:inline text-text-muted/60">•</span>
          <span className="hidden sm:inline truncate max-w-[140px] text-text-muted">
            {fixture.stadium}
          </span>
        </div>
        <div>
          {isPlayed ? (
            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-sm bg-border text-text-secondary">
              ACTUAL: {fixture.actualScore}
            </span>
          ) : (
            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-sm bg-pl-purple/40 text-pl-purpleLight border border-pl-purpleLight/40">
              SCHEDULED
            </span>
          )}
        </div>
      </div>

      {/* Matchup & Score Forecast */}
      <div className="my-3 grid grid-cols-12 items-center gap-2">
        {/* Home Club */}
        <div className="col-span-5 flex items-center space-x-2">
          <div
            className="h-7 w-1 rounded-none flex-shrink-0"
            style={{ backgroundColor: fixture.homeColor }}
          />
          <div className="min-w-0">
            <div className="text-xs font-bold text-text-primary truncate">
              {fixture.homeTeam}
            </div>
            <div className="text-[10px] font-mono text-text-muted">
              {fixture.homeShort} • HOME
            </div>
          </div>
        </div>

        {/* Center Scoreline Forecast */}
        <div className="col-span-2 flex flex-col items-center justify-center">
          <div className="font-mono text-sm font-black tracking-wider px-2 py-0.5 bg-background border border-border text-text-primary rounded-sm shadow-inner">
            {fixture.predictedScore}
          </div>
          <span className="text-[9px] font-mono text-text-muted mt-0.5 uppercase tracking-wider">
            PRED
          </span>
        </div>

        {/* Away Club */}
        <div className="col-span-5 flex items-center justify-end space-x-2 text-right">
          <div className="min-w-0">
            <div className="text-xs font-bold text-text-primary truncate">
              {fixture.awayTeam}
            </div>
            <div className="text-[10px] font-mono text-text-muted">
              AWAY • {fixture.awayShort}
            </div>
          </div>
          <div
            className="h-7 w-1 rounded-none flex-shrink-0"
            style={{ backgroundColor: fixture.awayColor }}
          />
        </div>
      </div>

      {/* Outcome Probability Distribution */}
      <div className="pt-2 border-t border-border-subtle">
        {/* Segmented bar */}
        <div className="h-1.5 w-full flex bg-background overflow-hidden rounded-none">
          <div
            style={{ width: `${fixture.homeWinProb}%` }}
            className="bg-pl-green transition-all"
            title={`Home Win: ${fixture.homeWinProb}%`}
          />
          <div
            style={{ width: `${fixture.drawProb}%` }}
            className="bg-slate-500 transition-all"
            title={`Draw: ${fixture.drawProb}%`}
          />
          <div
            style={{ width: `${fixture.awayWinProb}%` }}
            className="bg-pl-magenta transition-all"
            title={`Away Win: ${fixture.awayWinProb}%`}
          />
        </div>

        {/* Stats and Favorite Badge */}
        <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono">
          <div className="flex items-center space-x-2 text-text-secondary">
            <span className="text-pl-green">H {fixture.homeWinProb}%</span>
            <span className="text-slate-400">D {fixture.drawProb}%</span>
            <span className="text-pl-magenta">A {fixture.awayWinProb}%</span>
          </div>
          <div className="flex items-center text-text-primary font-semibold">
            <span className="uppercase text-[9px] text-text-muted mr-1">FAV:</span>
            <span className={fixture.predictedOutcome === 'Home Win' ? 'text-pl-green' : (fixture.predictedOutcome === 'Away Win' ? 'text-pl-magenta' : 'text-slate-300')}>
              {fixture.predictedOutcome}
            </span>
            <ChevronRight className="h-3 w-3 ml-0.5 text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
};
