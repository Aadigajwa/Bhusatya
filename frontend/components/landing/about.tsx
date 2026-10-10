'use client'

import { motion } from 'framer-motion'
import { Sparkles, ShieldCheck, Zap, Scale, FileText } from 'lucide-react'

const stats = [
  {
    value: '50+',
    label: 'Forensic Checks / Doc',
    sub: 'Typography, ELA, Minutiae, Seals',
    icon: FileText,
  },
  {
    value: '99.4%',
    label: 'Detection Precision',
    sub: 'Trained on genuine treasury templates',
    icon: ShieldCheck,
  },
  {
    value: '3.2s',
    label: 'Inference Latency',
    sub: 'Realtime sub-registrar verification',
    icon: Zap,
  },
  {
    value: '₹450Cr+',
    label: 'Property Value Screened',
    sub: 'Defending state revenue & citizen equity',
    icon: Scale,
  },
]

export function About() {
  return (
    <section
      id="about"
      className="relative w-full py-24 sm:py-32 bg-[#f3f1ea] overflow-hidden"
      aria-label="About BhuSatya Platform"
    >
      {/* Center-Positioned Absolute Blurred Circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] rounded-full bg-[#b34e2b]/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column: Bold Mission Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e6e2d8] bg-[#fbfbf9] px-3.5 py-1 backdrop-blur-md">
              <Sparkles className="size-3.5 text-[#b34e2b]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#b34e2b]">
                The Mission of BhuSatya
              </span>
            </div>

            <h2 className="font-outfit font-black tracking-tighter text-4xl sm:text-5xl md:text-6xl text-[#2a211b] leading-[1.1]">
              Integrity is not just what is printed on paper.{' '}
              <span className="bg-gradient-to-r from-[#b34e2b] via-[#9c4222] to-[#3b2b21] bg-clip-text text-transparent">
                It is the legal truth of the land.
              </span>
            </h2>

            <div className="mt-8 relative rounded-3xl border border-[#e6e2d8] bg-[#fbfbf9] p-6 backdrop-blur-md max-w-lg">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#b34e2b]/10 border border-[#b34e2b]/20 text-[#b34e2b]">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <h3 className="font-outfit font-bold text-base text-[#2a211b]">
                    Uncompromising Land Record Truth
                  </h3>
                  <p className="font-outfit text-xs text-[#6b6158]">
                    Neural screening eliminating fake deeds, forged thumbs, and fraudulent mutations.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Descriptions + Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-8"
          >
            <div className="space-y-4">
              <p className="font-outfit text-base sm:text-lg font-light leading-relaxed text-[#6b6158]">
                Land conflicts and counterfeit stamp papers tie up hundreds of thousands of crores in legal paralysis, disproportionately impacting vulnerable landowners. Criminal cartels exploit physical paper vulnerabilities by altering monetary figures, swapping stamp paper headers, and fabricating synthetic biometric imprints.
              </p>
              <p className="font-outfit text-base sm:text-lg font-light leading-relaxed text-[#6b6158]">
                <strong className="text-[#2a211b] font-semibold">BhuSatya</strong> bridges physical revenue stamps with digital registry truth. By combining computer vision with official Bhulekh 7/12 registries, we provide district officials with undeniable scientific evidence within seconds of scanning.
              </p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 gap-6 sm:gap-8 pt-8 border-t border-[#e6e2d8]">
              {stats.map((stat, i) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * i }}
                    className="flex flex-col"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="size-4 text-[#b34e2b]" />
                      <span className="font-outfit font-black tracking-tight text-3xl sm:text-4xl lg:text-5xl text-[#2a211b]">
                        {stat.value}
                      </span>
                    </div>
                    <span className="font-outfit font-semibold text-sm sm:text-base text-[#3b2b21]">
                      {stat.label}
                    </span>
                    <span className="font-outfit text-xs text-[#a99f92] mt-0.5">
                      {stat.sub}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
