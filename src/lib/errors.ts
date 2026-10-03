export interface ErrorDetails {
  title: string;
  location: string;
  reason: string;
  product?: string;
  suggestion?: string;
}

export interface FormattedError extends ErrorDetails {
  message: string;
}

/**
 * Creates the single, structured error shape used by inline errors and toasts.
 * Keeping the location and reason next to every error makes support and debugging
 * substantially easier than showing a generic fallback message.
 */
export function formatError(details: ErrorDetails): FormattedError {
  const reason = details.reason.trim() || 'The request returned no additional details.';
  const message = `${details.title}. Location: ${details.location}. Reason: ${reason}`;

  return {
    ...details,
    reason,
    message: details.suggestion ? `${message}. Suggestion: ${details.suggestion}` : message,
  };
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }
  }

  return 'The request returned an unknown error from the connected service.';
}

export function getErrorCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === 'string' ? code : undefined;
  }

  return undefined;
}
