/**
 * The one error type the service layer throws. Repositories never throw it —
 * they return data or null, and the service decides what that means.
 *
 * `message` is always safe to show a user; anything sensitive stays out of it.
 */
export type AppErrorCode =
  'NOT_FOUND' | 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'RATE_LIMITED' | 'CONFLICT' | 'INTERNAL';

export class AppError extends Error {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode, message: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }

  static notFound(what: string): AppError {
    return new AppError('NOT_FOUND', `${what} could not be found.`);
  }

  static validation(message: string): AppError {
    return new AppError('VALIDATION_ERROR', message);
  }

  static unauthorized(message = 'You need to sign in to do that.'): AppError {
    return new AppError('UNAUTHORIZED', message);
  }

  static rateLimited(message = 'Too many requests. Please try again in a few minutes.'): AppError {
    return new AppError('RATE_LIMITED', message);
  }
}

export const isAppError = (error: unknown): error is AppError => error instanceof AppError;

/**
 * Converts anything thrown into a message safe to render. Unknown failures are
 * deliberately opaque — an unexpected Prisma or driver error can carry a
 * connection string or row contents, neither of which belongs on a page.
 */
export const toUserMessage = (error: unknown): string =>
  isAppError(error) ? error.message : 'Something went wrong. Please try again.';
