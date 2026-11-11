import 'package:flutter/material.dart';

class VidNestLogo extends StatelessWidget {
  const VidNestLogo({
    super.key,
    this.size = 38.0,
    this.showBadge = false,
  });

  final double size;
  final bool showBadge;

  @override
  Widget build(BuildContext context) {
    final logoWidget = SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _VidNestLogoPainter(),
      ),
    );

    if (!showBadge) return logoWidget;

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        logoWidget,
        const SizedBox(width: 10),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'VidNest',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
                letterSpacing: -0.2,
              ),
            ),
            Text(
              'by Atheerium',
              style: TextStyle(
                fontSize: 11,
                color: Theme.of(context).colorScheme.outline,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _VidNestLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final r = w * 0.28;

    // 1. Deep Obsidian Card
    final bgPaint = Paint()
      ..color = const Color(0xFF0B0F19)
      ..style = PaintingStyle.fill;
    final bgRRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(0, 0, w, h),
      Radius.circular(r),
    );
    canvas.drawRRect(bgRRect, bgPaint);

    // 2. Terracotta Border
    final borderPaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFFFB923C), Color(0xFFC2410C)],
      ).createShader(Rect.fromLTWH(0, 0, w, h))
      ..style = PaintingStyle.stroke
      ..strokeWidth = w * 0.035;
    final borderRRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(w * 0.02, h * 0.02, w * 0.96, h * 0.96),
      Radius.circular(r * 0.95),
    );
    canvas.drawRRect(borderRRect, borderPaint);

    // 3. Architectural 'V' in Sand (#FAF7F2)
    final vPaint = Paint()
      ..color = const Color(0xFFFAF7F2)
      ..style = PaintingStyle.stroke
      ..strokeWidth = w * 0.075
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final vPath = Path()
      ..moveTo(w * 0.28, h * 0.36)
      ..lineTo(w * 0.50, h * 0.72)
      ..lineTo(w * 0.72, h * 0.36);
    canvas.drawPath(vPath, vPaint);

    // 4. Play-Prism Facet in Terracotta (#FB923C -> #C2410C)
    final prismPaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFFFB923C), Color(0xFFC2410C)],
      ).createShader(Rect.fromLTWH(w * 0.42, h * 0.28, w * 0.20, h * 0.20))
      ..style = PaintingStyle.fill;

    final prismPath = Path()
      ..moveTo(w * 0.44, h * 0.28)
      ..lineTo(w * 0.62, h * 0.38)
      ..lineTo(w * 0.44, h * 0.48)
      ..close();
    canvas.drawPath(prismPath, prismPaint);

    // 5. Downward Download Chevron Accent
    final chevPaint = Paint()
      ..color = const Color(0xFFFB923C)
      ..style = PaintingStyle.stroke
      ..strokeWidth = w * 0.045
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final chevPath = Path()
      ..moveTo(w * 0.42, h * 0.58)
      ..lineTo(w * 0.50, h * 0.65)
      ..lineTo(w * 0.58, h * 0.58);
    canvas.drawPath(chevPath, chevPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
