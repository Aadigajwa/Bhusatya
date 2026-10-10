'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown, ShieldAlert, ShieldCheck, FileCheck2, Cpu, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Circular lens/mask expands fully over the entire scroll range
  const circleRadius = useTransform(scrollYProgress, [0, 1], [0, 150])
  const clipPath = useTransform(circleRadius, (r) => `circle(${r}% at 50% 50%)`)

  // Background subtle zoom
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.12])

  // Text cross-fade: base fades out in first 35%, reveal comes in from 30% to 65%
  const baseTextOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0])
  const baseTextY = useTransform(scrollYProgress, [0, 0.35], [0, -30])

  const revealTextOpacity = useTransform(scrollYProgress, [0.30, 0.65], [0, 1])
  const revealTextY = useTransform(scrollYProgress, [0.30, 0.65], [30, 0])

  // Scroll prompt indicator fades out quickly on first scroll
  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])

  return (
    <section
      ref={containerRef}
      className="relative h-[200vh] w-full bg-[#3b2b21]"
      aria-label="Hero Section"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* ============================================================== */}
        {/* BACKGROUND LAYERS WITH SCROLL-BASED CIRCULAR MASK */}
        {/* ============================================================== */}

        {/* 1. Base Background: City/Cadastral Sketch with Dark Overlay */}
        <div className="absolute inset-0 size-full overflow-hidden pointer-events-none">
          <motion.div
            style={{ scale: imageScale }}
            className="absolute inset-0 size-full"
          >
            <img
              src="https://strvid.nyc3.cdn.digitaloceanspaces.com/cloudinary/hero_city_outline_fzg37d.jpg"
              alt="Cadastral land boundaries and urban layout sketch"
              className="size-full object-cover object-center opacity-35 filter contrast-125"
            />
            {/* Dark gradient to ensure high contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#3b2b21] via-[#3b2b21]/70 to-[#3b2b21]" />
          </motion.div>

          {/* Forensic HUD scanlines grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>

        {/* 2. Top Background Layer: Revealed via Circular Lens Mask */}
        <motion.div
          style={{ clipPath }}
          className="absolute inset-0 size-full overflow-hidden pointer-events-none z-10"
        >
          <motion.div
            style={{ scale: imageScale }}
            className="absolute inset-0 size-full"
          >
            <img
              src="https://strvid.nyc3.cdn.digitaloceanspaces.com/cloudinary/hero_city_iglhwn.jpg"
              alt="Illuminated smart city digital revenue infrastructure"
              className="size-full object-cover object-center opacity-95 filter saturate-125 contrast-105"
            />
            {/* Vibrant cinematic grade preserving rich colors while maintaining clean text contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#2a211b]/45 via-black/15 to-[#3b2b21]/75" />
          </motion.div>

          {/* Circular lens ring border glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(179,78,43,0.12)_60%,transparent_70%)] pointer-events-none" />
        </motion.div>

        {/* ============================================================== */}
        {/* FOREGROUND CONTENT (POSITIONED WITH CLEARANCE BELOW NAVBAR) */}
        {/* ============================================================== */}
        <div className="relative z-20 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-16">
          <div className="relative w-full max-w-5xl mx-auto flex items-center justify-center text-center">

            {/* BASE STATE CONTENT: "Detect Fraud. Unmask Forgery." */}
            <motion.div
              style={{
                opacity: baseTextOpacity,
                y: baseTextY,
                pointerEvents: scrollYProgress.get() > 0.25 ? 'none' : 'auto',
              }}
              className="flex flex-col items-center justify-center w-full"
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#a8352a]/30 bg-[#a8352a]/10 px-4 py-1.5 backdrop-blur-md">
                <ShieldAlert className="size-3.5 text-[#a8352a]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#f8e6e3]">
                  AI Land Document Forensics
                </span>
              </div>

              {/* ONLY ONE <h1> TAG ON PAGE */}
              <h1 className="font-outfit font-black tracking-tighter leading-[1.08] text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] text-[#fbfbf9] uppercase drop-shadow-lg max-w-4xl">
                Detect Fraud. <br />
                <span className="bg-gradient-to-r from-[#fbfbf9] via-[#e6e2d8] to-[#a99f92] bg-clip-text text-transparent">
                  Unmask Forgery.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl font-outfit text-sm sm:text-base md:text-lg font-light leading-relaxed text-[#d9d4c7]">
                Multi-spectrum neural vision detecting forged stamp paper headers, synthetic thumb minutiae, stroke weight anomalies, and tampered consideration figures in real-time.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/verification/new"
                  className="inline-flex items-center gap-2 rounded-full bg-[#b34e2b] px-7 py-3 font-outfit text-sm font-bold text-white shadow-[0_0_25px_rgba(179,78,43,0.35)] hover:bg-[#9c4222] hover:scale-105 active:scale-95 transition-all"
                >
                  <Cpu className="size-4" />
                  Upload Stamp Document
                  <ArrowUpRight className="size-3.5" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full border border-[#fbfbf9]/20 bg-[#fbfbf9]/5 px-6 py-3 font-outfit text-sm font-semibold text-[#fbfbf9] backdrop-blur-md hover:border-[#fbfbf9]/40 hover:bg-[#fbfbf9]/10 hover:scale-105 active:scale-95 transition-all"
                >
                  Explore Command Center
                </Link>
              </div>
            </motion.div>

            {/* REVEAL STATE CONTENT: "Verify the Truth. Secure Every Title." */}
            <motion.div
              style={{
                opacity: revealTextOpacity,
                y: revealTextY,
                pointerEvents: scrollYProgress.get() <= 0.25 ? 'none' : 'auto',
              }}
              className="absolute inset-0 flex flex-col items-center justify-center w-full"
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2f6b46]/30 bg-[#2f6b46]/10 px-4 py-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(47,107,70,0.2)]">
                <ShieldCheck className="size-3.5 text-[#2f6b46]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#e6f0e8]">
                  Official Bhulekh Registry Verified
                </span>
              </div>

              <div className="font-outfit font-black tracking-tighter leading-[1.08] text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] uppercase max-w-4xl drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)] bg-gradient-to-r from-[#e6f0e8] via-[#fbfbf9] to-[#d9d4c7] bg-clip-text text-transparent">
                Verify the Truth. <br />
                Secure Every Title.
              </div>

              <p className="mt-5 max-w-2xl font-outfit text-sm sm:text-base md:text-lg font-light leading-relaxed text-[#e6e2d8] drop-shadow-md">
                Instant automated cross-check against 7/12 land records, mutation numbers, authentic treasury emblems, and registered occupant titles.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/verification/new"
                  className="inline-flex items-center gap-2 rounded-full bg-[#2f6b46] px-7 py-3 font-outfit text-sm font-bold text-white shadow-[0_0_25px_rgba(47,107,70,0.4)] hover:bg-[#256b3a] hover:scale-105 active:scale-95 transition-all"
                >
                  <FileCheck2 className="size-4" />
                  Run Live Forensic Audit
                  <ArrowUpRight className="size-3.5" />
                </Link>
                <Link
                  href="/reports"
                  className="inline-flex items-center gap-2 rounded-full border border-[#fbfbf9]/20 bg-[#fbfbf9]/5 px-6 py-3 font-outfit text-sm font-semibold text-[#fbfbf9] backdrop-blur-md hover:border-[#fbfbf9]/40 hover:bg-[#fbfbf9]/10 hover:scale-105 active:scale-95 transition-all"
                >
                  Inspect Case Reports
                </Link>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Scroll Indicator at Bottom Center */}
        <motion.div
          style={{ opacity: indicatorOpacity }}
          className="relative z-20 pb-8 flex flex-col items-center justify-center gap-1.5 pointer-events-none"
        >
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#b34e2b] font-mono">
            Scroll to reveal forensic lens
          </span>
          <div className="flex size-7 items-center justify-center rounded-full border border-[#fbfbf9]/20 bg-[#fbfbf9]/5 backdrop-blur-md animate-bounce text-[#fbfbf9]">
            <ChevronDown className="size-3.5" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
