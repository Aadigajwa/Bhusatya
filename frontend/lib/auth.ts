'use client'

export interface UserSession {
  username: string
  role: string
  department?: string
}

export function getClientSession(): { isAuthenticated: boolean; username: string | null } {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, username: null }
  }

  // Check localStorage and cookie
  const localAuth = localStorage.getItem('bhusatya_auth') === 'true'
  const username = localStorage.getItem('bhusatya_user')
  const hasCookie = document.cookie.includes('bhusatya_session=authenticated')

  return {
    isAuthenticated: localAuth || hasCookie,
    username: username || 'admin',
  }
}

export async function loginUser(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Invalid credentials' }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('bhusatya_auth', 'true')
      localStorage.setItem('bhusatya_user', data.user?.username || username)
    }

    return { success: true }
  } catch {
    // Fallback client-side check if offline or network issue
    const envUser = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin'
    const envPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'bhusatya2026'

    if (username === envUser && password === envPass) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('bhusatya_auth', 'true')
        localStorage.setItem('bhusatya_user', username)
        document.cookie = 'bhusatya_session=authenticated; path=/; max-age=604800; SameSite=Lax'
      }
      return { success: true }
    }

    return { success: false, error: 'Could not connect to authentication server.' }
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST' })
  } catch {
    // Ignore error
  }

  if (typeof window !== 'undefined') {
    localStorage.removeItem('bhusatya_auth')
    localStorage.removeItem('bhusatya_user')
    document.cookie = 'bhusatya_session=; path=/; max-age=0'
    document.cookie = 'bhusatya_user=; path=/; max-age=0'
  }
}
