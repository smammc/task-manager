import { NextResponse, type NextRequest } from 'next/server'
import type { NextMiddleware } from 'next/server'

// In-memory rate limit store (for demo only)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string, limit = 50, windowMs = 60000): boolean {
  const now = Date.now()
  const key = `rate_limit_${ip}`
  const record = rateLimitStore.get(key)
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  if (record.count >= limit) return false
  record.count++
  return true
}

function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get('token')?.value
  console.log('Auth middleware token:', token) // Debug log
  return !!token
}

function isAdmin(request: NextRequest): boolean {
  const role = request.cookies.get('role')?.value
  return role === 'admin'
}

export const middleware: NextMiddleware = (request: NextRequest) => {
  const { pathname, origin } = request.nextUrl
  const response = NextResponse.next()

  // 1. Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // 2. Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    // Use x-forwarded-for header or fallback
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip)) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: { 'Retry-After': '60' },
      })
    }
    // 5. CORS for API
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers })
    }
    return response
  }

  // 3. Auth logic
  if (pathname.startsWith('/auth')) return response

  if (
    pathname.startsWith('/app') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dashboard')
  ) {
    if (!isAuthenticated(request)) {
      const loginUrl = new URL('/login', origin)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  if (pathname.startsWith('/admin')) {
    if (!isAdmin(request)) {
      return NextResponse.redirect(new URL('/dashboard', origin))
    }
  }

  // 4. Redirect logged-in users away from auth pages
  if ((pathname === '/auth/login' || pathname === '/auth/register') && isAuthenticated(request)) {
    return NextResponse.redirect(new URL('/dashboard', origin))
  }

  return response
}

export const config = {
  matcher: ['/app/:path*', '/admin/:path*', '/auth/:path*', '/api/:path*', '/dashboard'],
}
