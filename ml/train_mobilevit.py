"""
Disease Classification Training Script (MobileViT-Small)
--------------------------------------------------------
Fine-tunes a MobileViT-Small (via timm) on PlantVillage/Crop_Scan dataset.

Key Features:
1. Prevents PyTorch Subset transform overwriting bug by using dual ImageFolder instances
   or pre-split `train/` and `valid/` directories.
2. Supports pre-split dataset layouts (e.g. Crop_Scan-dataset/Model/dataset/train & valid).
3. Supports `--use_mixup` and `--use_cutmix` for extended multi-epoch heavy augmentation training.
4. Linear Warmup + Cosine Annealing scheduler for ViT stability.
5. Label Smoothing Cross-Entropy loss for imbalanced plant disease classes.
6. Computes Top-1 and Top-5 validation accuracy.

Usage for Heavy Augmentation (Extended 25-30 Epochs):
    python train_mobilevit.py --data_dir ./Crop_Scan-dataset/Model/dataset --epochs 25 --aug_level heavy --use_mixup
"""

import argparse
import os
import time
from typing import Tuple

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split, Subset
from torchvision import datasets

try:
    import timm
except ImportError as e:
    raise SystemExit(
        "timm is required: pip install timm --break-system-packages"
    ) from e

from data_augmentation import (
    get_data_transforms,
    mixup_data,
    mixup_criterion,
    cutmix_data,
)

IMG_SIZE = 224


def build_model(num_classes: int, pretrained: bool = True) -> nn.Module:
    """Builds MobileViT-Small model initialized with ImageNet weights."""
    model = timm.create_model("mobilevit_s", pretrained=pretrained, num_classes=num_classes)
    return model


def prepare_datasets(
    data_dir: str,
    val_split: float = 0.2,
    aug_level: str = "medium",
) -> Tuple[torch.utils.data.Dataset, torch.utils.data.Dataset, list[str]]:
    """
    Safely loads training and validation datasets without sharing/overwriting transforms.
    Automatically detects if data_dir contains `train/` and `valid/` (or `val/`) subdirectories.
    """
    train_transform, val_transform = get_data_transforms(aug_level=aug_level, img_size=IMG_SIZE)

    train_sub = os.path.join(data_dir, "train")
    val_sub = os.path.join(data_dir, "valid") if os.path.exists(os.path.join(data_dir, "valid")) else os.path.join(data_dir, "val")

    if os.path.isdir(train_sub) and os.path.isdir(val_sub):
        print(f"--> Detected pre-split dataset directories: {train_sub} & {val_sub}")
        train_ds = datasets.ImageFolder(train_sub, transform=train_transform)
        val_ds = datasets.ImageFolder(val_sub, transform=val_transform)
        class_names = train_ds.classes
    else:
        print(f"--> Loading single directory dataset: {data_dir} (random split {val_split * 100:.0f}%)")
        raw_train_ds = datasets.ImageFolder(data_dir, transform=train_transform)
        raw_val_ds = datasets.ImageFolder(data_dir, transform=val_transform)
        class_names = raw_train_ds.classes

        num_total = len(raw_train_ds)
        val_size = int(num_total * val_split)
        train_size = num_total - val_size

        generator = torch.Generator().manual_seed(42)
        indices = torch.randperm(num_total, generator=generator).tolist()
        train_indices = indices[:train_size]
        val_indices = indices[train_size:]

        train_ds = Subset(raw_train_ds, train_indices)
        val_ds = Subset(raw_val_ds, val_indices)

    return train_ds, val_ds, class_names


def accuracy(output: torch.Tensor, target: torch.Tensor, topk=(1, 5)) -> list[float]:
    """Computes top-k accuracy for the specified values of k."""
    with torch.no_grad():
        maxk = max(topk)
        batch_size = target.size(0)

        _, pred = output.topk(maxk, 1, True, True)
        pred = pred.t()
        correct = pred.eq(target.view(1, -1).expand_as(pred))

        res = []
        for k in topk:
            correct_k = correct[:k].reshape(-1).float().sum(0, keepdim=True)
            res.append(correct_k.mul_(100.0 / batch_size).item())
        return res


def train(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    aug_info = f"Augmentation: {args.aug_level.upper()}"
    if args.use_mixup:
        aug_info += " + MixUp"
    if args.use_cutmix:
        aug_info += " + CutMix"
    print(f"Using device: {device} | {aug_info} | Total Epochs: {args.epochs}")

    train_ds, val_ds, class_names = prepare_datasets(
        data_dir=args.data_dir,
        val_split=args.val_split,
        aug_level=args.aug_level,
    )
    print(f"Found {len(class_names)} classes. Train count: {len(train_ds)}, Val count: {len(val_ds)}")

    use_cuda = torch.cuda.is_available()
    pin_memory = use_cuda
    num_workers = 2 if use_cuda or os.name != "nt" else 0

    train_loader = DataLoader(
        train_ds, batch_size=args.batch_size, shuffle=True, num_workers=num_workers, pin_memory=pin_memory
    )
    val_loader = DataLoader(
        val_ds, batch_size=args.batch_size, shuffle=False, num_workers=num_workers, pin_memory=pin_memory
    )

    model = build_model(len(class_names)).to(device)

    criterion = nn.CrossEntropyLoss(label_smoothing=args.label_smoothing)
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-2)

    warmup_epochs = min(3, max(1, args.epochs // 5))
    warmup_scheduler = torch.optim.lr_scheduler.LinearLR(
        optimizer, start_factor=0.1, total_iters=warmup_epochs
    )
    cosine_scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
        optimizer, T_max=args.epochs - warmup_epochs
    )
    scheduler = torch.optim.lr_scheduler.SequentialLR(
        optimizer, schedulers=[warmup_scheduler, cosine_scheduler], milestones=[warmup_epochs]
    )

    best_acc = 0.0
    for epoch in range(args.epochs):
        model.train()
        start = time.time()
        running_loss = 0.0
        train_top1 = 0.0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()

            if args.use_mixup and torch.rand(1).item() > 0.5:
                images, y_a, y_b, lam = mixup_data(images, labels, alpha=0.2)
                outputs = model(images)
                loss = mixup_criterion(criterion, outputs, y_a, y_b, lam)
            elif args.use_cutmix and torch.rand(1).item() > 0.5:
                images, y_a, y_b, lam = cutmix_data(images, labels, alpha=1.0)
                outputs = model(images)
                loss = mixup_criterion(criterion, outputs, y_a, y_b, lam)
            else:
                outputs = model(images)
                loss = criterion(outputs, labels)

            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            top1, _ = accuracy(outputs, labels, topk=(1, min(5, len(class_names))))
            train_top1 += top1 * images.size(0)

        scheduler.step()
        train_loss = running_loss / len(train_ds)
        train_acc = train_top1 / len(train_ds)

        model.eval()
        val_loss = 0.0
        val_top1_sum = 0.0
        val_top5_sum = 0.0

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                val_loss += loss.item() * images.size(0)

                top1, top5 = accuracy(outputs, labels, topk=(1, min(5, len(class_names))))
                val_top1_sum += top1 * images.size(0)
                val_top5_sum += top5 * images.size(0)

        epoch_val_loss = val_loss / len(val_ds) if len(val_ds) else 0.0
        val_acc = val_top1_sum / len(val_ds) if len(val_ds) else 0.0
        val_top5 = val_top5_sum / len(val_ds) if len(val_ds) else 0.0

        print(
            f"Epoch {epoch+1:02d}/{args.epochs:02d} | "
            f"train_loss={train_loss:.4f} train_acc={train_acc:.2f}% | "
            f"val_loss={epoch_val_loss:.4f} val_top1={val_acc:.2f}% val_top5={val_top5:.2f}% | "
            f"lr={optimizer.param_groups[0]['lr']:.6f} | "
            f"time={time.time()-start:.1f}s"
        )

        if val_acc > best_acc:
            best_acc = val_acc
            os.makedirs(args.output_dir, exist_ok=True)
            torch.save(
                {
                    "model_state": model.state_dict(),
                    "class_names": class_names,
                    "val_acc": val_acc,
                    "epoch": epoch + 1,
                },
                os.path.join(args.output_dir, "mobilevit_best.pt"),
            )
            print(f"  -> Saved new best checkpoint (val_acc={val_acc:.2f}%)")

    print(f"Training complete. Best val_acc={best_acc:.2f}%")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MobileViT Extended Training with Data Augmentation")
    parser.add_argument("--data_dir", type=str, required=True, help="Path to dataset directory")
    parser.add_argument("--epochs", type=int, default=30, help="Number of training epochs (recommended: 30-40)")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr", type=float, default=3e-4, help="Learning rate")
    parser.add_argument("--val_split", type=float, default=0.2, help="Validation split ratio (if not pre-split)")
    parser.add_argument("--aug_level", type=str, default="medium", choices=["light", "medium", "heavy"])
    parser.add_argument("--use_mixup", action="store_true", help="Enable MixUp batch data augmentation")
    parser.add_argument("--use_cutmix", action="store_true", help="Enable CutMix batch data augmentation")
    parser.add_argument("--label_smoothing", type=float, default=0.1, help="Label smoothing factor")
    args = parser.parse_args()
    train(args)
