"""
Test suite for Image Verification and Diagnostics
"""
import sys
import os
import cv2
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from image_verification import verify_image, diagnose_image_full


def test_healthy_leaf_passes(healthy_leaf):
    result = verify_image(healthy_leaf)
    assert result["is_valid"] is True
    assert result["rejection_reason"] is None


def test_diseased_leaf_still_passes_verification(moderate_leaf):
    result = verify_image(moderate_leaf)
    assert result["is_valid"] is True


def test_blurry_image_rejected(blurry_leaf):
    result = verify_image(blurry_leaf)
    assert result["is_valid"] is False
    assert "blurry" in result["rejection_reason"].lower()


def test_dark_image_rejected_as_dark_not_blurry(dark_leaf):
    result = verify_image(dark_leaf)
    assert result["is_valid"] is False
    assert "dark" in result["rejection_reason"].lower()
    assert "blurry" not in result["rejection_reason"].lower()


def test_overexposed_image_rejected(overexposed_leaf):
    result = verify_image(overexposed_leaf)
    assert result["is_valid"] is False
    assert "overexposed" in result["rejection_reason"].lower()


def test_non_plant_image_rejected(non_plant_image):
    result = verify_image(non_plant_image)
    assert result["is_valid"] is False
    assert "leaf" in result["rejection_reason"].lower() or "detected" in result["rejection_reason"].lower()


def test_low_resolution_image_rejected(low_resolution_image):
    result = verify_image(low_resolution_image)
    assert result["is_valid"] is False
    assert "resolution" in result["rejection_reason"].lower()


def test_nonexistent_file_handled_gracefully():
    result = verify_image("/tmp/does_not_exist_12345.jpg")
    assert result["is_valid"] is False
    assert result["rejection_reason"] is not None


def test_diagnose_image_full_metrics(healthy_leaf):
    full_diag = diagnose_image_full(healthy_leaf)
    assert full_diag["is_valid"] is True
    assert "metrics" in full_diag
    assert "blur_score" in full_diag["metrics"]
    assert "brightness" in full_diag["metrics"]
    assert "contrast" in full_diag["metrics"]
    assert "plant_coverage_pct" in full_diag["metrics"]


def test_yellow_and_brown_diseased_leaf_passes(tmp_path):
    # Create a synthetic image of a severely yellowed and rusted diseased leaf
    img = np.full((300, 300, 3), 50, dtype=np.uint8)  # Neutral background
    # Yellow chlorotic leaf area (BGR)
    cv2.circle(img, (150, 150), 90, (30, 200, 220), -1)
    # Brown necrotic lesion spot
    cv2.circle(img, (120, 120), 30, (20, 50, 100), -1)

    img_path = str(tmp_path / "diseased_yellow_brown_leaf.jpg")
    cv2.imwrite(img_path, img)

    result = verify_image(img_path)
    assert result["is_valid"] is True
