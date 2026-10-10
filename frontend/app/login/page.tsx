'use client'

import { useState, useTransition, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Fingerprint,
  Building2,
  KeyRound,
  CheckCircle2,
} from 'lucide-react'
import { loginUser } from '@/lib/auth'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get('redirect') || '/dashboard'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  const handleFillDemo = () => {
    const demoUser = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin'
    const demoPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'bhusatya2026'
    setUsername(demoUser)
    setPassword(demoPass)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.')
      return
    }

    startTransition(async () => {
      const result = await loginUser(username.trim(), password)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          const destination = redirectTarget.startsWith('/') ? redirectTarget : '/dashboard'
          router.push(destination)
          router.refresh()
        }, 500)
      } else {
        setError(result.error || 'Invalid credentials. Please verify your .env settings.')
      }
    })
  }

  const isVerifying = redirectTarget.includes('verification')

  return (
    <div className="min-h-screen w-full bg-[#fbfbf9] text-[#2a211b] font-outfit flex flex-col justify-between relative overflow-hidden selection:bg-[#b34e2b] selection:text-white">
      {/* Subtle Cadastral / Survey Background Grid */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#2a211b08_1px,transparent_1px),linear-gradient(to_bottom,#2a211b08_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_60%,transparent_100%)] pointer-events-none"
        aria-hidden
      />

      {/* Top Header / Brand Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#b34e2b] shadow-sm">
            <svg width="20" height="20" viewBox="0 0 26 26" fill="none" aria-hidden>
              <path
                d="M6 10V6h4M16 6h4v4M20 16v4h-4M10 20H6v-4"
                stroke="#fbfbf9"
                strokeWidth="2"
                strokeLinecap="square"
              />
              <path d="M9.5 13.2l2.5 2.5 4.5-5" stroke="#fbfbf9" strokeWidth="2" strokeLinecap="square" />
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-lg tracking-tight text-[#2a211b]">
              BhuSatya<span className="text-[#b34e2b]">.ai</span>
            </span>
            <span className="text-[10px] tracking-widest text-[#6b6158] uppercase font-mono">
              National Land Forensics
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-[#6b6158] hover:text-[#2a211b] transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-full border border-[#e6e2d8] bg-white/70 backdrop-blur-sm"
        >
          ← Return to Public Portal
        </Link>
      </header>

      {/* Center Auth Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="rounded-2xl border border-[#e6e2d8] bg-white/90 p-7 sm:p-9 shadow-[0_15px_45px_0_rgba(42,33,27,0.07)] backdrop-blur-xl">
            {/* Header Badge */}
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#2f6b46]/25 bg-[#2f6b46]/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#2f6b46]">
                <ShieldCheck className="size-3.5" />
                Authorized Verifier Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2a211b]">
                {isVerifying ? 'Sign In to Verify Document' : 'Sign In to BhuSatya'}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-[#6b6158] font-normal leading-relaxed">
                {isVerifying
                  ? 'Sign in with your verifier credentials to unlock document forensic auditing and 7/12 cross-checks.'
                  : 'Access certified document forensic engines, 7/12 registry cross-checks, and seal verification.'}
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-lg border border-[#a8352a]/25 bg-[#a8352a]/10 p-3.5 text-xs text-[#a8352a] font-medium"
              >
                <AlertCircle className="size-4 shrink-0 mt-0.5 text-[#a8352a]" />
                <div className="flex-1 leading-relaxed">{error}</div>
              </div>
            )}

            {/* Success Notification */}
            {success && (
              <div
                role="status"
                className="mb-5 flex items-center gap-2.5 rounded-lg border border-[#2f6b46]/30 bg-[#2f6b46]/15 p-3 text-xs text-[#2f6b46] font-semibold"
              >
                <CheckCircle2 className="size-4 shrink-0 text-[#2f6b46]" />
                <span>Credentials verified. Entering command center...</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#4a3f35] mb-1.5"
                >
                  Verifier Identifier / Username
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#6b6158]">
                    <User className="size-4" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter verifier username"
                    className="w-full rounded-lg border border-[#d9d4c7] bg-[#fbfbf9]/60 py-2.5 pr-3.5 pl-10 text-sm text-[#2a211b] placeholder:text-[#a99f92] focus:border-[#b34e2b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b34e2b]/20 transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#4a3f35]"
                  >
                    Security Key / Password
                  </label>
                  <span className="text-[11px] font-mono text-[#6b6158]">AES-256</span>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#6b6158]">
                    <Lock className="size-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security key"
                    className="w-full rounded-lg border border-[#d9d4c7] bg-[#fbfbf9]/60 py-2.5 pr-10 pl-10 text-sm text-[#2a211b] placeholder:text-[#a99f92] focus:border-[#b34e2b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b34e2b]/20 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#6b6158] hover:text-[#2a211b]"
                    aria-label={showPassword ? 'Hide security key' : 'Show security key'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="size-4 rounded border-[#d9d4c7] text-[#b34e2b] focus:ring-[#b34e2b]"
                  />
                  <span className="text-xs text-[#6b6158]">Remember this terminal session</span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isPending || success}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#b34e2b] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(179,78,43,0.25)] transition-all hover:bg-[#9c4222] hover:shadow-[0_6px_20px_rgba(179,78,43,0.35)] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="size-4" />
                    <span>Authenticate & Enter Project</span>
                    <ArrowRight className="size-4 ml-1" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Helper */}
            <div className="mt-6 pt-5 border-t border-[#e6e2d8]/80 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs text-[#6b6158]">
                <span className="font-medium flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-[#b34e2b]" />
                  Credentials from .env:
                </span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="font-semibold text-[#b34e2b] hover:underline cursor-pointer"
                >
                  Auto-fill Demo
                </button>
              </div>
              <div className="flex items-center justify-between bg-[#f3f1ea] px-3 py-2 rounded-md font-mono text-[11px] text-[#4a3f35] border border-[#e6e2d8]">
                <span>
                  Username: <strong className="text-[#2a211b]">admin</strong>
                </span>
                <span>
                  Password: <strong className="text-[#2a211b]">bhusatya2026</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Footer Security Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-center text-[11px] text-[#6b6158]">
            <span className="flex items-center gap-1">
              <Fingerprint className="size-3 text-[#2f6b46]" />
              Biometric Forensics
            </span>
            <span aria-hidden>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3 text-[#b34e2b]" />
              Bhulekh Central Node
            </span>
            <span aria-hidden>•</span>
            <span>256-Bit Encrypted</span>
          </div>
        </div>
      </main>

      {/* Bottom Footer Note */}
      <footer className="relative z-10 w-full text-center py-4 text-xs text-[#6b6158] border-t border-[#e6e2d8]/60 bg-white/40">
        BhuSatya Land Document Forensics & Stamp Paper Verification System &copy; 2026. Official Department Portal.
      </footer>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fbfbf9]" />}>
      <LoginForm />
    </Suspense>
  )
}
