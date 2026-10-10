export type DocStatus = 'verified' | 'review' | 'anomaly' | 'processing'

export interface DocumentRecord {
  id: string
  type: string
  reference: string
  uploaded: string
  uploadedBy: string
  status: DocStatus
  confidence: number | null
}

export const FEATURED_REPORT_ID = 'BS-STAMP-DOC-1'

export const documents: DocumentRecord[] = [
  {
    id: 'BS-STAMP-DOC-1',
    type: 'Stamp Paper (Non-Judicial) — Fake Thumb Impressions',
    reference: 'File: stamp_doc_1.png',
    uploaded: '09 Oct 2026, 19:53',
    uploadedBy: 'Forensic System',
    status: 'anomaly',
    confidence: 22,
  },
  {
    id: 'BS-STAMP-DOC-2',
    type: 'Stamp Paper (Non-Judicial) — Font Inconsistency & Alterations',
    reference: 'File: stamp_doc_2.png',
    uploaded: '10 Oct 2026, 00:04',
    uploadedBy: 'Forensic System',
    status: 'anomaly',
    confidence: 18,
  },
  {
    id: 'BS-STAMP-DOC-3',
    type: 'Stamp Paper (Non-Judicial) — Fictitious Deed & Typography Tampering',
    reference: 'File: stamp_doc_3.png',
    uploaded: '10 Oct 2026, 00:05',
    uploadedBy: 'Forensic System',
    status: 'anomaly',
    confidence: 18,
  },
]

export interface Metric {
  id: string
  label: string
  value: string
  delta: string
  direction: 'up' | 'down' | 'neutral'
  tone: 'good' | 'bad' | 'neutral'
  series: number[]
}

export const metrics: Metric[] = [
  {
    id: 'total',
    label: 'Total Documents',
    value: '3',
    delta: '+3 new',
    direction: 'up',
    tone: 'neutral',
    series: [1, 1, 2, 2, 3, 3, 3],
  },
  {
    id: 'verified',
    label: 'Verified',
    value: '0',
    delta: '0%',
    direction: 'neutral',
    tone: 'neutral',
    series: [0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'review',
    label: 'Requires Review',
    value: '0',
    delta: '0%',
    direction: 'neutral',
    tone: 'neutral',
    series: [0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'anomalies',
    label: 'Anomalies Detected',
    value: '3',
    delta: '100%',
    direction: 'up',
    tone: 'bad',
    series: [1, 1, 2, 2, 3, 3, 3],
  },
]

