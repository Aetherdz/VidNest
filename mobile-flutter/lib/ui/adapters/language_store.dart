import 'dart:convert';
import 'dart:io';

import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';

/// Persists the first-launch language choice without touching the existing
/// data layer. The file lives in the app support directory (path_provider is
/// already a dependency of this project).
abstract class LanguageStore {
  bool get hasChosenLanguage;

  Locale get locale;

  Future<void> save(Locale locale);
}

class MemoryLanguageStore implements LanguageStore {
  MemoryLanguageStore({this.hasChosenLanguage = false, Locale? locale})
      : _locale = locale ?? const Locale('ar');

  @override
  bool hasChosenLanguage;

  Locale _locale;

  @override
  Locale get locale => _locale;

  @override
  Future<void> save(Locale locale) async {
    _locale = locale;
    hasChosenLanguage = true;
  }
}

class FileLanguageStore implements LanguageStore {
  FileLanguageStore._(this._file, this.hasChosenLanguage, this._locale);

  static const String _fileName = 'vidnest_ui_prefs.json';

  final File _file;
  Locale _locale;

  @override
  bool hasChosenLanguage;

  @override
  Locale get locale => _locale;

  /// Falls back to an in-memory store when the platform path is unavailable
  /// (desktop tests, unsupported platforms) so the UI never crashes.
  static Future<LanguageStore> load() async {
    try {
      final directory = await getApplicationSupportDirectory();
      final file = File('${directory.path}${Platform.pathSeparator}$_fileName');
      var chosen = false;
      var locale = const Locale('ar');
      if (await file.exists()) {
        final decoded = jsonDecode(await file.readAsString());
        if (decoded is Map<String, dynamic>) {
          chosen = decoded['hasChosenLanguage'] == true;
          final code = decoded['languageCode'];
          if (code is String && code.isNotEmpty) {
            locale = Locale(code);
          }
        }
      }
      return FileLanguageStore._(file, chosen, locale);
    } catch (error, stack) {
      debugPrint('LanguageStore unavailable, using memory store: $error\n$stack');
      return MemoryLanguageStore();
    }
  }

  @override
  Future<void> save(Locale locale) async {
    _locale = locale;
    hasChosenLanguage = true;
    try {
      await _file.parent.create(recursive: true);
      await _file.writeAsString(
        jsonEncode(<String, Object>{
          'hasChosenLanguage': true,
          'languageCode': locale.languageCode,
        }),
        flush: true,
      );
    } catch (error) {
      debugPrint('Failed to persist language choice: $error');
    }
  }
}

/// Overridden in `main.dart` with [FileLanguageStore] and in widget tests with
/// [MemoryLanguageStore].
final languageStoreProvider = Provider<LanguageStore>(
  (ref) => MemoryLanguageStore(),
);
