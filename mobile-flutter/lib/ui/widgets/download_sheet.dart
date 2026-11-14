import 'package:flutter/material.dart';
import 'package:intl/intl.dart' as intl;

import '../../data/models/media_item.dart';
import '../../l10n/app_localizations.dart';
import '../adapters/supported_link.dart';
import '../theme/app_theme.dart';
import 'media_thumb.dart';

/// Opens the download sheet. Returns `true` when a download was started.
Future<bool?> showDownloadSheet({
  required BuildContext context,
  required MediaItem media,
  required DetectedLink link,
  required Future<bool> Function(MediaFormat format) onConfirm,
}) {
  final palette = context.palette;
  return showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    barrierColor: palette.scrim,
    backgroundColor: palette.surface,
    shape: const RoundedRectangleBorder(
      borderRadius: VidNestPalette.radiusSheet,
    ),
    builder: (sheetContext) => DownloadSheet(
      media: media,
      link: link,
      onConfirm: onConfirm,
    ),
  );
}

class DownloadSheet extends StatefulWidget {
  const DownloadSheet({
    super.key,
    required this.media,
    required this.link,
    required this.onConfirm,
  });

  final MediaItem media;
  final DetectedLink link;
  final Future<bool> Function(MediaFormat format) onConfirm;

  @override
  State<DownloadSheet> createState() => _DownloadSheetState();
}

class _DownloadSheetState extends State<DownloadSheet> {
  MediaFormat? _selected;
  bool _submitting = false;

  List<MediaFormat> get _audioFormats => widget.media.formats
      .where((format) => !format.hasVideo)
      .toList(growable: false);

  List<MediaFormat> get _videoFormats => widget.media.formats
      .where((format) => format.hasVideo)
      .toList(growable: false);

  @override
  void initState() {
    super.initState();
    final videos = _videoFormats;
    final audio = _audioFormats;
    _selected = videos.isNotEmpty
        ? videos.first
        : (audio.isNotEmpty ? audio.first : null);
  }

  Future<void> _submit() async {
    final format = _selected;
    if (format == null || _submitting) return;
    setState(() => _submitting = true);
    final started = await widget.onConfirm(format);
    if (!mounted) return;
    if (started) {
      Navigator.of(context).pop(true);
    } else {
      setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final l10n = AppLocalizations.of(context)!;
    final locale = Localizations.localeOf(context).toLanguageTag();
    final media = widget.media;
    final audioFormats = _audioFormats;
    final videoFormats = _videoFormats;

    return SafeArea(
      top: false,
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.sizeOf(context).height * 0.86,
        ),
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: palette.divider,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                l10n.clipboardTitle,
                style: TextStyle(
                  color: palette.text,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 16),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  MediaThumb(
                    size: 100,
                    site: widget.link.site,
                    imageUrl: media.thumbnailUrl,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsetsDirectional.only(top: 4),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            media.title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: palette.text,
                              fontSize: 15,
                              height: 1.4,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            widget.link.host,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            textDirection: TextDirection.ltr,
                            style: TextStyle(
                              color: palette.textSecondary,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              if (audioFormats.isNotEmpty) ...[
                const SizedBox(height: 22),
                Text(
                  l10n.sheetMusic,
                  style: TextStyle(
                    color: palette.textSecondary,
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                for (final format in audioFormats)
                  _OptionRow(
                    icon: Icons.music_note_rounded,
                    label: format.quality.toLowerCase().contains('kbps')
                        ? '${format.ext.toUpperCase()} · ${format.quality}'
                        : l10n.audioClassic,
                    sizeLabel: _formatSize(
                      format.filesize,
                      locale,
                      asKb: true,
                    ),
                    selected: _selected?.id == format.id,
                    onTap: () => setState(() => _selected = format),
                  ),
              ],
              if (videoFormats.isNotEmpty) ...[
                const SizedBox(height: 16),
                Text(
                  l10n.sheetVideo,
                  style: TextStyle(
                    color: palette.textSecondary,
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                for (final format in videoFormats)
                  _OptionRow(
                    icon: Icons.smart_display_rounded,
                    label: format.quality,
                    sizeLabel: _formatSize(
                      format.filesize,
                      locale,
                      asKb: false,
                    ),
                    selected: _selected?.id == format.id,
                    onTap: () => setState(() => _selected = format),
                  ),
              ],
              const SizedBox(height: 28),
              SizedBox(
                height: 56,
                child: FilledButton(
                  onPressed:
                      _selected == null || _submitting ? null : _submit,
                  child: _submitting
                      ? SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: palette.onPrimary,
                          ),
                        )
                      : Text(l10n.downloadButton),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Arabic-Indic digits come from intl's locale-aware [NumberFormat]. Audio is
/// reported in KB and video in MB, matching the reference design.
String _formatSize(int? bytes, String locale, {required bool asKb}) {
  if (bytes == null || bytes <= 0) return '—';
  final formatter = intl.NumberFormat(
    '0.0',
    locale.toLowerCase().startsWith('ar') ? 'ar_EG' : locale,
  );
  final value = asKb ? bytes / 1024 : bytes / (1024 * 1024);
  return '${asKb ? 'KB' : 'MB'} ${formatter.format(value)}';
}

class _OptionRow extends StatelessWidget {
  const _OptionRow({
    required this.icon,
    required this.label,
    required this.sizeLabel,
    required this.selected,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final String sizeLabel;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Material(
      color: palette.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: VidNestPalette.radiusSm,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 10),
          child: Row(
            children: [
              Icon(icon, size: 22, color: palette.text),
              const SizedBox(width: 12),
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
              const SizedBox(width: 12),
              Text(
                sizeLabel,
                textDirection: TextDirection.ltr,
                style: TextStyle(
                  color: palette.textSecondary,
                  fontSize: 13,
                ),
              ),
              const SizedBox(width: 12),
              _SelectRadio(selected: selected),
            ],
          ),
        ),
      ),
    );
  }
}

class _SelectRadio extends StatelessWidget {
  const _SelectRadio({required this.selected});

  final bool selected;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return AnimatedContainer(
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
          ? Icon(Icons.check_rounded, size: 14, color: palette.onPrimary)
          : null,
    );
  }
}
