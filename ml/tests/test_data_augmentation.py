"""
Unit Tests for Data Augmentation Framework
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
import torch
import numpy as np
from PIL import Image

from data_augmentation import (
    get_data_transforms,
    mixup_data,
    cutmix_data,
    get_visual_augmentation_pipeline,
)
from diagnose_augmentation import diagnose_augmentations, calculate_image_diagnostics


def test_get_data_transforms_shapes():
    for level in ["light", "medium", "heavy"]:
        train_t, val_t = get_data_transforms(aug_level=level, img_size=224)
        img = Image.new("RGB", (300, 300), color=(100, 150, 80))

        out_train = train_t(img)
        out_val = val_t(img)

        assert isinstance(out_train, torch.Tensor)
        assert isinstance(out_val, torch.Tensor)
        assert out_train.shape == (3, 224, 224)
        assert out_val.shape == (3, 224, 224)


def test_mixup_data():
    x = torch.randn(4, 3, 224, 224)
    y = torch.tensor([0, 1, 2, 3])

    mixed_x, y_a, y_b, lam = mixup_data(x, y, alpha=0.2)

    assert mixed_x.shape == x.shape
    assert y_a.shape == y.shape
    assert y_b.shape == y.shape
    assert 0.0 <= lam <= 1.0


def test_cutmix_data():
    x = torch.randn(4, 3, 224, 224)
    y = torch.tensor([0, 1, 2, 3])

    cut_x, y_a, y_b, lam = cutmix_data(x, y, alpha=1.0)

    assert cut_x.shape == x.shape
    assert y_a.shape == y.shape
    assert y_b.shape == y.shape
    assert 0.0 <= lam <= 1.0


def test_calculate_image_diagnostics():
    img_np = np.zeros((100, 100, 3), dtype=np.uint8)
    img_np[20:80, 20:80, :] = [40, 180, 60]  # Green square

    diag = calculate_image_diagnostics(img_np)

    assert "sharpness" in diag
    assert "brightness" in diag
    assert "contrast" in diag
    assert "plant_ratio" in diag
    assert diag["plant_ratio"] > 0.1


def test_diagnose_augmentations_synthetic():
    report = diagnose_augmentations(image_path=None, num_samples=6, output_dir=None)

    assert report["status"] in ["PASS", "WARNING"]
    assert report["augmented_summary"]["samples_analyzed"] == 6
    assert 0.0 <= report["augmented_summary"]["preservation_score"] <= 1.0
