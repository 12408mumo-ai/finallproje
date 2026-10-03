import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { FormattedError } from '../lib/errors';

export type ToastType = 'success' | 'error' | 'warning';
export type ToastContent = string | FormattedError;

export interface ToastItem {
  id: number;
  type: ToastType;
  content: ToastContent;
}

interface ToastContextValue {
  showSuccess: (content: ToastContent) => void;
  showError: (content: ToastContent) => void;
  showWarning: (content: ToastContent) => void;
  dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, content: ToastContent) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((current) => [...current, { id, type, content }]);
      const duration = type === 'error' ? 10000 : type === 'warning' ? 7000 : 4500;
      window.setTimeout(() => dismissToast(id), duration);
    },
    [dismissToast],
  );

  const showSuccess = useCallback((content: ToastContent) => addToast('success', content), [addToast]);
  const showError = useCallback((content: ToastContent) => addToast('error', content), [addToast]);
  const showWarning = useCallback((content: ToastContent) => addToast('warning', content), [addToast]);

  const value = useMemo(
    () => ({ showSuccess, showError, showWarning, dismissToast }),
    [dismissToast, showError, showSuccess, showWarning],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" aria-label="Notifications">
        {toasts.map((toast) => (
          <ToastItemView key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItemView({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const details = typeof toast.content === 'string' ? null : toast.content;
  const title = details ? details.title : (toast.content as string);
  const icon = toast.type === 'success' ? '✓' : toast.type === 'error' ? '❌' : '⚠';

  return (
    <div
      className={`toast toast-${toast.type}`}
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    >
      <span className="toast-icon" aria-hidden="true">
        {icon}
      </span>
      <div className="toast-body">
        <strong>{title}</strong>
        {details ? (
          <>
            <span>Location: {details.location}</span>
            {details.product ? <span>Product: {details.product}</span> : null}
            <span>Reason: {details.reason}</span>
            {details.suggestion ? <span>Suggestion: {details.suggestion}</span> : null}
          </>
        ) : null}
      </div>
      <button
        className="toast-close"
        type="button"
        aria-label="Close notification"
        onClick={() => onDismiss(toast.id)}
      >
        ×
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider.');
  }
  return context;
}
