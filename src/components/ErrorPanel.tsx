import { AlertCircle, RefreshCw } from 'lucide-react';
import type { FormattedError } from '../lib/errors';

interface ErrorPanelProps {
  details: FormattedError;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorPanel({ details, onRetry, compact = false }: ErrorPanelProps) {
  return (
    <div className={`error-panel ${compact ? 'error-panel-compact' : ''}`} role="alert">
      <div className="error-panel-icon" aria-hidden="true">
        <AlertCircle size={19} />
      </div>
      <div className="error-panel-copy">
        <strong>{details.title}</strong>
        <span>Location: {details.location}</span>
        <span>Reason: {details.reason}</span>
        {details.suggestion ? <span>Suggestion: {details.suggestion}</span> : null}
      </div>
      {onRetry ? (
        <button className="button button-secondary button-small" type="button" onClick={onRetry}>
          <RefreshCw size={15} aria-hidden="true" />
          Retry
        </button>
      ) : null}
    </div>
  );
}
