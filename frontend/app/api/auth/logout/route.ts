import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' })

  // Clear auth cookies
  response.cookies.set({
    name: 'bhusatya_session',
    value: '',
    path: '/',
    maxAge: 0,
  })
  response.cookies.set({
    name: 'bhusatya_user',
    value: '',
    path: '/',
    maxAge: 0,
  })

  return response
}
