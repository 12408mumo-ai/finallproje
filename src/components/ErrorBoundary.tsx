import { Component, type ErrorInfo, type ReactNode } from 'react';
import { formatError } from '../lib/errors';
import { Logo } from './Logo';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application error boundary caught an error.', error, errorInfo);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    const details = formatError({
      title: 'Application Error',
      location: 'Application Error Boundary',
      reason: this.state.error.message || 'The application encountered an unexpected rendering error.',
      suggestion: 'Refresh the page. If the issue continues, check the browser console and Supabase configuration.',
    });

    return (
      <main className="full-page-state error-boundary-page">
        <Logo plain />
        <div className="state-icon state-icon-error" aria-hidden="true">
          !
        </div>
        <h1>{details.title}</h1>
        <p>
          <strong>Location:</strong> {details.location}
        </p>
        <p>
          <strong>Reason:</strong> {details.reason}
        </p>
        <p>
          <strong>Suggestion:</strong> {details.suggestion}
        </p>
        <button className="button button-primary" type="button" onClick={() => window.location.reload()}>
          Refresh page
        </button>
      </main>
    );
  }
}
