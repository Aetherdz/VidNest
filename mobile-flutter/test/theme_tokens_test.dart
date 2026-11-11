import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:vidnest/core/theme/app_colors.dart';
import 'package:vidnest/core/theme/app_radius.dart';
import 'package:vidnest/core/theme/app_spacing.dart';

void main() {
  group('VidNest Design Tokens & Specifications', () {
    test('VidNestColors Light Palette matches exact studio hex codes', () {
      const c = VidNestColors.light;
      expect(c.bg, const Color(0xFFFAF7F2));
      expect(c.surface, const Color(0xFFFFFFFF));
      expect(c.surfaceSubtle, const Color(0xFFF5F0E6));
      expect(c.text, const Color(0xFF141B2D));
      expect(c.textSecondary, const Color(0xFF5B6475));
      expect(c.border, const Color(0xFFE8E2D8));
      expect(c.primary, const Color(0xFFF26A21));
      expect(c.primaryTint, const Color(0xFFFDEBDD));
      expect(c.primaryDark, const Color(0xFFC2410C));
    });

    test('VidNestColors Dark Palette matches exact studio hex codes', () {
      const c = VidNestColors.dark;
      expect(c.bg, const Color(0xFF0F1424));
      expect(c.surface, const Color(0xFF181F33));
      expect(c.surfaceSubtle, const Color(0xFF222B42));
      expect(c.text, const Color(0xFFF3F4F8));
      expect(c.textSecondary, const Color(0xFF94A3B8));
      expect(c.border, const Color(0xFF2D3748));
      expect(c.primary, const Color(0xFFF26A21));
      expect(c.primaryTint, const Color(0xFF3D2418));
      expect(c.primaryDark, const Color(0xFFEA580C));
    });

    test('AppSpacing adheres strictly to the 8px grid', () {
      expect(AppSpacing.xs, 4.0);
      expect(AppSpacing.sm, 8.0);
      expect(AppSpacing.md, 16.0);
      expect(AppSpacing.lg, 24.0);
      expect(AppSpacing.xl, 32.0);
      expect(AppSpacing.xxl, 48.0);
    });

    test('AppRadius matches refined tactile radius system', () {
      expect(AppRadius.sm, 12.0);
      expect(AppRadius.md, 20.0);
      expect(AppRadius.lg, 28.0);
      expect(AppRadius.pill, 999.0);
    });
  });
}
