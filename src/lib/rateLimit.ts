/**
 * A fixed-window limiter held in process memory.
 *
 * This is honest about its scope: it stops a single client hammering the
 * appointment form from one machine, which is the realistic abuse for a clinic
 * site. It does NOT survive a restart and is NOT shared between instances — if
 * this is ever deployed behind more than one Node process, move the counter to
 * Redis or an equivalent. See README → Rate limiting.
 */
type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

/** Bounded so a flood of distinct keys cannot grow the map without limit. */
const MAX_TRACKED_KEYS = 5_000;

const sweep = (now: number): void => {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
};

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

export const checkRateLimit = (
  key: string,
  options: { limit: number; windowMs: number },
): RateLimitResult => {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    if (windows.size >= MAX_TRACKED_KEYS) sweep(now);
    windows.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;

  if (existing.count > options.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
};

/** Test-only: clears all windows so one test cannot leak into the next. */
export const resetRateLimits = (): void => {
  windows.clear();
};
