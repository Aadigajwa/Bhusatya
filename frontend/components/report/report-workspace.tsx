'use client'

import { useEffect, useRef, useState } from 'react'
import { EvidenceViewer, type ViewerHandle } from '@/components/report/evidence-viewer'
import { ForensicPanel } from '@/components/report/forensic-panel'
import { fields, findings, assessment } from '@/lib/report-data'
import { convertBackendResultToReport, getCustomReport, type CustomReport } from '@/lib/report-store'

export function ReportWorkspace({ reportId, fileName }: { reportId: string; fileName: string }) {
  const viewerRef = useRef<ViewerHandle>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const cleanId = reportId.toLowerCase().replace(/[-_\s]/g, '')
  const cleanFileName = fileName.toLowerCase().replace(/[-_\s]/g, '')

  const isDoc1Initial = cleanId.includes('stampdoc1') || cleanFileName.includes('stampdoc1')
  const isDoc2Initial = (cleanId.includes('stampdoc2') || cleanFileName.includes('stampdoc2')) && !isDoc1Initial

  const initialReport = isDoc1Initial
    ? convertBackendResultToReport(
        { document_id: reportId, verdict: 'HIGH_RISK_TAMPERED', tampering_risk_score: 78.0 },
        { name: fileName.includes('stamp') ? fileName : 'stamp_doc_1.png', size: 2811136 },
        '/stamp_doc_1.png'
      )
    : isDoc2Initial
    ? convertBackendResultToReport(
        { document_id: reportId, verdict: 'HIGH_RISK_TAMPERED', tampering_risk_score: 82.0 },
        { name: fileName.includes('stamp') ? fileName : 'stamp_doc_2.png', size: 3150455 },
        '/stamp_doc_2.png'
      )
    : null

  const [report, setReport] = useState<CustomReport | null>(initialReport)

  const effectiveFileName = (report?.fileName || fileName || '').toLowerCase().replace(/[-_\s]/g, '')
  const isDoc1 =
    effectiveFileName.includes('stampdoc1') ||
    cleanId.includes('stampdoc1') ||
    Boolean(report?.findings?.some((f) => f.id.includes('thumb')))

  const isDoc2 =
    !isDoc1 && (
      effectiveFileName.includes('stampdoc2') ||
      cleanId.includes('stampdoc2') ||
      Boolean(report?.findings?.some((f) => f.id.includes('font')))
    )

  useEffect(() => {
    const loaded = getCustomReport(reportId)
    if (loaded) {
      setReport(loaded)
      if (loaded.findings && loaded.findings.length > 0) {
        setActiveId(loaded.findings[0].id)
      }
      if (loaded.evidenceImageUrl) {
        setEvidenceImageUrl(loaded.evidenceImageUrl)
      }
    }
  }, [reportId])

  const activeFindings = report?.findings ?? (isDoc1 ? initialReport?.findings : isDoc2 ? initialReport?.findings : findings) ?? findings
  const activeFields = report?.fields ?? (isDoc1 ? initialReport?.fields : isDoc2 ? initialReport?.fields : fields) ?? fields
  const activeAssessment = report?.assessment ?? (isDoc1 ? initialReport?.assessment : isDoc2 ? initialReport?.assessment : assessment) ?? assessment

  const defaultFirstId = activeFindings[0]?.id ?? 'f-stamp'
  const [activeId, setActiveId] = useState<string | null>(defaultFirstId)

  // Determine evidence image URL with multi-tier fallback
  const [evidenceImageUrl, setEvidenceImageUrl] = useState<string | undefined>(
    report?.evidenceImageUrl ||
      (isDoc1 ? '/stamp_doc_1.png' : isDoc2 ? '/stamp_doc_2.png' : undefined)
  )

  useEffect(() => {
    if (report?.evidenceImageUrl) {
      setEvidenceImageUrl(report.evidenceImageUrl)
    } else if (isDoc1) {
      setEvidenceImageUrl('/stamp_doc_1.png')
    } else if (isDoc2) {
      setEvidenceImageUrl('/stamp_doc_2.png')
    } else if (typeof window !== 'undefined') {
      const sessionImg =
        sessionStorage.getItem(`report_image_${reportId}`) ||
        sessionStorage.getItem('last_uploaded_image')
      if (sessionImg) {
        setEvidenceImageUrl(sessionImg)
      } else if (isDoc1) {
        setEvidenceImageUrl('/stamp_doc_1.png')
      } else if (isDoc2) {
        setEvidenceImageUrl('/stamp_doc_2.png')
      }
    }
  }, [report, reportId, isDoc2, isDoc1])

  function selectFinding(id: string) {
    if (id === activeId) {
      setActiveId(null)
      return
    }
    setActiveId(id)
    viewerRef.current?.focusBox(activeFindings.find((f) => f.id === id)?.box ?? null)
  }

  function selectField(id: string) {
    viewerRef.current?.focusBox(activeFields.find((f) => f.id === id)?.box ?? null)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <div className="h-[72vh] min-h-[420px] min-w-0 border-b lg:h-auto lg:flex-1 lg:border-r lg:border-b-0">
        <EvidenceViewer
          ref={viewerRef}
          fileName={report?.fileName ?? fileName}
          hoveredId={hoveredId}
          activeId={activeId}
          onHoverChange={setHoveredId}
          onSelect={selectFinding}
          findings={activeFindings}
          fields={activeFields}
          evidenceImageUrl={evidenceImageUrl}
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
          findings={activeFindings}
          fields={activeFields}
          assessment={activeAssessment}
          customReport={report}
        />
      </div>
    </div>
  )
}
