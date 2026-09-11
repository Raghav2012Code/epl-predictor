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
  { key: 'home', label: 'Home Win', color: '#ffffff' },
  { key: 'draw', label: 'Draw', color: '#71717a' },
  { key: 'away', label: 'Away Win', color: '#a1a1aa' },
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
      <svg viewBox="0 0 140 140" className="h-40 w-40 flex-shrink-0" role="img" aria-label="Forecast outcome distribution">
        <title>Home {dist.homePct}% / Draw {dist.drawPct}% / Away {dist.awayPct}%</title>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#1a1f2c" strokeWidth="18" />
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
      <div className="w-full space-y-1.5 text-xs font-mono">
        {segs.map((s) => (
          <div key={s.key} className="flex items-center justify-between border border-border-subtle bg-background px-2.5 py-1.5 rounded-none">
            <span className="flex items-center space-x-2 text-text-secondary">
              <span className="h-2 w-2 flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="font-bold">{s.label}</span>
            </span>
            <span className="text-text-primary font-bold">
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
      <div className="min-w-[620px] bg-background border border-border-subtle rounded-none p-2.5">
        <svg viewBox={`0 0 ${data.length * 18 + 40} 190`} className="w-full h-44" role="img" aria-label="Predicted goals per gameweek">
          <title>Predicted goals per gameweek (stacked home / away)</title>
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1="30"
              x2={data.length * 18 + 30}
              y1={170 - f * 140}
              y2={170 - f * 140}
              stroke="#1a1f2c"
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
                <rect x={x} y={y + homeH} width="12" height={Math.max(0, awayH)} fill="#52525b" opacity="0.85" />
                <rect x={x} y={y} width="12" height={Math.max(0, homeH)} fill="#ffffff" opacity="0.9" />
                {(d.gw === 1 || d.gw % 5 === 0 || d.gw === 38) && (
                  <text x={x + 6} y="182" textAnchor="middle" fontSize="8" fill="#818e9f" fontFamily="monospace">
                    {d.gw}
                  </text>
                )}
              </g>
            );
          })}
          <text x="4" y="36" fontSize="8" fill="#818e9f" fontFamily="monospace">{maxGoals}</text>
          <text x="4" y="172" fontSize="8" fill="#818e9f" fontFamily="monospace">0</text>
        </svg>
        <div className="flex items-center justify-between text-[11px] font-mono text-text-muted px-1 mt-1">
          <span className="flex items-center space-x-3">
            <span className="flex items-center"><span className="h-2 w-2 bg-brand-accent mr-1.5" />Home goals</span>
            <span className="flex items-center"><span className="h-2 w-2 bg-slate-500 mr-1.5" />Away goals</span>
          </span>
          <span>Season Avg: <span className="text-text-primary font-bold">{avg}/match</span></span>
        </div>
      </div>
    </div>
  );
};

const AttackDefenseChart: React.FC<{ standings: StandingsRow[] }> = ({ standings }) => {
  const top = useMemo(() => [...standings].sort((a, b) => b.gf - a.gf).slice(0, 6), [standings]);
  const max = Math.max(...top.map((t) => Math.max(t.gf, t.ga)), 1);
  return (
    <div className="space-y-2.5 font-mono">
      {top.map((t) => (
        <div key={t.team} className="text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center space-x-2 font-bold text-text-primary truncate font-sans">
              <span className="h-3 w-1 flex-shrink-0" style={{ backgroundColor: t.color }} />
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
              <div className="h-full bg-brand-accent transition-all" style={{ width: `${(t.gf / max) * 100}%` }} title={`${t.team} goals for: ${t.gf}`} />
            </div>
            <div className="h-1.5 w-full bg-background rounded-none overflow-hidden">
              <div className="h-full bg-slate-600 transition-all" style={{ width: `${(t.ga / max) * 100}%` }} title={`${t.team} goals against: ${t.ga}`} />
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
      <div className="border border-border bg-surface p-4 rounded-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
              PREDICTIVE ENGINE INTELLIGENCE & BENCHMARK
            </div>
            <h2 className="text-sm font-bold text-text-primary mt-0.5 font-mono">
              Dual-Model Estimator: Multiclass Softprob Classifier + Poisson Goal Regressors
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-1 text-xs font-mono font-bold bg-brand-accent/15 text-brand-accent border border-brand-accent/40 rounded-none">
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-brand-accent" />
              PRODUCTION: {productionName.toUpperCase()} (SELECTED)
            </span>
          </div>
        </div>

        <p className="mt-3 text-xs text-text-secondary leading-relaxed font-mono">
          The pipeline benchmarks Random Forest and XGBoost using strict time-series cross-validation (pre-2024 train, 2024–2026 validation) over {totalMatches} season fixtures. All features are calculated using historical chronological shift (<code className="font-mono text-brand-accent">shift(1)</code>) with fixed league priors for cold starts to guarantee zero future data leakage.
        </p>
      </div>

      {/* Benchmark Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {benchmark.models.map((m) => (
          <div
            key={m.name}
            className={`border p-4 rounded-none bg-surface ${
              m.isProduction
                ? 'border-brand-accent ring-1 ring-brand-accent/30'
                : 'border-border'
            }`}
          >
            <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
              <div className="flex items-center space-x-2">
                <Cpu className={`h-4 w-4 ${m.isProduction ? 'text-brand-accent' : 'text-text-muted'}`} />
                <span className="text-xs font-mono font-bold text-text-primary uppercase tracking-wider">
                  {m.name}
                </span>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-none ${
                  m.isProduction
                    ? 'bg-brand-accent/15 text-brand-accent border border-brand-accent/40'
                    : 'bg-surface-subtle text-text-muted border border-border'
                }`}
              >
                {m.isProduction ? 'SELECTED PRODUCTION' : 'BASELINE BENCHMARK'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <div className="border border-border-subtle bg-background p-2 rounded-none">
                <div className="text-[10px] text-text-muted">CLASSIFICATION ACC</div>
                <div className="text-sm font-bold text-text-primary mt-0.5">
                  {m.accuracy}%
                </div>
              </div>

              <div className="border border-border-subtle bg-background p-2 rounded-none">
                <div className="text-[10px] text-text-muted">GOAL MAE (AVG)</div>
                <div className="text-sm font-bold text-brand-accent mt-0.5">
                  {m.avgGoalMae}
                </div>
              </div>

              <div className="border border-border-subtle bg-background p-2 rounded-none">
                <div className="text-[10px] text-text-muted">LOG LOSS</div>
                <div className="text-sm font-bold text-text-primary mt-0.5">
                  {m.logLoss}
                </div>
              </div>

              <div className="border border-border-subtle bg-background p-2 rounded-none">
                <div className="text-[10px] text-text-muted">MACRO F1 SCORE</div>
                <div className="text-sm font-bold text-text-secondary mt-0.5">
                  {m.macroF1}
                </div>
              </div>

              <div className="border border-border-subtle bg-background p-2 rounded-none">
                <div className="text-[10px] text-text-muted">HOME GOAL MAE</div>
                <div className="text-sm font-bold text-text-secondary mt-0.5">
                  {m.homeGoalMae}
                </div>
              </div>

              <div className="border border-border-subtle bg-background p-2 rounded-none">
                <div className="text-[10px] text-text-muted">WITHIN 1 GOAL ACC</div>
                <div className="text-sm font-bold text-brand-accent mt-0.5">
                  {m.within1Goal}%
                </div>
              </div>
            </div>
            {typeof m.exactScoreAcc === 'number' && (
              <div className="mt-2.5 text-[11px] font-mono text-text-muted">
                Exact scoreline accuracy: <span className="text-text-secondary font-bold">{m.exactScoreAcc}%</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* League Forecast Charts (live, from exported fixtures) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="border border-border bg-surface p-4 rounded-none lg:col-span-2">
          <div className="flex items-center space-x-2 border-b border-border pb-3 mb-3">
            <PieIcon className="h-4 w-4 text-brand-accent" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
              FORECAST OUTCOME SPLIT ({totalMatches} FIXTURES)
            </h3>
          </div>
          <OutcomeDonut dist={analytics.outcomeDistribution} total={totalMatches} />
          <p className="mt-3 text-[11px] font-mono text-text-muted">
            {analytics.totalGoals} predicted goals @ {analytics.avgGoalsPerMatch}/match. Home edge holds but draws are elevated by the Poisson solver.
          </p>
        </div>

        <div className="border border-border bg-surface p-4 rounded-none lg:col-span-3">
          <div className="flex items-center space-x-2 border-b border-border pb-3 mb-3">
            <TrendingUp className="h-4 w-4 text-brand-accent" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
              PREDICTED GOALS PER GAMEWEEK
            </h3>
          </div>
          <GoalsTrendChart data={analytics.goalsPerGameweek} avg={analytics.avgGoalsPerMatch} />
        </div>
      </div>

      <div className="border border-border bg-surface p-4 rounded-none">
        <div className="flex items-center space-x-2 border-b border-border pb-3 mb-3">
          <Crosshair className="h-4 w-4 text-brand-accent" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
            TOP 6 ATTACK VS DEFENCE (PROJECTED TOTALS)
          </h3>
        </div>
        <AttackDefenseChart standings={standings} />
      </div>

      {/* Diagnostic Chart Visualizer Gallery */}
      <div className="border border-border bg-surface p-4 rounded-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 mb-4 gap-2">
          <div className="flex items-center space-x-2">
            <BarChart2 className="h-4 w-4 text-brand-accent" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
              MATPLOTLIB DIAGNOSTIC VISUALIZATION GALLERY
            </h3>
          </div>

          {/* Chart Tabs */}
          <div className="flex items-center space-x-1 font-mono text-xs overflow-x-auto">
            {benchmark.diagnostics.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveChartTab(d.id)}
                className={`px-2.5 py-1 rounded-none transition-colors whitespace-nowrap border ${
                  activeChartTab === d.id
                    ? 'bg-brand-accent/15 text-brand-accent font-bold border-brand-accent/40'
                    : 'bg-surface-subtle border-border-subtle text-text-muted hover:text-text-primary hover:border-border'
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
            <div className="relative group border border-border bg-background p-2 rounded-none overflow-hidden flex items-center justify-center">
              <img
                src={resolveAssetSrc(currentChart.src)}
                alt={currentChart.title}
                className="max-h-[460px] w-auto object-contain rounded-none"
                loading="lazy"
              />
              <button
                onClick={() => setSelectedImage(currentChart)}
                className="absolute right-4 top-4 flex items-center space-x-1 border border-border bg-surface px-2.5 py-1 text-xs font-mono text-text-primary rounded-none opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shadow-md"
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
      <div className="border border-border bg-surface p-4 rounded-none">
        <div className="flex items-center space-x-2 border-b border-border pb-3 mb-3">
          <ShieldCheck className="h-4 w-4 text-brand-accent" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
            TOP PREDICTIVE FEATURE WEIGHTS ({productionName.toUpperCase()} FEATURE IMPORTANCE)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          {benchmark.topFeatures.map((f, i) => (
            <div
              key={f.name}
              className="border border-border-subtle bg-background p-2.5 rounded-none flex items-start justify-between space-x-2"
            >
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] text-text-muted">#{i + 1}</span>
                  <span className="text-xs font-bold text-text-primary truncate">
                    {f.name}
                  </span>
                </div>
                <div className="text-[11px] text-text-muted mt-0.5">{f.desc}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="inline-block text-xs font-bold text-brand-accent">
                  {(f.importance * 100).toFixed(1)}%
                </span>
                <div className="text-[9px] text-text-muted uppercase">{f.category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for full screen image preview */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl w-full border border-border bg-surface p-4 rounded-none space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-xs font-bold uppercase font-mono text-text-primary">
                {selectedImage.title}
              </span>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1 text-text-muted hover:text-text-primary rounded-none"
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
