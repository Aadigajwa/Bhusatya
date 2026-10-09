"""
BHUSATYA - Land Document Analysis & Explainable Tampering Detection Desktop UI
Features:
1. Select and preview document images (PNG, JPG, TIFF, WEBP)
2. Extract text from document image via PaddleOCR and display in frontend
3. Run explainable fake & tampering detection with forensic verdict, risk score, and evidence
4. Check font and layout consistency
5. View and inspect annotated forensic evidence image and ELA compression heatmap
6. Save structured analysis reports

Run:
    python UI.py
"""

from __future__ import annotations

import json
import os
import threading
from pathlib import Path
from typing import Optional
import tkinter as tk
from tkinter import filedialog, messagebox

import customtkinter as ctk
import requests
from PIL import Image, ImageOps


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

API_BASE_URL = "http://127.0.0.1:8000"
DOCUMENT_ENDPOINT = f"{API_BASE_URL}/analyze/document"
OCR_ENDPOINT = f"{API_BASE_URL}/analyze/ocr"
TAMPERING_ENDPOINT = f"{API_BASE_URL}/analyze/tampering"
FONT_ENDPOINT = f"{API_BASE_URL}/analyze/font-consistency"

PROJECT_DIR = Path(__file__).resolve().parent
REPORT_DIR = PROJECT_DIR / "ui_reports"
OUTPUT_DIR = PROJECT_DIR / "outputs"
REPORT_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 15 * 1024 * 1024

ALLOWED_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff"
}

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")


class BhusatyaUI(ctk.CTk):

    def __init__(self):
        super().__init__()

        self.title("BHUSATYA | Land Document OCR & Explainable Tampering Detection")
        self.geometry("1320x860")
        self.minsize(1050, 720)

        self.selected_file: Optional[Path] = None
        self.preview_image: Optional[ctk.CTkImage] = None
        self.last_report: Optional[dict] = None
        self.last_file_urls: dict = {}
        self.is_processing = False

        self.create_widgets()
        self.check_server()

    # -----------------------------------------------------------------------
    # UI Layout
    # -----------------------------------------------------------------------

    def create_widgets(self):
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)

        # Header Frame
        header = ctk.CTkFrame(self, corner_radius=12, fg_color=("#2B2D42", "#1A1A24"))
        header.grid(row=0, column=0, padx=15, pady=(15, 8), sticky="ew")
        header.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            header,
            text="BHUSATYA  भू-सत्य",
            font=ctk.CTkFont(size=26, weight="bold"),
            text_color="#38BDF8"
        ).grid(row=0, column=0, padx=20, pady=(12, 0), sticky="w")

        ctk.CTkLabel(
            header,
            text="AI-Powered Land Document OCR, Information Extraction & Explainable Forensics",
            font=ctk.CTkFont(size=13),
            text_color="#94A3B8"
        ).grid(row=1, column=0, padx=20, pady=(0, 12), sticky="w")

        self.server_status = ctk.CTkLabel(
            header,
            text="Server: Checking...",
            font=ctk.CTkFont(size=13, weight="bold")
        )
        self.server_status.grid(row=0, column=1, rowspan=2, padx=20)

        # Main Layout (Left: Controls/Preview, Right: Results)
        main = ctk.CTkFrame(self, corner_radius=12)
        main.grid(row=1, column=0, padx=15, pady=8, sticky="nsew")
        main.grid_columnconfigure(0, weight=1)
        main.grid_columnconfigure(1, weight=2)
        main.grid_rowconfigure(0, weight=1)

        # Left Column: Document Selection & Action Buttons
        left = ctk.CTkFrame(main, corner_radius=10)
        left.grid(row=0, column=0, padx=(10, 5), pady=10, sticky="nsew")
        left.grid_columnconfigure(0, weight=1)
        left.grid_rowconfigure(3, weight=1)

        ctk.CTkLabel(
            left,
            text="1. Document Ingestion",
            font=ctk.CTkFont(size=17, weight="bold")
        ).grid(row=0, column=0, padx=12, pady=(14, 6), sticky="w")

        ctk.CTkButton(
            left,
            text="Choose Document Image",
            font=ctk.CTkFont(size=13, weight="bold"),
            command=self.select_file,
            fg_color="#2563EB",
            hover_color="#1D4ED8"
        ).grid(row=1, column=0, padx=12, pady=5, sticky="ew")

        self.file_label = ctk.CTkLabel(
            left,
            text="No document selected",
            wraplength=300,
            justify="left",
            font=ctk.CTkFont(size=12),
            text_color="#94A3B8"
        )
        self.file_label.grid(row=2, column=0, padx=12, pady=4, sticky="ew")

        # Document Preview Box
        self.preview_label = ctk.CTkLabel(
            left,
            text="Document preview will appear here\n(Supports Hindi & English Deeds)",
            corner_radius=8,
            fg_color=("#1E293B", "#0F172A"),
            text_color="#64748B"
        )
        self.preview_label.grid(row=3, column=0, padx=12, pady=8, sticky="nsew")

        # Action Buttons
        buttons_frame = ctk.CTkFrame(left, fg_color="transparent")
        buttons_frame.grid(row=4, column=0, padx=12, pady=4, sticky="ew")
        buttons_frame.grid_columnconfigure(0, weight=1)
        buttons_frame.grid_columnconfigure(1, weight=1)

        # 1. OCR Extraction Only
        self.ocr_button = ctk.CTkButton(
            buttons_frame,
            text="1. Extract Text (OCR)",
            height=38,
            command=self.start_ocr_extraction,
            fg_color="#0D9488",
            hover_color="#0F766E",
            font=ctk.CTkFont(size=12, weight="bold")
        )
        self.ocr_button.grid(row=0, column=0, padx=(0, 4), pady=4, sticky="ew")

        # 2. Font Inconsistency Check
        self.font_button = ctk.CTkButton(
            buttons_frame,
            text="2. Font Check",
            height=38,
            command=self.start_font_analysis,
            fg_color="#7C3AED",
            hover_color="#6D28D9",
            font=ctk.CTkFont(size=12, weight="bold")
        )
        self.font_button.grid(row=0, column=1, padx=(4, 0), pady=4, sticky="ew")

        # 3. Complete End-to-End Analysis (OCR + Forensics + Tampering)
        self.analyze_button = ctk.CTkButton(
            left,
            text="Run Full Analysis (OCR + Tampering Detection)",
            height=42,
            command=self.start_document_analysis,
            fg_color="#DC2626",
            hover_color="#B91C1C",
            font=ctk.CTkFont(size=13, weight="bold")
        )
        self.analyze_button.grid(row=5, column=0, padx=12, pady=6, sticky="ew")

        # 4. View Evidence Image Button
        self.view_evidence_button = ctk.CTkButton(
            left,
            text="View Annotated Evidence Image",
            height=34,
            command=self.open_evidence_image,
            fg_color="#475569",
            hover_color="#334155",
            font=ctk.CTkFont(size=12)
        )
        self.view_evidence_button.grid(row=6, column=0, padx=12, pady=(0, 6), sticky="ew")

        # Progress bar & Status label
        self.progress = ctk.CTkProgressBar(left, mode="indeterminate")
        self.progress.grid(row=7, column=0, padx=12, pady=(2, 4), sticky="ew")
        self.progress.set(0)

        self.action_status = ctk.CTkLabel(
            left,
            text="Select a document image to begin.",
            wraplength=300,
            justify="left",
            font=ctk.CTkFont(size=12)
        )
        self.action_status.grid(row=8, column=0, padx=12, pady=(0, 10), sticky="w")

        # Right Column: Analysis Results Tabs
        right = ctk.CTkFrame(main, corner_radius=10)
        right.grid(row=0, column=1, padx=(5, 10), pady=10, sticky="nsew")
        right.grid_columnconfigure(0, weight=1)
        right.grid_rowconfigure(1, weight=1)

        # Header for Right Side with Quick Verdict Badge
        results_header = ctk.CTkFrame(right, fg_color="transparent")
        results_header.grid(row=0, column=0, padx=12, pady=(10, 4), sticky="ew")
        results_header.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            results_header,
            text="2. Forensic Analysis & Extraction Findings",
            font=ctk.CTkFont(size=17, weight="bold")
        ).grid(row=0, column=0, sticky="w")

        self.verdict_badge = ctk.CTkLabel(
            results_header,
            text="Status: Awaiting Analysis",
            corner_radius=6,
            fg_color="#334155",
            text_color="#E2E8F0",
            font=ctk.CTkFont(size=12, weight="bold"),
            padx=10,
            pady=3
        )
        self.verdict_badge.grid(row=0, column=1, sticky="e")

        # Tabs
        self.tabs = ctk.CTkTabview(right)
        self.tabs.grid(row=1, column=0, padx=10, pady=8, sticky="nsew")

        self.tabs.add("Tampering Forensics")
        self.tabs.add("OCR Extracted Text")
        self.tabs.add("Document Details")
        self.tabs.add("Font Consistency")
        self.tabs.add("Full Report JSON")

        self.tamper_box = self.create_textbox("Tampering Forensics")
        self.ocr_box = self.create_textbox("OCR Extracted Text")
        self.info_box = self.create_textbox("Document Details")
        self.font_box = self.create_textbox("Font Consistency")
        self.report_box = self.create_textbox("Full Report JSON")

        # Bottom Bar: Save Report Button
        bottom_bar = ctk.CTkFrame(right, fg_color="transparent")
        bottom_bar.grid(row=2, column=0, padx=12, pady=(0, 10), sticky="ew")
        bottom_bar.grid_columnconfigure(0, weight=1)

        self.report_info_label = ctk.CTkLabel(
            bottom_bar,
            text="Tip: Click 'Run Full Analysis' for end-to-end OCR and explainable tampering detection.",
            font=ctk.CTkFont(size=11),
            text_color="#94A3B8"
        )
        self.report_info_label.grid(row=0, column=0, sticky="w")

        ctk.CTkButton(
            bottom_bar,
            text="Save Forensic Report",
            font=ctk.CTkFont(size=12, weight="bold"),
            command=self.save_report,
            fg_color="#0284C7",
            hover_color="#0369A1",
            width=160
        ).grid(row=0, column=1, sticky="e")

    def create_textbox(self, tab_name: str) -> ctk.CTkTextbox:
        textbox = ctk.CTkTextbox(
            self.tabs.tab(tab_name),
            wrap="word",
            font=ctk.CTkFont(family="Consolas", size=12)
        )
        textbox.pack(fill="both", expand=True, padx=6, pady=6)
        textbox.insert("1.0", "Results will appear here.")
        textbox.configure(state="disabled")
        return textbox

    # -----------------------------------------------------------------------
    # Helper Methods
    # -----------------------------------------------------------------------

    def set_text(self, textbox: ctk.CTkTextbox, text: str):
        textbox.configure(state="normal")
        textbox.delete("1.0", "end")
        textbox.insert("1.0", text)
        textbox.configure(state="disabled")

    def update_status(self, message: str):
        self.action_status.configure(text=message)

    def set_busy(self, busy: bool, message: str = ""):
        self.is_processing = busy
        if busy:
            self.progress.start()
            self.ocr_button.configure(state="disabled")
            self.analyze_button.configure(state="disabled")
            self.font_button.configure(state="disabled")
        else:
            self.progress.stop()
            self.progress.set(0)
            self.ocr_button.configure(state="normal")
            self.analyze_button.configure(state="normal")
            self.font_button.configure(state="normal")

        if message:
            self.update_status(message)

    def check_server(self):
        def worker():
            try:
                response = requests.get(f"{API_BASE_URL}/health", timeout=4)
                response.raise_for_status()
                data = response.json()
                if data.get("status") == "healthy":
                    message = "Server: Connected"
                    color = "#2ECC71"
                else:
                    message = "Server: Unexpected status"
                    color = "#F39C12"
            except requests.RequestException:
                message = "Server: Offline"
                color = "#E74C3C"

            self.after(
                0,
                lambda: self.server_status.configure(text=message, text_color=color)
            )

        threading.Thread(target=worker, daemon=True).start()

    # -----------------------------------------------------------------------
    # File Selection & Preview
    # -----------------------------------------------------------------------

    def select_file(self):
        path = filedialog.askopenfilename(
            title="Select a land document image",
            filetypes=[
                ("Supported Images", "*.png *.jpg *.jpeg *.webp *.tif *.tiff"),
                ("All files", "*.*")
            ]
        )
        if not path:
            return

        file_path = Path(path)
        if file_path.suffix.lower() not in ALLOWED_EXTENSIONS:
            messagebox.showerror(
                "Unsupported file",
                "Please select a PNG, JPG, JPEG, WEBP, or TIFF image."
            )
            return

        try:
            file_size = file_path.stat().st_size
            if file_size > MAX_FILE_SIZE:
                messagebox.showerror(
                    "File too large", "The image must be 15 MB or smaller."
                )
                return

            with Image.open(file_path) as image:
                image = ImageOps.exif_transpose(image)
                image.load()
                preview = image.convert("RGB")
                preview.thumbnail((360, 420))
                self.preview_image = ctk.CTkImage(
                    light_image=preview,
                    dark_image=preview,
                    size=preview.size
                )

            self.selected_file = file_path
            self.preview_label.configure(image=self.preview_image, text="")
            self.file_label.configure(
                text=f"File: {file_path.name}\nSize: {file_size / 1024:.1f} KB"
            )

            # Reset tabs
            self.set_text(self.tamper_box, "Run Full Analysis to detect fake/tampered document.")
            self.set_text(self.ocr_box, "Click 'Extract Text (OCR)' or 'Run Full Analysis' to extract document text.")
            self.set_text(self.info_box, "Run document analysis to extract structured land deed details.")
            self.set_text(self.font_box, "Run Font Check to evaluate typography anomalies.")
            self.set_text(self.report_box, "No report generated yet.")

            self.verdict_badge.configure(
                text="Status: Ready for Analysis",
                fg_color="#334155",
                text_color="#E2E8F0"
            )
            self.last_report = None
            self.last_file_urls = {}
            self.update_status("Image loaded. Select an analysis action.")

        except Exception as error:
            messagebox.showerror("Image error", f"Could not open image:\n{error}")

    # -----------------------------------------------------------------------
    # API Request Helper
    # -----------------------------------------------------------------------

    def post_image(self, endpoint: str) -> dict:
        if not self.selected_file:
            raise ValueError("Please select a document image first.")

        with self.selected_file.open("rb") as file:
            response = requests.post(
                endpoint,
                files={"file": (self.selected_file.name, file, "application/octet-stream")},
                timeout=300
            )

        if not response.ok:
            try:
                detail = response.json().get("detail", response.text)
            except ValueError:
                detail = response.text
            raise RuntimeError(f"Server returned HTTP {response.status_code}:\n{detail}")

        try:
            return response.json()
        except ValueError as err:
            raise RuntimeError("Server returned an invalid JSON response.") from err

    # -----------------------------------------------------------------------
    # Action 1: Dedicated OCR Extraction (Provide Text to Frontend)
    # -----------------------------------------------------------------------

    def start_ocr_extraction(self):
        if self.is_processing:
            return
        if not self.selected_file:
            messagebox.showwarning("No document", "Please select a document image first.")
            return

        self.set_busy(True, "Extracting Hindi and English text via PaddleOCR...")
        threading.Thread(target=self.ocr_worker, daemon=True).start()

    def ocr_worker(self):
        try:
            result = self.post_image(OCR_ENDPOINT)
            extracted_text = result.get("extracted_text", "").strip()
            regions = result.get("regions", [])
            region_count = result.get("region_count", len(regions))

            ocr_display = (
                f"=== BHUSATYA OCR TEXT EXTRACTION ===\n"
                f"Document ID: {result.get('document_id')}\n"
                f"Recognized Text Regions: {region_count}\n"
                f"Text Length: {len(extracted_text)} characters\n"
                f"{'=' * 45}\n\n"
                f"{extracted_text or 'No readable text was detected.'}"
            )

            self.after(0, lambda: self.set_text(self.ocr_box, ocr_display))
            self.after(0, lambda: self.tabs.set("OCR Extracted Text"))
            self.after(
                0,
                lambda: self.set_busy(
                    False, f"OCR completed. Extracted {region_count} text regions."
                )
            )

        except Exception as error:
            err_msg = str(error)
            self.after(0, lambda: self.set_busy(False, "OCR extraction failed."))
            self.after(0, lambda: messagebox.showerror("OCR Extraction Error", err_msg))

    # -----------------------------------------------------------------------
    # Action 2: Font Consistency Analysis
    # -----------------------------------------------------------------------

    def start_font_analysis(self):
        if self.is_processing:
            return
        if not self.selected_file:
            messagebox.showwarning("No document", "Please select a document image first.")
            return

        self.set_busy(True, "Evaluating stroke width, height, and typography consistency...")
        threading.Thread(target=self.font_worker, daemon=True).start()

    def font_worker(self):
        try:
            result = self.post_image(FONT_ENDPOINT)
            summary = result.get("summary", {})
            findings = result.get("findings", [])
            regions = result.get("regions", [])
            limitation = summary.get("limitation", "")
            doc_id = result.get("document_id", "")

            lines = [
                "=== BHUSATYA FONT CONSISTENCY ANALYSIS ===",
                f"Document ID:           {doc_id}",
                f"Image Size:            {result.get('image_size', {})}",
                f"Regions Evaluated:     {summary.get('regions_detected', 0)}",
                f"Regions Flagged:       {summary.get('regions_flagged', 0)}",
                f"High-Risk Outliers:    {summary.get('high_risk_regions', 0)}",
                f"Moderate-Risk:         {summary.get('moderate_risk_regions', 0)}",
                f"Anomaly Ratio:         {summary.get('document_anomaly_percentage', 0)}%",
                f"Interpretation:        {summary.get('interpretation', 'N/A')}",
                f"{'=' * 60}\n",
            ]

            lines.append("FEATURE COVERAGE:")
            for feat in result.get("feature_coverage", []):
                lines.append(f"  • {feat}")
            lines.append("")

            lines.append(f"{'─' * 60}")
            lines.append(f"KEY TYPOGRAPHY ANOMALIES DETECTED ({len(findings)} regions):\n")

            if findings:
                for idx, f in enumerate(findings[:20], 1):
                    risk = f.get('risk_level', '').upper()
                    text = f.get('text', '')
                    box = f.get('box', [])
                    flags = f.get("flags", [])
                    lines.append(f"[{idx}] '{text}'  |  Risk: {risk}  |  Box: {box}")
                    for flag in flags:
                        score = flag.get('robust_z_score', '')
                        label = flag.get('label', flag.get('feature', ''))
                        lines.append(f"      ↳ {label}  (z-score: {score})")
                    lines.append("")
            else:
                lines.append("  ✔ No significant typography anomalies detected.\n")

            lines.append(f"{'─' * 60}")
            lines.append(f"DISCLAIMER:\n  {result.get('disclaimer', '')}")
            if limitation:
                lines.append(f"\nLIMITATION:\n  {limitation}")

            font_display = "\n".join(lines)

            # Store result so evidence viewer / save report can use it
            self.last_report = result
            self.last_file_urls.update(result.get("file_urls", {}))

            # Update verdict badge to reflect font check status
            flagged = summary.get('regions_flagged', 0)
            high = summary.get('high_risk_regions', 0)
            badge_color = "#DC2626" if high > 0 else ("#D97706" if flagged > 0 else "#16A34A")
            badge_text = (
                f"Font: {high} HIGH-RISK region(s)" if high > 0
                else (f"Font: {flagged} flagged region(s)" if flagged > 0
                      else "Font: No anomalies detected")
            )

            self.after(0, lambda: self.set_text(self.font_box, font_display))
            self.after(0, lambda: self.tabs.set("Font Consistency"))
            self.after(0, lambda: self.verdict_badge.configure(
                text=badge_text, fg_color=badge_color, text_color="#FFFFFF"
            ))
            self.after(
                0,
                lambda: self.set_busy(False, f"Font check done — {summary.get('regions_flagged', 0)} region(s) flagged out of {summary.get('regions_detected', 0)}.")
            )

        except Exception as error:
            err_msg = str(error)
            self.after(0, lambda: self.set_busy(False, "Font check failed."))
            self.after(0, lambda: messagebox.showerror("Font Check Error", err_msg))

    # -----------------------------------------------------------------------
    # Action 3: End-to-End Analysis (OCR + Tampering Detection + Forensics)
    # -----------------------------------------------------------------------

    def start_document_analysis(self):
        if self.is_processing:
            return
        if not self.selected_file:
            messagebox.showwarning("No document", "Please select a document image first.")
            return

        self.set_busy(True, "Running full forensic pipeline (OCR + Info Extraction + Tampering Detection)...")
        threading.Thread(target=self.document_analysis_worker, daemon=True).start()

    def document_analysis_worker(self):
        try:
            result = self.post_image(DOCUMENT_ENDPOINT)
            if not isinstance(result, dict) or result.get("status") != "completed":
                raise RuntimeError("Server did not report a completed analysis.")

            self.last_report = result
            self.last_file_urls = result.get("file_urls") or {}

            # 1. OCR Data
            extracted_text = result.get("extracted_text", "")
            ocr_res = result.get("results", {}).get("ocr", {})
            regions = ocr_res.get("regions", [])

            ocr_display = (
                f"=== BHUSATYA OCR RECOGNIZED TEXT ===\n"
                f"Regions: {len(regions)} | Characters: {len(extracted_text)}\n"
                f"{'=' * 45}\n\n"
                f"{extracted_text.strip() or 'No readable text was detected.'}"
            )

            # 2. Structured Information
            info_res = result.get("results", {}).get("information_extraction", {})
            info_display = json.dumps(info_res, ensure_ascii=False, indent=4)

            # 3. Explainable Tampering Forensics
            tamper_res = result.get("tampering_analysis") or result.get("results", {}).get("tampering_analysis") or {}
            verdict = tamper_res.get("verdict", "UNKNOWN")
            verdict_label = tamper_res.get("verdict_label", verdict)
            risk_score = tamper_res.get("tampering_risk_score", 0.0)
            exec_summary = tamper_res.get("executive_summary", "")
            scores = tamper_res.get("category_scores", {})
            findings = tamper_res.get("findings", [])
            recommendations = tamper_res.get("recommendations", [])

            # Format human-readable forensics
            tamper_lines = [
                f"{'=' * 60}",
                f"BHUSATYA FORENSIC VERDICT: {verdict_label.upper()}",
                f"TAMPERING RISK SCORE:     {risk_score}%",
                f"{'=' * 60}\n",
                f"EXECUTIVE SUMMARY:\n{exec_summary}\n",
                f"{'-' * 60}",
                "FORENSIC CATEGORY BREAKDOWN:",
                f"  • Typography & Font Consistency:       {scores.get('typography_and_font', 0)}%",
                f"  • Compression Discrepancy (ELA):       {scores.get('compression_ela', 0)}%",
                f"  • Cloning & Copy-Move Forgery:          {scores.get('cloning_copy_move', 0)}%",
                f"  • Digital Edge Splicing & Cutouts:      {scores.get('edge_splicing', 0)}%",
                f"  • Revenue Stamp & Seal Integrity:       {scores.get('stamp_seal_integrity', 0)}%",
                f"  • Semantic, Chronological & Logic:      {scores.get('semantic_logic', 0)}%",
                f"{'-' * 60}\n",
                f"HIGH-PRIORITY RED FLAGS & ANOMALIES ({len(findings)} detected):",
            ]

            if findings:
                for idx, f in enumerate(findings[:12], 1):
                    tamper_lines.append(
                        f"\n[{idx}] [{f.get('severity')}] {f.get('title')}\n"
                        f"    Category:     {f.get('category')}\n"
                        f"    Explanation:  {f.get('description')}\n"
                        f"    Evidence:     {f.get('evidence')}\n"
                    )
                    if f.get("bounding_box"):
                        tamper_lines.append(f"    Location:     Box {f.get('bounding_box')}\n")
            else:
                tamper_lines.append("\n  No forensic tampering red flags detected.")

            if recommendations:
                tamper_lines.append(f"\n{'-' * 60}\nRECOMMENDED FORENSIC NEXT STEPS:")
                for r in recommendations:
                    tamper_lines.append(f"  ➜ {r}")

            tamper_display = "\n".join(tamper_lines)

            # 4. Full Report JSON
            report_display = json.dumps(result, ensure_ascii=False, indent=2)

            # Badge Colors
            badge_color = (
                "#DC2626" if verdict == "HIGH_RISK_TAMPERED" else
                "#D97706" if verdict == "SUSPICIOUS" else
                "#CA8A04" if verdict == "LOW_RISK" else
                "#16A34A"
            )

            # Update UI elements
            self.after(0, lambda: self.set_text(self.tamper_box, tamper_display))
            self.after(0, lambda: self.set_text(self.ocr_box, ocr_display))
            self.after(0, lambda: self.set_text(self.info_box, info_display))
            self.after(0, lambda: self.set_text(self.report_box, report_display))
            self.after(
                0,
                lambda: self.verdict_badge.configure(
                    text=f"Verdict: {verdict_label} ({risk_score}%)",
                    fg_color=badge_color,
                    text_color="#FFFFFF"
                )
            )
            self.after(0, lambda: self.tabs.set("Tampering Forensics"))
            self.after(
                0,
                lambda: self.set_busy(
                    False, f"Analysis complete. Verdict: {verdict_label} (Risk: {risk_score}%)"
                )
            )

        except Exception as error:
            err_msg = str(error)
            self.after(0, lambda: self.set_busy(False, "Document analysis failed."))
            self.after(0, lambda: messagebox.showerror("Analysis Error", err_msg))

    # -----------------------------------------------------------------------
    # Action 4: Open / View Annotated Evidence Image
    # -----------------------------------------------------------------------

    def open_evidence_image(self):
        """Open or display the generated annotated forensic evidence image."""
        if not self.last_report:
            messagebox.showinfo(
                "No Analysis", "Run Full Analysis or Font Check first to generate an annotated evidence image."
            )
            return

        doc_id = self.last_report.get("document_id")
        annotated_path = None

        if doc_id:
            cand = OUTPUT_DIR / doc_id / "tampering_annotated.png"
            if cand.is_file():
                annotated_path = cand

        if not annotated_path:
            # Check font check image
            if self.selected_file:
                cand2 = OUTPUT_DIR / doc_id / f"{self.selected_file.stem}_font_anomalies.png" if doc_id else None
                if cand2 and cand2.is_file():
                    annotated_path = cand2

        if not annotated_path and "tampering_annotated.png" in self.last_file_urls:
            url = self.last_file_urls["tampering_annotated.png"]
            try:
                dest = REPORT_DIR / f"{doc_id}_tampering_annotated.png"
                resp = requests.get(url, timeout=30)
                resp.raise_for_status()
                dest.write_bytes(resp.content)
                annotated_path = dest
            except Exception as e:
                messagebox.showerror("Download Error", f"Could not download evidence image: {e}")
                return

        if annotated_path and annotated_path.is_file():
            try:
                # Open with system default viewer on Windows
                os.startfile(str(annotated_path))
            except Exception:
                # Fallback popup window
                self.show_image_popup(annotated_path)
        else:
            messagebox.showwarning(
                "Not Found", "Annotated evidence image was not found for this document."
            )

    def show_image_popup(self, img_path: Path):
        top = ctk.CTkToplevel(self)
        top.title("Annotated Forensic Evidence Viewer")
        top.geometry("900x700")

        with Image.open(img_path) as im:
            im = ImageOps.exif_transpose(im)
            im.thumbnail((860, 640))
            ctk_img = ctk.CTkImage(light_image=im, dark_image=im, size=im.size)

        lbl = ctk.CTkLabel(top, image=ctk_img, text="")
        lbl.image = ctk_img
        lbl.pack(fill="both", expand=True, padx=15, pady=15)

    # -----------------------------------------------------------------------
    # Action 5: Save Report
    # -----------------------------------------------------------------------

    def save_report(self):
        if not self.last_report:
            messagebox.showinfo(
                "No Report", "Please run document analysis before saving a report."
            )
            return

        path = filedialog.asksaveasfilename(
            title="Save BHUSATYA Forensic Report",
            initialdir=str(REPORT_DIR),
            initialfile=f"bhusatya_forensic_report_{self.last_report.get('document_id', 'doc')}.json",
            defaultextension=".json",
            filetypes=[("JSON Report", "*.json"), ("Text File", "*.txt")]
        )
        if not path:
            return

        try:
            out_file = Path(path)
            content = json.dumps(self.last_report, ensure_ascii=False, indent=2)
            out_file.write_text(content, encoding="utf-8")
            messagebox.showinfo("Saved", f"Forensic report saved successfully to:\n{out_file}")
        except Exception as err:
            messagebox.showerror("Save Failed", f"Could not save report:\n{err}")


# ---------------------------------------------------------------------------
# Main Application Launcher
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app = BhusatyaUI()
    app.mainloop()