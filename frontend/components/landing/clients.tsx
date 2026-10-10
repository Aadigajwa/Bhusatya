'use client'

import { motion } from 'framer-motion'
import {
  Landmark,
  Scale,
  FileCheck2,
  Building2,
  Database,
  ShieldCheck,
  ScrollText,
  Cpu,
  Sparkles,
} from 'lucide-react'

const institutionalPartners = [
  { name: 'Dept. of Land Resources (DoLR)', icon: Landmark },
  { name: 'Inspector General of Registration (IGR)', icon: Scale },
  { name: 'Bhulekh 7/12 National Registry', icon: Database },
  { name: 'Digital India Land Records (DILRMP)', icon: FileCheck2 },
  { name: 'State Revenue & Stamp Tribunals', icon: Building2 },
  { name: 'National Forensic Science Labs', icon: ShieldCheck },
  { name: 'Sub-Registrar District Offices', icon: ScrollText },
  { name: 'NIC Revenue Cloud Systems', icon: Cpu },
]

export function Clients() {
  const tickerItems = [...institutionalPartners, ...institutionalPartners, ...institutionalPartners]

  return (
    <section className="relative w-full py-24 sm:py-32 bg-[#0c1128] overflow-hidden" aria-label="Institutional Reach">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300 backdrop-blur-md">
            <Sparkles className="size-3" />
            Institutional Grade
          </span>
          <h2 className="font-outfit text-sm sm:text-base font-semibold tracking-wider uppercase text-gray-400">
            Trusted across 300+ District Collectorates & Revenue Tehsils
          </h2>
        </motion.div>
      </div>

      {/* Infinite Ticker Container with Left & Right Gradient Mask Edges */}
      <div className="relative w-full overflow-hidden">
        {/* Left Gradient Mask */}
        <div className="absolute top-0 left-0 z-10 h-full w-24 sm:w-48 bg-gradient-to-r from-[#0c1128] via-[#0c1128]/80 to-transparent pointer-events-none" />

        {/* Right Gradient Mask */}
        <div className="absolute top-0 right-0 z-10 h-full w-24 sm:w-48 bg-gradient-to-l from-[#0c1128] via-[#0c1128]/80 to-transparent pointer-events-none" />

        {/* Moving Ticker Track */}
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: 40,
            ease: 'linear',
            repeat: Infinity,
          }}
          className="flex items-center gap-8 sm:gap-14 w-max"
        >
          {tickerItems.map((partner, idx) => {
            const Icon = partner.icon
            return (
              <div
                key={`${partner.name}-${idx}`}
                className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-6 py-3.5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div className="flex size-8 items-center justify-center rounded-xl bg-white/5 text-gray-400 transition-colors duration-300 group-hover:text-[#00f0ff] group-hover:bg-gradient-to-tr group-hover:from-blue-500/20 group-hover:to-cyan-500/20">
                  <Icon className="size-4.5" />
                </div>
                <span className="font-outfit text-sm sm:text-base font-bold tracking-tight text-gray-300 transition-colors duration-300 group-hover:text-white whitespace-nowrap">
                  {partner.name}
                </span>
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
