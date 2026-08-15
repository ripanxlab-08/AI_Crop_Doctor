import os
import sys
import time
import json
import zipfile
import argparse
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Subset
from torchvision import transforms, datasets
import timm

def parse_args():
    parser = argparse.ArgumentParser(description="Train MobileViT Small on Crop Leaf Diseases")
    parser.add_argument("--epochs", type=int, default=20, help="Number of total training epochs")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size for dataloaders")
    parser.add_argument("--lr", type=float, default=0.0001, help="Initial learning rate")
    parser.add_argument("--quick-test", action="store_true", help="Run a quick test training on a small dataset subset")
    parser.add_argument("--zip-path", type=str, default="Crop_Scan-dataset/Model/new-plant-diseases-dataset.zip", help="Path to zip dataset archive")
    parser.add_argument("--extract-dir", type=str, default="Crop_Scan-dataset/Model/dataset", help="Directory to extract dataset zip to")
    return parser.parse_args()

def extract_dataset(zip_path, extract_dir):
    """Checks and extracts the dataset zip if not already extracted."""
    # Find dataset root containing 'train' and 'valid'
    def find_dataset_root(root_dir):
        for root, dirs, _ in os.walk(root_dir):
            if 'train' in dirs and 'valid' in dirs:
                return root
        return None

    dataset_root = find_dataset_root(extract_dir)
    if dataset_root:
        print(f"Detected existing dataset root folder: {dataset_root}")
        return dataset_root

    if not os.path.exists(zip_path):
        # Check workspace root fallback
        fallback_path = os.path.join(os.getcwd(), os.path.basename(zip_path))
        if os.path.exists(fallback_path):
            zip_path = fallback_path
        else:
            raise FileNotFoundError(f"Dataset ZIP file not found at {zip_path}. Please verify path.")

    print(f"Extracting {zip_path} to {extract_dir}... This may take a few minutes.")
    os.makedirs(extract_dir, exist_ok=True)
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        # Get file list to show progress
        members = zip_ref.infolist()
        total_files = len(members)
        print(f"Total files in archive: {total_files}")
        
        extracted_count = 0
        for idx, member in enumerate(members):
            # Clean filename by stripping duplicate nested directories inside zip
            filename_parts = member.filename.replace('\\', '/').split('/')
            if 'train' in filename_parts:
                train_idx = filename_parts.index('train')
                member.filename = '/'.join(filename_parts[train_idx:])
            elif 'valid' in filename_parts:
                valid_idx = filename_parts.index('valid')
                member.filename = '/'.join(filename_parts[valid_idx:])
            else:
                # Skip any metadata or root folder entries
                continue
                
            zip_ref.extract(member, extract_dir)
            extracted_count += 1
            if extracted_count % 5000 == 0 or (idx + 1) == total_files:
                print(f"Extracted {extracted_count} files...")
                
    dataset_root = find_dataset_root(extract_dir)
    if not dataset_root:
        raise ValueError("Could not locate 'train' and 'valid' directories in the extracted folder.")
    
    print(f"Dataset unzipped successfully. Root: {dataset_root}")
    return dataset_root

def set_backbone_freeze(model, freeze=True):
    """Freezes or unfreezes all layers except the classifier head (model.head)."""
    for name, param in model.named_parameters():
        if "head" not in name:
            param.requires_grad = not freeze
    print(f"MobileViT Backbone status: {'FROZEN' if freeze else 'UNFROZEN (Fine-Tuning)'}")

class EarlyStopping:
    def __init__(self, patience=5, min_delta=0.0):
        self.patience = patience
        self.min_delta = min_delta
        self.counter = 0
        self.best_loss = None
        self.early_stop = False

    def __call__(self, val_loss):
        if self.best_loss is None:
            self.best_loss = val_loss
        elif val_loss > self.best_loss - self.min_delta:
            self.counter += 1
            print(f"EarlyStopping counter: {self.counter} out of {self.patience}")
            if self.counter >= self.patience:
                self.early_stop = True
        else:
            self.best_loss = val_loss
            self.counter = 0

def main():
    args = parse_args()
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device for training: {device}")
    if device.type == 'cpu':
        print("WARNING: CUDA GPU is not available. Training on CPU will be extremely slow.")
        if not args.quick_test:
            print("TIP: Add --quick-test to run a fast, 3-minute validation on a tiny subset.")
            
    try:
        # 1. Extract dataset
        dataset_root = extract_dataset(args.zip_path, args.extract_dir)
        train_dir = os.path.join(dataset_root, 'train')
        valid_dir = os.path.join(dataset_root, 'valid')
        
        # 2. Setup transforms
        IMAGE_SIZE = 224
        train_transform = transforms.Compose([
            transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomVerticalFlip(),
            transforms.RandomRotation(15),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        valid_transform = transforms.Compose([
            transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        # Load datasets
        train_dataset = datasets.ImageFolder(train_dir, transform=train_transform)
        valid_dataset = datasets.ImageFolder(valid_dir, transform=valid_transform)
        
        class_names = train_dataset.classes
        num_classes = len(class_names)
        print(f"Detected {num_classes} classes: {class_names}")
        
        # 3. Handle quick test subset sampling
        if args.quick_test:
            print("\nQuick-test mode active. Creating tiny training & validation subsets...")
            # Sample 5 images per class for training
            train_indices = []
            train_targets = np.array(train_dataset.targets)
            for class_idx in range(num_classes):
                class_indices = np.where(train_targets == class_idx)[0]
                # Sample up to 5 elements
                train_indices.extend(class_indices[:min(5, len(class_indices))])
            train_dataset = Subset(train_dataset, train_indices)
            
            # Sample 2 images per class for validation
            val_indices = []
            val_targets = np.array(valid_dataset.targets)
            for class_idx in range(num_classes):
                class_indices = np.where(val_targets == class_idx)[0]
                # Sample up to 2 elements
                val_indices.extend(class_indices[:min(2, len(class_indices))])
            valid_dataset = Subset(valid_dataset, val_indices)
            
            # Override epochs to 1 for quick execution test
            args.epochs = 1
            print(f"Subset sizes: Train = {len(train_dataset)}, Val = {len(valid_dataset)}")
            
        # Dataloaders
        train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True, num_workers=0)
        valid_loader = DataLoader(valid_dataset, batch_size=args.batch_size, shuffle=False, num_workers=0)
        
        # 4. Initialize adapted MobileViT Small
        print("Initializing MobileViT Small structure from timm...")
        model = timm.create_model('mobilevit_s', pretrained=False)
        
        # Adjust head
        model.reset_classifier(num_classes)
        model = model.to(device)
        print(f"Classifier head updated for {num_classes} target labels.")
        
        # 5. Optimizer & Scheduler & Loss setup
        criterion = nn.CrossEntropyLoss()
        optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr)
        
        # Freeze backbone for first 5 epochs (except in quick-test mode where we run just 1 epoch)
        if not args.quick_test and args.epochs > 5:
            set_backbone_freeze(model, freeze=True)
            scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=5)
        else:
            set_backbone_freeze(model, freeze=False)
            scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs)
            
        early_stopping = EarlyStopping(patience=5)
        
        history = {
            "train_loss": [],
            "val_loss": [],
            "train_acc": [],
            "val_acc": [],
            "lr": []
        }
        
        best_val_acc = 0.0
        
        # 6. Training Loop
        print("\nStarting model training loop...")
        for epoch in range(1, args.epochs + 1):
            start_time = time.time()
            
            # Unfreeze backbone at epoch 6 if we're not in quick-test mode
            if not args.quick_test and epoch == 6:
                set_backbone_freeze(model, freeze=False)
                # Re-setup optimizer to include newly unfrozen parameters
                optimizer = torch.optim.AdamW(model.parameters(), lr=scheduler.get_last_lr()[0])
                scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs - 5)
                
            # --- Training Stage ---
            model.train()
            running_loss = 0.0
            correct_train = 0
            total_train = 0
            
            for idx, (images, labels) in enumerate(train_loader, 1):
                images, labels = images.to(device), labels.to(device)
                
                optimizer.zero_grad()
                outputs = model(images)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()
                
                running_loss += loss.item() * images.size(0)
                _, predicted = torch.max(outputs, 1)
                total_train += labels.size(0)
                correct_train += (predicted == labels).sum().item()
                
                if idx % 10 == 0 or idx == len(train_loader):
                    print(f"Epoch {epoch}/{args.epochs} | Batch {idx}/{len(train_loader)} | Loss: {loss.item():.4f}")
                    
            epoch_train_loss = running_loss / len(train_loader.dataset)
            epoch_train_acc = correct_train / total_train
            
            # --- Validation Stage ---
            model.eval()
            running_val_loss = 0.0
            correct_val = 0
            total_val = 0
            
            with torch.no_grad():
                for images, labels in valid_loader:
                    images, labels = images.to(device), labels.to(device)
                    outputs = model(images)
                    loss = criterion(outputs, labels)
                    
                    running_val_loss += loss.item() * images.size(0)
                    _, predicted = torch.max(outputs, 1)
                    total_val += labels.size(0)
                    correct_val += (predicted == labels).sum().item()
                    
            epoch_val_loss = running_val_loss / len(valid_loader.dataset)
            epoch_val_acc = correct_val / total_val
            
            current_lr = optimizer.param_groups[0]['lr']
            epoch_time = time.time() - start_time
            
            scheduler.step()
            
            # Record
            history["train_loss"].append(epoch_train_loss)
            history["val_loss"].append(epoch_val_loss)
            history["train_acc"].append(epoch_train_acc)
            history["val_acc"].append(epoch_val_acc)
            history["lr"].append(current_lr)
            
            print(f"\n--- Epoch {epoch}/{args.epochs} Summary ---")
            print(f"Train Loss: {epoch_train_loss:.4f} | Train Acc: {epoch_train_acc * 100:.2f}%")
            print(f"Val Loss:   {epoch_val_loss:.4f} | Val Acc:   {epoch_val_acc * 100:.2f}%")
            print(f"Time:       {epoch_time:.1f}s | LR: {current_lr:.6f}")
            print("-" * 35)
            
            # Save checkpoints
            if epoch_val_acc > best_val_acc:
                best_val_acc = epoch_val_acc
                torch.save(model.state_dict(), "best_model.pth")
                print("Saved new best model checkpoint (best_model.pth)")
                
            torch.save(model.state_dict(), "last_model.pth")
            
            # Early Stopping
            early_stopping(epoch_val_loss)
            if early_stopping.early_stop:
                print("Early stopping triggered. Ending training.")
                break
                
        # 7. Save outputs
        with open("class_names.json", "w") as f:
            json.dump(class_names, f, indent=4)
        print("Exported class labels to class_names.json.")
        
        # Save training history formatted for charts
        chart_history = []
        for i in range(len(history["train_loss"])):
            chart_history.append({
                "epoch": i + 1,
                "accuracy": round(history["train_acc"][i] * 100, 2),
                "val_accuracy": round(history["val_acc"][i] * 100, 2),
                "loss": round(history["train_loss"][i], 4),
                "val_loss": round(history["val_loss"][i], 4)
            })
            
        with open("trainingHistory.json", "w") as f:
            json.dump(chart_history, f, indent=4)
        print("Exported training metrics history to trainingHistory.json.")
        
        print("\nTraining pipeline executed successfully!")
        
    except Exception as e:
        print(f"\nError during training pipeline: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
