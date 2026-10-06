import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { EPLDataset } from "../types";
import { SplitBar } from "../components/SplitBar";
import { Grid } from "../components/charts/grid";
import { ChartTooltip } from "../components/charts/tooltip";
import { LineChart, Line } from "../components/charts/line-chart";
import { XAxis } from "../components/charts/x-axis";

export const AnalyticsPage: React.FC<{ dataset: EPLDataset }> = ({ dataset }) => {
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    title: string;
    caption: string;
  } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!selectedImage) return;
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
        return;
      }
      if (event.key === "Tab" && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], img[tabindex], [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !el.hasAttribute("disabled"));
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      opener?.focus?.();
    };
  }, [selectedImage]);
  const model =
    dataset.benchmark.models.find((entry) => entry.isProduction) ??
    dataset.benchmark.models[0];
  const asset = (path: string) =>
    `${import.meta.env.BASE_URL}${path.replace(/^\.?\//, "")}`;
  const rpsValues = dataset.benchmark.models.map((entry) => entry.rps);
  const rpsMin = Math.min(...rpsValues);
  const rpsMax = Math.max(...rpsValues);
  const rpsRange = Math.max(rpsMax - rpsMin, 0.0001);
  const playedFixtures = dataset.fixtures.filter((fixture) => fixture.status === "Played").length;
  const projectedFixtures = dataset.fixtures.length - playedFixtures;
  const coveragePercent = dataset.fixtures.length > 0
    ? Math.round((playedFixtures / dataset.fixtures.length) * 100)
    : 0;
  const firstKickoffByGameweek = new Map<number, string>();
  for (const fixture of dataset.fixtures) {
    if (fixture.date !== "TBC" && !firstKickoffByGameweek.has(fixture.gameweek)) {
      firstKickoffByGameweek.set(fixture.gameweek, fixture.date);
    }
  }
  const goalChartData = dataset.analytics.goalsPerGameweek.map((entry) => {
    const kickoff = firstKickoffByGameweek.get(entry.gw);
    return {
      // Pin local noon: `new Date("2026-08-21")` parses as UTC midnight and
      // labelled every gameweek a day early in UTC-negative timezones.
      date: kickoff
        ? new Date(`${kickoff}T12:00:00`)
        : new Date(2026, 7, 14 + (entry.gw - 1) * 7, 12),
      goals: entry.goals,
      average: entry.avgPerMatch,
      gameweek: entry.gw,
    };
  });
  const outcome = dataset.analytics.outcomeDistribution;
  const metrics: Array<{ label: string; value: string; note: string }> = [
    { label: "RPS", value: `${model?.rps ?? "n/a"}`, note: "Selection metric. Lower is better." },
    { label: "Accuracy", value: `${model?.accuracy ?? "n/a"}%`, note: "Share of outcomes called correctly." },
    { label: "Log loss", value: `${model?.logLoss ?? "n/a"}`, note: "Probability quality. Lower is better." },
    { label: "Goal error", value: `${model?.avgGoalMae ?? "n/a"}`, note: "Mean absolute error in goals." },
    { label: "Within one goal", value: `${model?.within1Goal ?? "n/a"}%`, note: "Scorelines off by at most one." },
  ];
  return (
    <>
      <header className="page-head">
        <div>
          <h1>Analytics</h1>
          <p className="label page-head__sub">
            Evidence for the {dataset.benchmark.productionModel} model, measured
            on a time-ordered holdout. Projections are never counted as results.
          </p>
        </div>
      </header>

      <dl className="metrics" aria-label={`${dataset.benchmark.productionModel} model metrics`}>
        {metrics.map((metric) => (
          <div key={metric.label}>
            <dt className="label">{metric.label}</dt>
            <dd className="num">{metric.value}</dd>
            <dd className="label">{metric.note}</dd>
          </div>
        ))}
      </dl>

      <section className="block" aria-labelledby="models-title">
        <h2 id="models-title">Model comparison</h2>
        <p className="label block__sub">
          The production model has the lowest RPS, which rewards honest
          probabilities rather than a single correct guess.
        </p>
        <div
          className="rps"
          role="img"
          aria-label={`RPS by model, lower is better: ${dataset.benchmark.models.map((entry) => `${entry.name} ${entry.rps}`).join(", ")}`}
        >
          {dataset.benchmark.models.map((entry) => (
            <div className={`rps__row${entry.isProduction ? " is-production" : ""}`} key={entry.name}>
              <span className="rps__name">{entry.name}</span>
              <span className="rps__track">
                <span
                  className="rps__tick"
                  style={{ left: `${4 + ((entry.rps - rpsMin) / rpsRange) * 92}%` }}
                />
              </span>
              <span className="rps__value num">{entry.rps.toFixed(4)}</span>
            </div>
          ))}
          <p className="label rps__scale">
            The axis runs from {rpsMin.toFixed(4)} to {rpsMax.toFixed(4)}, so
            small gaps look large. The models are close.
          </p>
        </div>
        <div className="table-scroll">
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
              {dataset.benchmark.models.map((entry) => (
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
        </div>
      </section>

      <div className="block-grid">
        <section className="block" aria-labelledby="mix-title">
          <h2 id="mix-title">Outcome mix</h2>
          <p className="label block__sub">
            Forecast outcomes across all {dataset.fixtures.length} fixtures,
            official and projected.
          </p>
          <SplitBar size="detail" home={outcome.homePct} draw={outcome.drawPct} away={outcome.awayPct} />
          <p className="block__note">
            {outcome.home} home wins, {outcome.draw} draws and {outcome.away} away wins.
          </p>
        </section>
        <section className="block" aria-labelledby="coverage-title">
          <h2 id="coverage-title">Season coverage</h2>
          <p className="label block__sub">How much of the schedule has a recorded result.</p>
          <p className="coverage__figure num">
            {playedFixtures}
            <span>/{dataset.fixtures.length}</span>
          </p>
          <div
            className="meter"
            role="progressbar"
            aria-label="Fixtures with a recorded result"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={coveragePercent}
          >
            <span style={{ width: `${coveragePercent}%` }} />
          </div>
          <p className="block__note">
            {playedFixtures} played, {projectedFixtures} projected. {coveragePercent}% of the season is on record.
          </p>
        </section>
      </div>

      <section className="block" aria-labelledby="goals-title">
        <h2 id="goals-title">Goals by gameweek</h2>
        <p className="label block__sub">
          Recorded weeks use real goals. Projected weeks add up each match's single most likely score, which reads lower than real totals.
        </p>
        <div className="chart">
          <LineChart data={goalChartData} xDataKey="date" xPadding={10} aspectRatio="2.4 / 1" margin={{ top: 20, right: 16, bottom: 42, left: 16 }}>
            <Grid horizontal stroke="var(--line)" strokeDasharray="2,4" />
            <Line dataKey="goals" stroke="var(--home)" strokeWidth={3} showMarkers />
            <XAxis numTicks={7} />
            <ChartTooltip rows={(point) => [{ label: `GW${point.gameweek}`, value: `${point.goals} goals`, color: "var(--home)" }]} />
          </LineChart>
        </div>
      </section>

      <section className="block" aria-labelledby="diag-title">
        <h2 id="diag-title">Training diagnostics</h2>
        <p className="label block__sub">
          Charts generated from the current benchmark. Select one to enlarge it.
        </p>
        <ul className="diagnostics">
          {dataset.benchmark.diagnostics.map((diagnostic) => (
            <li key={diagnostic.id}>
              <button
                type="button"
                className="diagnostics__item"
                onClick={() => setSelectedImage(diagnostic)}
              >
                <img src={asset(diagnostic.src)} alt="" loading="lazy" />
                <span className="diagnostics__title">{diagnostic.title}</span>
                <span className="label">{diagnostic.caption}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {selectedImage && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedImage(null);
          }}
        >
          <div
            className="dialog"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="diagnostic-title"
          >
            <div className="dialog__head">
              <h2 id="diagnostic-title">{selectedImage.title}</h2>
              <button
                ref={closeRef}
                type="button"
                className="btn btn--quiet"
                onClick={() => setSelectedImage(null)}
              >
                <X size={18} aria-hidden="true" /> Close
              </button>
            </div>
            <img
              className="dialog__image"
              src={asset(selectedImage.src)}
              alt={`${selectedImage.title}. ${selectedImage.caption}`}
            />
            <p className="label">{selectedImage.caption}</p>
          </div>
        </div>
      )}
    </>
  );
};
