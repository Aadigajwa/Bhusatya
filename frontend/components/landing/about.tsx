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
      className="relative w-full py-24 sm:py-32 bg-[#0c1128] overflow-hidden"
      aria-label="About BhuSatya Platform"
    >
      {/* Center-Positioned Absolute Blurred Purple Circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

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
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 backdrop-blur-md">
              <Sparkles className="size-3.5 text-[#00f0ff]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#00f0ff]">
                The Mission of BhuSatya
              </span>
            </div>

            <h2 className="font-outfit font-black tracking-tighter text-4xl sm:text-5xl md:text-6xl text-white leading-[1.1]">
              Integrity is not just what is printed on paper.{' '}
              <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                It is the legal truth of the land.
              </span>
            </h2>

            <div className="mt-8 relative rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md max-w-lg">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-white/10 text-[#00f0ff]">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <h3 className="font-outfit font-bold text-base text-white">
                    Uncompromising Land Record Truth
                  </h3>
                  <p className="font-outfit text-xs text-gray-400">
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
              <p className="font-outfit text-base sm:text-lg font-light leading-relaxed text-gray-300">
                Land conflicts and counterfeit stamp papers tie up hundreds of thousands of crores in legal paralysis, disproportionately impacting vulnerable landowners. Criminal cartels exploit physical paper vulnerabilities by altering monetary figures, swapping stamp paper headers, and fabricating synthetic biometric imprints.
              </p>
              <p className="font-outfit text-base sm:text-lg font-light leading-relaxed text-gray-300">
                <strong className="text-white font-semibold">BhuSatya</strong> bridges physical revenue stamps with digital registry truth. By combining computer vision with official Bhulekh 7/12 registries, we provide district officials with undeniable scientific evidence within seconds of scanning.
              </p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 gap-6 sm:gap-8 pt-8 border-t border-white/10">
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
                      <Icon className="size-4 text-[#00f0ff]" />
                      <span className="font-outfit font-black tracking-tight text-3xl sm:text-4xl lg:text-5xl text-white">
                        {stat.value}
                      </span>
                    </div>
                    <span className="font-outfit font-semibold text-sm sm:text-base text-gray-200">
                      {stat.label}
                    </span>
                    <span className="font-outfit text-xs text-gray-500 mt-0.5">
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
