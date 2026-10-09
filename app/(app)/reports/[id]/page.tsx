import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Info } from 'lucide-react'
import { ReportWorkspace } from '@/components/report/report-workspace'
import { FEATURED_REPORT_ID, documents } from '@/lib/mock-data'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return { title: `Report ${id}` }
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const doc = documents.find((d) => d.id === id)
  if (!doc) notFound()

  return (
    <div className="flex min-h-full flex-col lg:h-full">
      {id !== FEATURED_REPORT_ID ? (
        <div className="flex items-center gap-2 border-b bg-muted px-4 py-2 text-xs text-muted-foreground sm:px-6">
          <Info className="size-3.5 shrink-0" aria-hidden />
          <span>
            Evidence for this document is not loaded in the prototype. Showing the sample analysis from{' '}
            <Link
              href={`/reports/${FEATURED_REPORT_ID}`}
              className="font-mono text-foreground underline underline-offset-4"
            >
              {FEATURED_REPORT_ID}
            </Link>
            .
          </span>
        </div>
      ) : null}
      <ReportWorkspace reportId={doc.id} fileName="7-12_extract_kharadi_142-3B.pdf" />
    </div>
  )
}
