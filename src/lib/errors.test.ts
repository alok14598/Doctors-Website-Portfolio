import { describe, expect, it } from 'vitest';
import { AppError, isAppError, toUserMessage } from './errors';

describe('AppError', () => {
  it('builds a NOT_FOUND message naming the thing', () => {
    const error = AppError.notFound('That doctor');

    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('That doctor could not be found.');
  });

  it('builds the other kinds with sensible defaults', () => {
    expect(AppError.validation('Check the form.').code).toBe('VALIDATION_ERROR');
    expect(AppError.unauthorized().message).toMatch(/sign in/i);
    expect(AppError.rateLimited().message).toMatch(/too many/i);
  });
});

describe('isAppError', () => {
  it('distinguishes our errors from anything else thrown', () => {
    expect(isAppError(AppError.notFound('x'))).toBe(true);
    expect(isAppError(new Error('boom'))).toBe(false);
    expect(isAppError('a string')).toBe(false);
  });
});

describe('toUserMessage', () => {
  it('passes an AppError message through, since those are written for patients', () => {
    expect(toUserMessage(AppError.validation('Please choose a date.'))).toBe(
      'Please choose a date.',
    );
  });

  it('hides an unexpected error, which could carry a connection string or row data', () => {
    const leaky = new Error('connect ECONNREFUSED postgresql://clinic:secret@localhost:5433');

    const message = toUserMessage(leaky);

    expect(message).toBe('Something went wrong. Please try again.');
    expect(message).not.toContain('secret');
  });
});
