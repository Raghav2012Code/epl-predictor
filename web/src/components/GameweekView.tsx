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

  return (
    <div className="space-y-4">
      {/* Gameweek Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-border bg-surface p-3 rounded-sm gap-3">
        {/* Navigation & Selector */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentGW((prev) => Math.max(1, prev - 1))}
            disabled={currentGW === 1}
            className="flex h-7 w-7 items-center justify-center rounded-sm border border-border bg-surface-subtle text-text-secondary hover:text-text-primary hover:bg-surface-hover disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Gameweek
            </span>
            <select
              value={currentGW}
              onChange={(e) => setCurrentGW(Number(e.target.value))}
              className="rounded-sm border border-border bg-background px-2.5 py-1 text-xs font-mono font-bold text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              {Array.from({ length: 38 }, (_, i) => i + 1).map((gw) => (
                <option key={gw} value={gw}>
                  GW {gw} {gw <= 2 ? '(Played)' : gw === 7 ? '(Current Focus)' : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setCurrentGW((prev) => Math.min(38, prev + 1))}
            disabled={currentGW === 38}
            className="flex h-7 w-7 items-center justify-center rounded-sm border border-border bg-surface-subtle text-text-secondary hover:text-text-primary hover:bg-surface-hover disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 border border-border bg-surface-subtle p-0.5 rounded-sm text-xs font-mono">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 py-1 rounded-sm transition-colors ${
              filterStatus === 'all'
                ? 'bg-border text-text-primary font-bold'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            ALL ({gwFixtures.length})
          </button>
          <button
            onClick={() => setFilterStatus('upcoming')}
            className={`px-2.5 py-1 rounded-sm transition-colors ${
              filterStatus === 'upcoming'
                ? 'bg-border text-text-primary font-bold'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            UPCOMING ({gwFixtures.filter((f) => f.status === 'Upcoming').length})
          </button>
          <button
            onClick={() => setFilterStatus('played')}
            className={`px-2.5 py-1 rounded-sm transition-colors ${
              filterStatus === 'played'
                ? 'bg-border text-text-primary font-bold'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            PLAYED ({gwFixtures.filter((f) => f.status === 'Played').length})
          </button>
        </div>
      </div>

      {/* Fixture Grid */}
      {displayedFixtures.length === 0 ? (
        <div className="border border-border bg-surface p-12 text-center rounded-sm">
          <p className="text-xs text-text-muted font-mono">
            No fixtures match the selected filters or search query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayedFixtures.map((f) => (
            <MatchCard
              key={f.id}
              fixture={f}
              isSelected={selectedFixture?.id === f.id}
              onSelect={(fixture) => setSelectedFixture(fixture)}
            />
          ))}
        </div>
      )}

      {/* Detailed Match Inspection Drawer */}
      {selectedFixture && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-border bg-surface p-5 shadow-2xl overflow-y-auto">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
                MATCH INTELLIGENCE REPORT • GW {selectedFixture.gameweek}
              </div>
              <h3 className="text-sm font-bold text-text-primary mt-0.5">
                {selectedFixture.homeTeam} vs {selectedFixture.awayTeam}
              </h3>
            </div>
            <button
              onClick={() => setSelectedFixture(null)}
              className="rounded-sm border border-border p-1 text-text-muted hover:text-text-primary hover:bg-surface-hover"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="py-4 space-y-4">
            {/* Forecast Hero Box */}
            <div className="border border-border bg-background p-4 rounded-sm">
              <div className="text-[10px] font-mono text-text-muted text-center uppercase tracking-wider mb-2">
                MODEL PREDICTED OUTCOME
              </div>
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <div className="text-xs font-bold text-text-primary">
                    {selectedFixture.homeTeam}
                  </div>
                  <div className="text-xl font-mono font-black text-brand-accent mt-1">
                    {selectedFixture.predHomeGoals}
                  </div>
                </div>
                <div className="text-xs font-mono text-text-muted font-bold">VS</div>
                <div className="text-center">
                  <div className="text-xs font-bold text-text-primary">
                    {selectedFixture.awayTeam}
                  </div>
                  <div className="text-xl font-mono font-black text-text-primary mt-1">
                    {selectedFixture.predAwayGoals}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-mono">
                <span className="text-text-muted">Probability:</span>
                <div className="flex space-x-2">
                  <span className="text-brand-accent font-bold">H: {selectedFixture.homeWinProb}%</span>
                  <span className="text-slate-300 font-bold">D: {selectedFixture.drawProb}%</span>
                  <span className="text-text-secondary font-bold">A: {selectedFixture.awayWinProb}%</span>
                </div>
              </div>
            </div>

            {/* Stadium & Kickoff details */}
            <div className="border border-border bg-surface-subtle p-3 rounded-sm space-y-1.5 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span className="text-text-muted">Venue</span>
                <span className="font-mono">{selectedFixture.stadium}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span className="text-text-muted">Scheduled Date</span>
                <span className="font-mono">{selectedFixture.date} at {selectedFixture.time}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span className="text-text-muted">Fixture Status</span>
                <span className="font-mono text-brand-accent">{selectedFixture.status}</span>
              </div>
            </div>

            {/* Recent Form Comparison */}
            {homeProfile && awayProfile && (
              <div className="border border-border bg-surface-subtle p-3 rounded-sm space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted font-bold">
                  RECENT FORM (LAST 5 MATCHES)
                </div>

                <div className="space-y-2 text-xs">
                  {/* Home Form */}
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary truncate max-w-[120px]">
                      {homeProfile.name}
                    </span>
                    <div className="flex space-x-1 font-mono text-[10px]">
                      {homeProfile.last5Form.map((res, i) => (
                        <span
                          key={i}
                          className={`w-4 h-4 flex items-center justify-center font-bold rounded-none ${
                            res === 'W'
                              ? 'bg-brand-primary text-white'
                              : res === 'D'
                              ? 'bg-slate-600 text-white'
                              : 'bg-red-800 text-white'
                          }`}
                        >
                          {res}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Away Form */}
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary truncate max-w-[120px]">
                      {awayProfile.name}
                    </span>
                    <div className="flex space-x-1 font-mono text-[10px]">
                      {awayProfile.last5Form.map((res, i) => (
                        <span
                          key={i}
                          className={`w-4 h-4 flex items-center justify-center font-bold rounded-none ${
                            res === 'W'
                              ? 'bg-brand-primary text-white'
                              : res === 'D'
                              ? 'bg-slate-600 text-white'
                              : 'bg-red-800 text-white'
                          }`}
                        >
                          {res}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stat Bars */}
                <div className="pt-2 border-t border-border space-y-2 text-[11px]">
                  <div>
                    <div className="flex justify-between text-text-muted mb-1">
                      <span>{homeProfile.gfPerMatch} G/M</span>
                      <span className="font-mono text-text-secondary">Goals Scored Avg</span>
                      <span>{awayProfile.gfPerMatch} G/M</span>
                    </div>
                    <div className="h-1.5 w-full flex bg-background">
                      <div
                        style={{
                          width: `${(homeProfile.gfPerMatch / (homeProfile.gfPerMatch + awayProfile.gfPerMatch || 1)) * 100}%`,
                        }}
                        className="bg-brand-primary"
                      />
                      <div
                        style={{
                          width: `${(awayProfile.gfPerMatch / (homeProfile.gfPerMatch + awayProfile.gfPerMatch || 1)) * 100}%`,
                        }}
                        className="bg-brand-accent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Launch In Simulator Button */}
            <button
              onClick={() => {
                onOpenSimulator(selectedFixture.homeTeam, selectedFixture.awayTeam);
                setSelectedFixture(null);
              }}
              className="w-full flex items-center justify-center space-x-2 border border-brand-primary bg-brand-primary py-2 text-xs font-bold text-white rounded-sm hover:bg-brand-primaryHover transition-colors"
            >
              <Swords className="h-3.5 w-3.5" />
              <span>Simulate in H2H Arena with Custom What-Ifs</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
