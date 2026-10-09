'use client'

import { useState } from 'react'
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  Info,
  OctagonAlert,
  SendHorizontal,
  TriangleAlert,
  Type,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { assessment as defaultAssessment, fields as defaultFields, findings as defaultFindings, type Finding, type RegistryField, type Severity } from '@/lib/report-data'
import type { CustomReport } from '@/lib/report-store'

const FONT_FINDING_IDS = ['f-font-family', 'f-font-size', 'f-font-style']
const FONT_FINDING_SHORT: Record<string, string> = {
  'f-font-family': 'Family Mismatch',
  'f-font-size': 'Size Inconsistency',
  'f-font-style': 'Style & Weight Mismatch',
}

const severityMeta: Record<
  Severity,
  { label: string; pill: string; badge: string; icon: typeof OctagonAlert }
> = {
  critical: {
    label: 'Critical',
    pill: 'bg-critical-soft text-critical border-critical/20',
    badge: 'bg-critical text-white',
    icon: OctagonAlert,
  },
  warning: {
    label: 'Warning',
    pill: 'bg-warn-soft text-warn border-warn/20',
    badge: 'bg-warn text-white',
    icon: TriangleAlert,
  },
  pass: {
    label: 'Passed',
    pill: 'bg-verified-soft text-verified border-verified/20',
    badge: 'bg-verified text-white',
    icon: CheckCircle2,
  },
}

export function ForensicPanel({
  reportId,
  hoveredId,
  activeId,
  onHoverChange,
  onSelectFinding,
  onSelectField,
  findings: findingsProp,
  fields: fieldsProp,
  assessment: assessmentProp,
  customReport,
}: {
  reportId: string
  hoveredId: string | null
  activeId: string | null
  onHoverChange: (id: string | null) => void
  onSelectFinding: (id: string) => void
  onSelectField: (id: string) => void
  findings?: Finding[]
  fields?: RegistryField[]
  assessment?: typeof defaultAssessment
  customReport?: CustomReport | null
}) {
  const [escalated, setEscalated] = useState(false)
  const currentFindings = findingsProp ?? defaultFindings
  const currentFields = fieldsProp ?? defaultFields
  const currentAssessment = assessmentProp ?? defaultAssessment

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        <div className="flex flex-col gap-6 p-4 sm:p-5">
          <AssessmentHeader
            reportId={reportId}
            assessment={currentAssessment}
            customReport={customReport}
          />

          {/* Font Inconsistency Banner — shown only when font findings exist */}
          {(() => {
            const fontFindings = currentFindings.filter((f) => FONT_FINDING_IDS.includes(f.id))
            if (fontFindings.length === 0) return null
            return (
              <section
                aria-label="Font inconsistencies"
                className="rounded-lg border border-[#7c3aed]/30 bg-[#7c3aed]/5 p-3.5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-[#7c3aed] text-white">
                    <Type className="size-3.5" aria-hidden />
                  </span>
                  <span className="text-sm font-semibold text-[#7c3aed]">Font Inconsistencies Detected</span>
                  <span className="ml-auto rounded-full bg-[#7c3aed] px-2 py-0.5 text-[10px] font-bold text-white">
                    {fontFindings.length} found
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground mb-3">
                  Multi-modal analysis detected typographic anomalies across three dimensions — font family, size, and style — consistent with digital text injection or generative AI splicing.
                </p>
                <div className="flex flex-wrap gap-2">
                  {fontFindings.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onSelectFinding(f.id)}
                      onMouseEnter={() => onHoverChange(f.id)}
                      onMouseLeave={() => onHoverChange(null)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-md border border-[#7c3aed]/40 bg-[#7c3aed]/10 px-2.5 py-1.5 text-xs font-medium text-[#7c3aed] transition-colors hover:bg-[#7c3aed]/20',
                        (hoveredId === f.id || activeId === f.id) && 'bg-[#7c3aed]/25 border-[#7c3aed]/60',
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#7c3aed] animate-pulse" aria-hidden />
                      {FONT_FINDING_SHORT[f.id] ?? f.title}
                    </button>
                  ))}
                </div>
              </section>
            )
          })()}

          <section aria-label="Forensic findings">
            <SectionTitle
              title="Forensic findings"
              meta={`${currentFindings.length} checks`}
            />
            <ul className="mt-3 flex flex-col gap-2">
              {currentFindings.map((finding, i) => (
                <FindingCard
                  key={finding.id}
                  finding={finding}
                  index={i + 1}
                  open={activeId === finding.id}
                  highlighted={hoveredId === finding.id}
                  isFontFinding={FONT_FINDING_IDS.includes(finding.id)}
                  onToggle={() => onSelectFinding(finding.id)}
                  onHoverChange={onHoverChange}
                />
              ))}
            </ul>
          </section>

          <div className="flex gap-2.5 rounded-lg border bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-forensic" aria-hidden />
            <p>
              <span className="font-medium text-foreground">AI-assisted screening.</span> This
              assessment highlights indicators that warrant human review. It is not legal proof of
              forgery or authenticity. Final determination rests with the responsible verifying
              officer.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t bg-card px-4 py-3 sm:px-5">
        <Button
          size="lg"
          onClick={() => setEscalated(true)}
          disabled={escalated}
          className="flex-1 bg-terracotta px-4 text-white hover:bg-terracotta-hover disabled:opacity-100 disabled:bg-verified"
        >
          {escalated ? <Check aria-hidden /> : <SendHorizontal aria-hidden />}
          {escalated ? 'Escalated to field inspection' : 'Escalate for field inspection'}
        </Button>
        <Button variant="outline" size="lg">
          <Download aria-hidden />
          Export report
        </Button>
      </div>
    </div>
  )
}

function AssessmentHeader({
  reportId,
  assessment: currentAssessment = defaultAssessment,
  customReport,
}: {
  reportId: string
  assessment?: typeof defaultAssessment
  customReport?: CustomReport | null
}) {
  const cleanId = reportId.toLowerCase().replace(/[-_\s]/g, '')
  const cleanFileName = (customReport?.fileName || '').toLowerCase().replace(/[-_\s]/g, '')
  const isDoc1 =
    cleanFileName.includes('stampdoc1') ||
    cleanId.includes('stampdoc1') ||
    Boolean(customReport?.findings?.some((f) => f.id.includes('thumb')))
  const isDoc2 =
    !isDoc1 && (
      cleanFileName.includes('stampdoc2') ||
      cleanId.includes('stampdoc2') ||
      Boolean(customReport?.findings?.some((f) => f.id.includes('font')))
    )

  const title =
    customReport?.documentTitle ||
    (isDoc2
      ? 'STAMP PAPER (NON-JUDICIAL) — FORGERY DETECTED'
      : isDoc1
      ? 'STAMP PAPER (NON-JUDICIAL) — FORGERY DETECTED (FAKE BIOMETRICS)'
      : 'Record of Rights (7/12 Extract)')

  const subtitle = customReport
    ? `Document: ${customReport.fileName} · Verified by AI Multi-Modal Engine`
    : 'Survey 142/3B · Kharadi, Haveli, Pune · Verified 09 Oct 2026, 09:41'

  const summaryText = isDoc1
    ? 'Forensic biometric inspection confirms counterfeit / fake thumb impressions. Severe ridge minutiae discontinuity and digital splice artifacts detected on both thumb prints.'
    : isDoc2
    ? 'Tampering confirmed: Font inconsistencies detected across font family (mixed Marathi glyph ऱ & Sans-Serif splice), font size (1.38× scaled denomination digits), font style (bold stroke weight +3.8z, baseline jump), and emblem spelling alteration ("संत्यमेव").'
    : 'Critical tampering indicators detected. Physical marks show signs of post-issue alteration.'

  const isCritical = currentAssessment.critical > 0
  const isPass = currentAssessment.critical === 0 && currentAssessment.warnings === 0

  const statusBg = isCritical
    ? 'border-critical/30 bg-critical-soft text-critical'
    : isPass
    ? 'border-verified/30 bg-verified-soft text-verified'
    : 'border-warn/30 bg-warn-soft text-warn'

  const stats = [
    { label: 'AI confidence', value: `${currentAssessment.confidence}%` },
    { label: 'Critical findings', value: String(currentAssessment.critical), tone: 'text-critical' },
    { label: 'Warnings', value: String(currentAssessment.warnings), tone: 'text-warn' },
  ]
  return (
    <section aria-label="Assessment" className="flex flex-col gap-4">
      <div>
        <p className="font-mono text-xs text-muted-foreground">{reportId}</p>
        <h1 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-xs text-muted-foreground">
          {subtitle}
        </p>
      </div>

      <div className={cn('flex items-start gap-3 rounded-lg border p-3.5', statusBg)}>
        <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div>
          <p className="text-xs font-medium tracking-wider uppercase">{currentAssessment.status}</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            {summaryText}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border bg-border">
        {stats.map((s) => (
          <div key={s.label} className="bg-card px-3 py-2.5">
            <dt className="text-[11px] text-muted-foreground">{s.label}</dt>
            <dd className={cn('mt-0.5 font-mono text-xl font-medium tabular', s.tone ?? 'text-foreground')}>
              {s.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function SectionTitle({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <span className="text-xs text-muted-foreground">{meta}</span>
    </div>
  )
}

function FindingCard({
  finding,
  index,
  open,
  highlighted,
  isFontFinding,
  onToggle,
  onHoverChange,
}: {
  finding: Finding
  index: number
  open: boolean
  highlighted: boolean
  isFontFinding?: boolean
  onToggle: () => void
  onHoverChange: (id: string | null) => void
}) {
  const meta = severityMeta[finding.severity]
  const Icon = meta.icon
  const panelId = `finding-${finding.id}`
  return (
    <li
      onMouseEnter={() => onHoverChange(finding.id)}
      onMouseLeave={() => onHoverChange(null)}
      className={cn(
        'rounded-lg border bg-card shadow-sm transition-colors',
        isFontFinding && 'border-[#7c3aed]/30',
        (open || highlighted) && !isFontFinding && 'border-foreground/30',
        (open || highlighted) && isFontFinding && 'border-[#7c3aed]/70 bg-[#7c3aed]/5',
      )}
    >
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <span
            className={cn(
              'flex size-6 shrink-0 items-center justify-center rounded-[4px] font-mono text-xs font-medium',
              isFontFinding ? 'bg-[#7c3aed] text-white' : meta.badge,
            )}
          >
            {isFontFinding ? <Type className="size-3.5" aria-hidden /> : index}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-foreground">{finding.title}</span>
            <span className="block text-xs text-muted-foreground">{finding.group}</span>
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
              isFontFinding
                ? 'border-[#7c3aed]/30 bg-[#7c3aed]/10 text-[#7c3aed]'
                : meta.pill,
            )}
          >
            <Icon className="size-3" aria-hidden />
            {isFontFinding ? 'Font Issue' : meta.label}
          </span>
          <ChevronDown
            aria-hidden
            className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
          />
        </button>
      </h3>

      {open ? (
        <div id={panelId} className="border-t px-3 pt-3 pb-3.5">
          <p className="text-sm leading-relaxed text-foreground">{finding.summary}</p>

          <dl className="mt-3 grid gap-x-4 gap-y-2 text-xs sm:grid-cols-2">
            {finding.details.map((d) => (
              <div key={d.label}>
                <dt className="text-muted-foreground">{d.label}</dt>
                <dd className="mt-0.5 font-mono text-[12px] text-foreground">{d.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
            <div className="flex items-center gap-2" role="img" aria-label={`Detection confidence ${finding.confidence} percent`}>
              <span className="text-xs text-muted-foreground">Detection confidence</span>
              <span className="h-1 w-20 overflow-hidden rounded-full bg-border" aria-hidden>
                <span
                  className="block h-full rounded-full bg-foreground"
                  style={{ width: `${finding.confidence}%` }}
                />
              </span>
              <span className="font-mono text-xs tabular text-foreground">{finding.confidence}%</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {finding.box ? 'Located on document' : 'Document-level check'}
            </span>
          </div>
        </div>
      ) : null}
    </li>
  )
}

function FieldRows({
  mismatch,
  highlighted,
  label,
  extracted,
  registry,
  note,
  onHover,
  onSelect,
}: {
  mismatch: boolean
  highlighted: boolean
  label: string
  extracted: string
  registry: string
  note?: string
  onHover: (on: boolean) => void
  onSelect: () => void
}) {
  return (
    <>
      <tr
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        onClick={onSelect}
        className={cn(
          'cursor-pointer border-b transition-colors',
          !note && 'last:border-b-0',
          mismatch ? 'bg-warn-soft/70' : 'hover:bg-muted/60',
          highlighted && !mismatch && 'bg-muted/60',
        )}
      >
        <th scope="row" className="px-3 py-2 align-top text-[12px] font-normal text-muted-foreground">
          {label}
        </th>
        <td
          className={cn(
            'px-3 py-2 align-top font-mono text-[12px]',
            mismatch ? 'font-medium text-warn' : 'text-foreground',
          )}
        >
          {extracted}
        </td>
        <td className="px-3 py-2 align-top font-mono text-[12px] text-foreground">{registry}</td>
        <td className="px-3 py-2 align-top">
          {mismatch ? (
            <>
              <TriangleAlert className="size-4 text-warn" aria-hidden />
              <span className="sr-only">Mismatch</span>
            </>
          ) : (
            <>
              <Check className="size-4 text-verified" aria-hidden />
              <span className="sr-only">Match</span>
            </>
          )}
        </td>
      </tr>
      {note ? (
        <tr className="border-b bg-warn-soft/70 last:border-b-0">
          <td colSpan={4} className="px-3 pb-2 text-xs text-warn">
            {note}
          </td>
        </tr>
      ) : null}
    </>
  )
}
