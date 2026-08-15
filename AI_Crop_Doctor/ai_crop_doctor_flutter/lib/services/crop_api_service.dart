// ════════════════════════════════════════════════════════════════════════════
// Crop API Service — AI Crop Doctor
// Mock mode when no server URL is set; real mode when BASE_URL is configured.
// ════════════════════════════════════════════════════════════════════════════

import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../data/models.dart';
import '../data/crops_data.dart';

class CropApiService extends ChangeNotifier {
  // Set this to your FastAPI server URL, e.g. "http://192.168.1.5:8000"
  // Leave empty to use mock mode.
  static const String _baseUrl = '';

  bool get useMock => _baseUrl.isEmpty;

  DiagnosisResult? _lastResult;
  List<HistoryEntry> _history = [];
  bool _loading = false;
  String? _error;

  DiagnosisResult? get lastResult => _lastResult;
  List<HistoryEntry> get history => _history;
  bool get loading => _loading;
  String? get error => _error;

  CropApiService() {
    _loadHistory();
  }

  // ─── History persistence ────────────────────────────────────────────────

  Future<void> _loadHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getStringList('history') ?? [];
    _history = raw
        .map((e) => HistoryEntry.fromJson(json.decode(e) as Map<String, dynamic>))
        .toList();
    notifyListeners();
  }

  Future<void> _saveHistory() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(
      'history',
      _history.map((e) => json.encode(e.toJson())).toList(),
    );
  }

  void _addToHistory(DiagnosisResult result) {
    final entry = HistoryEntry(
      id: 'h-${DateTime.now().millisecondsSinceEpoch}',
      date: result.diagnosedAt,
      crop: result.crop,
      disease: result.disease,
      confidence: result.confidence,
      stage: result.stage,
      lesionPct: result.lesionPct,
      imagePath: result.imagePath,
    );
    _history = [entry, ..._history];
    _saveHistory();
    notifyListeners();
  }

  void clearHistory() {
    _history = [];
    _saveHistory();
    notifyListeners();
  }

  // ─── Diagnosis ──────────────────────────────────────────────────────────

  Future<DiagnosisResult?> diagnose(File imageFile) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      DiagnosisResult result;
      if (useMock) {
        result = await _mockDiagnose(imageFile);
      } else {
        result = await _realDiagnose(imageFile);
      }
      _lastResult = result;
      _addToHistory(result);
      return result;
    } catch (e) {
      _error = e.toString();
      return null;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  // ─── Real FastAPI call ──────────────────────────────────────────────────

  Future<DiagnosisResult> _realDiagnose(File imageFile) async {
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$_baseUrl/diagnose'),
    );
    request.files.add(
      await http.MultipartFile.fromPath('image', imageFile.path),
    );
    final streamed = await request.send().timeout(const Duration(seconds: 30));
    final response = await http.Response.fromStream(streamed);

    if (response.statusCode != 200) {
      throw Exception('Server error: ${response.statusCode}');
    }

    final json = jsonDecode(response.body) as Map<String, dynamic>;
    return DiagnosisResult.fromJson(json, imagePath: imageFile.path);
  }

  // ─── Mock responses (same as web prototype) ─────────────────────────────

  Future<DiagnosisResult> _mockDiagnose(File imageFile) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 2500));

    final name = imageFile.path.toLowerCase();

    if (name.contains('cedarrust') || name.contains('cedar_apple_rust')) {
      return _build('Apple', 'Apple Cedar Rust', 0.982, 'G2', 28, imageFile.path, [
        Prediction(disease: 'Apple Cedar Rust', confidence: 0.982),
        Prediction(disease: 'Apple Scab', confidence: 0.012),
        Prediction(disease: 'Healthy Apple', confidence: 0.006),
      ]);
    }
    if (name.contains('applescab') || name.contains('apple_scab')) {
      return _build('Apple', 'Apple Scab', 0.954, 'G1', 9, imageFile.path, [
        Prediction(disease: 'Apple Scab', confidence: 0.954),
        Prediction(disease: 'Apple Cedar Rust', confidence: 0.038),
        Prediction(disease: 'Healthy Apple', confidence: 0.008),
      ]);
    }
    if (name.contains('commonrust') || name.contains('corn_rust')) {
      return _build('Corn', 'Corn Common Rust', 0.976, 'G3', 55, imageFile.path, [
        Prediction(disease: 'Corn Common Rust', confidence: 0.976),
        Prediction(disease: 'Healthy Corn', confidence: 0.024),
      ]);
    }
    if (name.contains('potatoearly') || name.contains('early_blight')) {
      return _build('Potato', 'Potato Early Blight', 0.942, 'G2', 32, imageFile.path, [
        Prediction(disease: 'Potato Early Blight', confidence: 0.942),
        Prediction(disease: 'Healthy Potato', confidence: 0.058),
      ]);
    }
    if (name.contains('yellowcurl') || name.contains('yellow_leaf_curl')) {
      return _build('Tomato', 'Tomato Yellow Leaf Curl Virus', 0.965, 'G3', 62, imageFile.path, [
        Prediction(disease: 'Tomato Yellow Leaf Curl Virus', confidence: 0.965),
        Prediction(disease: 'Early Blight', confidence: 0.021),
        Prediction(disease: 'Healthy Tomato', confidence: 0.014),
      ]);
    }
    if (name.contains('tomatohealthy') || name.contains('healthy_tomato')) {
      return _build('Tomato', 'Healthy Tomato Leaf', 0.985, 'G0', 0, imageFile.path, [
        Prediction(disease: 'Healthy Tomato Leaf', confidence: 0.985),
        Prediction(disease: 'Early Blight', confidence: 0.011),
        Prediction(disease: 'Late Blight', confidence: 0.004),
      ]);
    }

    // Default — Tomato Early Blight G2
    return _build('Tomato', 'Tomato Early Blight', 0.946, 'G2', 22, imageFile.path, [
      Prediction(disease: 'Tomato Early Blight', confidence: 0.946),
      Prediction(disease: 'Late Blight', confidence: 0.027),
      Prediction(disease: 'Leaf Mold', confidence: 0.014),
    ]);
  }

  DiagnosisResult _build(
    String crop,
    String disease,
    double confidence,
    String stageStr,
    double lesionPct,
    String imagePath,
    List<Prediction> predictions,
  ) {
    return DiagnosisResult(
      crop: crop,
      disease: disease,
      confidence: confidence,
      topPredictions: predictions,
      stage: DiseaseStageX.fromString(stageStr),
      lesionPct: lesionPct,
      model: 'MobileViT Small · Mock',
      imagePath: imagePath,
      diagnosedAt: DateTime.now(),
    );
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  DiseaseInfo? getDiseaseInfo(String crop, String disease) {
    return CropsData.getDiseaseByName(crop, disease);
  }
}
