import React from "react";

const logo = `${import.meta.env.BASE_URL}epl-predictor-header-logo.png`;

export const AppSkeleton: React.FC = () => (
  <div className="state" aria-busy="true">
    <div className="state__body" role="status">
      <img className="state__logo" src={logo} alt="EPL Predictor" draggable={false} />
      <h1>Loading the season</h1>
      <p>Fixtures, form and model forecasts are on the way.</p>
      <div className="split-bar__track state__bar" aria-hidden="true">
        <span className="split-bar__segment split-bar__segment--home" style={{ flexBasis: "46%" }} />
        <span className="split-bar__segment split-bar__segment--draw" style={{ flexBasis: "26%" }} />
        <span className="split-bar__segment split-bar__segment--away" style={{ flexBasis: "28%" }} />
      </div>
    </div>
  </div>
);

export const DataErrorPanel: React.FC<{ error: string; onRetry: () => void }> = ({
  error,
  onRetry,
}) => (
  <main className="state">
    <div className="state__body" role="alert">
      <img className="state__logo" src={logo} alt="EPL Predictor" draggable={false} />
      <h1>We could not load the season data</h1>
      <p>{error}</p>
      <p>Check your connection and try again.</p>
      <div>
        <button type="button" className="btn" onClick={onRetry}>
          Try again
        </button>
      </div>
    </div>
  </main>
);
