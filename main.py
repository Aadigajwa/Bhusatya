"""
BHUSATYA - Land Document Analysis & Explainable Tampering Detection API
FastAPI backend server providing:
1. OCR Text Extraction (PaddleOCR for Hindi and English)
2. Structured Land Document Information Extraction
3. Multi-modal Explainable Fake and Tampered Document Forensics:
   - Typography & Font Appearance Inconsistency Detection
   - Error Level Analysis (ELA) Compression Discrepancy
   - Copy-Move / Cloning Forgery Detection
   - Edge Discontinuity & Digital Splice Detection
   - Official Stamp & Seal Integrity Verification
   - Semantic, Chronological & Financial Cross-Validation
4. Annotated Forensic Evidence and ELA Heatmap Image Generation
5. File download and static inspection endpoints
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from threading import Lock
from typing import Any, Dict, Optional
from uuid import uuid4

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from OCR_test import create_ocr_engine, extract_text_regions
from functionalities.information_extractor import extract_document_information
from functionalities.tampering_detector import ExplainableTamperingEngine
from font_inconsistency import FontInconsistencyAnalyzer


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("bhusatya")


# ---------------------------------------------------------------------------
# Paths and Configuration
# ---------------------------------------------------------------------------

PROJECT_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = PROJECT_DIR / "uploads"
OUTPUT_DIR = PROJECT_DIR / "outputs"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB

ALLOWED_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".tif",
    ".tiff",
}


# ---------------------------------------------------------------------------
# FastAPI Application & CORS
# ---------------------------------------------------------------------------

app = FastAPI(
    title="BHUSATYA API",
    description="Explainable Land Document OCR, Information Extraction & Tampering Detection Engine",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Shared Singletons and Thread Locks
# ---------------------------------------------------------------------------

_ocr_engine = None
_ocr_lock = Lock()
_tampering_engine = None
_tampering_lock = Lock()


def get_ocr_engine():
    """Thread-safe lazy initialization of the PaddleOCR engine."""
    global _ocr_engine
    if _ocr_engine is None:
        with _ocr_lock:
            if _ocr_engine is None:
                logger.info("Initializing PaddleOCR engine (Hindi + English)...")
                _ocr_engine = create_ocr_engine()
    return _ocr_engine


def get_tampering_engine() -> ExplainableTamperingEngine:
    """Thread-safe lazy initialization of the explainable tampering detection engine."""
    global _tampering_engine
    if _tampering_engine is None:
        with _tampering_lock:
            if _tampering_engine is None:
                logger.info("Initializing Explainable Tampering Engine...")
                _tampering_engine = ExplainableTamperingEngine(output_dir=OUTPUT_DIR)
    return _tampering_engine


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def save_json(path: Path, data: Any) -> None:
    """Save data as UTF-8 encoded JSON."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


async def receive_document(file: UploadFile) -> tuple[str, Path, Path]:
    """Validate and persist an uploaded document image."""
    document_id = uuid4().hex
    image_path = None

    try:
        filename = Path(file.filename or "").name
        extension = Path(filename).suffix.lower()

        if extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type '{extension}'. Upload PNG, JPG, JPEG, WEBP, or TIFF.",
            )

        content = await file.read(MAX_FILE_SIZE + 1)
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="File exceeds the 15 MB upload limit.",
            )

        # Validate that bytes form a readable image
        image_array = np.frombuffer(content, dtype=np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        if image is None:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is not a valid or readable image.",
            )

        image_path = UPLOAD_DIR / f"{document_id}{extension}"
        output_dir = OUTPUT_DIR / document_id
        output_dir.mkdir(parents=True, exist_ok=True)

        await run_in_threadpool(image_path.write_bytes, content)
        logger.info("Document received: id=%s, size=%d bytes", document_id, len(content))
        return document_id, image_path, output_dir

    except HTTPException:
        raise
    except Exception as error:
        logger.exception("Document ingestion failed")
        if image_path is not None:
            try:
                image_path.unlink(missing_ok=True)
            except OSError:
                pass
        raise HTTPException(
            status_code=500,
            detail="Failed to process and store the uploaded image.",
        ) from error
    finally:
        await file.close()


def process_ocr(image_path: Path, output_dir: Path) -> Dict[str, Any]:
    """Recognize text lines and bounding boxes in document image."""
    engine = get_ocr_engine()
    with _ocr_lock:
        predictions = engine.predict(str(image_path))

    regions = extract_text_regions(predictions)

    extracted_text = "\n".join(
        str(region.get("text", "")).strip()
        for region in regions
        if str(region.get("text", "")).strip()
    )

    save_json(output_dir / "ocr_result.json", regions)
    (output_dir / "extracted_text.txt").write_text(extracted_text, encoding="utf-8")

    return {
        "regions": regions,
        "extracted_text": extracted_text,
    }


def process_information(text: str, output_dir: Path) -> Dict[str, Any]:
    """Extract structured land-document details (parties, dates, amounts, khesra)."""
    information = extract_document_information(text)
    save_json(output_dir / "document_information.json", information)
    return information


def process_tampering_analysis(
    image_path: Path,
    output_dir: Path,
    regions: list,
    information: dict,
    extracted_text: str,
    document_id: str,
) -> Dict[str, Any]:
    """Execute explainable fake & tampering detection pipeline."""
    engine = get_tampering_engine()
    return engine.analyze(
        image_path=image_path,
        ocr_regions=regions,
        structured_info=information,
        extracted_text=extracted_text,
        document_id=document_id,
    )


def build_file_urls(request: Request, document_id: str, files_dict: Dict[str, str]) -> Dict[str, str]:
    """Construct absolute HTTP download URLs for generated reports and evidence files."""
    base_url = str(request.base_url).rstrip("/")
    urls = {}
    for key, path_str in files_dict.items():
        if path_str:
            fname = Path(path_str).name
            urls[fname] = f"{base_url}/files/{document_id}/{fname}"
    return urls


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {
        "project": "BHUSATYA",
        "description": "Land Document Analysis & Explainable Tampering Detection System",
        "status": "running",
        "version": "2.0.0",
        "endpoints": {
            "document_analysis": "/analyze/document",
            "tampering_analysis": "/analyze/tampering",
            "ocr_extraction": "/analyze/ocr",
            "font_consistency": "/analyze/font-consistency",
            "file_download": "/files/{document_id}/{filename}",
            "health": "/health",
        },
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "ocr_loaded": _ocr_engine is not None,
        "tampering_engine_loaded": _tampering_engine is not None,
    }


# ---------------------------------------------------------------------------
# 1. Main Comprehensive Endpoint: OCR + Info Extraction + Tampering Analysis
# ---------------------------------------------------------------------------

@app.post("/analyze/document")
async def analyze_document(request: Request, file: UploadFile = File(...)):
    """
    End-to-end land document verification:
    1. Ingests document image
    2. PaddleOCR text extraction (Hindi + English)
    3. Structured legal deed information extraction
    4. Multi-modal explainable tampering analysis (typography, ELA, cloning, stamps, semantics)
    5. Returns full report, plain text, and downloadable evidence URLs
    """
    document_id = None
    try:
        # Step 1: Ingest document image
        document_id, image_path, output_dir = await receive_document(file)

        # Step 2: Run OCR
        ocr_result = await run_in_threadpool(process_ocr, image_path, output_dir)
        extracted_text = ocr_result["extracted_text"]
        regions = ocr_result["regions"]

        # Step 3: Extract structured land deed information
        information = await run_in_threadpool(process_information, extracted_text, output_dir)

        # Step 4: Execute explainable fake & tampering detection
        tampering_report = await run_in_threadpool(
            process_tampering_analysis,
            image_path,
            output_dir,
            regions,
            information,
            extracted_text,
            document_id,
        )

        # Step 5: Build download URLs for artifacts
        files_to_expose = {
            "ocr_result.json": str(output_dir / "ocr_result.json"),
            "extracted_text.txt": str(output_dir / "extracted_text.txt"),
            "document_information.json": str(output_dir / "document_information.json"),
            "tampering_report.json": str(output_dir / "tampering_report.json"),
            "tampering_annotated.png": tampering_report.get("generated_files", {}).get("annotated_evidence_image", ""),
            "ela_heatmap.png": tampering_report.get("generated_files", {}).get("ela_heatmap_image", ""),
        }
        file_urls = build_file_urls(request, document_id, files_to_expose)

        # Step 6: Assemble comprehensive response
        response = {
            "document_id": document_id,
            "status": "completed",
            "extracted_text": extracted_text,
            "verdict": tampering_report.get("verdict"),
            "verdict_label": tampering_report.get("verdict_label"),
            "tampering_risk_score": tampering_report.get("tampering_risk_score"),
            "executive_summary": tampering_report.get("executive_summary"),
            "tampering_analysis": tampering_report,
            "results": {
                "ocr": {
                    "region_count": len(regions),
                    "regions": regions,
                    "extracted_text": extracted_text,
                },
                "information_extraction": information,
                "tampering_analysis": tampering_report,
            },
            "file_urls": file_urls,
            "files": file_urls,
        }

        logger.info(
            "Complete analysis finished: id=%s, regions=%d, text_len=%d, verdict=%s, risk=%s%%",
            document_id,
            len(regions),
            len(extracted_text),
            tampering_report.get("verdict"),
            tampering_report.get("tampering_risk_score"),
        )
        return response

    except HTTPException:
        raise
    except Exception as error:
        logger.exception("Document analysis failed: id=%s", document_id)
        raise HTTPException(
            status_code=500,
            detail=f"Document analysis failed: {type(error).__name__}: {error}",
        ) from error


# ---------------------------------------------------------------------------
# 2. Dedicated OCR Extraction Endpoint
# ---------------------------------------------------------------------------

@app.post("/analyze/ocr")
async def analyze_ocr(request: Request, file: UploadFile = File(...)):
    """
    Extract text lines and bounding boxes from uploaded document image.
    Returns plain text and structured region coordinates directly to frontend.
    """
    document_id = None
    try:
        document_id, image_path, output_dir = await receive_document(file)
        ocr_result = await run_in_threadpool(process_ocr, image_path, output_dir)
        extracted_text = ocr_result["extracted_text"]
        regions = ocr_result["regions"]

        files_to_expose = {
            "ocr_result.json": str(output_dir / "ocr_result.json"),
            "extracted_text.txt": str(output_dir / "extracted_text.txt"),
        }
        file_urls = build_file_urls(request, document_id, files_to_expose)

        return {
            "document_id": document_id,
            "status": "completed",
            "extracted_text": extracted_text,
            "region_count": len(regions),
            "regions": regions,
            "file_urls": file_urls,
        }

    except HTTPException:
        raise
    except Exception as error:
        logger.exception("OCR extraction failed: id=%s", document_id)
        raise HTTPException(
            status_code=500,
            detail=f"OCR extraction failed: {type(error).__name__}: {error}",
        ) from error


# ---------------------------------------------------------------------------
# 3. Dedicated Explainable Tampering Analysis Endpoint
# ---------------------------------------------------------------------------

@app.post("/analyze/tampering")
async def analyze_tampering(request: Request, file: UploadFile = File(...)):
    """
    Run dedicated explainable fake and tampered document detection.
    Analyzes typography inconsistency, ELA compression, copy-move cloning,
    edge splicing, stamp authenticity, and semantic cross-validation.
    """
    document_id = None
    try:
        document_id, image_path, output_dir = await receive_document(file)

        # Run OCR first so regions are available for localized forensics
        ocr_result = await run_in_threadpool(process_ocr, image_path, output_dir)
        extracted_text = ocr_result["extracted_text"]
        regions = ocr_result["regions"]

        # Run information extraction for semantic validation
        information = await run_in_threadpool(process_information, extracted_text, output_dir)

        # Run tampering analysis
        tampering_report = await run_in_threadpool(
            process_tampering_analysis,
            image_path,
            output_dir,
            regions,
            information,
            extracted_text,
            document_id,
        )

        files_to_expose = {
            "tampering_report.json": str(output_dir / "tampering_report.json"),
            "tampering_annotated.png": tampering_report.get("generated_files", {}).get("annotated_evidence_image", ""),
            "ela_heatmap.png": tampering_report.get("generated_files", {}).get("ela_heatmap_image", ""),
        }
        file_urls = build_file_urls(request, document_id, files_to_expose)
        tampering_report["file_urls"] = file_urls

        return {
            "document_id": document_id,
            "status": "completed",
            "extracted_text": extracted_text,
            "tampering_analysis": tampering_report,
            "file_urls": file_urls,
        }

    except HTTPException:
        raise
    except Exception as error:
        logger.exception("Tampering analysis failed: id=%s", document_id)
        raise HTTPException(
            status_code=500,
            detail=f"Tampering analysis failed: {type(error).__name__}: {error}",
        ) from error


# ---------------------------------------------------------------------------
# 4. Font Consistency Analysis Endpoint (UI Integration)
# ---------------------------------------------------------------------------

@app.post("/analyze/font-consistency")
async def analyze_font_consistency(request: Request, file: UploadFile = File(...)):
    """
    Evaluate font appearance inconsistencies (stroke thickness, height, slant, baseline offsets).
    Directly satisfies the UI font analysis check.
    """
    document_id = None
    try:
        document_id, image_path, output_dir = await receive_document(file)

        # Run OCR first to feed existing boxes
        ocr_result = await run_in_threadpool(process_ocr, image_path, output_dir)
        regions = ocr_result["regions"]

        def run_font_check():
            analyzer = FontInconsistencyAnalyzer(use_ocr=False, anomaly_threshold=2.8)
            return analyzer.analyze(
                image=str(image_path),
                output_dir=str(output_dir),
                ocr_items=regions,
            )

        report = await run_in_threadpool(run_font_check)

        files_to_expose = {
            "font_anomalies.png": str(output_dir / f"{image_path.stem}_font_anomalies.png"),
            "font_report.json": str(output_dir / f"{image_path.stem}_font_report.json"),
        }
        report["file_urls"] = build_file_urls(request, document_id, files_to_expose)
        report["document_id"] = document_id
        report["status"] = "completed"

        return report

    except HTTPException:
        raise
    except Exception as error:
        logger.exception("Font consistency check failed: id=%s", document_id)
        raise HTTPException(
            status_code=500,
            detail=f"Font consistency check failed: {type(error).__name__}: {error}",
        ) from error


# ---------------------------------------------------------------------------
# 5. File Retrieval Endpoint
# ---------------------------------------------------------------------------

@app.get("/files/{document_id}/{filename}")
def get_generated_file(document_id: str, filename: str):
    """Serve generated report files, OCR text, and forensic evidence images."""
    # Sanitize inputs to prevent directory traversal
    safe_doc_id = Path(document_id).name
    safe_filename = Path(filename).name

    file_path = (OUTPUT_DIR / safe_doc_id / safe_filename).resolve()

    # Security check: must reside inside OUTPUT_DIR
    if not str(file_path).startswith(str(OUTPUT_DIR.resolve())):
        raise HTTPException(status_code=403, detail="Forbidden file path.")

    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found.")

    media_types = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".json": "application/json",
        ".txt": "text/plain; charset=utf-8",
    }
    media_type = media_types.get(file_path.suffix.lower(), "application/octet-stream")

    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        filename=safe_filename,
    )


# ---------------------------------------------------------------------------
# Main Entry Point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)