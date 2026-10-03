import { formatError } from '../lib/errors';
import { Logo } from './Logo';

export function ConfigErrorScreen() {
  const details = formatError({
    title: 'Configuration Error',
    location: 'Supabase Connection',
    reason: 'Environment variables are missing.',
    suggestion: 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the environment, then restart the Vite server.',
  });

  return (
    <main className="full-page-state config-page">
      <Logo plain />
      <div className="state-icon state-icon-error" aria-hidden="true">
        !
      </div>
      <p className="eyebrow">Rafna Investment</p>
      <h1>{details.title}</h1>
      <p>
        <strong>Location:</strong> {details.location}
      </p>
      <p>
        <strong>Reason:</strong> {details.reason}
      </p>
      <p className="state-suggestion">
        <strong>Suggestion:</strong> {details.suggestion}
      </p>
    </main>
  );
}
