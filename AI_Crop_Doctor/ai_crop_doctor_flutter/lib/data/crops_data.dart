// ════════════════════════════════════════════════════════════════════════════
// Crops Knowledge Base — G0-G3 Stage Treatments for all 10 diseases
// ════════════════════════════════════════════════════════════════════════════

import 'models.dart';

class CropsData {
  static const List<DiseaseInfo> _diseases = [
    // ── Apple Cedar Rust ──────────────────────────────────────────────────
    DiseaseInfo(
      id: 'apple-cedar-rust',
      cropId: 'apple',
      modelLabel: 'Apple Cedar Rust',
      name: 'Apple Cedar Rust',
      what:
          'Cedar apple rust is a fungal disease caused by Gymnosporangium juniperi-virginianae. '
          'It requires two host plants (apple and cedar/juniper) to complete its lifecycle.',
      symptoms: [
        'Bright orange-yellow spots on upper leaf surfaces',
        'Pale orange spots on lower surfaces with tube-like structures',
        'Premature leaf drop',
        'Fruit may develop similar lesions',
      ],
      cause:
          'Fungal pathogen Gymnosporangium juniperi-virginianae spreads via wind-borne spores '
          'from nearby juniper/cedar trees during wet spring conditions.',
      actionNow: [
        'Remove heavily infected leaves immediately',
        'Apply a myclobutanil or propiconazole fungicide',
        'Avoid overhead irrigation',
      ],
      prevention: [
        'Plant resistant apple varieties',
        'Remove nearby juniper/cedar trees within 2 km if possible',
        'Apply preventive fungicide sprays before bloom',
      ],
      treatment: [
        'Apply myclobutanil (Rally), propiconazole, or mancozeb',
        'Spray every 7-10 days during wet weather',
        'Consult local agricultural extension for approved products',
      ],
      stageTreatments: [
        StageTreatment(
          stage: DiseaseStage.G0,
          label: 'Healthy',
          lesionPctMax: 0,
          emoji: '🟢',
          recommendations: [
            'No disease detected. Continue regular monitoring.',
            'Apply preventive fungicide before spring wet season.',
            'Ensure good air circulation around the tree canopy.',
          ],
        ),
        StageTreatment(
          stage: DiseaseStage.G1,
          label: 'Early / Mild',
          lesionPctMax: 15,
          emoji: '🟡',
          recommendations: [
            'Remove visibly infected leaves by hand.',
            'Apply a light fungicide spray (myclobutanil or mancozeb).',
            'Increase monitoring frequency to every 3 days.',
            'Improve airflow: prune overcrowded branches.',
          ],
        ),
        StageTreatment(
          stage: DiseaseStage.G2,
          label: 'Moderate',
          lesionPctMax: 40,
          emoji: '🟠',
          recommendations: [
            'Apply systemic fungicide (propiconazole) immediately.',
            'Remove and destroy all infected leaves and fruit.',
            'Re-spray every 7 days until symptoms stop spreading.',
            'Avoid wetting leaves during irrigation.',
            'Consider removing nearby juniper hosts.',
          ],
        ),
        StageTreatment(
          stage: DiseaseStage.G3,
          label: 'Severe',
          lesionPctMax: 100,
          emoji: '🔴',
          recommendations: [
            'EMERGENCY: Quarantine affected trees from healthy ones.',
            'Apply broad-spectrum fungicide (mancozeb + myclobutanil mix).',
            'Remove and burn all infected plant material.',
            'Contact your local agriculture department immediately.',
            'Harvest any remaining healthy fruit early.',
          ],
        ),
      ],
    ),

    // ── Apple Scab ───────────────────────────────────────────────────────
    DiseaseInfo(
      id: 'apple-scab',
      cropId: 'apple',
      modelLabel: 'Apple Scab',
      name: 'Apple Scab',
      what:
          'Apple scab is a common fungal disease caused by Venturia inaequalis. '
          'It affects leaves, fruits and twigs, causing unsightly dark scabby lesions.',
      symptoms: [
        'Olive-green to black scab-like spots on leaves',
        'Velvety olive-green lesions on young leaves',
        'Fruit deformation and cracking',
        'Premature fruit and leaf drop in severe cases',
      ],
      cause:
          'Caused by the fungus Venturia inaequalis. Spreads via ascospores from overwintered '
          'infected leaf debris during wet spring weather.',
      actionNow: [
        'Rake and remove fallen infected leaves from under the tree',
        'Apply captan or myclobutanil fungicide spray',
        'Reduce overhead watering',
      ],
      prevention: [
        'Plant scab-resistant apple varieties',
        'Clear all leaf litter in autumn',
        'Apply dormant copper sprays before bud break',
      ],
      treatment: [
        'Apply captan, myclobutanil, or difenoconazole fungicide',
        'Start sprays at bud break and repeat every 10 days in wet weather',
      ],
      stageTreatments: [
        StageTreatment(
          stage: DiseaseStage.G0,
          label: 'Healthy',
          lesionPctMax: 0,
          emoji: '🟢',
          recommendations: [
            'No scab detected. Maintain clean garden hygiene.',
            'Clear fallen leaves regularly.',
            'Apply preventive copper spray before bud break.',
          ],
        ),
        StageTreatment(
          stage: DiseaseStage.G1,
          label: 'Early / Mild',
          lesionPctMax: 15,
          emoji: '🟡',
          recommendations: [
            'Remove visibly infected leaves and dispose of them away from the orchard.',
            'Apply captan fungicide as soon as possible.',
            'Monitor after each rain event.',
          ],
        ),
        StageTreatment(
          stage: DiseaseStage.G2,
          label: 'Moderate',
          lesionPctMax: 40,
          emoji: '🟠',
          recommendations: [
            'Apply systemic fungicide (myclobutanil or difenoconazole) every 7 days.',
            'Remove and destroy all fallen infected leaves.',
            'Thin the canopy to improve air drying after rain.',
            'Avoid wetting the foliage during irrigation.',
          ],
        ),
        StageTreatment(
          stage: DiseaseStage.G3,
          label: 'Severe',
          lesionPctMax: 100,
          emoji: '🔴',
          recommendations: [
            'URGENT: Apply emergency fungicide treatment (captan + myclobutanil).',
            'Strip and destroy all infected leaves from the tree.',
            'Consider removing severely infected trees to protect the orchard.',
            'Consult your local agriculture extension officer immediately.',
          ],
        ),
      ],
    ),

    // ── Corn Common Rust ─────────────────────────────────────────────────
    DiseaseInfo(
      id: 'corn-common-rust',
      cropId: 'corn',
      modelLabel: 'Corn Common Rust',
      name: 'Corn Common Rust',
      what:
          'Common corn rust is caused by Puccinia sorghi. It is one of the most widespread '
          'foliar diseases of maize worldwide, reducing photosynthesis and yield.',
      symptoms: [
        'Oval to elongated brick-red to brown pustules on both leaf surfaces',
        'Pustules surrounded by a yellow halo in early stages',
        'Leaves turn yellow then brown as pustules rupture and release spores',
        'Severe infection causes premature leaf death',
      ],
      cause:
          'Caused by the obligate fungal pathogen Puccinia sorghi. Spores spread via wind '
          'from infected plants. Favoured by cool, humid conditions.',
      actionNow: [
        'Apply foliar fungicide (triazole or strobilurin class)',
        'Remove heavily infected leaves to reduce spore load',
        'Improve field drainage if waterlogged',
      ],
      prevention: [
        'Plant rust-resistant maize hybrids',
        'Avoid planting in low-lying humid areas',
        'Rotate crops with non-cereal species',
      ],
      treatment: [
        'Apply propiconazole, tebuconazole, or azoxystrobin',
        'Spray at first sign of infection and repeat after 14 days',
      ],
      stageTreatments: [
        StageTreatment(
          stage: DiseaseStage.G0,
          label: 'Healthy',
          lesionPctMax: 0,
          emoji: '🟢',
          recommendations: [
            'No rust detected. Continue field monitoring weekly.',
            'Ensure field has good drainage.',
            'Consider planting rust-resistant maize varieties next season.',
          ],
        ),
        StageTreatment(
          stage: DiseaseStage.G1,
          label: 'Early / Mild',
          lesionPctMax: 15,
          emoji: '🟡',
          recommendations: [
            'Scout field for additional infected plants.',
            'Apply a preventive triazole fungicide spray.',
            'Remove heavily infected lower leaves.',
            'Monitor humidity and reduce waterlogging.',
          ],
        ),
        StageTreatment(
          stage: DiseaseStage.G2,
          label: 'Moderate',
          lesionPctMax: 40,
          emoji: '🟠',
          recommendations: [
            'Apply propiconazole or tebuconazole fungicide immediately.',
            'Repeat spray after 7-10 days.',
            'Remove infected leaves throughout the field.',
            'Harvest as early as possible if close to maturity.',
          ],
        ),
        StageTreatment(
          stage: DiseaseStage.G3,
          label: 'Severe',
          lesionPctMax: 100,
          emoji: '🔴',
          recommendations: [
            'CRITICAL: Apply emergency broad-spectrum fungicide (azoxystrobin + propiconazole).',
            'Harvest immediately if crop is near maturity to limit losses.',
            'Notify local agriculture office — this level of rust can spread rapidly.',
            'Do NOT plant maize in the same field next season without soil treatment.',
            'Destroy all crop residues after harvest.',
          ],
        ),
      ],
    ),

    // ── Potato Early Blight ──────────────────────────────────────────────
    DiseaseInfo(
      id: 'potato-early-blight',
      cropId: 'potato',
      modelLabel: 'Potato Early Blight',
      name: 'Potato Early Blight',
      what:
          'Potato early blight is caused by Alternaria solani. It typically occurs mid-season '
          'when plants are under nutritional or water stress.',
      symptoms: [
        'Dark brown to black lesions with concentric rings (target-board pattern)',
        'Lesions appear first on older lower leaves',
        'Yellow halo surrounding dark spots',
        'Premature defoliation in severe cases',
      ],
      cause:
          'Alternaria solani fungus. Spreads via spores in wind and rain splash. '
          'Thrives in warm days (24–29°C) followed by cool nights with heavy dew.',
      actionNow: [
        'Remove and destroy infected lower leaves',
        'Apply mancozeb or chlorothalonil fungicide',
        'Ensure potatoes are not under drought or nitrogen stress',
      ],
      prevention: [
        'Use certified disease-free seed potatoes',
        'Rotate crops with non-Solanaceae for 3 years',
        'Avoid overhead irrigation; use drip irrigation',
        'Maintain adequate nitrogen fertilization',
      ],
      treatment: [
        'Apply mancozeb, chlorothalonil, or azoxystrobin fungicide',
        'Spray every 7-10 days during warm humid weather',
      ],
      stageTreatments: [
        StageTreatment(
          stage: DiseaseStage.G0,
          label: 'Healthy',
          lesionPctMax: 0,
          emoji: '🟢',
          recommendations: [
            'No early blight detected. Continue monitoring.',
            'Apply preventive fungicide before wet season.',
            'Maintain balanced fertilization to keep plants vigorous.',
          ],
        ),
        StageTreatment(
          stage: DiseaseStage.G1,
          label: 'Early / Mild',
          lesionPctMax: 15,
          emoji: '🟡',
          recommendations: [
            'Remove infected lower leaves immediately.',
            'Apply mancozeb (protectant) fungicide.',
            'Ensure plants have adequate nitrogen — stressed plants get blight faster.',
            'Check soil moisture: avoid drought stress.',
          ],
        ),
        StageTreatment(
          stage: DiseaseStage.G2,
          label: 'Moderate',
          lesionPctMax: 40,
          emoji: '🟠',
          recommendations: [
            'Apply systemic fungicide (azoxystrobin or difenoconazole) every 7 days.',
            'Remove and burn all infected leaves from the field.',
            'Avoid overhead irrigation — switch to drip if possible.',
            'Top-dress with nitrogen fertilizer to reduce plant stress.',
          ],
        ),
        StageTreatment(
          stage: DiseaseStage.G3,
          label: 'Severe',
          lesionPctMax: 100,
          emoji: '🔴',
          recommendations: [
            'EMERGENCY: Apply tank-mix of mancozeb + azoxystrobin immediately.',
            'Desiccate foliage if close to harvest to prevent tuber rot.',
            'Harvest tubers as soon as possible to avoid tuber infection.',
            'Do not store infected tubers — they will rot in storage.',
            'Consult your agriculture extension service immediately.',
          ],
        ),
      ],
    ),

    // ── Potato Healthy ───────────────────────────────────────────────────
    DiseaseInfo(
      id: 'potato-healthy',
      cropId: 'potato',
      modelLabel: 'Potato Healthy',
      name: 'Healthy Potato Leaf',
      what:
          'This potato leaf shows no signs of disease. The plant appears healthy '
          'with normal green foliage and no visible lesions.',
      symptoms: ['No disease symptoms visible'],
      cause: 'No pathogen detected',
      actionNow: [
        'Continue regular monitoring every 3-5 days',
        'Maintain proper irrigation and fertilization',
      ],
      prevention: [
        'Use certified seed potatoes',
        'Rotate crops each season',
        'Apply preventive fungicide before wet seasons',
      ],
      treatment: ['No treatment needed — crop is healthy'],
      stageTreatments: [
        StageTreatment(
          stage: DiseaseStage.G0,
          label: 'Healthy',
          lesionPctMax: 0,
          emoji: '🟢',
          recommendations: [
            'Your potato plant is healthy. Keep up the good work!',
            'Continue weekly scouting for early signs of blight.',
            'Maintain soil health with balanced fertilization.',
          ],
        ),
      ],
    ),

    // ── Tomato Early Blight ──────────────────────────────────────────────
    DiseaseInfo(
      id: 'tomato-early-blight',
      cropId: 'tomato',
      modelLabel: 'Tomato Early Blight',
      name: 'Tomato Early Blight',
      what:
          'Caused by Alternaria solani, early blight is one of the most common tomato '
          'leaf diseases worldwide. It reduces yield by destroying photosynthetic area.',
      symptoms: [
        'Dark brown spots with distinctive concentric rings (bulls-eye pattern)',
        'Yellow chlorotic area surrounding dark spots',
        'Spots first appear on older, lower leaves',
        'Premature defoliation exposing fruit to sunscald',
      ],
      cause:
          'Alternaria solani fungal pathogen. Survives in soil and on plant debris. '
          'Spores spread by wind, rain, and irrigation water.',
      actionNow: [
        'Remove and destroy infected leaves immediately',
        'Apply chlorothalonil or mancozeb fungicide',
        'Improve drainage and avoid waterlogging',
      ],
      prevention: [
        'Use disease-resistant tomato varieties',
        'Practice 3-year crop rotation',
        'Mulch soil to prevent spore splash',
        'Stake plants for better air circulation',
      ],
      treatment: [
        'Apply mancozeb, chlorothalonil, or azoxystrobin',
        'Spray weekly during rainy periods',
      ],
      stageTreatments: [
        StageTreatment(
          stage: DiseaseStage.G0,
          label: 'Healthy',
          lesionPctMax: 0,
          emoji: '🟢',
          recommendations: [
            'No early blight visible. Your tomato plant is healthy.',
            'Keep monitoring weekly, especially during rainy weather.',
            'Apply preventive copper-based fungicide at the start of rainy season.',
          ],
        ),
        StageTreatment(
          stage: DiseaseStage.G1,
          label: 'Early / Mild',
          lesionPctMax: 15,
          emoji: '🟡',
          recommendations: [
            'Prune and remove affected lower leaves immediately.',
            'Apply mancozeb (contact fungicide) to protect healthy foliage.',
            'Water plants at the base — avoid wetting leaves.',
            'Apply mulch around plants to reduce soil splash.',
          ],
        ),
        StageTreatment(
          stage: DiseaseStage.G2,
          label: 'Moderate',
          lesionPctMax: 40,
          emoji: '🟠',
          recommendations: [
            'Apply systemic fungicide (azoxystrobin or difenoconazole) every 7 days.',
            'Remove all visibly infected leaves from the plant.',
            'Stake plants higher for better airflow.',
            'Check and correct any nutrient deficiencies — especially potassium.',
          ],
        ),
        StageTreatment(
          stage: DiseaseStage.G3,
          label: 'Severe',
          lesionPctMax: 100,
          emoji: '🔴',
          recommendations: [
            'URGENT: Apply broad-spectrum fungicide (azoxystrobin + copper) immediately.',
            'Remove and burn all heavily infected plant parts.',
            'Harvest any ripe or near-ripe fruit to prevent post-harvest rot.',
            'If plant is severely defoliated, consider removal to prevent spread.',
            'Contact your local agriculture officer for emergency guidance.',
          ],
        ),
      ],
    ),

    // ── Tomato Yellow Leaf Curl Virus ────────────────────────────────────
    DiseaseInfo(
      id: 'tomato-yellow-leaf-curl-virus',
      cropId: 'tomato',
      modelLabel: 'Tomato Yellow Leaf Curl Virus',
      name: 'Tomato Yellow Leaf Curl Virus',
      what:
          'TYLCV is a devastating viral disease transmitted by whiteflies (Bemisia tabaci). '
          'Infected plants show severe stunting and fruit loss.',
      symptoms: [
        'Upward curling and yellowing of young leaves',
        'Interveinal yellowing (chlorosis)',
        'Plant stunting and bushy appearance',
        'Reduced fruit set and very low yield',
      ],
      cause:
          'Caused by Tomato yellow leaf curl virus (TYLCV), transmitted exclusively by '
          'the silverleaf whitefly (Bemisia tabaci). No chemical cure exists for infected plants.',
      actionNow: [
        'Remove and destroy infected plants immediately to prevent spread',
        'Apply insecticide to control whitefly population',
        'Install yellow sticky traps to monitor whitefly levels',
      ],
      prevention: [
        'Use TYLCV-resistant tomato varieties',
        'Control whitefly populations with neem oil or imidacloprid',
        'Use insect-proof nets over seedbeds',
        'Remove weed hosts near the field',
      ],
      treatment: [
        'No cure exists — remove infected plants',
        'Apply imidacloprid or spiromesifen to control whitefly vector',
      ],
      stageTreatments: [
        StageTreatment(
          stage: DiseaseStage.G0,
          label: 'Healthy',
          lesionPctMax: 0,
          emoji: '🟢',
          recommendations: [
            'No TYLCV detected. Monitor for whitefly regularly.',
            'Install yellow sticky traps to detect early whitefly infestation.',
            'Consider planting TYLCV-resistant varieties.',
          ],
        ),
        StageTreatment(
          stage: DiseaseStage.G1,
          label: 'Early / Mild',
          lesionPctMax: 15,
          emoji: '🟡',
          recommendations: [
            'Isolate suspected infected plants from healthy ones.',
            'Apply imidacloprid to kill the whitefly vector.',
            'Install reflective mulch to deter whiteflies.',
            'Do not save seed from potentially infected plants.',
          ],
        ),
        StageTreatment(
          stage: DiseaseStage.G2,
          label: 'Moderate',
          lesionPctMax: 40,
          emoji: '🟠',
          recommendations: [
            'Remove all infected plants from the field and burn them.',
            'Apply systemic insecticide (imidacloprid or thiamethoxam) to control whitefly spread.',
            'Replant with TYLCV-resistant varieties if early in the season.',
            'Consult your local agriculture office for approved whitefly control.',
          ],
        ),
        StageTreatment(
          stage: DiseaseStage.G3,
          label: 'Severe',
          lesionPctMax: 100,
          emoji: '🔴',
          recommendations: [
            'EMERGENCY: Remove and destroy the entire infected crop.',
            'Do not replant tomatoes in this field this season.',
            'Apply strong insecticide treatment to eliminate all remaining whiteflies.',
            'Fumigate the soil before replanting.',
            'Report severe whitefly outbreak to local agriculture department.',
          ],
        ),
      ],
    ),

    // ── Tomato Healthy ───────────────────────────────────────────────────
    DiseaseInfo(
      id: 'tomato-healthy',
      cropId: 'tomato',
      modelLabel: 'Tomato Healthy',
      name: 'Healthy Tomato Leaf',
      what:
          'This tomato leaf is healthy with no visible signs of disease, '
          'pests, or nutritional deficiency.',
      symptoms: ['No disease symptoms'],
      cause: 'No pathogen detected',
      actionNow: [
        'Maintain regular watering and fertilization',
        'Monitor weekly for any early disease signs',
      ],
      prevention: [
        'Use disease-resistant varieties',
        'Practice crop rotation',
        'Maintain proper plant spacing for air circulation',
      ],
      treatment: ['No treatment required — plant is healthy'],
      stageTreatments: [
        StageTreatment(
          stage: DiseaseStage.G0,
          label: 'Healthy',
          lesionPctMax: 0,
          emoji: '🟢',
          recommendations: [
            'Excellent! Your tomato plant is healthy.',
            'Continue weekly monitoring during wet seasons.',
            'Maintain balanced fertilization (N-P-K) for strong plant immunity.',
          ],
        ),
      ],
    ),
  ];

  /// Look up a disease by crop name + disease name
  static DiseaseInfo? getDiseaseByName(String crop, String disease) {
    final cropLower = crop.toLowerCase();
    final diseaseLower = disease.toLowerCase();
    try {
      return _diseases.firstWhere(
        (d) =>
            d.cropId.toLowerCase() == cropLower ||
            d.modelLabel.toLowerCase().contains(diseaseLower) ||
            diseaseLower.contains(d.id.split('-').last),
      );
    } catch (_) {
      return null;
    }
  }

  static List<DiseaseInfo> get all => _diseases;
}
