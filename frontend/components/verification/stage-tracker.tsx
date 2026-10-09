import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export const STAGES = [
  {
    id: 'classify',
    title: 'Document classification',
    description: 'Identify the document type and layout template',
    duration: 4500,
    working: ['Comparing layout against known templates', 'Checking header and form number'],
    result: 'Record of Rights (7/12 Extract) · 97.4% confidence',
  },
  {
    id: 'ocr',
    title: 'OCR extraction',
    description: 'Read printed, stamped and handwritten fields',
    duration: 24000,
    working: ['Running PaddleOCR Hindi + English engine', 'Reading printed fields and deed lines', 'Aligning with embedded text layer'],
    result: '9 fields and 412 words extracted',
  },
  {
    id: 'forensic',
    title: 'Forensic analysis',
    description: 'Inspect seals, biometrics, text integrity and file structure',
    duration: 8000,
    working: ['Analyzing thumb impression ridge minutiae', 'Running Error-Level Analysis (ELA)', 'Checking font baseline, slant and stamp integrity'],
    result: 'Biometric and text anomalies flagged for review',
  },
  {
    id: 'registry',
    title: 'Registry verification',
    description: 'Compare extracted data with official land records',
    duration: 6000,
    working: ['Querying State Land Records Registry', 'Matching survey and owner records'],
    result: '7 of 9 fields match the registry',
  },
] as const

export const TOTAL_MS = STAGES.reduce((sum, s) => sum + s.duration, 0)

type StageState = 'done' | 'active' | 'pending'

export function StageTracker({ elapsed }: { elapsed: number }) {
  let cursor = 0
  const rows = STAGES.map((stage) => {
    const start = cursor
    cursor += stage.duration
    const fraction = Math.min(1, Math.max(0, (elapsed - start) / stage.duration))
    const state: StageState = fraction >= 1 ? 'done' : fraction > 0 ? 'active' : 'pending'
    return { stage, fraction, state }
  })
  const activeIndex = rows.findIndex((r) => r.state === 'active')
  const allDone = rows.every((r) => r.state === 'done')

  return (
    <ol className="flex flex-col" aria-label="Verification stages">
      {rows.map(({ stage, fraction, state }, i) => {
        const last = i === rows.length - 1
        const workingLine =
          stage.working[Math.min(stage.working.length - 1, Math.floor(fraction * stage.working.length))]
        return (
          <li
            key={stage.id}
            className="relative flex gap-4 pb-6 last:pb-0"
            aria-current={state === 'active' ? 'step' : undefined}
          >
            {!last ? (
              <span aria-hidden className="absolute top-7 bottom-0 left-3 w-px bg-border">
                <span
                  className="block w-full bg-verified transition-[height] duration-200"
                  style={{ height: state === 'done' ? '100%' : '0%' }}
                />
              </span>
            ) : null}

            <span
              className={cn(
                'relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium transition-colors',
                state === 'done' && 'border-verified bg-verified text-white',
                state === 'active' && 'border-terracotta bg-card text-terracotta',
                state === 'pending' && 'border-input bg-card text-muted-foreground',
              )}
            >
              {state === 'done' ? (
                <Check className="size-3.5" aria-hidden />
              ) : state === 'active' ? (
                <span aria-hidden className="size-2 animate-pulse rounded-full bg-terracotta" />
              ) : (
                <span className="font-mono">{i + 1}</span>
              )}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p
                  className={cn(
                    'text-sm font-medium',
                    state === 'pending' ? 'text-muted-foreground' : 'text-foreground',
                  )}
                >
                  {stage.title}
                </p>
                {state === 'active' ? (
                  <span className="font-mono text-xs text-terracotta tabular">
                    {Math.round(fraction * 100)}%
                  </span>
                ) : state === 'done' ? (
                  <span className="font-mono text-xs text-muted-foreground tabular">
                    {(stage.duration / 1000).toFixed(1)}s
                  </span>
                ) : null}
              </div>

              {state === 'pending' ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{stage.description}</p>
              ) : null}

              {state === 'active' ? (
                <div className="mt-2">
                  <div className="relative h-1 overflow-hidden rounded-full bg-border">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-terracotta transition-[width] duration-100"
                      style={{ width: `${fraction * 100}%` }}
                    />
                    <span
                      aria-hidden
                      className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/50 to-transparent [animation:scan-line_1.4s_linear_infinite]"
                    />
                  </div>
                  <p className="mt-2 font-mono text-xs text-muted-foreground">{workingLine}</p>
                </div>
              ) : null}

              {state === 'done' ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{stage.result}</p>
              ) : null}
            </div>
          </li>
        )
      })}
      <li className="sr-only" role="status">
        {allDone
          ? 'All verification stages complete'
          : activeIndex >= 0
            ? `Running ${STAGES[activeIndex].title}`
            : 'Waiting to start'}
      </li>
    </ol>
  )
}
