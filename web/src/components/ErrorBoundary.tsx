import React, { Component, ErrorInfo, ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Unhandled dashboard error', error, info); }
  render() {
    if (this.state.error) return <main className="error-shell"><div className="content-card error-card" role="alert"><p className="eyebrow">Unexpected error</p><h1>The dashboard needs a reload.</h1><p className="muted">{this.state.error.message}</p><button className="primary-button" onClick={() => window.location.reload()}>Reload dashboard</button></div></main>;
    return this.props.children;
  }
}
