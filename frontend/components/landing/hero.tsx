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
      className="relative h-[200vh] w-full bg-[#0c1128]"
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
            <div className="absolute inset-0 bg-gradient-to-b from-[#0c1128] via-[#0c1128]/70 to-[#0c1128]" />
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
              className="size-full object-cover object-center opacity-70"
            />
            {/* Cinematic dark grade */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0c1128]/90 via-[#0c1128]/50 to-[#0c1128]" />
            <div className="absolute inset-0 bg-[#0c1128]/40 backdrop-brightness-90" />
          </motion.div>

          {/* Circular lens ring border glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,240,255,0.08)_60%,transparent_70%)] pointer-events-none" />
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
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 backdrop-blur-md">
                <ShieldAlert className="size-3.5 text-red-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-red-300">
                  AI Land Document Forensics
                </span>
              </div>

              {/* ONLY ONE <h1> TAG ON PAGE */}
              <h1 className="font-outfit font-black tracking-tighter leading-[1.08] text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] text-white uppercase drop-shadow-lg max-w-4xl">
                Detect Fraud. <br />
                <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Unmask Forgery.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl font-outfit text-sm sm:text-base md:text-lg font-light leading-relaxed text-gray-300">
                Multi-spectrum neural vision detecting forged stamp paper headers, synthetic thumb minutiae, stroke weight anomalies, and tampered consideration figures in real-time.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/verification/new"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 font-outfit text-sm font-bold text-black shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all"
                >
                  <Cpu className="size-4" />
                  Upload Stamp Document
                  <ArrowUpRight className="size-3.5" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 font-outfit text-sm font-semibold text-white backdrop-blur-md hover:border-white/40 hover:bg-white/10 hover:scale-105 active:scale-95 transition-all"
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
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <ShieldCheck className="size-3.5 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                  Official Bhulekh Registry Verified
                </span>
              </div>

              <div className="font-outfit font-black tracking-tighter leading-[1.08] text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] uppercase max-w-4xl drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)] bg-gradient-to-r from-blue-100 via-white to-emerald-200 bg-clip-text text-transparent">
                Verify the Truth. <br />
                Secure Every Title.
              </div>

              <p className="mt-5 max-w-2xl font-outfit text-sm sm:text-base md:text-lg font-light leading-relaxed text-gray-200 drop-shadow-md">
                Instant automated cross-check against 7/12 land records, mutation numbers, authentic treasury emblems, and registered occupant titles.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/verification/new"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-7 py-3 font-outfit text-sm font-bold text-black shadow-[0_0_25px_rgba(52,211,153,0.4)] hover:bg-emerald-300 hover:scale-105 active:scale-95 transition-all"
                >
                  <FileCheck2 className="size-4" />
                  Run Live Forensic Audit
                  <ArrowUpRight className="size-3.5" />
                </Link>
                <Link
                  href="/reports"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 font-outfit text-sm font-semibold text-white backdrop-blur-md hover:border-white/40 hover:bg-white/10 hover:scale-105 active:scale-95 transition-all"
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
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#00f0ff] font-mono">
            Scroll to reveal forensic lens
          </span>
          <div className="flex size-7 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-md animate-bounce text-white">
            <ChevronDown className="size-3.5" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
