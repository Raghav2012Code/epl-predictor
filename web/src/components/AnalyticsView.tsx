import React, { useMemo, useState } from 'react';
import {
  EPLDataset,
  DiagnosticImage,
  LeagueAnalytics,
  StandingsRow,
} from '../types';
import {
  Cpu,
  BarChart2,
  ShieldCheck,
  CheckCircle2,
  Maximize2,
  X,
  PieChart as PieIcon,
  TrendingUp,
  Crosshair,
} from 'lucide-react';

interface AnalyticsViewProps {
  benchmark: EPLDataset['benchmark'];
  analytics: LeagueAnalytics;
  standings: StandingsRow[];
  totalMatches: number;
}

/** Resolves a relative public-asset path against the Vite base (works in dev and dist). */
export const resolveAssetSrc = (src: string): string => {
  if (/^(https?:|data:|blob:)/.test(src) || src.startsWith('/')) return src;
  const base = import.meta.env.BASE_URL ?? './';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}${src.replace(/^\.\//, '')}`;
};

const DONUT_SEGMENTS = [
  { key: 'home', label: 'Home Win', color: '#6d0202' },
  { key: 'draw', label: 'Draw', color: '#767e70' },
  { key: 'away', label: 'Away Win', color: '#cbd1c4' },
] as const;

const OutcomeDonut: React.FC<{ dist: LeagueAnalytics['outcomeDistribution']; total: number }> = ({
  dist,
  total,
}) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const values = [dist.homePct, dist.drawPct, dist.awayPct];
  let acc = 0;
  const segs = DONUT_SEGMENTS.map((s, i) => {
    const frac = Math.max(0, values[i] / 100);
    const dash = frac * circumference;
    const gap = circumference - dash;
    const offset = -acc * circumference;
    acc += frac;
    return { ...s, dash, gap, offset, pct: values[i], count: [dist.home, dist.draw, dist.away][i] };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <svg viewBox="0 0 140 140" className="h-44 w-44 flex-shrink-0" role="img" aria-label="Forecast outcome distribution">
        <title>Home {dist.homePct}% / Draw {dist.drawPct}% / Away {dist.awayPct}%</title>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#290000" strokeWidth="18" />
        {segs.map((s) => (
          <circle
            key={s.key}
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth="18"
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={s.offset}
            transform="rotate(-90 70 70)"
            strokeLinecap="butt"
          >
            <title>{`${s.label}: ${s.count} (${s.pct}%)`}</title>
          </circle>
        ))}
        <text x="70" y="66" textAnchor="middle" className="fill-text-primary" fontSize="18" fontWeight="800" fontFamily="monospace">
          {total}
        </text>
        <text x="70" y="82" textAnchor="middle" className="fill-text-muted" fontSize="9" fontFamily="monospace">
          FIXTURES
        </text>
      </svg>
      <div className="w-full space-y-2 text-xs">
        {segs.map((s) => (
          <div key={s.key} className="flex items-center justify-between border border-border-subtle bg-background px-2.5 py-2 rounded-sm">
            <span className="flex items-center space-x-2 text-text-secondary">
              <span className="h-2.5 w-2.5 flex-shrink-0 ring-1 ring-white/15" style={{ backgroundColor: s.color }} />
              <span className="font-mono font-bold">{s.label}</span>
            </span>
            <span className="font-mono text-text-primary font-bold">
              {s.count} <span className="text-text-muted font-normal">({s.pct}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const GoalsTrendChart: React.FC<{ data: LeagueAnalytics['goalsPerGameweek']; avg: number }> = ({
  data,
  avg,
}) => {
  const maxGoals = Math.max(...data.map((d) => d.goals), 1);
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[620px] bg-background border border-border-subtle rounded-sm p-2.5">
        <svg viewBox={`0 0 ${data.length * 18 + 40} 190`} className="w-full h-48" role="img" aria-label="Predicted goals per gameweek">
          <title>Predicted goals per gameweek (stacked home / away)</title>
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1="30"
              x2={data.length * 18 + 30}
              y1={170 - f * 140}
              y2={170 - f * 140}
              stroke="#480202"
              strokeWidth="1"
            />
          ))}
          {data.map((d, i) => {
            const h = (d.goals / maxGoals) * 140;
            const homeH = (d.homeGoals / Math.max(1, d.goals)) * h;
            const awayH = h - homeH;
            const x = 34 + i * 18;
            const y = 170 - h;
            return (
              <g key={d.gw}>
                <title>{`GW${d.gw}: ${d.goals} goals (H ${d.homeGoals} / A ${d.awayGoals}, avg ${d.avgPerMatch}/match)`}</title>
                <rect x={x} y={y + homeH} width="12" height={Math.max(0, awayH)} fill="#767e70" opacity="0.85" />
                <rect x={x} y={y} width="12" height={Math.max(0, homeH)} fill="#6d0202" opacity="0.9" />
                {(d.gw === 1 || d.gw % 5 === 0 || d.gw === 38) && (
                  <text x={x + 6} y="182" textAnchor="middle" fontSize="8" fill="#a4aca0" fontFamily="monospace">
                    {d.gw}
                  </text>
                )}
              </g>
            );
          })}
          <text x="4" y="36" fontSize="8" fill="#a4aca0" fontFamily="monospace">{maxGoals}</text>
          <text x="4" y="172" fontSize="8" fill="#a4aca0" fontFamily="monospace">0</text>
        </svg>
        <div className="flex items-center justify-between text-[11px] font-mono text-text-muted px-1">
          <span className="flex items-center space-x-3">
            <span className="flex items-center"><span className="h-2 w-2 bg-brand-primary mr-1" />Home goals</span>
            <span className="flex items-center"><span className="h-2 w-2 bg-brand-accent mr-1" />Away goals</span>
          </span>
          <span>Season avg: <span className="text-text-primary font-bold">{avg}/match</span></span>
        </div>
      </div>
    </div>
  );
};

const AttackDefenseChart: React.FC<{ standings: StandingsRow[] }> = ({ standings }) => {
  const top = useMemo(() => [...standings].sort((a, b) => b.gf - a.gf).slice(0, 6), [standings]);
  const max = Math.max(...top.map((t) => Math.max(t.gf, t.ga)), 1);
  return (
    <div className="space-y-2.5">
      {top.map((t) => (
        <div key={t.team} className="text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center space-x-2 font-bold text-text-primary truncate">
              <span className="h-3 w-1 flex-shrink-0 ring-1 ring-white/15" style={{ backgroundColor: t.color }} />
              <span className="truncate">{t.team}</span>
            </span>
            <span className="font-mono text-text-muted flex-shrink-0 ml-2">
              <span className="text-brand-accent font-bold">{t.gf} GF</span>
              {' / '}
              <span className="text-text-secondary font-bold">{t.ga} GA</span>
            </span>
          </div>
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-background rounded-none overflow-hidden">
              <div className="h-full bg-brand-primary transition-all" style={{ width: `${(t.gf / max) * 100}%` }} title={`${t.team} goals for: ${t.gf}`} />
            </div>
            <div className="h-1.5 w-full bg-background rounded-none overflow-hidden">
              <div className="h-full bg-slate-500 transition-all" style={{ width: `${(t.ga / max) * 100}%` }} title={`${t.team} goals against: ${t.ga}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  benchmark,
  analytics,
  standings,
  totalMatches,
}) => {
  const [selectedImage, setSelectedImage] = useState<DiagnosticImage | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<string>(benchmark.diagnostics[0]?.id || '');

  const currentChart = benchmark.diagnostics.find((d) => d.id === activeChartTab) || benchmark.diagnostics[0];
  const productionName = benchmark.productionModel;

  return (
    <div className="space-y-4">
      {/* Top Architecture & Model Card Banner */}
      <div className="border border-border bg-surface p-4 rounded-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
              PREDICTIVE ENGINE INTELLIGENCE & BENCHMARK
            </div>
            <h2 className="text-sm font-bold text-text-primary mt-0.5">
              Dual-Model Estimator: Multiclass Softprob Classifier + Poisson Goal Regressors
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-1 text-xs font-mono font-bold bg-brand-primary text-white border border-brand-primary rounded-sm">
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-brand-accent" />
              PRODUCTION: {productionName.toUpperCase()} (SELECTED)
            </span>
          </div>
        </div>

        <p className="mt-3 text-xs text-text-secondary leading-relaxed">
          The pipeline benchmarks Random Forest and XGBoost across 2,280 historical Premier League matches using strict time-series cross-validation (pre-2024 train, 2024–2026 validation). All features are calculated using historical chronological shift (<code className="font-mono text-brand-accent">shift(1)</code>) to guarantee zero future data leakage.
        </p>
      </div>

      {/* Benchmark Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {benchmark.models.map((m) => (
          <div
            key={m.name}
            className={`border p-4 rounded-sm bg-surface ${
              m.isProduction
                ? 'border-brand-primary ring-1 ring-brand-primary/40'
                : 'border-border'
            }`}
          >
            <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
              <div className="flex items-center space-x-2">
                <Cpu className={`h-4 w-4 ${m.isProduction ? 'text-brand-accent' : 'text-text-muted'}`} />
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  {m.name}
                </span>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm ${
                  m.isProduction
                    ? 'bg-brand-primary text-white border border-brand-primary'
                    : 'bg-surface-subtle text-text-muted border border-border'
                }`}
              >
                {m.isProduction ? 'SELECTED PRODUCTION' : 'BASELINE BENCHMARK'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="border border-border-subtle bg-background p-2 rounded-sm">
                <div className="text-[10px] font-mono text-text-muted">CLASSIFICATION ACC</div>
                <div className="text-base font-mono font-black text-text-primary mt-0.5">
                  {m.accuracy}%
                </div>
              </div>

              <div className="border border-border-subtle bg-background p-2 rounded-sm">
                <div className="text-[10px] font-mono text-text-muted">GOAL MAE (AVG)</div>
                <div className="text-base font-mono font-black text-brand-accent mt-0.5">
                  {m.avgGoalMae}
                </div>
              </div>

              <div className="border border-border-subtle bg-background p-2 rounded-sm">
                <div className="text-[10px] font-mono text-text-muted">LOG LOSS</div>
                <div className="text-base font-mono font-black text-text-primary mt-0.5">
                  {m.logLoss}
                </div>
              </div>

              <div className="border border-border-subtle bg-background p-2 rounded-sm">
                <div className="text-[10px] font-mono text-text-muted">MACRO F1 SCORE</div>
                <div className="text-base font-mono font-black text-text-secondary mt-0.5">
                  {m.macroF1}
                </div>
              </div>

              <div className="border border-border-subtle bg-background p-2 rounded-sm">
                <div className="text-[10px] font-mono text-text-muted">HOME GOAL MAE</div>
                <div className="text-base font-mono font-black text-text-secondary mt-0.5">
                  {m.homeGoalMae}
                </div>
              </div>

              <div className="border border-border-subtle bg-background p-2 rounded-sm">
                <div className="text-[10px] font-mono text-text-muted">WITHIN 1 GOAL ACC</div>
                <div className="text-base font-mono font-black text-brand-accent mt-0.5">
                  {m.within1Goal}%
                </div>
              </div>
            </div>
            {typeof m.exactScoreAcc === 'number' && (
              <div className="mt-2 text-[11px] font-mono text-text-muted">
                Exact scoreline accuracy: <span className="text-text-secondary font-bold">{m.exactScoreAcc}%</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* League Forecast Charts (live, from exported fixtures) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="border border-border bg-surface p-4 rounded-sm lg:col-span-2">
          <div className="flex items-center space-x-2 border-b border-border pb-3 mb-3">
            <PieIcon className="h-4 w-4 text-brand-accent" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              FORECAST OUTCOME SPLIT (380 FIXTURES)
            </h3>
          </div>
          <OutcomeDonut dist={analytics.outcomeDistribution} total={totalMatches} />
          <p className="mt-3 text-[11px] font-mono text-text-muted">
            {analytics.totalGoals} predicted goals @ {analytics.avgGoalsPerMatch}/match. Home edge holds but draws are elevated by the Poisson solver.
          </p>
        </div>

        <div className="border border-border bg-surface p-4 rounded-sm lg:col-span-3">
          <div className="flex items-center space-x-2 border-b border-border pb-3 mb-3">
            <TrendingUp className="h-4 w-4 text-brand-accent" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              PREDICTED GOALS PER GAMEWEEK
            </h3>
          </div>
          <GoalsTrendChart data={analytics.goalsPerGameweek} avg={analytics.avgGoalsPerMatch} />
        </div>
      </div>

      <div className="border border-border bg-surface p-4 rounded-sm">
        <div className="flex items-center space-x-2 border-b border-border pb-3 mb-3">
          <Crosshair className="h-4 w-4 text-brand-accent" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
            TOP 6 ATTACK VS DEFENCE (PROJECTED TOTALS)
          </h3>
        </div>
        <AttackDefenseChart standings={standings} />
      </div>

      {/* Diagnostic Chart Visualizer Gallery */}
      <div className="border border-border bg-surface p-4 rounded-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 mb-4 gap-2">
          <div className="flex items-center space-x-2">
            <BarChart2 className="h-4 w-4 text-brand-accent" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              MATPLOTLIB DIAGNOSTIC VISUALIZATION GALLERY
            </h3>
          </div>

          {/* Chart Tabs */}
          <div className="flex items-center space-x-1 font-mono text-xs overflow-x-auto">
            {benchmark.diagnostics.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveChartTab(d.id)}
                className={`px-2.5 py-1 rounded-sm transition-colors whitespace-nowrap ${
                  activeChartTab === d.id
                    ? 'bg-brand-primary text-white font-bold border border-brand-primary'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-hover'
                }`}
              >
                {d.title}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Display Area */}
        {currentChart && (
          <div className="space-y-3">
            <div className="relative group border border-border bg-background p-2 rounded-sm overflow-hidden flex items-center justify-center">
              <img
                src={resolveAssetSrc(currentChart.src)}
                alt={currentChart.title}
                className="max-h-[460px] w-auto object-contain rounded-none"
                loading="lazy"
              />
              <button
                onClick={() => setSelectedImage(currentChart)}
                className="absolute right-4 top-4 flex items-center space-x-1 border border-border bg-surface/90 px-2.5 py-1 text-xs font-mono text-text-primary rounded-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity backdrop-blur-sm shadow-md"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Full Preview</span>
              </button>
            </div>
            <div className="text-xs text-text-muted font-mono flex items-center justify-between gap-2 flex-wrap">
              <span>{currentChart.caption}</span>
              <span className="text-[10px] text-text-muted">Source: {currentChart.src}</span>
            </div>
          </div>
        )}
      </div>

      {/* Top Predictive Feature Signals */}
      <div className="border border-border bg-surface p-4 rounded-sm">
        <div className="flex items-center space-x-2 border-b border-border pb-3 mb-3">
          <ShieldCheck className="h-4 w-4 text-brand-accent" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
            TOP PREDICTIVE FEATURE WEIGHTS ({productionName.toUpperCase()} FEATURE IMPORTANCE)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {benchmark.topFeatures.map((f, i) => (
            <div
              key={f.name}
              className="border border-border-subtle bg-background p-2.5 rounded-sm flex items-start justify-between space-x-2"
            >
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono text-[10px] text-text-muted">#{i + 1}</span>
                  <span className="font-mono text-xs font-bold text-text-primary truncate">
                    {f.name}
                  </span>
                </div>
                <div className="text-[11px] text-text-muted mt-0.5">{f.desc}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="inline-block font-mono text-xs font-bold text-brand-accent">
                  {(f.importance * 100).toFixed(1)}%
                </span>
                <div className="text-[9px] font-mono text-text-muted uppercase">{f.category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for full screen image preview */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl w-full border border-border bg-surface p-4 rounded-sm space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-xs font-bold uppercase font-mono text-text-primary">
                {selectedImage.title}
              </span>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1 text-text-muted hover:text-text-primary rounded-sm"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <img
              src={resolveAssetSrc(selectedImage.src)}
              alt={selectedImage.title}
              className="w-full h-auto max-h-[75vh] object-contain rounded-none bg-background border border-border"
            />
            <p className="text-xs text-text-muted font-mono">{selectedImage.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
};
