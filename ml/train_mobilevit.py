"""
Disease Classification Training Script
----------------------------------------
Fine-tunes a MobileViT-Small (via timm) on PlantVillage-style
folder-structured data for lightweight, mobile-oriented inference.

Expected dataset layout (PlantVillage default):
    dataset/
        Tomato___Early_blight/
            img001.jpg
            ...
        Tomato___Late_blight/
            ...
        Tomato___healthy/
            ...
        Apple___Black_rot/
            ...

Download PlantVillage via Hugging Face:
    from datasets import load_dataset
    ds = load_dataset("mohanty/PlantVillage", "color")

Install deps:
    pip install torch torchvision timm --break-system-packages

Run:
    python train_mobilevit.py --data_dir ./dataset --epochs 15
"""

import argparse
import os
import time

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms

try:
    import timm
except ImportError as e:
    raise SystemExit(
        "timm is required: pip install timm --break-system-packages"
    ) from e


IMG_SIZE = 224
MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]


def build_transforms(train: bool):
    if train:
        return transforms.Compose([
            transforms.Resize((IMG_SIZE, IMG_SIZE)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(15),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
            transforms.ToTensor(),
            transforms.Normalize(MEAN, STD),
        ])
    return transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ])


def build_model(num_classes: int):
    # mobilevit_s = MobileViT-Small, pretrained on ImageNet
    model = timm.create_model("mobilevit_s", pretrained=True, num_classes=num_classes)
    return model


def train(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    full_dataset = datasets.ImageFolder(args.data_dir, transform=build_transforms(train=True))
    class_names = full_dataset.classes
    print(f"Found {len(class_names)} classes: {class_names}")

    val_size = int(len(full_dataset) * args.val_split)
    train_size = len(full_dataset) - val_size
    train_ds, val_ds = random_split(full_dataset, [train_size, val_size])
    val_ds.dataset.transform = build_transforms(train=False)

    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False, num_workers=2)

    model = build_model(len(class_names)).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs)

    best_acc = 0.0
    for epoch in range(args.epochs):
        model.train()
        start = time.time()
        running_loss = 0.0
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * images.size(0)

        scheduler.step()
        train_loss = running_loss / train_size

        model.eval()
        correct, total = 0, 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                _, predicted = torch.max(outputs, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()
        val_acc = correct / total if total else 0.0

        print(
            f"Epoch {epoch+1}/{args.epochs} | "
            f"train_loss={train_loss:.4f} | val_acc={val_acc:.4f} | "
            f"time={time.time()-start:.1f}s"
        )

        if val_acc > best_acc:
            best_acc = val_acc
            os.makedirs(args.output_dir, exist_ok=True)
            torch.save(
                {"model_state": model.state_dict(), "class_names": class_names},
                os.path.join(args.output_dir, "mobilevit_best.pt"),
            )
            print(f"  -> saved new best checkpoint (val_acc={val_acc:.4f})")

    print(f"Training complete. Best val_acc={best_acc:.4f}")
    print("Next step: export to ONNX / TorchScript for Flutter mobile inference:")
    print("  torch.jit.script(model).save('mobilevit_mobile.pt')")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", type=str, required=True)
    parser.add_argument("--output_dir", type=str, default="./checkpoints")
    parser.add_argument("--epochs", type=int, default=15)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=3e-4)
    parser.add_argument("--val_split", type=float, default=0.2)
    args = parser.parse_args()
    train(args)
