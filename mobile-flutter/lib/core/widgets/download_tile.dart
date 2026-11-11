import 'package:flutter/material.dart';
import '../../data/models/download_task.dart';
import '../theme/app_colors.dart';
import '../theme/app_icons.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';

class DownloadTile extends StatelessWidget {
  const DownloadTile({
    super.key,
    required this.task,
    this.onTap,
    this.onPause,
    this.onResume,
    this.onRetry,
    this.onCancel,
    this.onDelete,
    this.onShare,
    this.onOpen,
  });

  final DownloadTask task;
  final VoidCallback? onTap;
  final VoidCallback? onPause;
  final VoidCallback? onResume;
  final VoidCallback? onRetry;
  final VoidCallback? onCancel;
  final VoidCallback? onDelete;
  final VoidCallback? onShare;
  final VoidCallback? onOpen;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;

    return Container(
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: AppRadius.radiusMd,
        border: Border.all(color: colors.border, width: 1),
      ),
      padding: AppSpacing.insetAllMd,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Media type fallback until a real file thumbnail is available.
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: colors.surfaceSubtle,
                  borderRadius: AppRadius.radiusSm,
                ),
                child: Center(
                  child: Icon(
                    task.format.hasVideo ? AppIcons.play : AppIcons.audio,
                    color: colors.primary,
                    size: 28,
                    textDirection: TextDirection.ltr,
                  ),
                ),
              ),
              AppSpacing.gapMd,
              // Title & Metadata
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      task.media.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: colors.text,
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Wrap(
                      crossAxisAlignment: WrapCrossAlignment.center,
                      spacing: 4,
                      children: [
                        Text(
                          task.media.extractor,
                          style: TextStyle(
                            color: colors.textSecondary,
                            fontWeight: FontWeight.w500,
                            fontSize: 13,
                          ),
                        ),
                        Text(
                          '·',
                          style: TextStyle(
                              color: colors.textSecondary, fontSize: 13),
                        ),
                        Text(
                          task.format.quality,
                          style: TextStyle(
                            color: colors.textSecondary,
                            fontSize: 13,
                          ),
                        ),
                        Text(
                          '·',
                          style: TextStyle(
                              color: colors.textSecondary, fontSize: 13),
                        ),
                        Text(
                          task.sizeSummary,
                          style: TextStyle(
                            color: colors.textSecondary,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          // Progress Bar for Active Downloads
          if (task.isActive) ...[
            AppSpacing.gapSm,
            ClipRRect(
              borderRadius: AppRadius.radiusPill,
              child: LinearProgressIndicator(
                value: task.progress,
                minHeight: 5,
                backgroundColor: colors.surfaceSubtle,
                valueColor: AlwaysStoppedAnimation<Color>(colors.primary),
              ),
            ),
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${task.percentText} ${task.speedText.isNotEmpty ? '· ${task.speedText}' : ''}',
                  style: TextStyle(color: colors.textSecondary, fontSize: 13),
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (task.status == DownloadStatus.downloading &&
                        onPause != null)
                      IconButton(
                        icon: const Icon(AppIcons.pause, size: 20),
                        onPressed: onPause,
                        tooltip: 'إيقاف مؤقت',
                        padding: EdgeInsets.zero,
                        constraints:
                            const BoxConstraints(minWidth: 48, minHeight: 48),
                      ),
                    if (task.status == DownloadStatus.paused &&
                        onResume != null)
                      IconButton(
                        icon: const Icon(AppIcons.play,
                            size: 20, textDirection: TextDirection.ltr),
                        onPressed: onResume,
                        tooltip: 'استئناف',
                        padding: EdgeInsets.zero,
                        constraints:
                            const BoxConstraints(minWidth: 48, minHeight: 48),
                      ),
                    if (onCancel != null)
                      IconButton(
                        icon: const Icon(AppIcons.close, size: 20),
                        onPressed: onCancel,
                        tooltip: 'إلغاء',
                        padding: EdgeInsets.zero,
                        constraints:
                            const BoxConstraints(minWidth: 48, minHeight: 48),
                      ),
                  ],
                ),
              ],
            ),
          ],
          // Completed Actions
          if (task.isCompleted) ...[
            AppSpacing.gapSm,
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                if (onShare != null)
                  TextButton.icon(
                    icon: Icon(AppIcons.share,
                        size: 18, color: colors.textSecondary),
                    label: Text('مشاركة',
                        style: TextStyle(color: colors.text, fontSize: 13)),
                    onPressed: onShare,
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
                      minimumSize: const Size(48, 48),
                    ),
                  ),
                AppSpacing.gapSm,
                if (onOpen != null)
                  FilledButton.icon(
                    icon: const Icon(AppIcons.play,
                        size: 18, textDirection: TextDirection.ltr),
                    label: const Text('تشغيل', style: TextStyle(fontSize: 13)),
                    onPressed: onOpen,
                    style: FilledButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md, vertical: AppSpacing.xs),
                      minimumSize: const Size(48, 48),
                    ),
                  ),
              ],
            ),
          ],
          // Failed Actions
          if (task.isFailed) ...[
            AppSpacing.gapSm,
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    task.errorMessage ?? 'تعذّر إكمال التنزيل',
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                        fontSize: 13),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (onRetry != null)
                      TextButton.icon(
                        icon: Icon(AppIcons.retry,
                            size: 18, color: colors.primary),
                        label: Text('إعادة',
                            style: TextStyle(color: colors.text, fontSize: 13)),
                        onPressed: onRetry,
                      ),
                    if (onDelete != null)
                      IconButton(
                        icon: Icon(AppIcons.delete,
                            size: 20, color: colors.textSecondary),
                        onPressed: onDelete,
                        tooltip: 'حذف',
                      ),
                  ],
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
