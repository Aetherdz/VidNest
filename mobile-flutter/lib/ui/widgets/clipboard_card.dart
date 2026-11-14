import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';
import '../adapters/supported_link.dart';
import '../theme/app_theme.dart';
import 'media_thumb.dart';

/// Shown only while the clipboard contains a supported media link.
class ClipboardCard extends StatelessWidget {
  const ClipboardCard({
    super.key,
    required this.link,
    required this.onDownload,
  });

  final DetectedLink link;
  final VoidCallback onDownload;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final l10n = AppLocalizations.of(context)!;

    return Material(
      color: palette.surfaceSubtle,
      borderRadius: VidNestPalette.radiusCard,
      clipBehavior: Clip.antiAlias,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            MediaThumb(
              size: 56,
              site: link.site,
              radius: 12,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    l10n.clipboardTitle,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: palette.text,
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    link.url,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    textDirection: TextDirection.ltr,
                    textAlign: TextAlign.right,
                    style: TextStyle(
                      color: palette.textSecondary,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Material(
              color: palette.transparent,
              child: InkWell(
                onTap: onDownload,
                customBorder: VidNestPalette.pill,
                child: Ink(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 9,
                  ),
                  decoration: ShapeDecoration(
                    color: palette.primary,
                    shape: VidNestPalette.pill,
                  ),
                  child: Text(
                    l10n.downloadButton,
                    style: TextStyle(
                      color: palette.onPrimary,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
