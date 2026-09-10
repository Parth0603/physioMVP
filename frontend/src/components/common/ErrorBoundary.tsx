import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[500px] flex items-center justify-center p-6 bg-[#faf7f2]">
          <div className="max-w-md w-full bg-white border border-[#e8e2d5] rounded-3xl p-8 shadow-sm text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              An unexpected display issue occurred in this section. Your account data and progress are safe.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-xl text-left overflow-auto max-h-32 text-[11px] font-mono text-slate-700">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" /> Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0d3834] text-white font-semibold text-xs hover:bg-[#124842] shadow transition-colors"
              >
                <Home className="w-3.5 h-3.5" /> Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
