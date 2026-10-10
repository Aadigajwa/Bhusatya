'use client'

import { motion } from 'framer-motion'
import {
  Type,
  Fingerprint,
  Layers,
  Database,
  ArrowUpRight,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react'
import Link from 'next/link'

const capabilities = [
  {
    id: 'typography-forensics',
    title: 'Typography & Font Forensics',
    category: 'Digital Alteration Detection',
    description:
      'Statistical micro-analysis of glyph stroke weights, slant angles, and baseline offsets. Detects modern digital fonts secretly patched onto authentic letterpress stamp templates.',
    features: [
      'Stroke Weight Outliers (z-score > 3.0)',
      'Baseline Step Discontinuities (+3.2px)',
      'Mixed Typeface Splicing (Sans vs Serif)',
      'Regional Glyph Anomalies (ऱ vs ₹)',
    ],
    icon: Type,
    accent: 'from-blue-500/30 to-cyan-500/10',
    iconColor: 'text-[#00f0ff]',
  },
  {
    id: 'biometrics-seals',
    title: 'Biometric Minutiae & Seals',
    category: 'Counterfeit Imprint Screening',
    description:
      'Examines Galton ridge minutiae on party thumb impressions (अंगूठा निशान) to detect synthetic AI prints, dermal pore absence, and counterfeit state emblems or altered mottos.',
    features: [
      'Ridge Bifurcation Continuity Checks',
      'Artificial Ink Density Uniformity',
      'National Emblem Motto Audit (सत्यमेव)',
      'Treasury Seal Star Marker (*) Inspection',
    ],
    icon: Fingerprint,
    accent: 'from-purple-500/30 to-pink-500/10',
    iconColor: 'text-[#b026ff]',
  },
  {
    id: 'ela-splicing',
    title: 'Error Level Analysis (ELA)',
    category: 'Digital Compression Forensics',
    description:
      'Multi-spectral quantization analysis detecting resaved image editing layers, digital paste boundaries, and generative AI inpainting artifacts invisible to the naked eye.',
    features: [
      'High-Frequency ELA Heatmap Noise',
      'Cut-and-Paste Perimeter Gradients',
      'Generative Canvas Resolution (1024×1536)',
      'Copy-Move & Cloning Detection',
    ],
    icon: Layers,
    accent: 'from-indigo-500/30 to-blue-500/10',
    iconColor: 'text-indigo-400',
  },
  {
    id: 'registry-crosscheck',
    title: 'Bhulekh 7/12 Registry Cross-Check',
    category: 'State Land Records Matching',
    description:
      'Automated semantic comparison comparing deed clauses against official government land records to catch unauthorized land area expansions, fictitious survey numbers, and fake mutation entries.',
    features: [
      'Survey / Gat Number Validation',
      'Land Area Inflation Checks (2.50 vs 2.18 ha)',
      'Occupant / Owner Name Cross-Match',
      'Mutation Entry No. Integrity',
    ],
    icon: Database,
    accent: 'from-emerald-500/30 to-teal-500/10',
    iconColor: 'text-emerald-400',
  },
]

export function Services() {
  return (
    <section
      id="capabilities"
      className="relative w-full py-24 sm:py-32 bg-[#0c1128] overflow-hidden"
      aria-label="Capabilities Section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-start mb-16 sm:mb-20 max-w-3xl"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 backdrop-blur-md">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00f0ff]">
              Forensic Suite
            </span>
          </div>

          <h2 className="font-outfit font-black tracking-tighter text-3xl sm:text-5xl md:text-6xl text-white leading-[1.1]">
            Capabilities Built Specifically for Land Record Verification
          </h2>

          <p className="mt-6 font-outfit text-base sm:text-lg font-light leading-relaxed text-gray-300">
            Engineered to assist sub-registrars, revenue officers, and forensic investigators in identifying high-stakes forgery before fraudulent mutations are registered.
          </p>
        </motion.div>

        {/* 2x2 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {capabilities.map((service, index) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-10 backdrop-blur-md transition-all duration-500 hover:border-white/20 hover:bg-white/[0.08] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              >
                {/* Quarter-Circle Icon Container situated in top-right corner */}
                <div className="absolute top-0 right-0 size-28 sm:size-32 rounded-bl-full bg-gradient-to-bl from-white/10 via-white/5 to-transparent flex items-start justify-end p-5 transition-transform duration-500 group-hover:scale-105">
                  <div className="flex size-11 sm:size-12 items-center justify-center rounded-full bg-[#0c1128]/90 border border-white/10 shadow-lg">
                    <Icon className={`size-5 sm:size-6 ${service.iconColor}`} />
                  </div>
                </div>

                {/* Card Content */}
                <div className="relative z-10 pr-16 sm:pr-20">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    {service.category}
                  </span>
                  <h3 className="mt-3 font-outfit font-black text-2xl sm:text-3xl text-white tracking-tight group-hover:text-blue-200 transition-colors">
                    {service.title}
                  </h3>
                  <p className="mt-4 font-outfit text-sm sm:text-base font-light leading-relaxed text-gray-300">
                    {service.description}
                  </p>
                </div>

                {/* Features Pill List & Live Action */}
                <div className="relative z-10 mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {service.features.map((feat) => (
                      <span
                        key={feat}
                        className="rounded-full bg-white/5 px-3 py-1 font-outfit text-xs font-medium text-gray-400 border border-white/5"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>

                  <Link
                    href="/verification/new"
                    className="inline-flex items-center gap-1.5 font-outfit text-xs font-bold uppercase tracking-wider text-white hover:text-[#00f0ff] transition-colors"
                  >
                    Test Feature
                    <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>

                {/* Subtle corner hover illumination */}
                <div
                  className={`absolute -bottom-20 -left-20 size-48 rounded-full bg-gradient-to-tr ${service.accent} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}
                />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
