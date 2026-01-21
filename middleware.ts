import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

/**
 * In-memory rate limiting.
 * For production with multiple servers, use @upstash/ratelimit with Redis.
 */
interface RateLimitEntry {
  requests: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

function checkRateLimit(identifier: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { requests: 1, resetTime: now + windowMs })
    return true
  }

  if (entry.requests < limit) {
    entry.requests++
    return true
  }

  return false
}

function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  return (forwardedFor?.split(',')[0].trim() || realIp || '127.0.0.1')
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Rate limiting check
    const ip = getClientIp(req)
    const isAllowed = checkRateLimit(ip, 100, 60000)

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    // Admin routes
    if (path.startsWith('/admin')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    // Branch routes
    if (path.startsWith('/periods')) {
      if (token?.role !== 'BRANCH' && token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/periods/:path*'],
}
