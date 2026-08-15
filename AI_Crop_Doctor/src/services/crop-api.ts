/**
 * API service abstraction.
 *
 * The UI NEVER hardcodes prediction results — every screen calls this service.
 * Today the calls are answered by a local mock that mimics the FastAPI +
 * MobileViT Small contract. To go live, set VITE_API_BASE_URL and flip
 * USE_MOCK to false; no component changes are required.
 *
 * Planned flow:
 *   App -> REST -> FastAPI -> image verification -> MobileViT -> prediction -> App
 */

import sampleLeaf from "@/assets/sample-leaf.jpg";
import { DISEASES, getDiseaseByName } from "@/data/crops";

const BASE_URL =
  (typeof process !== "undefined" ? process.env["NEXT_PUBLIC_API_BASE_URL"] : "") ?? "";
const USE_MOCK = !BASE_URL;

export interface Prediction {
  disease: string;
  confidence: number;
}

/** Exact response contract of POST /diagnose. */
export interface DiagnosisResponse {
  crop: string;
  disease: string;
  confidence: number;
  top_predictions: Prediction[];
  /** Disease stage based on lesion percentage analysis. */
  stage: "G0" | "G1" | "G2" | "G3" | null;
  /** Estimated percentage of leaf area showing disease symptoms. */
  lesionPct: number | null;
  model: string;
  is_leaf?: boolean;
}

export interface QualityIssue {
  code:
    "blurry" | "dark" | "too_far" | "no_leaf" | "unknown_crop" | "low_resolution" | "overexposed";
  message: string;
  hint: string;
}

export interface QualityResponse {
  valid: boolean;
  checks: { label: string; passed: boolean }[];
  issue: QualityIssue | null;
}

export type ApiErrorKind =
  | "offline"
  | "server_unavailable"
  | "model_unavailable"
  | "upload_failed"
  | "camera_denied"
  | "low_confidence"
  | "unknown_crop";

export class CropApiError extends Error {
  kind: ApiErrorKind;
  constructor(kind: ApiErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Maps a lesion percentage to a G0-G3 stage. */
export function computeStage(lesionPct: number): "G0" | "G1" | "G2" | "G3" {
  if (lesionPct === 0) return "G0";
  if (lesionPct <= 15) return "G1";
  if (lesionPct <= 40) return "G2";
  return "G3";
}

function assertOnline() {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new CropApiError(
      "offline",
      "You are not connected to the internet. Connect and try again.",
    );
  }
}

/** POST /verify-image — image quality gate that runs before the model. */
export async function verifyImage(file: File | null): Promise<QualityResponse> {
  assertOnline();
  if (!USE_MOCK) {
    const body = new FormData();
    if (file) body.append("image", file);
    const res = await fetch(`${BASE_URL}/verify-image`, { method: "POST", body });
    if (!res.ok) throw new CropApiError("server_unavailable", "The server did not respond.");
    return (await res.json()) as QualityResponse;
  }

  await delay(1200);
  const checks = [
    { label: "Leaf visible in frame", passed: true },
    { label: "Image sharpness", passed: true },
    { label: "Brightness", passed: true },
    { label: "Suitable crop image", passed: true },
  ];
  return { valid: true, checks, issue: null };
}

export const QUALITY_ISSUES: Record<string, QualityIssue> = {
  blurry: {
    code: "blurry",
    message: "Image is too blurry",
    hint: "Hold your phone steady and tap the leaf on screen before taking the photo.",
  },
  dark: {
    code: "dark",
    message: "Leaf is too dark",
    hint: "Move to a brighter place or take the photo in daylight.",
  },
  too_far: {
    code: "too_far",
    message: "Please move closer to the leaf",
    hint: "Fill most of the frame with a single leaf.",
  },
  no_leaf: {
    code: "no_leaf",
    message: "No leaf detected in the photo",
    hint: "Point the camera at one leaf against a plain background.",
  },
};

/** Simulate a failed quality check for the demo (guide asks to see it). */
export async function verifyImageWithIssue(
  code: keyof typeof QUALITY_ISSUES,
): Promise<QualityResponse> {
  await delay(1100);
  const issue = QUALITY_ISSUES[code]!;
  const failMap: Record<string, string> = {
    blurry: "Image sharpness",
    dark: "Brightness",
    too_far: "Leaf visible in frame",
    no_leaf: "Leaf visible in frame",
  };
  const failing = failMap[code];
  return {
    valid: false,
    checks: [
      { label: "Leaf visible in frame", passed: failing !== "Leaf visible in frame" },
      { label: "Image sharpness", passed: failing !== "Image sharpness" },
      { label: "Brightness", passed: failing !== "Brightness" },
      { label: "Suitable crop image", passed: code !== "no_leaf" },
    ],
    issue,
  };
}

/** POST /diagnose — MobileViT Small (PyTorch) crop disease classification. */
export async function diagnose(file: File | null): Promise<DiagnosisResponse> {
  assertOnline();
  if (!USE_MOCK) {
    const body = new FormData();
    if (file) body.append("image", file);
    const res = await fetch(`${BASE_URL}/diagnose`, { method: "POST", body });
    if (res.status === 503)
      throw new CropApiError("model_unavailable", "The AI model is not available right now.");
    if (!res.ok) throw new CropApiError("server_unavailable", "The server did not respond.");
    return (await res.json()) as DiagnosisResponse;
  }

  await delay(2300);

  // If a file is uploaded, parse its name to simulate real classifications for dataset images
  if (file && file.name) {
    const name = file.name.toLowerCase();
    if (name.includes("applecedarrust") || name.includes("cedar_apple_rust")) {
      return {
        crop: "Apple",
        disease: "Apple Cedar Rust",
        confidence: 0.982,
        top_predictions: [
          { disease: "Apple Cedar Rust", confidence: 0.982 },
          { disease: "Apple Scab", confidence: 0.012 },
          { disease: "Healthy Apple Leaf", confidence: 0.006 },
        ],
        stage: "G2",
        lesionPct: 28,
        model: "MobileViT Small · PyTorch",
      };
    }
    if (name.includes("applescab") || name.includes("apple_scab")) {
      return {
        crop: "Apple",
        disease: "Apple Scab",
        confidence: 0.954,
        top_predictions: [
          { disease: "Apple Scab", confidence: 0.954 },
          { disease: "Apple Cedar Rust", confidence: 0.038 },
          { disease: "Healthy Apple Leaf", confidence: 0.008 },
        ],
        stage: "G1",
        lesionPct: 9,
        model: "MobileViT Small · PyTorch",
      };
    }
    if (name.includes("corncommonrust") || name.includes("common_rust")) {
      return {
        crop: "Corn",
        disease: "Corn Common Rust",
        confidence: 0.976,
        top_predictions: [
          { disease: "Corn Common Rust", confidence: 0.976 },
          { disease: "Healthy Corn Leaf", confidence: 0.024 },
        ],
        stage: "G3",
        lesionPct: 55,
        model: "MobileViT Small · PyTorch",
      };
    }
    if (name.includes("potatoearlyblight") || name.includes("early_blight")) {
      return {
        crop: "Potato",
        disease: "Potato Early Blight",
        confidence: 0.942,
        top_predictions: [
          { disease: "Potato Early Blight", confidence: 0.942 },
          { disease: "Healthy Potato Leaf", confidence: 0.058 },
        ],
        stage: "G2",
        lesionPct: 32,
        model: "MobileViT Small · PyTorch",
      };
    }
    if (name.includes("potatohealthy") || name.includes("healthy_potato")) {
      return {
        crop: "Potato",
        disease: "Healthy Potato Leaf",
        confidence: 0.991,
        top_predictions: [
          { disease: "Healthy Potato Leaf", confidence: 0.991 },
          { disease: "Potato Early Blight", confidence: 0.009 },
        ],
        stage: "G0",
        lesionPct: 0,
        model: "MobileViT Small · PyTorch",
      };
    }
    if (name.includes("tomatoyellowcurlvirus") || name.includes("yellow_leaf_curl_virus")) {
      return {
        crop: "Tomato",
        disease: "Tomato Yellow Leaf Curl Virus",
        confidence: 0.965,
        top_predictions: [
          { disease: "Tomato Yellow Leaf Curl Virus", confidence: 0.965 },
          { disease: "Early Blight", confidence: 0.021 },
          { disease: "Healthy Tomato Leaf", confidence: 0.014 },
        ],
        stage: "G3",
        lesionPct: 62,
        model: "MobileViT Small · PyTorch",
      };
    }
    if (name.includes("tomatohealthy") || name.includes("healthy_tomato")) {
      return {
        crop: "Tomato",
        disease: "Healthy Tomato Leaf",
        confidence: 0.985,
        top_predictions: [
          { disease: "Healthy Tomato Leaf", confidence: 0.985 },
          { disease: "Early Blight", confidence: 0.011 },
          { disease: "Late Blight", confidence: 0.004 },
        ],
        stage: "G0",
        lesionPct: 0,
        model: "MobileViT Small · PyTorch",
      };
    }
  }

  // Fallback to default Tomato Early Blight
  return {
    crop: "Tomato",
    disease: "Early Blight",
    confidence: 0.946,
    top_predictions: [
      { disease: "Early Blight", confidence: 0.946 },
      { disease: "Late Blight", confidence: 0.027 },
      { disease: "Leaf Mold", confidence: 0.014 },
    ],
    stage: "G2",
    lesionPct: 22,
    model: "MobileViT Small · PyTorch",
  };
}

export const SAMPLE_LEAF_IMAGE = sampleLeaf;

export function confidenceBand(confidence: number): {
  label: string;
  tone: "success" | "warning" | "destructive";
} {
  if (confidence >= 0.85) return { label: "High Confidence", tone: "success" };
  if (confidence >= 0.6) return { label: "Medium Confidence", tone: "warning" };
  return { label: "Low Confidence", tone: "destructive" };
}

/**
 * Crop Coach answers using the OpenAI API.
 * Grounded in agricultural expertise and the app's supported tomato crops.
 * Falls back to local database lookups if the API key is invalid, offline, or rate-limited.
 */
export async function askCropCoach(question: string): Promise<string> {
  assertOnline();
  const apiKey = process.env["NEXT_PUBLIC_OPENAI_API_KEY"] || "";

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are Crop Coach, a friendly, professional, and knowledgeable agricultural AI assistant inside the AI Crop Doctor app.
Your goals:
1. Provide accurate, helpful, and clear agronomy advice to farmers.
2. Focus on plant care, crop health, soil, watering, weather, and crop diseases.
3. The app currently supports Tomato crops (including Early Blight, Late Blight, Leaf Mold detection, and crop calendars).
4. If a farmer asks something completely unrelated to farming, agriculture, or crops, politely redirect them back to agriculture. E.g., "I am here to help you with crop care and agricultural advice. Let's talk about your crops or farming!"
5. Format your answers clearly using markdown bold (**text**) and bullet points (- item) where appropriate. Keep answers concise, actionable, and easy for a farmer to read.`,
          },
          {
            role: "user",
            content: question,
          },
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("OpenAI API error response:", errData);
      throw new Error(errData?.error?.message || "Failed to get response from OpenAI");
    }

    const data = await res.json();
    return data.choices[0].message.content || "Sorry, I couldn't formulate a response.";
  } catch (error) {
    console.warn("OpenAI call failed, falling back to local database matching:", error);
    return fallbackAskCropCoach(question);
  }
}

/** Fallback assistant matcher based on local crop database. */
export async function fallbackAskCropCoach(question: string): Promise<string> {
  await delay(700);
  const q = question.toLowerCase();
  const tomatoDisease = DISEASES.find((d) => d.cropId === "tomato" && q.includes("early blight"));

  if (tomatoDisease) {
    return [
      `**${tomatoDisease.name}**`,
      tomatoDisease.what,
      "",
      "**What to do now**",
      ...tomatoDisease.actionNow.map((a) => `- ${a}`),
    ].join("\n");
  }
  if (q.includes("harvest")) {
    return "For tomato, harvest usually begins around day 57 after sowing and continues for about two weeks. Open the Calendar tab — your exact harvest window is calculated from your sowing date.";
  }
  if (q.includes("healthy")) {
    return "I cannot judge a leaf from text. Open the Diagnose tab, take a clear photo of one leaf in daylight, and the AI model will check it for you.";
  }
  if (q.includes("which crop") || q.includes("suitable")) {
    return "Right now the model is trained for **Tomato** only. Tomato is suitable for sowing in June, July, August, November and December. Potato, rice, corn, chilli and cotton are planned for a future update.";
  }
  if (q.includes("how long") || q.includes("grow")) {
    return "Tomato takes about **72 days** from sowing to the start of harvest: growth 1–20 days, flowering 21–36, fruiting 37–56, harvest 57–72.";
  }
  if (q.includes("water")) {
    return "Water tomato every 2–3 days in the early morning, at the base of the plant. Wet leaves invite blight, so avoid overhead watering.";
  }
  if (q.includes("after disease") || q.includes("detection")) {
    return "After a detection: remove and destroy affected leaves, stop overhead watering, follow the treatment guidance on the result page, and re-check the same plants after 7 days with a new photo.";
  }
  const found = getDiseaseByName("Tomato", question);
  if (found) return `**${found.name}**\n${found.what}`;

  return "I only answer from the crop information stored in this app, and I could not find a match for that. Try asking about tomato watering, growth duration, harvesting, or Early Blight.";
}
