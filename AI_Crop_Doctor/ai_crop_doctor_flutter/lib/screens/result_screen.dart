// ════════════════════════════════════════════════════════════════════════════
// Result Screen — Disease name, Confidence, G0-G3 Stage Panel, Treatment
// ════════════════════════════════════════════════════════════════════════════

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:percent_indicator/linear_percent_indicator.dart';
import 'package:provider/provider.dart';

import '../data/models.dart';
import '../services/crop_api_service.dart';
import '../theme/app_theme.dart';

class ResultScreen extends StatefulWidget {
  final DiagnosisResult result;
  const ResultScreen({super.key, required this.result});

  @override
  State<ResultScreen> createState() => _ResultScreenState();
}

class _ResultScreenState extends State<ResultScreen>
    with TickerProviderStateMixin {
  late final AnimationController _barController;
  late final Animation<double> _barAnim;

  final FlutterTts _tts = FlutterTts();
  bool _speaking = false;

  @override
  void initState() {
    super.initState();
    _barController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _barAnim = CurvedAnimation(
      parent: _barController,
      curve: Curves.easeOutCubic,
    );

    // Start bar animation after short delay
    Future.delayed(const Duration(milliseconds: 300), () {
      if (mounted) _barController.forward();
    });

    _tts.setCompletionHandler(() => setState(() => _speaking = false));
  }

  @override
  void dispose() {
    _barController.dispose();
    _tts.stop();
    super.dispose();
  }

  // ─── TTS ─────────────────────────────────────────────────────────────

  Future<void> _toggleSpeech() async {
    if (_speaking) {
      await _tts.stop();
      setState(() => _speaking = false);
      return;
    }

    final r = widget.result;
    final service = context.read<CropApiService>();
    final info = service.getDiseaseInfo(r.crop, r.disease);
    final stage = r.stage;
    final stageTreatment = info?.getStageTreatment(stage);

    final text = [
      '${r.crop} leaf diagnosed with ${info?.name ?? r.disease}.',
      'Confidence: ${(r.confidence * 100).toStringAsFixed(0)} percent.',
      'Disease stage: ${stage.name}, ${stage.label}. Lesion area: ${r.lesionPct.toStringAsFixed(0)} percent.',
      if (info?.what != null) 'Description: ${info!.what}',
      if (stageTreatment != null)
        'Stage ${stage.name} treatment: ${stageTreatment.recommendations.join(". ")}.',
    ].join(' ');

    await _tts.setSpeechRate(0.5);
    await _tts.speak(text);
    setState(() => _speaking = true);
  }

  // ─── Build ────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final r = widget.result;
    final service = context.read<CropApiService>();
    final info = service.getDiseaseInfo(r.crop, r.disease);
    final stage = r.stage;
    final stageTreatment = info?.getStageTreatment(stage);
    final stageColor = AppTheme.stageColor(stage.name);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Diagnosis Result'),
        subtitle: Text(r.model,
            style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ── Leaf image + disease name ──
          _buildImageCard(r, stageColor),
          const SizedBox(height: 16),

          // ── Confidence bar ──
          _buildConfidenceCard(r),
          const SizedBox(height: 16),

          // ── Top predictions ──
          _buildPredictionsCard(r),
          const SizedBox(height: 16),

          // ── Voice button ──
          _buildVoiceRow(),
          const SizedBox(height: 16),

          // ── G0-G3 Stage Panel ──
          if (stageTreatment != null)
            _buildStagePanel(stage, r.lesionPct, stageTreatment, stageColor),
          const SizedBox(height: 16),

          // ── Disease detail cards ──
          if (info != null) ...[
            _InfoCard(
              icon: Icons.info_outline_rounded,
              title: 'What is it?',
              child: Text(info.what,
                  style: const TextStyle(fontSize: 14, height: 1.6)),
            ),
            const SizedBox(height: 12),
            _InfoCard(
              icon: Icons.eco_rounded,
              title: 'Symptoms',
              child: _BulletList(items: info.symptoms),
            ),
            const SizedBox(height: 12),
            _InfoCard(
              icon: Icons.bug_report_rounded,
              title: 'Cause',
              child: Text(info.cause,
                  style: const TextStyle(fontSize: 14, height: 1.6)),
            ),
            const SizedBox(height: 12),
            _InfoCard(
              icon: Icons.alarm_rounded,
              title: 'Act Now',
              child: _BulletList(items: info.actionNow),
            ),
            const SizedBox(height: 12),
            _InfoCard(
              icon: Icons.shield_outlined,
              title: 'Prevention',
              child: _BulletList(items: info.prevention),
            ),
            const SizedBox(height: 12),
            _InfoCard(
              icon: Icons.medical_services_outlined,
              title: 'Treatment',
              child: _BulletList(items: info.treatment),
            ),
            const SizedBox(height: 24),
          ],
        ],
      ),
    );
  }

  // ─── Image card ──────────────────────────────────────────────────────

  Widget _buildImageCard(DiagnosisResult r, Color stageColor) {
    final imageFile = File(r.imagePath);
    return Card(
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (imageFile.existsSync())
            AspectRatio(
              aspectRatio: 4 / 3,
              child: Image.file(imageFile, fit: BoxFit.cover),
            ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.primarySoft,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        '🌿 ${r.crop}',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.primaryGreen,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  r.disease,
                  style: GoogleFonts.outfit(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ─── Confidence card ─────────────────────────────────────────────────

  Widget _buildConfidenceCard(DiagnosisResult r) {
    final pct = r.confidence;
    final color = pct >= 0.85
        ? AppTheme.stageG0
        : pct >= 0.65
            ? AppTheme.stageG1
            : AppTheme.stageG3;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Confidence',
                style:
                    TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: AnimatedBuilder(
                    animation: _barAnim,
                    builder: (_, __) => LinearPercentIndicator(
                      lineHeight: 12,
                      percent: pct * _barAnim.value,
                      backgroundColor: Colors.grey.shade200,
                      progressColor: color,
                      barRadius: const Radius.circular(6),
                      padding: EdgeInsets.zero,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  '${(pct * 100).toStringAsFixed(1)}%',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: color,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ─── Top predictions ─────────────────────────────────────────────────

  Widget _buildPredictionsCard(DiagnosisResult r) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Top Predictions',
                style:
                    TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ...r.topPredictions.asMap().entries.map((entry) {
              final i = entry.key;
              final p = entry.value;
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            p.disease,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: i == 0
                                  ? FontWeight.bold
                                  : FontWeight.normal,
                            ),
                          ),
                        ),
                        Text(
                          '${(p.confidence * 100).toStringAsFixed(1)}%',
                          style: TextStyle(
                            color: Colors.grey.shade600,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    AnimatedBuilder(
                      animation: _barAnim,
                      builder: (_, __) => LinearPercentIndicator(
                        lineHeight: 8,
                        percent: p.confidence * _barAnim.value,
                        backgroundColor: Colors.grey.shade100,
                        progressColor: i == 0
                            ? AppTheme.primaryGreen
                            : Colors.grey.shade400,
                        barRadius: const Radius.circular(4),
                        padding: EdgeInsets.zero,
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  // ─── Voice row ───────────────────────────────────────────────────────

  Widget _buildVoiceRow() {
    return Row(
      children: [
        Expanded(
          child: FilledButton.icon(
            onPressed: _toggleSpeech,
            icon: Icon(_speaking ? Icons.stop_circle : Icons.volume_up_rounded),
            label: Text(_speaking ? 'Stop' : 'Listen to this'),
            style: FilledButton.styleFrom(
              backgroundColor:
                  _speaking ? Colors.red : AppTheme.primaryGreen,
              minimumSize: const Size(0, 52),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () => Navigator.pushNamed(context, '/assistant'),
            icon: const Icon(Icons.smart_toy_outlined),
            label: const Text('Crop Coach'),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(0, 52),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
          ),
        ),
      ],
    );
  }

  // ─── G0-G3 Stage Panel ───────────────────────────────────────────────

  Widget _buildStagePanel(
    DiseaseStage stage,
    double lesionPct,
    StageTreatment treatment,
    Color stageColor,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: stageColor.withOpacity(0.08),
        border: Border.all(color: stageColor.withOpacity(0.35)),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Text(treatment.emoji, style: const TextStyle(fontSize: 24)),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'DISEASE STAGE',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.2,
                        color: Colors.grey,
                      ),
                    ),
                    Text(
                      '${stage.name} — ${stage.label}',
                      style: GoogleFonts.outfit(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: stageColor,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: stageColor,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  stage.name,
                  style: TextStyle(
                    color: stage == DiseaseStage.G1
                        ? Colors.black
                        : Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1,
                  ),
                ),
              ),
            ],
          ),

          // Lesion % bar
          if (stage != DiseaseStage.G0) ...[
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Leaf Lesion Area',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
                Text(
                  '${lesionPct.toStringAsFixed(0)}%',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                    color: stageColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            AnimatedBuilder(
              animation: _barAnim,
              builder: (_, __) => LinearPercentIndicator(
                lineHeight: 14,
                percent: (lesionPct / 100) * _barAnim.value,
                backgroundColor: Colors.grey.shade200,
                progressColor: stageColor,
                barRadius: const Radius.circular(7),
                padding: EdgeInsets.zero,
              ),
            ),
            const SizedBox(height: 4),
            // Markers
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Text('0%', style: TextStyle(fontSize: 10, color: Colors.grey)),
                Text('15%', style: TextStyle(fontSize: 10, color: Colors.grey)),
                Text('40%', style: TextStyle(fontSize: 10, color: Colors.grey)),
                Text('100%', style: TextStyle(fontSize: 10, color: Colors.grey)),
              ],
            ),
            const SizedBox(height: 8),
            // Stage marker pills
            Row(
              children: ['G0', 'G1', 'G2', 'G3'].map((s) {
                final isActive = s == stage.name;
                final c = AppTheme.stageColor(s);
                return Expanded(
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    margin: const EdgeInsets.symmetric(horizontal: 2),
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    decoration: BoxDecoration(
                      color: isActive ? c : Colors.grey.shade200,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      s,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: isActive
                            ? (s == 'G1' ? Colors.black : Colors.white)
                            : Colors.grey.shade500,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],

          const SizedBox(height: 16),

          // Treatment recommendations
          Text(
            stage == DiseaseStage.G0
                ? '✅ Status'
                : '🌿 Stage ${stage.name} Treatment',
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.8,
              color: Colors.grey,
            ),
          ),
          const SizedBox(height: 10),
          ...treatment.recommendations.asMap().entries.map((entry) {
            final i = entry.key;
            final rec = entry.value;
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 22,
                    height: 22,
                    decoration: BoxDecoration(
                      color: stageColor,
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        '${i + 1}',
                        style: TextStyle(
                          color: stage == DiseaseStage.G1
                              ? Colors.black
                              : Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      rec,
                      style: const TextStyle(fontSize: 13, height: 1.5),
                    ),
                  ),
                ],
              ),
            );
          }),

          // G3 emergency warning
          if (stage == DiseaseStage.G3) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.stageG3.withOpacity(0.1),
                border: Border.all(
                    color: AppTheme.stageG3.withOpacity(0.3)),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: const [
                  Icon(Icons.warning_amber_rounded,
                      color: AppTheme.stageG3, size: 20),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Severe infection — act immediately and contact your local agriculture officer.',
                      style: TextStyle(
                          color: AppTheme.stageG3,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// ─── Reusable info card widget ────────────────────────────────────────────

class _InfoCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final Widget child;

  const _InfoCard({
    required this.icon,
    required this.title,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: AppTheme.primarySoft,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon,
                      color: AppTheme.primaryGreen, size: 20),
                ),
                const SizedBox(width: 10),
                Text(title,
                    style: const TextStyle(
                        fontSize: 14, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 12),
            child,
          ],
        ),
      ),
    );
  }
}

class _BulletList extends StatelessWidget {
  final List<String> items;
  const _BulletList({required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: items
          .map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    margin: const EdgeInsets.only(top: 6),
                    width: 6,
                    height: 6,
                    decoration: const BoxDecoration(
                      color: AppTheme.primaryGreen,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(item,
                        style: const TextStyle(fontSize: 13, height: 1.5)),
                  ),
                ],
              ),
            ),
          )
          .toList(),
    );
  }
}
