import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MetricCard } from '@/components/metric-card'
import { DocumentsTable } from '@/components/documents-table'
import { PageHeader } from '@/components/page-header'
import { documents, metrics } from '@/lib/mock-data'

export const metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  const attention = documents.filter((d) => d.status === 'review' || d.status === 'anomaly')

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-6 sm:px-6">
      <PageHeader
        title="Command center"
        description="Verification activity across all districts for the last 30 days."
      />

      <section aria-label="Overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <MetricCard key={m.id} metric={m} />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <DocumentsTable
          rows={documents}
          title="Recent documents"
          caption="Sorted by upload date, most recent first"
        />

        <aside
          aria-label="Needs attention"
          className="h-fit rounded-lg border bg-card shadow-sm"
        >
          <header className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">Needs attention</h2>
            <p className="text-xs text-muted-foreground">
              {attention.length} documents awaiting a verifier decision
            </p>
          </header>
          <ul className="divide-y">
            {attention.map((doc) => (
              <li key={doc.id}>
                <Link
                  href={`/reports/${doc.id}`}
                  className="group flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {doc.type}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      <span className="font-mono">{doc.id}</span>
                    </span>
                  </span>
                  <span
                    className={
                      doc.status === 'anomaly'
                        ? 'font-mono text-xs text-critical'
                        : 'font-mono text-xs text-warn'
                    }
                  >
                    {doc.confidence}%
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/reports"
            className="flex items-center justify-between border-t px-4 py-2.5 text-xs font-medium text-terracotta hover:bg-muted/60"
          >
            Open review queue
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </aside>
      </div>
    </div>
  )
}
