"""
Data Augmentation Diagnostic & Inspection Tool
-----------------------------------------------
Evaluates and verifies data augmentations on crop leaf images.

Checks:
1. Sharpness & Blur Retention: Verifies structural features aren't over-blurred.
2. Exposure & Brightness Shift: Measures lighting changes under augmentations.
3. Leaf Area Coverage: Ensures augmentations retain minimum required leaf material.
4. Signal Preservation Index: Assesses overall feature stability across 10 augmented variations.

Usage:
  python diagnose_augmentation.py [--input image.jpg] [--output_dir ./aug_output] [--samples 8]
"""

import argparse
import os
import sys
import numpy as np
import cv2
from PIL import Image
import torch

from data_augmentation import get_visual_augmentation_pipeline, get_data_transforms


def calculate_image_diagnostics(img_np: np.ndarray) -> dict:
    """Calculates quantitative diagnostic metrics for an RGB numpy array (0-255)."""
    gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
    hsv = cv2.cvtColor(img_np, cv2.COLOR_RGB2HSV)

    # Blur / Sharpness via Laplacian variance
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    # Brightness (0 - 255)
    mean_brightness = float(np.mean(gray))

    # Contrast via standard deviation of pixel intensities
    contrast_std = float(np.std(gray))

    # Multi-color plant coverage (green, yellow, brown leaf HSV ranges)
    # Hue: 10-100 covers yellow, green, and brownish infected leaf areas
    lower_plant = np.array([10, 25, 20])
    upper_plant = np.array([105, 255, 255])
    mask = cv2.inRange(hsv, lower_plant, upper_plant)
    plant_ratio = float(np.count_nonzero(mask)) / float(mask.size)

    return {
        "sharpness": round(laplacian_var, 2),
        "brightness": round(mean_brightness, 2),
        "contrast": round(contrast_std, 2),
        "plant_ratio": round(plant_ratio, 4),
    }


def diagnose_augmentations(
    image_path: str | None = None,
    num_samples: int = 8,
    output_dir: str | None = None,
) -> dict:
    """
    Runs diagnostic inspection across multiple augmented variations of a crop leaf image.
    """
    if image_path and os.path.exists(image_path):
        pil_img = Image.open(image_path).convert("RGB")
    else:
        # Create a synthetic test crop leaf image (green circle on neutral background)
        img_np = np.full((224, 224, 3), 40, dtype=np.uint8)
        cv2.circle(img_np, (112, 112), 70, (40, 160, 60), -1)  # Green leaf body
        cv2.circle(img_np, (90, 90), 20, (180, 140, 30), -1)    # Yellow disease spot
        cv2.circle(img_np, (130, 130), 12, (80, 40, 20), -1)    # Brown lesion spot
        pil_img = Image.fromarray(img_np)

    orig_np = np.array(pil_img)
    orig_diag = calculate_image_diagnostics(orig_np)

    pipeline = get_visual_augmentation_pipeline(img_size=224)
    augmented_diagnostics = []
    augmented_images_np = []

    for i in range(num_samples):
        aug_tensor = pipeline(pil_img)
        # Convert tensor [3, H, W] in [0, 1] back to numpy [H, W, 3] in [0, 255]
        aug_np = (aug_tensor.permute(1, 2, 0).numpy() * 255.0).astype(np.uint8)
        augmented_images_np.append(aug_np)
        diag = calculate_image_diagnostics(aug_np)
        augmented_diagnostics.append(diag)

    # Compute average metrics across samples
    avg_sharpness = float(np.mean([d["sharpness"] for d in augmented_diagnostics]))
    avg_brightness = float(np.mean([d["brightness"] for d in augmented_diagnostics]))
    avg_contrast = float(np.mean([d["contrast"] for d in augmented_diagnostics]))
    avg_plant_ratio = float(np.mean([d["plant_ratio"] for d in augmented_diagnostics]))

    # Signal Preservation Index: fraction of samples retaining acceptable metrics
    valid_samples = sum(
        1 for d in augmented_diagnostics if d["sharpness"] >= 15.0 and d["plant_ratio"] >= 0.05
    )
    preservation_score = round(valid_samples / num_samples, 2)

    report = {
        "status": "PASS" if preservation_score >= 0.75 else "WARNING",
        "input_image": image_path if image_path else "<synthetic_leaf>",
        "original_diagnostics": orig_diag,
        "augmented_summary": {
            "samples_analyzed": num_samples,
            "preservation_score": preservation_score,
            "avg_sharpness": round(avg_sharpness, 2),
            "avg_brightness": round(avg_brightness, 2),
            "avg_contrast": round(avg_contrast, 2),
            "avg_plant_ratio": round(avg_plant_ratio, 4),
        },
        "sample_details": augmented_diagnostics,
    }

    # Save visual grid if output_dir provided
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

        # Build grid canvas
        grid_cols = min(4, num_samples)
        grid_rows = int(np.ceil(num_samples / grid_cols))
        h, w, c = augmented_images_np[0].shape
        grid_img = np.zeros((grid_rows * h, grid_cols * w, c), dtype=np.uint8)

        for idx, img in enumerate(augmented_images_np):
            r = idx // grid_cols
            col = idx % grid_cols
            grid_img[r * h : (r + 1) * h, col * w : (col + 1) * w, :] = img

        grid_bgr = cv2.cvtColor(grid_img, cv2.COLOR_RGB2BGR)
        grid_save_path = os.path.join(output_dir, "augmentation_grid.jpg")
        cv2.imwrite(grid_save_path, grid_bgr)
        report["saved_grid_path"] = grid_save_path

    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Data Augmentation Diagnostic Inspector")
    parser.add_argument("--input", type=str, default=None, help="Input leaf image path")
    parser.add_argument("--output_dir", type=str, default="./aug_diagnostics", help="Output directory for grid image")
    parser.add_argument("--samples", type=int, default=8, help="Number of augmented samples")
    args = parser.parse_args()

    print("=" * 60)
    print("AI Crop Doctor — Data Augmentation Diagnostic Inspection")
    print("=" * 60)

    result = diagnose_augmentations(
        image_path=args.input,
        num_samples=args.samples,
        output_dir=args.output_dir,
    )

    print(f"Status:             {result['status']}")
    print(f"Preservation Score: {result['augmented_summary']['preservation_score'] * 100}%")
    print(f"Avg Sharpness:      {result['augmented_summary']['avg_sharpness']}")
    print(f"Avg Brightness:     {result['augmented_summary']['avg_brightness']}")
    print(f"Avg Contrast:       {result['augmented_summary']['avg_contrast']}")
    print(f"Avg Plant Ratio:    {result['augmented_summary']['avg_plant_ratio'] * 100:.1f}%")
    if "saved_grid_path" in result:
        print(f"Saved Diagnostic Grid: {result['saved_grid_path']}")
    print("=" * 60)
