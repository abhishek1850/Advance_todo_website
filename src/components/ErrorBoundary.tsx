import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children?: ReactNode;
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
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 24,
                    textAlign: 'center',
                    color: 'var(--text-secondary)'
                }}>
                    <AlertTriangle size={48} style={{ color: 'var(--accent-danger)', marginBottom: 16 }} />
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                        Something went wrong
                    </h2>
                    <p style={{ maxWidth: 400, marginBottom: 24 }}>
                        We encountered an unexpected error. Please try refreshing the page.
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => window.location.reload()}
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        <RefreshCw size={16} /> Reload Application
                    </button>
                    {this.state.error && (
                        <pre style={{
                            marginTop: 32,
                            padding: 16,
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: 8,
                            fontSize: 11,
                            textAlign: 'left',
                            maxWidth: '100%',
                            overflow: 'auto',
                            color: 'var(--text-tertiary)'
                        }}>
                            {this.state.error.toString()}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
