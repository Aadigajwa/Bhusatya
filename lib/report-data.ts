export const PAGE = { width: 600, height: 820 } as const

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

export interface RegistryField {
  id: string
  label: string
  extracted: string
  registry: string
  status: 'match' | 'mismatch'
  note?: string
  box: Box
}

export type Severity = 'critical' | 'warning' | 'pass'

export interface Finding {
  id: string
  title: string
  group: string
  severity: Severity
  summary: string
  confidence: number
  details: { label: string; value: string }[]
  box: Box | null
}

const ROW_TOP = 176
const ROW_HEIGHT = 44
export const VALUE_X = 190

const rowTop = (index: number) => ROW_TOP + index * ROW_HEIGHT
const valueBox = (index: number, text: string): Box => ({
  x: VALUE_X,
  y: rowTop(index) + 8,
  w: text.length * 9 + 12,
  h: 26,
})

export const fields: RegistryField[] = [
  {
    id: 'survey',
    label: 'Survey / Gat No.',
    extracted: '142/3B',
    registry: '142/3B',
    status: 'match',
    box: valueBox(0, '142/3B'),
  },
  {
    id: 'village',
    label: 'Village',
    extracted: 'Kharadi',
    registry: 'Kharadi',
    status: 'match',
    box: valueBox(1, 'Kharadi'),
  },
  {
    id: 'locality',
    label: 'Taluka / District',
    extracted: 'Haveli, Pune',
    registry: 'Haveli, Pune',
    status: 'match',
    box: valueBox(2, 'Haveli, Pune'),
  },
  {
    id: 'owner',
    label: 'Owner (Occupant)',
    extracted: 'Ramesh Dattatray Kulkarni',
    registry: 'Ramesh Dattatray Kulkarni',
    status: 'match',
    box: valueBox(3, 'Ramesh Dattatray Kulkarni'),
  },
  {
    id: 'area',
    label: 'Total Land Area',
    extracted: '2.50 ha',
    registry: '2.18 ha',
    status: 'mismatch',
    note: 'Extracted area exceeds registry by 0.32 ha (14.7%).',
    box: valueBox(4, '2.50 ha'),
  },
  {
    id: 'landuse',
    label: 'Land Use',
    extracted: 'Agricultural — Irrigated',
    registry: 'Agricultural — Irrigated',
    status: 'match',
    box: valueBox(5, 'Agricultural — Irrigated'),
  },
  {
    id: 'mutation',
    label: 'Mutation Entry No.',
    extracted: '4471',
    registry: '4471',
    status: 'match',
    box: valueBox(6, '4471'),
  },
  {
    id: 'encumbrance',
    label: 'Encumbrances',
    extracted: 'Nil',
    registry: '1 active charge (2022)',
    status: 'mismatch',
    note: 'Registry lists a mortgage charge registered in 2022 that the document omits.',
    box: valueBox(7, 'Nil'),
  },
  {
    id: 'mutation-date',
    label: 'Last Mutation Date',
    extracted: '02 Nov 2019',
    registry: '02 Nov 2019',
    status: 'match',
    box: valueBox(8, '02 Nov 2019'),
  },
]

export const STAMP_BOX: Box = { x: 396, y: 668, w: 168, h: 138 }
export const SIGNATURE_BOX: Box = { x: 44, y: 692, w: 176, h: 68 }

const areaBox = fields.find((f) => f.id === 'area')!.box

export const findings: Finding[] = [
  {
    id: 'f-stamp',
    title: 'Suspicious Stamp Region',
    group: 'Seals & stamps',
    severity: 'critical',
    summary:
      'The revenue office seal shows a hard rectangular boundary and ink characteristics that differ from the surrounding page.',
    confidence: 91,
    details: [
      { label: 'Edge discontinuity', value: 'Rectangular patch, 168 × 138 px' },
      { label: 'Ink hue deviation', value: 'ΔE 14.2 vs. reference seal' },
      { label: 'Ring radius variance', value: '3.1% from registered die' },
      { label: 'Duplicate contour', value: 'Offset ghost ring detected' },
    ],
    box: STAMP_BOX,
  },
  {
    id: 'f-splice',
    title: 'Spliced Text — Land Area',
    group: 'Text integrity',
    severity: 'critical',
    summary:
      'The area value sits on a patched background with a baseline offset, consistent with text inserted after scanning.',
    confidence: 87,
    details: [
      { label: 'Baseline offset', value: '+2.1 px vs. adjacent fields' },
      { label: 'Background noise', value: 'Mismatch with surrounding paper grain' },
      { label: 'Glyph sharpness', value: '1.8× higher than page average' },
      { label: 'Registry cross-check', value: '2.50 ha vs. 2.18 ha' },
    ],
    box: { x: areaBox.x - 4, y: areaBox.y - 3, w: areaBox.w + 8, h: areaBox.h + 6 },
  },
  {
    id: 'f-integrity',
    title: 'Document Integrity',
    group: 'File structure',
    severity: 'warning',
    summary:
      'File metadata indicates the PDF was re-saved with an image editor after the stated issue date.',
    confidence: 78,
    details: [
      { label: 'Producer', value: 'Adobe Photoshop 24.1' },
      { label: 'Issued', value: '14 Mar 2026' },
      { label: 'Last modified', value: '02 Oct 2026, 21:18' },
      { label: 'Revisions', value: '3 incremental saves' },
    ],
    box: null,
  },
  {
    id: 'f-text-layer',
    title: 'Text Layer Consistency',
    group: 'Text integrity',
    severity: 'pass',
    summary:
      'Embedded text matches OCR output on 8 of 9 extracted fields. The single variance is the land area value.',
    confidence: 94,
    details: [
      { label: 'Fields compared', value: '9' },
      { label: 'Consistent', value: '8' },
      { label: 'Variance', value: 'Total Land Area' },
    ],
    box: null,
  },
  {
    id: 'f-signature',
    title: 'Signature Verification',
    group: 'Seals & stamps',
    severity: 'pass',
    summary:
      'Stroke pressure and curvature are consistent with the registered specimen for the issuing Talathi.',
    confidence: 88,
    details: [
      { label: 'Specimen similarity', value: '88%' },
      { label: 'Stroke continuity', value: 'No overlays detected' },
    ],
    box: SIGNATURE_BOX,
  },
]

export const assessment = {
  status: 'REQUIRES VERIFICATION',
  confidence: 68,
  matched: fields.filter((f) => f.status === 'match').length,
  total: fields.length,
  critical: findings.filter((f) => f.severity === 'critical').length,
  warnings: findings.filter((f) => f.severity === 'warning').length,
}
