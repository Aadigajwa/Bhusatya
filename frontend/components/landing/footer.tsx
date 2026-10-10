'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  FileCheck2,
  Cpu,
  Mail,
  Scale,
} from 'lucide-react'

export function Footer() {
  return (
    <footer
      id="contact"
      className="relative w-full border-t border-white/10 bg-[#0c1128] pt-24 sm:pt-32 pb-12 overflow-hidden text-white"
      aria-label="Footer"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Massive Bold CTA Headline Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center text-center pb-20 sm:pb-28 border-b border-white/10"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 backdrop-blur-md">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
              Zero Tolerance for Land Title Forgery
            </span>
          </div>

          <h2 className="font-outfit font-black tracking-tighter text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white max-w-5xl leading-[1.05]">
            Secure Every Deed. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
              Protect the Truth.
            </span>
          </h2>

          <p className="mt-6 max-w-xl font-outfit text-base sm:text-lg font-light leading-relaxed text-gray-300">
            Equip your revenue department or legal practice with neural forensic computer vision to detect forged deeds, tampered stamps, and fake thumb impressions instantly.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/verification/new"
              className="group inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-3.5 font-outfit text-base font-bold text-black shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-gray-100"
            >
              Verify a Document Now
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 font-outfit text-base font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:scale-105 active:scale-95"
            >
              <Cpu className="size-4 text-[#00f0ff]" />
              Live Command Center
            </Link>
          </div>
        </motion.div>

        {/* 4-Column Links Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
          {/* Column 1: Brand Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">
              <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-emerald-500 p-[1px]">
                <div className="flex size-full items-center justify-center rounded-full bg-[#0c1128]">
                  <ShieldCheck className="size-3.5 text-[#00f0ff]" />
                </div>
              </div>
              <span className="font-outfit font-extrabold tracking-tight text-white">
                BhuSatya<span className="text-[#00f0ff]">.ai</span>
              </span>
            </div>
            <p className="font-outfit text-sm font-light text-gray-400 leading-relaxed">
              India&apos;s pioneering AI-powered forensic document analysis and land registry verification platform for state revenue officers and legal verifiers.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400 mt-2">
              <Mail className="size-3.5 text-[#00f0ff]" />
              <span>contact@bhusatya.gov.in</span>
            </div>
          </div>

          {/* Column 2: Platform Navigation */}
          <div className="flex flex-col gap-3">
            <span className="font-outfit text-xs font-bold uppercase tracking-widest text-gray-400">
              Platform Modules
            </span>
            <ul className="flex flex-col gap-2.5 pt-2">
              {[
                { label: 'Live Command Center', href: '/dashboard' },
                { label: 'Upload & Verify Document', href: '/verification/new' },
                { label: 'Forensic Investigation Queue', href: '/reports' },
                { label: 'System Configuration', href: '/settings' },
                { label: 'Case BS-STAMP-DOC-1', href: '/reports/BS-STAMP-DOC-1' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group relative inline-block font-outfit text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-[#00f0ff] transition-all duration-300 group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Forensic Screening Suite */}
          <div className="flex flex-col gap-3">
            <span className="font-outfit text-xs font-bold uppercase tracking-widest text-gray-400">
              Forensic Capabilities
            </span>
            <ul className="flex flex-col gap-2.5 pt-2">
              {[
                'Typography & Stroke Weight Forensics',
                'Galton Biometric Minutiae Audit',
                'Error Level Analysis (ELA) Heatmaps',
                'Treasury Stamp & Seal Validation',
                'Bhulekh 7/12 Land Registry Match',
              ].map((cap) => (
                <li key={cap} className="font-outfit text-sm text-gray-400">
                  {cap}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal & Regulatory Compliance */}
          <div className="flex flex-col gap-3">
            <span className="font-outfit text-xs font-bold uppercase tracking-widest text-gray-400">
              Legal Compliance
            </span>
            <p className="font-outfit text-xs text-gray-400 leading-relaxed pt-1">
              Compliant with Section 65B of the Indian Evidence Act for admissible electronic forensic certificates.
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs text-gray-400 font-mono">
              <div className="flex items-center gap-2">
                <Scale className="size-3.5 text-emerald-400" />
                <span>Section 65B Evidence Act</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck2 className="size-3.5 text-blue-400" />
                <span>DILRMP Standard v3.2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Policies */}
        <div className="pt-8 mt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-outfit text-gray-500">
          <p>© {new Date().getFullYear()} BhuSatya Land Intelligence & Revenue Forensics. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/reports" className="hover:text-gray-300 transition-colors">
              Forensic Reports
            </Link>
            <Link href="/dashboard" className="hover:text-gray-300 transition-colors">
              Command Center
            </Link>
            <Link href="/settings" className="hover:text-gray-300 transition-colors">
              Settings & Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
