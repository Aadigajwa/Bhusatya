import { cn } from '@/lib/utils'
import type { DocStatus } from '@/lib/mock-data'

const config: Record<DocStatus, { label: string; pill: string }> = {
  verified: {
    label: 'Verified',
    pill: 'bg-verified-soft text-verified',
  },
  review: {
    label: 'Requires review',
    pill: 'bg-warn-soft text-warn',
  },
  anomaly: {
    label: 'Anomaly',
    pill: 'bg-critical-soft text-critical',
  },
  processing: {
    label: 'Processing',
    pill: 'bg-muted text-muted-foreground',
  },
}

export function StatusPill({ status, className }: { status: DocStatus; className?: string }) {
  const c = config[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap uppercase',
        c.pill,
        className,
      )}
    >
      {c.label}
    </span>
  )
}