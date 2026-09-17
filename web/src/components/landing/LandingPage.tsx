import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { EPLDataset, Fixture, TeamProfile } from "../../types";
import {
  MotionBar,
  MotionButton,
  MotionItem,
  MotionList,
  MotionNumber,
  MotionSection,
  useMotionDisabled,
} from "../Motion";
import { dashboardRoutes, type AppRoute } from "../../lib/appRoute";
import { getLandingData } from "../../lib/landingData";
import "../../styles/landing.css";

type LandingPageProps = {
  dataset?: EPLDataset | null;
  onNavigate: (route: AppRoute) => void;
  motionDisabled?: boolean;
  onToggleMotion?: () => void;
};

const pct = (value: number) => `${Number(value).toFixed(1)}%`;
const strongestOf = (fixture: Fixture) =>
  Math.max(fixture.homeWinProb, fixture.drawProb, fixture.awayWinProb);

const displayDate = (value: string) => {
  if (!value || value === "TBC") return "Date TBC";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(`${value}T12:00:00`));
  } catch {
    return value;
  }
};

const TeamBadge: React.FC<{ team?: TeamProfile; short?: string; badge?: string }> = ({
  team,
  short,
  badge,
}) => {
  const src = badge ?? team?.badge ?? "";
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <img
        className="team-mark team-badge"
        src={`${import.meta.env.BASE_URL}${src}`}
        alt=""
        aria-hidden="true"
        loading="lazy"
        draggable={false}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <span
      className="team-mark"
      style={{ borderColor: team?.color ?? "#1d6f52" }}
      aria-hidden="true"
    >
      {(short ?? team?.short ?? "FC").slice(0, 3)}
    </span>
  );
};

const ProbabilityStrip: React.FC<{ fixture: Fixture }> = ({ fixture }) => (
  <div
    className="probability-strip"
    aria-label={`Home ${pct(fixture.homeWinProb)}, draw ${pct(fixture.drawProb)}, away ${pct(fixture.awayWinProb)}`}
  >
    <MotionBar className="prob-home" value={1} style={{ width: `${fixture.homeWinProb}%` }} />
    <MotionBar className="prob-draw" value={1} style={{ width: `${fixture.drawProb}%` }} />
    <MotionBar className="prob-away" value={1} style={{ width: `${fixture.awayWinProb}%` }} />
  </div>
);

const sectionLinks = [
  { label: "Workspace", href: "#workspace" },
  { label: "Evidence", href: "#evidence" },
];

const workspaceCopy: Record<
  Exclude<AppRoute, "landing">,
  { title: string; body: string }
> = {
  fixtures: {
    title: "Fixtures",
    body: "Gameweeks with the forecast beside each tie. Official results stay separate from projections.",
  },
  simulator: {
    title: "Simulator",
    body: "Pick any pairing, adjust form and venue, and see how the outlook moves.",
  },
  standings: {
    title: "Table",
    body: "Full-season projection built from model scorelines. Click a row for the club.",
  },
  clubs: {
    title: "Clubs",
    body: "One page per club: record, goals, rest, recent results and what is next.",
  },
  analytics: {
    title: "Analytics",
    body: "RPS-led model comparison, outcome mix, goals by gameweek and diagnostics.",
  },
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
  const nextFixture =
    fixtures.find((fixture) => fixture.status !== "Played") ?? fixtures[0] ?? null;
  const playedCount = fixtures.filter((fixture) => fixture.status === "Played").length;
  const totalCount = dataset?.totalMatches ?? landingData.totalMatches;
  const models = dataset?.benchmark.models ?? [];
  const production =
    models.find((entry) => entry.isProduction) ?? models[0] ?? null;
  const upcoming = fixtures.filter((fixture) => fixture.status !== "Played").slice(0, 3);
  const recent = fixtures
    .filter((fixture) => fixture.status === "Played")
    .slice(-3)
    .reverse();
  const leader = dataset?.standings[0];
  const coverage = totalCount > 0 ? Math.round((playedCount / totalCount) * 100) : 0;

  const workspaceMeta = (route: Exclude<AppRoute, "landing">): string => {
    switch (route) {
      case "fixtures":
        return `${playedCount}/${totalCount} results recorded`;
      case "simulator":
        return "Browser estimates · production stays fixed";
      case "standings":
        return leader ? `${leader.team} leads on ${leader.points} pts` : "Projection table";
      case "clubs":
        return `${Object.keys(dataset?.teams ?? {}).length || 20} club profiles`;
      case "analytics":
        return production
          ? `${production.name} · RPS ${production.rps.toFixed(4)}`
          : "Time-ordered validation";
      default:
        return "";
    }
  };

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth", block: "start" });
  };

  return (
    <div className="landing-page" id="top">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <motion.header
        className="landing-topbar"
        initial={reduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="landing-topbar-inner">
          <button
            className="landing-brand"
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" })}
            aria-label="EPL Predictor home"
          >
            <img
              className="landing-brand-logo"
              src={`${import.meta.env.BASE_URL}epl-predictor-header-logo.png`}
              alt="EPL Predictor"
              draggable={false}
            />
            <span className="landing-brand-sub">
              Match analysis · {dataset?.season ?? "2026/2027"}
            </span>
          </button>
          <nav className="landing-topbar-links" aria-label="Homepage sections">
            {sectionLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => {
                  event.preventDefault();
                  scrollTo(link.href);
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <MotionButton
            className="landing-enter"
            type="button"
            onClick={() => onNavigate("fixtures")}
          >
            Enter workspace <ArrowRight size={15} aria-hidden="true" />
          </MotionButton>
        </div>
      </motion.header>

      <main className="landing-main" id="main-content" tabIndex={-1}>
        <MotionSection className="landing-hero">
          <MotionList className="landing-hero-copy">
            <MotionItem>
              <p className="eyebrow">Premier League · {dataset?.season ?? "2026/2027"}</p>
              <h1>Every fixture, read with evidence.</h1>
            </MotionItem>
            <MotionItem>
              <p className="lede">
                Calibrated Home/Draw/Away probabilities, expected goals and a likely
                scoreline — always next to the official result, never mixed with it.
              </p>
            </MotionItem>
            <MotionItem>
              <div className="landing-hero-actions">
                <MotionButton
                  className="primary-button landing-hero-primary"
                  type="button"
                  onClick={() => onNavigate("fixtures")}
                >
                  Open fixtures <ArrowRight size={16} aria-hidden="true" />
                </MotionButton>
              </div>
            </MotionItem>
          </MotionList>

          <article className="landing-signal" aria-label="Next forecast">
            <div className="landing-signal-top">
              <span className="status-pill status-upcoming">Next forecast</span>
              <span className="landing-signal-meta">
                {nextFixture ? (
                  <>
                    GW{nextFixture.gameweek} · {displayDate(nextFixture.date)} ·{" "}
                    {nextFixture.time === "TBC" ? "Kickoff TBC" : nextFixture.time}
                  </>
                ) : (
                  "Awaiting dataset"
                )}
              </span>
            </div>
            {nextFixture ? (
              <>
                <div className="landing-matchup">
                  <div>
                    <TeamBadge
                      team={dataset?.teams[nextFixture.homeTeam]}
                      short={nextFixture.homeShort}
                      badge={nextFixture.homeBadge}
                    />
                    <strong>{nextFixture.homeTeam}</strong>
                    <small>Home</small>
                  </div>
                  <div className="landing-matchup-score">
                    <span>{nextFixture.predictedScore}</span>
                    <small>most likely scoreline</small>
                  </div>
                  <div>
                    <TeamBadge
                      team={dataset?.teams[nextFixture.awayTeam]}
                      short={nextFixture.awayShort}
                      badge={nextFixture.awayBadge}
                    />
                    <strong>{nextFixture.awayTeam}</strong>
                    <small>Away</small>
                  </div>
                </div>
                <ProbabilityStrip fixture={nextFixture} />
                <div className="probability-labels">
                  <span>
                    <b>{pct(nextFixture.homeWinProb)}</b> Home
                  </span>
                  <span>
                    <b>{pct(nextFixture.drawProb)}</b> Draw
                  </span>
                  <span>
                    <b>{pct(nextFixture.awayWinProb)}</b> Away
                  </span>
                </div>
                <div className="detail-metrics">
                  <div>
                    <span>Expected goals</span>
                    <strong>
                      {nextFixture.predHomeGoals.toFixed(2)} —{" "}
                      {nextFixture.predAwayGoals.toFixed(2)}
                    </strong>
                  </div>
                  <div>
                    <span>Strongest signal</span>
                    <strong>{pct(strongestOf(nextFixture))}</strong>
                  </div>
                  <div>
                    <span>Evidence state</span>
                    <strong>Projected</strong>
                  </div>
                </div>
                <MotionButton
                  className="primary-button"
                  type="button"
                  onClick={() => onNavigate("fixtures")}
                >
                  Inspect this fixture <ArrowUpRight size={16} aria-hidden="true" />
                </MotionButton>
              </>
            ) : (
              <div className="empty-state">Dataset is loading. The workspace will appear here.</div>
            )}
          </article>
        </MotionSection>

        <MotionSection inView className="stat-grid landing-stats" aria-label="Model snapshot">
          <div>
            <span>Production model</span>
            <strong>{production?.name ?? landingData.productionModel}</strong>
          </div>
          <div>
            <span>Ranked probability score</span>
            <strong>
              {production ? (
                <MotionNumber value={production.rps} decimals={4} />
              ) : (
                landingData.productionRps.toFixed(4)
              )}
            </strong>
          </div>
          <div>
            <span>Validation accuracy</span>
            <strong>
              {production ? <MotionNumber value={production.accuracy} decimals={1} suffix="%" /> : "—"}
            </strong>
          </div>
          <div>
            <span>Average goal error</span>
            <strong>
              {production ? <MotionNumber value={production.avgGoalMae} decimals={2} /> : "—"}
            </strong>
          </div>
        </MotionSection>

        <MotionSection inView className="landing-section" id="workspace" aria-labelledby="workspace-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Workspace index</p>
              <h2 id="workspace-title">Five views, one dataset.</h2>
            </div>
            <span className="muted">
              {playedCount}/{totalCount} results recorded · {coverage}% of season
            </span>
          </div>
          <MotionList className="landing-workspace-grid">
            {dashboardRoutes.map((route, index) => (
              <MotionItem key={route}>
                <MotionButton
                  className="landing-workspace-card"
                  type="button"
                  onClick={() => onNavigate(route)}
                  aria-label={`Open ${workspaceCopy[route].title}`}
                >
                  <span className="landing-workspace-index">
                    0{index + 1} · {workspaceCopy[route].title}
                  </span>
                  <strong>{workspaceCopy[route].title}</strong>
                  <p>{workspaceCopy[route].body}</p>
                  <span className="landing-workspace-meta">
                    {workspaceMeta(route)}
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </span>
                </MotionButton>
              </MotionItem>
            ))}
          </MotionList>
        </MotionSection>

        <MotionSection inView className="landing-section" id="evidence" aria-labelledby="evidence-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Evidence first</p>
              <h2 id="evidence-title">Validation before projection.</h2>
            </div>
            <span className="muted">Time-ordered holdout · leakage-safe features</span>
          </div>
          <div className="two-column">
            <div className="content-card">
              <div className="section-heading small">
                <h2>Model comparison</h2>
                <span className="muted">Lower RPS is better</span>
              </div>
              <div className="model-table">
                <div className="model-row model-header">
                  <span>Model</span>
                  <span>RPS</span>
                  <span>Accuracy</span>
                  <span>Log loss</span>
                  <span>Goal MAE</span>
                </div>
                {(models.length ? models.slice(0, 3) : []).map((entry) => (
                  <div
                    className={`model-row ${entry.isProduction ? "selected-row" : ""}`}
                    key={entry.name}
                  >
                    <strong>
                      {entry.name}
                      {entry.isProduction && <em>Production</em>}
                    </strong>
                    <span>{entry.rps.toFixed(4)}</span>
                    <span>{entry.accuracy}%</span>
                    <span>{entry.logLoss}</span>
                    <span>{entry.avgGoalMae}</span>
                  </div>
                ))}
                {!models.length && (
                  <p className="muted">Benchmark loads with the dataset.</p>
                )}
              </div>
              <p className="landing-model-note">
                <strong>Why RPS leads.</strong> Ranked Probability Score rewards
                honest distributions — production is picked by the lowest RPS,
                with log loss, accuracy and goal error as supporting evidence.
              </p>
            </div>
            <div className="content-card">
              <div className="section-heading small">
                <h2>Season coverage</h2>
                <span className="muted">Official vs projected</span>
              </div>
              <div className="coverage-stat">
                <strong>
                  <MotionNumber value={playedCount} />
                  <span>/{totalCount}</span>
                </strong>
                <div>
                  <span>results recorded</span>
                  <small><MotionNumber value={coverage} suffix="% of the season" /></small>
                </div>
              </div>
              <div
                className="coverage-meter"
                role="progressbar"
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={coverage}
                aria-label={`${coverage}% of fixtures have recorded results`}
              >
                <MotionBar value={coverage / 100} style={{ width: "100%" }} />
              </div>
              <div className="landing-mini-list" aria-label="Schedule edges">
                {upcoming.map((fixture) => (
                  <div className="mini-fixture" key={fixture.id}>
                    <span className="muted">GW{fixture.gameweek}</span>
                    <span>
                      {fixture.homeTeam} v {fixture.awayTeam}
                    </span>
                    <strong>{fixture.predictedScore}</strong>
                  </div>
                ))}
                {recent.map((fixture) => (
                  <div className="mini-fixture" key={`recent-${fixture.id}`}>
                    <span className="muted">Final</span>
                    <span>
                      {fixture.homeTeam} v {fixture.awayTeam}
                    </span>
                    <strong>{fixture.actualScore}</strong>
                  </div>
                ))}
                {!upcoming.length && !recent.length && (
                  <p className="muted">Fixtures load with the dataset.</p>
                )}
              </div>
            </div>
          </div>
        </MotionSection>

        <MotionSection inView className="landing-cta content-card" aria-labelledby="cta-title">
          <div>
            <p className="eyebrow">Start where the season is</p>
            <h2 id="cta-title">
              {nextFixture
                ? `${nextFixture.homeTeam} v ${nextFixture.awayTeam} is next.`
                : "Start with the next kickoff."}
            </h2>
            <p className="muted">
              {nextFixture
                ? `Model leans ${nextFixture.predictedOutcome.toLowerCase()} ${nextFixture.predictedScore}. Open it beside the rest of GW${nextFixture.gameweek}.`
                : "Open the workspace to browse every gameweek with the model beside it."}
            </p>
          </div>
          <MotionButton
            className="primary-button landing-cta-button"
            type="button"
            onClick={() => onNavigate("fixtures")}
          >
            Enter the workspace <ArrowRight size={16} aria-hidden="true" />
          </MotionButton>
        </MotionSection>
      </main>

      <footer className="site-footer landing-footer">
        <span>Forecasts are probabilities, not guarantees.</span>
        {onToggleMotion && (
          <button
            className="text-button motion-toggle"
            type="button"
            onClick={onToggleMotion}
            aria-pressed={motionDisabled ?? false}
          >
            {motionDisabled ? "Motion reduced" : "Motion on"}
          </button>
        )}
        <a
          href="https://github.com/Raghav2012Code/epl-predictor"
          target="_blank"
          rel="noreferrer"
        >
          View source <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </footer>
    </div>
  );
};
