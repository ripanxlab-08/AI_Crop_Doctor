// ════════════════════════════════════════════════════════════════════════════
// AI Crop Doctor — Flutter Entry Point
// ════════════════════════════════════════════════════════════════════════════

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'theme/app_theme.dart';
import 'services/crop_api_service.dart';
import 'screens/splash_screen.dart';
import 'screens/home_screen.dart';
import 'screens/diagnose_screen.dart';
import 'screens/result_screen.dart';
import 'screens/history_screen.dart';
import 'screens/assistant_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CropApiService()),
      ],
      child: const AICropDoctorApp(),
    ),
  );
}

class AICropDoctorApp extends StatelessWidget {
  const AICropDoctorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AI Crop Doctor',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: ThemeMode.system,
      initialRoute: '/',
      routes: {
        '/': (ctx) => const SplashScreen(),
        '/home': (ctx) => const HomeScreen(),
        '/diagnose': (ctx) => const DiagnoseScreen(),
        '/result': (ctx) => const ResultScreen(),
        '/history': (ctx) => const HistoryScreen(),
        '/assistant': (ctx) => const AssistantScreen(),
      },
    );
  }
}
