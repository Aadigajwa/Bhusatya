import { PageHeader } from '@/components/page-header'

export const metadata = { title: 'Settings' }

const rows = [
  {
    label: 'Role',
    value: 'Government Verifier',
    hint: 'Determines which reports you can escalate or sign off.',
  },
  {
    label: 'Review threshold',
    value: 'Below 85% confidence',
    hint: 'Documents under this score are routed to manual review.',
  },
  {
    label: 'Registry source',
    value: 'State Land Records Registry (read-only)',
    hint: 'Used for field-level comparison on every report.',
  },
  {
    label: 'Retention',
    value: '7 years',
    hint: 'Source scans and reports are archived per department policy.',
  },
]

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-[880px] flex-col gap-6 px-4 py-6 sm:px-6">
      <PageHeader
        title="Settings"
        description="Verification policy and connection details for your workspace."
      />
      <section className="rounded-lg border bg-card shadow-sm" aria-label="Workspace settings">
        <dl className="divide-y">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid gap-1 px-4 py-4 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-6"
            >
              <dt className="text-sm font-medium text-foreground">{row.label}</dt>
              <dd>
                <p className="text-sm text-foreground">{row.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{row.hint}</p>
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
