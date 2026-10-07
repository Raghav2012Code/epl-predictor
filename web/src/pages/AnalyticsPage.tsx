import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { EPLDataset } from "../types";
import { SplitBar } from "../components/SplitBar";
import { GoalsChart } from "../components/GoalsChart";
import { ConfusionMatrices, GoalErrorCharts, ReliabilityCurves } from "../components/EvaluationCharts";

/** Plots whose numbers the page already draws natively (table, RPS strip, feature bars). */
const NATIVE_DIAGNOSTICS = new Set(["feature_importance", "rps_comparison", "model_metrics"]);

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
  const recordedWeeks = new Set(
    dataset.analytics.goalsPerGameweek
      .map((entry) => entry.gw)
      .filter((gw) => {
        const week = dataset.fixtures.filter((fixture) => fixture.gameweek === gw);
        return week.length > 0 && week.every((fixture) => fixture.status === "Played");
      }),
  );
  const topImportance = Math.max(0.0001, ...dataset.benchmark.topFeatures.map((feature) => feature.importance));
  const evaluation = dataset.benchmark.evaluation;
  // Draw from data when the export carries it; older datasets fall back to the PNG plots.
  const plots = evaluation
    ? []
    : dataset.benchmark.diagnostics.filter((diagnostic) => !NATIVE_DIAGNOSTICS.has(diagnostic.id));
  const outcome = dataset.analytics.outcomeDistribution;
  const sections = [
    { id: "models-title", label: "Models" },
    { id: "mix-title", label: "Outcome mix" },
    { id: "goals-title", label: "Goals" },
    ...(dataset.benchmark.topFeatures.length ? [{ id: "features-title", label: "Drivers" }] : []),
    ...(evaluation
      ? [
          { id: "confusion-title", label: "Calls" },
          { id: "calibration-title", label: "Calibration" },
          { id: "goal-error-title", label: "Goal error" },
        ]
      : plots.length
        ? [{ id: "diag-title", label: "Diagnostics" }]
        : []),
  ];
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
            Evidence for the {dataset.benchmark.productionModel} model, tested on
            recent matches it never trained on. Projections are never counted as results.
          </p>
        </div>
      </header>

      <nav className="page-nav" aria-label="On this page">
        {sections.map((section) => (
          <a key={section.id} href={`#${section.id}`}>
            {section.label}
          </a>
        ))}
      </nav>

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
        <div className="table-scroll" role="region" aria-label="Validation results by model" tabIndex={0}>
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
        <GoalsChart weeks={dataset.analytics.goalsPerGameweek} recorded={recordedWeeks} />
      </section>

      {dataset.benchmark.topFeatures.length > 0 && (
        <section className="block" aria-labelledby="features-title">
          <h2 id="features-title">What drives the forecast</h2>
          <p className="label block__sub">
            The {dataset.benchmark.topFeatures.length} inputs the {dataset.benchmark.productionModel} model
            weighs most, from pre-match data only.
          </p>
          <ol className="features">
            {dataset.benchmark.topFeatures.map((feature) => (
              <li key={feature.name}>
                <span className="features__name">
                  {feature.desc}
                  <span className="label">{feature.category}</span>
                </span>
                <span className="features__track" aria-hidden="true">
                  <span style={{ width: `${(feature.importance / topImportance) * 100}%` }} />
                </span>
                <span className="features__value num">{feature.importance.toFixed(3)}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {evaluation && (
        <>
          <section className="block" aria-labelledby="confusion-title">
            <h2 id="confusion-title">Where the calls land</h2>
            <p className="label block__sub">
              All {evaluation.matches} test matches, split by the actual result and the outcome each model
              picked.
            </p>
            <ConfusionMatrices evaluation={evaluation} production={dataset.benchmark.productionModel} />
          </section>
          <section className="block" aria-labelledby="calibration-title">
            <h2 id="calibration-title">Are the probabilities honest?</h2>
            <p className="label block__sub">
              Test matches grouped by the probability each model gave an outcome.
            </p>
            <ReliabilityCurves evaluation={evaluation} production={dataset.benchmark.productionModel} />
          </section>
          <section className="block" aria-labelledby="goal-error-title">
            <h2 id="goal-error-title">Goal error</h2>
            <p className="label block__sub">
              The {dataset.benchmark.productionModel} model's predicted scores against the real ones, on the same
              test matches.
            </p>
            <GoalErrorCharts evaluation={evaluation} />
          </section>
        </>
      )}

      {plots.length > 0 && (
        <section className="block" aria-labelledby="diag-title">
          <h2 id="diag-title">Training diagnostics</h2>
          <p className="label block__sub">
            Plots from the current training run. Select one to enlarge it.
          </p>
          <ul className="diagnostics">
            {plots.map((diagnostic) => (
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
      )}

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
