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
      className="relative w-full border-t border-[#3d3129] bg-[#2a211b] pt-24 sm:pt-32 pb-12 overflow-hidden text-[#ece7dd]"
      aria-label="Footer"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#b34e2b]/5 via-[#3b2b21]/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Massive Bold CTA Headline Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center text-center pb-20 sm:pb-28 border-b border-[#3d3129]"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2f6b46]/30 bg-[#2f6b46]/10 px-4 py-1.5 backdrop-blur-md">
            <ShieldCheck className="size-3.5 text-[#2f6b46]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#e6f0e8]">
              Zero Tolerance for Land Title Forgery
            </span>
          </div>

          <h2 className="font-outfit font-black tracking-tighter text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-[#fbfbf9] max-w-5xl leading-[1.05]">
            Secure Every Deed. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#d9d4c7] via-[#b34e2b] to-[#9c4222] bg-clip-text text-transparent">
              Protect the Truth.
            </span>
          </h2>

          <p className="mt-6 max-w-xl font-outfit text-base sm:text-lg font-light leading-relaxed text-[#a99f92]">
            Equip your revenue department or legal practice with neural forensic computer vision to detect forged deeds, tampered stamps, and fake thumb impressions instantly.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/verification/new"
              className="group inline-flex items-center gap-2.5 rounded-full bg-[#b34e2b] px-8 py-3.5 font-outfit text-base font-bold text-white shadow-[0_0_30px_rgba(179,78,43,0.25)] transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-[#9c4222]"
            >
              Verify a Document Now
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-[#ece7dd]/20 bg-[#ece7dd]/5 px-7 py-3.5 font-outfit text-base font-semibold text-[#ece7dd] backdrop-blur-md transition-all duration-300 hover:border-[#ece7dd]/40 hover:bg-[#ece7dd]/10 hover:scale-105 active:scale-95"
            >
              <Cpu className="size-4 text-[#b34e2b]" />
              Live Command Center
            </Link>
          </div>
        </motion.div>

        {/* 4-Column Links Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
          {/* Column 1: Brand Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">
              <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-tr from-[#b34e2b] to-[#2f6b46] p-[1px]">
                <div className="flex size-full items-center justify-center rounded-full bg-[#2a211b]">
                  <ShieldCheck className="size-3.5 text-[#b34e2b]" />
                </div>
              </div>
              <span className="font-outfit font-extrabold tracking-tight text-[#fbfbf9]">
                BhuSatya<span className="text-[#b34e2b]">.ai</span>
              </span>
            </div>
            <p className="font-outfit text-sm font-light text-[#a99f92] leading-relaxed">
              India&apos;s pioneering AI-powered forensic document analysis and land registry verification platform for state revenue officers and legal verifiers.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-[#a99f92] mt-2">
              <Mail className="size-3.5 text-[#b34e2b]" />
              <span>contact@bhusatya.gov.in</span>
            </div>
          </div>

          {/* Column 2: Platform Navigation */}
          <div className="flex flex-col gap-3">
            <span className="font-outfit text-xs font-bold uppercase tracking-widest text-[#a99f92]">
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
                    className="group relative inline-block font-outfit text-sm text-[#d9d4c7] hover:text-[#fbfbf9] transition-colors"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-[#b34e2b] transition-all duration-300 group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Forensic Screening Suite */}
          <div className="flex flex-col gap-3">
            <span className="font-outfit text-xs font-bold uppercase tracking-widest text-[#a99f92]">
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
                <li key={cap} className="font-outfit text-sm text-[#a99f92]">
                  {cap}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal & Regulatory Compliance */}
          <div className="flex flex-col gap-3">
            <span className="font-outfit text-xs font-bold uppercase tracking-widest text-[#a99f92]">
              Legal Compliance
            </span>
            <p className="font-outfit text-xs text-[#a99f92] leading-relaxed pt-1">
              Compliant with Section 65B of the Indian Evidence Act for admissible electronic forensic certificates.
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs text-[#a99f92] font-mono">
              <div className="flex items-center gap-2">
                <Scale className="size-3.5 text-[#2f6b46]" />
                <span>Section 65B Evidence Act</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck2 className="size-3.5 text-[#b34e2b]" />
                <span>DILRMP Standard v3.2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Policies */}
        <div className="pt-8 mt-4 border-t border-[#3d3129] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-outfit text-[#6b6158]">
          <p>© {new Date().getFullYear()} BhuSatya Land Intelligence & Revenue Forensics. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/reports" className="hover:text-[#d9d4c7] transition-colors">
              Forensic Reports
            </Link>
            <Link href="/dashboard" className="hover:text-[#d9d4c7] transition-colors">
              Command Center
            </Link>
            <Link href="/settings" className="hover:text-[#d9d4c7] transition-colors">
              Settings & Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
