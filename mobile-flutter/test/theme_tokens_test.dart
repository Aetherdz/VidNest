import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:vidnest/core/theme/app_colors.dart';
import 'package:vidnest/core/theme/app_radius.dart';
import 'package:vidnest/core/theme/app_spacing.dart';
import 'package:vidnest/core/theme/app_theme.dart';

void main() {
  group('VidNest Design Tokens & Specifications', () {
    test('VidNest light palette matches the orange and navy identity', () {
      const c = VidNestColors.light;
      expect(c.bg, const Color(0xFFFFFFFF));
      expect(c.surface, const Color(0xFFFFFFFF));
      expect(c.surfaceSubtle, const Color(0xFFF6F7F9));
      expect(c.text, const Color(0xFF101828));
      expect(c.textSecondary, const Color(0xFF667085));
      expect(c.border, const Color(0xFFE4E7EC));
      expect(c.primary, const Color(0xFFF26B1D));
      expect(c.primaryTint, const Color(0xFFFFF1E6));
      expect(c.primaryDark, const Color(0xFF101828));
    });

    test(
        'VidNest dark palette retains the orange accent with accessible navy surfaces',
        () {
      const c = VidNestColors.dark;
      expect(c.bg, const Color(0xFF101828));
      expect(c.surface, const Color(0xFF1D2939));
      expect(c.surfaceSubtle, const Color(0xFF344054));
      expect(c.text, const Color(0xFFF9FAFB));
      expect(c.textSecondary, const Color(0xFFD0D5DD));
      expect(c.border, const Color(0xFF475467));
      expect(c.primary, const Color(0xFFF26B1D));
      expect(c.primaryTint, const Color(0xFF3A2B23));
      expect(c.primaryDark, const Color(0xFFF9FAFB));
    });

    test('AppSpacing adheres strictly to the 8px grid', () {
      expect(AppSpacing.xs, 8.0);
      expect(AppSpacing.sm, 8.0);
      expect(AppSpacing.md, 16.0);
      expect(AppSpacing.lg, 24.0);
      expect(AppSpacing.xl, 32.0);
      expect(AppSpacing.xxl, 48.0);
    });

    test('AppRadius matches refined tactile radius system', () {
      expect(AppRadius.sm, 16.0);
      expect(AppRadius.md, 16.0);
      expect(AppRadius.lg, 28.0);
      expect(AppRadius.pill, 999.0);
    });

    test('AppTheme uses IBM Plex Arabic and the requested type scale', () {
      final light = AppTheme.light();
      final dark = AppTheme.dark();
      expect(light.textTheme.titleLarge?.fontFamily, 'IBMPlexSansArabic');
      expect(dark.textTheme.titleLarge?.fontFamily, 'IBMPlexSansArabic');
      expect(light.textTheme.titleLarge?.fontSize, 28);
      expect(light.textTheme.bodyMedium?.fontSize, 16);
      expect(light.textTheme.bodySmall?.fontSize, 13);
      expect(light.colorScheme.primary, const Color(0xFFF26B1D));
      expect(dark.colorScheme.primary, const Color(0xFFF26B1D));
    });
  });
}
