'use client'

import { useRef, useState } from 'react'
import { EvidenceViewer, type ViewerHandle } from '@/components/report/evidence-viewer'
import { ForensicPanel } from '@/components/report/forensic-panel'
import { fields, findings } from '@/lib/report-data'

export function ReportWorkspace({ reportId, fileName }: { reportId: string; fileName: string }) {
  const viewerRef = useRef<ViewerHandle>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>('f-stamp')

  function selectFinding(id: string) {
    if (id === activeId) {
      setActiveId(null)
      return
    }
    setActiveId(id)
    viewerRef.current?.focusBox(findings.find((f) => f.id === id)?.box ?? null)
  }

  function selectField(id: string) {
    viewerRef.current?.focusBox(fields.find((f) => f.id === id)?.box ?? null)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <div className="h-[72vh] min-h-[420px] min-w-0 border-b lg:h-auto lg:flex-1 lg:border-r lg:border-b-0">
        <EvidenceViewer
          ref={viewerRef}
          fileName={fileName}
          hoveredId={hoveredId}
          activeId={activeId}
          onHoverChange={setHoveredId}
          onSelect={selectFinding}
        />
      </div>
      <div className="min-h-0 shrink-0 lg:w-[480px] xl:w-[520px]">
        <ForensicPanel
          reportId={reportId}
          hoveredId={hoveredId}
          activeId={activeId}
          onHoverChange={setHoveredId}
          onSelectFinding={selectFinding}
          onSelectField={selectField}
        />
      </div>
    </div>
  )
}
