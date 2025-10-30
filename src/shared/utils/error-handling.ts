/**
 * Standardized error handling utilities
 * Provides consistent error formatting and logging
 */

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: Date;
  context?: Record<string, unknown>;
}

/**
 * Create a standardized error object
 */
export function createError(
  code: string,
  message: string,
  details?: unknown,
  context?: Record<string, unknown>
): AppError {
  return {
    code,
    message,
    details,
    timestamp: new Date(),
    context,
  };
}

/**
 * Log an error with context
 */
export function logError(
  error: Error | AppError | unknown,
  context?: Record<string, unknown>
): void {
  const errorObj: AppError =
    error instanceof Error
      ? createError('UNKNOWN_ERROR', error.message, error.stack, context)
      : typeof error === 'object' && error !== null && 'code' in error
      ? (error as AppError)
      : createError(
          'UNKNOWN_ERROR',
          String(error),
          error,
          context
        );

  console.error('Application Error:', {
    ...errorObj,
    context: { ...errorObj.context, ...context },
  });
}

/**
 * Format error for user display
 */
export function formatErrorForUser(error: Error | AppError | unknown): string {
  if (error instanceof Error) {
    return error.message || 'An unexpected error occurred';
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Check if error is a known application error
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'timestamp' in error
  );
}

/**
 * Get user-friendly error message based on error code
 */
export function getUserFriendlyMessage(error: AppError | Error | unknown): string {
  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    if (error.message.includes('storage') || error.message.includes('localStorage')) {
      return 'Storage error. Please check your browser settings and try again.';
    }
    return error.message || 'An unexpected error occurred';
  }

  if (isAppError(error)) {
    const codeMessages: Record<string, string> = {
      CHROME_AI_UNAVAILABLE: 'Chrome AI is not available. Please enable Chrome Built-in AI in your browser settings.',
      STORAGE_ERROR: 'Unable to save data. Please check your browser storage settings.',
      NETWORK_ERROR: 'Network error. Please check your connection and try again.',
      VALIDATION_ERROR: 'Invalid input. Please check your data and try again.',
    };

    return codeMessages[error.code] || error.message || 'An unexpected error occurred';
  }

  return 'An unexpected error occurred. Please try again.';
}

