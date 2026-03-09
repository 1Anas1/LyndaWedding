import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { UserRole } from '@prisma/client'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Public routes – invitation pages and wedding view (no login required)
  if (
    pathname.startsWith('/i/') ||
    pathname.startsWith('/u/') ||
    pathname === '/wedding' ||
    pathname.startsWith('/api/rsvp') ||
    pathname.startsWith('/api/invites/') ||
    (pathname.startsWith('/api/invitations/') && pathname.includes('/slug')) ||
    pathname.startsWith('/api/billing/webhook') || // Stripe webhook
    pathname.startsWith('/api/auth/') || // Auth endpoints
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/unauthorized'
  ) {
    return NextResponse.next()
  }

  // Protected routes
  if (pathname.startsWith('/app')) {
    if (!session) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // OWNER role required for /app routes
    if (session.user.role !== UserRole.OWNER) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  if (pathname.startsWith('/admin')) {
    if (!session) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // ADMIN role required for /admin routes
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  // Protect API routes
  if (pathname.startsWith('/api/invitations') && !pathname.includes('/slug')) {
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // OWNER can access their invitations, ADMIN can access all
    if (pathname.startsWith('/api/invitations/') && !pathname.includes('/publish')) {
      // Will be checked in the route handler
    }
  }

  if (pathname.startsWith('/api/billing')) {
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== UserRole.OWNER) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  if (pathname.startsWith('/api/admin')) {
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
