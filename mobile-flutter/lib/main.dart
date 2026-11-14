import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'data/providers/settings_provider.dart';
import 'l10n/app_localizations.dart';
import 'ui/adapters/language_store.dart';
import 'ui/screens/app_root.dart';
import 'ui/theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final languageStore = await FileLanguageStore.load();
  final container = ProviderContainer(
    overrides: [languageStoreProvider.overrideWithValue(languageStore)],
  );
  container.read(settingsProvider.notifier).setLocale(languageStore.locale);

  runApp(
    UncontrolledProviderScope(
      container: container,
      child: const VidNestApp(),
    ),
  );
}

class VidNestApp extends ConsumerWidget {
  const VidNestApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsProvider);

    return MaterialApp(
      title: 'VidNest',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: settings.themeMode,
      locale: settings.locale,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: AppLocalizations.supportedLocales,
      home: const AppRoot(),
    );
  }
}
