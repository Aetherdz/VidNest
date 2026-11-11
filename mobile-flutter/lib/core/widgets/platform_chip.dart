import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';

enum SupportedPlatform {
  youtube('YouTube', Color(0xFFFF0000), 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', Icons.play_arrow_rounded),
  tiktok('TikTok', Color(0xFF00F2FE), 'https://www.tiktok.com/@tiktok/video/7106594312292453675', Icons.music_note_rounded),
  instagram('Instagram', Color(0xFFE1306C), 'https://www.instagram.com/reel/C321/', Icons.camera_alt_rounded),
  x('X / Twitter', Color(0xFF14171A), 'https://x.com/jack/status/20', Icons.alternate_email_rounded),
  soundcloud('SoundCloud', Color(0xFFFF5500), 'https://soundcloud.com/artist/track', Icons.graphic_eq_rounded),
  facebook('Facebook', Color(0xFF1877F2), 'https://www.facebook.com/watch/?v=123', Icons.facebook_rounded);

  const SupportedPlatform(this.label, this.brandColor, this.sampleUrl, this.icon);

  final String label;
  final Color brandColor;
  final String sampleUrl;
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
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? colors.primaryTint : colors.surfaceSubtle,
          borderRadius: AppRadius.radiusPill,
          border: Border.all(
            color: isSelected ? colors.primary : colors.border,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 18,
              height: 18,
              decoration: BoxDecoration(
                color: platform.brandColor,
                shape: BoxShape.circle,
              ),
              child: Icon(platform.icon, size: 12, color: Colors.white),
            ),
            AppSpacing.gapSm,
            Text(
              platform.label,
              style: TextStyle(
                color: isSelected ? colors.primaryDark : colors.text,
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
