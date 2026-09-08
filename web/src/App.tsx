import React, { useState } from 'react';
import eplDataRaw from './data/eplData.json';
import { EPLDataset } from './types';
import { Navbar, NavTab } from './components/Navbar';
import { GameweekView } from './components/GameweekView';
import { MatchSimulator } from './components/MatchSimulator';
import { StandingsView } from './components/StandingsView';
import { AnalyticsView } from './components/AnalyticsView';
import { ClubView } from './components/ClubView';
import { ExternalLink, Github, Terminal } from 'lucide-react';

const dataset = eplDataRaw as unknown as EPLDataset;

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('fixtures');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClub, setSelectedClub] = useState<string>('Arsenal');
  const [simulatorSelection, setSimulatorSelection] = useState<{ home: string; away: string }>({
    home: 'Arsenal',
    away: 'Chelsea',
  });

  const handleOpenSimulator = (homeTeam: string, awayTeam: string) => {
    setSimulatorSelection({ home: homeTeam, away: awayTeam });
    setActiveTab('simulator');
  };

  const handleSelectTeamFromStandings = (teamName: string) => {
    setSelectedClub(teamName);
    setActiveTab('clubs');
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col justify-between font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        season={dataset.season}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-3 sm:px-4 py-4 sm:py-6">
        {activeTab === 'fixtures' && (
          <GameweekView
            fixtures={dataset.fixtures}
            teams={dataset.teams}
            searchQuery={searchQuery}
            onOpenSimulator={handleOpenSimulator}
          />
        )}

        {activeTab === 'simulator' && (
          <MatchSimulator
            teams={dataset.teams}
            initialHomeTeam={simulatorSelection.home}
            initialAwayTeam={simulatorSelection.away}
          />
        )}

        {activeTab === 'standings' && (
          <StandingsView
            standings={dataset.standings}
            onSelectTeam={handleSelectTeamFromStandings}
          />
        )}

        {activeTab === 'clubs' && (
          <ClubView
            key={selectedClub}
            teams={dataset.teams}
            clubSeries={dataset.clubSeries}
            fixtures={dataset.fixtures}
            standings={dataset.standings}
            initialClub={selectedClub}
            onOpenSimulator={handleOpenSimulator}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            benchmark={dataset.benchmark}
            analytics={dataset.analytics}
            standings={dataset.standings}
            totalMatches={dataset.totalMatches}
          />
        )}
      </main>

      {/* Professional Editorial Footer */}
      <footer className="w-full border-t border-border bg-surface py-6 px-4 text-xs font-mono text-text-muted mt-12">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-text-secondary font-bold">
              PREMIER LEAGUE MATCH OUTCOME & SCORES INTELLIGENCE ENGINE (2026/27)
            </div>
            <div className="text-[11px] text-text-muted">
              Trained on 2,280 EPL matches with zero-leakage rolling form, Poisson expected goals, and 3-way XGBoost classification.
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/Raghav2012Code/epl-predictor"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 text-text-secondary hover:text-pl-cyan transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              <span>GitHub Repository</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>

            <span className="text-border">|</span>

            <span className="inline-flex items-center text-text-muted text-[11px]">
              <Terminal className="mr-1 h-3 w-3 text-pl-green" />
              CLI: <code className="ml-1 text-text-secondary">python predict.py --gameweek 7</code>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
