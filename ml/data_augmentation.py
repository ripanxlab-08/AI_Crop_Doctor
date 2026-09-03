"""
Data Augmentation Framework for AI Crop Doctor
----------------------------------------------
Provides multi-tiered, field-realistic data augmentation pipelines for plant leaf disease
classification models (e.g. MobileViT, ResNet, EfficientNet).

Includes:
1. `get_data_transforms`: Light, Medium, and Heavy augmentations covering geometric,
   color space, lighting, blur, and occlusion transformations.
2. `MixUp` & `CutMix`: Advanced batch-level data augmentation helpers for robust generalization.
3. Diagnostic preview helpers for visualizing augmentations.
"""

import math
import random
from typing import Tuple, Dict, Any, Optional

import torch
import torch.nn as nn
from torchvision import transforms

# ImageNet normalization defaults
MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]


def get_data_transforms(
    aug_level: str = "medium",
    img_size: int = 224,
    mean: list[float] = MEAN,
    std: list[float] = STD,
) -> Tuple[transforms.Compose, transforms.Compose]:
    """
    Builds training and validation transforms based on the requested augmentation level.

    Args:
        aug_level: One of 'light', 'medium', 'heavy'.
        img_size: Target image dimensions (width, height).
        mean: Normalization RGB mean.
        std: Normalization RGB std.

    Returns:
        (train_transform, val_transform) tuple of torchvision Compose objects.
    """
    val_transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=mean, std=std),
    ])

    level = aug_level.lower().strip()

    if level == "light":
        train_transform = transforms.Compose([
            transforms.Resize((img_size, img_size)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomRotation(degrees=15),
            transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.15),
            transforms.ToTensor(),
            transforms.Normalize(mean=mean, std=std),
        ])
    elif level == "heavy":
        train_transform = transforms.Compose([
            transforms.Resize((img_size + 32, img_size + 32)),
            transforms.RandomCrop((img_size, img_size)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomVerticalFlip(p=0.3),
            transforms.RandomRotation(degrees=45),
            transforms.RandomAffine(
                degrees=15,
                translate=(0.15, 0.15),
                scale=(0.85, 1.15),
                shear=10,
            ),
            transforms.RandomPerspective(distortion_scale=0.2, p=0.3),
            transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.08),
            transforms.GaussianBlur(kernel_size=(3, 3), sigma=(0.1, 1.5)),
            transforms.ToTensor(),
            transforms.Normalize(mean=mean, std=std),
            transforms.RandomErasing(p=0.35, scale=(0.02, 0.2), ratio=(0.3, 3.3), value="random"),
        ])
    else:  # Default: 'medium'
        train_transform = transforms.Compose([
            transforms.Resize((img_size + 16, img_size + 16)),
            transforms.RandomCrop((img_size, img_size)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomVerticalFlip(p=0.2),
            transforms.RandomRotation(degrees=30),
            transforms.RandomAffine(
                degrees=0,
                translate=(0.1, 0.1),
                scale=(0.9, 1.1),
            ),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.05),
            transforms.ToTensor(),
            transforms.Normalize(mean=mean, std=std),
            transforms.RandomErasing(p=0.2, scale=(0.02, 0.15), ratio=(0.3, 3.3)),
        ])

    return train_transform, val_transform


def get_visual_augmentation_pipeline(img_size: int = 224) -> transforms.Compose:
    """
    Returns an un-normalized PIL/Tensor pipeline intended for visual inspection & diagnostics.
    Output is in [0, 1] range without ImageNet Z-score normalization.
    """
    return transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.2),
        transforms.RandomRotation(degrees=25),
        transforms.RandomAffine(degrees=10, translate=(0.08, 0.08), scale=(0.92, 1.08)),
        transforms.ColorJitter(brightness=0.25, contrast=0.25, saturation=0.25, hue=0.06),
        transforms.ToTensor(),
    ])


def mixup_data(x: torch.Tensor, y: torch.Tensor, alpha: float = 0.2) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor, float]:
    """
    Applies MixUp data augmentation to a batch of images and labels.

    Returns:
        mixed_x, y_a, y_b, lam
    """
    if alpha > 0:
        lam = float(torch.distributions.Beta(alpha, alpha).sample())
    else:
        lam = 1.0

    batch_size = x.size(0)
    index = torch.randperm(batch_size, device=x.device)

    mixed_x = lam * x + (1 - lam) * x[index]
    y_a, y_b = y, y[index]
    return mixed_x, y_a, y_b, lam


def mixup_criterion(criterion: nn.Module, pred: torch.Tensor, y_a: torch.Tensor, y_b: torch.Tensor, lam: float) -> torch.Tensor:
    """Computes loss weighted by MixUp lambda."""
    return lam * criterion(pred, y_a) + (1 - lam) * criterion(pred, y_b)


def rand_bbox(size: Tuple[int, int, int, int], lam: float) -> Tuple[int, int, int, int]:
    """Generates random bounding box coordinates for CutMix."""
    W = size[2]
    H = size[3]
    cut_rat = math.sqrt(1.0 - lam)
    cut_w = int(W * cut_rat)
    cut_h = int(H * cut_rat)

    cx = random.randint(0, W)
    cy = random.randint(0, H)

    bbx1 = max(cx - cut_w // 2, 0)
    bby1 = max(cy - cut_h // 2, 0)
    bbx2 = min(cx + cut_w // 2, W)
    bby2 = min(cy + cut_h // 2, H)

    return bbx1, bby1, bbx2, bby2


def cutmix_data(x: torch.Tensor, y: torch.Tensor, alpha: float = 1.0) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor, float]:
    """
    Applies CutMix data augmentation to a batch of images and labels.

    Returns:
        cutmix_x, y_a, y_b, lam
    """
    if alpha > 0:
        lam = float(torch.distributions.Beta(alpha, alpha).sample())
    else:
        lam = 1.0

    batch_size = x.size(0)
    index = torch.randperm(batch_size, device=x.device)

    y_a = y
    y_b = y[index]
    bbx1, bby1, bbx2, bby2 = rand_bbox(x.size(), lam)

    x_cut = x.clone()
    x_cut[:, :, bbx1:bbx2, bby1:bby2] = x[index, :, bbx1:bbx2, bby1:bby2]

    # Adjust lambda to match actual pixel ratio replaced
    lam = 1.0 - ((bbx2 - bbx1) * (bby2 - bby1) / (x.size(2) * x.size(3)))
    return x_cut, y_a, y_b, lam
