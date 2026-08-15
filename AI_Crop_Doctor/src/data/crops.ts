/**
 * Crop + disease knowledge base.
 *
 * This is the single source of agricultural truth for the prototype. New crops
 * (potato, rice, corn, chilli, cotton...) are added here as data only — no UI
 * changes required. When the FastAPI backend exposes /crops and /diseases,
 * these objects become the response shape of that endpoint.
 */

export type StageKey = "sowing" | "vegetative" | "flowering" | "fruiting" | "harvest";

export interface CropStage {
  key: StageKey;
  label: string;
  /** Days after sowing when this stage begins. */
  startDay: number;
  /** Days after sowing when this stage ends. */
  endDay: number;
  /** Token name used for the timeline colour. */
  tone: "stage-1" | "stage-2" | "stage-3" | "stage-4" | "stage-5";
  farmerNote: string;
}

export interface DiseaseInfo {
  id: string;
  cropId: string;
  /** Label exactly as the MobileViT classifier returns it. */
  modelLabel: string;
  name: string;
  what: string;
  symptoms: string[];
  cause: string;
  actionNow: string[];
  prevention: string[];
  treatment: string[];
  severitySupported: boolean;
}

export interface Crop {
  id: string;
  name: string;
  emoji: string;
  available: boolean;
  growingDurationDays: number;
  plantingMonths: number[];
  harvestNote: string;
  stages: CropStage[];
  care: string[];
  commonDiseaseIds: string[];
}

export const CROPS: Crop[] = [
  {
    id: "tomato",
    name: "Tomato",
    emoji: "🍅",
    available: true,
    growingDurationDays: 72,
    plantingMonths: [6, 7, 8, 11, 12],
    harvestNote: "Fruits ripen over 3–4 pickings, roughly 10–15 days apart.",
    stages: [
      {
        key: "sowing",
        label: "Sowing",
        startDay: 0,
        endDay: 0,
        tone: "stage-1",
        farmerNote: "Sow in a nursery bed or tray and keep the soil moist.",
      },
      {
        key: "vegetative",
        label: "Growth",
        startDay: 1,
        endDay: 20,
        tone: "stage-2",
        farmerNote: "Leaves and stems develop. Water every 2–3 days and remove weeds.",
      },
      {
        key: "flowering",
        label: "Flowering",
        startDay: 21,
        endDay: 36,
        tone: "stage-3",
        farmerNote: "Yellow flowers appear. Avoid water stress and stake the plants.",
      },
      {
        key: "fruiting",
        label: "Fruiting",
        startDay: 37,
        endDay: 56,
        tone: "stage-4",
        farmerNote: "Green fruits set and grow. Watch lower leaves for spots.",
      },
      {
        key: "harvest",
        label: "Harvest",
        startDay: 57,
        endDay: 72,
        tone: "stage-5",
        farmerNote: "Pick fruits when they turn light red. Harvest in the cool morning.",
      },
    ],
    care: [
      "Water in the early morning at the base of the plant, not on the leaves.",
      "Keep 45–60 cm between plants so air can move freely.",
      "Stake or tie plants once they reach knee height.",
      "Remove and burn diseased leaves — never leave them in the field.",
    ],
    commonDiseaseIds: ["tomato-early-blight", "tomato-late-blight", "tomato-leaf-mold"],
  },
  {
    id: "potato",
    name: "Potato",
    emoji: "🥔",
    available: false,
    growingDurationDays: 95,
    plantingMonths: [10, 11],
    harvestNote: "Model support planned in a future update.",
    stages: [],
    care: [],
    commonDiseaseIds: [],
  },
  {
    id: "rice",
    name: "Rice",
    emoji: "🌾",
    available: false,
    growingDurationDays: 120,
    plantingMonths: [6, 7],
    harvestNote: "Model support planned in a future update.",
    stages: [],
    care: [],
    commonDiseaseIds: [],
  },
  {
    id: "corn",
    name: "Corn",
    emoji: "🌽",
    available: false,
    growingDurationDays: 100,
    plantingMonths: [6, 7, 1],
    harvestNote: "Model support planned in a future update.",
    stages: [],
    care: [],
    commonDiseaseIds: [],
  },
  {
    id: "chilli",
    name: "Chilli",
    emoji: "🌶️",
    available: false,
    growingDurationDays: 110,
    plantingMonths: [6, 7, 8],
    harvestNote: "Model support planned in a future update.",
    stages: [],
    care: [],
    commonDiseaseIds: [],
  },
  {
    id: "cotton",
    name: "Cotton",
    emoji: "🧵",
    available: false,
    growingDurationDays: 160,
    plantingMonths: [5, 6],
    harvestNote: "Model support planned in a future update.",
    stages: [],
    care: [],
    commonDiseaseIds: [],
  },
];

export const DISEASES: DiseaseInfo[] = [
  {
    id: "tomato-early-blight",
    cropId: "tomato",
    modelLabel: "Tomato___Early_blight",
    name: "Tomato Early Blight",
    what: "A common fungal leaf disease of tomato. It usually starts on the older leaves near the soil and slowly moves upward. If it is not controlled, the plant loses leaves and the fruits stay small.",
    symptoms: [
      "Brown or black spots with rings inside, like a target.",
      "A yellow border around each spot.",
      "Lower leaves dry up and fall off first.",
      "Dark sunken patches near the fruit stalk in bad cases.",
    ],
    cause:
      "The fungus Alternaria solani. It spreads fast in warm, humid weather, after heavy rain, and when leaves stay wet or touch the soil.",
    actionNow: [
      "Remove the badly spotted lower leaves and burn or bury them away from the field.",
      "Stop watering over the top of the plants — water only at the base.",
      "Do not work in the field when the leaves are wet, it spreads the spores.",
      "Check the rest of your plants today and mark the affected rows.",
    ],
    prevention: [
      "Keep enough space between plants so leaves dry quickly.",
      "Mulch the soil with straw so rain does not splash soil onto leaves.",
      "Rotate the field — do not plant tomato, potato or brinjal in the same spot next season.",
      "Use healthy, treated seed or certified seedlings.",
    ],
    treatment: [
      "Spray a copper-based fungicide or mancozeb as written on the label, covering both sides of the leaves.",
      "Repeat after 7–10 days if new spots keep appearing.",
      "Spray in the early morning or late evening, never in strong sun.",
      "Always follow the dose on the packet and the waiting period before harvest. Ask your local agriculture officer if you are unsure.",
    ],
    severitySupported: false,
  },
  {
    id: "tomato-late-blight",
    cropId: "tomato",
    modelLabel: "Tomato___Late_blight",
    name: "Tomato Late Blight",
    what: "A fast-moving disease that can destroy a tomato field in a few days during cool and wet weather.",
    symptoms: [
      "Large greasy grey-green patches on leaves.",
      "White fuzzy growth under the leaf in the morning.",
      "Stems turn dark brown and collapse.",
      "Hard brown patches on green fruits.",
    ],
    cause: "The pathogen Phytophthora infestans, favoured by cool nights and long leaf wetness.",
    actionNow: [
      "Remove infected plants completely — do not just pick the leaves.",
      "Avoid overhead irrigation until the weather dries.",
      "Inform nearby farmers, it spreads through the air.",
    ],
    prevention: [
      "Plant resistant varieties where available.",
      "Avoid dense planting and low-lying waterlogged plots.",
      "Destroy leftover plant material after harvest.",
    ],
    treatment: [
      "Use a recommended protectant fungicide early, before the disease spreads.",
      "Follow the label dose and repeat interval strictly.",
      "Consult your agriculture extension officer for the locally approved product.",
    ],
    severitySupported: false,
  },
  {
    id: "tomato-leaf-mold",
    cropId: "tomato",
    modelLabel: "Tomato___Leaf_Mold",
    name: "Tomato Leaf Mold",
    what: "A leaf disease seen mostly in humid conditions and in polyhouses, where air movement is poor.",
    symptoms: [
      "Pale yellow patches on the upper side of the leaf.",
      "Olive-green velvety mould on the lower side.",
      "Leaves curl, dry and drop.",
    ],
    cause: "The fungus Passalora fulva, encouraged by high humidity and poor ventilation.",
    actionNow: [
      "Improve air movement — open the polyhouse sides or thin out crowded leaves.",
      "Reduce humidity by watering earlier in the day.",
    ],
    prevention: [
      "Keep wider spacing and prune lower leaves.",
      "Avoid wetting leaves during irrigation.",
      "Clean tools and remove crop debris.",
    ],
    treatment: [
      "Apply an approved fungicide when patches first appear.",
      "Remove severely affected leaves before spraying.",
    ],
    severitySupported: false,
  },
  {
    id: "tomato-healthy",
    cropId: "tomato",
    modelLabel: "Tomato___healthy",
    name: "Healthy Tomato Leaf",
    what: "No disease pattern was detected in this leaf. The plant looks healthy.",
    symptoms: ["Even green colour", "No spots, mould or curling"],
    cause: "—",
    actionNow: [
      "Continue your normal watering routine.",
      "Keep checking the lower leaves once a week.",
    ],
    prevention: ["Maintain spacing and mulching.", "Avoid wetting the leaves while irrigating."],
    treatment: ["No treatment needed right now."],
    severitySupported: false,
  },
];

export function getCrop(cropId: string): Crop | undefined {
  return CROPS.find((c) => c.id === cropId);
}

export function getCropByName(name: string): Crop | undefined {
  return CROPS.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

export function getDiseaseByName(cropName: string, diseaseName: string): DiseaseInfo | undefined {
  const crop = getCropByName(cropName);
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
  return DISEASES.find(
    (d) =>
      (!crop || d.cropId === crop.id) &&
      (normalize(d.name).includes(normalize(diseaseName)) ||
        normalize(d.name) === normalize(`${cropName} ${diseaseName}`) ||
        normalize(d.modelLabel).includes(normalize(diseaseName))),
  );
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
