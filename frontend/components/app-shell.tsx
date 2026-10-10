'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  ChevronRight,
  ClipboardCheck,
  FilePlus2,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/verification/new', label: 'New Verification', icon: FilePlus2 },
  { href: '/reports', label: 'Reports', icon: ClipboardCheck },
  { href: '/settings', label: 'Settings', icon: Settings },
]

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function crumbsFor(pathname: string): { label: string; href?: string }[] {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0 || parts[0] === 'dashboard') return [{ label: 'Dashboard' }]
  if (parts[0] === 'verification') {
    return [{ label: 'Verification' }, { label: 'New Verification' }]
  }
  if (parts[0] === 'reports' && parts[1]) {
    return [{ label: 'Reports', href: '/reports' }, { label: parts[1] }]
  }
  const labels: Record<string, string> = {
    dashboard: 'Dashboard',
    reports: 'Reports',
    settings: 'Settings',
  }
  return [{ label: labels[parts[0]] ?? parts[0] }]
}

function BrandMark() {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
        <rect x="0.5" y="0.5" width="25" height="25" rx="3.5" fill="#b34e2b" />
        <path
          d="M6 10V6h4M16 6h4v4M20 16v4h-4M10 20H6v-4"
          stroke="#fbfbf9"
          strokeWidth="1.5"
          strokeLinecap="square"
        />
        <path d="M9.5 13.2l2.5 2.5 4.5-5" stroke="#fbfbf9" strokeWidth="1.5" strokeLinecap="square" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-[19px] font-semibold tracking-tight text-sidebar-foreground">
          BhuSatya
        </span>
        <span className="mt-1 text-[12px] tracking-[0.14em] text-sidebar-muted uppercase">
          Land Verification
        </span>
      </span>
    </span>
  )
}

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Primary" className="flex flex-col gap-0.5 px-3">
      {nav.map((item) => {
        const active = isActive(pathname, item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex items-center gap-3 rounded-md px-3 py-3.5 text-sm transition-colors',
              active
                ? 'bg-sidebar-accent font-medium text-sidebar-foreground'
                : 'text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
            )}
          >
            {active ? (
              <span
                aria-hidden
                className="absolute top-1.5 bottom-1.5 left-0 w-0.5 rounded-full bg-terracotta"
              />
            ) : null}
            <Icon className="size-4.5" aria-hidden />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarFooter() {
  return (
    <div className="mt-auto border-t border-sidebar-border px-5 py-4">
      <div className="flex items-center gap-2 text-sm text-sidebar-muted">
        <span aria-hidden className="size-1.5 rounded-full bg-[#6fae86]" />
        Registry connection healthy
      </div>
      <p className="mt-1 font-mono text-xs text-sidebar-muted/80">Last sync 09 Oct 2026, 09:58</p>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const crumbs = crumbsFor(pathname)

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar lg:flex">
        <div className="flex h-14 items-center border-b border-sidebar-border px-5">
          <Link href="/" aria-label="BhuSatya home">
            <BrandMark />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav pathname={pathname} />
        </div>
        <SidebarFooter />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-64 flex-col bg-sidebar shadow-sm">
            <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-5">
              <BrandMark />
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1 text-sidebar-muted hover:text-sidebar-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <SidebarNav pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </div>
            <SidebarFooter />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card px-4 sm:px-6">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            className="-ml-1 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex items-center gap-1.5 text-sm">
              <li className="hidden text-muted-foreground sm:block">BhuSatya</li>
              {crumbs.map((crumb, i) => {
                const last = i === crumbs.length - 1
                return (
                  <li key={crumb.label} className="flex min-w-0 items-center gap-1.5">
                    <ChevronRight
                      aria-hidden
                      className={cn('size-3.5 text-muted-foreground/60', i === 0 && 'hidden sm:block')}
                    />
                    {crumb.href && !last ? (
                      <Link href={crumb.href} className="text-muted-foreground hover:text-foreground">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        aria-current={last ? 'page' : undefined}
                        className={cn(
                          'truncate',
                          last ? 'font-medium text-foreground' : 'text-muted-foreground',
                          crumb.label.startsWith('BS-') && 'font-mono text-[13px]',
                        )}
                      >
                        {crumb.label}
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>

          <div className="hidden items-center gap-2 rounded-md border bg-muted/50 py-1 pr-3 pl-2 md:flex">
            <ShieldCheck className="size-4 text-forensic" aria-hidden />
            <span className="flex flex-col leading-tight">
              <span className="text-[10px] tracking-wider text-muted-foreground uppercase">Role</span>
              <span className="text-xs font-medium text-foreground">Government Verifier</span>
            </span>
          </div>

          <Link
            href="/verification/new"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'bg-terracotta px-3.5 text-white hover:bg-terracotta-hover',
            )}
          >
            <FilePlus2 aria-hidden />
            <span className="hidden sm:inline">New Verification</span>
            <span className="sm:hidden">New</span>
          </Link>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">{children}</main>
      </div>
    </div>
  )
}
