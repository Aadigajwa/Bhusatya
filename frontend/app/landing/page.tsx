import type { Metadata } from 'next'
import { LandingPage } from '@/components/landing/landing-page'

export const metadata: Metadata = {
  title: 'BhuSatya — AI Land Document Forensics & Stamp Paper Verification',
  description:
    'Forensic-grade land document verification and registry cross-checking for Indian state revenue departments.',
}

export default function LandingRoutePage() {
  return <LandingPage />
}
