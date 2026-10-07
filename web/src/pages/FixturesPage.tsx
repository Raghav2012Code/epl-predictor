import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { EPLDataset, Fixture } from "../types";
import { TeamMark } from "../components/TeamMark";
import { ActiveIndicator, SwapFade } from "../components/Motion";
import { SplitBar } from "../components/SplitBar";
import {
  confidenceFor,
  kickoff,
  longDay,
  pct,
  scoreParts,
  shortDay,
} from "../lib/format";
import { compareDay, nextFixtureByDate } from "../lib/fixtureDates";
import { downloadFixturesCsv, pickWasRight, recentForm, resultFor } from "../lib/fixtures";
import { FormChips } from "../components/FormChips";

type FixtureFilter = "all" | "upcoming" | "played";
type FixtureSort = "date" | "confidence";

const filters: Array<[FixtureFilter, string]> = [
  ["all", "All"],
  ["upcoming", "Upcoming"],
  ["played", "Played"],
];

/** Goals for each side: the final score once played, the predicted score before. */
const goalsFor = (fixture: Fixture): [number, number] => {
  const source =
    fixture.status === "Played" ? fixture.actualScore : fixture.predictedScore;
  return (
    scoreParts(source) ?? [fixture.predHomeGoals, fixture.predAwayGoals]
  );
};

const pickLabel = (fixture: Fixture) =>
  fixture.predictedOutcome === "Home Win"
    ? `${fixture.homeTeam} win`
    : fixture.predictedOutcome === "Away Win"
      ? `${fixture.awayTeam} win`
      : "Draw";

const resultLabel = (fixture: Fixture) => {
  const result = resultFor(fixture);
  return result === "Home win"
    ? `${fixture.homeTeam} win`
    : result === "Away win"
      ? `${fixture.awayTeam} win`
      : result;
};

const FixtureRow: React.FC<{
  fixture: Fixture;
  index: number;
  selected: boolean;
  isNext: boolean;
  showDate: boolean;
  onSelect: (target: HTMLElement) => void;
}> = ({ fixture, index, selected, isNext, showDate, onSelect }) => {
  const played = fixture.status === "Played";
  const [homeGoals, awayGoals] = goalsFor(fixture);
  const called = pickWasRight(fixture);
  return (
    <li>
      <button
        type="button"
        className={`match${selected ? " is-selected" : ""}${played ? " is-played" : ""}`}
        onClick={(event) => onSelect(event.currentTarget)}
        aria-pressed={selected}
        aria-label={`${fixture.homeTeam} v ${fixture.awayTeam}, ${showDate ? `${shortDay(fixture.date)}, ` : ""}${
          fixture.time === "TBC" ? "kickoff to be confirmed" : `kickoff ${fixture.time}`
        }. ${played ? "Final" : "Predicted"} score ${homeGoals} to ${awayGoals}.${called === null ? "" : called ? " The model called it." : " The model missed it."} Forecast: home win ${fixture.homeWinProb.toFixed(1)} percent, draw ${fixture.drawProb.toFixed(1)}, away win ${fixture.awayWinProb.toFixed(1)}.${isNext ? " Next match." : ""}`}
      >
        {selected && <ActiveIndicator id="fixture-selected" className="match__indicator" />}
        <span className="match__when" aria-hidden="true">
          <span className="match__time num">{kickoff(fixture.time)}</span>
          {isNext && (
            <span className="match__next">
              <i /> Next
            </span>
          )}
          {showDate && <span className="label">{shortDay(fixture.date)}</span>}
          {called !== null && (
            <span className={`verdict${called ? " is-called" : ""}`}>
              {called ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
              {called ? "Called it" : "Missed"}
            </span>
          )}
        </span>
        <span className="match__teams" aria-hidden="true">
          <span className="match__team">
            <TeamMark short={fixture.homeShort} badge={fixture.homeBadge} />
            <span className="match__name">{fixture.homeTeam}</span>
            <span className="match__goals num">{homeGoals}</span>
          </span>
          <span className="match__team">
            <TeamMark short={fixture.awayShort} badge={fixture.awayBadge} />
            <span className="match__name">{fixture.awayTeam}</span>
            <span className="match__goals num">{awayGoals}</span>
          </span>
        </span>
        <SplitBar
          className="match__bar"
          sweep={index}
          home={fixture.homeWinProb}
          draw={fixture.drawProb}
          away={fixture.awayWinProb}
        />
      </button>
    </li>
  );
};

const FormLine: React.FC<{
  dataset: EPLDataset;
  fixture: Fixture;
  team: string;
  short: string;
  badge: string;
}> = ({ dataset, fixture, team, short, badge }) => (
  <div className="form-line">
    <TeamMark short={short} badge={badge} />
    <span className="form-line__name">{team}</span>
    <FormChips form={recentForm(dataset.fixtures, team, 5, fixture)} empty="No earlier results" />
  </div>
);

const FixtureDetail: React.FC<{
  dataset: EPLDataset;
  fixture: Fixture;
  onSimulate: (home: string, away: string) => void;
}> = ({ dataset, fixture, onSimulate }) => {
  const played = fixture.status === "Played";
  const [homeGoals, awayGoals] = goalsFor(fixture);
  return (
    <article className="detail" aria-labelledby="detail-title">
      <p className="label detail__when">
        {played ? "Final result" : "Forecast"}, gameweek {fixture.gameweek}.{" "}
        {longDay(fixture.date)}
        {fixture.time === "TBC" ? ", kickoff to be confirmed" : ` at ${fixture.time}`}.
      </p>
      <h2 id="detail-title" className="sr-only">
        {fixture.homeTeam} v {fixture.awayTeam}
      </h2>
      <div className="detail__teams">
        <div className="detail__team">
          <TeamMark short={fixture.homeShort} badge={fixture.homeBadge} />
          <strong>{fixture.homeTeam}</strong>
          <span className="label">Home</span>
        </div>
        <div className="detail__score">
          <span className={`num detail__goals${played ? "" : " is-predicted"}`}>
            {homeGoals}
            <span aria-hidden="true"> - </span>
            <span className="sr-only"> to </span>
            {awayGoals}
          </span>
          <span className="label">{played ? "Final score" : "Predicted score"}</span>
        </div>
        <div className="detail__team">
          <TeamMark short={fixture.awayShort} badge={fixture.awayBadge} />
          <strong>{fixture.awayTeam}</strong>
          <span className="label">Away</span>
        </div>
      </div>
      <SplitBar
        size="detail"
        home={fixture.homeWinProb}
        draw={fixture.drawProb}
        away={fixture.awayWinProb}
      />
      <dl className="facts">
        <div>
          <dt className="label">Model pick</dt>
          <dd>{pickLabel(fixture)}</dd>
        </div>
        <div>
          <dt className="label">{played ? "Result" : "Confidence"}</dt>
          <dd>{played ? resultLabel(fixture) : pct(confidenceFor(fixture))}</dd>
        </div>
        {played && (
          <div>
            <dt className="label">Model pick was</dt>
            <dd>{pickWasRight(fixture) ? "Right" : "Wrong"}</dd>
          </div>
        )}
        {played && (
          <div>
            <dt className="label">Predicted score</dt>
            <dd>{fixture.predictedScore}</dd>
          </div>
        )}
        <div>
          <dt className="label">Venue</dt>
          <dd>{fixture.stadium}</dd>
        </div>
      </dl>
      <div className="detail__form">
        <h3 className="label">Form before this match, oldest first</h3>
        <FormLine
          dataset={dataset}
          fixture={fixture}
          team={fixture.homeTeam}
          short={fixture.homeShort}
          badge={fixture.homeBadge}
        />
        <FormLine
          dataset={dataset}
          fixture={fixture}
          team={fixture.awayTeam}
          short={fixture.awayShort}
          badge={fixture.awayBadge}
        />
      </div>
      <button
        type="button"
        className="btn btn--block"
        onClick={() => onSimulate(fixture.homeTeam, fixture.awayTeam)}
      >
        Open in simulator
      </button>
      <p className="label detail__note">
        Percentages are rounded to one decimal place. The predicted score is the
        single most likely result, not a certainty.
      </p>
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
  const firstGameweek = gameweeks[0] ?? 1;
  const lastGameweek = gameweeks[gameweeks.length - 1] ?? 38;
  const firstUpcoming =
    dataset.fixtures.find((fixture) => fixture.status !== "Played")?.gameweek ??
    1;
  const nextFixture = useMemo(
    () => nextFixtureByDate(dataset.fixtures),
    [dataset.fixtures],
  );
  const [gameweek, setGameweek] = useState(
    nextFixture?.gameweek ?? firstUpcoming,
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<FixtureFilter>("all");
  const [sort, setSort] = useState<FixtureSort>("date");
  const [sheetOpen, setSheetOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const inGameweek = useMemo(
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
    const matching = inGameweek.filter((fixture) =>
      filter === "all"
        ? true
        : filter === "played"
          ? fixture.status === "Played"
          : fixture.status !== "Played",
    );
    return [...matching].sort((a, b) =>
      sort === "confidence"
        ? confidenceFor(b) - confidenceFor(a) || a.id - b.id
        : compareDay(a.date, b.date) ||
          a.time.localeCompare(b.time) ||
          a.id - b.id,
    );
  }, [filter, inGameweek, sort]);

  // Keyed on inGameweek, not visibleFixtures: the latter also changes with the
  // sort and status filter, which silently discarded the fixture the user had
  // opened. `selected` already falls back gracefully when it is filtered out.
  useEffect(() => {
    const upcoming = nextFixtureByDate(inGameweek);
    setSelectedId((upcoming ?? inGameweek[0])?.id ?? null);
    setSheetOpen(false);
  }, [gameweek, query, inGameweek]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (
        target.isContentEditable ||
        ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)
      )
        return;
      if (event.key === "ArrowLeft")
        setGameweek((current) => Math.max(firstGameweek, current - 1));
      if (event.key === "ArrowRight")
        setGameweek((current) => Math.min(lastGameweek, current + 1));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [firstGameweek, lastGameweek]);

  useEffect(() => {
    if (!sheetOpen) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSheetOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      openerRef.current?.focus();
    };
  }, [sheetOpen]);

  const selected =
    visibleFixtures.find((fixture) => fixture.id === selectedId) ??
    visibleFixtures[0] ??
    null;
  const playedInWeek = inGameweek.filter((fixture) => fixture.status === "Played").length;
  const model =
    dataset.benchmark.models.find((entry) => entry.isProduction) ??
    dataset.benchmark.models[0];
  const flat = sort !== "date";
  const days = useMemo(() => {
    const groups: Array<{ date: string; items: Fixture[] }> = [];
    for (const fixture of visibleFixtures) {
      const last = groups[groups.length - 1];
      if (last && last.date === fixture.date) last.items.push(fixture);
      else groups.push({ date: fixture.date, items: [fixture] });
    }
    return groups;
  }, [visibleFixtures]);

  const renderRow = (fixture: Fixture, index: number) => (
    <FixtureRow
      key={fixture.id}
      fixture={fixture}
      index={index}
      selected={fixture.id === selected?.id}
      isNext={fixture.id === nextFixture?.id}
      showDate={flat}
      onSelect={(target) => {
        openerRef.current = target;
        setSelectedId(fixture.id);
        setSheetOpen(true);
      }}
    />
  );
  let rowIndex = 0;

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Gameweek {gameweek}</h1>
          <p className="label page-head__sub">
            {inGameweek.length} fixtures, {playedInWeek} played.{" "}
            {model
              ? `In testing, the model picked the right result ${model.accuracy}% of the time.`
              : ""}
          </p>
        </div>
        <div className="stepper" role="group" aria-label="Choose gameweek">
          <button
            type="button"
            className="stepper__button"
            onClick={() => setGameweek((current) => Math.max(firstGameweek, current - 1))}
            disabled={gameweek <= firstGameweek}
            aria-label="Previous gameweek"
            title="Previous gameweek (←)"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <select
            className="select"
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
            type="button"
            className="stepper__button"
            onClick={() => setGameweek((current) => Math.min(lastGameweek, current + 1))}
            disabled={gameweek >= lastGameweek}
            aria-label="Next gameweek"
            title="Next gameweek (→)"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="toolbar">
        <div className="segmented" role="group" aria-label="Show fixtures">
          {filters.map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {filter === value && <ActiveIndicator id="fixture-filter" className="segmented__pill" />}
              <span>{label}</span>
            </button>
          ))}
        </div>
        <label className="toolbar__sort">
          <span className="label toolbar__sort-label">Sort by</span>
          <select
            className="select"
            value={sort}
            onChange={(event) => setSort(event.target.value as FixtureSort)}
          >
            <option value="date">Kickoff</option>
            <option value="confidence">Confidence</option>
          </select>
        </label>
        <div className="toolbar__actions">
          <button type="button" className="text-button" onClick={() => downloadFixturesCsv(visibleFixtures)}>
            Export CSV
          </button>
          <button type="button" className="text-button toolbar__print" onClick={() => window.print()}>
            Print
          </button>
        </div>
      </div>

      <div className={`fixtures${sheetOpen ? " is-sheet-open" : ""}`}>
        <section className="fixtures__list" aria-label={`Gameweek ${gameweek} fixtures`}>
          {visibleFixtures.length ? (
            <>
              <p className="label fixtures__legend">
                Dark scores are final. Grey scores are the model's predicted score.
              </p>
              <div key={`${gameweek}-${filter}`}>
                {flat ? (
                  <ul className="match-list">
                    {visibleFixtures.map((fixture) => renderRow(fixture, rowIndex++))}
                  </ul>
                ) : (
                  days.map((day) => (
                    <div className="day" key={day.date}>
                      <h2 className="day__title">{longDay(day.date)}</h2>
                      <ul className="match-list">
                        {day.items.map((fixture) => renderRow(fixture, rowIndex++))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="empty">
              <strong>No fixtures to show</strong>
              {query
                ? `Nothing in gameweek ${gameweek} matches "${query}". Clear the search or pick another gameweek.`
                : `No ${filter === "all" ? "" : filter + " "}fixtures in gameweek ${gameweek}. Try All, or pick another gameweek.`}
            </div>
          )}
        </section>

        <div
          className={`sheet-backdrop${sheetOpen ? " is-open" : ""}`}
          onClick={() => setSheetOpen(false)}
          aria-hidden="true"
        />
        <aside
          className={`fixtures__detail${sheetOpen ? " is-open" : ""}`}
          aria-label="Fixture detail"
        >
          <button
            ref={closeRef}
            type="button"
            className="sheet-close"
            onClick={() => setSheetOpen(false)}
          >
            <X size={18} aria-hidden="true" /> Close
          </button>
          {selected ? (
            <SwapFade swapKey={selected.id}>
              <FixtureDetail dataset={dataset} fixture={selected} onSimulate={onSimulate} />
            </SwapFade>
          ) : (
            <div className="empty">
              <strong>Choose a fixture</strong>
              Select a match to see its forecast.
            </div>
          )}
        </aside>
      </div>
    </>
  );
};
