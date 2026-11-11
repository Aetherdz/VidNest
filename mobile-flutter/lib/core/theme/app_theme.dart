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
      onPrimary: Colors.white,
      primaryContainer: custom.primaryTint,
      onPrimaryContainer: custom.primaryDark,
      secondary: custom.primaryDark,
      onSecondary: Colors.white,
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
      fontFamily: 'ReadexPro',
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
          foregroundColor: Colors.white,
          minimumSize: const Size(0, 48),
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
          shape: AppRadius.shapeSm,
          textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: custom.text,
          side: BorderSide(color: custom.border, width: 1),
          minimumSize: const Size(0, 48),
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
          shape: AppRadius.shapeSm,
          textStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 15),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: custom.surfaceSubtle,
        selectedColor: custom.primaryTint,
        side: BorderSide(color: custom.border, width: 1),
        shape: AppRadius.shapePill,
        labelStyle: TextStyle(color: custom.text, fontSize: 13, fontWeight: FontWeight.w500),
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
      ),
      listTileTheme: ListTileThemeData(
        tileColor: custom.surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs),
        shape: AppRadius.shapeSm,
        textColor: custom.text,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: custom.surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.md),
        border: OutlineInputBorder(
          borderRadius: AppRadius.radiusSm,
          borderSide: BorderSide(color: custom.border, width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppRadius.radiusSm,
          borderSide: BorderSide(color: custom.border, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppRadius.radiusSm,
          borderSide: BorderSide(color: custom.primary, width: 1.5),
        ),
        hintStyle: TextStyle(color: custom.textSecondary, fontSize: 14),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: custom.surface,
        indicatorColor: custom.primaryTint,
        elevation: 0,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return TextStyle(color: custom.primaryDark, fontWeight: FontWeight.w600, fontSize: 12);
          }
          return TextStyle(color: custom.textSecondary, fontWeight: FontWeight.w500, fontSize: 12);
        }),
      ),
    );
  }

  static ThemeData dark() {
    const custom = VidNestColors.dark;
    final colorScheme = ColorScheme(
      brightness: Brightness.dark,
      primary: custom.primary,
      onPrimary: Colors.white,
      primaryContainer: custom.primaryTint,
      onPrimaryContainer: Colors.white,
      secondary: custom.primaryDark,
      onSecondary: Colors.white,
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
      fontFamily: 'ReadexPro',
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
          foregroundColor: Colors.white,
          minimumSize: const Size(0, 48),
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
          shape: AppRadius.shapeSm,
          textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: custom.text,
          side: BorderSide(color: custom.border, width: 1),
          minimumSize: const Size(0, 48),
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
          shape: AppRadius.shapeSm,
          textStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 15),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: custom.surfaceSubtle,
        selectedColor: custom.primaryTint,
        side: BorderSide(color: custom.border, width: 1),
        shape: AppRadius.shapePill,
        labelStyle: TextStyle(color: custom.text, fontSize: 13, fontWeight: FontWeight.w500),
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
      ),
      listTileTheme: ListTileThemeData(
        tileColor: custom.surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs),
        shape: AppRadius.shapeSm,
        textColor: custom.text,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: custom.surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.md),
        border: OutlineInputBorder(
          borderRadius: AppRadius.radiusSm,
          borderSide: BorderSide(color: custom.border, width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppRadius.radiusSm,
          borderSide: BorderSide(color: custom.border, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppRadius.radiusSm,
          borderSide: BorderSide(color: custom.primary, width: 1.5),
        ),
        hintStyle: TextStyle(color: custom.textSecondary, fontSize: 14),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: custom.surface,
        indicatorColor: custom.primaryTint,
        elevation: 0,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return TextStyle(color: custom.primary, fontWeight: FontWeight.w600, fontSize: 12);
          }
          return TextStyle(color: custom.textSecondary, fontWeight: FontWeight.w500, fontSize: 12);
        }),
      ),
    );
  }
}
