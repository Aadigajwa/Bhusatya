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

export const FEATURED_REPORT_ID = 'BS-2026-04817'

export const documents: DocumentRecord[] = [
  {
    id: 'BS-2026-04817',
    type: 'Record of Rights (7/12 Extract)',
    reference: 'Survey 142/3B · Kharadi',
    uploaded: '09 Oct 2026, 09:42',
    uploadedBy: 'A. Deshmukh',
    status: 'review',
    confidence: 68,
  },
  {
    id: 'BS-2026-04816',
    type: 'Sale Deed',
    reference: 'Plot 18 · Wagholi',
    uploaded: '09 Oct 2026, 09:11',
    uploadedBy: 'A. Deshmukh',
    status: 'verified',
    confidence: 96,
  },
  {
    id: 'BS-2026-04815',
    type: 'Mutation Entry (Ferfar)',
    reference: 'Entry 5120 · Mulshi',
    uploaded: '09 Oct 2026, 08:37',
    uploadedBy: 'S. Iyer',
    status: 'anomaly',
    confidence: 31,
  },
  {
    id: 'BS-2026-04812',
    type: 'Property Card',
    reference: 'CTS 1204 · Shivajinagar',
    uploaded: '08 Oct 2026, 17:20',
    uploadedBy: 'S. Iyer',
    status: 'verified',
    confidence: 93,
  },
  {
    id: 'BS-2026-04809',
    type: 'Encumbrance Certificate',
    reference: 'Survey 77/1 · Hadapsar',
    uploaded: '08 Oct 2026, 15:02',
    uploadedBy: 'R. Naik',
    status: 'verified',
    confidence: 98,
  },
  {
    id: 'BS-2026-04806',
    type: 'Gift Deed',
    reference: 'Survey 9/2A · Uruli Kanchan',
    uploaded: '08 Oct 2026, 11:48',
    uploadedBy: 'R. Naik',
    status: 'review',
    confidence: 72,
  },
  {
    id: 'BS-2026-04801',
    type: 'Record of Rights (7/12 Extract)',
    reference: 'Survey 56/4 · Pirangut',
    uploaded: '07 Oct 2026, 16:30',
    uploadedBy: 'A. Deshmukh',
    status: 'verified',
    confidence: 94,
  },
  {
    id: 'BS-2026-04798',
    type: 'Partition Deed',
    reference: 'Survey 311 · Lonavala',
    uploaded: '07 Oct 2026, 13:15',
    uploadedBy: 'S. Iyer',
    status: 'anomaly',
    confidence: 24,
  },
  {
    id: 'BS-2026-04795',
    type: 'Sale Deed',
    reference: 'Plot 4 · Baner',
    uploaded: '06 Oct 2026, 18:04',
    uploadedBy: 'R. Naik',
    status: 'processing',
    confidence: null,
  },
  {
    id: 'BS-2026-04790',
    type: 'Lease Agreement',
    reference: 'Gat 402 · Chakan',
    uploaded: '06 Oct 2026, 10:26',
    uploadedBy: 'A. Deshmukh',
    status: 'verified',
    confidence: 91,
  },
]

export interface Metric {
  id: string
  label: string
  value: string
  delta: string
  direction: 'up' | 'down'
  tone: 'good' | 'bad' | 'neutral'
  series: number[]
}

export const metrics: Metric[] = [
  {
    id: 'total',
    label: 'Total Documents',
    value: '12,480',
    delta: '8.2%',
    direction: 'up',
    tone: 'neutral',
    series: [40, 44, 43, 48, 52, 50, 55, 58, 57, 62, 64, 63, 68, 72],
  },
  {
    id: 'verified',
    label: 'Verified',
    value: '9,846',
    delta: '6.1%',
    direction: 'up',
    tone: 'good',
    series: [30, 33, 34, 36, 39, 38, 42, 44, 45, 47, 50, 51, 53, 56],
  },
  {
    id: 'review',
    label: 'Requires Review',
    value: '1,917',
    delta: '12.4%',
    direction: 'up',
    tone: 'bad',
    series: [10, 11, 10, 12, 13, 12, 14, 15, 14, 16, 17, 16, 18, 20],
  },
  {
    id: 'anomalies',
    label: 'Anomalies Detected',
    value: '217',
    delta: '3.1%',
    direction: 'down',
    tone: 'good',
    series: [9, 8, 9, 8, 7, 8, 7, 7, 6, 7, 6, 6, 5, 5],
  },
]
