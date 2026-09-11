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
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(fixture);
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${fixture.homeTeam} versus ${fixture.awayTeam}, predicted ${fixture.predictedScore}`}
      className={`group relative flex flex-col justify-between border p-3 transition-all duration-100 cursor-pointer rounded-none select-none ${
        isSelected
          ? 'border-brand-accent bg-surface-active ring-1 ring-brand-accent/40 shadow-sm'
          : 'border-border bg-surface hover:border-brand-accent/40 hover:bg-surface-hover'
      }`}
    >
      {/* Header: Date, Kickoff Time, Stadium & Status */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-1.5 text-[10px] font-mono">
        <div className="flex items-center space-x-1.5 text-text-muted">
          <span className="text-text-secondary">{fixture.date}</span>
          <span className="text-border">•</span>
          <span>{fixture.time}</span>
          <span className="hidden sm:inline text-border">•</span>
          <span className="hidden sm:inline truncate max-w-[130px] text-text-muted">
            {fixture.stadium}
          </span>
        </div>
        <div>
          {isPlayed ? (
            <span className="inline-flex items-center px-1.5 py-0.2 text-[9px] font-mono font-bold rounded-none bg-surface-subtle border border-border text-text-secondary">
              ACTUAL: {fixture.actualScore}
            </span>
          ) : (
            <span className="inline-flex items-center px-1.5 py-0.2 text-[9px] font-mono font-bold rounded-none bg-background text-brand-accent border border-brand-accent/30">
              SCHEDULED
            </span>
          )}
        </div>
      </div>

      {/* Matchup & Score Forecast */}
      <div className="my-2.5 grid grid-cols-12 items-center gap-2">
        {/* Home Club */}
        <div className="col-span-5 flex items-center space-x-2">
          <div
            className="h-6 w-1 rounded-none flex-shrink-0"
            style={{ backgroundColor: fixture.homeColor }}
          />
          <div className="min-w-0">
            <div className="text-xs font-bold text-text-primary truncate">
              {fixture.homeTeam}
            </div>
            <div className="text-[9px] font-mono text-text-muted uppercase">
              {fixture.homeShort} • HOME
            </div>
          </div>
        </div>

        {/* Center Scoreline Forecast & Expected Goals */}
        <div className="col-span-2 flex flex-col items-center justify-center">
          <div className="font-mono text-xs font-black tracking-widest px-2 py-0.5 bg-background border border-border text-text-primary rounded-none shadow-inner tabular-nums">
            {fixture.predictedScore}
          </div>
          <span className="text-[8px] font-mono text-text-muted mt-0.5 tracking-wider uppercase">
            FORECAST
          </span>
        </div>

        {/* Away Club */}
        <div className="col-span-5 flex items-center justify-end space-x-2 text-right">
          <div className="min-w-0">
            <div className="text-xs font-bold text-text-primary truncate">
              {fixture.awayTeam}
            </div>
            <div className="text-[9px] font-mono text-text-muted uppercase">
              AWAY • {fixture.awayShort}
            </div>
          </div>
          <div
            className="h-6 w-1 rounded-none flex-shrink-0"
            style={{ backgroundColor: fixture.awayColor }}
          />
        </div>
      </div>

      {/* Outcome Probability Distribution */}
      <div className="pt-1.5 border-t border-border-subtle">
        {/* Precision Segmented Bar */}
        <div
          className="h-1 w-full flex bg-background overflow-hidden rounded-none"
          role="img"
          aria-label={`Home ${fixture.homeWinProb} percent, draw ${fixture.drawProb} percent, away ${fixture.awayWinProb} percent`}
        >
          <div
            style={{ width: `${fixture.homeWinProb}%` }}
            className="bg-brand-accent transition-all"
            title={`Home Win: ${fixture.homeWinProb}%`}
          />
          <div
            style={{ width: `${fixture.drawProb}%` }}
            className="bg-zinc-700 transition-all"
            title={`Draw: ${fixture.drawProb}%`}
          />
          <div
            style={{ width: `${fixture.awayWinProb}%` }}
            className="bg-zinc-400 transition-all"
            title={`Away Win: ${fixture.awayWinProb}%`}
          />
        </div>

        {/* Stats and Favorite Callout */}
        <div className="flex items-center justify-between mt-1 text-[9px] font-mono">
          <div className="flex items-center space-x-2">
            <span className="text-brand-accent font-bold">H {fixture.homeWinProb}%</span>
            <span className="text-zinc-400 font-bold">D {fixture.drawProb}%</span>
            <span className="text-zinc-300 font-bold">A {fixture.awayWinProb}%</span>
          </div>
          <div className="flex items-center text-text-primary">
            <span className="text-text-muted mr-1">FAV:</span>
            <span className={`font-bold ${
              fixture.predictedOutcome === 'Home Win'
                ? 'text-brand-accent'
                : fixture.predictedOutcome === 'Away Win'
                ? 'text-zinc-300'
                : 'text-zinc-400'
            }`}>
              {fixture.predictedOutcome.toUpperCase()}
            </span>
            <ChevronRight className="h-2.5 w-2.5 ml-0.5 text-text-muted group-hover:text-brand-accent group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
