import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:vidnest/core/theme/app_theme.dart';
import 'package:vidnest/features/downloads/downloads_screen.dart';
import 'package:vidnest/features/home/home_screen.dart';
import 'package:vidnest/features/library/library_screen.dart';
import 'package:vidnest/features/settings/settings_screen.dart';
import 'package:vidnest/l10n/app_localizations.dart';

Widget _createTestHarness({
  required Widget screen,
  required Locale locale,
  required Size size,
}) {
  return ProviderScope(
    child: MaterialApp(
      locale: locale,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: AppLocalizations.supportedLocales,
      home: MediaQuery(
        data: MediaQueryData(size: size),
        child: SizedBox(
          width: size.width,
          height: size.height,
          child: screen,
        ),
      ),
    ),
  );
}

void main() {
  group('RTL and LTR Layout & Zero-Overflow Audits', () {
    const mobileSize = Size(360, 720);
    const tabletSize = Size(768, 1024);

    testWidgets('HomeScreen renders in Arabic RTL with zero overflow',
        (tester) async {
      await tester.binding.setSurfaceSize(mobileSize);
      addTearDown(() => tester.binding.setSurfaceSize(null));

      await tester.pumpWidget(
        _createTestHarness(
          screen: const HomeScreen(),
          locale: const Locale('ar'),
          size: mobileSize,
        ),
      );
      await tester.pumpAndSettle();

      expect(tester.takeException(), isNull);
      expect(find.text('ماذا تريد أن تحمّل اليوم؟'), findsOneWidget);
    });

    testWidgets('HomeScreen renders in English LTR with zero overflow',
        (tester) async {
      await tester.binding.setSurfaceSize(mobileSize);
      addTearDown(() => tester.binding.setSurfaceSize(null));

      await tester.pumpWidget(
        _createTestHarness(
          screen: const HomeScreen(),
          locale: const Locale('en'),
          size: mobileSize,
        ),
      );
      await tester.pumpAndSettle();

      expect(tester.takeException(), isNull);
    });

    testWidgets('DownloadsScreen renders on Tablet with zero overflow',
        (tester) async {
      await tester.binding.setSurfaceSize(tabletSize);
      addTearDown(() => tester.binding.setSurfaceSize(null));

      await tester.pumpWidget(
        _createTestHarness(
          screen: const DownloadsScreen(),
          locale: const Locale('ar'),
          size: tabletSize,
        ),
      );
      await tester.pumpAndSettle();

      expect(tester.takeException(), isNull);
      expect(find.text('التنزيلات'), findsOneWidget);
    });

    testWidgets('LibraryScreen renders on Mobile with zero overflow',
        (tester) async {
      await tester.binding.setSurfaceSize(mobileSize);
      addTearDown(() => tester.binding.setSurfaceSize(null));

      await tester.pumpWidget(
        _createTestHarness(
          screen: const LibraryScreen(),
          locale: const Locale('ar'),
          size: mobileSize,
        ),
      );
      await tester.pumpAndSettle();

      expect(tester.takeException(), isNull);
      expect(find.text('المكتبة'), findsOneWidget);
    });

    testWidgets('SettingsScreen renders on Mobile with zero overflow',
        (tester) async {
      await tester.binding.setSurfaceSize(mobileSize);
      addTearDown(() => tester.binding.setSurfaceSize(null));

      await tester.pumpWidget(
        _createTestHarness(
          screen: const SettingsScreen(),
          locale: const Locale('ar'),
          size: mobileSize,
        ),
      );
      await tester.pumpAndSettle();

      expect(tester.takeException(), isNull);
      expect(find.text('الإعدادات'), findsOneWidget);
    });
  });
}
