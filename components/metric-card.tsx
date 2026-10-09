import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Metric } from '@/lib/mock-data'

const toneClass: Record<Metric['tone'], string> = {
  good: 'text-verified',
  bad: 'text-warn',
  neutral: 'text-muted-foreground',
}

const sparkColor: Record<Metric['tone'], string> = {
  good: '#2f6b46',
  bad: '#8a5a0b',
  neutral: '#6b6158',
}

function Sparkline({ series, color }: { series: number[]; color: string }) {
  const w = 96
  const h = 28
  const min = Math.min(...series)
  const max = Math.max(...series)
  const points = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * w
      const y = h - 2 - ((v - min) / (max - min || 1)) * (h - 4)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.25"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function MetricCard({ metric }: { metric: Metric }) {
  const Arrow = metric.direction === 'up' ? ArrowUpRight : ArrowDownRight
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {metric.label}
      </p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="font-mono text-3xl font-medium tabular tracking-tight text-foreground">
          {metric.value}
        </p>
        <Sparkline series={metric.series} color={sparkColor[metric.tone]} />
      </div>
      <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
        <span className={cn('inline-flex items-center gap-0.5 font-medium', toneClass[metric.tone])}>
          <Arrow className="size-3.5" aria-hidden />
          {metric.delta}
        </span>
        <span>vs. previous 30 days</span>
      </p>
    </div>
  )
}
