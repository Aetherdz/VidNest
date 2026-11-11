import 'package:flutter/material.dart';

abstract final class AppSpacing {
  static const double xs = 8.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;

  // Insets
  static const EdgeInsets insetAllXs = EdgeInsets.all(xs);
  static const EdgeInsets insetAllSm = EdgeInsets.all(sm);
  static const EdgeInsets insetAllMd = EdgeInsets.all(md);
  static const EdgeInsets insetAllLg = EdgeInsets.all(lg);
  static const EdgeInsets insetAllXl = EdgeInsets.all(xl);

  // Horizontal Insets
  static const EdgeInsets insetHSm = EdgeInsets.symmetric(horizontal: sm);
  static const EdgeInsets insetHMd = EdgeInsets.symmetric(horizontal: md);
  static const EdgeInsets insetHLg = EdgeInsets.symmetric(horizontal: lg);

  // Vertical Insets
  static const EdgeInsets insetVSm = EdgeInsets.symmetric(vertical: sm);
  static const EdgeInsets insetVMd = EdgeInsets.symmetric(vertical: md);
  static const EdgeInsets insetVLg = EdgeInsets.symmetric(vertical: lg);

  // Gaps
  static const SizedBox gapXs = SizedBox(width: xs, height: xs);
  static const SizedBox gapSm = SizedBox(width: sm, height: sm);
  static const SizedBox gapMd = SizedBox(width: md, height: md);
  static const SizedBox gapLg = SizedBox(width: lg, height: lg);
  static const SizedBox gapXl = SizedBox(width: xl, height: xl);
  static const SizedBox gapXxl = SizedBox(width: xxl, height: xxl);
}
