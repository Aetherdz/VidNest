import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../adapters/language_store.dart';
import 'app_shell.dart';
import 'language_screen.dart';

/// Chooses between the first-launch language screen and the main shell.
class AppRoot extends ConsumerStatefulWidget {
  const AppRoot({super.key});

  @override
  ConsumerState<AppRoot> createState() => _AppRootState();
}

class _AppRootState extends ConsumerState<AppRoot> {
  bool _languageChosen = false;

  @override
  void initState() {
    super.initState();
    _languageChosen = ref.read(languageStoreProvider).hasChosenLanguage;
  }

  @override
  Widget build(BuildContext context) {
    if (!_languageChosen) {
      return LanguageScreen(
        onDone: () => setState(() => _languageChosen = true),
      );
    }
    return const AppShell();
  }
}
