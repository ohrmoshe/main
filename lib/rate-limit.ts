// FIX (#4): simple in-memory rate limiter to blunt admin-login brute force.
// Per-process only — good enough to stop a naive flood against one instance. For durable,
// multi-instance protection later, back this with Upstash/Redis (see SECURITY.md).

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

export function checkRateLimit(
  key: string,
  limit = 8,
  windowMs = 5 * 60_000,
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()
  const b = buckets.get(key)
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSec: 0 }
  }
  if (b.count >= limit) {
    return { allowed: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) }
  }
  b.count++
  return { allowed: true, retryAfterSec: 0 }
}
