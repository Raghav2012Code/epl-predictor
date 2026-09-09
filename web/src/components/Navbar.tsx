import React from 'react';
import { Trophy, Calendar, Swords, BarChart3, Search, Activity, Cpu, Shield } from 'lucide-react';

export type NavTab = 'fixtures' | 'simulator' | 'standings' | 'analytics' | 'clubs';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
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
              <Activity className="mr-1.5 h-3 w-3 text-brand-accent" />
              OFFICIAL FIXTURES & DATA ENGINE
            </span>
            <span className="hidden sm:inline text-text-muted" aria-hidden="true">|</span>
            <span className="hidden sm:inline">DATA SOURCE: OPENFOOTBALL & HISTORICAL EPL STATS</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-border-subtle text-[11px] font-mono text-text-secondary border border-border">
              <Cpu className="mr-1 h-2.5 w-2.5 text-brand-accent" />
              RF + XGB DUAL-ENGINE ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="mx-auto max-w-7xl px-4 py-3 space-y-3">
        <div className="flex items-center justify-between gap-3">
          {/* Brand identity */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-brand-surface to-brand-primary border border-brand-primary/50 shadow-inner">
              <Trophy className="h-5 w-5 text-brand-accent" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-sans font-black tracking-wider text-text-primary text-sm sm:text-base uppercase truncate">
                  Premier League
                </span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded-md bg-brand-surface border border-brand-accent/40 text-brand-accent font-semibold flex-shrink-0">
                  {season}
                </span>
              </div>
              <p className="text-[11px] text-text-muted tracking-tight truncate">
                Match Outcome & Expected Goals Scoreline Predictor
              </p>
            </div>
          </div>

          {/* Search Input (desktop) */}
          <div className="relative hidden md:block w-48 lg:w-56 flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search club..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search club"
              className="w-full rounded-md border border-border bg-surface px-2.5 py-2 pl-8 text-xs text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary font-sans"
            />
          </div>
        </div>

        {/* View Tabs (horizontally scrollable on mobile) */}
        <nav
          aria-label="Primary views"
          className="flex items-center gap-1 overflow-x-auto no-scrollbar border border-border bg-surface rounded-md p-1 -mx-1 px-1"
        >
          {(
            [
              { id: 'fixtures', label: 'Fixtures', Icon: Calendar },
              { id: 'simulator', label: 'H2H Simulator', Icon: Swords },
              { id: 'standings', label: 'Table', Icon: Trophy },
              { id: 'clubs', label: 'Clubs', Icon: Shield },
              { id: 'analytics', label: 'Intelligence', Icon: BarChart3 },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}
              className={`flex flex-shrink-0 items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors min-h-[36px] ${
                activeTab === id
                  ? 'bg-brand-primary text-white shadow-sm font-semibold hover:bg-brand-primaryHover'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          ))}
        </nav>

        {/* Search Input (mobile) */}
        <div className="relative md:hidden">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search club..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search club"
            className="w-full rounded-md border border-border bg-surface px-2.5 py-2.5 pl-8 text-base sm:text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary font-sans"
          />
        </div>
      </div>
    </header>
  );
};
