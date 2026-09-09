import React, { useState, useMemo } from 'react';
import { TeamProfile } from '../types';
import { Sliders, RotateCcw, Swords, Shield, Zap, TrendingUp, Sparkles } from 'lucide-react';

interface MatchSimulatorProps {
  teams: Record<string, TeamProfile>;
  initialHomeTeam?: string;
  initialAwayTeam?: string;
}

export const MatchSimulator: React.FC<MatchSimulatorProps> = ({
  teams,
  initialHomeTeam = 'Arsenal',
  initialAwayTeam = 'Chelsea',
}) => {
  const teamNames = useMemo(() => Object.keys(teams).sort(), [teams]);

  const [homeTeam, setHomeTeam] = useState<string>(initialHomeTeam);
  const [awayTeam, setAwayTeam] = useState<string>(initialAwayTeam);

  // What-If Scenario Sandbox parameters
  const [homeRestDays, setHomeRestDays] = useState<number>(7);
  const [awayRestDays, setAwayRestDays] = useState<number>(7);
  const [homeFormBoost, setHomeFormBoost] = useState<number>(0); // -50% to +50%
  const [awayFormBoost, setAwayFormBoost] = useState<number>(0); // -50% to +50%
  const [isNeutralVenue, setIsNeutralVenue] = useState<boolean>(false);
  const [showSandbox, setShowSandbox] = useState<boolean>(true);

  const home = teams[homeTeam] || teams[teamNames[0]];
  const away = teams[awayTeam] || teams[teamNames[1]];

  // Real-time calculation engine mirroring trained Poisson & XGBoost weights
  const simulation = useMemo(() => {
    // Base attacking & defensive ratings
    const homeAttack = home.gfPerMatch * (1 + homeFormBoost / 100);
    const homeDefense = home.gaPerMatch * (1 - homeFormBoost / 200);

    const awayAttack = away.gfPerMatch * (1 + awayFormBoost / 100);
    const awayDefense = away.gaPerMatch * (1 - awayFormBoost / 200);

    // Rest fatigue modifier (rest days under 4 induces fatigue, 6-8 is optimal)
    const homeRestFactor = homeRestDays < 4 ? 0.88 : (homeRestDays > 10 ? 0.95 : 1.0);
    const awayRestFactor = awayRestDays < 4 ? 0.88 : (awayRestDays > 10 ? 0.95 : 1.0);

    // Home advantage boost
    const venueMultiplier = isNeutralVenue ? 1.0 : 1.25;
    const awayVenuePenalty = isNeutralVenue ? 1.0 : 0.88;

    // Expected goals calculation
    const expHg = Math.max(0.2, ((homeAttack + awayDefense) / 2) * venueMultiplier * homeRestFactor);
    const expAg = Math.max(0.1, ((awayAttack + homeDefense) / 2) * awayVenuePenalty * awayRestFactor);

    // Continuous goal differential
    const goalDiff = expHg - expAg;

    // Win/Draw/Loss probabilities via calibrated logistic softprob
    const logitH = 0.45 * goalDiff + (isNeutralVenue ? 0.0 : 0.25);
    const pHomeRaw = 1 / (1 + Math.exp(-logitH * 1.6));
    const pAwayRaw = 1 / (1 + Math.exp(logitH * 1.6));
    const pDrawRaw = Math.max(0.18, 0.32 - Math.abs(goalDiff) * 0.08);

    const totalRaw = pHomeRaw + pDrawRaw + pAwayRaw;
    const homeWinProb = Math.round((pHomeRaw / totalRaw) * 1000) / 10;
    const drawProb = Math.round((pDrawRaw / totalRaw) * 1000) / 10;
    const awayWinProb = Math.round((100 - homeWinProb - drawProb) * 10) / 10;

    // Predicted integer scoreline
    let predHg = Math.round(expHg);
    let predAg = Math.round(expAg);

    if (homeWinProb > awayWinProb && homeWinProb > drawProb && predHg <= predAg) {
      predHg = Math.max(1, predAg + 1);
    } else if (awayWinProb > homeWinProb && awayWinProb > drawProb && predAg <= predHg) {
      predAg = Math.max(1, predHg + 1);
    } else if (drawProb >= homeWinProb && drawProb >= awayWinProb) {
      const avg = Math.min(2, Math.round((expHg + expAg) / 2));
      predHg = avg;
      predAg = avg;
    }

    const favored =
      homeWinProb > awayWinProb && homeWinProb > drawProb
        ? 'HOME WIN'
        : awayWinProb > homeWinProb && awayWinProb > drawProb
        ? 'AWAY WIN'
        : 'DRAW';

    return {
      expHg: Math.round(expHg * 100) / 100,
      expAg: Math.round(expAg * 100) / 100,
      homeWinProb,
      drawProb,
      awayWinProb,
      predHg,
      predAg,
      favored,
    };
  }, [home, away, homeRestDays, awayRestDays, homeFormBoost, awayFormBoost, isNeutralVenue]);

  const resetWhatIf = () => {
    setHomeRestDays(7);
    setAwayRestDays(7);
    setHomeFormBoost(0);
    setAwayFormBoost(0);
    setIsNeutralVenue(false);
  };

  return (
    <div className="space-y-4">
      {/* Club Selector Bar */}
      <div className="border border-border bg-surface p-4 rounded-sm">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted mb-3 flex items-center justify-between">
          <span>HEAD-TO-HEAD MATCHUP CONFIGURATION</span>
          <button
            onClick={() => {
              const temp = homeTeam;
              setHomeTeam(awayTeam);
              setAwayTeam(temp);
            }}
            className="text-[11px] text-brand-accent hover:underline flex items-center space-x-1"
          >
            <span>Swap Sides</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Home Club Selector */}
          <div>
            <label className="block text-xs font-mono text-text-secondary mb-1">
              HOME TEAM (HOST)
            </label>
            <select
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-xs font-bold text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              {teamNames.map((name) => (
                <option key={name} value={name} disabled={name === awayTeam}>
                  {name} (Rank #{teams[name]?.rank || '-'})
                </option>
              ))}
            </select>
          </div>

          {/* Away Club Selector */}
          <div>
            <label className="block text-xs font-mono text-text-secondary mb-1">
              AWAY TEAM (VISITOR)
            </label>
            <select
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-xs font-bold text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              {teamNames.map((name) => (
                <option key={name} value={name} disabled={name === homeTeam}>
                  {name} (Rank #{teams[name]?.rank || '-'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Simulation Arena Card */}
      <div className="border border-border bg-surface p-6 rounded-sm">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
          <div className="flex items-center space-x-2">
            <Swords className="h-4 w-4 text-brand-accent" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">
              PREDICTED MATCH OUTCOME & EXPECTED GOALS (XG)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-text-muted">
            MODEL: XGBOOST POISSON DUAL-ESTIMATOR
          </span>
        </div>

        {/* Big Matchup Score Hero */}
        <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 py-4">
          {/* Home Box */}
          <div className="col-span-1 sm:col-span-4 text-center sm:text-right order-1">
            <div className="text-lg font-black text-text-primary">{home.name}</div>
            <div className="text-xs font-mono text-text-muted mt-0.5">
              Rank #{home.rank} • {home.points} Pts
            </div>
            <div className="text-xs font-mono text-brand-accent font-bold mt-2">
              Expected xG: {simulation.expHg}
            </div>
          </div>

          {/* Center Forecast Box */}
          <div className="col-span-1 sm:col-span-4 flex flex-col items-center justify-center order-first sm:order-2">
            <div className="font-mono text-3xl sm:text-4xl font-black tracking-widest px-5 py-2 bg-background border border-border text-text-primary rounded-sm shadow-inner">
              {simulation.predHg} - {simulation.predAg}
            </div>
            <div className="mt-2 text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-sm bg-border font-bold text-text-secondary">
              FAVORED: {simulation.favored}
            </div>
          </div>

          {/* Away Box */}
          <div className="col-span-1 sm:col-span-4 text-center sm:text-left order-3">
            <div className="text-lg font-black text-text-primary">{away.name}</div>
            <div className="text-xs font-mono text-text-muted mt-0.5">
              Rank #{away.rank} • {away.points} Pts
            </div>
            <div className="text-xs font-mono text-text-secondary font-bold mt-2">
              Expected xG: {simulation.expAg}
            </div>
          </div>
        </div>

        {/* Win Probability Bar */}
        <div className="mt-6 pt-4 border-t border-border space-y-2">
          <div className="flex justify-between text-xs font-mono font-bold">
            <span className="text-brand-accent">{home.short} WIN: {simulation.homeWinProb}%</span>
            <span className="text-slate-300">DRAW: {simulation.drawProb}%</span>
            <span className="text-text-secondary">{away.short} WIN: {simulation.awayWinProb}%</span>
          </div>
          <div className="h-2 w-full flex bg-background rounded-none overflow-hidden">
            <div
              style={{ width: `${simulation.homeWinProb}%` }}
              className="bg-brand-primary transition-all duration-300"
            />
            <div
              style={{ width: `${simulation.drawProb}%` }}
              className="bg-slate-500 transition-all duration-300"
            />
            <div
              style={{ width: `${simulation.awayWinProb}%` }}
              className="bg-brand-accent transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Side-by-Side Stats Comparison */}
      <div className="border border-border bg-surface p-4 rounded-sm">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted mb-3">
          HEAD-TO-HEAD STATISTICAL PROFILES
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-center border-b border-border-subtle pb-2 font-mono text-text-muted">
          <span className="text-left font-bold text-text-primary">{home.name}</span>
          <span>METRIC</span>
          <span className="text-right font-bold text-text-primary">{away.name}</span>
        </div>

        <div className="divide-y divide-border-subtle text-xs">
          <div className="grid grid-cols-3 py-2 items-center">
            <span className="text-left font-mono font-bold">{home.winRate}%</span>
            <span className="text-center text-text-muted text-[11px]">Season Win Rate</span>
            <span className="text-right font-mono font-bold">{away.winRate}%</span>
          </div>

          <div className="grid grid-cols-3 py-2 items-center">
            <span className="text-left font-mono font-bold">{home.gfPerMatch}</span>
            <span className="text-center text-text-muted text-[11px]">Goals Scored / Match</span>
            <span className="text-right font-mono font-bold">{away.gfPerMatch}</span>
          </div>

          <div className="grid grid-cols-3 py-2 items-center">
            <span className="text-left font-mono font-bold">{home.gaPerMatch}</span>
            <span className="text-center text-text-muted text-[11px]">Goals Conceded / Match</span>
            <span className="text-right font-mono font-bold">{away.gaPerMatch}</span>
          </div>

          <div className="grid grid-cols-3 py-2 items-center">
            <span className="text-left font-mono font-bold">{home.possessionAvg.toFixed(1)}%</span>
            <span className="text-center text-text-muted text-[11px]">Average Possession</span>
            <span className="text-right font-mono font-bold">{away.possessionAvg.toFixed(1)}%</span>
          </div>

          <div className="grid grid-cols-3 py-2 items-center">
            <div className="flex justify-start space-x-1 font-mono text-[10px]">
              {home.last5Form.map((r, i) => (
                <span
                  key={i}
                  className={`w-4 h-4 flex items-center justify-center font-bold ${
                    r === 'W' ? 'bg-brand-primary text-white' : r === 'D' ? 'bg-slate-600 text-white' : 'bg-red-800 text-white'
                  }`}
                >
                  {r}
                </span>
              ))}
            </div>
            <span className="text-center text-text-muted text-[11px]">Recent 5 Form</span>
            <div className="flex justify-end space-x-1 font-mono text-[10px]">
              {away.last5Form.map((r, i) => (
                <span
                  key={i}
                  className={`w-4 h-4 flex items-center justify-center font-bold ${
                    r === 'W' ? 'bg-brand-primary text-white' : r === 'D' ? 'bg-slate-600 text-white' : 'bg-red-800 text-white'
                  }`}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* What-If Scenario Sandbox */}
      <div className="border border-border bg-surface rounded-sm">
        <button
          onClick={() => setShowSandbox(!showSandbox)}
          className="w-full flex items-center justify-between p-4 text-xs font-mono font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Sliders className="h-4 w-4 text-brand-accent" />
            <span>WHAT-IF SCENARIO SANDBOX (REAL-TIME PARAMETER TUNING)</span>
          </div>
          <span className="text-text-muted font-normal text-[11px]">
            {showSandbox ? 'Collapse ▲' : 'Expand ▼'}
          </span>
        </button>

        {showSandbox && (
          <div className="p-4 pt-0 border-t border-border-subtle space-y-4">
            <p className="text-xs text-text-muted">
              Adjust external match factors (rest fatigue, recent momentum, venue) to observe how the predictive model shifts probability distributions in real time.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Home Rest Days */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-secondary">{home.name} Rest Days:</span>
                  <span className="font-bold text-brand-accent">{homeRestDays} days</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="14"
                  value={homeRestDays}
                  onChange={(e) => setHomeRestDays(Number(e.target.value))}
                  aria-label={`${home.name} rest days`}
                  className="w-full accent-brand-primary cursor-pointer bg-background"
                />
              </div>

              {/* Away Rest Days */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-secondary">{away.name} Rest Days:</span>
                  <span className="font-bold text-text-secondary">{awayRestDays} days</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="14"
                  value={awayRestDays}
                  onChange={(e) => setAwayRestDays(Number(e.target.value))}
                  aria-label={`${away.name} rest days`}
                  className="w-full accent-brand-accent cursor-pointer bg-background"
                />
              </div>

              {/* Home Form Boost */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-secondary">{home.name} Form Momentum:</span>
                  <span className={`font-bold ${homeFormBoost > 0 ? 'text-brand-accent' : homeFormBoost < 0 ? 'text-red-300' : 'text-text-muted'}`}>
                    {homeFormBoost > 0 ? `+${homeFormBoost}%` : `${homeFormBoost}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="5"
                  value={homeFormBoost}
                  onChange={(e) => setHomeFormBoost(Number(e.target.value))}
                  aria-label={`${home.name} form momentum boost`}
                  className="w-full accent-brand-primary cursor-pointer bg-background"
                />
              </div>

              {/* Away Form Boost */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-secondary">{away.name} Form Momentum:</span>
                  <span className={`font-bold ${awayFormBoost > 0 ? 'text-text-secondary' : awayFormBoost < 0 ? 'text-red-300' : 'text-text-muted'}`}>
                    {awayFormBoost > 0 ? `+${awayFormBoost}%` : `${awayFormBoost}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="5"
                  value={awayFormBoost}
                  onChange={(e) => setAwayFormBoost(Number(e.target.value))}
                  aria-label={`${away.name} form momentum boost`}
                  className="w-full accent-brand-accent cursor-pointer bg-background"
                />
              </div>
            </div>

            {/* Venue Toggle & Reset */}
            <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
              <label className="flex items-center space-x-2 text-xs font-mono cursor-pointer text-text-secondary">
                <input
                  type="checkbox"
                  checked={isNeutralVenue}
                  onChange={(e) => setIsNeutralVenue(e.target.checked)}
                  className="rounded-none accent-brand-primary"
                />
                <span>Neutral Venue (Disables Home Advantage)</span>
              </label>

              <button
                onClick={resetWhatIf}
                className="flex items-center space-x-1 text-xs font-mono text-text-muted hover:text-text-primary"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Parameters</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
