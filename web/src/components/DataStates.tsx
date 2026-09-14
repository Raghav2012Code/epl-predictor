import React from 'react';

export const AppSkeleton: React.FC = () => (
  <div className="loading-shell" aria-busy="true" aria-label="Loading dashboard">
    <div className="loading-rail" />
    <div className="loading-main"><span /><span /><span /><span /></div>
  </div>
);

export const DataErrorPanel: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <main className="error-shell"><div className="content-card error-card" role="alert"><p className="eyebrow">Data unavailable</p><h1>We could not load the season file.</h1><p className="muted">{error}</p><button className="primary-button" onClick={onRetry}>Try again</button></div></main>
);
