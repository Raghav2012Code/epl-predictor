import React from 'react';

export const AppSkeleton: React.FC = () => (
  <div className="loading-shell" aria-busy="true" aria-label="Loading dashboard">
    <div className="loading-brief" role="status">
      <img
        className="loading-logo"
        src={`${import.meta.env.BASE_URL}epl-predictor-header-logo.png`}
        alt="EPL Predictor"
        draggable={false}
      />
      <div className="loading-rule" aria-hidden="true"><span /></div>
      <p className="loading-kicker">Matchday briefing</p>
      <h1>Reading the season.</h1>
      <p className="loading-copy">Preparing fixtures, form, and model signals.</p>
      <div className="loading-progress" aria-hidden="true">
        <span /><span /><span /><span /><span />
      </div>
      <p className="loading-note">Loading the offline season file</p>
    </div>
  </div>
);

export const DataErrorPanel: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <main className="error-shell"><div className="content-card error-card" role="alert"><p className="eyebrow">Data unavailable</p><h1>We could not load the season file.</h1><p className="muted">{error}</p><button className="primary-button" onClick={onRetry}>Try again</button></div></main>
);
