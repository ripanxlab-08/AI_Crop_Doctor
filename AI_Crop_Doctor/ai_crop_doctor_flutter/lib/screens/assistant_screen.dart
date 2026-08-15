import 'package:flutter/material.dart';

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
