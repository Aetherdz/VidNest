import 'package:flutter/material.dart';

@immutable
class VidNestColors extends ThemeExtension<VidNestColors> {
  const VidNestColors({
    required this.bg,
    required this.surface,
    required this.surfaceSubtle,
    required this.text,
    required this.textSecondary,
    required this.border,
    required this.primary,
    required this.primaryTint,
    required this.primaryDark,
  });

  final Color bg;
  final Color surface;
  final Color surfaceSubtle;
  final Color text;
  final Color textSecondary;
  final Color border;
  final Color primary;
  final Color primaryTint;
  final Color primaryDark;

  static const light = VidNestColors(
    bg: Color(0xFFFAF7F2),
    surface: Color(0xFFFFFFFF),
    surfaceSubtle: Color(0xFFF5F0E6),
    text: Color(0xFF141B2D),
    textSecondary: Color(0xFF5B6475),
    border: Color(0xFFE8E2D8),
    primary: Color(0xFFF26A21),
    primaryTint: Color(0xFFFDEBDD),
    primaryDark: Color(0xFFC2410C),
  );

  static const dark = VidNestColors(
    bg: Color(0xFF0F1424),
    surface: Color(0xFF181F33),
    surfaceSubtle: Color(0xFF222B42),
    text: Color(0xFFF3F4F8),
    textSecondary: Color(0xFF94A3B8),
    border: Color(0xFF2D3748),
    primary: Color(0xFFF26A21),
    primaryTint: Color(0xFF3D2418),
    primaryDark: Color(0xFFEA580C),
  );

  @override
  VidNestColors copyWith({
    Color? bg,
    Color? surface,
    Color? surfaceSubtle,
    Color? text,
    Color? textSecondary,
    Color? border,
    Color? primary,
    Color? primaryTint,
    Color? primaryDark,
  }) {
    return VidNestColors(
      bg: bg ?? this.bg,
      surface: surface ?? this.surface,
      surfaceSubtle: surfaceSubtle ?? this.surfaceSubtle,
      text: text ?? this.text,
      textSecondary: textSecondary ?? this.textSecondary,
      border: border ?? this.border,
      primary: primary ?? this.primary,
      primaryTint: primaryTint ?? this.primaryTint,
      primaryDark: primaryDark ?? this.primaryDark,
    );
  }

  @override
  VidNestColors lerp(ThemeExtension<VidNestColors>? other, double t) {
    if (other is! VidNestColors) return this;
    return VidNestColors(
      bg: Color.lerp(bg, other.bg, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      surfaceSubtle: Color.lerp(surfaceSubtle, other.surfaceSubtle, t)!,
      text: Color.lerp(text, other.text, t)!,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t)!,
      border: Color.lerp(border, other.border, t)!,
      primary: Color.lerp(primary, other.primary, t)!,
      primaryTint: Color.lerp(primaryTint, other.primaryTint, t)!,
      primaryDark: Color.lerp(primaryDark, other.primaryDark, t)!,
    );
  }
}

extension BuildContextVidNestColors on BuildContext {
  VidNestColors get colors => Theme.of(this).extension<VidNestColors>() ?? VidNestColors.light;
}
