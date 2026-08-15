// ════════════════════════════════════════════════════════════════════════════
// App Theme — AI Crop Doctor
// ════════════════════════════════════════════════════════════════════════════

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand colors
  static const Color primaryGreen = Color(0xFF2D7A4F);
  static const Color primaryGreenLight = Color(0xFF4CAF72);
  static const Color primarySoft = Color(0xFFE8F5EE);

  static const Color stageG0 = Color(0xFF22C55E); // healthy green
  static const Color stageG1 = Color(0xFFF59E0B); // warning yellow
  static const Color stageG2 = Color(0xFFF97316); // orange
  static const Color stageG3 = Color(0xFFEF4444); // danger red

  static const Color backgroundLight = Color(0xFFF5F7F2);
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color backgroundDark = Color(0xFF0F1A14);
  static const Color surfaceDark = Color(0xFF1A2B20);

  static TextTheme _textTheme() {
    return GoogleFonts.outfitTextTheme().copyWith(
      displayLarge: GoogleFonts.outfit(
        fontSize: 32,
        fontWeight: FontWeight.bold,
        letterSpacing: -0.5,
      ),
      titleLarge: GoogleFonts.outfit(
        fontSize: 20,
        fontWeight: FontWeight.bold,
      ),
      bodyLarge: GoogleFonts.outfit(fontSize: 16),
      bodyMedium: GoogleFonts.outfit(fontSize: 14),
      labelSmall: GoogleFonts.outfit(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.8,
      ),
    );
  }

  static ThemeData light() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryGreen,
        brightness: Brightness.light,
        primary: primaryGreen,
        onPrimary: Colors.white,
        surface: surfaceLight,
        onSurface: const Color(0xFF1A2B20),
        background: backgroundLight,
      ),
      textTheme: _textTheme(),
      appBarTheme: AppBarTheme(
        backgroundColor: surfaceLight,
        foregroundColor: const Color(0xFF1A2B20),
        elevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.outfit(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: const Color(0xFF1A2B20),
        ),
      ),
      cardTheme: CardThemeData(
        color: surfaceLight,
        elevation: 2,
        shadowColor: Colors.black.withOpacity(0.08),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: primaryGreen,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 56),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: GoogleFonts.outfit(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      scaffoldBackgroundColor: backgroundLight,
    );
  }

  static ThemeData dark() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryGreen,
        brightness: Brightness.dark,
        primary: primaryGreenLight,
        onPrimary: Colors.black,
        surface: surfaceDark,
        onSurface: const Color(0xFFE8F5EE),
        background: backgroundDark,
      ),
      textTheme: _textTheme(),
      appBarTheme: AppBarTheme(
        backgroundColor: surfaceDark,
        foregroundColor: const Color(0xFFE8F5EE),
        elevation: 0,
        titleTextStyle: GoogleFonts.outfit(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: const Color(0xFFE8F5EE),
        ),
      ),
      cardTheme: CardThemeData(
        color: surfaceDark,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: primaryGreenLight,
          foregroundColor: Colors.black,
          minimumSize: const Size(double.infinity, 56),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
      scaffoldBackgroundColor: backgroundDark,
    );
  }

  /// Returns the color for a given stage G0-G3
  static Color stageColor(String stage) {
    switch (stage) {
      case 'G0':
        return stageG0;
      case 'G1':
        return stageG1;
      case 'G2':
        return stageG2;
      case 'G3':
        return stageG3;
      default:
        return stageG1;
    }
  }

  static String stageLabel(String stage) {
    switch (stage) {
      case 'G0':
        return 'Healthy';
      case 'G1':
        return 'Early / Mild';
      case 'G2':
        return 'Moderate';
      case 'G3':
        return 'Severe';
      default:
        return stage;
    }
  }

  static String stageEmoji(String stage) {
    switch (stage) {
      case 'G0':
        return '🟢';
      case 'G1':
        return '🟡';
      case 'G2':
        return '🟠';
      case 'G3':
        return '🔴';
      default:
        return '🟡';
    }
  }
}
