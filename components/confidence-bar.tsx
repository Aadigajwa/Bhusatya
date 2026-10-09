function toneFor(value: number) {
  if (value >= 85) return 'bg-verified'
  if (value >= 55) return 'bg-warn'
  return 'bg-critical'
}

export function ConfidenceBar({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-sm text-muted-foreground">Pending</span>
  }
  return (
    <div
      className="flex items-center gap-3"
      role="img"
      aria-label={`AI confidence ${value} percent`}
    >
      <div className="h-1.5 w-28 overflow-hidden rounded-sm bg-border" aria-hidden>
        <div className={`h-full ${toneFor(value)}`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-9 font-mono text-xs tabular text-foreground">{value}%</span>
    </div>
  )
}