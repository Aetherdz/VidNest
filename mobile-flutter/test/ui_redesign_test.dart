import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:vidnest/data/extractors/mock_extractor.dart';
import 'package:vidnest/data/models/media_item.dart';
import 'package:vidnest/l10n/app_localizations.dart';
import 'package:vidnest/ui/adapters/language_store.dart';
import 'package:vidnest/ui/adapters/supported_link.dart';
import 'package:vidnest/ui/screens/app_root.dart';
import 'package:vidnest/ui/screens/home_screen.dart';
import 'package:vidnest/ui/screens/language_screen.dart';
import 'package:vidnest/ui/theme/app_theme.dart';
import 'package:vidnest/ui/widgets/clipboard_card.dart';
import 'package:vidnest/ui/widgets/download_sheet.dart';
import 'package:vidnest/ui/widgets/permission_dialog.dart';
import 'package:vidnest/ui/widgets/site_chip.dart';

Widget _wrap(
  Widget child, {
  MemoryLanguageStore? store,
  Locale locale = const Locale('ar'),
}) {
  return ProviderScope(
    overrides: [
      languageStoreProvider.overrideWithValue(store ?? MemoryLanguageStore()),
    ],
    child: MaterialApp(
      theme: AppTheme.light(),
      locale: locale,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: AppLocalizations.supportedLocales,
      home: child,
    ),
  );
}

void main() {
  group('link detection', () {
    test('detects supported hosts inside noisy clipboard text', () {
      final link = detectSupportedLink(
        'Watch this https://vt.tiktok.com/ZSabc123/ now',
      );
      expect(link, isNotNull);
      expect(link!.site, SupportedSite.tiktok);
      expect(link.host, 'vt.tiktok.com');
    });

    test('rejects unsupported hosts', () {
      expect(detectSupportedLink('https://example.com/video'), isNull);
      expect(detectSupportedLink('no link here'), isNull);
    });

    test('normalizes bare URLs for the search field', () {
      expect(normalizeMediaUrl('youtu.be/abc'), 'https://youtu.be/abc');
      expect(normalizeMediaUrl('hello'), isNull);
    });
  });

  group('language screen', () {
    testWidgets('renders RTL list and saves the choice', (tester) async {
      final store = MemoryLanguageStore();
      var done = false;

      await tester.pumpWidget(
        _wrap(
          LanguageScreen(onDone: () => done = true),
          store: store,
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('اختر لغتك'), findsOneWidget);
      expect(find.text('العربية'), findsOneWidget);
      expect(find.text('English (US)'), findsOneWidget);
      expect(find.text('Afrikaans'), findsOneWidget);

      await tester.tap(find.text('Français'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('ابدأ'));
      await tester.pumpAndSettle();

      expect(done, isTrue);
      expect(store.hasChosenLanguage, isTrue);
      expect(store.locale.languageCode, 'fr');
    });

    testWidgets('unsupported languages are not selectable', (tester) async {
      await tester.pumpWidget(
        _wrap(LanguageScreen(onDone: () {})),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Afrikaans'));
      await tester.pumpAndSettle();

      expect(find.text('هذه اللغة غير متاحة حاليًا.'), findsOneWidget);
    });
  });

  group('app root', () {
    testWidgets('first launch shows language, then the shell', (tester) async {
      final store = MemoryLanguageStore();
      await tester.pumpWidget(_wrap(const AppRoot(), store: store));

      expect(find.text('اختر لغتك'), findsOneWidget);

      await tester.tap(find.text('ابدأ'));
      await tester.pumpAndSettle();

      expect(find.text('ابحث للتنزيل'), findsOneWidget);
      expect(find.text('عمليات البحث الشائعة'), findsOneWidget);
      expect(find.text('عرض المواقع'), findsOneWidget);
      expect(find.text('تنزيل'), findsWidgets);
      expect(find.text('تشغيل'), findsOneWidget);
      expect(find.text('الإعدادات'), findsOneWidget);
    });

    testWidgets('returning user goes straight to home', (tester) async {
      final store = MemoryLanguageStore(hasChosenLanguage: true);
      await tester.pumpWidget(_wrap(const AppRoot(), store: store));
      await tester.pumpAndSettle();

      expect(find.text('اختر لغتك'), findsNothing);
      expect(find.text('ابحث للتنزيل'), findsOneWidget);
    });
  });

  group('home widgets', () {
    testWidgets('clipboard card shows the copied link', (tester) async {
      final link = detectSupportedLink('https://vt.tiktok.com/ZSabc/')!;
      var tapped = false;

      await tester.pumpWidget(
        _wrap(
          Scaffold(
            body: ClipboardCard(
              link: link,
              onDownload: () => tapped = true,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('الرابط الذي نسخته'), findsOneWidget);
      expect(find.text('https://vt.tiktok.com/ZSabc/'), findsOneWidget);

      await tester.tap(find.text('تنزيل'));
      expect(tapped, isTrue);
    });

    testWidgets('site chip keeps its label and ripple', (tester) async {
      var tapped = false;
      await tester.pumpWidget(
        _wrap(
          Scaffold(
            body: Center(
              child: SiteChip(
                label: 'TikTok',
                site: SupportedSite.tiktok,
                onTap: () => tapped = true,
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('TikTok'));
      expect(tapped, isTrue);
    });

    testWidgets('home tab renders search and both sections', (tester) async {
      await tester.pumpWidget(
        _wrap(Scaffold(body: HomeScreen(onOpenPlay: () {}))),
      );
      await tester.pumpAndSettle();

      expect(find.text('ابحث للتنزيل'), findsOneWidget);
      expect(find.text('toto'), findsOneWidget);
      expect(find.text('عرض الكل'), findsOneWidget);
      expect(find.text('YouTube'), findsOneWidget);
    });

    testWidgets('english and french locales are translated', (tester) async {
      await tester.pumpWidget(
        _wrap(
          Scaffold(body: HomeScreen(onOpenPlay: () {})),
          locale: const Locale('en'),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Search to download'), findsOneWidget);
      expect(find.text('Popular searches'), findsOneWidget);
      expect(find.text('View all'), findsOneWidget);

      await tester.pumpWidget(
        _wrap(
          Scaffold(body: HomeScreen(onOpenPlay: () {})),
          locale: const Locale('fr'),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Rechercher pour télécharger'), findsOneWidget);
      expect(find.text('Recherches populaires'), findsOneWidget);
    });
  });

  group('download sheet', () {
    Future<MediaItem> tiktokMedia() =>
        const UniversalMediaExtractor().extract('https://vt.tiktok.com/x/');

    testWidgets('sheet preselects the best video and submits it', (tester) async {
      final media = await tiktokMedia();
      final link = describeMediaLink(media.url)!;
      MediaFormat? received;

      await tester.pumpWidget(
        _wrap(
          Scaffold(
            body: DownloadSheet(
              media: media,
              link: link,
              onConfirm: (format) async {
                received = format;
                return false;
              },
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      final button = tester.widget<FilledButton>(find.byType(FilledButton));
      expect(button.onPressed, isNotNull);
      expect(find.textContaining('KB ٥١٢٠٫٠'), findsOneWidget);
      expect(find.textContaining('MB ٦٨٫٠'), findsOneWidget);
      expect(find.text('1080p'), findsOneWidget);
      expect(find.text('720p'), findsOneWidget);
      expect(find.text('480p'), findsOneWidget);

      await tester.tap(find.byType(FilledButton));
      await tester.pumpAndSettle();

      expect(received, isNotNull);
      expect(received!.id, '1080p');
      expect(received!.hasVideo, isTrue);
    });

    testWidgets('selecting a lower video quality passes that format',
        (tester) async {
      final media = await tiktokMedia();
      final link = describeMediaLink(media.url)!;
      MediaFormat? received;

      await tester.pumpWidget(
        _wrap(
          Scaffold(
            body: DownloadSheet(
              media: media,
              link: link,
              onConfirm: (format) async {
                received = format;
                return false;
              },
            ),
          ),
        ),
      );

      await tester.tap(find.text('720p'));
      await tester.pumpAndSettle();
      await tester.tap(find.byType(FilledButton));
      await tester.pumpAndSettle();

      expect(received, isNotNull);
      expect(received!.id, '720p');
      expect(received!.hasVideo, isTrue);
    });

    testWidgets('confirm receives the selected audio format', (tester) async {
      final media = await tiktokMedia();
      final link = describeMediaLink(media.url)!;
      MediaFormat? received;

      await tester.pumpWidget(
        _wrap(
          Scaffold(
            body: DownloadSheet(
              media: media,
              link: link,
              onConfirm: (format) async {
                received = format;
                return false;
              },
            ),
          ),
        ),
      );

      await tester.tap(find.text('تنزيل MP3 الكلاسيكي'));
      await tester.pumpAndSettle();
      await tester.tap(find.byType(FilledButton));
      await tester.pumpAndSettle();

      expect(received, isNotNull);
      expect(received!.hasVideo, isFalse);
      expect(received!.ext, 'mp3');
    });

    testWidgets('audio-only media lists both bitrates', (tester) async {
      final media =
          await const UniversalMediaExtractor().extract('https://soundcloud.com/x');
      final link = describeMediaLink(media.url)!;

      await tester.pumpWidget(
        _wrap(
          Scaffold(
            body: DownloadSheet(
              media: media,
              link: link,
              onConfirm: (_) async => false,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('MP3 · 320 kbps'), findsOneWidget);
      expect(find.text('M4A · 256 kbps'), findsOneWidget);

      await tester.tap(find.text('M4A · 256 kbps'));
      await tester.pumpAndSettle();
      final button = tester.widget<FilledButton>(find.byType(FilledButton));
      expect(button.onPressed, isNotNull);
    });
  });

  group('permission dialog', () {
    testWidgets('renders the settings illustration and both actions',
        (tester) async {
      bool? result;

      await tester.pumpWidget(
        _wrap(
          Scaffold(
            body: Builder(
              builder: (context) => TextButton(
                onPressed: () async {
                  result = await showStoragePermissionDialog(context);
                },
                child: const Text('open'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('open'));
      await tester.pumpAndSettle();

      expect(find.text('السماح بالوصول إلى جميع الملفات'), findsOneWidget);
      expect(find.text('السماح بالوصول إلى التخزين'), findsOneWidget);

      await tester.tap(find.text('السماح'));
      await tester.pumpAndSettle();
      expect(result, isTrue);
    });
  });
}
