'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowUpRight, ShieldCheck, FileSearch, Sparkles } from 'lucide-react'

const navLinks = [
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'About BhuSatya', href: '#about' },
  { label: 'Verification Queue', href: '/reports' },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { scrollY } = useScroll()

  // Navbar Scroll Blur: [0, 50] pixels transition
  const bgOpacity = useTransform(scrollY, [0, 50], [0.02, 0.08])
  const blurAmount = useTransform(scrollY, [0, 50], [8, 24])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl"
    >
      <motion.nav
        className={`w-full border border-[#e6e2d8] shadow-[0_12px_40px_0_rgba(42,33,27,0.12)] backdrop-blur-2xl transition-all duration-300 ${
          mobileMenuOpen
            ? 'rounded-3xl bg-[#fbfbf9]/95 p-5'
            : 'rounded-full bg-[#fbfbf9]/85 px-4 py-2.5 sm:px-6'
        }`}
        aria-label="Main Navigation"
      >
        <div className="flex items-center justify-between">
          {/* BhuSatya Brand Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-black text-xl tracking-tighter text-[#2a211b] transition-opacity hover:opacity-90"
          >
            <div className="relative flex size-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#b34e2b] via-[#9c4222] to-[#3b2b21] p-[1px] shadow-[0_0_15px_rgba(179,78,43,0.3)]">
              <div className="flex size-full items-center justify-center rounded-full bg-[#fbfbf9]">
                <ShieldCheck className="size-4.5 text-[#b34e2b] transition-transform duration-500 group-hover:scale-110" />
              </div>
            </div>
            <div className="flex flex-col text-left leading-none">
              <span className="font-outfit font-extrabold tracking-tight text-lg text-[#2a211b]">
                BhuSatya<span className="text-[#b34e2b]">.ai</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#6b6158] font-mono">
                Land Forensics
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group relative font-outfit text-sm font-medium text-[#6b6158] transition-colors hover:text-[#2a211b] py-1"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-gradient-to-r from-[#b34e2b] to-[#9c4222] transition-all duration-300 ease-out group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Right Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/dashboard"
              className="group text-xs font-semibold tracking-wider uppercase text-[#6b6158] hover:text-[#b34e2b] transition-colors px-3 py-1.5 flex items-center gap-1.5"
            >
              <span className="size-1.5 rounded-full bg-[#2f6b46] animate-pulse" />
              Command Center
            </Link>
            <Link
              href="/verification/new"
              className="group relative inline-flex items-center gap-2 rounded-full bg-[#b34e2b] px-5 py-2 font-outfit text-sm font-bold text-white shadow-[0_0_20px_rgba(179,78,43,0.25)] transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-[#9c4222]"
            >
              Verify Document
              <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden size-9 items-center justify-center rounded-full border border-[#e6e2d8] bg-[#f3f1ea] text-[#6b6158] hover:text-[#2a211b]"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex flex-col gap-4 pt-5 pb-2 md:hidden"
            >
              <div className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-outfit text-base font-medium text-[#6b6158] hover:text-[#2a211b] transition-colors px-2 py-1.5 rounded-lg hover:bg-[#f3f1ea]"
                  >
                    {link.label}
                  </a>
                ))}
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-outfit text-base font-medium text-[#b34e2b] px-2 py-1.5 rounded-lg hover:bg-[#f3f1ea] flex items-center justify-between"
                >
                  Live Command Center
                  <ArrowUpRight className="size-4" />
                </Link>
                <Link
                  href="/reports"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-outfit text-base font-medium text-[#6b6158] px-2 py-1.5 rounded-lg hover:bg-[#f3f1ea] flex items-center justify-between"
                >
                  Forensic Review Queue
                  <FileSearch className="size-4" />
                </Link>
              </div>

              <div className="pt-2 border-t border-[#e6e2d8]">
                <Link
                  href="/verification/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#b34e2b] py-3 font-outfit text-sm font-bold text-white shadow-[0_0_20px_rgba(179,78,43,0.2)]"
                >
                  Start New Verification
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </motion.header>
  )
}
