import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radius.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/app_button.dart';
import '../../../data/models/media_item.dart';
import '../../../data/providers/download_provider.dart';

class PreviewBottomSheet extends ConsumerWidget {
  const PreviewBottomSheet({
    super.key,
    required this.media,
    required this.onDownloadStarted,
  });

  final MediaItem media;
  final VoidCallback onDownloadStarted;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;
    final selectedFormat = media.selectedFormat ?? media.formats.first;

    return Container(
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: AppSpacing.insetAllLg,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 38,
              height: 4,
              decoration: BoxDecoration(
                color: colors.border,
                borderRadius: AppRadius.radiusPill,
              ),
            ),
          ),
          AppSpacing.gapMd,

          // Media info card
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [colors.primary, colors.primaryDark],
                  ),
                  borderRadius: AppRadius.radiusSm,
                ),
                child: const Center(
                  child: Icon(Icons.play_arrow_rounded, color: Colors.white, size: 28),
                ),
              ),
              AppSpacing.gapMd,
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      media.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: colors.text,
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${media.extractor} · ${media.uploader} · ${media.formattedDuration}',
                      style: TextStyle(color: colors.textSecondary, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
          AppSpacing.gapLg,

          // Available qualities title
          Text(
            'اختر الدقة المطلوبة',
            style: TextStyle(
              color: colors.text,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
          AppSpacing.gapSm,

          // Formats List
          Flexible(
            child: ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: media.formats.length,
              separatorBuilder: (_, __) => const SizedBox(height: 6),
              itemBuilder: (context, index) {
                final format = media.formats[index];
                final isSelected = format.id == selectedFormat.id;

                return InkWell(
                  onTap: () {
                    ref.read(mediaAnalysisProvider.notifier).selectFormat(format.id);
                  },
                  borderRadius: AppRadius.radiusSm,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 10),
                    decoration: BoxDecoration(
                      color: isSelected ? colors.primaryTint : colors.surfaceSubtle,
                      borderRadius: AppRadius.radiusSm,
                      border: Border.all(
                        color: isSelected ? colors.primary : colors.border,
                        width: isSelected ? 1.5 : 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
                          size: 18,
                          color: isSelected ? colors.primary : colors.textSecondary,
                        ),
                        AppSpacing.gapMd,
                        Expanded(
                          child: Text(
                            format.label,
                            style: TextStyle(
                              color: isSelected ? colors.primaryDark : colors.text,
                              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                              fontSize: 13,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: isSelected ? colors.primary.withValues(alpha: 0.15) : colors.surface,
                            borderRadius: AppRadius.radiusPill,
                            border: Border.all(color: colors.border, width: 0.8),
                          ),
                          child: Text(
                            format.formattedSize,
                            style: TextStyle(
                              color: isSelected ? colors.primaryDark : colors.textSecondary,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          AppSpacing.gapLg,

          // Start Download Button
          AppButton(
            text: 'ابدأ التنزيل الآن',
            icon: const Icon(Icons.download_rounded, color: Colors.white, size: 20),
            isExpanded: true,
            onPressed: () {
              ref.read(downloadRepositoryProvider).startDownload(media, selectedFormat);
              ref.read(mediaAnalysisProvider.notifier).clear();
              onDownloadStarted();
            },
          ),
        ],
      ),
    );
  }
}
