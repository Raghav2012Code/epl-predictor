import React, { useState, useMemo } from 'react';
import { TeamProfile } from '../types';
import { Sliders, RotateCcw, Swords, Shield, Zap, TrendingUp, Sparkles, ArrowRightLeft, Activity, Flame, Clock } from 'lucide-react';

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
  const [activePreset, setActivePreset] = useState<string>('baseline');

  const home = teams[homeTeam] || teams[teamNames[0]];
  const away = teams[awayTeam] || teams[teamNames[1]];

  // Heuristic what-if engine for instant sandbox play. This mirrors the
  // pipeline's Poisson intuition (attack/defense averages, venue + rest
  // factors) but is NOT the trained XGBoost/RF model — use CLI
  // `predict.py --match` for production probabilities.
  const simulation = useMemo(() => {
    // Base attacking & defensive ratings adjusted for momentum
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

    // Expected goals calculation via Poisson rate parameters
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
      homeAttack: Math.round(homeAttack * 100) / 100,
      homeDefense: Math.round(homeDefense * 100) / 100,
      awayAttack: Math.round(awayAttack * 100) / 100,
      awayDefense: Math.round(awayDefense * 100) / 100,
    };
  }, [home, away, homeRestDays, awayRestDays, homeFormBoost, awayFormBoost, isNeutralVenue]);

  // Tactical Scenario Presets
  const applyPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    switch (presetKey) {
      case 'baseline':
        setHomeRestDays(7);
        setAwayRestDays(7);
        setHomeFormBoost(0);
        setAwayFormBoost(0);
        setIsNeutralVenue(false);
        break;
      case 'congested':
        setHomeRestDays(3);
        setAwayRestDays(3);
        setHomeFormBoost(-10);
        setAwayFormBoost(-10);
        setIsNeutralVenue(false);
        break;
      case 'home_peak':
        setHomeRestDays(7);
        setAwayRestDays(4);
        setHomeFormBoost(35);
        setAwayFormBoost(-15);
        setIsNeutralVenue(false);
        break;
      case 'derby':
        setHomeRestDays(7);
        setAwayRestDays(7);
        setHomeFormBoost(20);
        setAwayFormBoost(20);
        setIsNeutralVenue(false);
        break;
      case 'underdog_surge':
        // Determine who has lower rank (higher rank number)
        if (home.rank > away.rank) {
          setHomeFormBoost(40);
          setAwayFormBoost(-20);
          setHomeRestDays(8);
          setAwayRestDays(3);
        } else {
          setAwayFormBoost(40);
          setHomeFormBoost(-20);
          setAwayRestDays(8);
          setHomeRestDays(3);
        }
        setIsNeutralVenue(false);
        break;
      case 'neutral_pitch':
        setHomeRestDays(7);
        setAwayRestDays(7);
        setHomeFormBoost(0);
        setAwayFormBoost(0);
        setIsNeutralVenue(true);
        break;
    }
  };

  const handleCustomParamChange = () => {
    setActivePreset('custom');
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Tactical Scenarios Strip */}
      <div className="border border-border bg-surface p-3.5 rounded-none">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-border pb-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-brand-accent/10 border border-brand-accent/30 text-brand-accent">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                <span>ANALYST WHAT-IF WAR ROOM</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-brand-accent/15 text-brand-accent border border-brand-accent/30 font-normal">
                  SIMULATION ENGINE V2.4
                </span>
              </h2>
              <p className="text-[11px] font-mono text-text-muted mt-0.5">
                Stress-test match outcome distributions against fixture congestion, momentum shocks, and venue parity. Heuristic sandbox — not the trained production model.
              </p>
            </div>
          </div>

          {/* Quick Swap & Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const temp = homeTeam;
                setHomeTeam(awayTeam);
                setAwayTeam(temp);
                handleCustomParamChange();
              }}
              className="px-2.5 py-1 text-[11px] font-mono font-bold text-text-secondary hover:text-brand-accent bg-surface-subtle border border-border hover:border-brand-accent/40 transition-colors flex items-center space-x-1.5"
            >
              <ArrowRightLeft className="h-3 w-3" />
              <span>SWAP SIDES</span>
            </button>
            <button
              onClick={() => applyPreset('baseline')}
              className="px-2.5 py-1 text-[11px] font-mono text-text-muted hover:text-text-primary bg-surface-subtle border border-border hover:border-border-subtle transition-colors flex items-center space-x-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>RESET</span>
            </button>
          </div>
        </div>

        {/* Tactical Scenario Presets Bar */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
            TACTICAL SCENARIO PRESETS:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 font-mono text-[11px]">
            {[
              { id: 'baseline', label: 'Standard Baseline', icon: Sparkles },
              { id: 'congested', label: 'Fatigue Congestion', icon: Clock },
              { id: 'home_peak', label: 'Host Rampage', icon: Flame },
              { id: 'derby', label: 'Derby Intensity', icon: Swords },
              { id: 'underdog_surge', label: 'Underdog Surge', icon: TrendingUp },
              { id: 'neutral_pitch', label: 'Neutral Pitch', icon: Shield },
            ].map((p) => {
              const Icon = p.icon;
              const isActive = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className={`px-2 py-1.5 border text-left flex items-center space-x-1.5 transition-all ${
                    isActive
                      ? 'bg-brand-accent/15 border-brand-accent text-brand-accent font-bold'
                      : 'bg-background/60 border-border text-text-secondary hover:border-text-muted hover:text-text-primary'
                  }`}
                >
                  <Icon className="h-3 w-3 shrink-0" />
                  <span className="truncate">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Simulation Stage & Matchup Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Matchup & Scoreline Hero (7 cols) */}
        <div className="lg:col-span-7 border border-border bg-surface p-4 flex flex-col justify-between rounded-none">
          {/* Club Dropdown Pickers */}
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-border">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1 flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-brand-accent"></span>
                <span>HOME TEAM (HOST)</span>
              </label>
              <select
                value={homeTeam}
                onChange={(e) => {
                  setHomeTeam(e.target.value);
                  handleCustomParamChange();
                }}
                aria-label="Select home team"
                className="w-full border border-border bg-background px-2.5 py-1.5 text-xs font-mono font-bold text-text-primary focus:border-brand-accent focus:outline-none"
              >
                {teamNames.map((name) => (
                  <option key={name} value={name} disabled={name === awayTeam}>
                    {name} (Rank #{teams[name]?.rank || '-'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1 flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-text-secondary"></span>
                <span>AWAY TEAM (VISITOR)</span>
              </label>
              <select
                value={awayTeam}
                onChange={(e) => {
                  setAwayTeam(e.target.value);
                  handleCustomParamChange();
                }}
                aria-label="Select away team"
                className="w-full border border-border bg-background px-2.5 py-1.5 text-xs font-mono font-bold text-text-primary focus:border-brand-accent focus:outline-none"
              >
                {teamNames.map((name) => (
                  <option key={name} value={name} disabled={name === homeTeam}>
                    {name} (Rank #{teams[name]?.rank || '-'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Big Matchup Score Hero */}
          <div className="grid grid-cols-12 items-center gap-3 py-6 my-auto">
            {/* Home Side */}
            <div className="col-span-4 text-center sm:text-right">
              <div className="text-base sm:text-lg font-bold text-text-primary truncate">{home.name}</div>
              <div className="text-[11px] font-mono text-text-muted mt-0.5">
                Rank #{home.rank} • {home.points} Pts
              </div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-brand-accent/10 border border-brand-accent/30 text-[11px] font-mono font-bold text-brand-accent">
                xG {simulation.expHg}
              </div>
            </div>

            {/* Center Predicted Score Box */}
            <div className="col-span-4 flex flex-col items-center justify-center">
              <div className="font-mono text-3xl sm:text-4xl font-bold tracking-tight px-4 py-2 bg-background border border-border text-text-primary shadow-inner">
                {simulation.predHg} - {simulation.predAg}
              </div>
              <div className="mt-2 text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 bg-surface-subtle border border-border-subtle font-bold text-text-secondary">
                FAVORED: {simulation.favored}
              </div>
            </div>

            {/* Away Side */}
            <div className="col-span-4 text-center sm:text-left">
              <div className="text-base sm:text-lg font-bold text-text-primary truncate">{away.name}</div>
              <div className="text-[11px] font-mono text-text-muted mt-0.5">
                Rank #{away.rank} • {away.points} Pts
              </div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-surface-subtle border border-border-subtle text-[11px] font-mono font-bold text-text-secondary">
                xG {simulation.expAg}
              </div>
            </div>
          </div>

          {/* Probability Segmented Distribution Bar */}
          <div className="pt-3 border-t border-border space-y-2">
            <div className="flex justify-between text-xs font-mono font-bold">
              <span className="text-brand-accent">{home.short} WIN: {simulation.homeWinProb}%</span>
              <span className="text-text-muted">DRAW: {simulation.drawProb}%</span>
              <span className="text-text-secondary">{away.short} WIN: {simulation.awayWinProb}%</span>
            </div>
            <div className="h-2 w-full flex bg-background rounded-none overflow-hidden border border-border-subtle">
              <div
                style={{ width: `${simulation.homeWinProb}%` }}
                className="bg-brand-accent transition-all duration-300"
              />
              <div
                style={{ width: `${simulation.drawProb}%` }}
                className="bg-slate-600 transition-all duration-300"
              />
              <div
                style={{ width: `${simulation.awayWinProb}%` }}
                className="bg-slate-400 transition-all duration-300"
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-text-muted">
              <span>Host Advantage: {isNeutralVenue ? 'DISABLED' : '+25% xG Bias'}</span>
              <span>Model Confidence: {Math.max(simulation.homeWinProb, simulation.awayWinProb, simulation.drawProb)}%</span>
            </div>
          </div>
        </div>

        {/* Comparative Head-to-Head Gauges (5 cols) */}
        <div className="lg:col-span-5 border border-border bg-surface p-4 flex flex-col justify-between rounded-none">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted mb-3 flex items-center justify-between border-b border-border pb-2">
            <span className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-brand-accent" />
              <span>COMPARATIVE RATINGS</span>
            </span>
            <span className="text-[10px] text-text-muted">{home.short} vs {away.short}</span>
          </div>

          {/* Metrics comparison bars */}
          <div className="space-y-3 font-mono text-xs">
            {/* Effective Attack */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-brand-accent font-bold">{simulation.homeAttack}</span>
                <span className="text-text-muted uppercase text-[10px]">Effective Attack (GF/M)</span>
                <span className="text-text-secondary font-bold">{simulation.awayAttack}</span>
              </div>
              <div className="h-1.5 w-full flex bg-background gap-0.5">
                <div
                  style={{ width: `${Math.min(100, (simulation.homeAttack / 3.5) * 100)}%` }}
                  className="bg-brand-accent h-full"
                />
                <div className="flex-1 bg-border-subtle" />
                <div
                  style={{ width: `${Math.min(100, (simulation.awayAttack / 3.5) * 100)}%` }}
                  className="bg-text-secondary h-full"
                />
              </div>
            </div>

            {/* Effective Defense */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-brand-accent font-bold">{simulation.homeDefense}</span>
                <span className="text-text-muted uppercase text-[10px]">Effective Defense (GA/M)</span>
                <span className="text-text-secondary font-bold">{simulation.awayDefense}</span>
              </div>
              <div className="h-1.5 w-full flex bg-background gap-0.5">
                <div
                  style={{ width: `${Math.min(100, (simulation.homeDefense / 3.0) * 100)}%` }}
                  className="bg-brand-accent/70 h-full"
                />
                <div className="flex-1 bg-border-subtle" />
                <div
                  style={{ width: `${Math.min(100, (simulation.awayDefense / 3.0) * 100)}%` }}
                  className="bg-text-secondary/70 h-full"
                />
              </div>
            </div>

            {/* Season Win Rate */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-brand-accent font-bold">{home.winRate}%</span>
                <span className="text-text-muted uppercase text-[10px]">Season Win Rate</span>
                <span className="text-text-secondary font-bold">{away.winRate}%</span>
              </div>
              <div className="h-1.5 w-full flex bg-background gap-0.5">
                <div style={{ width: `${home.winRate}%` }} className="bg-brand-accent h-full" />
                <div className="flex-1 bg-border-subtle" />
                <div style={{ width: `${away.winRate}%` }} className="bg-text-secondary h-full" />
              </div>
            </div>

            {/* Average Possession */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-brand-accent font-bold">{home.possessionAvg.toFixed(1)}%</span>
                <span className="text-text-muted uppercase text-[10px]">Average Possession</span>
                <span className="text-text-secondary font-bold">{away.possessionAvg.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 w-full flex bg-background gap-0.5">
                <div style={{ width: `${home.possessionAvg}%` }} className="bg-brand-accent/80 h-full" />
                <div className="flex-1 bg-border-subtle" />
                <div style={{ width: `${away.possessionAvg}%` }} className="bg-text-secondary/80 h-full" />
              </div>
            </div>

            {/* Last 5 Form Translucent Pills */}
            <div className="pt-2 border-t border-border-subtle">
              <div className="flex justify-between items-center text-[11px]">
                <div className="flex items-center space-x-1">
                  {home.last5Form.map((r, i) => (
                    <span
                      key={i}
                      className={`w-5 h-4 flex items-center justify-center text-[10px] font-bold border ${
                        r === 'W'
                          ? 'bg-white text-black border-white'
                          : r === 'D'
                          ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                      }`}
                    >
                      {r}
                    </span>
                  ))}
                </div>
                <span className="text-text-muted uppercase text-[10px]">Recent Form</span>
                <div className="flex items-center space-x-1">
                  {away.last5Form.map((r, i) => (
                    <span
                      key={i}
                      className={`w-5 h-4 flex items-center justify-center text-[10px] font-bold border ${
                        r === 'W'
                          ? 'bg-white text-black border-white'
                          : r === 'D'
                          ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                      }`}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Parameter Tuning Sandbox */}
      <div className="border border-border bg-surface p-4 rounded-none space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <div className="flex items-center space-x-2">
            <Sliders className="h-4 w-4 text-brand-accent" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
              WHAT-IF TELEMETRY PARAMETERS (VARIABLE SLIDERS)
            </span>
          </div>
          <span className="text-[11px] font-mono text-text-muted">
            LIVE RECALCULATION ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Home Team Parameters */}
          <div className="p-3 bg-surface-subtle border border-border-subtle space-y-3">
            <div className="text-xs font-mono font-bold text-brand-accent border-b border-border-subtle pb-1 flex justify-between">
              <span>{home.name} (HOST VARIABLES)</span>
              <span className="text-[10px] text-text-muted">STADIUM FACTOR</span>
            </div>

            {/* Home Rest Days */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-text-secondary">Rest Interval:</span>
                <span className={`font-bold ${homeRestDays < 4 ? 'text-zinc-400' : 'text-brand-accent'}`}>
                  {homeRestDays} Days {homeRestDays < 4 && '(Fatigue -12%)'}
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="14"
                value={homeRestDays}
                onChange={(e) => {
                  setHomeRestDays(Number(e.target.value));
                  handleCustomParamChange();
                }}
                aria-label={`${home.name} rest days`}
                className="w-full accent-brand-accent cursor-pointer bg-background"
              />
            </div>

            {/* Home Form Boost */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-text-secondary">Tactical Momentum Shift:</span>
                <span
                  className={`font-bold ${
                    homeFormBoost > 0 ? 'text-brand-accent' : homeFormBoost < 0 ? 'text-zinc-400' : 'text-text-muted'
                  }`}
                >
                  {homeFormBoost > 0 ? `+${homeFormBoost}%` : `${homeFormBoost}%`}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="5"
                value={homeFormBoost}
                onChange={(e) => {
                  setHomeFormBoost(Number(e.target.value));
                  handleCustomParamChange();
                }}
                aria-label={`${home.name} form momentum boost`}
                className="w-full accent-brand-accent cursor-pointer bg-background"
              />
            </div>
          </div>

          {/* Away Team Parameters */}
          <div className="p-3 bg-surface-subtle border border-border-subtle space-y-3">
            <div className="text-xs font-mono font-bold text-text-secondary border-b border-border-subtle pb-1 flex justify-between">
              <span>{away.name} (VISITOR VARIABLES)</span>
              <span className="text-[10px] text-text-muted">TRAVEL FACTOR</span>
            </div>

            {/* Away Rest Days */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-text-secondary">Rest Interval:</span>
                <span className={`font-bold ${awayRestDays < 4 ? 'text-zinc-400' : 'text-text-secondary'}`}>
                  {awayRestDays} Days {awayRestDays < 4 && '(Fatigue -12%)'}
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="14"
                value={awayRestDays}
                onChange={(e) => {
                  setAwayRestDays(Number(e.target.value));
                  handleCustomParamChange();
                }}
                aria-label={`${away.name} rest days`}
                className="w-full accent-text-secondary cursor-pointer bg-background"
              />
            </div>

            {/* Away Form Boost */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-text-secondary">Tactical Momentum Shift:</span>
                <span
                  className={`font-bold ${
                    awayFormBoost > 0 ? 'text-text-secondary' : awayFormBoost < 0 ? 'text-zinc-400' : 'text-text-muted'
                  }`}
                >
                  {awayFormBoost > 0 ? `+${awayFormBoost}%` : `${awayFormBoost}%`}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="5"
                value={awayFormBoost}
                onChange={(e) => {
                  setAwayFormBoost(Number(e.target.value));
                  handleCustomParamChange();
                }}
                aria-label={`${away.name} form momentum boost`}
                className="w-full accent-text-secondary cursor-pointer bg-background"
              />
            </div>
          </div>
        </div>

        {/* Venue Toggle & Parity Options */}
        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
          <label className="flex items-center space-x-2 text-xs font-mono cursor-pointer text-text-secondary hover:text-text-primary">
            <input
              type="checkbox"
              checked={isNeutralVenue}
              onChange={(e) => {
                setIsNeutralVenue(e.target.checked);
                handleCustomParamChange();
              }}
              className="rounded-none accent-brand-accent h-3.5 w-3.5"
            />
            <span>NEUTRAL VENUE PROTOCOL (DISRUPTS HOME CROWD ADVANTAGE)</span>
          </label>

          <span className="text-[11px] font-mono text-text-muted hidden sm:inline-block">
            HEURISTIC POISSON SANDBOX — PRODUCTION: CLI predict.py --match
          </span>
        </div>
      </div>
    </div>
  );
};
