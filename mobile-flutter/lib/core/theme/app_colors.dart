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
    bg: Color(0xFFFFFFFF),
    surface: Color(0xFFFFFFFF),
    surfaceSubtle: Color(0xFFF6F7F9),
    text: Color(0xFF101828),
    textSecondary: Color(0xFF667085),
    border: Color(0xFFE4E7EC),
    primary: Color(0xFFF26B1D),
    primaryTint: Color(0xFFFFF1E6),
    primaryDark: Color(0xFF101828),
  );

  static const dark = VidNestColors(
    bg: Color(0xFF101828),
    surface: Color(0xFF1D2939),
    surfaceSubtle: Color(0xFF344054),
    text: Color(0xFFF9FAFB),
    textSecondary: Color(0xFFD0D5DD),
    border: Color(0xFF475467),
    primary: Color(0xFFF26B1D),
    primaryTint: Color(0xFF3A2B23),
    primaryDark: Color(0xFFF9FAFB),
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
  VidNestColors get colors =>
      Theme.of(this).extension<VidNestColors>() ?? VidNestColors.light;
}
