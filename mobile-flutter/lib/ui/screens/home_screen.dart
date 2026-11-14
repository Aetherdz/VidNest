import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../data/models/media_item.dart';
import '../../data/providers/download_provider.dart';
import '../../l10n/app_localizations.dart';
import '../adapters/storage_permission.dart';
import '../adapters/supported_link.dart';
import '../theme/app_theme.dart';
import '../widgets/clipboard_card.dart';
import '../widgets/download_sheet.dart';
import '../widgets/permission_dialog.dart';
import '../widgets/site_chip.dart';

/// Home tab: clipboard shortcut, search bar, popular searches and sites.
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key, required this.onOpenPlay});

  final VoidCallback onOpenPlay;

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen>
    with WidgetsBindingObserver {
  final TextEditingController _searchController = TextEditingController();

  DetectedLink? _clipboardLink;
  bool _busy = false;
  bool _sessionPermissionGranted = false;
  bool _permissionPrompted = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _readClipboard();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _searchController.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _readClipboard();
    }
  }

  Future<void> _readClipboard() async {
    DetectedLink? link;
    try {
      final data = await Clipboard.getData(Clipboard.kTextPlain);
      link = detectSupportedLink(data?.text);
    } catch (_) {
      link = null;
    }
    if (!mounted) return;
    if (link?.url != _clipboardLink?.url) {
      setState(() => _clipboardLink = link);
    }
  }

  void _snack(String message, {SnackBarAction? action}) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message), action: action));
  }

  Future<void> _submit() async {
    final l10n = AppLocalizations.of(context)!;
    final text = _searchController.text.trim();
    final target = text.isEmpty
        ? _clipboardLink?.url
        : normalizeMediaUrl(text);
    if (target == null) {
      _snack(l10n.linkNotSupported);
      return;
    }
    FocusScope.of(context).unfocus();
    await _openUrl(target);
  }

  Future<void> _openUrl(String rawUrl) async {
    if (_busy) return;
    final l10n = AppLocalizations.of(context)!;
    final link = describeMediaLink(rawUrl);
    if (link == null) {
      _snack(l10n.linkNotSupported);
      return;
    }

    setState(() => _busy = true);
    final media =
        await ref.read(mediaAnalysisProvider.notifier).analyze(link.url);
    if (!mounted) return;
    setState(() => _busy = false);
    if (media == null) {
      _snack(l10n.linkNotSupported);
      return;
    }

    final started = await showDownloadSheet(
      context: context,
      media: media,
      link: link,
      onConfirm: (format) => _confirmDownload(media, format),
    );
    if (!mounted || started != true) return;
    _snack(
      l10n.downloadStarted,
      action: SnackBarAction(
        label: l10n.showAction,
        onPressed: widget.onOpenPlay,
      ),
    );
  }

  Future<bool> _confirmDownload(MediaItem media, MediaFormat format) async {
    if (!await _ensurePermission()) return false;
    ref.read(downloadRepositoryProvider).startDownload(media, format);
    return true;
  }

  /// The project has no native permission bridge, so `null` means "the OS
  /// cannot answer". In that case the in-app consent is recorded for this
  /// session only; a real bridge must be added to enforce the OS grant.
  Future<bool> _ensurePermission() async {
    if (_sessionPermissionGranted) return true;
    final l10n = AppLocalizations.of(context)!;
    final permission = ref.read(storagePermissionProvider);

    final granted = await permission.hasAllFilesAccess();
    if (granted == true) {
      _sessionPermissionGranted = true;
      return true;
    }
    if (_permissionPrompted) return false;
    _permissionPrompted = true;

    if (!mounted) return false;
    final allowed = await showStoragePermissionDialog(context);
    if (!allowed) return false;

    final result = await permission.requestAllFilesAccess();
    if (result == false) {
      if (mounted) _snack(l10n.permissionDenied);
      return false;
    }
    _sessionPermissionGranted = true;
    return true;
  }

  Future<void> _openSite(String url) async {
    final uri = Uri.parse(url);
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final l10n = AppLocalizations.of(context)!;

    final trending = <String>[
      l10n.trendingToto,
      l10n.trendingGnawi,
      l10n.trendingBaqarah,
      l10n.trendingLFerda,
    ];

    final sites = <({SupportedSite? site, String label, bool emphasized})>[
      (
        site: SupportedSite.youtube,
        label: l10n.siteYouTube,
        emphasized: false
      ),
      (
        site: SupportedSite.instagram,
        label: l10n.siteInstagram,
        emphasized: false
      ),
      (
        site: SupportedSite.facebook,
        label: l10n.siteFacebook,
        emphasized: false
      ),
      (
        site: SupportedSite.tiktok,
        label: l10n.siteTikTok,
        emphasized: false
      ),
      (site: null, label: l10n.viewAll, emphasized: true),
    ];

    return Scaffold(
      backgroundColor: palette.background,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: Container(
                height: 52,
                decoration: BoxDecoration(
                  borderRadius: VidNestPalette.radiusSm,
                  boxShadow: [palette.softShadow],
                ),
                child: Material(
                  color: palette.surface,
                  borderRadius: VidNestPalette.radiusSm,
                  clipBehavior: Clip.antiAlias,
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          textInputAction: TextInputAction.search,
                          textDirection: TextDirection.ltr,
                          textAlign: TextAlign.right,
                          onSubmitted: (_) => _submit(),
                          style: TextStyle(color: palette.text, fontSize: 15),
                          decoration: InputDecoration(
                            hintText: l10n.searchHint,
                            filled: false,
                            border: InputBorder.none,
                            enabledBorder: InputBorder.none,
                            focusedBorder: InputBorder.none,
                            contentPadding:
                                const EdgeInsets.symmetric(horizontal: 14),
                          ),
                        ),
                      ),
                      Material(
                        color: palette.transparent,
                        child: InkWell(
                          onTap: _busy ? null : _submit,
                          customBorder: const CircleBorder(),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: _busy
                                ? SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: palette.primary,
                                    ),
                                  )
                                : Icon(
                                    Icons.arrow_right_alt,
                                    size: 26,
                                    color: palette.text,
                                  ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            AnimatedSize(
              duration: const Duration(milliseconds: 220),
              curve: Curves.easeOutCubic,
              alignment: AlignmentDirectional.topCenter,
              child: _clipboardLink == null
                  ? const SizedBox(width: double.infinity)
                  : Padding(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                      child: ClipboardCard(
                        link: _clipboardLink!,
                        onDownload: () => _openUrl(_clipboardLink!.url),
                      ),
                    ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.only(bottom: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
                      child: Align(
                        alignment: AlignmentDirectional.centerStart,
                        child: Text(
                          l10n.sectionTrending,
                          style: TextStyle(
                            color: palette.text,
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 38,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: trending.length,
                        separatorBuilder: (_, __) =>
                            const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          final term = trending[index];
                          return Material(
                            color: palette.transparent,
                            child: InkWell(
                              onTap: () =>
                                  setState(() => _searchController.text = term),
                              customBorder: VidNestPalette.pill,
                              child: Ink(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 8),
                                decoration: ShapeDecoration(
                                  color: palette.surfaceSubtle,
                                  shape: VidNestPalette.pill,
                                ),
                                child: Text(
                                  term,
                                  style: TextStyle(
                                    color: palette.text,
                                    fontSize: 15,
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
                      child: Align(
                        alignment: AlignmentDirectional.centerStart,
                        child: Text(
                          l10n.sectionSites,
                          style: TextStyle(
                            color: palette.text,
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          for (final entry in sites)
                            Expanded(
                              child: SiteChip(
                                label: entry.label,
                                site: entry.site,
                                emphasized: entry.emphasized,
                                onTap: () {
                                  switch (entry.site) {
                                    case SupportedSite.youtube:
                                      _openSite('https://www.youtube.com');
                                    case SupportedSite.instagram:
                                      _openSite('https://www.instagram.com');
                                    case SupportedSite.facebook:
                                      _openSite('https://www.facebook.com');
                                    case SupportedSite.tiktok:
                                      _openSite('https://www.tiktok.com');
                                    case SupportedSite.x:
                                      _openSite('https://x.com');
                                    case SupportedSite.soundcloud:
                                      _openSite('https://soundcloud.com');
                                    case null:
                                      _snack(l10n.sitesAllHint);
                                  }
                                },
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
