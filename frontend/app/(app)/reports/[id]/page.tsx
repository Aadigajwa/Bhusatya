import Link from 'next/link'
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

  const isBuiltInOther = doc && doc.id !== FEATURED_REPORT_ID
  const fileName = doc
    ? '7-12_extract_kharadi_142-3B.pdf'
    : id.toLowerCase().includes('stamp_doc_2')
    ? 'stamp_doc_2.png'
    : id.toLowerCase().includes('stamp_doc_1')
    ? 'stamp_doc_1.png'
    : 'uploaded_document.png'

  return (
    <div className="flex min-h-full flex-col lg:h-full">
      {isBuiltInOther ? (
        <div className="flex items-center gap-2 border-b bg-muted px-4 py-2 text-xs text-muted-foreground sm:px-6">
          <Info className="size-3.5 shrink-0" aria-hidden />
          <span>
            Evidence for this static archive record is not loaded. Showing live analysis workspace for{' '}
            <span className="font-mono text-foreground">{id}</span>.
          </span>
        </div>
      ) : null}
      <ReportWorkspace reportId={id} fileName={fileName} />
    </div>
  )
}
