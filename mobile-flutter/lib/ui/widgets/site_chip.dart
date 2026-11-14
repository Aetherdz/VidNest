import 'package:flutter/material.dart';

import '../adapters/supported_link.dart';
import '../theme/app_theme.dart';

/// Monochrome, self-drawn platform marks. No third-party assets and no colors
/// outside [VidNestPalette].
class SiteGlyph extends StatelessWidget {
  const SiteGlyph({
    super.key,
    required this.site,
    required this.size,
    required this.color,
  });

  final SupportedSite? site;
  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _SiteGlyphPainter(site: site, color: color),
      ),
    );
  }
}

class _SiteGlyphPainter extends CustomPainter {
  _SiteGlyphPainter({required this.site, required this.color});

  final SupportedSite? site;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final stroke = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = w * 0.09
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    final fill = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    switch (site) {
      case SupportedSite.youtube:
        final body = RRect.fromRectAndRadius(
          Rect.fromLTWH(w * 0.12, h * 0.26, w * 0.76, h * 0.48),
          Radius.circular(w * 0.14),
        );
        canvas.drawRRect(body, stroke);
        final triangle = Path()
          ..moveTo(w * 0.44, h * 0.38)
          ..lineTo(w * 0.62, h * 0.50)
          ..lineTo(w * 0.44, h * 0.62)
          ..close();
        canvas.drawPath(triangle, fill);
      case SupportedSite.facebook:
        final path = Path()
          ..moveTo(w * 0.66, h * 0.28)
          ..lineTo(w * 0.48, h * 0.28)
          ..quadraticBezierTo(w * 0.42, h * 0.28, w * 0.42, h * 0.38)
          ..lineTo(w * 0.42, h * 0.74)
          ..moveTo(w * 0.32, h * 0.48)
          ..lineTo(w * 0.62, h * 0.48);
        canvas.drawPath(path, stroke);
      case SupportedSite.instagram:
        canvas.drawRRect(
          RRect.fromRectAndRadius(
            Rect.fromLTWH(w * 0.20, h * 0.20, w * 0.60, h * 0.60),
            Radius.circular(w * 0.20),
          ),
          stroke,
        );
        canvas.drawCircle(Offset(w * 0.50, h * 0.50), w * 0.15, stroke);
        canvas.drawCircle(Offset(w * 0.68, h * 0.32), w * 0.035, fill);
      case SupportedSite.tiktok:
        canvas.drawCircle(Offset(w * 0.30, h * 0.68), w * 0.11, fill);
        final note = Path()
          ..moveTo(w * 0.41, h * 0.68)
          ..lineTo(w * 0.41, h * 0.28)
          ..quadraticBezierTo(w * 0.50, h * 0.30, w * 0.62, h * 0.38);
        canvas.drawPath(note, stroke);
      case SupportedSite.x:
        canvas.drawLine(
            Offset(w * 0.22, h * 0.24), Offset(w * 0.78, h * 0.76), stroke);
        canvas.drawLine(
            Offset(w * 0.78, h * 0.24), Offset(w * 0.22, h * 0.76), stroke);
      case SupportedSite.soundcloud:
        for (var i = 0; i < 4; i++) {
          final x = w * (0.20 + i * 0.16);
          final top = h * (0.42 - (i % 2) * 0.10);
          canvas.drawLine(Offset(x, top), Offset(x, h * 0.72), stroke);
        }
        canvas.drawCircle(Offset(w * 0.74, h * 0.62), w * 0.10, fill);
      case null:
        final triangle = Path()
          ..moveTo(w * 0.38, h * 0.30)
          ..lineTo(w * 0.68, h * 0.50)
          ..lineTo(w * 0.38, h * 0.70)
          ..close();
        canvas.drawPath(triangle, fill);
    }
  }

  @override
  bool shouldRepaint(covariant _SiteGlyphPainter oldDelegate) =>
      oldDelegate.site != site || oldDelegate.color != color;
}

/// 48px circle + caption, used by the "Browse sites" row on the home screen.
class SiteChip extends StatelessWidget {
  const SiteChip({
    super.key,
    required this.label,
    required this.site,
    this.onTap,
    this.emphasized = false,
  });

  final String label;
  final SupportedSite? site;
  final VoidCallback? onTap;
  final bool emphasized;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final circleColor = emphasized ? palette.primary : palette.surface;
    final glyphColor = emphasized ? palette.onPrimary : palette.text;
    final semantics = label;

    return Semantics(
      button: true,
      label: semantics,
      child: Material(
        color: palette.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Ink(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: circleColor,
                    shape: BoxShape.circle,
                    border: emphasized
                        ? null
                        : Border.all(color: palette.divider, width: 1),
                  ),
                  child: Center(
                    child: site == null
                        ? Icon(
                            Icons.more_horiz,
                            size: 22,
                            color: glyphColor,
                          )
                        : SiteGlyph(
                            site: site,
                            size: 24,
                            color: glyphColor,
                          ),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    color: palette.textSecondary,
                    height: 1.25,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
