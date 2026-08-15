// ════════════════════════════════════════════════════════════════════════════
// Home Screen — AI Crop Doctor
// ════════════════════════════════════════════════════════════════════════════

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../services/crop_api_service.dart';
import '../theme/app_theme.dart';
import '../data/models.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final service = context.watch<CropApiService>();
    final history = service.history;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // App bar
          SliverAppBar(
            expandedHeight: 160,
            floating: false,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: Text('AI Crop Doctor',
                  style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      AppTheme.primaryGreen,
                      Color(0xFF1B5E3A),
                    ],
                  ),
                ),
                child: const Center(
                  child: Text('🌿', style: TextStyle(fontSize: 64)),
                ),
              ),
            ),
          ),

          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // Quick diagnose card
                _DiagnoseCard(),
                const SizedBox(height: 20),

                // Stats row
                _StatsRow(history: history),
                const SizedBox(height: 20),

                // Recent history
                if (history.isNotEmpty) ...[
                  Text('Recent Scans',
                      style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 12),
                  ...history
                      .take(3)
                      .map((e) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: _HistoryCard(entry: e),
                          ))
                      .toList(),
                  if (history.length > 3)
                    TextButton(
                      onPressed: () =>
                          Navigator.pushNamed(context, '/history'),
                      child: const Text('View all history →'),
                    ),
                ],
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _DiagnoseCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      color: AppTheme.primaryGreen,
      child: InkWell(
        onTap: () => Navigator.pushNamed(context, '/diagnose'),
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Diagnose a Crop',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'Take a photo or upload from gallery to detect diseases',
                      style: TextStyle(color: Colors.white70, fontSize: 13),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.camera_alt_rounded,
                    color: Colors.white, size: 28),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatsRow extends StatelessWidget {
  final List<HistoryEntry> history;
  const _StatsRow({required this.history});

  @override
  Widget build(BuildContext context) {
    final total = history.length;
    final healthy = history.where((e) => e.stage == DiseaseStage.G0).length;
    final severe = history.where((e) => e.stage == DiseaseStage.G3).length;

    return Row(
      children: [
        _StatBox(label: 'Total Scans', value: '$total', color: AppTheme.primaryGreen),
        const SizedBox(width: 10),
        _StatBox(label: 'Healthy', value: '$healthy', color: AppTheme.stageG0),
        const SizedBox(width: 10),
        _StatBox(label: 'Severe (G3)', value: '$severe', color: AppTheme.stageG3),
      ],
    );
  }
}

class _StatBox extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _StatBox({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
          child: Column(
            children: [
              Text(value,
                  style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                      color: color)),
              const SizedBox(height: 4),
              Text(label,
                  style: const TextStyle(fontSize: 11, color: Colors.grey),
                  textAlign: TextAlign.center),
            ],
          ),
        ),
      ),
    );
  }
}

class _HistoryCard extends StatelessWidget {
  final HistoryEntry entry;
  const _HistoryCard({required this.entry});

  @override
  Widget build(BuildContext context) {
    final stageColor = AppTheme.stageColor(entry.stage.name);
    final hasImage = entry.imagePath.isNotEmpty &&
        File(entry.imagePath).existsSync();

    return Card(
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: SizedBox(
            width: 52,
            height: 52,
            child: hasImage
                ? Image.file(File(entry.imagePath), fit: BoxFit.cover)
                : Container(
                    color: AppTheme.primarySoft,
                    child: const Icon(Icons.eco_rounded,
                        color: AppTheme.primaryGreen)),
          ),
        ),
        title: Text(entry.disease,
            style:
                const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
        subtitle: Text(entry.crop,
            style: const TextStyle(fontSize: 11, color: Colors.grey)),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: stageColor,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                entry.stage.name,
                style: TextStyle(
                  color: entry.stage == DiseaseStage.G1
                      ? Colors.black
                      : Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${(entry.confidence * 100).toStringAsFixed(0)}%',
              style: const TextStyle(fontSize: 11, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}
