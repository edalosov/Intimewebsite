// Simple in-memory sliding-window limiter. Good enough for a single small
// site's admin login — it's process-local, so on Vercel it resets whenever
// a serverless instance cold-starts and isn't shared across concurrent
// instances. A shared store (e.g. Upstash Redis) would be needed for a
// strict guarantee at higher traffic/instance counts.
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { blocked: false, retryAfterMs: 0 };
  }

  if (entry.count >= limit) {
    return { blocked: true, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { blocked: false, retryAfterMs: 0 };
}
