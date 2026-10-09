from __future__ import annotations

import json
import math
import os
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Tuple, Union

import cv2
import numpy as np



Box = Tuple[int, int, int, int]


@dataclass
class OCRItem:
    text: str
    confidence: float
    box: Box  # x1, y1, x2, y2


@dataclass
class RegionFeatures:
    text: str
    confidence: float
    box: Box
    width: int
    height: int
    aspect_ratio: float
    center_y: float
    baseline_y: float
    stroke_width: float
    ink_density: float
    edge_density: float
    edge_sharpness: float
    background_mean: float
    background_std: float
    estimated_slant: float


def _clip_box(box: Sequence[float], width: int, height: int) -> Optional[Box]:
    if len(box) != 4:
        return None
    x1, y1, x2, y2 = [int(round(float(v))) for v in box]
    x1, x2 = sorted((max(0, min(width - 1, x1)), max(0, min(width, x2))))
    y1, y2 = sorted((max(0, min(height - 1, y1)), max(0, min(height, y2))))
    if x2 - x1 < 2 or y2 - y1 < 2:
        return None
    return x1, y1, x2, y2


def _robust_z(values: Sequence[float]) -> np.ndarray:
    """Absolute robust z-score using median and MAD."""
    arr = np.asarray(values, dtype=np.float32)
    if arr.size == 0:
        return arr
    med = float(np.median(arr))
    mad = float(np.median(np.abs(arr - med)))
    scale = 1.4826 * mad
    if scale < 1e-6:
        # Fallback handles near-constant features without dividing by zero.
        scale = float(np.std(arr))
    if scale < 1e-6:
        return np.zeros_like(arr)
    return np.abs((arr - med) / scale)


class FontInconsistencyAnalyzer:
    """
    Explainable heuristic analyzer for document text appearance.

    Args:
        ocr_lang: PaddleOCR language, e.g. "hi", "en".
        use_ocr: initialize PaddleOCR automatically if True.
        anomaly_threshold: robust-z threshold used to flag outliers.
        min_ocr_confidence: OCR items below this confidence are ignored.
        line_y_tolerance: normalized vertical tolerance for grouping words.
    """

    FEATURE_LABELS = {
        "height": "text-size / character-height proxy",
        "width": "text-width proxy",
        "stroke_width": "stroke-thickness proxy",
        "ink_density": "ink-density difference",
        "aspect_ratio": "glyph/region shape proxy",
        "estimated_slant": "text slant / style proxy",
        "word_gap": "word-spacing anomaly",
        "char_gap": "character-spacing anomaly",
        "line_spacing": "line-spacing anomaly",
        "baseline": "baseline-alignment anomaly",
        "indentation": "indentation / line-start anomaly",
        "edge_sharpness": "edge-sharpness difference",
        "background_mean": "local-background difference",
        "background_std": "local-background-texture difference",
        "edge_density": "edge-density difference",
    }

    def __init__(
        self,
        ocr_lang: str = "hi",
        use_ocr: bool = True,
        anomaly_threshold: float = 3.0,
        min_ocr_confidence: float = 0.20,
        line_y_tolerance: float = 0.65,
    ):
        self.ocr_lang = ocr_lang
        self.use_ocr = use_ocr
        self.anomaly_threshold = float(anomaly_threshold)
        self.min_ocr_confidence = float(min_ocr_confidence)
        self.line_y_tolerance = float(line_y_tolerance)
        self._ocr = None

        if self.use_ocr:
            try:
                try:
                    from OCR_test import create_ocr_engine
                    self._ocr = create_ocr_engine()
                except Exception:
                    from paddleocr import PaddleOCR
                    self._ocr = PaddleOCR(
                        lang=ocr_lang,
                        device="cpu",
                        enable_mkldnn=False,
                        use_doc_orientation_classify=False,
                        use_doc_unwarping=False,
                        use_textline_orientation=False,
                    )
            except ImportError as exc:
                raise ImportError(
                    "PaddleOCR is not installed. Run: pip install paddleocr"
                ) from exc

    def _run_ocr(self, image_path: str) -> List[OCRItem]:
        if self._ocr is None:
            raise RuntimeError(
                "OCR is disabled or not initialized. Pass ocr_items to analyze()."
            )

        if hasattr(self._ocr, "predict"):
            try:
                from OCR_test import extract_text_regions
                regions = extract_text_regions(self._ocr.predict(image_path))
                items: List[OCRItem] = []
                for r in regions:
                    bb = r.get("bbox") or {}
                    x1, y1 = bb.get("x1", 0), bb.get("y1", 0)
                    x2, y2 = bb.get("x2", 0), bb.get("y2", 0)
                    txt = str(r.get("text", "")).strip()
                    conf = float(r.get("confidence") or 1.0)
                    if txt and conf >= self.min_ocr_confidence:
                        items.append(OCRItem(text=txt, confidence=conf, box=(int(x1), int(y1), int(x2), int(y2))))
                return items
            except Exception:
                pass

        if hasattr(self._ocr, "ocr"):
            raw = self._ocr.ocr(image_path, cls=True)
        else:
            raw = self._ocr.predict(image_path)
        items: List[OCRItem] = []

        # Common PaddleOCR format: [[ [quad, (text, confidence)], ... ]]
        # Some releases return a list of result objects / dictionaries.
        def add_item(points: Any, text: Any, confidence: Any) -> None:
            try:
                pts = np.asarray(points, dtype=np.float32).reshape(-1, 2)
                if len(pts) < 4:
                    return
                x1, y1 = np.min(pts, axis=0)
                x2, y2 = np.max(pts, axis=0)
                items.append(OCRItem(
                    text=str(text).strip(),
                    confidence=float(confidence),
                    box=(int(x1), int(y1), int(x2), int(y2)),
                ))
            except (TypeError, ValueError):
                return

        if isinstance(raw, list):
            for page in raw:
                if page is None:
                    continue
                # PaddleOCR 2.x page list
                if isinstance(page, list):
                    for line in page:
                        try:
                            points = line[0]
                            rec = line[1]
                            if isinstance(rec, (tuple, list)) and len(rec) >= 2:
                                add_item(points, rec[0], rec[1])
                        except (IndexError, TypeError):
                            continue
                # PaddleOCR 3.x may return dict-like page objects.
                elif isinstance(page, dict):
                    texts = page.get("rec_texts", [])
                    scores = page.get("rec_scores", [])
                    polys = page.get("rec_polys", page.get("dt_polys", []))
                    for i, text in enumerate(texts):
                        if i < len(polys):
                            score = scores[i] if i < len(scores) else 1.0
                            add_item(polys[i], text, score)

        return [x for x in items if x.text and x.confidence >= self.min_ocr_confidence]

    @staticmethod
    def _preprocess(image: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        if image is None:
            raise ValueError("Could not read image. Check the path or image bytes.")
        if image.ndim == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()
        # Mild denoising keeps printed edges while reducing scanner noise.
        denoised = cv2.fastNlMeansDenoising(gray, None, h=8, templateWindowSize=7,
                                           searchWindowSize=21)
        # Otsu mask: text is normally dark. Invert so foreground pixels are 1.
        _, binary = cv2.threshold(
            denoised, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
        )
        return denoised, binary

    @staticmethod
    def _crop(gray: np.ndarray, box: Box, pad: int = 3) -> np.ndarray:
        x1, y1, x2, y2 = box
        h, w = gray.shape[:2]
        return gray[max(0, y1-pad):min(h, y2+pad), max(0, x1-pad):min(w, x2+pad)]

    @staticmethod
    def _estimate_stroke(binary_crop: np.ndarray) -> float:
        if binary_crop.size == 0:
            return 0.0
        mask = (binary_crop > 0).astype(np.uint8)
        if np.count_nonzero(mask) < 2:
            return 0.0
        # Distance transform estimates the local radius of foreground strokes.
        dist = cv2.distanceTransform(mask, cv2.DIST_L2, 3)
        vals = dist[mask > 0]
        return float(2.0 * np.median(vals)) if vals.size else 0.0

    @staticmethod
    def _estimate_slant(binary_crop: np.ndarray) -> float:
        """Coarse ink-pixel covariance angle; not a true font-style classifier."""
        ys, xs = np.where(binary_crop > 0)
        if len(xs) < 8:
            return 0.0
        coords = np.column_stack((xs.astype(np.float32), ys.astype(np.float32)))
        cov = np.cov(coords, rowvar=False)
        if cov.shape != (2, 2):
            return 0.0
        # Main orientation can be dominated by glyph shape; retain as a weak proxy.
        angle = 0.5 * math.atan2(2.0 * cov[0, 1], cov[0, 0] - cov[1, 1])
        return float(math.degrees(angle))

    def _extract_features(
        self, gray: np.ndarray, binary: np.ndarray, item: OCRItem
    ) -> RegionFeatures:
        x1, y1, x2, y2 = item.box
        crop = gray[y1:y2, x1:x2]
        bin_crop = binary[y1:y2, x1:x2]
        height, width = crop.shape[:2]
        if crop.size == 0:
            crop = np.full((1, 1), 255, dtype=np.uint8)
            bin_crop = np.zeros((1, 1), dtype=np.uint8)
            height = width = 1

        # Edge density and sharpness are calculated within the OCR text box.
        edges = cv2.Canny(crop, 70, 160)
        edge_density = float(np.mean(edges > 0))
        lap = cv2.Laplacian(crop, cv2.CV_64F)
        edge_sharpness = float(np.var(lap))
        ink_density = float(np.mean(bin_crop > 0))

        # Estimate local background using a ring outside the text box.
        pad = max(4, int(round(min(width, height) * 0.15)))
        h_img, w_img = gray.shape
        xa, ya = max(0, x1-pad), max(0, y1-pad)
        xb, yb = min(w_img, x2+pad), min(h_img, y2+pad)
        outer = gray[ya:yb, xa:xb].copy()
        if outer.size:
            outer_mask = np.ones(outer.shape, dtype=np.uint8)
            outer[y1-ya:y2-ya, x1-xa:x2-xa] = 255  # excluded below
            ring = outer[outer_mask.astype(bool) & (outer != 255)]
            # If the page is white and the ring is empty, use all surrounding pixels.
            if ring.size < 10:
                ring = outer.reshape(-1)
            background_mean = float(np.mean(ring))
            background_std = float(np.std(ring))
        else:
            background_mean, background_std = 255.0, 0.0

        return RegionFeatures(
            text=item.text,
            confidence=float(item.confidence),
            box=item.box,
            width=int(width),
            height=int(height),
            aspect_ratio=float(width / max(height, 1)),
            center_y=float((y1+y2)/2),
            baseline_y=float(y2),
            stroke_width=self._estimate_stroke(bin_crop),
            ink_density=ink_density,
            edge_density=edge_density,
            edge_sharpness=edge_sharpness,
            background_mean=background_mean,
            background_std=background_std,
            estimated_slant=self._estimate_slant(bin_crop),
        )

    @staticmethod
    def _group_lines(features: List[RegionFeatures]) -> List[List[int]]:
        """Group word boxes by vertical center; sort words left-to-right."""
        if not features:
            return []
        order = sorted(range(len(features)), key=lambda i: features[i].center_y)
        lines: List[List[int]] = []
        for idx in order:
            f = features[idx]
            placed = False
            for line in lines:
                median_y = float(np.median([features[j].center_y for j in line]))
                median_h = float(np.median([features[j].height for j in line]))
                if abs(f.center_y - median_y) <= max(4.0, median_h * 0.65):
                    line.append(idx)
                    placed = True
                    break
            if not placed:
                lines.append([idx])
        for line in lines:
            line.sort(key=lambda i: features[i].box[0])
        return sorted(lines, key=lambda line: np.median([features[i].center_y for i in line]))

    def _add_layout_features(
        self, features: List[RegionFeatures], lines: List[List[int]]
    ) -> Dict[str, np.ndarray]:
        n = len(features)
        word_gap = np.zeros(n, dtype=np.float32)
        char_gap = np.zeros(n, dtype=np.float32)
        line_spacing = np.zeros(n, dtype=np.float32)
        baseline = np.zeros(n, dtype=np.float32)
        indentation = np.zeros(n, dtype=np.float32)

        # Word gaps: gap after each box, normalized by median text height.
        for line in lines:
            for pos, idx in enumerate(line):
                f = features[idx]
                median_h = max(1.0, float(np.median([features[j].height for j in line])))
                if pos + 1 < len(line):
                    nxt = features[line[pos+1]]
                    word_gap[idx] = max(0.0, nxt.box[0] - f.box[2]) / median_h
                # Character spacing proxy from OCR text length and box width.
                # This is not true character segmentation.
                chars = len(re.sub(r"\s+", "", f.text))
                char_gap[idx] = (f.width / max(chars, 1)) / max(f.height, 1)

        line_y = [float(np.median([features[i].baseline_y for i in line])) for line in lines]
        for line_idx, line in enumerate(lines):
            current_baseline = line_y[line_idx]
            previous_spacing = (
                current_baseline - line_y[line_idx-1] if line_idx > 0 else 0.0
            )
            for idx in line:
                baseline[idx] = features[idx].baseline_y - current_baseline
                line_spacing[idx] = previous_spacing / max(features[idx].height, 1)
                # First box x-coordinate serves as line indentation proxy.
                indentation[idx] = float(features[idx].box[0])

        return {
            "word_gap": word_gap,
            "char_gap": char_gap,
            "line_spacing": line_spacing,
            "baseline": baseline,
            "indentation": indentation,
        }

    # ------------------------------------------------------------------
    # Zone classification & body-text focused consistency analysis
    # ------------------------------------------------------------------

    def _classify_zones(
        self, features: List[RegionFeatures], h_img: int,
    ) -> List[str]:
        """Classify each region as 'header', 'body', or 'footer'.

        Indian stamp papers typically have a decorative stamp header in the
        top ~35-40% of the page, body text in the middle, and a
        signature / thumbprint area at the bottom.
        """
        if not features:
            return []

        centers = sorted(f.center_y for f in features)
        header_cutoff = h_img * 0.40
        footer_cutoff = h_img * 0.88

        # Look for the largest vertical gap in the top half to find the
        # natural header / body boundary.
        top_centers = [c for c in centers if c < h_img * 0.55]
        if len(top_centers) >= 4:
            gaps = [
                (top_centers[i + 1] - top_centers[i],
                 top_centers[i], top_centers[i + 1])
                for i in range(len(top_centers) - 1)
            ]
            biggest = max(gaps, key=lambda g: g[0])
            if biggest[0] > h_img * 0.03:
                header_cutoff = (biggest[1] + biggest[2]) / 2

        return [
            "header" if f.center_y < header_cutoff
            else "footer" if f.center_y > footer_cutoff
            else "body"
            for f in features
        ]

    def _detect_font_size_clusters(
        self,
        features: List[RegionFeatures],
        zones: List[str],
    ) -> Dict[str, Any]:
        """Identify distinct font-size groups in the body text.

        Uses gap-based clustering on text heights to find naturally distinct
        font sizes.  Reports the dominant size and flags regions that deviate.
        """
        body_data = [
            (i, features[i]) for i, z in enumerate(zones) if z == "body"
        ]
        if len(body_data) < 3:
            return {
                "distinct_sizes_in_body": 0,
                "groups": [],
                "minority_size_regions": [],
                "interpretation": "Too few body regions for font-size analysis.",
            }

        body_data.sort(key=lambda x: x[1].height)

        # Merge heights within 22% of the current group median.
        groups: List[List[Tuple[int, RegionFeatures]]] = [[body_data[0]]]
        for idx, f in body_data[1:]:
            med_h = float(np.median([bf.height for _, bf in groups[-1]]))
            if abs(f.height - med_h) / max(med_h, 1) <= 0.22:
                groups[-1].append((idx, f))
            else:
                groups.append([(idx, f)])

        dominant_gi = max(range(len(groups)), key=lambda i: len(groups[i]))
        dominant_median = float(
            np.median([f.height for _, f in groups[dominant_gi]])
        )

        group_info = []
        for gi, grp in enumerate(groups):
            heights = [f.height for _, f in grp]
            group_info.append({
                "group_id": gi,
                "height_range_px": [int(min(heights)), int(max(heights))],
                "median_height_px": round(float(np.median(heights)), 1),
                "region_count": len(grp),
                "is_dominant": gi == dominant_gi,
                "sample_texts": [f.text[:50] for _, f in grp[:5]],
                "region_ids": [idx for idx, _ in grp],
            })

        minority_regions = []
        for gi, grp in enumerate(groups):
            if gi == dominant_gi:
                continue
            for idx, f in grp:
                minority_regions.append({
                    "region_id": idx,
                    "text": f.text,
                    "box": list(f.box),
                    "height_px": f.height,
                    "dominant_median_px": round(dominant_median, 1),
                    "size_ratio": round(
                        f.height / max(dominant_median, 1), 3,
                    ),
                    "note": (
                        "larger than dominant font"
                        if f.height > dominant_median
                        else "smaller than dominant font"
                    ),
                })

        return {
            "distinct_sizes_in_body": len(groups),
            "groups": group_info,
            "minority_size_regions": minority_regions,
            "interpretation": (
                f"{len(groups)} distinct font-size group(s) detected in "
                f"body text. "
                + (
                    f"{len(minority_regions)} region(s) use a different font "
                    f"size than the dominant body text "
                    f"(median {dominant_median:.0f}px)."
                    if minority_regions
                    else "Font sizes appear consistent within body text."
                )
            ),
        }

    def _analyze_inline_consistency(
        self,
        features: List[RegionFeatures],
        lines: List[List[int]],
        zones: List[str],
    ) -> List[Dict[str, Any]]:
        """Compare adjacent words on the same line for font consistency.

        Detects mid-line font changes (size, stroke weight, ink density) that
        may indicate text insertion or replacement with a different font.
        """
        inconsistencies: List[Dict[str, Any]] = []
        for line_idx, line in enumerate(lines):
            body_words = [i for i in line if zones[i] == "body"]
            if len(body_words) < 2:
                continue
            for pos in range(len(body_words) - 1):
                a, b = body_words[pos], body_words[pos + 1]
                fa, fb = features[a], features[b]

                h_min = min(fa.height, fb.height)
                h_max = max(fa.height, fb.height)
                h_ratio = h_max / max(h_min, 1)

                sw_a = max(fa.stroke_width, 0.1)
                sw_b = max(fb.stroke_width, 0.1)
                sw_ratio = max(sw_a, sw_b) / min(sw_a, sw_b)

                ink_diff = abs(fa.ink_density - fb.ink_density)

                flags: List[Dict[str, Any]] = []
                if h_ratio > 1.25:
                    flags.append({
                        "issue": "font_size_change",
                        "description": (
                            f"Font size differs by "
                            f"{(h_ratio - 1) * 100:.0f}% "
                            f"between adjacent words"
                        ),
                        "severity": (
                            "high" if h_ratio > 1.5 else "moderate"
                        ),
                    })
                if sw_ratio > 1.4:
                    flags.append({
                        "issue": "stroke_weight_change",
                        "description": (
                            f"Stroke thickness differs by "
                            f"{(sw_ratio - 1) * 100:.0f}%"
                        ),
                        "severity": (
                            "high" if sw_ratio > 2.0 else "moderate"
                        ),
                    })
                if ink_diff > 0.12:
                    flags.append({
                        "issue": "ink_density_change",
                        "description": (
                            f"Ink density differs by {ink_diff:.2f} "
                            f"(possible bold/regular mix or "
                            f"different font)"
                        ),
                        "severity": "moderate",
                    })

                if flags:
                    inconsistencies.append({
                        "line_index": line_idx,
                        "region_a": a,
                        "region_b": b,
                        "text_a": fa.text[:50],
                        "text_b": fb.text[:50],
                        "height_a_px": fa.height,
                        "height_b_px": fb.height,
                        "height_ratio": round(h_ratio, 3),
                        "stroke_ratio": round(sw_ratio, 3),
                        "ink_density_diff": round(ink_diff, 3),
                        "flags": flags,
                    })
        return inconsistencies

    def analyze(
        self,
        image: Union[str, os.PathLike, np.ndarray],
        output_dir: Optional[Union[str, os.PathLike]] = "outputs/font_analysis",
        ocr_items: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Analyze a document.

        Args:
            image: path or OpenCV image array.
            output_dir: directory for annotated image and JSON report. Use None
                        to avoid writing files.
            ocr_items: optional list like
                [{"text":"नाम", "confidence":0.99, "box":[x1,y1,x2,y2]}, ...]
                This bypasses the built-in OCR call and allows reuse of an
                existing OCR pipeline.

        Returns:
            JSON-serializable dictionary containing findings, feature table,
            summary, and output paths.
        """
        if isinstance(image, (str, os.PathLike)):
            image_path = str(image)
            original = cv2.imread(image_path)
            if original is None:
                raise ValueError(f"Unable to load image: {image_path}")
        else:
            original = np.asarray(image).copy()
            image_path = None
            if original.ndim == 2:
                original = cv2.cvtColor(original, cv2.COLOR_GRAY2BGR)

        gray, binary = self._preprocess(original)
        h_img, w_img = gray.shape

        if ocr_items is None:
            if image_path is None:
                raise ValueError(
                    "For an image array, pass ocr_items or provide a file path for OCR."
                )
            raw_items = self._run_ocr(image_path)
        else:
            raw_items = []
            for row in ocr_items:
                raw_box = row.get("box") if row.get("box") is not None else row.get("bbox")
                if isinstance(raw_box, dict):
                    raw_box = [
                        raw_box.get("x1", 0),
                        raw_box.get("y1", 0),
                        raw_box.get("x2", 0),
                        raw_box.get("y2", 0),
                    ]
                box = _clip_box(raw_box, w_img, h_img) if raw_box else None
                if box is None:
                    continue
                confidence = float(row.get("confidence", 1.0))
                text = str(row.get("text", "")).strip()
                if text and confidence >= self.min_ocr_confidence:
                    raw_items.append(OCRItem(text, confidence, box))

        # Normalize/clip boxes and ignore invalid items.
        items: List[OCRItem] = []
        for item in raw_items:
            box = _clip_box(item.box, w_img, h_img)
            if box is not None:
                items.append(OCRItem(item.text, item.confidence, box))

        features = [self._extract_features(gray, binary, item) for item in items]
        lines = self._group_lines(features)
        layout = self._add_layout_features(features, lines)

        # ---- Zone classification ----
        zones = self._classify_zones(features, h_img)

        base_features: Dict[str, np.ndarray] = {
            "height": np.array([f.height for f in features], dtype=np.float32),
            "width": np.array([f.width for f in features], dtype=np.float32),
            "stroke_width": np.array([f.stroke_width for f in features], dtype=np.float32),
            "ink_density": np.array([f.ink_density for f in features], dtype=np.float32),
            "aspect_ratio": np.array([f.aspect_ratio for f in features], dtype=np.float32),
            "estimated_slant": np.array([f.estimated_slant for f in features], dtype=np.float32),
            "edge_sharpness": np.array([math.log1p(max(0.0, f.edge_sharpness)) for f in features], dtype=np.float32),
            "background_mean": np.array([f.background_mean for f in features], dtype=np.float32),
            "background_std": np.array([f.background_std for f in features], dtype=np.float32),
            "edge_density": np.array([f.edge_density for f in features], dtype=np.float32),
        }
        base_features.update(layout)

        # ---- Font-size cluster detection in body text ----
        font_size_analysis = self._detect_font_size_clusters(
            features, zones,
        )

        # ---- Inline (adjacent-word) consistency analysis ----
        inline_inconsistencies = self._analyze_inline_consistency(
            features, lines, zones,
        )

        # ---- Body-only z-scores (more sensitive within body text) ----
        body_indices = [i for i, z in enumerate(zones) if z == "body"]
        body_findings: List[Dict[str, Any]] = []
        body_threshold = min(self.anomaly_threshold, 2.5)

        if len(body_indices) >= 4:
            body_z: Dict[str, np.ndarray] = {}
            for name, values in base_features.items():
                body_vals = np.array(
                    [float(values[i]) for i in body_indices],
                    dtype=np.float32,
                )
                body_z[name] = _robust_z(body_vals)

            for bi, idx in enumerate(body_indices):
                body_region_flags: List[Dict[str, Any]] = []
                for name, z_arr in body_z.items():
                    score = (
                        float(z_arr[bi]) if bi < len(z_arr) else 0.0
                    )
                    if score >= body_threshold:
                        body_region_flags.append({
                            "feature": name,
                            "label": self.FEATURE_LABELS.get(
                                name, name,
                            ),
                            "robust_z_score": round(score, 3),
                        })
                if body_region_flags:
                    mean_sc = float(
                        np.mean(
                            [x["robust_z_score"]
                             for x in body_region_flags]
                        )
                    )
                    risk = (
                        "high" if len(body_region_flags) >= 3
                        else "moderate"
                    )
                    body_findings.append({
                        "region_id": idx,
                        "text": features[idx].text,
                        "box": list(features[idx].box),
                        "risk_level": risk,
                        "flags": body_region_flags,
                        "mean_flagged_deviation": round(mean_sc, 3),
                        "note": (
                            "Anomaly within body text where font "
                            "uniformity is expected."
                        ),
                    })

        # Use robust z-scores over detected regions. With too few regions,
        # scores are inherently unreliable, so mark the analysis as limited.
        z_scores: Dict[str, np.ndarray] = {}
        for name, values in base_features.items():
            z_scores[name] = _robust_z(values)

        findings: List[Dict[str, Any]] = []
        region_rows: List[Dict[str, Any]] = []
        for i, f in enumerate(features):
            region_flags = []
            scores = {}
            for name, z in z_scores.items():
                score = float(z[i]) if i < len(z) else 0.0
                scores[name] = round(score, 3)
                if score >= self.anomaly_threshold:
                    region_flags.append({
                        "feature": name,
                        "label": self.FEATURE_LABELS.get(name, name),
                        "robust_z_score": round(score, 3),
                    })

            # Font-family/style cannot be identified conclusively from pixels;
            # shape, slant, size, and stroke are only appearance proxies.
            mean_score = float(np.mean([x["robust_z_score"] for x in region_flags])) if region_flags else 0.0
            risk = (
                "high" if len(region_flags) >= 3 else
                "moderate" if len(region_flags) >= 1 else
                "low"
            )
            row = {
                "region_id": i,
                "text": f.text,
                "zone": zones[i] if i < len(zones) else "unknown",
                "ocr_confidence": round(f.confidence, 4),
                "box": list(f.box),
                "measurements": {
                    "width_px": f.width,
                    "height_px": f.height,
                    "aspect_ratio": round(f.aspect_ratio, 4),
                    "stroke_width_estimate_px": round(f.stroke_width, 3),
                    "ink_density": round(f.ink_density, 4),
                    "edge_density": round(f.edge_density, 4),
                    "edge_sharpness": round(f.edge_sharpness, 3),
                    "background_mean": round(f.background_mean, 3),
                    "background_std": round(f.background_std, 3),
                    "estimated_slant_degrees_proxy": round(f.estimated_slant, 3),
                    "word_gap_normalized": round(float(layout["word_gap"][i]), 3),
                    "character_spacing_proxy": round(float(layout["char_gap"][i]), 3),
                    "line_spacing_normalized": round(float(layout["line_spacing"][i]), 3),
                    "baseline_deviation_px": round(float(layout["baseline"][i]), 3),
                    "line_start_x_px": round(float(layout["indentation"][i]), 3),
                },
                "anomaly_scores": scores,
                "flags": region_flags,
                "risk_level": risk,
                "mean_flagged_deviation": round(mean_score, 3),
            }
            region_rows.append(row)
            if region_flags:
                findings.append({
                    "region_id": i,
                    "text": f.text,
                    "box": list(f.box),
                    "risk_level": risk,
                    "flags": region_flags,
                    "note": "Visual anomaly requiring review; not proof of tampering.",
                })

        # Annotate suspicious OCR regions.
        annotated = original.copy()
        for row in region_rows:
            x1, y1, x2, y2 = row["box"]
            risk = row["risk_level"]
            color = (0, 0, 255) if risk == "high" else (0, 165, 255) if risk == "moderate" else (0, 160, 0)
            if row["flags"]:
                cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
                label = f'{row["region_id"]}: {risk}'
                cv2.putText(annotated, label, (x1, max(18, y1-5)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.45, color, 1, cv2.LINE_AA)

        # Annotate inline font inconsistencies (magenta connecting lines)
        for issue in inline_inconsistencies:
            a_box = features[issue["region_a"]].box
            b_box = features[issue["region_b"]].box
            pt_a = (int((a_box[0] + a_box[2]) / 2), a_box[3] + 3)
            pt_b = (int((b_box[0] + b_box[2]) / 2), b_box[3] + 3)
            cv2.line(annotated, pt_a, pt_b, (255, 0, 200), 2)
            cv2.rectangle(
                annotated, (a_box[0], a_box[1]),
                (a_box[2], a_box[3]), (255, 0, 200), 1,
            )
            cv2.rectangle(
                annotated, (b_box[0], b_box[1]),
                (b_box[2], b_box[3]), (255, 0, 200), 1,
            )

        total = len(region_rows)
        flagged = len(findings)
        high = sum(1 for x in findings if x["risk_level"] == "high")
        moderate = sum(1 for x in findings if x["risk_level"] == "moderate")

        if total < 8:
            limitation = (
                "Few OCR regions were detected; statistical outlier scores are weak. "
                "Use a larger text sample and review results manually."
            )
        else:
            limitation = (
                "Scores are relative to this document's detected regions, not a trained "
                "probability of fraud. Compare like-for-like fields and validate on real data."
            )

        report: Dict[str, Any] = {
            "module": "Bhusatya Font and Text Layout Inconsistency Analyzer",
            "image_size": {"width": int(w_img), "height": int(h_img)},
            "summary": {
                "regions_detected": total,
                "regions_flagged": flagged,
                "high_risk_regions": high,
                "moderate_risk_regions": moderate,
                "low_anomaly_regions": total - flagged,
                "document_anomaly_percentage": round(100.0 * flagged / max(total, 1), 2),
                "interpretation": (
                    "Potential text-appearance inconsistencies detected."
                    if flagged else
                    "No strong outliers were detected by the current heuristics."
                ),
                "limitation": limitation,
            },
            "feature_coverage": [
                "text size proxy", "glyph/region width and aspect ratio",
                "stroke thickness proxy", "font-style appearance proxy (slant/stroke)",
                "font-family appearance proxy (not definitive font identification)",
                "line spacing", "word spacing", "character spacing proxy",
                "baseline alignment", "indentation / line start",
                "ink density", "local background mean and texture",
                "edge density and sharpness",
            ],
            "findings": findings,
            "regions": region_rows,
            "disclaimer": (
                "This is a heuristic screening tool. An anomaly does not establish "
                "forgery; a lack of anomalies does not establish authenticity."
            ),
        }

        # ---- Body-focused font-consistency analysis section ----
        report["body_text_analysis"] = {
            "zone_breakdown": {
                "header_regions": sum(
                    1 for z in zones if z == "header"
                ),
                "body_regions": len(body_indices),
                "footer_regions": sum(
                    1 for z in zones if z == "footer"
                ),
            },
            "font_size_consistency": font_size_analysis,
            "inline_consistency_issues": inline_inconsistencies,
            "inline_issue_count": len(inline_inconsistencies),
            "body_only_findings": body_findings,
            "body_flagged_count": len(body_findings),
            "body_total_count": len(body_indices),
            "body_anomaly_percentage": round(
                100.0 * len(body_findings)
                / max(len(body_indices), 1),
                2,
            ),
            "interpretation": (
                f"Body text analysis: {len(body_findings)} of "
                f"{len(body_indices)} body regions show font "
                f"inconsistencies. "
                f"{font_size_analysis.get('distinct_sizes_in_body', 0)}"
                f" distinct font-size group(s) detected. "
                f"{len(inline_inconsistencies)} inline font change(s) "
                f"found between adjacent words."
            ),
        }

        if output_dir is not None:
            out_dir = Path(output_dir)
            out_dir.mkdir(parents=True, exist_ok=True)
            base_name = Path(image_path).stem if image_path else "document"
            annotated_path = out_dir / f"{base_name}_font_anomalies.png"
            report_path = out_dir / f"{base_name}_font_report.json"
            if not cv2.imwrite(str(annotated_path), annotated):
                raise IOError(f"Could not write annotated image: {annotated_path}")
            report["outputs"] = {
                "annotated_image": str(annotated_path),
                "json_report": str(report_path),
            }
            with report_path.open("w", encoding="utf-8") as f:
                json.dump(report, f, ensure_ascii=False, indent=2)
        return report


def analyze_document(
    image_path: str,
    output_dir: str = "outputs/font_analysis",
    ocr_lang: str = "hi",
) -> Dict[str, Any]:
    """Convenience wrapper for simple scripts."""
    analyzer = FontInconsistencyAnalyzer(ocr_lang=ocr_lang, use_ocr=True)
    return analyzer.analyze(image_path, output_dir=output_dir)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Analyze font/layout anomalies in a document.")
    parser.add_argument("image", help="Path to input image")
    parser.add_argument("--lang", default="hi", help="PaddleOCR language (default: hi)")
    parser.add_argument("--output", default="outputs/font_analysis", help="Output directory")
    parser.add_argument("--threshold", type=float, default=3.0, help="Robust-z anomaly threshold")
    args = parser.parse_args()

    analyzer = FontInconsistencyAnalyzer(
        ocr_lang=args.lang, use_ocr=True, anomaly_threshold=args.threshold
    )
    result = analyzer.analyze(args.image, output_dir=args.output)
    print(json.dumps(result["summary"], ensure_ascii=False, indent=2))
    print(f"Report: {result.get('outputs', {}).get('json_report', 'not saved')}")
    print(f"Annotated image: {result.get('outputs', {}).get('annotated_image', 'not saved')}")
