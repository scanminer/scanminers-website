// lib/rate-limiter.ts
// Minimal in-memory sliding window limiter compatible with Edge runtime.
// Note: This is per-isolate and resets on cold starts; adequate as a first line of defense.

const BUCKET = new Map<string, { count: number; ts: number }>()
const LIMIT = 20 // requests
const WINDOW_MS = 60_000 // 1 minute

export function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const rec = BUCKET.get(ip)
  if (!rec) {
    BUCKET.set(ip, { count: 1, ts: now })
    return false
  }
  if (now - rec.ts > WINDOW_MS) {
    BUCKET.set(ip, { count: 1, ts: now })
    return false
  }
  if (rec.count >= LIMIT) return true
  rec.count += 1
  return false
}
