'use client'

import { Navbar } from './navbar'
import { Hero } from './hero'
import { Clients } from './clients'
import { Services } from './services'
import { About } from './about'
import { Footer } from './footer'

export function LandingPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#fbfbf9] text-[#2a211b] selection:bg-[#b34e2b]/20 overflow-x-hidden font-outfit antialiased">
      {/* Dynamic Background Noise / Micro Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 mix-blend-multiply">
        <div className="absolute top-[-20%] left-[-10%] size-[800px] rounded-full bg-[#b34e2b]/5 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] size-[800px] rounded-full bg-[#3b2b21]/5 blur-[150px]" />
      </div>

      {/* Floating Pill Navbar */}
      <Navbar />

      {/* Main Semantic Landmark */}
      <main className="relative z-10 w-full">
        <Hero />
        <Clients />
        <Services />
        <About />
      </main>

      {/* Footer Landmark */}
      <Footer />
    </div>
  )
}
