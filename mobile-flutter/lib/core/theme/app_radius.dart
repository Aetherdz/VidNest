import 'package:flutter/material.dart';

abstract final class AppRadius {
  static const double sm = 12.0;
  static const double md = 20.0;
  static const double lg = 28.0;
  static const double pill = 999.0;

  // Radius values
  static const Radius radiusSmVal = Radius.circular(sm);
  static const Radius radiusMdVal = Radius.circular(md);
  static const Radius radiusLgVal = Radius.circular(lg);
  static const Radius radiusPillVal = Radius.circular(pill);

  // BorderRadius
  static const BorderRadius radiusSm = BorderRadius.all(radiusSmVal);
  static const BorderRadius radiusMd = BorderRadius.all(radiusMdVal);
  static const BorderRadius radiusLg = BorderRadius.all(radiusLgVal);
  static const BorderRadius radiusPill = BorderRadius.all(radiusPillVal);

  // Shapes
  static const RoundedRectangleBorder shapeSm = RoundedRectangleBorder(borderRadius: radiusSm);
  static const RoundedRectangleBorder shapeMd = RoundedRectangleBorder(borderRadius: radiusMd);
  static const RoundedRectangleBorder shapeLg = RoundedRectangleBorder(borderRadius: radiusLg);
  static const StadiumBorder shapePill = StadiumBorder();
}
