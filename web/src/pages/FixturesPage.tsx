import React, { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { EPLDataset, Fixture } from "../types";
import { MotionItem, MotionKeyFade, MotionList, MotionSection } from "../components/Motion";
import { TeamMark } from "../components/TeamMark";
import { ProbabilityStrip } from "../components/ProbabilityStrip";
import { confidenceFor, displayDate, fixtureDay, pct, startOfToday } from "../lib/format";
import { downloadFixturesCsv, nextFixtureByDate, resultFor } from "../lib/fixtures";

type FixtureFilter = "all" | "upcoming" | "played";
type FixtureSort = "date" | "confidence";

const FixtureRow: React.FC<{
  fixture: Fixture;
  selected: boolean;
  onSelect: () => void;
}> = ({ fixture, selected, onSelect }) => {
  const actual = fixture.status === "Played" ? fixture.actualScore : null;
  return (
    <button
      className={`fixture-row ${selected ? "is-selected" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className="fixture-date">
        {displayDate(fixture.date)}
        <small>
          GW{fixture.gameweek} ·{" "}
          {fixture.time === "TBC" ? "Kickoff TBC" : fixture.time}
        </small>
      </span>
      <span className="fixture-teams">
        <span>
          <TeamMark short={fixture.homeShort} badge={fixture.homeBadge} />
          {fixture.homeTeam}
        </span>
        <span>
          <TeamMark short={fixture.awayShort} badge={fixture.awayBadge} />
          {fixture.awayTeam}
        </span>
      </span>
      <span className="fixture-score">
        <small>{actual ? "Final" : "Model score"}</small>
        {actual ?? fixture.predictedScore}
      </span>
      <span className="fixture-favorite">
        <small>
          {fixture.status === "Played"
            ? resultFor(fixture)
            : fixture.predictedOutcome}
        </small>
        {fixture.status === "Played"
          ? "Result logged"
          : `${pct(Math.max(fixture.homeWinProb, fixture.drawProb, fixture.awayWinProb))} strongest signal`}
      </span>
      <ArrowUpRight className="row-arrow" size={16} aria-hidden="true" />
    </button>
  );
};

const FixtureDetail: React.FC<{
  dataset: EPLDataset;
  fixture: Fixture | null;
  onSimulate: (home: string, away: string) => void;
}> = ({ dataset, fixture, onSimulate }) => {
  if (!fixture)
    return (
      <div className="detail-panel empty-state">
        Choose a fixture to inspect it.
      </div>
    );
  const isPlayed = fixture.status === "Played";
  const homeProfile = dataset.teams[fixture.homeTeam];
  const awayProfile = dataset.teams[fixture.awayTeam];
  return (
    <article className="detail-panel">
      <div className="detail-top">
        <span
          className={`status-pill ${isPlayed ? "status-played" : "status-upcoming"}`}
        >
          {isPlayed ? "Final result" : "Forecast"}
        </span>
        <span>
          GW{fixture.gameweek} · {displayDate(fixture.date)} ·{" "}
          {fixture.time === "TBC" ? "Kickoff TBC" : fixture.time}
        </span>
      </div>
      <div className="matchup">
        <div>
          <TeamMark short={fixture.homeShort} badge={fixture.homeBadge} />
          <strong>{fixture.homeTeam}</strong>
          <small>Home</small>
        </div>
        <div className="matchup-score">
          <span>{isPlayed ? fixture.actualScore : fixture.predictedScore}</span>
          <small>{isPlayed ? "official score" : "most likely scoreline"}</small>
          {isPlayed && <small>Model had {fixture.predictedScore}</small>}
        </div>
        <div>
          <TeamMark short={fixture.awayShort} badge={fixture.awayBadge} />
          <strong>{fixture.awayTeam}</strong>
          <small>Away</small>
        </div>
      </div>
      <ProbabilityStrip fixture={fixture} />
      <div className="probability-labels">
        <span>
          <b>{pct(fixture.homeWinProb)}</b> Home
        </span>
        <span>
          <b>{pct(fixture.drawProb)}</b> Draw
        </span>
        <span>
          <b>{pct(fixture.awayWinProb)}</b> Away
        </span>
      </div>
      <div className="detail-metrics" aria-label="Forecast summary">
        <div>
          <span>Expected goals</span>
          <strong>{fixture.predHomeGoals.toFixed(2)} — {fixture.predAwayGoals.toFixed(2)}</strong>
        </div>
        <div>
          <span>Strongest signal</span>
          <strong>{pct(confidenceFor(fixture))}</strong>
        </div>
        <div>
          <span>Evidence state</span>
          <strong>{isPlayed ? "Measured" : "Projected"}</strong>
        </div>
      </div>
      <div className="form-strip" aria-label="Team context">
        <div><span>{fixture.homeTeam} form</span><strong>{homeProfile?.last5Form?.join(" ") ?? "Unavailable"}</strong><small>{homeProfile?.restDaysAvg ?? "—"}d average rest</small></div>
        <div><span>{fixture.awayTeam} form</span><strong>{awayProfile?.last5Form?.join(" ") ?? "Unavailable"}</strong><small>{awayProfile?.restDaysAvg ?? "—"}d average rest</small></div>
      </div>
      <div className="detail-copy">
        <p>
          <strong>{isPlayed ? "Model review" : "Model read"}</strong>{" "}
          {isPlayed
            ? `The model selected ${fixture.predictedOutcome.toLowerCase()} and the official result was ${fixture.actualScore}.`
            : `The model leans ${fixture.predictedOutcome.toLowerCase()} with a ${fixture.predictedScore} scoreline.`}
        </p>
        <p className="muted">
          Percentages are rounded to one decimal place and always total 100%.
          Exact scores are illustrative Poisson modes, not certainties.
        </p>
      </div>
      <button
        className="primary-button"
        onClick={() => onSimulate(fixture.homeTeam, fixture.awayTeam)}
      >
        Open in simulator <ArrowUpRight size={16} />
      </button>
    </article>
  );
};

export const FixturesPage: React.FC<{
  dataset: EPLDataset;
  query: string;
  onSimulate: (home: string, away: string) => void;
}> = ({ dataset, query, onSimulate }) => {
  const gameweeks = useMemo(
    () =>
      [...new Set(dataset.fixtures.map((fixture) => fixture.gameweek))].sort(
        (a, b) => a - b,
      ),
    [dataset.fixtures],
  );
  const firstUpcoming =
    dataset.fixtures.find((fixture) => fixture.status !== "Played")?.gameweek ??
    1;
  const autoFixture = useMemo(
    () => nextFixtureByDate(dataset.fixtures),
    [dataset.fixtures],
  );
  const [gameweek, setGameweek] = useState(
    autoFixture?.gameweek ?? firstUpcoming,
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<FixtureFilter>("all");
  const [sort, setSort] = useState<FixtureSort>("date");
  const filtered = useMemo(
    () =>
      dataset.fixtures.filter(
        (fixture) =>
          fixture.gameweek === gameweek &&
          (!query ||
            `${fixture.homeTeam} ${fixture.awayTeam}`
              .toLowerCase()
              .includes(query.toLowerCase())),
      ),
    [dataset.fixtures, gameweek, query],
  );
  const visibleFixtures = useMemo(() => {
    const matchesFilter = filtered.filter((fixture) =>
      filter === "all" ? true : filter === "played" ? fixture.status === "Played" : fixture.status !== "Played",
    );
    return [...matchesFilter].sort((a, b) =>
      sort === "confidence"
        ? confidenceFor(b) - confidenceFor(a) || a.id - b.id
        : fixtureDay(a.date) - fixtureDay(b.date) || a.id - b.id,
    );
  }, [filter, filtered, sort]);
  useEffect(() => {
    const upcoming = visibleFixtures
      .filter(
        (fixture) =>
          fixture.status !== "Played" &&
          fixtureDay(fixture.date) >= startOfToday(),
      )
      .sort(
        (a, b) => fixtureDay(a.date) - fixtureDay(b.date) || a.id - b.id,
      )[0];
    setSelectedId((upcoming ?? visibleFixtures[0])?.id ?? null);
  }, [gameweek, query, visibleFixtures]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.isContentEditable || ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)) return;
      if (event.key === "ArrowLeft") setGameweek((current) => Math.max(gameweeks[0] ?? 1, current - 1));
      if (event.key === "ArrowRight") setGameweek((current) => Math.min(gameweeks[gameweeks.length - 1] ?? 38, current + 1));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gameweeks]);
  const selected =
    visibleFixtures.find((fixture) => fixture.id === selectedId) ??
    visibleFixtures[0] ??
    null;
  const played = dataset.fixtures.filter(
    (fixture) => fixture.status === "Played",
  ).length;
  const model =
    dataset.benchmark.models.find((entry) => entry.isProduction) ??
    dataset.benchmark.models[0];
  return (
    <MotionSection className="page-stack">
      <div className="page-intro">
        <div>
          <p className="eyebrow">2026/27 season workspace</p>
          <h1>Fixtures, with the model beside them.</h1>
          <p className="lede">
            Browse each gameweek, see the forecast in plain language, and open a
            matchup when you want to inspect the assumptions.
          </p>
        </div>
        <div className="intro-stat">
          <strong>
            {played}/{dataset.totalMatches}
          </strong>
          <span>results recorded</span>
        </div>
      </div>
      <div className="stat-grid">
        <div>
          <span>Production model</span>
          <strong>{dataset.benchmark.productionModel}</strong>
        </div>
        <div>
          <span>Validation accuracy</span>
          <strong>{model?.accuracy ?? "—"}%</strong>
        </div>
        <div>
          <span>Average goal error</span>
          <strong>{model?.avgGoalMae ?? "—"}</strong>
        </div>
        <div>
          <span>Data basis</span>
          <strong>Time series</strong>
        </div>
      </div>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Schedule</p>
          <h2>Gameweek {gameweek}</h2>
        </div>
        <div className="stepper">
          <button
            onClick={() =>
              setGameweek((current) => Math.max(gameweeks[0] ?? 1, current - 1))
            }
            disabled={gameweek <= (gameweeks[0] ?? 1)}
            aria-label="Previous gameweek"
          >
            <ChevronLeft size={18} />
          </button>
          <select
            value={gameweek}
            onChange={(event) => setGameweek(Number(event.target.value))}
            aria-label="Select gameweek"
          >
            {gameweeks.map((gw) => (
              <option key={gw} value={gw}>
                Gameweek {gw}
              </option>
            ))}
          </select>
          <button
            onClick={() =>
              setGameweek((current) =>
                Math.min(gameweeks[gameweeks.length - 1] ?? 38, current + 1),
              )
            }
            disabled={gameweek >= (gameweeks[gameweeks.length - 1] ?? 38)}
            aria-label="Next gameweek"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="fixture-controls" aria-label="Fixture filters">
        <div className="filter-group" role="group" aria-label="Fixture status">
          {([['all', 'All'], ['upcoming', 'Upcoming'], ['played', 'Played']] as const).map(([value, label]) => (
            <button key={value} className={filter === value ? "active" : ""} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>
          ))}
        </div>
        <label className="sort-control">Sort by
          <select value={sort} onChange={(event) => setSort(event.target.value as FixtureSort)} aria-label="Sort fixtures">
            <option value="date">Date</option>
            <option value="confidence">Confidence</option>
          </select>
        </label>
        <span className="muted">{visibleFixtures.length} of {filtered.length} fixtures</span>
        <div className="fixture-actions">
          <button className="text-button" onClick={() => downloadFixturesCsv(visibleFixtures)}>Export CSV</button>
          <button className="text-button" onClick={() => window.print()}>Print</button>
        </div>
      </div>
      <div className="fixture-layout">
        <div
          className="fixture-list"
          aria-label={`Gameweek ${gameweek} fixtures`}
        >
          {visibleFixtures.length ? (
            <MotionList className="fixture-motion-list">
              {visibleFixtures.map((fixture) => (
                <MotionItem key={fixture.id} className="fixture-motion-item">
                  <FixtureRow
                    fixture={fixture}
                    selected={fixture.id === selected?.id}
                    onSelect={() => setSelectedId(fixture.id)}
                  />
                </MotionItem>
              ))}
            </MotionList>
          ) : (
            <div className="empty-state">
              No fixtures match this gameweek and search.
            </div>
          )}
        </div>
        <MotionKeyFade fadeKey={selected?.id ?? "empty"} className="fixture-detail-fade">
          <FixtureDetail dataset={dataset} fixture={selected} onSimulate={onSimulate} />
        </MotionKeyFade>
      </div>
    </MotionSection>
  );
};
