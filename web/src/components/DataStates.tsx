import React from 'react';
import { AlertTriangle, Database, RefreshCw } from 'lucide-react';

const shimmer = 'skeleton-shimmer bg-surface-subtle';

export const AppSkeleton: React.FC = () => (
  <div className="min-h-screen bg-background flex flex-col md:flex-row" aria-busy="true" aria-label="Loading dashboard">
    <div className="hidden md:block w-56 border-r border-border bg-surface p-4 space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={`${shimmer} h-8 border border-border`} />
      ))}
    </div>
    <div className="flex-1 p-4 space-y-3">
      <div className={`${shimmer} h-10 border border-border bg-surface`} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${shimmer} h-16 border border-border bg-surface`} />
        ))}
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={`${shimmer} h-24 border border-border bg-surface`} />
      ))}
    </div>
  </div>
);

export const DataErrorPanel: React.FC<{ error: string; onRetry: () => void }> = ({
  error,
  onRetry,
}) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-6">
    <div
      role="alert"
      className="w-full max-w-md border border-border bg-surface p-6 text-center space-y-3"
    >
      <div className="mx-auto w-10 h-10 flex items-center justify-center border border-brand-accent/40 bg-brand-accent/10">
        <AlertTriangle className="h-5 w-5 text-brand-accent" />
      </div>
      <h2 className="text-sm font-mono font-bold text-text-primary">DATA FAILED TO LOAD</h2>
      <p className="text-xs font-mono text-text-muted break-words">{error}</p>
      <p className="text-[11px] font-mono text-text-muted flex items-center justify-center gap-1">
        <Database className="h-3 w-3" />
        Bundled fallback unavailable — check the build or VITE_DATA_URL.
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center space-x-1.5 border border-brand-accent/40 bg-brand-accent/15 px-3 py-1.5 text-xs font-mono font-bold text-brand-accent hover:bg-brand-accent/25 transition-colors"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        <span>RETRY LOAD</span>
      </button>
    </div>
  </div>
);
