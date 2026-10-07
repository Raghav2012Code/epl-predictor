import React, { useEffect, useId, useMemo, useState } from "react";
import type { EPLDataset } from "../types";
import { TeamMark } from "../components/TeamMark";
import { SplitBar } from "../components/SplitBar";
import { scoreParts } from "../lib/format";
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
  const uid = useId();
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
    return (
      <div className="empty">
        <strong>Club data is unavailable</strong>
        Reload the page to load the season file again.
      </div>
    );
  const changed = homeBoost !== 0 || awayBoost !== 0 || neutral;
  const homeMove = baseline ? scenario.homeProb - baseline.homeProb : 0;
  const formatBoost = (value: number) => `${value > 0 ? "+" : ""}${value}%`;
  return (
    <>
      <header className="page-head">
        <div>
          <h1>Simulator</h1>
          <p className="label page-head__sub">
            Change attack and venue to see how a matchup moves. Scenario numbers
            are estimates made in your browser; the scheduled forecast stays the
            reference.
          </p>
        </div>
      </header>
      <div className="sim">
        <form className="sim__controls" onSubmit={(event) => event.preventDefault()} aria-label="Scenario controls">
          <div className="sim__controls-head">
            <h2>Scenario</h2>
            <button type="button" className="text-button" onClick={resetScenario} disabled={!changed && homeTeam === initialHome && awayTeam === initialAway}>
              Reset
            </button>
          </div>
          <div className="field">
            <label htmlFor={`${uid}-home`}>Home club</label>
            <select
              id={`${uid}-home`}
              className="select"
              value={homeTeam}
              onChange={(event) => setHomeTeam(event.target.value)}
            >
              {names.map((name) => (
                <option key={name} disabled={name === awayTeam}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor={`${uid}-away`}>Away club</label>
            <select
              id={`${uid}-away`}
              className="select"
              value={awayTeam}
              onChange={(event) => setAwayTeam(event.target.value)}
            >
              {names.map((name) => (
                <option key={name} disabled={name === homeTeam}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <div className="field__row">
              <label htmlFor={`${uid}-hf`}>{homeTeam} attack</label>
              <output htmlFor={`${uid}-hf`} className="num">{formatBoost(homeBoost)}</output>
            </div>
            <input
              id={`${uid}-hf`}
              className="range"
              type="range"
              min="-30"
              max="30"
              value={homeBoost}
              aria-valuetext={`${formatBoost(homeBoost)} goals scored`}
              onChange={(event) => setHomeBoost(Number(event.target.value))}
              aria-valuetext={formatBoost(homeBoost)}
            />
            <div className="range-scale label" aria-hidden="true">
              <span>-30%</span>
              <span>No change</span>
              <span>+30%</span>
            </div>
          </div>
          <div className="field">
            <div className="field__row">
              <label htmlFor={`${uid}-af`}>{awayTeam} attack</label>
              <output htmlFor={`${uid}-af`} className="num">{formatBoost(awayBoost)}</output>
            </div>
            <input
              id={`${uid}-af`}
              className="range"
              type="range"
              min="-30"
              max="30"
              value={awayBoost}
              aria-valuetext={`${formatBoost(awayBoost)} goals scored`}
              onChange={(event) => setAwayBoost(Number(event.target.value))}
              aria-valuetext={formatBoost(awayBoost)}
            />
            <div className="range-scale label" aria-hidden="true">
              <span>-30%</span>
              <span>No change</span>
              <span>+30%</span>
            </div>
          </div>
          <label className="check">
            <input
              type="checkbox"
              checked={neutral}
              onChange={(event) => setNeutral(event.target.checked)}
            />
            Neutral venue, no home advantage
          </label>
        </form>

        <section className="sim__result" aria-label="Scenario result">
          <div className="detail__teams">
            <div className="detail__team">
              <TeamMark team={home} />
              <strong>{homeTeam}</strong>
              <span className="label">Home</span>
            </div>
            <div className="detail__score">
              <span className="num detail__goals">
                {scenario.homeScore}
                <span aria-hidden="true"> - </span>
                <span className="sr-only"> to </span>
                {scenario.awayScore}
              </span>
              <span className="label">Scenario score</span>
            </div>
            <div className="detail__team">
              <TeamMark team={away} />
              <strong>{awayTeam}</strong>
              <span className="label">Away</span>
            </div>
          </div>
          <SplitBar
            size="detail"
            home={scenario.homeProb}
            draw={scenario.drawProb}
            away={scenario.awayProb}
          />
          {changed && baseline && (
            <div className="sim__baseline">
              <span className="label">Before your changes</span>
              <SplitBar home={baseline.homeProb} draw={baseline.drawProb} away={baseline.awayProb} />
            </div>
          )}
          <p className="sim__delta" aria-live="polite">
            {changed
              ? `Compared with the unadjusted baseline, ${homeTeam}'s win chance ${
                  homeMove === 0 ? "does not change" : `${homeMove > 0 ? "rises" : "falls"} by ${Math.abs(homeMove).toFixed(1)} percentage points`
                }.`
              : "Move a control to see the scenario change. The bar shows your scenario; the model's forecast is below."}
          </p>
          <dl className="facts facts--grid">
            <div>
              <dt className="label">Expected {homeTeam} goals</dt>
              <dd className="num">{scenario.homeExpected.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="label">Expected {awayTeam} goals</dt>
              <dd className="num">{scenario.awayExpected.toFixed(2)}</dd>
            </div>
          </dl>
          <div className="sim__model">
            <h2>The model's forecast</h2>
            {production ? (
              <>
                <p className="label">
                  {dataset.benchmark.productionModel} model, gameweek {production.gameweek}. Predicted score{" "}
                  <strong className="num">{production.predictedScore}</strong>. Your controls do not change it.
                </p>
                <SplitBar home={production.homeWinProb} draw={production.drawProb} away={production.awayWinProb} />
              </>
            ) : (
              <p className="label">
                {homeTeam} and {awayTeam} do not meet this season, so there is no model forecast to compare.
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
};
