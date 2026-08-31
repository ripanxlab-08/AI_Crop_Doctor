"""
End-to-End Diagnosis Pipeline
--------------------------------
Wires together every stage from the project spec into one callable
function, matching the "Final System Flow" diagram:

    Image -> Image Verification -> [reject if invalid]
          -> Disease Classification -> Severity Estimation
          -> Treatment Recommendation -> result dict

The disease classifier is MOCKED here (classify_disease_MOCK) because
MobileViT hasn't been trained yet - see train_mobilevit.py. Once a real
checkpoint exists, replace classify_disease_MOCK with real inference
(load the .pt checkpoint, run forward pass, softmax, argmax) and the
rest of this pipeline needs no changes - that's the point of building
it this way now: the integration seam is already in the right place.
"""

from image_verification import verify_image, check_context_match
from severity_estimation import estimate_severity
from treatment_recommendations import get_recommendation


def classify_disease_MOCK(image_path: str) -> tuple[str, float]:
    """Placeholder for the trained MobileViT model's forward pass.
    Returns (predicted_class, confidence). Replace with:

        model = load_checkpoint(...)
        logits = model(preprocess(image))
        probs = softmax(logits)
        idx = argmax(probs)
        return class_names[idx], probs[idx]

    For now, returns a fixed label so the rest of the pipeline can be
    exercised end-to-end before training completes.
    """
    return "Tomato___Early_blight", 0.91


def run_diagnosis(image_path: str, expected_crop: str | None = None) -> dict:
    # ---- Stage 1: Image Verification ----
    verification = verify_image(image_path)
    if not verification["is_valid"]:
        return {
            "stage_reached": "image_verification",
            "is_valid_leaf": False,
            "rejection_reason": verification["rejection_reason"],
        }

    # ---- Stage 2: Disease Classification ----
    predicted_class, confidence = classify_disease_MOCK(image_path)

    # ---- Stage 2b: Context Match (only meaningful once real model exists) ----
    context = check_context_match(predicted_class.split("___")[0], expected_crop)

    # ---- Stage 3: Severity Estimation ----
    severity = estimate_severity(image_path)

    # ---- Stage 4: Treatment Recommendation ----
    treatment = get_recommendation(predicted_class, severity["stage"])

    return {
        "stage_reached": "complete",
        "is_valid_leaf": True,
        "predicted_disease": predicted_class,
        "confidence": confidence,
        "severity_stage": severity["stage"],
        "severity_label": severity["label"],
        "severity_percent": severity["severity_percent"],
        "context_match": context,
        "treatment": treatment["recommendation"],
        "prevention": treatment["prevention"],
        "recommendation_matched_kb": treatment["matched"],
    }


if __name__ == "__main__":
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python pipeline.py <image_path> [expected_crop]")
        sys.exit(1)

    image_path = sys.argv[1]
    expected_crop = sys.argv[2] if len(sys.argv) > 2 else None

    result = run_diagnosis(image_path, expected_crop)
    print(json.dumps(result, indent=2))
