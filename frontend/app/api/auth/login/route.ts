import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { username, password } = body

    const expectedUsername =
      process.env.BHUSATYA_USERNAME ||
      process.env.NEXT_PUBLIC_ADMIN_USERNAME ||
      'admin'
    const expectedPassword =
      process.env.BHUSATYA_PASSWORD ||
      process.env.NEXT_PUBLIC_ADMIN_PASSWORD ||
      'bhusatya2026'

    if (username === expectedUsername && password === expectedPassword) {
      const response = NextResponse.json({
        success: true,
        user: {
          username,
          role: 'Government Verifier',
          department: 'Revenue & Land Records Forensics',
        },
      })

      // Set cookie for session persistence
      response.cookies.set({
        name: 'bhusatya_session',
        value: 'authenticated',
        httpOnly: false,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
      })

      response.cookies.set({
        name: 'bhusatya_user',
        value: username,
        httpOnly: false,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      })

      return response
    }

    return NextResponse.json(
      { success: false, error: 'Invalid username or access credentials.' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal authentication server error.' },
      { status: 500 }
    )
  }
}
