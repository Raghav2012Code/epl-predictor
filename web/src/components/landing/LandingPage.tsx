import React from "react";
import { ChevronRight } from "lucide-react";
import type { EPLDataset, Fixture } from "../../types";
import { useMotionDisabled } from "../Motion";
import { SplitBar } from "../SplitBar";
import { TeamMark } from "../TeamMark";
import { BrandLockup } from "../BrandMark";
import { dashboardRoutes, pathForAppRoute, type AppRoute } from "../../lib/appRoute";
import { getLandingData } from "../../lib/landingData";
import { kickoff, longDay, scoreParts } from "../../lib/format";
import { fixtureDay, nextFixtureByDate } from "../../lib/fixtureDates";
import "../../styles/landing.css";

type LandingPageProps = {
  dataset?: EPLDataset | null;
  onNavigate: (route: AppRoute) => void;
  motionDisabled?: boolean;
  onToggleMotion?: () => void;
};

const views: Record<Exclude<AppRoute, "landing">, { title: string; body: string }> = {
  fixtures: {
    title: "Fixtures",
    body: "Every gameweek with a forecast beside each match. Official results stay separate from predictions.",
  },
  simulator: {
    title: "Simulator",
    body: "Pick any two clubs, change form and venue, and watch the probabilities move.",
  },
  standings: {
    title: "Table",
    body: "The full-season projection from the model's predicted scores. Select a club to open it.",
  },
  clubs: {
    title: "Clubs",
    body: "Record, goals, rest days, recent results and the next matches for one club.",
  },
  analytics: {
    title: "Analytics",
    body: "How the model was measured: ranked probability score, accuracy, goal error and diagnostics.",
  },
};

const BoardRow: React.FC<{ fixture: Fixture; index: number }> = ({ fixture, index }) => {
  const [homeGoals, awayGoals] = scoreParts(fixture.predictedScore) ?? [
    fixture.predHomeGoals,
    fixture.predAwayGoals,
  ];
  return (
    <li>
      <div className="match match--static">
        <span className="match__when">
          <span className="match__time num">{kickoff(fixture.time)}</span>
          <span className="label">{fixture.date === "TBC" ? "Date TBC" : fixture.date.slice(5).replace("-", "/")}</span>
        </span>
        <span className="match__teams">
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
      </div>
    </li>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({
  dataset,
  onNavigate,
  motionDisabled,
  onToggleMotion,
}) => {
  const reduceMotion = useMotionDisabled();
  const landingData = getLandingData(dataset ?? undefined);
  const fixtures = dataset?.fixtures ?? [];
  const next = nextFixtureByDate(fixtures) ?? fixtures[0] ?? null;
  const boardFixtures = next
    ? fixtures
        .filter((fixture) => fixture.gameweek === next.gameweek)
        .sort(
          (a, b) =>
            fixtureDay(a.date) - fixtureDay(b.date) ||
            a.time.localeCompare(b.time) ||
            a.id - b.id,
        )
    : [];
  const playedCount = fixtures.filter((fixture) => fixture.status === "Played").length;
  const totalCount = dataset?.totalMatches ?? landingData.totalMatches;
  const coverage = totalCount > 0 ? Math.round((playedCount / totalCount) * 100) : 0;
  const models = dataset?.benchmark.models ?? [];
  const production = models.find((entry) => entry.isProduction) ?? models[0] ?? null;
  const scrollTo = (id: string) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  return (
    <div className="landing" id="top">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="topbar">
        <div className="wrap topbar__inner">
          <button
            type="button"
            className="brand"
            onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })}
            aria-label="EPL Predictor, back to top"
          >
            <BrandLockup season={dataset?.season ?? landingData.season} />
          </button>
          <nav className="landing-links" aria-label="Views">
            {dashboardRoutes.map((route) => (
              <a
                key={route}
                href={pathForAppRoute(route)}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(route);
                }}
              >
                {views[route].title}
              </a>
            ))}
          </nav>
          <button type="button" className="btn" onClick={() => onNavigate("fixtures")}>
            Open fixtures
          </button>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className="wrap hero" aria-labelledby="hero-title">
          <div className="hero__copy">
            <h1 id="hero-title">Every Premier League fixture, forecast.</h1>
            <p className="hero__lede">
              Calibrated home, draw and away probabilities and a predicted score
              for each match, always kept apart from the official result.
            </p>
            <div className="hero__actions">
              <button type="button" className="btn" onClick={() => onNavigate("fixtures")}>
                Open fixtures
              </button>
              <button type="button" className="btn btn--quiet" onClick={() => scrollTo("evidence")}>
                See the evidence
              </button>
            </div>
            <ol className="hero__how" aria-label="What each forecast shows">
              <li>
                <strong>Home, draw, away</strong>
                Calibrated probabilities that sum to 100%.
              </li>
              <li>
                <strong>Predicted score</strong>
                A separate goal model, shown in grey.
              </li>
              <li>
                <strong>Official result</strong>
                Recorded after full time, never mixed in.
              </li>
            </ol>
            <dl className="hero__facts">
              <div>
                <dt className="label">Fixtures</dt>
                <dd className="num">{totalCount}</dd>
              </div>
              <div>
                <dt className="label">Results recorded</dt>
                <dd className="num">{playedCount}</dd>
              </div>
              <div>
                <dt className="label">Clubs</dt>
                <dd className="num">{Object.keys(dataset?.teams ?? {}).length || 20}</dd>
              </div>
            </dl>
          </div>

          <div className="board" aria-label="Next gameweek forecast">
            {next && boardFixtures.length ? (
              <>
                <div className="board__head">
                  <h2>Gameweek {next.gameweek}</h2>
                  <span className="label">{longDay(boardFixtures[0].date)}</span>
                </div>
                <ul className="match-list">
                  {boardFixtures.slice(0, 4).map((fixture, index) => (
                    <BoardRow key={fixture.id} fixture={fixture} index={index} />
                  ))}
                </ul>
                <div className="board__foot">
                  <span className="label">
                    Grey scores are the model's predicted score.
                  </span>
                  <button type="button" className="text-button" onClick={() => onNavigate("fixtures")}>
                    All {boardFixtures.length} fixtures
                  </button>
                </div>
              </>
            ) : (
              <div className="empty">
                <strong>Loading the next gameweek</strong>
                Fixtures appear here as soon as the season file loads.
              </div>
            )}
          </div>
        </section>

        <section className="wrap section" id="views" aria-labelledby="views-title">
          <h2 id="views-title">Five views of one season</h2>
          <ul className="views">
            {dashboardRoutes.map((route) => (
              <li key={route}>
                <button type="button" className="view-link" onClick={() => onNavigate(route)}>
                  <strong>{views[route].title}</strong>
                  <span className="view-link__body">{views[route].body}</span>
                  <ChevronRight size={20} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="wrap section" id="evidence" aria-labelledby="evidence-title">
          <h2 id="evidence-title">Measured before it is shown</h2>
          <p className="label section__sub">
            Models are validated on a time-ordered holdout with leakage-safe
            features. The production model is the one with the lowest ranked
            probability score (RPS), which rewards honest probabilities over a
            single lucky guess.
          </p>
          {production && (
            <dl className="metrics metrics--4" aria-label="Production model metrics">
              <div>
                <dt className="label">Production model</dt>
                <dd className="num">{production.name}</dd>
              </div>
              <div>
                <dt className="label">RPS, lower is better</dt>
                <dd className="num">{production.rps.toFixed(4)}</dd>
              </div>
              <div>
                <dt className="label">Accuracy</dt>
                <dd className="num">{production.accuracy}%</dd>
              </div>
              <div>
                <dt className="label">Goal error</dt>
                <dd className="num">{production.avgGoalMae}</dd>
              </div>
            </dl>
          )}
          <div className="landing-evidence">
            {models.length > 0 && (
              <table className="league models">
                <caption className="sr-only">Validation results by model</caption>
                <thead>
                  <tr>
                    <th scope="col" className="models__name">Model</th>
                    <th scope="col">RPS</th>
                    <th scope="col">Accuracy</th>
                    <th scope="col" className="is-optional">Log loss</th>
                    <th scope="col">Goal error</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((entry) => (
                    <tr key={entry.name} className={entry.isProduction ? "is-production" : undefined}>
                      <th scope="row" className="models__name">
                        {entry.name}
                        {entry.isProduction && <span className="tag">Production</span>}
                      </th>
                      <td className="num">{entry.rps}</td>
                      <td className="num">{entry.accuracy}%</td>
                      <td className="num is-optional">{entry.logLoss}</td>
                      <td className="num">{entry.avgGoalMae}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div>
              <p className="coverage__figure num">
                {playedCount}
                <span>/{totalCount}</span>
              </p>
              <div
                className="meter"
                role="progressbar"
                aria-label="Fixtures with a recorded result"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={coverage}
              >
                <span style={{ width: `${coverage}%` }} />
              </div>
              <p className="block__note">
                {coverage}% of the season is on record. The rest is projected and
                labelled that way everywhere.
              </p>
            </div>
          </div>
        </section>

        <section className="wrap section" aria-labelledby="cta-title">
          <div className="cta on-ink">
            <div>
              <h2 id="cta-title">
                {next
                  ? `${next.homeTeam} v ${next.awayTeam} is next.`
                  : "Start with the next kickoff."}
              </h2>
              <p>
                {next
                  ? `The model picks ${next.predictedOutcome === "Draw" ? "a draw" : next.predictedOutcome === "Home Win" ? `${next.homeTeam} to win` : `${next.awayTeam} to win`}, predicted score ${next.predictedScore.replace(/ /g, " ")}. See it beside the rest of gameweek ${next.gameweek}.`
                  : "Open fixtures to browse every gameweek with the model beside it."}
              </p>
            </div>
            <button type="button" className="btn btn--paper" onClick={() => onNavigate("fixtures")}>
              Open fixtures
            </button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer__inner">
          <span>Forecasts are probabilities, not guarantees.</span>
          <div className="footer__actions">
            {onToggleMotion && (
              <button
                type="button"
                className="text-button"
                onClick={onToggleMotion}
                aria-pressed={motionDisabled ?? false}
              >
                Reduce motion
              </button>
            )}
            <a href="https://github.com/Raghav2012Code/epl-predictor" target="_blank" rel="noreferrer">
              View source
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
