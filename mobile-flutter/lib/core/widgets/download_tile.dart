import 'package:flutter/material.dart';
import '../../data/models/download_task.dart';
import '../theme/app_colors.dart';
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
              // Media Thumbnail / Gradient Badge
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      colors.primary.withValues(alpha: 0.85),
                      colors.primaryDark,
                    ],
                  ),
                  borderRadius: AppRadius.radiusSm,
                ),
                child: Center(
                  child: Icon(
                    task.format.hasVideo ? Icons.play_arrow_rounded : Icons.graphic_eq_rounded,
                    color: Colors.white,
                    size: 28,
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
                        fontSize: 14,
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
                            color: colors.primary,
                            fontWeight: FontWeight.w500,
                            fontSize: 12,
                          ),
                        ),
                        Text(
                          '·',
                          style: TextStyle(color: colors.textSecondary, fontSize: 12),
                        ),
                        Text(
                          task.format.quality,
                          style: TextStyle(
                            color: colors.textSecondary,
                            fontSize: 12,
                          ),
                        ),
                        Text(
                          '·',
                          style: TextStyle(color: colors.textSecondary, fontSize: 12),
                        ),
                        Text(
                          task.sizeSummary,
                          style: TextStyle(
                            color: colors.textSecondary,
                            fontSize: 12,
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
                  style: TextStyle(color: colors.textSecondary, fontSize: 11),
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (task.status == DownloadStatus.downloading && onPause != null)
                      IconButton(
                        icon: const Icon(Icons.pause_rounded, size: 18),
                        onPressed: onPause,
                        tooltip: 'إيقاف مؤقت',
                        visualDensity: VisualDensity.compact,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                      ),
                    if (task.status == DownloadStatus.paused && onResume != null)
                      IconButton(
                        icon: const Icon(Icons.play_arrow_rounded, size: 18),
                        onPressed: onResume,
                        tooltip: 'استئناف',
                        visualDensity: VisualDensity.compact,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                      ),
                    if (onCancel != null)
                      IconButton(
                        icon: const Icon(Icons.close_rounded, size: 18),
                        onPressed: onCancel,
                        tooltip: 'إلغاء',
                        visualDensity: VisualDensity.compact,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
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
                    icon: Icon(Icons.share_rounded, size: 16, color: colors.textSecondary),
                    label: Text('مشاركة', style: TextStyle(color: colors.text, fontSize: 12)),
                    onPressed: onShare,
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
                      minimumSize: const Size(0, 32),
                    ),
                  ),
                AppSpacing.gapSm,
                if (onOpen != null)
                  FilledButton.icon(
                    icon: const Icon(Icons.play_arrow_rounded, size: 16),
                    label: const Text('تشغيل', style: TextStyle(fontSize: 12)),
                    onPressed: onOpen,
                    style: FilledButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs),
                      minimumSize: const Size(0, 32),
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
                    style: TextStyle(color: Theme.of(context).colorScheme.error, fontSize: 11),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (onRetry != null)
                      TextButton.icon(
                        icon: Icon(Icons.refresh_rounded, size: 16, color: colors.primary),
                        label: Text('إعادة', style: TextStyle(color: colors.primary, fontSize: 12)),
                        onPressed: onRetry,
                      ),
                    if (onDelete != null)
                      IconButton(
                        icon: Icon(Icons.delete_outline_rounded, size: 18, color: colors.textSecondary),
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
