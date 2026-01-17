import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

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
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-void">
                    <div className="max-w-md">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <AlertTriangle size={40} className="text-red-400" />
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-4 text-white">
                            Something Went Wrong
                        </h1>

                        <p className="text-gray-400 mb-6 leading-relaxed">
                            An unexpected error occurred. We've been notified and are working on a fix.
                        </p>

                        {import.meta.env.DEV && this.state.error && (
                            <pre className="text-left text-xs text-red-400 bg-red-500/10 p-4 rounded-xl mb-6 overflow-auto max-h-32 border border-red-500/20">
                                {this.state.error.message}
                            </pre>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="flex items-center justify-center gap-2 px-6 py-3 border border-white/20 rounded-full hover:bg-white/5 transition-colors text-white"
                            >
                                <RefreshCw size={18} />
                                Refresh Page
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-accent text-void font-bold rounded-full hover:scale-105 transition-transform"
                            >
                                <Home size={18} />
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
