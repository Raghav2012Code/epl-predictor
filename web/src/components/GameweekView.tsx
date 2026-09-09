import React, { useState } from 'react';
import { Fixture, TeamProfile } from '../types';
import { MatchCard } from './MatchCard';
import { ChevronLeft, ChevronRight, X, Swords, Shield, Target, Activity } from 'lucide-react';

interface GameweekViewProps {
  fixtures: Fixture[];
  teams: Record<string, TeamProfile>;
  searchQuery: string;
  onOpenSimulator: (homeTeam: string, awayTeam: string) => void;
}

export const GameweekView: React.FC<GameweekViewProps> = ({
  fixtures,
  teams,
  searchQuery,
  onOpenSimulator,
}) => {
  const [currentGW, setCurrentGW] = useState<number>(7);
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'played'>('all');
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);

  // Filter fixtures by gameweek
  const gwFixtures = fixtures.filter((f) => f.gameweek === currentGW);

  // Filter by status & search
  const displayedFixtures = gwFixtures.filter((f) => {
    const matchesSearch =
      searchQuery === '' ||
      f.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.awayTeam.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'upcoming') return f.status === 'Upcoming';
    if (filterStatus === 'played') return f.status === 'Played';
    return true;
  });

  const homeProfile = selectedFixture ? teams[selectedFixture.homeTeam] : null;
  const awayProfile = selectedFixture ? teams[selectedFixture.awayTeam] : null;

  // Active fixture for the studio inspector (defaults to first displayed or first in GW)
  const activeFixture = selectedFixture || displayedFixtures[0] || gwFixtures[0] || null;
  const activeHomeProfile = activeFixture ? teams[activeFixture.homeTeam] : null;
  const activeAwayProfile = activeFixture ? teams[activeFixture.awayTeam] : null;

  // Gameweek macro-metrics
  const roundGoals = gwFixtures.reduce((sum, f) => sum + (f.predHomeGoals + f.predAwayGoals), 0);
  const avgHomeProb = Math.round(
    gwFixtures.reduce((sum, f) => sum + f.homeWinProb, 0) / (gwFixtures.length || 1)
  );
  const marqueeMatch = [...gwFixtures].sort(
    (a, b) => Math.max(b.homeWinProb, b.awayWinProb) - Math.max(a.homeWinProb, a.awayWinProb)
  )[0];

  return (
    <div className="space-y-3">
      {/* Gameweek Intelligence KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono select-none">
        <div className="border border-border bg-surface p-2.5 rounded-none flex flex-col justify-between">
          <span className="text-[9px] text-text-muted uppercase tracking-wider">ROUND SCHEDULE</span>
          <div className="text-sm font-black text-text-primary mt-0.5">
            GW {currentGW} <span className="text-xs text-text-muted font-normal">({gwFixtures.length} MATCHES)</span>
          </div>
        </div>

        <div className="border border-border bg-surface p-2.5 rounded-none flex flex-col justify-between">
          <span className="text-[9px] text-text-muted uppercase tracking-wider">PROJECTED GOALS</span>
          <div className="text-sm font-black text-brand-accent mt-0.5">
            {roundGoals} GOALS <span className="text-xs text-text-muted font-normal">({(roundGoals / (gwFixtures.length || 1)).toFixed(2)}/M)</span>
          </div>
        </div>

        <div className="border border-border bg-surface p-2.5 rounded-none flex flex-col justify-between">
          <span className="text-[9px] text-text-muted uppercase tracking-wider">AVG HOME ADVANTAGE</span>
          <div className="text-sm font-black text-text-primary mt-0.5">
            {avgHomeProb}% <span className="text-xs text-text-muted font-normal">WIN BASE</span>
          </div>
        </div>

        <div className="border border-border bg-surface p-2.5 rounded-none flex flex-col justify-between">
          <span className="text-[9px] text-text-muted uppercase tracking-wider">TOP FAVORITE PICK</span>
          <div className="text-sm font-black text-text-primary mt-0.5 truncate">
            {marqueeMatch ? (
              <span className="truncate">
                {marqueeMatch.homeWinProb >= marqueeMatch.awayWinProb ? marqueeMatch.homeTeam : marqueeMatch.awayTeam}{' '}
                <span className="text-brand-accent font-bold">
                  ({Math.max(marqueeMatch.homeWinProb, marqueeMatch.awayWinProb)}%)
                </span>
              </span>
            ) : (
              '—'
            )}
          </div>
        </div>
      </div>

      {/* Gameweek Navigation & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-border bg-surface p-2.5 rounded-none gap-2 select-none">
        {/* Navigation & Selector */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setCurrentGW((prev) => Math.max(1, prev - 1))}
            disabled={currentGW === 1}
            aria-label="Previous gameweek"
            className="flex h-6 w-6 items-center justify-center rounded-none border border-border bg-surface-subtle text-text-secondary hover:text-text-primary hover:border-brand-accent/40 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-center space-x-1.5 font-mono">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              GW
            </span>
            <select
              value={currentGW}
              onChange={(e) => setCurrentGW(Number(e.target.value))}
              aria-label="Select gameweek"
              className="rounded-none border border-border bg-background px-2 py-0.5 text-xs font-mono font-bold text-text-primary focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
            >
              {Array.from({ length: 38 }, (_, i) => i + 1).map((gw) => (
                <option key={gw} value={gw}>
                  GW {gw} {gw <= 2 ? '• Played' : gw === 7 ? '• Current' : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setCurrentGW((prev) => Math.min(38, prev + 1))}
            disabled={currentGW === 38}
            aria-label="Next gameweek"
            className="flex h-6 w-6 items-center justify-center rounded-none border border-border bg-surface-subtle text-text-secondary hover:text-text-primary hover:border-brand-accent/40 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 border border-border bg-surface-subtle p-0.5 rounded-none text-[10px] font-mono">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2 py-0.5 rounded-none transition-colors ${
              filterStatus === 'all'
                ? 'bg-surface-active text-brand-accent border border-brand-accent/40 font-bold shadow-sm'
                : 'text-text-muted hover:text-text-secondary border border-transparent'
            }`}
          >
            ALL ({gwFixtures.length})
          </button>
          <button
            onClick={() => setFilterStatus('upcoming')}
            className={`px-2 py-0.5 rounded-none transition-colors ${
              filterStatus === 'upcoming'
                ? 'bg-surface-active text-brand-accent border border-brand-accent/40 font-bold shadow-sm'
                : 'text-text-muted hover:text-text-secondary border border-transparent'
            }`}
          >
            UPCOMING ({gwFixtures.filter((f) => f.status === 'Upcoming').length})
          </button>
          <button
            onClick={() => setFilterStatus('played')}
            className={`px-2 py-0.5 rounded-none transition-colors ${
              filterStatus === 'played'
                ? 'bg-surface-active text-brand-accent border border-brand-accent/40 font-bold shadow-sm'
                : 'text-text-muted hover:text-text-secondary border border-transparent'
            }`}
          >
            PLAYED ({gwFixtures.filter((f) => f.status === 'Played').length})
          </button>
        </div>
      </div>

      {/* 60/40 Split Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Left Pane (60% on desktop): Compact Fixture Matrix */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-2">
          {displayedFixtures.length === 0 ? (
            <div className="border border-border bg-surface p-8 text-center rounded-none font-mono text-xs text-text-muted">
              No fixtures match the selected filters or search query.
            </div>
          ) : (
            displayedFixtures.map((f) => (
              <MatchCard
                key={f.id}
                fixture={f}
                isSelected={activeFixture?.id === f.id}
                onSelect={(fixture) => setSelectedFixture(fixture)}
              />
            ))
          )}
        </div>

        {/* Right Pane (40% on desktop): Deep-Dive Inspection Studio */}
        <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-14">
          {activeFixture ? (
            <div className="border border-border bg-surface p-4 rounded-none space-y-3 select-none">
              {/* Studio Header */}
              <div className="border-b border-border pb-2.5 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-brand-accent font-bold">
                    INSPECTION STUDIO • GW {activeFixture.gameweek}
                  </div>
                  <h3 className="text-sm font-bold text-text-primary font-mono mt-0.5 truncate">
                    {activeFixture.homeTeam} vs {activeFixture.awayTeam}
                  </h3>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-none bg-background border border-border text-text-secondary">
                  {activeFixture.status.toUpperCase()}
                </span>
              </div>

              {/* Matchup Hero Box */}
              <div className="border border-border bg-background p-3 rounded-none space-y-2.5">
                <div className="text-[9px] font-mono text-text-muted text-center uppercase tracking-wider">
                  MODEL PREDICTED SCORE & CONTINUOUS xG
                </div>
                <div className="grid grid-cols-5 items-center text-center font-mono">
                  <div className="col-span-2">
                    <div className="text-xs font-bold text-text-primary truncate">
                      {activeFixture.homeTeam}
                    </div>
                    <div className="text-xl font-black text-brand-accent mt-0.5 tabular-nums">
                      {activeFixture.predHomeGoals}
                    </div>
                    <div className="text-[9px] text-text-muted">
                      PROJ {activeFixture.predHomeGoals.toFixed(1)} xG
                    </div>
                  </div>

                  <div className="col-span-1 text-xs font-bold text-text-muted">
                    VS
                  </div>

                  <div className="col-span-2">
                    <div className="text-xs font-bold text-text-primary truncate">
                      {activeFixture.awayTeam}
                    </div>
                    <div className="text-xl font-black text-sky-400 mt-0.5 tabular-nums">
                      {activeFixture.predAwayGoals}
                    </div>
                    <div className="text-[9px] text-text-muted">
                      PROJ {activeFixture.predAwayGoals.toFixed(1)} xG
                    </div>
                  </div>
                </div>

                {/* Segmented probability bar */}
                <div className="pt-2 border-t border-border-subtle">
                  <div className="h-1.5 w-full flex bg-surface overflow-hidden rounded-none">
                    <div
                      style={{ width: `${activeFixture.homeWinProb}%` }}
                      className="bg-brand-accent"
                      title={`Home Win: ${activeFixture.homeWinProb}%`}
                    />
                    <div
                      style={{ width: `${activeFixture.drawProb}%` }}
                      className="bg-slate-600"
                      title={`Draw: ${activeFixture.drawProb}%`}
                    />
                    <div
                      style={{ width: `${activeFixture.awayWinProb}%` }}
                      className="bg-sky-400"
                      title={`Away Win: ${activeFixture.awayWinProb}%`}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[9px] font-mono">
                    <span className="text-brand-accent font-bold">HOME {activeFixture.homeWinProb}%</span>
                    <span className="text-slate-400 font-bold">DRAW {activeFixture.drawProb}%</span>
                    <span className="text-sky-400 font-bold">AWAY {activeFixture.awayWinProb}%</span>
                  </div>
                </div>
              </div>

              {/* Match Metadata Info */}
              <div className="border border-border bg-surface-subtle p-2.5 rounded-none space-y-1 text-[10px] font-mono">
                <div className="flex justify-between text-text-secondary">
                  <span className="text-text-muted">STADIUM</span>
                  <span className="text-text-primary truncate max-w-[200px]">{activeFixture.stadium}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span className="text-text-muted">DATE & TIME</span>
                  <span className="text-text-primary">{activeFixture.date} • {activeFixture.time}</span>
                </div>
              </div>

              {/* Head to Head Form Matrix */}
              {activeHomeProfile && activeAwayProfile && (
                <div className="border border-border bg-surface-subtle p-2.5 rounded-none space-y-2">
                  <div className="text-[9px] font-mono uppercase tracking-wider text-text-muted font-bold">
                    FORM & ATTACK / DEFENSE METRICS
                  </div>

                  <div className="space-y-1.5 text-[10px] font-mono">
                    {/* Home Form */}
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary truncate max-w-[110px]">
                        {activeHomeProfile.name}
                      </span>
                      <div className="flex space-x-1">
                        {activeHomeProfile.last5Form.map((res, i) => (
                          <span
                            key={i}
                            className={`w-3.5 h-3.5 flex items-center justify-center font-bold text-[8px] rounded-none border ${
                              res === 'W'
                                ? 'bg-brand-primary text-white border-brand-primary'
                                : res === 'D'
                                ? 'bg-slate-700 text-slate-200 border-slate-600'
                                : 'bg-rose-900/60 text-rose-200 border-rose-800'
                            }`}
                          >
                            {res}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Away Form */}
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary truncate max-w-[110px]">
                        {activeAwayProfile.name}
                      </span>
                      <div className="flex space-x-1">
                        {activeAwayProfile.last5Form.map((res, i) => (
                          <span
                            key={i}
                            className={`w-3.5 h-3.5 flex items-center justify-center font-bold text-[8px] rounded-none border ${
                              res === 'W'
                                ? 'bg-brand-primary text-white border-brand-primary'
                                : res === 'D'
                                ? 'bg-slate-700 text-slate-200 border-slate-600'
                                : 'bg-rose-900/60 text-rose-200 border-rose-800'
                            }`}
                          >
                            {res}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Attacking Ratio Bar */}
                  <div className="pt-2 border-t border-border-subtle space-y-1 text-[9px] font-mono">
                    <div className="flex justify-between text-text-muted">
                      <span>{activeHomeProfile.gfPerMatch} G/M</span>
                      <span className="text-text-secondary uppercase">GOALS SCORED AVG</span>
                      <span>{activeAwayProfile.gfPerMatch} G/M</span>
                    </div>
                    <div className="h-1 w-full flex bg-background">
                      <div
                        style={{
                          width: `${(activeHomeProfile.gfPerMatch / (activeHomeProfile.gfPerMatch + activeAwayProfile.gfPerMatch || 1)) * 100}%`,
                        }}
                        className="bg-brand-accent"
                      />
                      <div
                        style={{
                          width: `${(activeAwayProfile.gfPerMatch / (activeHomeProfile.gfPerMatch + activeAwayProfile.gfPerMatch || 1)) * 100}%`,
                        }}
                        className="bg-sky-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Simulation Quick Launcher Button */}
              <button
                onClick={() => onOpenSimulator(activeFixture.homeTeam, activeFixture.awayTeam)}
                className="w-full flex items-center justify-center space-x-1.5 border border-brand-accent/40 bg-surface-active py-2 text-xs font-mono font-bold text-brand-accent rounded-none hover:bg-surface-hover hover:border-brand-accent transition-colors"
              >
                <Swords className="h-3 w-3" />
                <span>OPEN WHAT-IF MATCH SIMULATOR</span>
              </button>
            </div>
          ) : (
            <div className="border border-border bg-surface p-8 text-center rounded-none font-mono text-xs text-text-muted">
              Select a fixture to inspect intelligence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

