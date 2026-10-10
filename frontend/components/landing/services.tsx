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
    accent: 'from-[#b34e2b]/20 to-[#b34e2b]/5',
    iconColor: 'text-[#b34e2b]',
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
    accent: 'from-[#3b2b21]/20 to-[#3b2b21]/5',
    iconColor: 'text-[#3b2b21]',
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
    accent: 'from-[#8a5a0b]/20 to-[#8a5a0b]/5',
    iconColor: 'text-[#8a5a0b]',
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
    accent: 'from-[#2f6b46]/20 to-[#2f6b46]/5',
    iconColor: 'text-[#2f6b46]',
  },
]

export function Services() {
  return (
    <section
      id="capabilities"
      className="relative w-full py-24 sm:py-32 bg-[#fbfbf9] overflow-hidden"
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
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e6e2d8] bg-[#f3f1ea] px-3.5 py-1 backdrop-blur-md">
            <span className="text-xs font-bold uppercase tracking-widest text-[#b34e2b]">
              Forensic Suite
            </span>
          </div>

          <h2 className="font-outfit font-black tracking-tighter text-3xl sm:text-5xl md:text-6xl text-[#2a211b] leading-[1.1]">
            Capabilities Built Specifically for Land Record Verification
          </h2>

          <p className="mt-6 font-outfit text-base sm:text-lg font-light leading-relaxed text-[#6b6158]">
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
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#e6e2d8] bg-[#fbfbf9] p-8 sm:p-10 backdrop-blur-md transition-all duration-500 hover:border-[#d9d4c7] hover:bg-[#f3f1ea]/50 hover:shadow-[0_20px_50px_rgba(42,33,27,0.08)]"
              >
                {/* Quarter-Circle Icon Container situated in top-right corner */}
                <div className="absolute top-0 right-0 size-28 sm:size-32 rounded-bl-full bg-gradient-to-bl from-[#f0ede5] via-[#f3f1ea]/50 to-transparent flex items-start justify-end p-5 transition-transform duration-500 group-hover:scale-105">
                  <div className="flex size-11 sm:size-12 items-center justify-center rounded-full bg-[#fbfbf9] border border-[#e6e2d8] shadow-lg">
                    <Icon className={`size-5 sm:size-6 ${service.iconColor}`} />
                  </div>
                </div>

                {/* Card Content */}
                <div className="relative z-10 pr-16 sm:pr-20">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#a99f92]">
                    {service.category}
                  </span>
                  <h3 className="mt-3 font-outfit font-black text-2xl sm:text-3xl text-[#2a211b] tracking-tight group-hover:text-[#3b2b21] transition-colors">
                    {service.title}
                  </h3>
                  <p className="mt-4 font-outfit text-sm sm:text-base font-light leading-relaxed text-[#6b6158]">
                    {service.description}
                  </p>
                </div>

                {/* Features Pill List & Live Action */}
                <div className="relative z-10 mt-8 pt-6 border-t border-[#e6e2d8] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {service.features.map((feat) => (
                      <span
                        key={feat}
                        className="rounded-full bg-[#f3f1ea] px-3 py-1 font-outfit text-xs font-medium text-[#6b6158] border border-[#e6e2d8]"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>

                  <Link
                    href="/verification/new"
                    className="inline-flex items-center gap-1.5 font-outfit text-xs font-bold uppercase tracking-wider text-[#2a211b] hover:text-[#b34e2b] transition-colors"
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
