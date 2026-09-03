"""
Image Verification & Multi-Spectrum Diagnostic Module
------------------------------------------------------
Runs BEFORE the disease-classification model. Evaluates image suitability across
3 primary diagnostic layers:

1. Quality Check        - Blur (Laplacian variance), Brightness/Exposure, Contrast, Resolution
2. Multi-Spectrum Leaf  - Multi-spectrum HSV + Lab + RGB leaf & disease spot detection
   Validity Check         (accurately identifies healthy green, chlorotic yellow, rusted,
                          and brown necrotic diseased foliage)
3. Context Match        - Optional post-classification check against field crop records

Exposes `verify_image(image_path)` and `diagnose_image_full(image_path)`.
"""

from dataclasses import dataclass
from typing import Optional, Dict, Any
import cv2
import numpy as np

MIN_RESOLUTION = 224          # px, shorter side
BLUR_THRESHOLD = 100.0        # Laplacian variance; below this = too blurry
MIN_BRIGHTNESS = 40           # 0-255 mean brightness
MAX_BRIGHTNESS = 220
MIN_PLANT_PIXEL_RATIO = 0.15  # at least 15% of the image should be plant-colored


@dataclass
class VerificationResult:
    is_valid: bool
    rejection_reason: Optional[str]
    quality_score: dict
    plant_pixel_ratio: float


def _blur_score(gray: np.ndarray) -> float:
    """Computes focus sharpness via Laplacian variance."""
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())


def _brightness_score(gray: np.ndarray) -> float:
    """Computes overall mean luminance (0-255)."""
    return float(np.mean(gray))


def _contrast_score(gray: np.ndarray) -> float:
    """Computes dynamic contrast intensity via standard deviation."""
    return float(np.std(gray))


def _plant_pixel_ratio(hsv: np.ndarray) -> float:
    """
    Backwards compatible HSV plant pixel calculation.
    """
    lower = np.array([15, 20, 20])
    upper = np.array([100, 255, 255])
    mask = cv2.inRange(hsv, lower, upper)
    return float(np.count_nonzero(mask)) / float(mask.size)


def _plant_pixel_ratio_multi_spectrum(img_bgr: np.ndarray) -> float:
    """
    Multi-spectrum plant & disease tissue detector.
    Combines HSV and CIE-Lab color spaces to recognize:
      - Healthy green foliage (HSV H: 25-95)
      - Chlorotic yellow foliage (HSV H: 10-35)
      - Rusted & brown diseased leaf tissue (HSV H: 0-18 & 160-180 with moderate S & V)
      - CIE-Lab vegetation threshold (Lab a* <= 130)
    """
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)

    # Mask 1: Healthy green
    m_green = cv2.inRange(hsv, np.array([25, 20, 20]), np.array([95, 255, 255]))

    # Mask 2: Yellow chlorotic & diseased spots
    m_yellow = cv2.inRange(hsv, np.array([10, 25, 30]), np.array([38, 255, 255]))

    # Mask 3: Browned / rust / necrotic diseased leaf tissue
    m_brown1 = cv2.inRange(hsv, np.array([0, 20, 20]), np.array([18, 255, 220]))
    m_brown2 = cv2.inRange(hsv, np.array([160, 20, 20]), np.array([180, 255, 220]))

    # Mask 4: CIE-Lab vegetation greenness (a* channel <= 128)
    a_channel = lab[:, :, 1]
    m_lab = cv2.inRange(a_channel, 0, 130)

    combined = cv2.bitwise_or(m_green, m_yellow)
    combined = cv2.bitwise_or(combined, m_brown1)
    combined = cv2.bitwise_or(combined, m_brown2)
    combined = cv2.bitwise_and(combined, m_lab)

    return float(np.count_nonzero(combined)) / float(combined.size)


def verify_image(image_path: str) -> dict:
    """
    Runs primary verification checks on an image file.
    Returns standard VerificationResult dict.
    """
    img = cv2.imread(image_path)
    if img is None:
        return VerificationResult(
            is_valid=False,
            rejection_reason="File could not be read as an image.",
            quality_score={},
            plant_pixel_ratio=0.0,
        ).__dict__

    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # --- 1. Quality Check ---
    if min(h, w) < MIN_RESOLUTION:
        return VerificationResult(
            False,
            f"Image resolution too low ({w}x{h}). Please retake closer to the leaf.",
            {"resolution": (w, h)},
            0.0,
        ).__dict__

    brightness = _brightness_score(gray)
    contrast = _contrast_score(gray)

    if brightness < MIN_BRIGHTNESS:
        return VerificationResult(
            False,
            "Image is too dark. Please retake in better lighting.",
            {"brightness": round(brightness, 2), "contrast": round(contrast, 2)},
            0.0,
        ).__dict__
    if brightness > MAX_BRIGHTNESS:
        return VerificationResult(
            False,
            "Image is overexposed. Please avoid direct glare/flash.",
            {"brightness": round(brightness, 2), "contrast": round(contrast, 2)},
            0.0,
        ).__dict__

    blur = _blur_score(gray)
    if blur < BLUR_THRESHOLD:
        return VerificationResult(
            False,
            "Image is too blurry. Please hold the camera steady and refocus.",
            {
                "blur_score": round(blur, 2),
                "brightness": round(brightness, 2),
                "contrast": round(contrast, 2),
            },
            0.0,
        ).__dict__

    # --- 2. Multi-Spectrum Leaf Validity Check ---
    ratio_multi = _plant_pixel_ratio_multi_spectrum(img)
    ratio_hsv = _plant_pixel_ratio(hsv)
    effective_ratio = max(ratio_multi, ratio_hsv)

    if effective_ratio < MIN_PLANT_PIXEL_RATIO:
        return VerificationResult(
            False,
            "No crop leaf detected in this image. Please photograph a leaf directly.",
            {
                "blur_score": round(blur, 2),
                "brightness": round(brightness, 2),
                "contrast": round(contrast, 2),
            },
            round(effective_ratio, 3),
        ).__dict__

    return VerificationResult(
        is_valid=True,
        rejection_reason=None,
        quality_score={
            "blur_score": round(blur, 2),
            "brightness": round(brightness, 2),
            "contrast": round(contrast, 2),
            "resolution": (w, h),
        },
        plant_pixel_ratio=round(effective_ratio, 3),
    ).__dict__


def diagnose_image_full(image_path: str) -> dict:
    """
    Runs full quantitative diagnostic metrics on an image, returning detailed stats.
    """
    img = cv2.imread(image_path)
    if img is None:
        return {"is_valid": False, "error": "Unable to read image file."}

    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    blur = _blur_score(gray)
    brightness = _brightness_score(gray)
    contrast = _contrast_score(gray)
    ratio_hsv = _plant_pixel_ratio(hsv)
    ratio_multi = _plant_pixel_ratio_multi_spectrum(img)
    effective_ratio = max(ratio_hsv, ratio_multi)

    primary = verify_image(image_path)

    suggestions = []
    if blur < BLUR_THRESHOLD:
        suggestions.append("Hold camera steady 10-15 cm from leaf to fix blur.")
    if brightness < MIN_BRIGHTNESS:
        suggestions.append("Move to natural daylight or switch on camera flash.")
    if brightness > MAX_BRIGHTNESS:
        suggestions.append("Reduce direct sun glare or disable overhead flash.")
    if effective_ratio < MIN_PLANT_PIXEL_RATIO:
        suggestions.append("Fill at least 30% of the frame with the crop leaf.")

    return {
        "is_valid": primary["is_valid"],
        "rejection_reason": primary["rejection_reason"],
        "metrics": {
            "resolution": f"{w}x{h}",
            "blur_score": round(blur, 2),
            "blur_status": "sharp" if blur >= BLUR_THRESHOLD else "blurry",
            "brightness": round(brightness, 2),
            "brightness_status": "normal" if MIN_BRIGHTNESS <= brightness <= MAX_BRIGHTNESS else ("dark" if brightness < MIN_BRIGHTNESS else "overexposed"),
            "contrast": round(contrast, 2),
            "plant_coverage_pct": round(effective_ratio * 100, 1),
            "plant_coverage_status": "adequate" if effective_ratio >= MIN_PLANT_PIXEL_RATIO else "insufficient",
        },
        "suggestions": suggestions,
    }


def check_context_match(predicted_crop: str, expected_crop: Optional[str]) -> dict:
    """Stage 3: Context Match helper."""
    if not expected_crop:
        return {"context_match": True, "note": "No expected crop set - skipped."}
    match = predicted_crop.strip().lower() == expected_crop.strip().lower()
    return {
        "context_match": match,
        "note": None if match else (
            f"Predicted crop '{predicted_crop}' does not match expected "
            f"crop '{expected_crop}' for this field/record."
        ),
    }


if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python image_verification.py <image_path>")
        sys.exit(1)
    import json
    print(json.dumps(diagnose_image_full(sys.argv[1]), indent=2))
