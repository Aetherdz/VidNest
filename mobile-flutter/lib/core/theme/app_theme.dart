import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_radius.dart';
import 'app_spacing.dart';

abstract final class AppTheme {
  static ThemeData light() {
    const custom = VidNestColors.light;
    final colorScheme = ColorScheme(
      brightness: Brightness.light,
      primary: custom.primary,
      onPrimary: custom.text,
      primaryContainer: custom.primaryTint,
      onPrimaryContainer: custom.text,
      secondary: custom.primary,
      onSecondary: custom.text,
      surface: custom.surface,
      onSurface: custom.text,
      surfaceContainerLowest: custom.bg,
      surfaceContainerLow: custom.surfaceSubtle,
      surfaceContainer: custom.surface,
      outline: custom.border,
      outlineVariant: custom.border.withValues(alpha: 0.5),
      error: const Color(0xFFDC2626),
      onError: Colors.white,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: custom.bg,
      extensions: const [custom],
      fontFamily: 'IBMPlexSansArabic',
      textTheme: const TextTheme(
        headlineSmall:
            TextStyle(fontSize: 28, height: 1.25, fontWeight: FontWeight.w700),
        titleLarge:
            TextStyle(fontSize: 28, height: 1.25, fontWeight: FontWeight.w700),
        titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        bodyLarge: TextStyle(fontSize: 16, height: 1.5),
        bodyMedium: TextStyle(fontSize: 16, height: 1.5),
        bodySmall: TextStyle(fontSize: 13, height: 1.45),
        labelMedium: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
      ).apply(fontFamily: 'IBMPlexSansArabic'),
      appBarTheme: AppBarTheme(
        backgroundColor: custom.bg,
        foregroundColor: custom.text,
        elevation: 0,
        centerTitle: false,
        scrolledUnderElevation: 0,
      ),
      cardTheme: CardThemeData(
        color: custom.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.radiusMd,
          side: BorderSide(color: custom.border, width: 1),
        ),
        margin: EdgeInsets.zero,
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: custom.primary,
          foregroundColor: custom.text,
          minimumSize: const Size(0, 56),
          padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
          shape: AppRadius.shapeLg,
          textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: custom.text,
          side: BorderSide(color: custom.border, width: 1),
          minimumSize: const Size(0, 48),
          padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
          shape: AppRadius.shapeMd,
          textStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 16),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: custom.surfaceSubtle,
        selectedColor: custom.primaryTint,
        side: BorderSide(color: custom.border, width: 1),
        shape: AppRadius.shapePill,
        labelStyle: TextStyle(
            color: custom.text, fontSize: 13, fontWeight: FontWeight.w500),
        padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
      ),
      listTileTheme: ListTileThemeData(
        tileColor: custom.surface,
        contentPadding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md, vertical: AppSpacing.xs),
        shape: AppRadius.shapeSm,
        textColor: custom.text,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: custom.surface,
        contentPadding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md, vertical: AppSpacing.md),
        border: OutlineInputBorder(
          borderRadius: AppRadius.radiusMd,
          borderSide: BorderSide(color: custom.border, width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppRadius.radiusMd,
          borderSide: BorderSide(color: custom.border, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppRadius.radiusMd,
          borderSide: BorderSide(color: custom.primary, width: 1.5),
        ),
        hintStyle: TextStyle(color: custom.textSecondary, fontSize: 13),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: custom.surface,
        indicatorColor: custom.primary,
        elevation: 0,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return TextStyle(
                color: custom.text, fontWeight: FontWeight.w600, fontSize: 13);
          }
          return TextStyle(
              color: custom.textSecondary,
              fontWeight: FontWeight.w500,
              fontSize: 13);
        }),
      ),
    );
  }

  static ThemeData dark() {
    const custom = VidNestColors.dark;
    final colorScheme = ColorScheme(
      brightness: Brightness.dark,
      primary: custom.primary,
      onPrimary: custom.text,
      primaryContainer: custom.primaryTint,
      onPrimaryContainer: custom.text,
      secondary: custom.primary,
      onSecondary: custom.text,
      surface: custom.surface,
      onSurface: custom.text,
      surfaceContainerLowest: custom.bg,
      surfaceContainerLow: custom.surfaceSubtle,
      surfaceContainer: custom.surface,
      outline: custom.border,
      outlineVariant: custom.border.withValues(alpha: 0.5),
      error: const Color(0xFFEF4444),
      onError: Colors.white,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: custom.bg,
      extensions: const [custom],
      fontFamily: 'IBMPlexSansArabic',
      textTheme: const TextTheme(
        headlineSmall:
            TextStyle(fontSize: 28, height: 1.25, fontWeight: FontWeight.w700),
        titleLarge:
            TextStyle(fontSize: 28, height: 1.25, fontWeight: FontWeight.w700),
        titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        bodyLarge: TextStyle(fontSize: 16, height: 1.5),
        bodyMedium: TextStyle(fontSize: 16, height: 1.5),
        bodySmall: TextStyle(fontSize: 13, height: 1.45),
        labelMedium: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
      ).apply(fontFamily: 'IBMPlexSansArabic'),
      appBarTheme: AppBarTheme(
        backgroundColor: custom.bg,
        foregroundColor: custom.text,
        elevation: 0,
        centerTitle: false,
        scrolledUnderElevation: 0,
      ),
      cardTheme: CardThemeData(
        color: custom.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.radiusMd,
          side: BorderSide(color: custom.border, width: 1),
        ),
        margin: EdgeInsets.zero,
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: custom.primary,
          foregroundColor: custom.text,
          minimumSize: const Size(0, 56),
          padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
          shape: AppRadius.shapeLg,
          textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: custom.text,
          side: BorderSide(color: custom.border, width: 1),
          minimumSize: const Size(0, 48),
          padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
          shape: AppRadius.shapeMd,
          textStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 16),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: custom.surfaceSubtle,
        selectedColor: custom.primaryTint,
        side: BorderSide(color: custom.border, width: 1),
        shape: AppRadius.shapePill,
        labelStyle: TextStyle(
            color: custom.text, fontSize: 13, fontWeight: FontWeight.w500),
        padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
      ),
      listTileTheme: ListTileThemeData(
        tileColor: custom.surface,
        contentPadding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md, vertical: AppSpacing.xs),
        shape: AppRadius.shapeSm,
        textColor: custom.text,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: custom.surface,
        contentPadding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md, vertical: AppSpacing.md),
        border: OutlineInputBorder(
          borderRadius: AppRadius.radiusMd,
          borderSide: BorderSide(color: custom.border, width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppRadius.radiusMd,
          borderSide: BorderSide(color: custom.border, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppRadius.radiusMd,
          borderSide: BorderSide(color: custom.primary, width: 1.5),
        ),
        hintStyle: TextStyle(color: custom.textSecondary, fontSize: 13),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: custom.surface,
        indicatorColor: custom.primary,
        elevation: 0,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return TextStyle(
                color: custom.text, fontWeight: FontWeight.w600, fontSize: 13);
          }
          return TextStyle(
              color: custom.textSecondary,
              fontWeight: FontWeight.w500,
              fontSize: 13);
        }),
      ),
    );
  }
}
