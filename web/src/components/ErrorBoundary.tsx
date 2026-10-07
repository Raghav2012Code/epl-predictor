import React, { Component, ErrorInfo, ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Unhandled dashboard error', error, info); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="state">
        <div className="state__body" role="alert">
          <h1>Something went wrong</h1>
          <p>{this.state.error.message}</p>
          <p>Reload the page to start again.</p>
          <div>
            <button type="button" className="btn" onClick={() => window.location.reload()}>
              Reload the page
            </button>
          </div>
        </div>
      </main>
    );
  }
}
