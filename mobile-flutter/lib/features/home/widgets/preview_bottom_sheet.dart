import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_icons.dart';
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
    final selectedMedia = ref.watch(mediaAnalysisProvider).media ?? media;
    final choices = _qualityChoices(selectedMedia.formats);
    if (choices.isEmpty) {
      return const SizedBox.shrink();
    }
    final selectedFormat =
        choices.any((format) => format.id == selectedMedia.selectedFormat?.id)
            ? selectedMedia.selectedFormat!
            : choices.first;

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
                  color: colors.surfaceSubtle,
                  borderRadius: AppRadius.radiusSm,
                ),
                child: Center(
                  child: Icon(AppIcons.play,
                      color: colors.primary,
                      size: 28,
                      textDirection: TextDirection.ltr),
                ),
              ),
              AppSpacing.gapMd,
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      selectedMedia.title,
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
                      '${selectedMedia.extractor} · ${selectedMedia.uploader} · ${selectedMedia.formattedDuration}',
                      style:
                          TextStyle(color: colors.textSecondary, fontSize: 12),
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
              itemCount: choices.length,
              separatorBuilder: (_, __) => const SizedBox(height: 6),
              itemBuilder: (context, index) {
                final format = choices[index];
                final isSelected = format.id == selectedFormat.id;

                return InkWell(
                  onTap: () {
                    ref
                        .read(mediaAnalysisProvider.notifier)
                        .selectFormat(format.id);
                  },
                  borderRadius: AppRadius.radiusSm,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md, vertical: 10),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? colors.primaryTint
                          : colors.surfaceSubtle,
                      borderRadius: AppRadius.radiusSm,
                      border: Border.all(
                        color: isSelected ? colors.primary : colors.border,
                        width: isSelected ? 1.5 : 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          isSelected
                              ? AppIcons.radioSelected
                              : AppIcons.radioUnselected,
                          size: 18,
                          color: isSelected
                              ? colors.primary
                              : colors.textSecondary,
                        ),
                        AppSpacing.gapMd,
                        Expanded(
                          child: Text(
                            _qualityLabel(format, index),
                            style: TextStyle(
                              color: colors.text,
                              fontWeight: isSelected
                                  ? FontWeight.w600
                                  : FontWeight.w500,
                              fontSize: 13,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? colors.primary.withValues(alpha: 0.15)
                                : colors.surface,
                            borderRadius: AppRadius.radiusPill,
                            border:
                                Border.all(color: colors.border, width: 0.8),
                          ),
                          child: Text(
                            format.formattedSize,
                            style: TextStyle(
                              color: isSelected
                                  ? colors.text
                                  : colors.textSecondary,
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
            text: 'محاكاة التنزيل',
            icon: Icon(AppIcons.download, color: colors.text, size: 20),
            isExpanded: true,
            onPressed: () {
              ref
                  .read(downloadRepositoryProvider)
                  .startDownload(selectedMedia, selectedFormat);
              ref.read(mediaAnalysisProvider.notifier).clear();
              onDownloadStarted();
            },
          ),
        ],
      ),
    );
  }
}

List<MediaFormat> _qualityChoices(List<MediaFormat> formats) {
  if (formats.isEmpty) return const [];
  final video = formats.where((format) => format.hasVideo).toList()
    ..sort((a, b) => (b.height ?? 0).compareTo(a.height ?? 0));
  final audio = formats.where((format) => !format.hasVideo).toList();
  final choices = <MediaFormat>[];
  if (video.isNotEmpty) choices.add(video.first);
  if (video.length > 1) choices.add(video[1]);
  if (audio.isNotEmpty) choices.add(audio.first);
  return choices.isEmpty ? [formats.first] : choices;
}

String _qualityLabel(MediaFormat format, int index) {
  if (!format.hasVideo) return 'صوت فقط · ${format.ext.toUpperCase()}';
  final label = index == 0 ? 'أفضل جودة' : 'جودة متوسطة';
  return '$label · ${format.quality}';
}
