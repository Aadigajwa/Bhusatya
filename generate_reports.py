import sys
import os
import json
from pathlib import Path

# Fix Windows console UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

sys.path.insert(0, str(Path(__file__).resolve().parent))
from main import process_ocr, process_information, process_tampering_analysis

dataset_dir = Path("dataset")
output_base = Path("outputs")

for name in ["stamp_doc_2.png", "stamp_doc_3.png"]:
    img_path = dataset_dir / name
    stem = img_path.stem
    doc_out = output_base / f"test_{stem}"
    doc_out.mkdir(parents=True, exist_ok=True)
    print(f"=== Processing {name} ===")
    
    # 1. OCR
    ocr_res = process_ocr(img_path, doc_out)
    print(f"OCR extracted {len(ocr_res['regions'])} regions")
    
    # 2. Information extraction
    info_res = process_information(ocr_res["extracted_text"], doc_out)
    print(f"Extracted info: {list(info_res.keys())}")
    
    # 3. Tampering Analysis
    tamper_res = process_tampering_analysis(
        image_path=img_path,
        output_dir=doc_out,
        regions=ocr_res["regions"],
        information=info_res,
        extracted_text=ocr_res["extracted_text"],
        document_id=f"test_{stem}",
    )
    print(f"Verdict: {tamper_res.get('verdict')}, Score: {tamper_res.get('tampering_risk_score')}")
    print(f"Findings: {len(tamper_res.get('findings', []))}")
    print(f"Report saved to: {doc_out / 'tampering_report.json'}")

print("ALL COMPLETE!")
