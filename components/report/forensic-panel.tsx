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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { assessment, fields, findings, type Finding, type Severity } from '@/lib/report-data'

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
}: {
  reportId: string
  hoveredId: string | null
  activeId: string | null
  onHoverChange: (id: string | null) => void
  onSelectFinding: (id: string) => void
  onSelectField: (id: string) => void
}) {
  const [escalated, setEscalated] = useState(false)

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        <div className="flex flex-col gap-6 p-4 sm:p-5">
          <AssessmentHeader reportId={reportId} />

          <section aria-label="Forensic findings">
            <SectionTitle
              title="Forensic findings"
              meta={`${findings.length} checks`}
            />
            <ul className="mt-3 flex flex-col gap-2">
              {findings.map((finding, i) => (
                <FindingCard
                  key={finding.id}
                  finding={finding}
                  index={i + 1}
                  open={activeId === finding.id}
                  highlighted={hoveredId === finding.id}
                  onToggle={() => onSelectFinding(finding.id)}
                  onHoverChange={onHoverChange}
                />
              ))}
            </ul>
          </section>

          <section aria-label="Registry comparison">
            <SectionTitle
              title="Registry comparison"
              meta={`${assessment.matched} of ${assessment.total} match`}
            />
            <div className="mt-3 overflow-hidden rounded-lg border bg-card shadow-sm">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
                    <th scope="col" className="px-3 py-2 font-medium">
                      Field
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Extracted
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Registry
                    </th>
                    <th scope="col" className="w-8 px-3 py-2">
                      <span className="sr-only">Result</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field) => {
                    const mismatch = field.status === 'mismatch'
                    return (
                      <FieldRows
                        key={field.id}
                        mismatch={mismatch}
                        highlighted={hoveredId === field.id}
                        label={field.label}
                        extracted={field.extracted}
                        registry={field.registry}
                        note={field.note}
                        onHover={(on) => onHoverChange(on ? field.id : null)}
                        onSelect={() => onSelectField(field.id)}
                      />
                    )
                  })}
                </tbody>
              </table>
            </div>
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

function AssessmentHeader({ reportId }: { reportId: string }) {
  const stats = [
    { label: 'AI confidence', value: `${assessment.confidence}%` },
    { label: 'Fields matched', value: `${assessment.matched}/${assessment.total}` },
    { label: 'Critical', value: String(assessment.critical), tone: 'text-critical' },
    { label: 'Warnings', value: String(assessment.warnings), tone: 'text-warn' },
  ]
  return (
    <section aria-label="Assessment" className="flex flex-col gap-4">
      <div>
        <p className="font-mono text-xs text-muted-foreground">{reportId}</p>
        <h1 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
          Record of Rights (7/12 Extract)
        </h1>
        <p className="text-xs text-muted-foreground">
          Survey 142/3B · Kharadi, Haveli, Pune · Verified 09 Oct 2026, 09:41
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-warn/30 bg-warn-soft p-3.5">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warn" aria-hidden />
        <div>
          <p className="text-xs font-medium tracking-wider text-warn">{assessment.status}</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            Two critical indicators and two registry mismatches. A seal and the land area value show
            signs of post-issue alteration.
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4">
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
  onToggle,
  onHoverChange,
}: {
  finding: Finding
  index: number
  open: boolean
  highlighted: boolean
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
        (open || highlighted) && 'border-foreground/30',
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
              meta.badge,
            )}
          >
            {index}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-foreground">{finding.title}</span>
            <span className="block text-xs text-muted-foreground">{finding.group}</span>
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
              meta.pill,
            )}
          >
            <Icon className="size-3" aria-hidden />
            {meta.label}
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
