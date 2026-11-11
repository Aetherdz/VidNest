import 'package:flutter/material.dart';

abstract final class AppMotion {
  // Durations
  static const Duration durationFast = Duration(milliseconds: 150);
  static const Duration durationNormal = Duration(milliseconds: 250);
  static const Duration durationMedium = Duration(milliseconds: 350);
  static const Duration durationSlow = Duration(milliseconds: 500);

  // Curves
  static const Curve curveSpring = Curves.easeOutCubic;
  static const Curve curveEnter = Curves.easeOutQuart;
  static const Curve curveExit = Curves.easeInQuart;
  static const Curve curveStandard = Curves.easeInOutCubic;
}
