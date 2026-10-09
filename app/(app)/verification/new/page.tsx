import { PageHeader } from '@/components/page-header'
import { UploadFlow } from '@/components/verification/upload-flow'

export const metadata = { title: 'New Verification' }

export default function NewVerificationPage() {
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 py-6 sm:px-6">
      <PageHeader
        title="New verification"
        description="Upload a land document. BhuSatya classifies it, extracts its fields, inspects it for tampering and compares it with the official registry."
      />
      <UploadFlow />
    </div>
  )
}
