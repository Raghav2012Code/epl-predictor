import React, { useEffect, useMemo, useRef } from 'react';
import { Activity, Search, Trophy, Shield, CalendarDays } from 'lucide-react';
import { Fixture, StandingsRow, TeamProfile } from '../types';

interface TelemetryBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  champion?: string;
  season?: string;
  logLoss?: number;
  goalMae?: number;
  productionModel?: string;
  teams?: Record<string, TeamProfile>;
  standings?: StandingsRow[];
  fixtures?: Fixture[];
  onSelectClub?: (teamName: string) => void;
  onOpenFixture?: (homeTeam: string, awayTeam: string) => void;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({
  searchQuery,
  setSearchQuery,
  champion = 'Arsenal',
  season = '2026/27',
  logLoss,
  goalMae,
  productionModel = 'RF + XGB',
  teams = {},
  standings = [],
  fixtures = [],
  onSelectClub,
  onOpenFixture,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Global shortcut: "/" focuses search from anywhere (unless typing already).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      if (e.key === '/' && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        setSearchQuery('');
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setSearchQuery]);

  const query = searchQuery.trim().toLowerCase();
  const clubHits = useMemo(() => {
    if (!query) return [];
    return Object.values(teams)
      .filter((t) => t.name.toLowerCase().includes(query))
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 5);
  }, [teams, query]);
  const fixtureHits = useMemo(() => {
    if (!query) return [];
    return fixtures
      .filter(
        (f) =>
          f.homeTeam.toLowerCase().includes(query) ||
          f.awayTeam.toLowerCase().includes(query),
      )
      .slice(0, 6);
  }, [fixtures, query]);
  const hasResults = query !== '' && (clubHits.length > 0 || fixtureHits.length > 0);
  const totalHits = clubHits.length + fixtureHits.length;

  const pickClub = (name: string) => {
    setSearchQuery('');
    onSelectClub?.(name);
  };
  const pickFixture = (f: Fixture) => {
    setSearchQuery('');
    onOpenFixture?.(f.homeTeam, f.awayTeam);
  };

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
              MODEL: <span className="text-text-primary font-bold">{productionModel} ENSEMBLE</span>
            </span>
            <span className="text-border hidden sm:inline">|</span>
            <span className="hidden sm:inline text-text-muted">
              LOSS:{' '}
              <span className="text-brand-accent font-bold">
                {logLoss !== undefined ? `${logLoss.toFixed(3)} LOG-LOSS` : '— LOG-LOSS'}
              </span>
            </span>
            <span className="text-border hidden md:inline">|</span>
            <span className="hidden md:inline text-text-muted">
              xG ENGINE:{' '}
              <span className="text-text-secondary font-bold">
                {goalMae !== undefined ? `POISSON (MAE ${goalMae.toFixed(2)})` : 'POISSON'}
              </span>
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
            ref={inputRef}
            type="text"
            placeholder="Search club or fixture...  ( / )"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && totalHits > 0) {
                if (clubHits.length > 0) pickClub(clubHits[0].name);
                else if (fixtureHits.length > 0) pickFixture(fixtureHits[0]);
              }
            }}
            aria-label="Search clubs, standings, and fixtures"
            aria-expanded={hasResults}
            role="combobox"
            aria-autocomplete="list"
            className="w-full rounded-none border border-border bg-background px-2.5 py-1.5 pl-8 text-xs font-mono text-text-primary placeholder:text-text-muted focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-text-muted hover:text-text-primary"
            >
              ESC
            </button>
          )}

          {/* Grouped global results */}
          {query !== '' && (
            <div
              role="listbox"
              aria-label="Search results"
              className="absolute right-0 top-full z-50 mt-1 max-h-80 w-72 overflow-y-auto border border-border bg-surface shadow-lg"
            >
              <div className="border-b border-border-subtle px-2.5 py-1 text-[10px] font-mono text-text-muted">
                {totalHits > 0 ? `${totalHits} result${totalHits === 1 ? '' : 's'}` : 'No matches'}
                <span className="text-text-muted"> — Enter selects first</span>
              </div>
              {clubHits.length > 0 && (
                <div>
                  <div className="px-2.5 pt-1.5 text-[9px] font-mono uppercase tracking-wider text-text-muted">
                    Clubs ({clubHits.length})
                  </div>
                  {clubHits.map((t) => {
                    const row = standings.find((s) => s.team === t.name);
                    return (
                      <button
                        key={t.name}
                        role="option"
                        aria-selected="false"
                        onClick={() => pickClub(t.name)}
                        className="flex w-full items-center justify-between px-2.5 py-1.5 text-left text-xs hover:bg-surface-hover"
                      >
                        <span className="flex items-center space-x-2 font-bold text-text-primary">
                          <Shield className="h-3 w-3 text-brand-accent" />
                          <span>{t.name}</span>
                        </span>
                        <span className="font-mono text-[10px] text-text-muted">
                          {row ? `#${row.rank} • ${row.points}pts` : `#${t.rank}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              {fixtureHits.length > 0 && (
                <div>
                  <div className="px-2.5 pt-1.5 text-[9px] font-mono uppercase tracking-wider text-text-muted">
                    Fixtures ({fixtureHits.length})
                  </div>
                  {fixtureHits.map((f) => (
                    <button
                      key={f.id}
                      role="option"
                      aria-selected="false"
                      onClick={() => pickFixture(f)}
                      className="flex w-full items-center justify-between px-2.5 py-1.5 text-left text-xs hover:bg-surface-hover"
                    >
                      <span className="flex items-center space-x-2 font-bold text-text-primary">
                        <CalendarDays className="h-3 w-3 text-text-secondary" />
                        <span className="truncate">
                          {f.homeTeam} vs {f.awayTeam}
                        </span>
                      </span>
                      <span className="font-mono text-[10px] text-text-muted">GW{f.gameweek}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
