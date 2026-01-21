/**
 * Simple in-memory rate limiting utility.
 * For production, consider using @upstash/ratelimit with Redis.
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  /** Maximum requests allowed within window */
  limit: number
  /** Time window in milliseconds */
  windowMs: number
}

/**
 * Check if request should be rate limited.
 * Returns { allowed: true } if request is allowed.
 * Returns { allowed: false, retryAfter: seconds } if rate limited.
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: true } | { allowed: false; retryAfter: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  // Clean up expired entries periodically
  if (entry && now > entry.resetTime) {
    rateLimitMap.delete(identifier)
  }

  const currentEntry = rateLimitMap.get(identifier)

  if (!currentEntry) {
    // First request in window
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return { allowed: true }
  }

  if (currentEntry.count < config.limit) {
    // Within limit
    currentEntry.count++
    return { allowed: true }
  }

  // Rate limited - calculate retry after time
  const retryAfter = Math.ceil((currentEntry.resetTime - now) / 1000)
  return { allowed: false, retryAfter }
}

/**
 * Get client identifier from request.
 * Uses IP address with fallback to session token.
 */
export function getClientIdentifier(req: Request): string {
  // For API routes, use a combination of IP and user context
  // This is a simple implementation - production should use proper IP extraction
  return `ip:${(req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown').split(',')[0].trim()}`
}
