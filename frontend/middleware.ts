import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes inside the main project
const protectedPaths = [
  '/dashboard',
  '/verification',
  '/reports',
  '/documents',
  '/settings',
]

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const sessionCookie = request.cookies.get('bhusatya_session')
  const isAuthenticated = sessionCookie?.value === 'authenticated'

  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )

  // Gated project access: must sign in first
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  // If already authenticated and visiting /login, forward to target or dashboard
  if (pathname === '/login' && isAuthenticated) {
    const redirectParam = request.nextUrl.searchParams.get('redirect')
    const destination = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/dashboard'
    return NextResponse.redirect(new URL(destination, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/verification/:path*',
    '/reports/:path*',
    '/documents/:path*',
    '/settings/:path*',
    '/login',
  ],
}
