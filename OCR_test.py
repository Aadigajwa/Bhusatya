
from pathlib import Path
import json
import traceback

import numpy as np
from paddleocr import PaddleOCR


# --------------------------------------------------
# Paths
# --------------------------------------------------
PROJECT_DIR = Path(__file__).resolve().parent
IMAGE_PATH = PROJECT_DIR / "dataset" / "stamp_doc_1.png"
OUTPUT_DIR = PROJECT_DIR / "outputs"

JSON_OUTPUT_PATH = OUTPUT_DIR / "ocr_result.json"
TEXT_OUTPUT_PATH = OUTPUT_DIR / "extracted_text.txt"


# --------------------------------------------------
# Initialize OCR
# --------------------------------------------------
def create_ocr_engine():
    """Initialize PaddleOCR for Hindi and English documents."""
    return PaddleOCR(
        lang="hi",
        device="cpu",
        enable_mkldnn=False,
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_textline_orientation=False,
    )


# --------------------------------------------------
# OCR Processing
# --------------------------------------------------
def extract_text_regions(ocr_results):
    """Convert PaddleOCR output into JSON-serializable text regions."""
    regions = []

    if ocr_results is None:
        print("DEBUG: PaddleOCR returned None.")
        return regions

    def to_dict(item):
        """Convert a PaddleOCR result object or JSON string to a dictionary."""
        if isinstance(item, dict):
            return item

        if isinstance(item, str):
            try:
                item = json.loads(item)
            except json.JSONDecodeError:
                return None

            return item if isinstance(item, dict) else None

        data = getattr(item, "json", None)

        if callable(data):
            data = data()

        if isinstance(data, str):
            try:
                data = json.loads(data)
            except json.JSONDecodeError:
                return None

        return data if isinstance(data, dict) else None

    # Handle a single result as well as an iterable of page results.
    if isinstance(ocr_results, (dict, str)) or hasattr(ocr_results, "json"):
        results = [ocr_results]
    else:
        try:
            results = list(ocr_results)
        except TypeError:
            results = [ocr_results]

    for page_index, item in enumerate(results):
        data = to_dict(item)

        if data is None:
            print(
                f"DEBUG: Could not parse OCR result for page {page_index + 1}."
            )
            continue

        # PaddleOCR commonly nests recognition data under "res".
        result = data.get("res", data)

        if not isinstance(result, dict):
            print("DEBUG: Unexpected OCR data structure:", type(result))
            continue

        texts = result.get("rec_texts")
        scores = result.get("rec_scores")
        boxes = result.get("rec_boxes")

        texts = [] if texts is None else list(texts)
        scores = [] if scores is None else list(scores)
        boxes = [] if boxes is None else list(boxes)

        print(
            f"DEBUG: Page {page_index + 1}: "
            f"{len(texts)} recognized text entries."
        )

        for i, raw_text in enumerate(texts):
            if raw_text is None:
                continue

            text = str(raw_text).strip()
            if not text:
                continue

            confidence = None
            if i < len(scores):
                try:
                    confidence = float(scores[i])
                except (TypeError, ValueError):
                    pass

            bbox = None
            if i < len(boxes):
                try:
                    coords = np.asarray(boxes[i]).reshape(-1).tolist()

                    if len(coords) >= 4:
                        x1, y1, x2, y2 = map(int, coords[:4])
                        bbox = {
                            "x1": x1,
                            "y1": y1,
                            "x2": x2,
                            "y2": y2,
                        }
                except (TypeError, ValueError, IndexError):
                    pass

            regions.append({
                "id": len(regions) + 1,
                "text": text,
                "confidence": confidence,
                "bbox": bbox,
            })

    print(f"DEBUG: Total extracted text regions: {len(regions)}")
    return regions



def save_ocr_outputs(regions):
    """Save structured OCR output and readable text."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with JSON_OUTPUT_PATH.open("w", encoding="utf-8") as file:
        json.dump(regions, file, ensure_ascii=False, indent=4)

    with TEXT_OUTPUT_PATH.open("w", encoding="utf-8") as file:
        for region in regions:
            text = region["text"].strip()
            if text:
                file.write(text + "\n")


def main():
    if not IMAGE_PATH.is_file():
        print(f"ERROR: Image not found: {IMAGE_PATH}")
        return

    try:
        print("Initializing PaddleOCR...")
        ocr = create_ocr_engine()

        print(f"Processing document: {IMAGE_PATH.name}")
        results = ocr.predict(str(IMAGE_PATH))

        regions = extract_text_regions(results)
        save_ocr_outputs(regions)

        print(f"OCR completed. Extracted {len(regions)} text regions.")
        print(f"JSON output: {JSON_OUTPUT_PATH}")
        print(f"Text output: {TEXT_OUTPUT_PATH}")

        if not any(region["text"].strip() for region in regions):
            print("WARNING: No readable text was detected.")

    except Exception:
        print("ERROR: OCR processing failed.")
        traceback.print_exc()


if __name__ == "__main__":
    main()