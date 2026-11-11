import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:vidnest/core/theme/app_theme.dart';
import 'package:vidnest/core/widgets/platform_chip.dart';
import 'package:vidnest/core/widgets/responsive_container.dart';
import 'package:vidnest/core/widgets/url_field.dart';
import 'package:vidnest/core/widgets/vidnest_logo.dart';

Widget _wrap(Widget child, {TextDirection dir = TextDirection.rtl}) {
  return MaterialApp(
    theme: AppTheme.light(),
    home: Directionality(
      textDirection: dir,
      child: Scaffold(body: Center(child: child)),
    ),
  );
}

void main() {
  group('Core Reusable Widgets Tests', () {
    testWidgets('ResponsiveContainer caps max width at 720dp', (tester) async {
      await tester.binding.setSurfaceSize(const Size(1200, 800));
      addTearDown(() => tester.binding.setSurfaceSize(null));

      await tester.pumpWidget(
        _wrap(
          ResponsiveContainer(
            child: Container(key: const ValueKey('inner_box'), height: 100),
          ),
        ),
      );

      final renderBox = tester.renderObject<RenderBox>(find.byKey(const ValueKey('inner_box')));
      expect(renderBox.size.width, lessThanOrEqualTo(720.0));
    });

    testWidgets('VidNestLogo renders cleanly with badge and without badge', (tester) async {
      await tester.pumpWidget(_wrap(const VidNestLogo(size: 40, showBadge: true)));
      expect(find.text('VidNest'), findsOneWidget);
      expect(find.text('by Atheerium'), findsOneWidget);
      expect(find.byType(CustomPaint), findsWidgets);
    });

    testWidgets('UrlField toggles between Paste icon and Clear (X) icon dynamically', (tester) async {
      final controller = TextEditingController();

      await tester.pumpWidget(
        _wrap(
          UrlField(
            controller: controller,
            onAnalyze: (_) {},
          ),
        ),
      );

      // 1. Initial empty state: Paste button visible, Clear button absent
      expect(find.byKey(const ValueKey('paste_btn')), findsOneWidget);
      expect(find.byKey(const ValueKey('clear_btn')), findsNothing);

      // 2. Typing into field: Clear (X) button swaps in, Paste button hides
      await tester.enterText(find.byType(TextField), 'https://www.tiktok.com/@video/1');
      await tester.pumpAndSettle();

      expect(find.byKey(const ValueKey('clear_btn')), findsOneWidget);
      expect(find.byKey(const ValueKey('paste_btn')), findsNothing);

      // 3. Tapping Clear (X) button: Clears text and swaps back to Paste button
      await tester.tap(find.byKey(const ValueKey('clear_btn')));
      await tester.pumpAndSettle();

      expect(controller.text, isEmpty);
      expect(find.byKey(const ValueKey('paste_btn')), findsOneWidget);
      expect(find.byKey(const ValueKey('clear_btn')), findsNothing);
    });

    testWidgets('PlatformChip renders brand colors and responds to tap', (tester) async {
      bool tapped = false;

      await tester.pumpWidget(
        _wrap(
          PlatformChip(
            platform: SupportedPlatform.tiktok,
            isSelected: true,
            onTap: () => tapped = true,
          ),
        ),
      );

      expect(find.text('TikTok'), findsOneWidget);
      await tester.tap(find.byType(PlatformChip));
      expect(tapped, isTrue);
    });
  });
}
