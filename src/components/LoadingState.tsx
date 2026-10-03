import { LoaderCircle } from 'lucide-react';

export function LoadingState({ label, compact = false }: { label: string; compact?: boolean }) {
  return (
    <div className={`loading-state ${compact ? 'loading-state-compact' : ''}`} role="status" aria-live="polite">
      <LoaderCircle className="spin" size={compact ? 18 : 22} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
