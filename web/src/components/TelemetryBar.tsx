import React from 'react';
import { Activity, Search, ShieldCheck, Flame, Zap, Trophy } from 'lucide-react';

interface TelemetryBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  champion?: string;
  season?: string;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({
  searchQuery,
  setSearchQuery,
  champion = 'Arsenal',
  season = '2026/27',
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur-none select-none">
      {/* Upper Telemetry Bar */}
      <div className="border-b border-border-subtle bg-surface-subtle px-3 py-1 text-[10px] font-mono text-text-muted">
        <div className="mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          {/* Left: Model & Pipeline Status */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <span className="flex items-center text-brand-accent font-bold">
              <Activity className="mr-1 h-3 w-3" />
              LIVE TELEMETRY
            </span>
            <span className="text-border">|</span>
            <span className="text-text-secondary">
              MODEL: <span className="text-text-primary font-bold">RF + XGB ENSEMBLE</span>
            </span>
            <span className="text-border hidden sm:inline">|</span>
            <span className="hidden sm:inline text-text-muted">
              LOSS: <span className="text-brand-accent font-bold">0.962 LOG-LOSS</span>
            </span>
            <span className="text-border hidden md:inline">|</span>
            <span className="hidden md:inline text-text-muted">
              xG ENGINE: <span className="text-text-secondary font-bold">POISSON (MAE 0.74)</span>
            </span>
          </div>

          {/* Right: Projected Title Race Odds */}
          <div className="flex items-center space-x-2.5 flex-shrink-0">
            <span className="flex items-center text-[10px] text-text-muted">
              <Trophy className="mr-1 h-2.5 w-2.5 text-brand-accent" />
              PROJ. CHAMPION:
            </span>
            <span className="px-1.5 py-0.2 rounded-none bg-background border border-brand-accent/40 text-brand-accent font-bold text-[10px]">
              {champion}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Bar with Search */}
      <div className="px-3 py-2 flex items-center justify-between gap-3 bg-surface">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-black uppercase text-text-primary tracking-wider truncate">
              PREMIER LEAGUE {season}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-none bg-surface-active border border-border text-text-secondary hidden sm:inline">
              380 FIXTURES • TIME-SERIES SPLIT
            </span>
          </div>
        </div>

        {/* Global Club / Fixture Search Input */}
        <div className="relative w-48 sm:w-64 flex-shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search club or fixture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search club or fixture"
            className="w-full rounded-none border border-border bg-background px-2.5 py-1.5 pl-8 text-xs font-mono text-text-primary placeholder:text-text-muted focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-text-muted hover:text-text-primary"
            >
              ESC
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
