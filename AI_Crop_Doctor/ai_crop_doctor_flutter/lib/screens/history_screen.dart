import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/crop_api_service.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final history = context.watch<CropApiService>().history;
    return Scaffold(
      appBar: AppBar(title: const Text('Scan History')),
      body: history.isEmpty
          ? const Center(child: Text('No scans yet. Diagnose your first crop!'))
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: history.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (ctx, i) {
                final e = history[i];
                return ListTile(
                  tileColor: Theme.of(context).cardColor,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  title: Text(e.disease),
                  subtitle: Text(e.crop),
                  trailing: Text(e.stage.name,
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                );
              },
            ),
    );
  }
}

class AssistantScreen extends StatelessWidget {
  const AssistantScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Crop Coach')),
      body: const Center(
        child: Text('Crop Coach AI assistant — coming soon!'),
      ),
    );
  }
}
