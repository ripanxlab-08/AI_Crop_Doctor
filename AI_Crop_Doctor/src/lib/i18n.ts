/**
 * Minimal translation layer.
 * All UI copy goes through `t("key")` so Hindi / Tamil / Telugu / Malayalam /
 * Kannada dictionaries can be added later without touching components.
 */

export const LANGUAGES = [
  { code: "en", label: "English", native: "English", available: true },
  { code: "hi", label: "Hindi", native: "हिन्दी", available: false },
  { code: "ta", label: "Tamil", native: "தமிழ்", available: false },
  { code: "te", label: "Telugu", native: "తెలుగు", available: false },
  { code: "ml", label: "Malayalam", native: "മലയാളം", available: false },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", available: false },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

const en = {
  "app.name": "AI Crop Doctor",
  "app.tagline": "Smart Crop Care with AI",

  "nav.home": "Home",
  "nav.diagnose": "Diagnose",
  "nav.calendar": "Calendar",
  "nav.assistant": "Assistant",
  "nav.profile": "Profile",

  "onboarding.skip": "Skip",
  "onboarding.next": "Next",
  "onboarding.start": "Get Started",

  "home.greeting.morning": "Good Morning, Farmer",
  "home.greeting.afternoon": "Good Afternoon, Farmer",
  "home.greeting.evening": "Good Evening, Farmer",
  "home.question": "How can I help your crop today?",
  "home.diagnosis.title": "AI Crop Diagnosis",
  "home.diagnosis.sub": "Check a leaf for disease in a few seconds",
  "home.capture": "Capture Leaf",
  "home.upload": "Upload Image",
  "home.yourCrops": "Your Crops",
  "home.upcoming": "Upcoming",
  "home.assistant": "AI Assistant",
  "home.assistant.sub": "Ask me anything about your crops",
  "home.assistant.cta": "Talk to AI Assistant",

  "diagnose.title": "Diagnose Your Crop",
  "diagnose.instruction": "Capture a clear photo of the leaf",
  "diagnose.camera": "Camera",
  "diagnose.gallery": "Gallery",
  "diagnose.upload": "Upload Image",
  "diagnose.retake": "Choose another image",
  "diagnose.start": "Start Diagnosis",
  "diagnose.checkingQuality": "Checking image quality...",
  "diagnose.scanning": "Scanning leaf...",
  "diagnose.running": "Running AI diagnosis...",
  "diagnose.preparing": "Preparing your crop guidance...",
  "diagnose.imageGood": "Image looks good",
  "diagnose.imageBad": "Please capture another image",

  "result.title": "Diagnosis Result",
  "result.confidence": "Confidence",
  "result.top": "Top Predictions",
  "result.listen": "Listen to this",
  "result.what": "What is it?",
  "result.symptoms": "Symptoms",
  "result.cause": "Possible Cause",
  "result.now": "What to do now",
  "result.prevention": "Prevention",
  "result.treatment": "Treatment Guidance",
  "result.severity": "Estimated Disease Severity",
  "result.severityPending": "Severity estimation will be available in a future update.",

  "assistant.name": "Crop Coach",
  "assistant.welcome":
    "Hi! I'm your Crop Coach. Ask me about your crop, disease, watering, planting or harvesting.",
  "assistant.placeholder": "Ask about your crop...",

  "calendar.title": "Crop Calendar",
  "calendar.reminders": "Reminders",
  "calendar.addReminder": "Add Reminder",

  "history.title": "Diagnosis History",
  "profile.title": "Profile",
  "crops.title": "Crop Database",
} as const;

export type TranslationKey = keyof typeof en;

const dictionaries: Record<string, Partial<Record<TranslationKey, string>>> = { en };

export function translate(key: TranslationKey, lang: LanguageCode = "en"): string {
  return dictionaries[lang]?.[key] ?? en[key] ?? key;
}

/** Component-facing helper; swap for a context-aware hook when locales land. */
export function useT(lang: LanguageCode = "en") {
  return (key: TranslationKey) => translate(key, lang);
}
