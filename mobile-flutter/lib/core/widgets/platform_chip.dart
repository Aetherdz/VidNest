import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_icons.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';

enum SupportedPlatform {
  youtube('YouTube', 'https://www.youtube.com', AppIcons.youtube),
  tiktok('TikTok', 'https://www.tiktok.com', AppIcons.music),
  instagram('Instagram', 'https://www.instagram.com', AppIcons.camera),
  x('X', 'https://x.com', AppIcons.alternateEmail),
  soundcloud('SoundCloud', 'https://soundcloud.com', AppIcons.audio),
  facebook('Facebook', 'https://www.facebook.com', AppIcons.groups);

  const SupportedPlatform(this.label, this.siteUrl, this.icon);

  final String label;

  /// Platform home page. Chips open it so the user copies a real link;
  /// they never inject a made-up one.
  final String siteUrl;
  final IconData icon;
}

class PlatformChip extends StatelessWidget {
  const PlatformChip({
    super.key,
    required this.platform,
    this.isSelected = false,
    this.onTap,
  });

  final SupportedPlatform platform;
  final bool isSelected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;

    return InkWell(
      onTap: onTap,
      borderRadius: AppRadius.radiusPill,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        constraints: const BoxConstraints(minHeight: 44),
        padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md, vertical: AppSpacing.sm),
        decoration: BoxDecoration(
          color: isSelected ? colors.surfaceSubtle : colors.surface,
          borderRadius: AppRadius.radiusPill,
          border: Border.all(
            color: isSelected ? colors.text : colors.border,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(platform.icon, size: 18, color: colors.textSecondary),
            AppSpacing.gapSm,
            Text(
              platform.label,
              style: TextStyle(
                color: colors.text,
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
