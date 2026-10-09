'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DocStatus, DocumentRecord } from '@/lib/mock-data'
import { StatusPill } from '@/components/status-pill'
import { ConfidenceBar } from '@/components/confidence-bar'

type Filter = 'all' | DocStatus

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'verified', label: 'Verified' },
  { id: 'review', label: 'Requires review' },
  { id: 'anomaly', label: 'Anomalies' },
]

export function DocumentsTable({
  rows,
  title,
  caption,
  showFilters = true,
}: {
  rows: DocumentRecord[]
  title?: string
  caption?: string
  showFilters?: boolean
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const visible = filter === 'all' ? rows : rows.filter((r) => r.status === filter)

  return (
    <section className="rounded-lg border bg-card shadow-sm" aria-label={title ?? 'Documents'}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          {title ? <h2 className="text-sm font-semibold text-foreground">{title}</h2> : null}
          {caption ? <p className="text-xs text-muted-foreground">{caption}</p> : null}
        </div>
        {showFilters ? (
          <div
            role="group"
            aria-label="Filter by status"
            className="flex rounded-md border bg-muted p-0.5"
          >
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'rounded-[3px] px-2.5 py-1 text-xs font-medium transition-colors',
                  filter === f.id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : null}
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th scope="col" className="px-4 py-2.5 font-medium">
                Document type
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Upload date
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Status
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                AI confidence
              </th>
              <th scope="col" className="w-10 px-4 py-2.5">
                <span className="sr-only">Open report</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((doc) => (
              <tr
                key={doc.id}
                className="group border-b last:border-b-0 transition-colors hover:bg-muted/60"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/reports/${doc.id}`}
                    className="block rounded-sm outline-offset-4 focus-visible:outline-2"
                  >
                    <span className="block font-medium text-foreground">{doc.type}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      <span className="font-mono">{doc.id}</span> · {doc.reference}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground tabular">
                  <span className="block text-foreground">{doc.uploaded.split(',')[0]}</span>
                  <span className="block text-xs">{doc.uploaded.split(',')[1]?.trim()}</span>
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={doc.status} />
                </td>
                <td className="px-4 py-3">
                  <ConfidenceBar value={doc.confidence} />
                </td>
                <td className="px-4 py-3 text-right">
                  <ChevronRight
                    aria-hidden
                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                  />
                </td>
              </tr>
            ))}
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No documents match this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}
