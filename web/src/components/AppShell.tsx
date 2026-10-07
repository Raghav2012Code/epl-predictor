import React, { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  ChartColumn,
  ListOrdered,
  Search,
  Shield,
  SlidersHorizontal,
  X,
  type LucideIcon,
} from "lucide-react";
import type { EPLDataset } from "../types";
import { RouteLink } from "./RouteLink";
import { ActiveIndicator, MotionPop, MotionPresence, MotionSection } from "./Motion";
import { TeamMark } from "./TeamMark";
import { BrandLockup } from "./BrandMark";
import { kickoff, shortDay } from "../lib/format";
import { nextFixtureByDate } from "../lib/fixtureDates";
import type { AppRoute } from "../lib/appRoute";
import { FixturesPage } from "../pages/FixturesPage";
import { SimulatorPage } from "../pages/SimulatorPage";
import { StandingsPage } from "../pages/StandingsPage";
import { ClubsPage } from "../pages/ClubsPage";
import { AnalyticsPage } from "../pages/AnalyticsPage";

export type Tab = "fixtures" | "simulator" | "standings" | "clubs" | "analytics";
export const tabs: Array<{ id: Tab; label: string; icon: LucideIcon }> = [
  { id: "fixtures", label: "Fixtures", icon: CalendarDays },
  { id: "simulator", label: "Simulator", icon: SlidersHorizontal },
  { id: "standings", label: "Table", icon: ListOrdered },
  { id: "clubs", label: "Clubs", icon: Shield },
  { id: "analytics", label: "Analytics", icon: ChartColumn },
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
  const navigateTo = (tab: AppRoute) => {
    if (tab !== "landing") setActiveTab(tab);
    onNavigate(tab);
  };
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mobileSearch, setMobileSearch] = useState(false);
  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) {
        setSearchOpen(false);
        setMobileSearch(false);
      }
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (event.key === "/" && tag !== "INPUT" && tag !== "SELECT" && tag !== "TEXTAREA") {
        event.preventDefault();
        setMobileSearch(true);
        inputRef.current?.focus();
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMobileSearch(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const closeSearch = () => {
    setQuery("");
    setSearchOpen(false);
    setMobileSearch(false);
  };
  const selectClub = (club: string) => {
    setSelectedClub(club);
    closeSearch();
    navigateTo("clubs");
  };
  const openSimulator = (home: string, away: string) => {
    setSimulatorSelection({ home, away });
    closeSearch();
    navigateTo("simulator");
  };
  const toggleMobileSearch = () => {
    const next = !mobileSearch;
    setMobileSearch(next);
    if (next) window.setTimeout(() => inputRef.current?.focus(), 0);
    else closeSearch();
  };
  const next = nextFixtureByDate(dataset.fixtures);
  const needle = query.trim().toLowerCase();
  const clubHits = needle
    ? Object.values(dataset.teams)
        .filter((team) => team.name.toLowerCase().includes(needle))
        .slice(0, 4)
    : [];
  const fixtureHits = needle
    ? dataset.fixtures
        .filter((fixture) =>
          `${fixture.homeTeam} ${fixture.awayTeam}`.toLowerCase().includes(needle),
        )
        .slice(0, 4)
    : [];
  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="topbar">
        <div className="wrap topbar__inner">
          <RouteLink
            route="landing"
            className="brand"
            onNavigate={onNavigate}
            onFollow={closeSearch}
            aria-label="EPL Predictor home"
          >
            <BrandLockup season={dataset.season} />
          </RouteLink>
          <nav className="tabs" aria-label="Primary">
            {tabs.map(({ id, label, icon: Icon }) => (
              <RouteLink
                key={id}
                route={id}
                className="tabs__item"
                onNavigate={navigateTo}
                aria-current={activeTab === id ? "page" : undefined}
              >
                <Icon className="tabs__icon" size={22} strokeWidth={2} aria-hidden="true" />
                {label}
                {activeTab === id && <ActiveIndicator id="tab-indicator" className="tabs__indicator" />}
              </RouteLink>
            ))}
          </nav>
          {next && (
            <RouteLink
              route="fixtures"
              className="next-up"
              onNavigate={navigateTo}
              aria-label={`Next kickoff: ${next.homeTeam} v ${next.awayTeam}, ${shortDay(next.date)} ${kickoff(next.time)}. Open fixtures.`}
            >
              <span className="next-up__crests" aria-hidden="true">
                <TeamMark short={next.homeShort} badge={next.homeBadge} />
                <TeamMark short={next.awayShort} badge={next.awayBadge} />
              </span>
              <span className="next-up__text">
                <span className="next-up__label">Next kickoff</span>
                <span className="next-up__match">
                  {next.homeShort} v {next.awayShort}, {shortDay(next.date)} {kickoff(next.time)}
                </span>
              </span>
            </RouteLink>
          )}
          <div className={`search${mobileSearch ? " search--open" : ""}`} ref={searchRef}>
            <button
              type="button"
              className="search__toggle"
              onClick={toggleMobileSearch}
              aria-label={mobileSearch ? "Close search" : "Search clubs and fixtures"}
              aria-expanded={mobileSearch}
            >
              {mobileSearch ? <X size={20} aria-hidden="true" /> : <Search size={20} aria-hidden="true" />}
            </button>
            <div className="search__field">
              <Search size={16} aria-hidden="true" />
              <input
                ref={inputRef}
                className="search__input"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={(event) => {
                  if (event.key !== "Escape") return;
                  event.stopPropagation();
                  if (query) {
                    setQuery("");
                  } else {
                    setSearchOpen(false);
                    event.currentTarget.blur();
                  }
                }}
                placeholder="Search clubs and fixtures"
                aria-label="Search clubs and fixtures"
                autoComplete="off"
              />
              <kbd className="search__hint" aria-hidden="true">/</kbd>
            </div>
            <MotionPresence>
              {searchOpen && needle && (
                <MotionPop popKey="search-results" className="search__results">
                  {clubHits.length > 0 && <p className="label search__group">Clubs</p>}
                  {clubHits.map((team) => (
                    <button
                      key={team.name}
                      type="button"
                      className="search__option"
                      onClick={() => selectClub(team.name)}
                    >
                      <TeamMark team={team} />
                      {team.name}
                      <span className="search__option-hint">Club profile</span>
                    </button>
                  ))}
                  {fixtureHits.length > 0 && <p className="label search__group">Fixtures</p>}
                  {fixtureHits.map((fixture) => (
                    <button
                      key={fixture.id}
                      type="button"
                      className="search__option"
                      onClick={() => openSimulator(fixture.homeTeam, fixture.awayTeam)}
                    >
                      {fixture.homeTeam} v {fixture.awayTeam}
                      <span className="search__option-hint">GW{fixture.gameweek}, open in simulator</span>
                    </button>
                  ))}
                  {!clubHits.length && !fixtureHits.length && (
                    <p className="search__empty">
                      No club or fixture matches "{query.trim()}". Try a club name.
                    </p>
                  )}
                </MotionPop>
              )}
            </MotionPresence>
          </div>
        </div>
      </header>
      <main className="wrap main" id="main-content" tabIndex={-1}>
        <MotionPresence>
          <MotionSection key={activeTab}>
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
      <footer className="footer">
        <div className="wrap footer__inner">
          <span>Forecasts are probabilities, not guarantees.</span>
          <div className="footer__actions">
            <button
              type="button"
              className="text-button"
              onClick={onToggleMotion}
              aria-pressed={motionDisabled}
            >
              Reduce motion
            </button>
            <a href="https://github.com/Raghav2012Code/epl-predictor" target="_blank" rel="noreferrer">
              View source
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
