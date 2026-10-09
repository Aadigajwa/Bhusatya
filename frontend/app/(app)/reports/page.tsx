import { DocumentsTable } from '@/components/documents-table'
import { PageHeader } from '@/components/page-header'
import { documents } from '@/lib/mock-data'

export const metadata = { title: 'Reports' }

export default function ReportsPage() {
  const completed = documents.filter((d) => d.status !== 'processing')
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-6 sm:px-6">
      <PageHeader
        title="Reports"
        description="Completed verification reports. Open any report to inspect the evidence and registry comparison."
      />
      <DocumentsTable rows={completed} caption={`${completed.length} completed reports`} />
    </div>
  )
}
