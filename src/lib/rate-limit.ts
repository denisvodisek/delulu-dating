/** In-process limiter — best-effort on serverless (per instance). Pair with edge/WAF in production. */
const buckets = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  limit = 24,
  windowMs = 900_000,
): boolean {
  const now = Date.now();
  const arr = buckets.get(key) ?? [];
  const pruned = arr.filter((t) => now - t < windowMs);
  if (pruned.length >= limit) return false;
  pruned.push(now);
  buckets.set(key, pruned);
  return true;
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
