# BHUSATYA (भू-सत्य) 🏛️
### AI-Powered Land Document Analysis & Explainable Tampering Detection System

BHUSATYA is a forensic document verification platform designed to detect forgeries and tampering in land deed records and non-judicial stamp papers. It combines bilingual Devanagari/English OCR, typographic anomaly detection, JPEG Error Level Analysis (ELA), copy-move cloning detection, stamp/seal integrity verification, and biometric authenticity screening.

---

## 📌 System Architecture

- **Backend**: FastAPI (Python 3.10+)
- **OCR Engine**: PaddleOCR v5 (Hindi Devanagari + English text recognition)
- **Forensic Pipeline**:
  - **Typography & Font Forensics**: Stroke width proxy, font size clustering, inline baseline shifts, and slant variance.
  - **JPEG Compression / ELA**: High-frequency compression artifact heatmaps.
  - **Copy-Move Forgery Detection**: ORB keypoint matching with spatial displacement clustering.
  - **Border / Edge Splicing**: Gradient boundary step analysis for pasted elements.
  - **Stamp & Official Seal Verification**: HSV color masking and contour geometry.
  - **Biometric Forensics**: Thumb impression ridge continuity and minutiae analysis.
- **Frontend**: Next.js 16 + React 19 + Tailwind CSS + Lucide Icons
- **Desktop UI (Alternative)**: CustomTkinter GUI (`UI.py`)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have the following installed:
- **Python**: 3.10 or higher
- **Node.js**: v18+ or v20+ (with `npm` or `pnpm`)
- **Git**

---

### 2. Backend Setup (FastAPI)

1. **Navigate to the project root:**
   ```bash
   cd "C:\Users\Devendra Soni\Desktop\Anant\Project"
   ```

2. **Activate the Python virtual environment:**
   - **Windows (PowerShell):**
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   - **Windows (CMD):**
     ```cmd
     .venv\Scripts\activate.bat
     ```
   *(If creating a new virtual environment: `python -m venv .venv`)*

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the FastAPI backend server:**
   ```bash
   python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```
   - API Docs will be available at: **http://127.0.0.1:8000/docs**
   - Health check: **http://127.0.0.1:8000/health**

---

### 3. Frontend Setup (Next.js)

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd "C:\Users\Devendra Soni\Desktop\Anant\Project\frontend"
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Access the Web Application:**
   - Open your browser and visit: **http://localhost:3000**

---

### 4. Running the Desktop GUI (Optional)

If you prefer using the desktop interface:
1. Ensure the FastAPI backend is running on `http://127.0.0.1:8000`.
2. In the project root, run:
   ```bash
   python UI.py
   ```

---

## 📂 Project Structure

```plaintext
Project/
├── dataset/                    # Sample stamp documents for testing
│   ├── stamp_doc_1.png         # Stamp paper with biometric / text anomalies
│   ├── stamp_doc_2.png         # Stamp paper with font size & text inconsistencies
│   └── stamp_doc_3.png         # Sample stamp paper
├── functionalities/            # Core forensics engines
│   └── tampering_detector.py   # Tampering detection & unified evidence generator
├── font_inconsistency.py       # Font & typography consistency analyzer
├── main.py                     # FastAPI application endpoints
├── requirements.txt            # Python dependencies
├── UI.py                       # Desktop application (CustomTkinter)
├── outputs/                    # Output directory for generated reports & heatmaps
└── frontend/                   # Next.js web application
    ├── app/                    # Next.js app router pages
    ├── components/             # Reusable UI components
    ├── lib/                    # Report stores & API client bindings
    └── package.json            # Node.js dependencies
```

---

## 🔍 API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Service information and status |
| `GET` | `/health` | Check OCR and tampering engine readiness |
| `POST` | `/analyze/document` | **Full pipeline**: OCR + Information extraction + Full Tampering Analysis |
| `POST` | `/analyze/tampering` | Standalone multi-modal tampering detection |
| `POST` | `/analyze/font-consistency` | Dedicated typographic anomaly check |
| `POST` | `/analyze/ocr` | Standalone Hindi/English text & box extraction |
| `GET` | `/files/{doc_id}/{filename}` | Download generated artifacts (`tampering_annotated.png`, `ela_heatmap.png`, reports) |

---

## 🧪 Testing with Dataset Files

To test the system against the included sample stamp papers:
1. Upload any file from the `dataset/` directory (`stamp_doc_1.png`, `stamp_doc_2.png`, or `stamp_doc_3.png`) via the web UI at **http://localhost:3000**.
2. The system will run the full forensic scan and output:
   - **Forensic Verdict Banner** (Authentic / Suspicious / Tampered)
   - **Tampering Risk Score** (%)
   - **Annotated Evidence Image** (`tampering_annotated.png`) with color-coded bounding boxes:
     - 🔴 **Red**: Critical tampering (Biometric forgery / Severe font mismatch)
     - 🟠 **Orange**: Moderate typographic or layout warnings
     - 🔵 **Cyan**: Verified official seals, stamps, and signatures
   - **Error Level Analysis (ELA) Heatmap** (`ela_heatmap.png`)
   - **Detailed JSON Forensic Report** (`tampering_report.json`)
