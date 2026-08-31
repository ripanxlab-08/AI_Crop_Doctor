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

export type DiseaseStage = "G0" | "G1" | "G2" | "G3";

export interface StageTreatment {
  stage: DiseaseStage;
  /** Human-readable stage label. */
  label: string;
  /** Lesion percentage threshold: stage applies when lesionPct <= this value (G3 = no upper bound). */
  lesionPctMax: number;
  /** Tailwind-compatible semantic color name used for badges / borders. */
  color: "success" | "warning" | "orange" | "destructive";
  /** Icon emoji shown on the stage card. */
  emoji: string;
  /** Stage-specific recommendations for this disease at this severity. */
  recommendations: string[];
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
  /** G0-G3 stage-based treatment recommendations. */
  stageTreatments: StageTreatment[];
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
    commonDiseaseIds: [
      "tomato-early-blight",
      "tomato-late-blight",
      "tomato-leaf-mold",
      "tomato-yellow-curl",
    ],
  },
  {
    id: "potato",
    name: "Potato",
    emoji: "🥔",
    available: true,
    growingDurationDays: 95,
    plantingMonths: [10, 11],
    harvestNote: "Harvest when foliage turns yellow and dies back, skin becomes firm.",
    stages: [
      {
        key: "sowing",
        label: "Sprouting",
        startDay: 0,
        endDay: 15,
        tone: "stage-1",
        farmerNote: "Sprouts emerge from seed tubers. Keep soil loose.",
      },
      {
        key: "vegetative",
        label: "Growth",
        startDay: 16,
        endDay: 45,
        tone: "stage-2",
        farmerNote: "Foliage and roots develop. Earth up soil around stems.",
      },
      {
        key: "flowering",
        label: "Tuber Init.",
        startDay: 46,
        endDay: 65,
        tone: "stage-3",
        farmerNote: "Flowers open as tubers begin forming below ground. Avoid dry soil.",
      },
      {
        key: "fruiting",
        label: "Tuber Bulking",
        startDay: 66,
        endDay: 85,
        tone: "stage-4",
        farmerNote: "Tubers swell rapidly. Monitor lower leaves for blight target-spots.",
      },
      {
        key: "harvest",
        label: "Harvest",
        startDay: 86,
        endDay: 95,
        tone: "stage-5",
        farmerNote: "Foliage turns yellow. Stop watering 10 days before picking.",
      },
    ],
    care: [
      "Keep soil piled high around the plant stems to prevent green tubers.",
      "Water deeply once a week, avoiding overhead spraying if possible.",
      "Rotate crops annually with legumes or grains.",
      "Harvest on a dry day and cure tubers in the shade.",
    ],
    commonDiseaseIds: ["potato-early-blight", "potato-healthy"],
  },
  {
    id: "apple",
    name: "Apple",
    emoji: "🍎",
    available: true,
    growingDurationDays: 150,
    plantingMonths: [1, 2, 11, 12],
    harvestNote: "Apples are harvested by hand once color and sweetness are fully developed.",
    stages: [
      {
        key: "sowing",
        label: "Bud Break",
        startDay: 0,
        endDay: 15,
        tone: "stage-1",
        farmerNote: "Buds begin to swell and green leaf tips appear.",
      },
      {
        key: "vegetative",
        label: "Leaf Dev.",
        startDay: 16,
        endDay: 45,
        tone: "stage-2",
        farmerNote: "Leaves expand rapidly. Ensure adequate moisture and inspect for aphids.",
      },
      {
        key: "flowering",
        label: "Blossom",
        startDay: 46,
        endDay: 75,
        tone: "stage-3",
        farmerNote:
          "Pink buds open to white flowers. Critical stage for pollination and scab prevention.",
      },
      {
        key: "fruiting",
        label: "Fruit Growth",
        startDay: 76,
        endDay: 120,
        tone: "stage-4",
        farmerNote: "Fruits swell. Thin crowded clusters and check for cedar rust spots.",
      },
      {
        key: "harvest",
        label: "Harvest",
        startDay: 121,
        endDay: 150,
        tone: "stage-5",
        farmerNote: "Fruit is firm, sweet and colorful. Pick carefully to avoid bruising.",
      },
    ],
    care: [
      "Prune tree branches in winter to allow light and air inside.",
      "Apply organic mulch around the trunk base to conserve moisture.",
      "Rake and burn fallen leaves to prevent fungal spore wintering.",
      "Monitor leaves and fruit surfaces weekly for scabs or spots.",
    ],
    commonDiseaseIds: ["apple-scab", "apple-cedar-rust"],
  },
  {
    id: "corn",
    name: "Corn",
    emoji: "🌽",
    available: true,
    growingDurationDays: 100,
    plantingMonths: [6, 7, 1],
    harvestNote: "Harvest when silks turn dry and brown, and kernels are full and milky.",
    stages: [
      {
        key: "sowing",
        label: "Sowing",
        startDay: 0,
        endDay: 10,
        tone: "stage-1",
        farmerNote: "Seeds germinate in warm soil. Keep weed-free.",
      },
      {
        key: "vegetative",
        label: "Growth",
        startDay: 11,
        endDay: 40,
        tone: "stage-2",
        farmerNote: "Stems grow tall rapidly. Apply nitrogen fertilizer.",
      },
      {
        key: "flowering",
        label: "Tasseling",
        startDay: 41,
        endDay: 60,
        tone: "stage-3",
        farmerNote: "Male tassels shed pollen to female silks below. Do not let soil dry out.",
      },
      {
        key: "fruiting",
        label: "Silking",
        startDay: 61,
        endDay: 85,
        tone: "stage-4",
        farmerNote: "Kernels fill with milk and starch. Watch leaves for orange rust spots.",
      },
      {
        key: "harvest",
        label: "Harvest",
        startDay: 86,
        endDay: 100,
        tone: "stage-5",
        farmerNote: "Silks are dark brown. Peel husk slightly to test kernel maturity.",
      },
    ],
    care: [
      "Plant in blocks of at least 4 rows to ensure good wind pollination.",
      "Apply high-nitrogen compost once plants are knee-high.",
      "Keep weed-free, especially during the first 30 days.",
      "Water deeply during the tasseling and silking stages.",
    ],
    commonDiseaseIds: ["corn-common-rust"],
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
    severitySupported: true,
    stageTreatments: [
      {
        stage: "G0",
        label: "Healthy",
        lesionPctMax: 0,
        color: "success",
        emoji: "🟢",
        recommendations: [
          "No treatment needed — plant appears healthy.",
          "Continue regular base-watering every 2–3 days.",
          "Inspect lower leaves once a week as a precaution.",
        ],
      },
      {
        stage: "G1",
        label: "Early / Mild",
        lesionPctMax: 15,
        color: "warning",
        emoji: "🟡",
        recommendations: [
          "Remove and dispose of the spotted lower leaves immediately.",
          "Improve airflow by pruning crowded branches.",
          "Switch to base-only watering — never wet the leaves.",
          "Monitor remaining plants daily for 7 days.",
        ],
      },
      {
        stage: "G2",
        label: "Moderate",
        lesionPctMax: 40,
        color: "orange",
        emoji: "🟠",
        recommendations: [
          "Apply copper-based fungicide or mancozeb, covering both leaf surfaces.",
          "Repeat spray after 7–10 days if new spots appear.",
          "Spray in early morning or late evening — never in direct sun.",
          "Remove all spotted leaves and burn them away from the field.",
          "Reduce plant density if spacing is below 45 cm.",
        ],
      },
      {
        stage: "G3",
        label: "Severe",
        lesionPctMax: 100,
        color: "destructive",
        emoji: "🔴",
        recommendations: [
          "🚨 Emergency: Remove and burn all heavily infected plants or sections.",
          "Apply a systemic fungicide (e.g. difenoconazole) immediately.",
          "Stop field operations when leaves are wet to prevent spore spread.",
          "Consult your local agriculture extension officer today.",
          "Do not plant tomato, potato or brinjal in the same field next season.",
        ],
      },
    ],
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
    severitySupported: true,
    stageTreatments: [
      {
        stage: "G0",
        label: "Healthy",
        lesionPctMax: 0,
        color: "success",
        emoji: "🟢",
        recommendations: [
          "No signs of late blight detected.",
          "Maintain good field drainage and spacing.",
        ],
      },
      {
        stage: "G1",
        label: "Early / Mild",
        lesionPctMax: 15,
        color: "warning",
        emoji: "🟡",
        recommendations: [
          "Remove water-soaked grey-green lesion patches immediately.",
          "Avoid overhead irrigation — switch to drip or base watering.",
          "Alert neighbouring farmers as late blight spreads through air.",
        ],
      },
      {
        stage: "G2",
        label: "Moderate",
        lesionPctMax: 40,
        color: "orange",
        emoji: "🟠",
        recommendations: [
          "Apply a protectant fungicide (chlorothalonil or mancozeb) immediately.",
          "Remove all visibly infected plants from the field.",
          "Repeat spray every 5–7 days during wet or cool weather.",
          "Monitor remaining plants twice daily.",
        ],
      },
      {
        stage: "G3",
        label: "Severe",
        lesionPctMax: 100,
        color: "destructive",
        emoji: "🔴",
        recommendations: [
          "🚨 Emergency: Destroy all infected plants — pull and burn immediately.",
          "Apply systemic fungicides such as metalaxyl + mancozeb without delay.",
          "Do NOT compost affected material — bury or burn it far from the field.",
          "Contact your agriculture extension officer for emergency support.",
        ],
      },
    ],
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
    severitySupported: true,
    stageTreatments: [
      {
        stage: "G0",
        label: "Healthy",
        lesionPctMax: 0,
        color: "success",
        emoji: "🟢",
        recommendations: ["No mold detected.", "Ensure good air circulation in polyhouse."],
      },
      {
        stage: "G1",
        label: "Early / Mild",
        lesionPctMax: 15,
        color: "warning",
        emoji: "🟡",
        recommendations: [
          "Open polyhouse sides or vents to increase airflow immediately.",
          "Water at the base early in the morning only.",
          "Thin out crowded leaves to reduce humidity pockets.",
        ],
      },
      {
        stage: "G2",
        label: "Moderate",
        lesionPctMax: 40,
        color: "orange",
        emoji: "🟠",
        recommendations: [
          "Apply an approved fungicide (copper oxychloride) covering the leaf undersides.",
          "Remove all mold-affected leaves before spraying.",
          "Clean all tools with diluted bleach before use.",
          "Increase plant spacing if possible to allow drying.",
        ],
      },
      {
        stage: "G3",
        label: "Severe",
        lesionPctMax: 100,
        color: "destructive",
        emoji: "🔴",
        recommendations: [
          "🚨 Remove and destroy all heavily affected plants.",
          "Apply systemic fungicide urgently.",
          "Disinfect the polyhouse structure and floor.",
          "Replant only with disease-free certified seedlings after full clean-up.",
        ],
      },
    ],
  },
  {
    id: "tomato-yellow-curl",
    cropId: "tomato",
    modelLabel: "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    name: "Tomato Yellow Leaf Curl Virus",
    what: "A devastating viral disease of tomatoes transmitted by tiny silverleaf whiteflies.",
    symptoms: [
      "Severe stunting and erect upright growth of the plant.",
      "Leaves curl upward and inward, resembling small cups.",
      "Leaf margins turn yellow.",
      "Flowers fail to set fruit or fall off prematurely.",
    ],
    cause:
      "Tomato Yellow Leaf Curl Virus (TYLCV), spread by whiteflies. It does not spread by touch or seeds.",
    actionNow: [
      "Pull out and destroy infected plants immediately.",
      "Set yellow sticky traps to catch whiteflies.",
      "Spray organic neem oil or insecticidal soap.",
    ],
    prevention: [
      "Use fine mesh screens in nursery tunnels.",
      "Keep fields clear of weeds that host whiteflies.",
      "Plant TYLCV-resistant varieties.",
    ],
    treatment: [
      "Viruses cannot be cured once inside the plant.",
      "Control the whitefly vector using systemic insecticides or neem oil sprays. Ask your agriculture officer.",
    ],
    severitySupported: true,
    stageTreatments: [
      {
        stage: "G0",
        label: "Healthy",
        lesionPctMax: 0,
        color: "success",
        emoji: "🟢",
        recommendations: [
          "No virus signs detected.",
          "Install yellow sticky traps as a preventative measure.",
        ],
      },
      {
        stage: "G1",
        label: "Early / Mild",
        lesionPctMax: 15,
        color: "warning",
        emoji: "🟡",
        recommendations: [
          "Set yellow sticky traps around the field immediately.",
          "Spray organic neem oil or insecticidal soap to control whiteflies.",
          "Monitor daily for new plants showing leaf curl.",
        ],
      },
      {
        stage: "G2",
        label: "Moderate",
        lesionPctMax: 40,
        color: "orange",
        emoji: "🟠",
        recommendations: [
          "Remove and destroy all visibly infected plants.",
          "Apply systemic insecticide (imidacloprid) for whitefly vector control.",
          "Cover nursery seedlings with fine mesh to prevent re-infection.",
          "Do not replant from infected seed stock.",
        ],
      },
      {
        stage: "G3",
        label: "Severe",
        lesionPctMax: 100,
        color: "destructive",
        emoji: "🔴",
        recommendations: [
          "🚨 Emergency: Pull out and burn all infected plants without delay.",
          "Fumigate the field boundary to kill whitefly populations.",
          "Replant only with TYLCV-resistant certified varieties.",
          "Seek guidance from the local horticulture department immediately.",
        ],
      },
    ],
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
    stageTreatments: [
      {
        stage: "G0",
        label: "Healthy",
        lesionPctMax: 0,
        color: "success",
        emoji: "🟢",
        recommendations: [
          "Your tomato plant is healthy! 🎉",
          "Continue regular base-watering and weekly leaf checks.",
          "Mulch the soil to retain moisture.",
        ],
      },
      {
        stage: "G1",
        label: "Early / Mild",
        lesionPctMax: 15,
        color: "warning",
        emoji: "🟡",
        recommendations: ["Continue monitoring."],
      },
      {
        stage: "G2",
        label: "Moderate",
        lesionPctMax: 40,
        color: "orange",
        emoji: "🟠",
        recommendations: ["Continue monitoring."],
      },
      {
        stage: "G3",
        label: "Severe",
        lesionPctMax: 100,
        color: "destructive",
        emoji: "🔴",
        recommendations: ["Continue monitoring."],
      },
    ],
  },
  {
    id: "apple-scab",
    cropId: "apple",
    modelLabel: "Apple___Apple_scab",
    name: "Apple Scab",
    what: "A severe fungal disease affecting apple leaves and fruit, causing velvety spots.",
    symptoms: [
      "Olive-green to black spots on leaves.",
      "Velvety texture on spots.",
      "Brown scabby lesions on fruits.",
      "Premature leaf drop.",
    ],
    cause:
      "The fungus Venturia inaequalis. It overwinters on fallen leaves and spreads with spring rain and humidity.",
    actionNow: [
      "Rake and remove all fallen leaves under the tree.",
      "Prune branches to improve airflow.",
      "Avoid watering foliage directly.",
    ],
    prevention: [
      "Plant scab-resistant varieties.",
      "Clean up all leaves and fruit debris at winter's end.",
      "Apply mulch to cover soil spores.",
    ],
    treatment: [
      "Spray sulfur or copper fungicides at green tip stage.",
      "Repeat applications as per weather and label guidelines.",
      "Prune infected twigs in winter.",
    ],
    severitySupported: true,
    stageTreatments: [
      {
        stage: "G0",
        label: "Healthy",
        lesionPctMax: 0,
        color: "success",
        emoji: "🟢",
        recommendations: [
          "No scab detected. Tree looks healthy.",
          "Rake and burn fallen leaves as a preventative.",
        ],
      },
      {
        stage: "G1",
        label: "Early / Mild",
        lesionPctMax: 15,
        color: "warning",
        emoji: "🟡",
        recommendations: [
          "Rake and remove all fallen leaves under the tree immediately.",
          "Prune crowded branches to allow air and light.",
          "Avoid wetting foliage during irrigation.",
        ],
      },
      {
        stage: "G2",
        label: "Moderate",
        lesionPctMax: 40,
        color: "orange",
        emoji: "🟠",
        recommendations: [
          "Spray sulfur or copper fungicide, covering both leaf surfaces.",
          "Repeat application every 7–10 days during wet weather.",
          "Remove and destroy infected fruits and leaves.",
          "Avoid overhead watering completely.",
        ],
      },
      {
        stage: "G3",
        label: "Severe",
        lesionPctMax: 100,
        color: "destructive",
        emoji: "🔴",
        recommendations: [
          "🚨 Emergency: Apply captan or a systemic scab fungicide immediately.",
          "Prune all infected branches back to healthy wood.",
          "Clean up all debris and burn it away from the orchard.",
          "Consult a fruit crop specialist for orchard recovery.",
        ],
      },
    ],
  },
  {
    id: "apple-cedar-rust",
    cropId: "apple",
    modelLabel: "Apple___Cedar_apple_rust",
    name: "Apple Cedar Rust",
    what: "A dual-host fungal disease that moves between red cedars and apple trees.",
    symptoms: [
      "Bright orange-yellow spots on upper leaf surfaces.",
      "Small cup-like tubes (aecia) on the underside of leaves.",
      "Defoliation in severe cases.",
      "Orange spots on fruits.",
    ],
    cause:
      "The fungus Gymnosporangium juniperi-virginianae. It requires both apple and cedar hosts to complete its life cycle.",
    actionNow: [
      "Remove infected leaves immediately.",
      "Cut down any wild red cedars close to your orchard.",
      "Avoid watering in the evening.",
    ],
    prevention: [
      "Plant rust-resistant cultivars.",
      "Maintain spacing and keep cedar trees at least 1 mile away if possible.",
      "Apply protective sprays early.",
    ],
    treatment: [
      "Apply copper or specialized rust fungicides when apple flower buds show pink.",
      "Repeat sprays at 7-10 day intervals until petals fall.",
    ],
    severitySupported: true,
    stageTreatments: [
      {
        stage: "G0",
        label: "Healthy",
        lesionPctMax: 0,
        color: "success",
        emoji: "🟢",
        recommendations: [
          "No rust signs.",
          "Remove any red cedar trees within half a mile of the orchard.",
        ],
      },
      {
        stage: "G1",
        label: "Early / Mild",
        lesionPctMax: 15,
        color: "warning",
        emoji: "🟡",
        recommendations: [
          "Remove infected leaves immediately and dispose away from orchard.",
          "Cut down wild red cedars near the field.",
          "Avoid evening watering to reduce leaf wetness.",
        ],
      },
      {
        stage: "G2",
        label: "Moderate",
        lesionPctMax: 40,
        color: "orange",
        emoji: "🟠",
        recommendations: [
          "Apply copper-based or mycobutanil fungicide immediately.",
          "Repeat sprays every 7–10 days until petal fall.",
          "Prune infected branches back to clean wood.",
          "Remove and burn all fallen leaves and infected twigs.",
        ],
      },
      {
        stage: "G3",
        label: "Severe",
        lesionPctMax: 100,
        color: "destructive",
        emoji: "🔴",
        recommendations: [
          "🚨 Emergency: Apply systemic rust fungicide without delay.",
          "Remove all cedar hosts from the area — this disease needs both plants.",
          "Prune all infected limbs and sanitize pruning tools.",
          "Seek specialist advice for orchard recovery.",
        ],
      },
    ],
  },
  {
    id: "corn-common-rust",
    cropId: "corn",
    modelLabel: "Corn___Common_rust",
    name: "Corn Common Rust",
    what: "A leaf disease of corn causing powdery golden-brown pustules on both leaf sides.",
    symptoms: [
      "Elongated golden-brown to cinnamon-brown pustules.",
      "Pustules appear on both upper and lower leaf surfaces.",
      "Leaf yellowing and drying in bad cases.",
      "Powdery rust spores rub off on fingers.",
    ],
    cause:
      "The fungus Puccinia sorghi. It is favored by cool temperatures, high humidity, and heavy dew.",
    actionNow: [
      "Remove and destroy heavily infected leaves.",
      "Avoid sprinkler irrigation to prevent leaf wetness.",
      "Monitor surrounding fields.",
    ],
    prevention: [
      "Plant hybrid corn varieties with partial rust resistance.",
      "Sow early in the season to avoid peak spore periods.",
      "Practice crop rotation.",
    ],
    treatment: [
      "Fungicide sprays are rarely needed unless infection is severe on young plants.",
      "Consult extension officers for approved strobilurin or triazole fungicides.",
    ],
    severitySupported: true,
    stageTreatments: [
      {
        stage: "G0",
        label: "Healthy",
        lesionPctMax: 0,
        color: "success",
        emoji: "🟢",
        recommendations: [
          "No rust detected. Corn plants look healthy.",
          "Monitor leaves weekly especially during cool humid weather.",
        ],
      },
      {
        stage: "G1",
        label: "Early / Mild",
        lesionPctMax: 15,
        color: "warning",
        emoji: "🟡",
        recommendations: [
          "Remove and destroy the heavily spotted lower leaves.",
          "Switch from sprinkler to base irrigation.",
          "Monitor surrounding fields as rust spores travel by wind.",
        ],
      },
      {
        stage: "G2",
        label: "Moderate",
        lesionPctMax: 40,
        color: "orange",
        emoji: "🟠",
        recommendations: [
          "Apply a strobilurin fungicide (azoxystrobin) immediately.",
          "Spray during morning hours for best absorption.",
          "Remove heavily pustulated leaves to reduce spore load.",
          "Alert nearby corn farmers about the outbreak.",
        ],
      },
      {
        stage: "G3",
        label: "Severe",
        lesionPctMax: 100,
        color: "destructive",
        emoji: "🔴",
        recommendations: [
          "🚨 Emergency: Apply triazole fungicide (propiconazole) immediately.",
          "Remove all heavily infected plant sections and burn them.",
          "Do not harvest and replant in the same field this season.",
          "Consult extension officer for compensation and recovery guidance.",
        ],
      },
    ],
  },
  {
    id: "potato-early-blight",
    cropId: "potato",
    modelLabel: "Potato___Early_blight",
    name: "Potato Early Blight",
    what: "A fungal disease of potato causing dark target-like spots, identical to tomato early blight.",
    symptoms: [
      "Dark brown, circular spots with concentric rings (target pattern).",
      "Yellow halo around the leaf spots.",
      "Lower leaves dry up and die.",
      "Leathery sunken lesions on tubers.",
    ],
    cause:
      "The fungus Alternaria solani. It spreads in humid weather, especially when plants are stressed or lack nutrients.",
    actionNow: [
      "Remove and burn lower yellowing leaves.",
      "Water base of plants only.",
      "Apply potassium fertilizer to reduce plant stress.",
    ],
    prevention: [
      "Rotate crops with non-solanaceous plants.",
      "Use certified disease-free seed tubers.",
      "Ensure proper crop spacing for leaf drying.",
    ],
    treatment: [
      "Spray copper fungicides or chlorothalonil immediately.",
      "Repeat every 7-10 days if humid weather continues.",
      "Harvest only when vines are fully dead to prevent tuber infection.",
    ],
    severitySupported: true,
    stageTreatments: [
      {
        stage: "G0",
        label: "Healthy",
        lesionPctMax: 0,
        color: "success",
        emoji: "🟢",
        recommendations: [
          "Potato leaf looks healthy.",
          "Continue hilling soil around stems and weekly inspections.",
        ],
      },
      {
        stage: "G1",
        label: "Early / Mild",
        lesionPctMax: 15,
        color: "warning",
        emoji: "🟡",
        recommendations: [
          "Remove and burn yellowing lower leaves.",
          "Apply potassium fertilizer to strengthen plant resistance.",
          "Switch to base watering — avoid wetting foliage.",
        ],
      },
      {
        stage: "G2",
        label: "Moderate",
        lesionPctMax: 40,
        color: "orange",
        emoji: "🟠",
        recommendations: [
          "Spray copper fungicide or chlorothalonil on both leaf surfaces.",
          "Repeat spray every 7–10 days during humid conditions.",
          "Remove all infected leaves before spraying.",
          "Boost plant nutrition with balanced NPK fertilizer.",
        ],
      },
      {
        stage: "G3",
        label: "Severe",
        lesionPctMax: 100,
        color: "destructive",
        emoji: "🔴",
        recommendations: [
          "🚨 Harvest tubers now if possible to prevent underground spread.",
          "Remove and burn all aboveground infected plant matter.",
          "Do not plant solanaceous crops (potato, tomato, brinjal) here next season.",
          "Seek soil fumigation advice from your agriculture officer.",
        ],
      },
    ],
  },
  {
    id: "potato-healthy",
    cropId: "potato",
    modelLabel: "Potato___healthy",
    name: "Healthy Potato Leaf",
    what: "No disease was detected on this potato leaf. It is healthy.",
    symptoms: ["Even green leaf color.", "No spots, lesions or curling."],
    cause: "—",
    actionNow: ["Continue regular watering and hilling up.", "Inspect lower foliage weekly."],
    prevention: ["Maintain crop rotation.", "Apply mulch to keep soil cool and moist."],
    treatment: ["No treatment required."],
    severitySupported: false,
    stageTreatments: [
      {
        stage: "G0",
        label: "Healthy",
        lesionPctMax: 0,
        color: "success",
        emoji: "🟢",
        recommendations: [
          "Potato plants are healthy! 🎉",
          "Continue hilling soil around stems.",
          "Water deeply once a week.",
        ],
      },
      {
        stage: "G1",
        label: "Early / Mild",
        lesionPctMax: 15,
        color: "warning",
        emoji: "🟡",
        recommendations: ["Continue monitoring."],
      },
      {
        stage: "G2",
        label: "Moderate",
        lesionPctMax: 40,
        color: "orange",
        emoji: "🟠",
        recommendations: ["Continue monitoring."],
      },
      {
        stage: "G3",
        label: "Severe",
        lesionPctMax: 100,
        color: "destructive",
        emoji: "🔴",
        recommendations: ["Continue monitoring."],
      },
    ],
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
