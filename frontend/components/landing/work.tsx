'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Sparkles, ExternalLink, ShieldAlert, Fingerprint, Type, Layers, Database } from 'lucide-react'
import Link from 'next/link'

interface ForensicCase {
  id: string
  reportId: string
  title: string
  verdict: string
  category: string
  riskScore: number
  image: string
  description: string
  icon: typeof ShieldAlert
  tags: string[]
}

const forensicCases: ForensicCase[] = [
  {
    id: 'case-stamp-1',
    reportId: 'BS-STAMP-DOC-1',
    title: 'Stamp Doc 1: Biometric Thumb Forgery',
    verdict: 'HIGH RISK (TAMPERED)',
    category: 'Biometric Minutiae Analysis',
    riskScore: 78,
    image: '/stamp_doc_1_annotated.png',
    description:
      'Identified 0 authentic bifurcations on primary party left thumb impression. Uniform digital density profile contradicts physical skin-ink capillary contact.',
    icon: Fingerprint,
    tags: ['Synthetic Minutiae', '0 Authentic Bifurcations', 'Capillary Flaw'],
  },
  {
    id: 'case-stamp-2',
    reportId: 'BS-STAMP-DOC-2',
    title: 'Stamp Doc 2: Denomination & Spliced Header',
    verdict: 'HIGH RISK (TAMPERED)',
    category: 'Typography & Header Splicing',
    riskScore: 82,
    image: '/stamp_doc_2_annotated.png',
    description:
      '14 critical red flags: Medallion numeral shrunk to ₹2500, state motto altered to \'संत्यमेव\', and spliced rectangular border on \'UTTAR PRADESH\'.',
    icon: Type,
    tags: ['Medallion Shrink -19.2%', 'Motto Spelling', 'Header Splice'],
  },
  {
    id: 'case-stamp-3',
    reportId: 'BS-STAMP-DOC-3',
    title: 'Stamp Doc 3: Fictitious Deed Consideration',
    verdict: 'HIGH RISK (TAMPERED)',
    category: 'Deed Typography & Endorsement',
    riskScore: 82,
    image: '/stamp_doc_3_annotated.png',
    description:
      'Consideration amount jumped +20.8% in font height breaking surrounding 12pt deed baseline, combined with counterfeit \'X\' treasury seal stamp.',
    icon: ShieldAlert,
    tags: ['Font Jump +20.8%', 'Seal Discontinuity', 'Deed Tampered'],
  },
  {
    id: 'case-stamp-ela',
    reportId: 'BS-STAMP-DOC-2',
    title: 'Multi-Spectrum ELA Compression Audit',
    verdict: 'FORENSIC ARTIFACTS CONFIRMED',
    category: 'Error Level Analysis (ELA)',
    riskScore: 92,
    image: '/stamp_doc_2_ela.png',
    description:
      'High-frequency ELA noise reveals localized image recreation on 1024×1536 px generative canvas contrasting authentic scanner 1012×1554 px ratio.',
    icon: Layers,
    tags: ['ELA Variance', 'Generative Canvas', 'Patch Gradients'],
  },
  {
    id: 'case-land-record',
    reportId: 'BS-2026-048',
    title: 'Kharadi 7/12 Land Record: Area Discrepancy',
    verdict: 'CRITICAL REGISTRY MISMATCH',
    category: 'State Land Registry Cross-Check',
    riskScore: 74,
    image: '/sample_doc.png',
    description:
      'Extracted deed area of 2.50 ha contradicted registered Bhulekh official record of 2.18 ha (+14.7% illegal inflation) situated on spliced paper grain.',
    icon: Database,
    tags: ['Area Mismatch (+14.7%)', 'Survey 142/3B', 'Baseline Offset +2.1px'],
  },
]

export function Work() {
  const [activeId, setActiveId] = useState<string>(forensicCases[1].id)

  return (
    <section
      id="cases"
      className="relative w-full py-24 sm:py-32 bg-[#0c1128] overflow-hidden"
      aria-label="Forensic Investigation Cases"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16"
        >
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 backdrop-blur-md">
              <Sparkles className="size-3.5 text-[#00f0ff]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#00f0ff]">
                Real-World Investigations
              </span>
            </div>
            <h2 className="font-outfit font-black tracking-tighter text-3xl sm:text-5xl md:text-6xl text-white">
              Featured Forensic Cases
            </h2>
          </div>

          <Link
            href="/reports"
            className="group inline-flex items-center gap-2 font-outfit text-sm font-semibold text-gray-300 hover:text-white transition-colors"
          >
            Browse All Reports
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </motion.div>

        {/* Expanding Flex Gallery: Accordion on hover */}
        <div className="flex flex-col md:flex-row gap-4 h-[680px] md:h-[500px] lg:h-[540px] w-full">
          {forensicCases.map((caseItem) => {
            const isActive = activeId === caseItem.id

            return (
              <motion.div
                key={caseItem.id}
                onMouseEnter={() => setActiveId(caseItem.id)}
                onClick={() => setActiveId(caseItem.id)}
                layout
                animate={{
                  flex: isActive ? 4 : 0.8,
                }}
                transition={{
                  duration: 0.6,
                  ease: [0.25, 1, 0.5, 1],
                }}
                className={`group relative overflow-hidden rounded-3xl border cursor-pointer select-none transition-colors duration-500 ${
                  isActive
                    ? 'border-[#00f0ff]/50 shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
                    : 'border-white/10 hover:border-white/25'
                }`}
              >
                {/* Background Annotated Image with slow hover zoom */}
                <div className="absolute inset-0 size-full overflow-hidden bg-black">
                  <img
                    src={caseItem.image}
                    alt={`${caseItem.title} - ${caseItem.category}`}
                    loading="lazy"
                    className="size-full object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                  {/* Atmospheric dark gradient overlays to make annotations pop and text legible */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-[#0c1128] via-[#0c1128]/75 to-black/30 transition-opacity duration-500 ${
                      isActive ? 'opacity-90' : 'opacity-80 group-hover:opacity-70'
                    }`}
                  />
                </div>

                {/* Inactive Vertical Title on Desktop */}
                {!isActive && (
                  <div className="hidden md:flex absolute inset-0 items-end justify-center p-6 pb-10 z-10 pointer-events-none">
                    <span className="font-outfit font-black text-lg text-white tracking-tight uppercase [writing-mode:vertical-rl] rotate-180 opacity-80 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {caseItem.title.split(':')[0]}
                    </span>
                  </div>
                )}

                {/* Active Content Reveal */}
                <div className="relative z-10 flex size-full flex-col justify-end p-6 sm:p-8 md:p-10">
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                        className="flex flex-col items-start gap-4 max-w-xl"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-red-500/20 px-3 py-1 font-outfit text-xs font-bold uppercase tracking-widest text-red-300 backdrop-blur-md border border-red-500/30">
                            {caseItem.verdict}
                          </span>
                          <span className="rounded-full bg-white/10 px-3 py-1 font-outfit text-xs font-medium text-gray-300 backdrop-blur-md border border-white/10">
                            Risk: {caseItem.riskScore}%
                          </span>
                        </div>

                        <div>
                          <h3 className="font-outfit font-black tracking-tight text-2xl sm:text-3xl lg:text-4xl text-white">
                            {caseItem.title}
                          </h3>
                          <p className="mt-1 font-outfit text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#00f0ff]">
                            {caseItem.category}
                          </p>
                        </div>

                        <p className="font-outfit text-xs sm:text-sm font-light text-gray-200 line-clamp-2 sm:line-clamp-3">
                          {caseItem.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-2">
                          <Link
                            href={`/reports/${caseItem.reportId}`}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 font-outfit text-xs sm:text-sm font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:bg-gray-100 transition-all hover:scale-105 active:scale-95"
                          >
                            Inspect Forensic Evidence
                            <ExternalLink className="size-3.5" />
                          </Link>

                          <div className="hidden sm:flex items-center gap-2">
                            {caseItem.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-mono text-gray-400 border border-white/5"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Fallback compact label for mobile when inactive */}
                  {!isActive && (
                    <div className="flex md:hidden items-center justify-between w-full">
                      <span className="font-outfit font-bold text-base text-white">
                        {caseItem.title}
                      </span>
                      <span className="text-xs text-red-400 font-mono font-semibold">
                        {caseItem.riskScore}% Risk
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
