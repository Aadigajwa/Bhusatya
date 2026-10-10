'use client'

import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Clients } from './components/Clients'
import { Services } from './components/Services'
import { About } from './components/About'
import { Footer } from './components/Footer'

export default function App() {
  return (
    <div className="relative min-h-screen w-full bg-[#0c1128] text-white selection:bg-blue-500/30 overflow-x-hidden font-outfit antialiased">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen">
        <div className="absolute top-[-20%] left-[-10%] size-[800px] rounded-full bg-blue-600/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] size-[800px] rounded-full bg-purple-600/10 blur-[150px]" />
      </div>

      <Navbar />

      <main className="relative z-10 w-full">
        <Hero />
        <Clients />
        <Services />
        <About />
      </main>

      <Footer />
    </div>
  )
}
