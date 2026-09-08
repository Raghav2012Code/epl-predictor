import React from 'react';
import { Trophy, Calendar, Swords, BarChart3, Search, Activity, Cpu } from 'lucide-react';

interface NavbarProps {
  activeTab: 'fixtures' | 'simulator' | 'standings' | 'analytics';
  setActiveTab: (tab: 'fixtures' | 'simulator' | 'standings' | 'analytics') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  season: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  season,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
      {/* Top micro-bar */}
      <div className="border-b border-border-subtle bg-surface-subtle/60 px-4 py-1.5 text-xs text-text-muted">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="flex items-center text-text-secondary">
              <Activity className="mr-1.5 h-3 w-3 text-pl-green" />
              OFFICIAL FIXTURES & DATA ENGINE
            </span>
            <span className="text-border">|</span>
            <span>DATA SOURCE: OPENFOOTBALL & HISTORICAL EPL STATS</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-border-subtle text-[11px] font-mono text-text-secondary border border-border">
              <Cpu className="mr-1 h-2.5 w-2.5 text-pl-cyan" />
              XGBOOST DUAL-ENGINE ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-pl-purple border border-pl-purpleLight shadow-inner">
            <Trophy className="h-5 w-5 text-pl-green" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-sans font-black tracking-wider text-text-primary text-base uppercase">
                Premier League
              </span>
              <span className="font-mono text-xs px-1.5 py-0.2 rounded-sm bg-pl-purple/80 border border-pl-purpleLight text-white font-semibold">
                {season}
              </span>
            </div>
            <p className="text-[11px] text-text-muted tracking-tight">
              Match Outcome & Expected Goals Scoreline Predictor
            </p>
          </div>
        </div>

        {/* View Tabs */}
        <nav className="flex items-center space-x-1 border border-border bg-surface rounded-sm p-0.5">
          <button
            onClick={() => setActiveTab('fixtures')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
              activeTab === 'fixtures'
                ? 'bg-pl-purple text-white shadow-sm font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Fixtures</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
              activeTab === 'simulator'
                ? 'bg-pl-purple text-white shadow-sm font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <Swords className="h-3.5 w-3.5" />
            <span>H2H Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('standings')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
              activeTab === 'standings'
                ? 'bg-pl-purple text-white shadow-sm font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>Table Projection</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
              activeTab === 'analytics'
                ? 'bg-pl-purple text-white shadow-sm font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Model Intelligence</span>
          </button>
        </nav>

        {/* Search Input */}
        <div className="relative hidden md:block w-48 lg:w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search club..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-sm border border-border bg-surface px-2.5 py-1.5 pl-8 text-xs text-text-primary placeholder:text-text-muted focus:border-pl-purpleLight focus:outline-none focus:ring-1 focus:ring-pl-purpleLight font-sans"
          />
        </div>
      </div>
    </header>
  );
};
