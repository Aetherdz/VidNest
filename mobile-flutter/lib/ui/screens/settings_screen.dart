import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/widgets/vidnest_logo.dart';
import '../../data/providers/settings_provider.dart';
import '../../l10n/app_localizations.dart';
import '../adapters/language_store.dart';
import '../theme/app_theme.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final palette = context.palette;
    final l10n = AppLocalizations.of(context)!;
    final settings = ref.watch(settingsProvider);

    return Scaffold(
      backgroundColor: palette.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 24),
          children: [
            Text(
              l10n.settingsTitle,
              style: TextStyle(
                color: palette.text,
                fontSize: 20,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 24),
            _SectionTitle(label: l10n.languageLabel),
            const SizedBox(height: 8),
            _Card(
              children: [
                for (final code in const ['ar', 'fr', 'en'])
                  _ChoiceRow(
                    label: _languageLabel(l10n, code),
                    selected: settings.locale.languageCode == code,
                    onTap: () {
                      final locale = Locale(code);
                      ref
                          .read(settingsProvider.notifier)
                          .setLocale(locale);
                      ref.read(languageStoreProvider).save(locale);
                    },
                  ),
              ],
            ),
            const SizedBox(height: 24),
            _SectionTitle(label: l10n.themeLabel),
            const SizedBox(height: 8),
            _Card(
              children: [
                _ChoiceRow(
                  label: l10n.themeSystem,
                  selected: settings.themeMode == ThemeMode.system,
                  onTap: () => ref
                      .read(settingsProvider.notifier)
                      .setThemeMode(ThemeMode.system),
                ),
                _ChoiceRow(
                  label: l10n.themeLight,
                  selected: settings.themeMode == ThemeMode.light,
                  onTap: () => ref
                      .read(settingsProvider.notifier)
                      .setThemeMode(ThemeMode.light),
                ),
                _ChoiceRow(
                  label: l10n.themeDark,
                  selected: settings.themeMode == ThemeMode.dark,
                  onTap: () => ref
                      .read(settingsProvider.notifier)
                      .setThemeMode(ThemeMode.dark),
                ),
              ],
            ),
            const SizedBox(height: 24),
            _SectionTitle(label: l10n.aboutLabel),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: palette.surfaceSubtle,
                borderRadius: VidNestPalette.radiusCard,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const VidNestLogo(size: 34),
                      const SizedBox(width: 12),
                      Text(
                        l10n.appName,
                        style: TextStyle(
                          color: palette.text,
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    l10n.aboutText,
                    style: TextStyle(
                      color: palette.textSecondary,
                      fontSize: 13,
                      height: 1.5,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _languageLabel(AppLocalizations l10n, String code) {
    switch (code) {
      case 'ar':
        return l10n.langArabic;
      case 'fr':
        return l10n.langFrench;
      default:
        return l10n.langEnglish;
    }
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: TextStyle(
        color: context.palette.textSecondary,
        fontSize: 15,
        fontWeight: FontWeight.w500,
      ),
    );
  }
}

class _Card extends StatelessWidget {
  const _Card({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return Material(
      color: palette.surfaceSubtle,
      borderRadius: VidNestPalette.radiusCard,
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          for (var i = 0; i < children.length; i++) ...[
            if (i > 0)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Divider(height: 1, color: palette.divider),
              ),
            children[i],
          ],
        ],
      ),
    );
  }
}

class _ChoiceRow extends StatelessWidget {
  const _ChoiceRow({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return Material(
      color: palette.transparent,
      child: InkWell(
        onTap: onTap,
        child: SizedBox(
          height: 56,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: palette.text,
                      fontSize: 15,
                    ),
                  ),
                ),
                AnimatedContainer(
                  duration: const Duration(milliseconds: 220),
                  curve: Curves.easeOutCubic,
                  width: 22,
                  height: 22,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: selected ? palette.primary : palette.transparent,
                    border: Border.all(
                      color: selected ? palette.primary : palette.textSecondary,
                      width: 1.5,
                    ),
                  ),
                  child: selected
                      ? Icon(
                          Icons.check_rounded,
                          size: 14,
                          color: palette.onPrimary,
                        )
                      : null,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
