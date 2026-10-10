'use client'

import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Ref } from 'react'
import { Maximize2, ScanText, ShieldAlert, ZoomIn, ZoomOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PAGE, fields, findings, type Box, type Finding, type Severity } from '@/lib/report-data'
import { LandRecordPage } from '@/components/report/land-record-page'

export interface ViewerHandle {
  focusBox: (box: Box | null) => void
}

interface ViewState {
  s: number
  x: number
  y: number
}

const MIN_SCALE = 0.3
const MAX_SCALE = 5
const MINIMAP_SCALE = 0.12

const severityColor: Record<Severity, string> = {
  critical: '#a8352a',
  warning: '#b7791f',
  pass: '#2f6b46',
}
const FIELD_COLOR = '#2c3e63'

// Font inconsistency findings get a special purple/violet color
const FONT_FINDING_COLOR = '#7c3aed'
const FONT_FINDING_IDS = new Set([
  'f-font-family',
  'f-font-size',
  'f-font-size-medallion',
  'f-font-size-body',
  'f-font-style',
])
const FONT_FINDING_LABELS: Record<string, string> = {
  'f-font-family': 'Font Family',
  'f-font-size': 'Font Size (Top ₹25000)',
  'f-font-size-medallion': 'Font Size (Medallion ₹2500)',
  'f-font-size-body': 'Font Size (Deed Amount)',
  'f-font-style': 'Font Style',
}

// Biometric thumb impression findings get a prominent critical red badge & border
const THUMB_FINDING_COLOR = '#dc2626'
const THUMB_FINDING_IDS = new Set([
  'f-thumb-left',
  'f-thumb-right',
  'f-thumb-gemini-logo',
  'f-thumb-ai-right',
])
const THUMB_FINDING_LABELS: Record<string, string> = {
  'f-thumb-left': 'Fake Thumb Impression (Left)',
  'f-thumb-right': 'Fake Thumb Impression (Right)',
  'f-thumb-gemini-logo': 'Gemini AI Logo at Thumb Print',
  'f-thumb-ai-right': 'AI Generated Thumb Impression',
}


const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

function fitView(w: number, h: number): ViewState {
  const s = clamp(Math.min((w - 48) / PAGE.width, (h - 48) / PAGE.height), MIN_SCALE, 1.5)
  return { s, x: (w - PAGE.width * s) / 2, y: (h - PAGE.height * s) / 2 }
}

function zoomAt(v: ViewState, factor: number, cx: number, cy: number): ViewState {
  const s = clamp(v.s * factor, MIN_SCALE, MAX_SCALE)
  const r = s / v.s
  return { s, x: cx - (cx - v.x) * r, y: cy - (cy - v.y) * r }
}

interface OverlayItem {
  id: string
  kind: 'field' | 'finding'
  label: string
  index?: number
  color: string
  box: Box
}

export function EvidenceViewer({
  ref,
  fileName,
  hoveredId,
  activeId,
  onHoverChange,
  onSelect,
  findings: findingsProp,
  fields: fieldsProp,
  evidenceImageUrl,
}: {
  ref?: Ref<ViewerHandle>
  fileName: string
  hoveredId: string | null
  activeId: string | null
  onHoverChange: (id: string | null) => void
  onSelect: (id: string) => void
  findings?: Finding[]
  fields?: typeof fields
  evidenceImageUrl?: string
}) {
  const currentFields = fieldsProp ?? fields
  const currentFindings = findingsProp ?? findings

  const overlayItems: OverlayItem[] = [
    ...currentFields.map<OverlayItem>((f) => ({
      id: f.id,
      kind: 'field',
      label: f.label,
      color: FIELD_COLOR,
      box: f.box,
    })),
    ...currentFindings.flatMap<OverlayItem>((f, i) =>
      f.box
        ? [
            {
              id: f.id,
              kind: 'finding',
              label: THUMB_FINDING_IDS.has(f.id)
                ? (THUMB_FINDING_LABELS[f.id] ?? f.title)
                : FONT_FINDING_IDS.has(f.id)
                ? (FONT_FINDING_LABELS[f.id] ?? f.title)
                : f.title,
              index: i + 1,
              color: THUMB_FINDING_IDS.has(f.id)
                ? THUMB_FINDING_COLOR
                : FONT_FINDING_IDS.has(f.id)
                ? FONT_FINDING_COLOR
                : severityColor[f.severity as Severity] ?? '#a8352a',
              box: f.box,

            },
          ]
        : [],
    ),
  ]
  const canvasRef = useRef<HTMLDivElement>(null)
  const sizeRef = useRef({ w: 0, h: 0 })
  const didFit = useRef(false)
  const pressRef = useRef<{ id: number; x: number; y: number; vx: number; vy: number } | null>(null)

  const [view, setView] = useState<ViewState>({ s: 1, x: 0, y: 0 })
  const [smooth, setSmooth] = useState(true)
  const [panning, setPanning] = useState(false)
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const [showFindings, setShowFindings] = useState(true)
  const [showFields, setShowFields] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      sizeRef.current = { w: width, h: height }
      setCanvasSize({ w: width, h: height })
      if (!didFit.current && width > 0 && height > 0) {
        didFit.current = true
        setSmooth(false)
        setView(fitView(width, height))
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const factor = Math.exp(-e.deltaY * 0.0018)
      setSmooth(false)
      setView((v) => zoomAt(v, factor, e.clientX - rect.left, e.clientY - rect.top))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const fit = useCallback(() => {
    const { w, h } = sizeRef.current
    setSmooth(true)
    setView(fitView(w, h))
  }, [])

  const zoomCenter = useCallback((factor: number) => {
    const { w, h } = sizeRef.current
    setSmooth(true)
    setView((v) => zoomAt(v, factor, w / 2, h / 2))
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      focusBox(box) {
        const { w, h } = sizeRef.current
        setSmooth(true)
        if (!box) {
          setView(fitView(w, h))
          return
        }
        const s = clamp(Math.min((w * 0.55) / box.w, (h * 0.5) / box.h), 0.6, 3.2)
        setView({
          s,
          x: w / 2 - (box.x + box.w / 2) * s,
          y: h / 2 - (box.y + box.h / 2) * s,
        })
      },
    }),
    [],
  )

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return
    pressRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, vx: view.x, vy: view.y }
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    setCursor({
      x: Math.round((e.clientX - rect.left - view.x) / view.s),
      y: Math.round((e.clientY - rect.top - view.y) / view.s),
    })
    const press = pressRef.current
    if (!press) return
    const dx = e.clientX - press.x
    const dy = e.clientY - press.y
    if (!panning && Math.hypot(dx, dy) > 4) {
      e.currentTarget.setPointerCapture(press.id)
      setPanning(true)
      setSmooth(false)
    }
    if (panning) {
      setView((v) => ({ ...v, x: press.vx + dx, y: press.vy + dy }))
    }
  }

  function endPointer(e: React.PointerEvent<HTMLDivElement>) {
    if (pressRef.current && e.currentTarget.hasPointerCapture(pressRef.current.id)) {
      e.currentTarget.releasePointerCapture(pressRef.current.id)
    }
    pressRef.current = null
    setPanning(false)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const step = 60
    const pan = (dx: number, dy: number) => {
      setSmooth(true)
      setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }))
    }
    switch (e.key) {
      case '+':
      case '=':
        zoomCenter(1.25)
        break
      case '-':
        zoomCenter(0.8)
        break
      case '0':
        fit()
        break
      case 'ArrowLeft':
        pan(step, 0)
        break
      case 'ArrowRight':
        pan(-step, 0)
        break
      case 'ArrowUp':
        pan(0, step)
        break
      case 'ArrowDown':
        pan(0, -step)
        break
      default:
        return
    }
    e.preventDefault()
  }

  function jumpFromMinimap(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * PAGE.width
    const py = ((e.clientY - rect.top) / rect.height) * PAGE.height
    const { w, h } = sizeRef.current
    setSmooth(true)
    setView((v) => ({ ...v, x: w / 2 - px * v.s, y: h / 2 - py * v.s }))
  }

  const isHighlighted = (id: string) => id === hoveredId || id === activeId
  const visible = overlayItems
    .filter((item) => {
      if (isHighlighted(item.id)) return true
      return item.kind === 'finding' ? showFindings : showFields
    })
    .sort((a, b) => Number(isHighlighted(a.id)) - Number(isHighlighted(b.id)))

  const vp = {
    x: -view.x / view.s,
    y: -view.y / view.s,
    w: canvasSize.w / view.s,
    h: canvasSize.h / view.s,
  }

  return (
    <section
      aria-label="Evidence viewer"
      className="flex h-full min-h-0 flex-col bg-card"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-foreground">Evidence viewer</h2>
          <p className="truncate font-mono text-[11px] text-muted-foreground">{fileName}</p>
        </div>

        <div className="flex items-center gap-2">
          <div role="group" aria-label="Overlay layers" className="flex rounded-md border bg-muted p-0.5">
            <LayerToggle
              pressed={showFindings}
              onClick={() => setShowFindings((v) => !v)}
              icon={<ShieldAlert className="size-3.5" aria-hidden />}
              label="Findings"
            />
            <LayerToggle
              pressed={showFields}
              onClick={() => setShowFields((v) => !v)}
              icon={<ScanText className="size-3.5" aria-hidden />}
              label="Extracted text"
            />
          </div>

          <div role="group" aria-label="Zoom controls" className="flex items-center rounded-md border bg-card shadow-sm">
            <ToolButton label="Zoom out" onClick={() => zoomCenter(0.8)}>
              <ZoomOut className="size-4" aria-hidden />
            </ToolButton>
            <span className="w-11 text-center font-mono text-xs text-foreground tabular" aria-live="off">
              {Math.round(view.s * 100)}%
            </span>
            <ToolButton label="Zoom in" onClick={() => zoomCenter(1.25)}>
              <ZoomIn className="size-4" aria-hidden />
            </ToolButton>
            <span aria-hidden className="h-4 w-px bg-border" />
            <ToolButton label="Fit page to view" onClick={fit}>
              <Maximize2 className="size-4" aria-hidden />
            </ToolButton>
          </div>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <div
          ref={canvasRef}
          tabIndex={0}
          role="application"
          aria-label="Document evidence viewer. Drag to pan, scroll to zoom, use plus and minus keys to zoom and arrow keys to pan."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onPointerLeave={() => setCursor(null)}
          onKeyDown={onKeyDown}
          className={cn(
            'absolute inset-0 overflow-hidden bg-[#e8e4d9] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
            panning ? 'cursor-grabbing' : 'cursor-grab',
          )}
          style={{
            backgroundImage: 'radial-gradient(#cfc9ba 1px, transparent 1px)',
            backgroundSize: '16px 16px',
            touchAction: 'none',
          }}
        >
          <div
            className={cn(
              'absolute top-0 left-0 will-change-transform',
              smooth && 'transition-transform duration-300 ease-out',
            )}
            style={{
              width: PAGE.width,
              height: PAGE.height,
              transformOrigin: '0 0',
              transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})`,
            }}
          >
            <div
              className="border border-black/20 shadow-sm bg-white overflow-hidden"
              style={{ width: PAGE.width, height: PAGE.height }}
            >
              {evidenceImageUrl ? (
                <img
                  src={evidenceImageUrl}
                  alt="Document evidence"
                  className="block w-full h-full object-fill select-none pointer-events-none"
                  style={{ width: PAGE.width, height: PAGE.height }}
                />
              ) : (
                <LandRecordPage />
              )}
            </div>

            <svg
              width={PAGE.width}
              height={PAGE.height}
              viewBox={`0 0 ${PAGE.width} ${PAGE.height}`}
              className="absolute top-0 left-0 overflow-visible"
              aria-hidden
            >
              <defs>
                <filter id="font-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {visible.map((item) => {
                const on = isHighlighted(item.id)
                const isFontFinding = FONT_FINDING_IDS.has(item.id)
                const isThumbFinding = THUMB_FINDING_IDS.has(item.id)
                const isSpecialFinding = isFontFinding || isThumbFinding
                const accentColor = isThumbFinding ? THUMB_FINDING_COLOR : FONT_FINDING_COLOR

                if (isSpecialFinding) {
                  return (
                    <g key={item.id}
                      className="cursor-pointer"
                      onPointerEnter={() => onHoverChange(item.id)}
                      onPointerLeave={() => onHoverChange(null)}
                      onClick={() => onSelect(item.id)}
                    >
                      {/* Outer glow fill */}
                      <rect
                        x={item.box.x - 2}
                        y={item.box.y - 2}
                        width={item.box.w + 4}
                        height={item.box.h + 4}
                        fill={accentColor}
                        fillOpacity={on ? 0.24 : 0.12}
                        rx={3}
                        filter={on ? 'url(#font-glow)' : undefined}
                        vectorEffect="non-scaling-stroke"
                      />
                      {/* Animated dashed border */}
                      <rect
                        x={item.box.x}
                        y={item.box.y}
                        width={item.box.w}
                        height={item.box.h}
                        fill="none"
                        stroke={accentColor}
                        strokeWidth={on ? 2.5 : 2.0}
                        strokeDasharray="6 3"
                        rx={2}
                        vectorEffect="non-scaling-stroke"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          values="0;-18"
                          dur="1.2s"
                          repeatCount="indefinite"
                        />
                      </rect>
                      {/* Corner accent marks */}
                      <path
                        d={`M${item.box.x},${item.box.y + 8} L${item.box.x},${item.box.y} L${item.box.x + 8},${item.box.y}`}
                        fill="none"
                        stroke={accentColor}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                      />
                      <path
                        d={`M${item.box.x + item.box.w - 8},${item.box.y} L${item.box.x + item.box.w},${item.box.y} L${item.box.x + item.box.w},${item.box.y + 8}`}
                        fill="none"
                        stroke={accentColor}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                      />
                      <path
                        d={`M${item.box.x},${item.box.y + item.box.h - 8} L${item.box.x},${item.box.y + item.box.h} L${item.box.x + 8},${item.box.y + item.box.h}`}
                        fill="none"
                        stroke={accentColor}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                      />
                      <path
                        d={`M${item.box.x + item.box.w - 8},${item.box.y + item.box.h} L${item.box.x + item.box.w},${item.box.y + item.box.h} L${item.box.x + item.box.w},${item.box.y + item.box.h - 8}`}
                        fill="none"
                        stroke={accentColor}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                      />
                      {/* Label pill on top of box */}
                      <rect
                        x={item.box.x}
                        y={item.box.y - 18}
                        width={item.label.length * 6.5 + 10}
                        height={16}
                        fill={accentColor}
                        rx={3}
                        vectorEffect="non-scaling-stroke"
                      />
                      <text
                        x={item.box.x + 5}
                        y={item.box.y - 6}
                        fill="white"
                        fontSize={9.5}
                        fontFamily="monospace"
                        fontWeight="600"
                        dominantBaseline="middle"
                      >
                        ⚠ {item.label}
                      </text>
                    </g>
                  )
                }
                return (
                  <rect
                    key={item.id}
                    x={item.box.x}
                    y={item.box.y}
                    width={item.box.w}
                    height={item.box.h}
                    fill={item.color}
                    fillOpacity={on ? 0.16 : item.kind === 'finding' ? 0.06 : 0.03}
                    stroke={item.color}
                    strokeWidth={on ? 2.25 : 1.25}
                    strokeDasharray={item.kind === 'field' ? '4 3' : undefined}
                    vectorEffect="non-scaling-stroke"
                    className={cn(item.kind === 'finding' && 'cursor-pointer')}
                    onPointerEnter={() => onHoverChange(item.id)}
                    onPointerLeave={() => onHoverChange(null)}
                    onClick={() => item.kind === 'finding' && onSelect(item.id)}
                  />
                )
              })}
            </svg>

            {visible.map((item) => {
              const on = isHighlighted(item.id)
              if (item.kind === 'field' && !on) return null
              return (
                <div
                  key={item.id}
                  className="pointer-events-none absolute h-0 w-0"
                  style={{ left: item.box.x, top: item.box.y }}
                >
                  <div
                    className="absolute bottom-0 left-0 flex origin-bottom-left items-center gap-1 whitespace-nowrap"
                    style={{ transform: `scale(${1 / view.s})`, marginBottom: 1 }}
                  >
                    {item.index ? (
                      <span
                        className="flex h-[18px] min-w-[18px] items-center justify-center rounded-[3px] px-1 font-mono text-[11px] font-medium text-white"
                        style={{ background: item.color }}
                      >
                        {item.index}
                      </span>
                    ) : null}
                    {on ? (
                      <span
                        className="rounded-[3px] px-1.5 py-0.5 text-[11px] font-medium text-white"
                        style={{ background: item.color }}
                      >
                        {item.label}
                      </span>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div
          role="presentation"
          onPointerDown={jumpFromMinimap}
          className="absolute right-2 bottom-2 cursor-pointer overflow-hidden border bg-card shadow-sm"
          style={{ width: PAGE.width * MINIMAP_SCALE, height: PAGE.height * MINIMAP_SCALE }}
          title="Document mini-map"
        >
          <div
            aria-hidden
            className="pointer-events-none"
            style={{ transform: `scale(${MINIMAP_SCALE})`, transformOrigin: '0 0', width: PAGE.width }}
          >
            {evidenceImageUrl ? (
              <img
                src={evidenceImageUrl}
                alt="Minimap thumbnail"
                className="block object-fill"
                style={{ width: PAGE.width, height: PAGE.height }}
              />
            ) : (
              <LandRecordPage />
            )}
          </div>
          <svg
            viewBox={`0 0 ${PAGE.width} ${PAGE.height}`}
            className="pointer-events-none absolute inset-0"
            aria-hidden
          >
            {currentFindings.map((f) =>
              f.box ? (
                <rect
                  key={f.id}
                  x={f.box.x}
                  y={f.box.y}
                  width={f.box.w}
                  height={f.box.h}
                  fill={severityColor[f.severity as Severity] ?? '#a8352a'}
                  fillOpacity={0.35}

                />
              ) : null,
            )}
            <rect
              x={vp.x}
              y={vp.y}
              width={vp.w}
              height={vp.h}
              fill="#b34e2b"
              fillOpacity={0.08}
              stroke="#b34e2b"
              strokeWidth={14}
            />
          </svg>
        </div>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t px-4 py-1.5 font-mono text-[11px] text-muted-foreground">
        <span>Page 1 / 1 · {PAGE.width} × {PAGE.height} px</span>
        <span className="tabular">
          {cursor ? `x ${cursor.x}  y ${cursor.y}` : 'x —  y —'}
        </span>
      </footer>
    </section>
  )
}

function ToolButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-8 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {children}
    </button>
  )
}

function LayerToggle({
  pressed,
  onClick,
  icon,
  label,
}: {
  pressed: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-[3px] px-2 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        pressed ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {icon}
      {label}
    </button>
  )
}
