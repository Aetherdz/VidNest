import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/widgets/vidnest_logo.dart';
import '../../data/providers/settings_provider.dart';
import '../../l10n/app_localizations.dart';
import '../adapters/language_store.dart';
import '../theme/app_theme.dart';

const List<String> _languageCodes = <String>[
  'ar', 'fr', 'en',
  'af', 'az', 'id', 'ms', 'bs', 'ca', 'cs', 'da', 'de', 'et', 'es', 'fa',
  'fi', 'fil', 'gl', 'el', 'he', 'hi', 'hr', 'hu', 'is', 'it', 'ja', 'ko',
  'lt', 'lv', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sr', 'sk', 'sl', 'sv',
  'th', 'tr', 'uk', 'vi', 'zh',
];

const Set<String> _supportedCodes = <String>{'ar', 'fr', 'en'};

String _languageLabel(AppLocalizations l10n, String code) {
  switch (code) {
    case 'ar':
      return l10n.langArabic;
    case 'fr':
      return l10n.langFrench;
    case 'en':
      return l10n.langEnglish;
    case 'af':
      return l10n.langAfrikaans;
    case 'az':
      return l10n.langAzerbaijani;
    case 'id':
      return l10n.langIndonesian;
    case 'ms':
      return l10n.langMalay;
    case 'bs':
      return l10n.langBosnian;
    case 'ca':
      return l10n.langCatalan;
    case 'cs':
      return l10n.langCzech;
    case 'da':
      return l10n.langDanish;
    case 'de':
      return l10n.langGerman;
    case 'et':
      return l10n.langEstonian;
    case 'es':
      return l10n.langSpanish;
    case 'fa':
      return l10n.langPersian;
    case 'fi':
      return l10n.langFinnish;
    case 'fil':
      return l10n.langFilipino;
    case 'gl':
      return l10n.langGalician;
    case 'el':
      return l10n.langGreek;
    case 'he':
      return l10n.langHebrew;
    case 'hi':
      return l10n.langHindi;
    case 'hr':
      return l10n.langCroatian;
    case 'hu':
      return l10n.langHungarian;
    case 'is':
      return l10n.langIcelandic;
    case 'it':
      return l10n.langItalian;
    case 'ja':
      return l10n.langJapanese;
    case 'ko':
      return l10n.langKorean;
    case 'lt':
      return l10n.langLithuanian;
    case 'lv':
      return l10n.langLatvian;
    case 'nl':
      return l10n.langDutch;
    case 'no':
      return l10n.langNorwegian;
    case 'pl':
      return l10n.langPolish;
    case 'pt':
      return l10n.langPortuguese;
    case 'ro':
      return l10n.langRomanian;
    case 'ru':
      return l10n.langRussian;
    case 'sr':
      return l10n.langSerbian;
    case 'sk':
      return l10n.langSlovak;
    case 'sl':
      return l10n.langSlovenian;
    case 'sv':
      return l10n.langSwedish;
    case 'th':
      return l10n.langThai;
    case 'tr':
      return l10n.langTurkish;
    case 'uk':
      return l10n.langUkrainian;
    case 'vi':
      return l10n.langVietnamese;
    case 'zh':
      return l10n.langChinese;
    default:
      return code;
  }
}

/// First-launch language chooser. The layout is always RTL, matching the
/// reference design, while the rest of the app follows the chosen locale.
class LanguageScreen extends ConsumerStatefulWidget {
  const LanguageScreen({super.key, required this.onDone});

  final VoidCallback onDone;

  @override
  ConsumerState<LanguageScreen> createState() => _LanguageScreenState();
}

class _LanguageScreenState extends ConsumerState<LanguageScreen> {
  late String _selected;

  @override
  void initState() {
    super.initState();
    final current = ref.read(settingsProvider).locale.languageCode;
    _selected = _supportedCodes.contains(current) ? current : 'ar';
  }

  Future<void> _select(String code) async {
    if (!_supportedCodes.contains(code)) {
      final l10n = AppLocalizations.of(context)!;
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(SnackBar(content: Text(l10n.languageUnsupported)));
      return;
    }
    setState(() => _selected = code);
  }

  Future<void> _start() async {
    final locale = Locale(_selected);
    ref.read(settingsProvider.notifier).setLocale(locale);
    await ref.read(languageStoreProvider).save(locale);
    if (!mounted) return;
    widget.onDone();
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final l10n = AppLocalizations.of(context)!;

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: palette.background,
        body: Stack(
          children: [
            const Positioned.fill(child: _LanguagePattern()),
            SafeArea(
              child: Column(
                children: [
                  const SizedBox(height: 28),
                  Container(
                    width: 110,
                    height: 110,
                    decoration: BoxDecoration(
                      color: palette.primary,
                      shape: BoxShape.circle,
                    ),
                    alignment: Alignment.center,
                    child: const VidNestLogo(size: 58),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    l10n.languageTitle,
                    style: TextStyle(
                      color: palette.text,
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Expanded(
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      itemCount: _languageCodes.length + 1,
                      itemBuilder: (context, index) {
                        if (index == 3) {
                          return Padding(
                            padding:
                                const EdgeInsets.symmetric(horizontal: 16),
                            child: Divider(
                              height: 9,
                              thickness: 1,
                              color: palette.divider,
                            ),
                          );
                        }
                        final codeIndex = index > 3 ? index - 1 : index;
                        final code = _languageCodes[codeIndex];
                        return _LanguageRow(
                          label: _languageLabel(l10n, code),
                          selected: code == _selected,
                          onTap: () => _select(code),
                        );
                      },
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                    child: SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: FilledButton(
                        onPressed: _start,
                        child: Text(l10n.languageStart),
                      ),
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
}

class _LanguageRow extends StatelessWidget {
  const _LanguageRow({
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
            padding: const EdgeInsets.symmetric(horizontal: 20),
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
                const SizedBox(width: 16),
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

/// Faded, tilted grid of generic app icons at ~6% opacity.
class _LanguagePattern extends StatelessWidget {
  const _LanguagePattern();

  static const List<IconData> _icons = <IconData>[
    Icons.play_arrow_rounded,
    Icons.download_rounded,
    Icons.music_note_rounded,
    Icons.movie_rounded,
    Icons.public_rounded,
    Icons.link_rounded,
    Icons.video_library_rounded,
    Icons.photo_camera_rounded,
  ];

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return IgnorePointer(
      child: ClipRect(
        child: OverflowBox(
          minWidth: 0,
          minHeight: 0,
          maxWidth: 780,
          maxHeight: 1100,
          child: Transform.rotate(
            angle: -0.2,
            child: Opacity(
              opacity: 0.06,
              child: Wrap(
                spacing: 16,
                runSpacing: 16,
                alignment: WrapAlignment.center,
                children: List<Widget>.generate(56, (index) {
                  return Container(
                    width: 92,
                    height: 92,
                    decoration: BoxDecoration(
                      color: palette.primary,
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Icon(
                      _icons[index % _icons.length],
                      size: 44,
                      color: palette.surface,
                    ),
                  );
                }),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
