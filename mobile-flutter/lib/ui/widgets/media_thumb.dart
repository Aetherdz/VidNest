import 'package:flutter/material.dart';

import '../adapters/supported_link.dart';
import '../theme/app_theme.dart';
import 'site_chip.dart';

/// Rounded media thumbnail with a deterministic, offline placeholder.
/// The existing extractor never returns a thumbnail URL today; when the data
/// layer starts providing one it is rendered instead of the placeholder.
class MediaThumb extends StatelessWidget {
  const MediaThumb({
    super.key,
    required this.size,
    required this.site,
    this.imageUrl,
    this.radius = 12,
  });

  final double size;
  final SupportedSite? site;
  final String? imageUrl;
  final double radius;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final placeholder = Container(
      width: size,
      height: size,
      color: palette.surfaceSubtle,
      alignment: Alignment.center,
      child: SiteGlyph(
        site: site,
        size: size * 0.42,
        color: palette.textSecondary,
      ),
    );

    final hasImage = imageUrl != null && imageUrl!.trim().isNotEmpty;

    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: SizedBox(
        width: size,
        height: size,
        child: hasImage
            ? Image.network(
                imageUrl!,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => placeholder,
              )
            : placeholder,
      ),
    );
  }
}
