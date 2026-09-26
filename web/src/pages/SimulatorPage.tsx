import React, { useEffect, useMemo, useState } from "react";
import type { EPLDataset, Fixture } from "../types";
import { MotionSection } from "../components/Motion";
import { TeamMark } from "../components/TeamMark";
import { ProbabilityStrip } from "../components/ProbabilityStrip";
import { deltaLabel, pct, scoreParts } from "../lib/format";
import { calculateScenario } from "../lib/fixtures";

export const SimulatorPage: React.FC<{
  dataset: EPLDataset;
  initialHome: string;
  initialAway: string;
}> = ({ dataset, initialHome, initialAway }) => {
  const names = useMemo(
    () => Object.keys(dataset.teams).sort(),
    [dataset.teams],
  );
  const [homeTeam, setHomeTeam] = useState(initialHome);
  const [awayTeam, setAwayTeam] = useState(initialAway);
  const [homeBoost, setHomeBoost] = useState(0);
  const [awayBoost, setAwayBoost] = useState(0);
  const [neutral, setNeutral] = useState(false);
  useEffect(() => {
    setHomeTeam(initialHome);
    setAwayTeam(initialAway);
  }, [initialHome, initialAway]);
  const home = dataset.teams[homeTeam] ?? dataset.teams[names[0]];
  const away = dataset.teams[awayTeam] ?? dataset.teams[names[1]];
  const production = useMemo(() => {
    const direct = dataset.fixtures.find(
      (fixture) =>
        fixture.homeTeam === homeTeam && fixture.awayTeam === awayTeam,
    );
    if (direct) return direct;
    const reverse = dataset.fixtures.find(
      (fixture) =>
        fixture.homeTeam === awayTeam && fixture.awayTeam === homeTeam,
    );
    if (!reverse) return null;
    const score = scoreParts(reverse.predictedScore);
    return {
      ...reverse,
      homeTeam,
      awayTeam,
      homeShort: reverse.awayShort,
      awayShort: reverse.homeShort,
      homeColor: reverse.awayColor,
      awayColor: reverse.homeColor,
      predictedScore: score
        ? `${score[1]} - ${score[0]}`
        : reverse.predictedScore,
      predHomeGoals: reverse.predAwayGoals,
      predAwayGoals: reverse.predHomeGoals,
      homeWinProb: reverse.awayWinProb,
      awayWinProb: reverse.homeWinProb,
      predictedOutcome:
        reverse.predictedOutcome === "Home Win"
          ? "Away Win"
          : reverse.predictedOutcome === "Away Win"
            ? "Home Win"
            : reverse.predictedOutcome,
    };
  }, [awayTeam, dataset.fixtures, homeTeam]);
  const scenario = useMemo(
    () => calculateScenario(home, away, homeBoost, awayBoost, neutral),
    [away, awayBoost, home, homeBoost, neutral],
  );
  const baseline = useMemo(
    () => calculateScenario(home, away, 0, 0, false),
    [away, home],
  );
  const resetScenario = () => {
    setHomeTeam(initialHome);
    setAwayTeam(initialAway);
    setHomeBoost(0);
    setAwayBoost(0);
    setNeutral(false);
  };
  if (!home || !away || !scenario)
    return <div className="empty-state">Club data is unavailable.</div>;
  const scenarioFixture = {
    homeWinProb: scenario.homeProb,
    drawProb: scenario.drawProb,
    awayWinProb: scenario.awayProb,
  } as Fixture;
  return (
    <MotionSection className="page-stack">
      <div className="page-intro">
        <div>
          <p className="eyebrow">Scenario tool</p>
          <h1>Ask a different question.</h1>
          <p className="lede">
            Adjust form and venue assumptions to see how the matchup moves.
            Scenario numbers are browser estimates; the scheduled forecast
            remains the production reference.
          </p>
        </div>
      </div>
      <div className="simulator-layout">
        <div className="control-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Adjust assumptions</p>
              <h2>Scenario controls</h2>
            </div>
            <button className="text-button" onClick={resetScenario}>Reset</button>
          </div>
          <label>
            Home club
            <select
              value={homeTeam}
              onChange={(event) => setHomeTeam(event.target.value)}
            >
              {names.map((name) => (
                <option key={name} disabled={name === awayTeam}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Away club
            <select
              value={awayTeam}
              onChange={(event) => setAwayTeam(event.target.value)}
            >
              {names.map((name) => (
                <option key={name} disabled={name === homeTeam}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Home form{" "}
            <input
              type="range"
              min="-30"
              max="30"
              value={homeBoost}
              onChange={(event) => setHomeBoost(Number(event.target.value))}
            />
            <span>
              {homeBoost > 0 ? "+" : ""}
              {homeBoost}%
            </span>
          </label>
          <label>
            Away form{" "}
            <input
              type="range"
              min="-30"
              max="30"
              value={awayBoost}
              onChange={(event) => setAwayBoost(Number(event.target.value))}
            />
            <span>
              {awayBoost > 0 ? "+" : ""}
              {awayBoost}%
            </span>
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              checked={neutral}
              onChange={(event) => setNeutral(event.target.checked)}
            />{" "}
            Neutral venue
          </label>
        </div>
        <div className="scenario-panel">
          <div className="scenario-score">
            <div>
              <TeamMark team={home} />
              <strong>{homeTeam}</strong>
            </div>
            <span>
              {scenario.homeScore} — {scenario.awayScore}
            </span>
            <div>
              <TeamMark team={away} />
              <strong>{awayTeam}</strong>
            </div>
          </div>
          <ProbabilityStrip fixture={scenarioFixture} />
          <div className="probability-labels">
            <span>
              <b>{pct(scenario.homeProb)}</b> Home
            </span>
            <span>
              <b>{pct(scenario.drawProb)}</b> Draw
            </span>
            <span>
              <b>{pct(scenario.awayProb)}</b> Away
            </span>
          </div>
          {baseline && (
            <div className="scenario-delta" aria-live="polite">
              <div>
                <span>Against baseline</span>
                <strong>{scenario.homeProb >= baseline.homeProb ? "Home" : "Away"} moves {deltaLabel(Math.abs(scenario.homeProb - baseline.homeProb))}</strong>
              </div>
              <p>{homeBoost || awayBoost || neutral ? "Your assumptions shift the browser scenario; the scheduled forecast remains unchanged." : "Move a control to compare your scenario with the neutral baseline."}</p>
            </div>
          )}
          <div className="scenario-grid">
            <div>
              <span>Expected home goals</span>
              <strong>{scenario.homeExpected.toFixed(2)}</strong>
            </div>
            <div>
              <span>Expected away goals</span>
              <strong>{scenario.awayExpected.toFixed(2)}</strong>
            </div>
            <div>
              <span>Scheduled forecast</span>
              <strong>{production?.predictedScore ?? "Not scheduled"}</strong>
            </div>
            <div>
              <span>Forecast source</span>
              <strong>{dataset.benchmark.productionModel}</strong>
            </div>
          </div>
        </div>
      </div>
    </MotionSection>
  );
};
