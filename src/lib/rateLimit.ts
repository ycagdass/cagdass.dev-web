import { NextRequest } from "next/server";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function clientKey(request: NextRequest, scope: string) {
  const forwardedFor = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
  return `${scope}:${ip}`;
}

export function checkRateLimit(
  request: NextRequest,
  options: { scope: string; limit: number; windowMs: number }
) {
  const now = Date.now();
  const key = clientKey(request, options.scope);
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  bucket.count += 1;

  if (bucket.count > options.limit) {
    return {
      allowed: false,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  if (buckets.size > 1000) {
    for (const [bucketKey, value] of buckets) {
      if (value.resetAt <= now) buckets.delete(bucketKey);
    }
  }

  return { allowed: true, retryAfter: 0 };
}
