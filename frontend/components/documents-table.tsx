'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { ChevronRight, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DocStatus, DocumentRecord } from '@/lib/mock-data'
import { getSavedDocuments, deleteReport } from '@/lib/report-store'
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
  rows: initialRows,
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
  const [allRows, setAllRows] = useState<DocumentRecord[]>(initialRows)
  // Track which row is awaiting confirmation before delete
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  useEffect(() => {
    const saved = getSavedDocuments()
    if (saved && saved.length > 0) {
      // Deduplicate rows by normalized reference / id
      const seen = new Set<string>()
      const uniqueDocs: DocumentRecord[] = []
      for (const d of saved) {
        const key = (d.reference || d.id).toLowerCase().replace(/file:\s*/i, '').replace(/[-_\s]/g, '')
        if (!seen.has(key)) {
          seen.add(key)
          uniqueDocs.push(d)
        }
      }
      setAllRows(uniqueDocs)
    }
  }, [])

  const handleDeleteClick = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (pendingDeleteId === id) {
      // Second click — confirmed, perform delete
      deleteReport(id)
      setAllRows((prev) => prev.filter((r) => r.id !== id))
      setPendingDeleteId(null)
    } else {
      // First click — ask for confirmation
      setPendingDeleteId(id)
    }
  }, [pendingDeleteId])

  const handleCancelDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPendingDeleteId(null)
  }, [])

  const visible = filter === 'all' ? allRows : allRows.filter((r) => r.status === filter)
  const displayCaption = caption?.includes('completed reports')
    ? `${allRows.length} completed reports`
    : caption

  return (
    <section className="rounded-lg border bg-card shadow-sm" aria-label={title ?? 'Documents'}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          {title ? <h2 className="text-sm font-semibold text-foreground">{title}</h2> : null}
          {displayCaption ? <p className="text-xs text-muted-foreground">{displayCaption}</p> : null}
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
              <th scope="col" className="w-28 px-4 py-2.5 text-right font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((doc) => {
              const isPending = pendingDeleteId === doc.id
              return (
                <tr
                  key={doc.id}
                  className={cn(
                    'group border-b last:border-b-0 transition-colors hover:bg-muted/60',
                    isPending && 'bg-red-500/5',
                  )}
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
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {isPending ? (
                        <>
                          {/* Cancel button */}
                          <button
                            type="button"
                            aria-label="Cancel delete"
                            onClick={handleCancelDelete}
                            className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <X className="size-3" aria-hidden />
                            Cancel
                          </button>
                          {/* Confirm delete button */}
                          <button
                            type="button"
                            aria-label={`Confirm delete report ${doc.id}`}
                            onClick={(e) => handleDeleteClick(doc.id, e)}
                            className="flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-red-700"
                          >
                            <Trash2 className="size-3" aria-hidden />
                            Confirm?
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Delete icon — visible on hover */}
                          <button
                            type="button"
                            aria-label={`Delete report ${doc.id}`}
                            onClick={(e) => handleDeleteClick(doc.id, e)}
                            className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </button>
                          {/* Open report chevron */}
                          <Link
                            href={`/reports/${doc.id}`}
                            aria-label={`Open report ${doc.id}`}
                            tabIndex={-1}
                          >
                            <ChevronRight
                              aria-hidden
                              className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                            />
                          </Link>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
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
