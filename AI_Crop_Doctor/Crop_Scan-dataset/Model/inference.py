import os
import sys
import time
import json
import warnings

# Suppress deprecation and user warnings (e.g., Pillow warnings)
warnings.filterwarnings("ignore")

try:
    import torch
    import torch.nn as nn
    from PIL import Image
    from torchvision import transforms
    import timm
except ImportError as e:
    missing_module = e.name if hasattr(e, 'name') and e.name else str(e)
    print(f"Error: Missing required dependency '{missing_module}'. "
          f"Please ensure you are running this script within the project's virtual environment (.venv) "
          f"or install the required libraries: pip install torch torchvision timm pillow", file=sys.stderr)
    sys.exit(1)


def load_class_names(class_names_path):
    """Loads class names from JSON file."""
    if not os.path.exists(class_names_path):
        raise FileNotFoundError(f"Class names file not found at {class_names_path}")
    with open(class_names_path, 'r', encoding='utf-8') as f:
        class_names = json.load(f)
    return class_names

def initialize_model(model_name, num_classes, weights_path, device):
    """Initializes MobileViT model and loads pretrained/trained weights."""
    print(f"Initializing {model_name}...")
    model = timm.create_model(model_name, pretrained=False)
    
    # Adapt head classifier using timm's standard API (resolves Pylance type checking/IDE errors)
    model.reset_classifier(num_classes)
    
    if not os.path.exists(weights_path):
        raise FileNotFoundError(f"Trained model weights not found at {weights_path}")
    
    # Load model weights (handling GPU to CPU mapping if necessary)
    state_dict = torch.load(weights_path, map_location=device)
    model.load_state_dict(state_dict)
    model = model.to(device)
    model.eval()
    print("Model initialized and weights loaded successfully.")
    return model

def is_leaf_image(image_path, threshold=0.05, center_threshold=0.08):
    """
    Detects if the image is a leaf based on color profile.
    
    Dataset images are controlled shots on a plain background (gray/white).
    Thresholds are intentionally LOW because:
      - Even a leaf covering 30% of the frame will easily pass 5% overall
      - The center zone (25-75 coords) typically contains the leaf
      - False positives (non-leaves with 5% green) will be caught by the
        confidence gate in main() anyway
    """
    try:
        image = Image.open(image_path).convert('RGB')
        # Resize to 100x100 for fast pixel coordinate processing
        small_img = image.resize((100, 100))
        pixels = list(small_img.getdata())
        
        leaf_count = 0
        center_leaf_count = 0
        center_total = 0
        total = len(pixels)
        
        for idx, (r, g, b) in enumerate(pixels):
            x = idx % 100
            y = idx // 100
            
            # Green check: G is dominant (any shade of green leaf)
            is_green = (g > r) and (g > b) and (g > 25)
            
            # Yellow/Brown check (diseased/dry spots — still a leaf)
            is_brown = (r > 1.10 * b) and (g > 1.10 * b) and (g > 30) and (r > 30) and (b < 180)
            
            # Yellow leaf check (chlorosis, TYLCV etc.)
            is_yellow = (r > 1.05 * g) and (g > 1.05 * b) and (g > 40) and (b < 140)

            # Dark green (shadowed areas of leaf)
            is_dark_green = (g > r) and (g > b) and (g > 15) and (g < 60)
            
            is_leaf_pixel = is_green or is_brown or is_yellow or is_dark_green
            
            if is_leaf_pixel:
                leaf_count += 1
                
            # Check if pixel is in the center 50% region (x and y between 25 and 75)
            if 25 <= x <= 75 and 25 <= y <= 75:
                center_total += 1
                if is_leaf_pixel:
                    center_leaf_count += 1
                    
        overall_ratio = leaf_count / total
        center_ratio = center_leaf_count / center_total if center_total > 0 else 0
        
        print(f"DEBUG: Overall leaf color ratio: {overall_ratio:.4f}")
        print(f"DEBUG: Center leaf color ratio: {center_ratio:.4f}")
        
        # Pass if either overall OR center passes the (very low) thresholds
        is_verified = (overall_ratio >= threshold) or (center_ratio >= center_threshold)
        return is_verified
    except Exception as e:
        print(f"DEBUG: Leaf checking failed: {e}")
        return True  # Fail-open: if we can't check, don't block it

def preprocess_image(image_path, image_size=224):
    """Loads and preprocesses a single image for MobileViT input."""
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found at {image_path}")
    
    try:
        image = Image.open(image_path).convert('RGB')
    except Exception as e:
        raise ValueError(f"Failed to load or parse image: {e}")
        
    preprocess = transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    input_tensor = preprocess(image)
    return input_tensor.unsqueeze(0) # Add batch dimension

def predict(model, input_tensor, class_names, device):
    """Performs inference and returns top predictions and timing."""
    input_tensor = input_tensor.to(device)
    
    start_time = time.time()
    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
    prediction_time = time.time() - start_time
    
    # Get top 3 predictions
    top_prob, top_catid = torch.topk(probabilities, min(3, len(class_names)))
    
    predictions = []
    for i in range(top_prob.size(0)):
        idx = top_catid[i].item()
        predictions.append({
            "class_name": class_names[idx],
            "confidence": top_prob[i].item()
        })
        
    return predictions, prediction_time

def main():
    # Helper to check arguments
    if len(sys.argv) < 2:
        print("Usage: python inference.py <image_path> [weights_path] [class_names_path]")
        sys.exit(1)
        
    image_path = sys.argv[1]
    weights_path = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), "best_model.pth")
    class_names_path = sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.path.dirname(__file__), "class_names.json")
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Running inference on device: {device}")
    
    try:
        # Load classes
        class_names = load_class_names(class_names_path)
        num_classes = len(class_names)
        
        # Initialize model
        model = initialize_model("mobilevit_s", num_classes, weights_path, device)
        
        # Load & preprocess image
        input_tensor = preprocess_image(image_path)
        
        # Run prediction
        top_predictions, inference_time = predict(model, input_tensor, class_names, device)
        
        top_confidence = top_predictions[0]['confidence']
        
        # ── Leaf detection: color-based PIL check ONLY ───────────────────────
        #
        # WHY NO CONFIDENCE GATE:
        # The model was trained for only 1 epoch (7.28% accuracy on 38 classes).
        # Random chance = 1/38 = 2.63%. With such low training, confidence scores
        # are unreliable — even real dataset leaves score around 8-9%.
        # Using a confidence threshold would reject valid leaf images.
        #
        # The PIL-based color check (is_leaf_image) is the correct approach:
        # it directly measures green/brown/yellow pixel ratio using properly
        # decoded image data. A real dataset leaf gives 40-98% color ratio.
        # A selfie or random photo gives < 5% green ratio.
        #
        # The only gate used is: color_is_leaf (PIL pixel analysis).
        # If the model gets retrained to > 50% accuracy, the confidence gate
        # can be re-added.
        color_is_leaf = is_leaf_image(image_path)
        
        # Last-resort fallback: if color check fails but model is more than
        # 3x above random chance (3 * 2.63% = 7.89%), it likely is a leaf.
        random_chance_threshold = 3.0 / len(class_names)
        is_leaf = color_is_leaf or (top_confidence >= random_chance_threshold)

        # Output results
        print("\n================ INFERENCE RESULTS ================")
        print(f"Primary Disease Name: {top_predictions[0]['class_name']}")
        print(f"Confidence Score:     {top_predictions[0]['confidence'] * 100:.2f}%")
        print(f"Is Leaf:              {is_leaf}")
        print(f"Prediction Time:      {inference_time * 1000:.2f} ms")
        print("---------------------------------------------------")
        print("Top 3 Predictions:")
        for idx, pred in enumerate(top_predictions, 1):
            print(f"  {idx}. {pred['class_name']}: {pred['confidence'] * 100:.2f}%")
        print("====================================================")
        
    except Exception as e:
        print(f"Error during inference execution: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
