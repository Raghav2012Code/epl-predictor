import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import type { EPLDataset } from "../types";
import { MotionPop, MotionPresence, MotionSection } from "./Motion";
import { TeamMark } from "./TeamMark";
import type { AppRoute } from "../lib/appRoute";
import { FixturesPage } from "../pages/FixturesPage";
import { SimulatorPage } from "../pages/SimulatorPage";
import { StandingsPage } from "../pages/StandingsPage";
import { ClubsPage } from "../pages/ClubsPage";
import { AnalyticsPage } from "../pages/AnalyticsPage";

export type Tab = "fixtures" | "simulator" | "standings" | "clubs" | "analytics";
export const tabs: Array<{ id: Tab; label: string; note: string }> = [
  { id: "fixtures", label: "Fixtures", note: "Gameweeks and forecasts" },
  { id: "simulator", label: "Simulator", note: "Explore a matchup" },
  { id: "standings", label: "Table", note: "Current and projected table" },
  { id: "clubs", label: "Clubs", note: "Team profiles" },
  { id: "analytics", label: "Analytics", note: "Model evidence and trends" },
];

export const AppShell: React.FC<{
  dataset: EPLDataset;
  initialTab: Tab;
  onNavigate: (route: AppRoute) => void;
  motionDisabled: boolean;
  onToggleMotion: () => void;
}> = ({ dataset, initialTab, onNavigate, motionDisabled, onToggleMotion }) => {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState("Arsenal");
  const [simulatorSelection, setSimulatorSelection] = useState({
    home: "Arsenal",
    away: "Chelsea",
  });
  useEffect(() => setActiveTab(initialTab), [initialTab]);
  const navigateTo = (tab: Tab) => {
    setActiveTab(tab);
    onNavigate(tab);
  };
  const searchRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      if (!searchRef.current?.contains(event.target as Node))
        setSearchOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
        event.preventDefault();
        (
          searchRef.current?.querySelector("input") as HTMLInputElement | null
        )?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const selectClub = (club: string) => {
    setSelectedClub(club);
    setQuery("");
    setSearchOpen(false);
    navigateTo("clubs");
  };
  const goHome = () => {
    setQuery("");
    setSearchOpen(false);
    navigateTo("fixtures");
  };
  const openSimulator = (home: string, away: string) => {
    setSimulatorSelection({ home, away });
    setQuery("");
    setSearchOpen(false);
    navigateTo("simulator");
  };
  const clubHits = query
    ? Object.values(dataset.teams)
        .filter((team) => team.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 4)
    : [];
  const fixtureHits = query
    ? dataset.fixtures
        .filter((fixture) =>
          `${fixture.homeTeam} ${fixture.awayTeam}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .slice(0, 4)
    : [];
  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  return (
      <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="site-rail">
        <button
          type="button"
          className="brand brand-home"
          onClick={goHome}
          aria-label="Back to fixtures home"
        >
          <img
            className="brand-logo"
            src={`${import.meta.env.BASE_URL}epl-predictor-header-logo.png`}
            alt="EPL Predictor"
            draggable={false}
          />
          <div className="brand-copy">
            <small>Match analysis · {dataset.season}</small>
          </div>
        </button>
        <nav aria-label="Primary navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => navigateTo(tab.id)}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              <span>{tab.label}</span>
              <small>{tab.note}</small>
            </button>
          ))}
        </nav>
        <div className="rail-footer">
          <span>Data snapshot</span>
          <strong>{dataset.totalMatches} fixtures</strong>
          <small>Offline dataset · no live API</small>
          <small>Scores and schedules are versioned with the export.</small>
        </div>
      </aside>
      <div className="site-content">
        <header className="site-header">
          <div>
            <p className="eyebrow">Premier League · {dataset.season}</p>
            <h2>{active.label}</h2>
          </div>
          <div className="search-box" ref={searchRef}>
            <Search size={17} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search clubs or fixtures"
              aria-label="Search clubs or fixtures"
            />
            <kbd>/</kbd>
            <MotionPresence>
            {searchOpen && query && (
              <MotionPop popKey="search-results" className="search-results" role="listbox">
                {clubHits.map((team) => (
                  <button
                    key={team.name}
                    onClick={() => selectClub(team.name)}
                    role="option"
                  >
                    <TeamMark team={team} />
                    {team.name}
                    <small>Club profile</small>
                  </button>
                ))}
                {fixtureHits.map((fixture) => (
                  <button
                    key={fixture.id}
                    onClick={() =>
                      openSimulator(fixture.homeTeam, fixture.awayTeam)
                    }
                    role="option"
                  >
                    <span>
                      {fixture.homeTeam} v {fixture.awayTeam}
                    </span>
                    <small>Open simulator</small>
                  </button>
                ))}
                {!clubHits.length && !fixtureHits.length && (
                  <p className="muted">No matches found.</p>
                )}
              </MotionPop>
            )}
            </MotionPresence>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          <MotionPresence>
          <MotionSection key={activeTab} className="page-transition-shell">
          {activeTab === "fixtures" && (
            <FixturesPage
              key="fixtures"
              dataset={dataset}
              query={query}
              onSimulate={openSimulator}
            />
          )}
          {activeTab === "simulator" && (
            <SimulatorPage
              key="simulator"
              dataset={dataset}
              initialHome={simulatorSelection.home}
              initialAway={simulatorSelection.away}
            />
          )}
          {activeTab === "standings" && (
            <StandingsPage key="standings" dataset={dataset} onClub={selectClub} />
          )}
          {activeTab === "clubs" && (
            <ClubsPage
              key="clubs"
              dataset={dataset}
              selectedClub={selectedClub}
              setSelectedClub={setSelectedClub}
              onSimulate={openSimulator}
            />
          )}
          {activeTab === "analytics" && <AnalyticsPage key="analytics" dataset={dataset} />}
          </MotionSection>
          </MotionPresence>
        </main>
        <footer className="site-footer">
          <span>Forecasts are probabilities, not guarantees.</span>
          <button className="text-button motion-toggle" onClick={onToggleMotion} aria-pressed={motionDisabled}>
            {motionDisabled ? "Motion reduced" : "Motion on"}
          </button>
          <a
            href="https://github.com/Raghav2012Code/epl-predictor"
            target="_blank"
            rel="noreferrer"
          >
            View source <ArrowUpRight size={14} />
          </a>
        </footer>
      </div>
      </div>
  );
};
