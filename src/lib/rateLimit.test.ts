import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkRateLimit, resetRateLimits } from './rateLimit';

const options = { limit: 3, windowMs: 60_000 };

describe('checkRateLimit', () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it('allows requests up to the limit', () => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      expect(checkRateLimit('1.2.3.4', options).allowed).toBe(true);
    }
  });

  it('blocks the request after the limit', () => {
    for (let attempt = 0; attempt < 3; attempt += 1) checkRateLimit('1.2.3.4', options);

    const result = checkRateLimit('1.2.3.4', options);

    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('tracks each key separately', () => {
    for (let attempt = 0; attempt < 4; attempt += 1) checkRateLimit('blocked', options);

    expect(checkRateLimit('other', options).allowed).toBe(true);
  });

  it('allows requests again once the window has passed', () => {
    for (let attempt = 0; attempt < 4; attempt += 1) checkRateLimit('1.2.3.4', options);

    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.now() + 61_000));
    try {
      expect(checkRateLimit('1.2.3.4', options).allowed).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
