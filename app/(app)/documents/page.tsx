import { DocumentsTable } from '@/components/documents-table'
import { PageHeader } from '@/components/page-header'
import { documents } from '@/lib/mock-data'

export const metadata = { title: 'Documents' }

export default function DocumentsPage() {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-6 sm:px-6">
      <PageHeader
        title="Documents"
        description="Every land document submitted for verification, with its latest AI-assisted screening result."
      />
      <DocumentsTable rows={documents} caption={`${documents.length} documents`} />
    </div>
  )
}
