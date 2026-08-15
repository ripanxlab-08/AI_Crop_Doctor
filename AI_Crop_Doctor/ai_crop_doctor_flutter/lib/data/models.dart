// ════════════════════════════════════════════════════════════════════════════
// Data Models — AI Crop Doctor
// ════════════════════════════════════════════════════════════════════════════

/// G0 = Healthy, G1 = Mild, G2 = Moderate, G3 = Severe
enum DiseaseStage { G0, G1, G2, G3 }

extension DiseaseStageX on DiseaseStage {
  String get name {
    switch (this) {
      case DiseaseStage.G0:
        return 'G0';
      case DiseaseStage.G1:
        return 'G1';
      case DiseaseStage.G2:
        return 'G2';
      case DiseaseStage.G3:
        return 'G3';
    }
  }

  String get label {
    switch (this) {
      case DiseaseStage.G0:
        return 'Healthy';
      case DiseaseStage.G1:
        return 'Early / Mild';
      case DiseaseStage.G2:
        return 'Moderate';
      case DiseaseStage.G3:
        return 'Severe';
    }
  }

  String get emoji {
    switch (this) {
      case DiseaseStage.G0:
        return '🟢';
      case DiseaseStage.G1:
        return '🟡';
      case DiseaseStage.G2:
        return '🟠';
      case DiseaseStage.G3:
        return '🔴';
    }
  }

  static DiseaseStage fromLesionPct(double pct) {
    if (pct == 0) return DiseaseStage.G0;
    if (pct <= 15) return DiseaseStage.G1;
    if (pct <= 40) return DiseaseStage.G2;
    return DiseaseStage.G3;
  }

  static DiseaseStage fromString(String s) {
    switch (s.toUpperCase()) {
      case 'G0':
        return DiseaseStage.G0;
      case 'G1':
        return DiseaseStage.G1;
      case 'G2':
        return DiseaseStage.G2;
      case 'G3':
        return DiseaseStage.G3;
      default:
        return DiseaseStage.G1;
    }
  }
}

/// Stage-specific treatment recommendation
class StageTreatment {
  final DiseaseStage stage;
  final String label;
  final double lesionPctMax;
  final String emoji;
  final List<String> recommendations;

  const StageTreatment({
    required this.stage,
    required this.label,
    required this.lesionPctMax,
    required this.emoji,
    required this.recommendations,
  });
}

/// A single disease entry in the knowledge base
class DiseaseInfo {
  final String id;
  final String cropId;
  final String modelLabel;
  final String name;
  final String what;
  final List<String> symptoms;
  final String cause;
  final List<String> actionNow;
  final List<String> prevention;
  final List<String> treatment;
  final List<StageTreatment> stageTreatments;

  const DiseaseInfo({
    required this.id,
    required this.cropId,
    required this.modelLabel,
    required this.name,
    required this.what,
    required this.symptoms,
    required this.cause,
    required this.actionNow,
    required this.prevention,
    required this.treatment,
    required this.stageTreatments,
  });

  StageTreatment? getStageTreatment(DiseaseStage stage) {
    try {
      return stageTreatments.firstWhere((s) => s.stage == stage);
    } catch (_) {
      return null;
    }
  }
}

/// The result returned after a diagnosis API call
class DiagnosisResult {
  final String crop;
  final String disease;
  final double confidence;
  final List<Prediction> topPredictions;
  final DiseaseStage stage;
  final double lesionPct;
  final String model;
  final String imagePath; // local path on device
  final DateTime diagnosedAt;

  DiagnosisResult({
    required this.crop,
    required this.disease,
    required this.confidence,
    required this.topPredictions,
    required this.stage,
    required this.lesionPct,
    required this.model,
    required this.imagePath,
    required this.diagnosedAt,
  });

  factory DiagnosisResult.fromJson(
    Map<String, dynamic> json, {
    required String imagePath,
  }) {
    return DiagnosisResult(
      crop: json['crop'] as String,
      disease: json['disease'] as String,
      confidence: (json['confidence'] as num).toDouble(),
      topPredictions: (json['top_predictions'] as List)
          .map((e) => Prediction.fromJson(e as Map<String, dynamic>))
          .toList(),
      stage: DiseaseStageX.fromString(json['stage'] as String? ?? 'G1'),
      lesionPct: (json['lesion_pct'] as num?)?.toDouble() ?? 0.0,
      model: json['model'] as String? ?? 'MobileViT Small',
      imagePath: imagePath,
      diagnosedAt: DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
        'crop': crop,
        'disease': disease,
        'confidence': confidence,
        'stage': stage.name,
        'lesionPct': lesionPct,
        'model': model,
        'imagePath': imagePath,
        'diagnosedAt': diagnosedAt.toIso8601String(),
      };
}

class Prediction {
  final String disease;
  final double confidence;

  const Prediction({required this.disease, required this.confidence});

  factory Prediction.fromJson(Map<String, dynamic> json) => Prediction(
        disease: json['disease'] as String,
        confidence: (json['confidence'] as num).toDouble(),
      );
}

/// A saved history entry
class HistoryEntry {
  final String id;
  final DateTime date;
  final String crop;
  final String disease;
  final double confidence;
  final DiseaseStage stage;
  final double lesionPct;
  final String imagePath;

  HistoryEntry({
    required this.id,
    required this.date,
    required this.crop,
    required this.disease,
    required this.confidence,
    required this.stage,
    required this.lesionPct,
    required this.imagePath,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'date': date.toIso8601String(),
        'crop': crop,
        'disease': disease,
        'confidence': confidence,
        'stage': stage.name,
        'lesionPct': lesionPct,
        'imagePath': imagePath,
      };

  factory HistoryEntry.fromJson(Map<String, dynamic> json) => HistoryEntry(
        id: json['id'] as String,
        date: DateTime.parse(json['date'] as String),
        crop: json['crop'] as String,
        disease: json['disease'] as String,
        confidence: (json['confidence'] as num).toDouble(),
        stage: DiseaseStageX.fromString(json['stage'] as String? ?? 'G1'),
        lesionPct: (json['lesionPct'] as num?)?.toDouble() ?? 0.0,
        imagePath: json['imagePath'] as String? ?? '',
      );
}
