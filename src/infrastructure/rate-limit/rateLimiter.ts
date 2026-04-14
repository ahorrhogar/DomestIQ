export interface RateLimitPolicy {
  key: string;
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function checkRateLimit(policy: RateLimitPolicy): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(policy.key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + policy.windowMs;
    buckets.set(policy.key, { count: 1, resetAt });
    return { allowed: true, remaining: policy.maxRequests - 1, resetAt };
  }

  existing.count += 1;
  const allowed = existing.count <= policy.maxRequests;
  const remaining = Math.max(policy.maxRequests - existing.count, 0);

  return {
    allowed,
    remaining,
    resetAt: existing.resetAt,
  };
}
