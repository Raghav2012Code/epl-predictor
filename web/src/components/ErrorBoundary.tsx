import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('Unhandled React Error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const { error, errorInfo, showDetails } = this.state;
      return (
        <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-4 font-sans">
          <div className="max-w-lg w-full border border-border bg-surface p-6 rounded-md shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="h-10 w-10 rounded-md bg-red-400/10 border border-red-400/25 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-text-primary">Something went wrong</h1>
                <p className="text-xs font-mono text-text-muted mt-0.5">
                  An unexpected client-side error occurred in the application.
                </p>
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              The intelligence engine encountered an exception while rendering this view. You can reload the page or reset the component state.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-md bg-brand-primary text-white hover:bg-brand-primaryHover transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reload Application</span>
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 text-xs font-medium rounded-md border border-border hover:bg-surface-hover transition-colors text-text-secondary hover:text-text-primary"
              >
                Try to Recover
              </button>
            </div>

            {error && (
              <div className="pt-3 border-t border-border">
                <button
                  onClick={() => this.setState({ showDetails: !showDetails })}
                  className="flex items-center justify-between w-full text-xs font-mono text-text-muted hover:text-text-secondary"
                >
                  <span>Technical Details</span>
                  {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>

                {showDetails && (
                  <div className="mt-2 p-3 bg-background border border-border-subtle rounded-sm font-mono text-[11px] text-red-200 overflow-x-auto space-y-2 max-h-56">
                    <div className="font-bold">{error.toString()}</div>
                    {errorInfo?.componentStack && (
                      <pre className="text-[10px] text-text-muted whitespace-pre-wrap">
                        {errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
