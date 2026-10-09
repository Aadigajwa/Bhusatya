'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Check, FileText, FileUp, RotateCcw, X } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FEATURED_REPORT_ID } from '@/lib/mock-data'
import { StageTracker, STAGES, TOTAL_MS } from '@/components/verification/stage-tracker'

interface PickedFile {
  name: string
  size: number
}

const MAX_BYTES = 25 * 1024 * 1024
const ACCEPTED = ['application/pdf', 'image/jpeg', 'image/png']

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const LOG: { at: number; text: string }[] = [
  { at: 0, text: 'Document received, checksum recorded' },
  { at: 700, text: 'Layout template matched: Form VII-XII' },
  { at: 1900, text: 'Document class confirmed (97.4%)' },
  { at: 2400, text: 'Binarising page 1 of 1' },
  { at: 3800, text: 'Reading printed fields' },
  { at: 5100, text: 'Reading stamped and handwritten regions' },
  { at: 5600, text: '9 fields extracted, text layer aligned' },
  { at: 6300, text: 'Error-level analysis across page' },
  { at: 7500, text: 'Seal contour comparison against reference die' },
  { at: 8800, text: 'Baseline and noise grain check on numeric fields' },
  { at: 9600, text: '3 regions flagged' },
  { at: 10100, text: 'Querying State Land Records Registry' },
  { at: 11400, text: 'Matching survey 142/3B, Kharadi, Haveli' },
  { at: 12500, text: 'Registry comparison complete: 7 of 9 fields match' },
]

export function UploadFlow() {
  const [file, setFile] = useState<PickedFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const finished = running && elapsed >= TOTAL_MS

  useEffect(() => {
    if (!running || finished) return
    const startedAt = performance.now() - elapsed
    const id = window.setInterval(() => {
      setElapsed(Math.min(TOTAL_MS, performance.now() - startedAt))
    }, 80)
    return () => window.clearInterval(id)
    // elapsed is intentionally read only once per run to anchor the timer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, finished])

  function accept(candidate: File) {
    if (!ACCEPTED.includes(candidate.type)) {
      setError('Unsupported format. Upload a PDF, JPG or PNG file.')
      return
    }
    if (candidate.size > MAX_BYTES) {
      setError('File exceeds the 25 MB limit.')
      return
    }
    setError(null)
    setFile({ name: candidate.name, size: candidate.size })
  }

  function reset() {
    setFile(null)
    setError(null)
    setRunning(false)
    setElapsed(0)
  }

  function start() {
    setElapsed(0)
    setRunning(true)
  }

  const visibleLog = LOG.filter((l) => elapsed >= l.at)

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="rounded-lg border bg-card shadow-sm" aria-label="Verification">
        <header className="flex items-center justify-between gap-3 border-b px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {running ? 'Verification in progress' : 'Upload document'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {running
                ? 'Each stage runs in sequence. You can leave this page open while it completes.'
                : 'Submit one land document per verification.'}
            </p>
          </div>
          {file && !running ? (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" aria-hidden />
              Remove
            </button>
          ) : null}
        </header>

        {!running ? (
          <div className="p-5">
            {!file ? (
              <div>
                <input
                  id="document-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  className="peer sr-only"
                  onChange={(e) => {
                    const picked = e.target.files?.[0]
                    if (picked) accept(picked)
                    e.target.value = ''
                  }}
                />
                <label
                  htmlFor="document-upload"
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragging(true)
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragging(false)
                    const dropped = e.dataTransfer.files?.[0]
                    if (dropped) accept(dropped)
                  }}
                  className={cn(
                    'relative flex min-h-72 cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed px-6 py-12 text-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring',
                    dragging
                      ? 'border-terracotta bg-terracotta/5'
                      : 'border-input bg-background hover:border-muted-foreground/60 hover:bg-muted/40',
                  )}
                >
                  {['top-2 left-2 border-t border-l', 'top-2 right-2 border-t border-r', 'bottom-2 left-2 border-b border-l', 'bottom-2 right-2 border-b border-r'].map(
                    (pos) => (
                      <span
                        key={pos}
                        aria-hidden
                        className={cn('absolute size-3 border-foreground/40', pos)}
                      />
                    ),
                  )}
                  <span className="flex size-11 items-center justify-center rounded-md border bg-card shadow-sm">
                    <FileUp className="size-5 text-foreground" aria-hidden />
                  </span>
                  <span className="text-base font-medium text-foreground">
                    Drop a land document here, or{' '}
                    <span className="text-terracotta underline underline-offset-4">browse files</span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    PDF, JPG or PNG · up to 25 MB · scans at 200 DPI or higher work best
                  </span>
                </label>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  {error ? (
                    <p role="alert" className="text-sm text-critical">
                      {error}
                    </p>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Files are encrypted in transit and stored in the department archive.
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setFile({ name: '7-12_extract_kharadi_142-3B.pdf', size: 1_874_000 })}
                    className="text-xs font-medium text-foreground underline underline-offset-4 hover:text-terracotta"
                  >
                    Use sample document
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <FileSummary file={file} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Ready to run classification, OCR, forensic analysis and registry verification.
                  </p>
                  <Button
                    size="lg"
                    onClick={start}
                    className="bg-terracotta px-4 text-white hover:bg-terracotta-hover"
                  >
                    Start verification
                    <ArrowRight aria-hidden />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6 p-5">
            {file ? <FileSummary file={file} compact /> : null}
            <StageTracker elapsed={elapsed} />

            {finished ? (
              <div
                role="status"
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-warn/25 bg-warn-soft px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">Report ready: requires verification</p>
                  <p className="text-xs text-muted-foreground">
                    2 critical findings and 2 registry mismatches need a verifier decision.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="lg" onClick={reset}>
                    <RotateCcw aria-hidden />
                    Start another
                  </Button>
                  <Link
                    href={`/reports/${FEATURED_REPORT_ID}`}
                    className={cn(
                      buttonVariants({ size: 'lg' }),
                      'bg-terracotta px-3.5 text-white hover:bg-terracotta-hover',
                    )}
                  >
                    View report
                    <ArrowRight aria-hidden />
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>

      <aside className="flex flex-col gap-6" aria-label="Verification details">
        {running ? (
          <section className="rounded-lg border bg-card shadow-sm" aria-label="Activity log">
            <header className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Activity log</h2>
            </header>
            <ol
              className="max-h-80 overflow-y-auto px-4 py-3 font-mono text-xs leading-relaxed scrollbar-thin"
              aria-live="polite"
            >
              {visibleLog.map((l) => (
                <li
                  key={l.at}
                  className="flex gap-3 py-0.5 [animation:step-in_200ms_ease-out]"
                >
                  <span className="shrink-0 text-muted-foreground tabular">
                    {(l.at / 1000).toFixed(1).padStart(4, '0')}s
                  </span>
                  <span className="text-foreground">{l.text}</span>
                </li>
              ))}
            </ol>
          </section>
        ) : (
          <section className="rounded-lg border bg-card shadow-sm" aria-label="Pipeline overview">
            <header className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">What happens next</h2>
            </header>
            <ol className="divide-y">
              {STAGES.map((stage, i) => (
                <li key={stage.id} className="flex gap-3 px-4 py-3">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] text-muted-foreground">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-foreground">{stage.title}</span>
                    <span className="block text-xs text-muted-foreground">{stage.description}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <p className="px-1 text-xs leading-relaxed text-muted-foreground">
          BhuSatya provides AI-assisted screening to support verifier judgement. Results are not legal
          proof of authenticity or title.
        </p>
      </aside>
    </div>
  )
}

function FileSummary({ file, compact = false }: { file: PickedFile; compact?: boolean }) {
  const ext = file.name.split('.').pop()?.toUpperCase() ?? 'FILE'
  return (
    <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-card">
        <FileText className="size-4 text-foreground" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-[13px] text-foreground">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {ext} · {formatSize(file.size)}
          {compact ? '' : ' · Uploaded just now'}
        </p>
      </div>
      <span className="flex items-center gap-1 text-xs text-verified">
        <Check className="size-3.5" aria-hidden />
        Received
      </span>
    </div>
  )
}
