import type { Metadata } from 'next'
import { LandingPage } from '@/components/landing/landing-page'

export const metadata: Metadata = {
  title: 'BhuSatya — AI Land Document Forensics & Stamp Paper Verification',
  description:
    'Forensic-grade land document verification and registry cross-checking for Indian state revenue departments. Screen non-judicial stamp papers, detect forged biometric impressions, and verify against Bhulekh 7/12 land records.',
  keywords: [
    'BhuSatya',
    'Land Document Verification',
    'Stamp Paper Forensics',
    '7/12 Land Records',
    'Bhulekh Verification',
    'Biometric Forgery Detection',
    'Error Level Analysis',
    'Revenue Department Forensics',
  ],
  openGraph: {
    title: 'BhuSatya — AI Land Document Forensics & Stamp Paper Verification',
    description:
      'Detect non-judicial stamp paper forgery, synthetic thumb minutiae, and illegal deed alterations in seconds.',
    url: 'https://bhusatya.gov.in',
    siteName: 'BhuSatya Forensics',
    locale: 'en_IN',
    type: 'website',
  },
}

export default function HomePage() {
  return <LandingPage />
}
