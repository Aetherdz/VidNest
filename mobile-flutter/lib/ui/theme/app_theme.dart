import 'package:flutter/material.dart';

/// Single source of truth for every color, shadow and shape used by the
/// redesigned VidNest UI. Nothing outside this file declares a raw color.
@immutable
class VidNestPalette extends ThemeExtension<VidNestPalette> {
  const VidNestPalette({
    required this.primary,
    required this.onPrimary,
    required this.background,
    required this.surface,
    required this.surfaceSubtle,
    required this.text,
    required this.textSecondary,
    required this.divider,
    required this.disabled,
    required this.scrim,
    required this.shadow,
    required this.transparent,
  });

  final Color primary;
  final Color onPrimary;
  final Color background;
  final Color surface;
  final Color surfaceSubtle;
  final Color text;
  final Color textSecondary;
  final Color divider;
  final Color disabled;
  final Color scrim;
  final Color shadow;
  final Color transparent;

  /// Accent sampled from the VidNest logo (the orange border and play mark).
  static const light = VidNestPalette(
    primary: Color(0xFFF26B1D),
    onPrimary: Color(0xFF101828),
    background: Color(0xFFFFFFFF),
    surface: Color(0xFFFFFFFF),
    surfaceSubtle: Color(0xFFF5F5F7),
    text: Color(0xFF101828),
    textSecondary: Color(0xFF667085),
    divider: Color(0xFFE4E7EC),
    disabled: Color(0xFFB3B9C4),
    scrim: Color(0x80000000),
    shadow: Color(0x14101828),
    transparent: Color(0x00000000),
  );

  static const dark = VidNestPalette(
    primary: Color(0xFFF26B1D),
    onPrimary: Color(0xFF101828),
    background: Color(0xFF0B0F17),
    surface: Color(0xFF111827),
    surfaceSubtle: Color(0xFF1F2937),
    text: Color(0xFFF9FAFB),
    textSecondary: Color(0xFFC3CAD6),
    divider: Color(0xFF2A3441),
    disabled: Color(0xFF4B5563),
    scrim: Color(0x99000000),
    shadow: Color(0x33000000),
    transparent: Color(0x00000000),
  );

  BoxShadow get softShadow => BoxShadow(
        color: shadow,
        blurRadius: 18,
        offset: const Offset(0, 6),
      );

  static const BorderRadius radiusSm = BorderRadius.all(Radius.circular(12));
  static const BorderRadius radiusCard = BorderRadius.all(Radius.circular(16));
  static const BorderRadius radiusDialog =
      BorderRadius.all(Radius.circular(24));
  static const BorderRadius radiusSheet =
      BorderRadius.vertical(top: Radius.circular(28));
  static const StadiumBorder pill = StadiumBorder();

  @override
  VidNestPalette copyWith({
    Color? primary,
    Color? onPrimary,
    Color? background,
    Color? surface,
    Color? surfaceSubtle,
    Color? text,
    Color? textSecondary,
    Color? divider,
    Color? disabled,
    Color? scrim,
    Color? shadow,
    Color? transparent,
  }) {
    return VidNestPalette(
      primary: primary ?? this.primary,
      onPrimary: onPrimary ?? this.onPrimary,
      background: background ?? this.background,
      surface: surface ?? this.surface,
      surfaceSubtle: surfaceSubtle ?? this.surfaceSubtle,
      text: text ?? this.text,
      textSecondary: textSecondary ?? this.textSecondary,
      divider: divider ?? this.divider,
      disabled: disabled ?? this.disabled,
      scrim: scrim ?? this.scrim,
      shadow: shadow ?? this.shadow,
      transparent: transparent ?? this.transparent,
    );
  }

  @override
  VidNestPalette lerp(ThemeExtension<VidNestPalette>? other, double t) {
    if (other is! VidNestPalette) return this;
    return VidNestPalette(
      primary: Color.lerp(primary, other.primary, t)!,
      onPrimary: Color.lerp(onPrimary, other.onPrimary, t)!,
      background: Color.lerp(background, other.background, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      surfaceSubtle: Color.lerp(surfaceSubtle, other.surfaceSubtle, t)!,
      text: Color.lerp(text, other.text, t)!,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t)!,
      divider: Color.lerp(divider, other.divider, t)!,
      disabled: Color.lerp(disabled, other.disabled, t)!,
      scrim: Color.lerp(scrim, other.scrim, t)!,
      shadow: Color.lerp(shadow, other.shadow, t)!,
      transparent: Color.lerp(transparent, other.transparent, t)!,
    );
  }
}

extension VidNestPaletteX on BuildContext {
  VidNestPalette get palette =>
      Theme.of(this).extension<VidNestPalette>() ?? VidNestPalette.light;
}

abstract final class AppTheme {
  static const String fontFamily = 'IBMPlexSansArabic';

  static const TextTheme _type = TextTheme(
    titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, height: 1.3),
    titleMedium: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, height: 1.3),
    titleSmall: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, height: 1.3),
    bodyLarge: TextStyle(fontSize: 15, height: 1.45),
    bodyMedium: TextStyle(fontSize: 15, height: 1.45),
    bodySmall: TextStyle(fontSize: 13, height: 1.4),
    labelLarge: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
    labelMedium: TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
  );

  static ThemeData light() => _build(VidNestPalette.light, Brightness.light);

  static ThemeData dark() => _build(VidNestPalette.dark, Brightness.dark);

  static ThemeData _build(VidNestPalette palette, Brightness brightness) {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: palette.primary,
      brightness: brightness,
    ).copyWith(
      primary: palette.primary,
      onPrimary: palette.onPrimary,
      surface: palette.surface,
      onSurface: palette.text,
      onSurfaceVariant: palette.textSecondary,
      outline: palette.divider,
      outlineVariant: palette.divider,
      surfaceContainerHighest: palette.surfaceSubtle,
      surfaceContainerHigh: palette.surfaceSubtle,
      surfaceContainerLow: palette.surfaceSubtle,
      surfaceContainerLowest: palette.background,
      error: const Color(0xFFDC2626),
      onError: const Color(0xFFFFFFFF),
    );

    final textTheme = _type.apply(
      fontFamily: fontFamily,
      bodyColor: palette.text,
      displayColor: palette.text,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: colorScheme,
      fontFamily: fontFamily,
      scaffoldBackgroundColor: palette.background,
      splashFactory: InkRipple.splashFactory,
      extensions: <ThemeExtension<dynamic>>[palette],
      textTheme: textTheme,
      iconTheme: IconThemeData(color: palette.text, size: 22),
      dividerTheme: DividerThemeData(
        color: palette.divider,
        thickness: 1,
        space: 1,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: palette.background,
        foregroundColor: palette.text,
        surfaceTintColor: palette.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: textTheme.titleLarge,
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: palette.primary,
          foregroundColor: palette.onPrimary,
          disabledBackgroundColor: palette.surfaceSubtle,
          disabledForegroundColor: palette.disabled,
          elevation: 0,
          minimumSize: const Size(0, 56),
          padding: const EdgeInsets.symmetric(horizontal: 24),
          shape: VidNestPalette.pill,
          textStyle: const TextStyle(
            fontFamily: fontFamily,
            fontSize: 15,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: palette.text,
          minimumSize: const Size(0, 44),
          shape: VidNestPalette.pill,
          textStyle: const TextStyle(
            fontFamily: fontFamily,
            fontSize: 15,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: palette.surface,
        isDense: true,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 15),
        hintStyle: TextStyle(
          color: palette.textSecondary,
          fontSize: 15,
          fontWeight: FontWeight.w400,
        ),
        border: const OutlineInputBorder(
          borderRadius: VidNestPalette.radiusSm,
          borderSide: BorderSide.none,
        ),
        enabledBorder: const OutlineInputBorder(
          borderRadius: VidNestPalette.radiusSm,
          borderSide: BorderSide.none,
        ),
        focusedBorder: const OutlineInputBorder(
          borderRadius: VidNestPalette.radiusSm,
          borderSide: BorderSide.none,
        ),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: palette.surface,
        surfaceTintColor: palette.transparent,
        elevation: 0,
        shape: const RoundedRectangleBorder(
          borderRadius: VidNestPalette.radiusDialog,
        ),
        titleTextStyle: textTheme.titleMedium,
        contentTextStyle: textTheme.bodyMedium,
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: palette.surface,
        surfaceTintColor: palette.transparent,
        modalBackgroundColor: palette.surface,
        elevation: 0,
        modalElevation: 0,
        shape: const RoundedRectangleBorder(
          borderRadius: VidNestPalette.radiusSheet,
        ),
        dragHandleColor: palette.divider,
        dragHandleSize: const Size(40, 4),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: palette.text,
        contentTextStyle: TextStyle(
          fontFamily: fontFamily,
          color: palette.surface,
          fontSize: 13,
        ),
        actionTextColor: palette.primary,
        behavior: SnackBarBehavior.floating,
        shape: const RoundedRectangleBorder(
          borderRadius: VidNestPalette.radiusSm,
        ),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith(
          (states) => states.contains(WidgetState.selected)
              ? palette.onPrimary
              : palette.surface,
        ),
        trackColor: WidgetStateProperty.resolveWith(
          (states) => states.contains(WidgetState.selected)
              ? palette.primary
              : palette.divider,
        ),
      ),
      radioTheme: RadioThemeData(
        fillColor: WidgetStateProperty.resolveWith(
          (states) => states.contains(WidgetState.selected)
              ? palette.primary
              : palette.divider,
        ),
      ),
    );
  }
}
