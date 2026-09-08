import React, { useState } from 'react';
import { EPLDataset, DiagnosticImage } from '../types';
import { Cpu, BarChart2, ShieldCheck, CheckCircle2, Eye, Maximize2, X } from 'lucide-react';

interface AnalyticsViewProps {
  benchmark: EPLDataset['benchmark'];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ benchmark }) => {
  const [selectedImage, setSelectedImage] = useState<DiagnosticImage | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<string>(benchmark.diagnostics[0]?.id || '');

  const currentChart = benchmark.diagnostics.find((d) => d.id === activeChartTab) || benchmark.diagnostics[0];

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
            <span className="inline-flex items-center px-2 py-1 text-xs font-mono font-bold bg-pl-purple text-white border border-pl-purpleLight rounded-sm">
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-pl-green" />
              PRODUCTION: XGBOOST (SELECTED)
            </span>
          </div>
        </div>

        <p className="mt-3 text-xs text-text-secondary leading-relaxed">
          The pipeline benchmarks Random Forest and XGBoost across 2,280 historical Premier League matches using strict time-series cross-validation (pre-2024 train, 2024–2026 validation). All features are calculated using historical chronological shift (<code className="font-mono text-pl-cyan">shift(1)</code>) to guarantee zero future data leakage.
        </p>
      </div>

      {/* Benchmark Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {benchmark.models.map((m) => (
          <div
            key={m.name}
            className={`border p-4 rounded-sm bg-surface ${
              m.isProduction
                ? 'border-pl-purpleLight ring-1 ring-pl-purpleLight/40'
                : 'border-border'
            }`}
          >
            <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
              <div className="flex items-center space-x-2">
                <Cpu className={`h-4 w-4 ${m.isProduction ? 'text-pl-cyan' : 'text-text-muted'}`} />
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  {m.name}
                </span>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm ${
                  m.isProduction
                    ? 'bg-pl-purple text-white border border-pl-purpleLight'
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
                <div className="text-base font-mono font-black text-pl-green mt-0.5">
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
                <div className="text-base font-mono font-black text-pl-cyan mt-0.5">
                  {m.within1Goal}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Diagnostic Chart Visualizer Gallery */}
      <div className="border border-border bg-surface p-4 rounded-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 mb-4 gap-2">
          <div className="flex items-center space-x-2">
            <BarChart2 className="h-4 w-4 text-pl-green" />
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
                    ? 'bg-pl-purple text-white font-bold border border-pl-purpleLight'
                    : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover'
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
                src={currentChart.src}
                alt={currentChart.title}
                className="max-h-[460px] w-auto object-contain rounded-none"
              />
              <button
                onClick={() => setSelectedImage(currentChart)}
                className="absolute right-4 top-4 flex items-center space-x-1 border border-border bg-surface/90 px-2.5 py-1 text-xs font-mono text-text-primary rounded-sm opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-md"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Full Preview</span>
              </button>
            </div>
            <div className="text-xs text-text-muted font-mono flex items-center justify-between">
              <span>{currentChart.caption}</span>
              <span className="text-[10px] text-text-muted/60">Source: visuals/{currentChart.id}.png</span>
            </div>
          </div>
        )}
      </div>

      {/* Top Predictive Feature Signals */}
      <div className="border border-border bg-surface p-4 rounded-sm">
        <div className="flex items-center space-x-2 border-b border-border pb-3 mb-3">
          <ShieldCheck className="h-4 w-4 text-pl-cyan" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
            TOP PREDICTIVE FEATURE WEIGHTS (XGBOOST FEATURE IMPORTANCE)
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
                <span className="inline-block font-mono text-xs font-bold text-pl-cyan">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative max-w-5xl w-full border border-border bg-surface p-4 rounded-sm space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-xs font-bold uppercase font-mono text-text-primary">
                {selectedImage.title}
              </span>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1 text-text-muted hover:text-text-primary rounded-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <img
              src={selectedImage.src}
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
