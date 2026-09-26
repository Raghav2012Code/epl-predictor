import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { EPLDataset } from "../types";
import { MotionSection } from "../components/Motion";
import { Grid } from "../components/charts/grid";
import { ChartTooltip } from "../components/charts/tooltip";
import { LineChart, Line } from "../components/charts/line-chart";
import { XAxis } from "../components/charts/x-axis";
import { RingChart } from "../components/charts/ring-chart";
import { Ring } from "../components/charts/ring";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

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
  const modelChartData = dataset.benchmark.models.map((entry) => ({
    name: entry.name.replace("Random Forest", "RF").replace("Logistic Regression", "Logistic"),
    rps: entry.rps,
    isProduction: entry.isProduction,
  }));
  const rpsMin = Math.min(...modelChartData.map((entry) => entry.rps));
  const rpsMax = Math.max(...modelChartData.map((entry) => entry.rps));
  const rpsRange = Math.max(rpsMax - rpsMin, 0.001);
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
  const goalChartData = dataset.analytics.goalsPerGameweek.map((entry) => ({
    date: new Date(
      firstKickoffByGameweek.get(entry.gw) ??
        Date.UTC(2026, 7, 14 + (entry.gw - 1) * 7),
    ),
    goals: entry.goals,
    average: entry.avgPerMatch,
    gameweek: entry.gw,
  }));
  const outcome = dataset.analytics.outcomeDistribution;
  const outcomeChartData = [
    { label: "Home", value: outcome.homePct, maxValue: 100, color: "#1d6f52" },
    { label: "Draw", value: outcome.drawPct, maxValue: 100, color: "#b46b2a" },
    { label: "Away", value: outcome.awayPct, maxValue: 100, color: "#3d5a80" },
  ];
  return (
    <MotionSection className="page-stack">
      <div className="page-intro">
        <div>
          <p className="eyebrow">Analytics</p>
          <h1>Read the season through its evidence.</h1>
          <p className="lede">
            Metrics are calculated on a time ordered holdout. This page
            separates validation evidence from the season projection so the
            interface never presents a scenario as a measured result.
          </p>
        </div>
        <div className="intro-stat">
          <strong>{dataset.benchmark.productionModel}</strong>
          <span>selected for production</span>
        </div>
      </div>
      <div className="metric-grid">
        <div className="metric-primary">
          <span>RPS</span>
          <strong>{model?.rps ?? "—"}</strong>
          <small>Primary selection metric · lower is better</small>
        </div>
        <div>
          <span>Accuracy</span>
          <strong>{model?.accuracy ?? "—"}%</strong>
          <small>Outcome argmax</small>
        </div>
        <div>
          <span>Log loss</span>
          <strong>{model?.logLoss ?? "—"}</strong>
          <small>Probability quality</small>
        </div>
        <div>
          <span>Goal MAE</span>
          <strong>{model?.avgGoalMae ?? "—"}</strong>
          <small>Expected goals</small>
        </div>
        <div>
          <span>Within one goal</span>
          <strong>{model?.within1Goal ?? "—"}%</strong>
          <small>Scoreline tolerance</small>
        </div>
      </div>
      <div className="analytics-chart-grid" aria-label="Interactive analytics charts">
        <Card className="analytics-chart-card analytics-chart-wide">
          <CardHeader>
            <div className="analytics-card-heading">
              <div>
                <CardTitle>RPS benchmark</CardTitle>
                <CardDescription>Lower scores indicate better-calibrated probabilities.</CardDescription>
              </div>
              <Badge variant="outline">Production: {dataset.benchmark.productionModel}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="rps-chart"
              role="img"
              aria-label="RPS comparison. Lower scores are better."
            >
              <div className="rps-chart-scale" aria-hidden="true">
                <span>Higher bars = higher RPS</span>
                <span>Zoomed to observed range</span>
                <span>Lower score = better</span>
              </div>
              <div className="rps-bars">
                {modelChartData.map((entry) => {
                  const relativeHeight = 34 + ((entry.rps - rpsMin) / rpsRange) * 66;
                  return (
                    <div className={`rps-bar-group ${entry.isProduction ? "is-production" : ""}`} key={entry.name}>
                      <strong>{entry.rps.toFixed(4)}</strong>
                      <div className="rps-bar-track">
                        <div className="rps-bar" style={{ height: `${relativeHeight}%` }} />
                      </div>
                      <span>{entry.name}</span>
                      {entry.isProduction && <small>Production</small>}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="analytics-chart-card">
          <CardHeader>
            <CardTitle>Outcome mix</CardTitle>
            <CardDescription>Share across official and projected fixtures.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="outcome-chart-wrap">
              <RingChart data={outcomeChartData} strokeWidth={15} ringGap={8} baseInnerRadius={38}>
                <Ring index={0} color="#1d6f52" />
                <Ring index={1} color="#b46b2a" />
                <Ring index={2} color="#3d5a80" />
              </RingChart>
              <div className="outcome-chart-total"><strong>{dataset.fixtures.length}</strong><span>fixtures</span></div>
            </div>
            <div className="chart-legend">
              {outcomeChartData.map((entry) => <span key={entry.label}><i style={{ background: entry.color }} />{entry.label} {entry.value.toFixed(1)}%</span>)}
            </div>
          </CardContent>
        </Card>
        <Card className="analytics-chart-card coverage-card">
          <CardHeader>
            <CardTitle>Season coverage</CardTitle>
            <CardDescription>How much of the schedule has a recorded result.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="coverage-stat">
              <strong>{playedFixtures}<span>/{dataset.fixtures.length}</span></strong>
              <div>
                <span>results recorded</span>
                <small>{coveragePercent}% of the season</small>
              </div>
            </div>
            <div className="coverage-meter" aria-label={`${coveragePercent}% of fixtures have recorded results`} role="progressbar" aria-valuemax={100} aria-valuemin={0} aria-valuenow={coveragePercent}>
              <span style={{ width: `${coveragePercent}%` }} />
            </div>
            <div className="coverage-breakdown">
              <span><i className="coverage-dot recorded" />{playedFixtures} played</span>
              <span><i className="coverage-dot projected" />{projectedFixtures} projected</span>
            </div>
          </CardContent>
        </Card>
        <Card className="analytics-chart-card analytics-chart-wide">
          <CardHeader>
            <div className="analytics-card-heading">
              <div>
                <CardTitle>Goals by gameweek</CardTitle>
                <CardDescription>Observed and projected goal totals across the season schedule.</CardDescription>
              </div>
              <Badge variant="secondary">Offline dataset</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bklit-chart-shell">
              <LineChart data={goalChartData} xDataKey="date" xPadding={10} aspectRatio="2.25 / 1" margin={{ top: 20, right: 16, bottom: 42, left: 16 }}>
                <Grid horizontal stroke="rgba(23,60,50,.12)" strokeDasharray="2,4" />
                <Line dataKey="goals" stroke="#1d6f52" strokeWidth={3} showMarkers />
                <XAxis numTicks={7} />
                <ChartTooltip rows={(point) => [{ label: `GW${point.gameweek}`, value: `${point.goals} goals`, color: "#1d6f52" }]} />
              </LineChart>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="content-card">
        <div className="section-heading small">
          <div>
            <p className="eyebrow">Validation</p>
            <h2>Model comparison</h2>
          </div>
          <span className="muted">
            Lower log loss and goal error are better
          </span>
        </div>
        <div className="model-table">
          <div className="model-row model-header">
            <span>Model</span>
            <span>RPS</span>
            <span>Accuracy</span>
            <span>Log loss</span>
            <span>Goal MAE</span>
          </div>
          {dataset.benchmark.models.map((entry) => (
            <div
              className={`model-row ${entry.isProduction ? "selected-row" : ""}`}
              key={entry.name}
            >
              <strong>
                {entry.name}
                {entry.isProduction && <em>Production</em>}
              </strong>
              <span data-label="RPS" aria-label={`RPS ${entry.rps}`}>{entry.rps}</span>
              <span data-label="Accuracy" aria-label={`Accuracy ${entry.accuracy}%`}>{entry.accuracy}%</span>
              <span data-label="Log loss" aria-label={`Log loss ${entry.logLoss}`}>{entry.logLoss}</span>
              <span data-label="Goal MAE" aria-label={`Goal MAE ${entry.avgGoalMae}`}>{entry.avgGoalMae}</span>
            </div>
          ))}
        </div>
        <div className="metric-explainer">
          <div>
            <p className="eyebrow">Why RPS leads</p>
            <h3>Probability quality matters more than a single winner.</h3>
          </div>
          <p>Ranked Probability Score rewards calibrated probability distributions, not just the most likely outcome. The production model is selected by the lowest evaluation RPS, with log loss, accuracy, and goal error retained as supporting evidence.</p>
        </div>
      </div>
      <div className="content-card">
        <div className="section-heading small">
          <div>
            <p className="eyebrow">Diagnostics</p>
            <h2>Training signals</h2>
          </div>
          <span className="muted">Generated from the current benchmark</span>
        </div>
        <div className="diagnostic-grid">
          {dataset.benchmark.diagnostics.map((diagnostic) => (
            <button
              key={diagnostic.id}
              onClick={() => setSelectedImage(diagnostic)}
            >
              <img
                src={asset(diagnostic.src)}
                alt={diagnostic.title}
                loading="lazy"
              />
              <span>
                <strong>{diagnostic.title}</strong>
                <small>{diagnostic.caption}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
      {selectedImage && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedImage(null);
          }}
        >
          <div
            className="image-dialog"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="diagnostic-title"
          >
            <div className="section-heading small">
              <h2 id="diagnostic-title">{selectedImage.title}</h2>
              <button
                ref={closeRef}
                onClick={() => setSelectedImage(null)}
                aria-label="Close diagnostic preview"
              >
                <X size={18} />
              </button>
            </div>
            <img src={asset(selectedImage.src)} alt={selectedImage.title} />
            <p className="muted">{selectedImage.caption}</p>
          </div>
        </div>
      )}
    </MotionSection>
  );
};
