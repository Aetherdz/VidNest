import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_icons.dart';
import '../../core/theme/app_radius.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/widgets/download_tile.dart';
import '../../core/widgets/demo_notice.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/responsive_container.dart';
import '../../data/models/download_task.dart';
import '../../data/providers/download_provider.dart';

class DownloadsScreen extends ConsumerWidget {
  const DownloadsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;
    final active = ref.watch(activeTasksProvider);
    final completed = ref.watch(completedTasksProvider);
    final failed = ref.watch(failedTasksProvider);
    final hasTasks =
        active.isNotEmpty || completed.isNotEmpty || failed.isNotEmpty;

    return Scaffold(
      appBar: AppBar(
        title: const Text('التنزيلات',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 28)),
        actions: [
          if (completed.isNotEmpty || failed.isNotEmpty)
            IconButton(
              icon: const Icon(AppIcons.deleteSweep),
              tooltip: 'مسح السجل',
              constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
              onPressed: () => _confirmClearHistory(context, ref),
            ),
        ],
      ),
      body: SafeArea(
        child: ResponsiveContainer(
          padding: AppSpacing.insetAllMd,
          child: Column(
            children: [
              const DemoNotice(),
              AppSpacing.gapMd,
              Expanded(
                child: hasTasks
                    ? ListView(
                        children: [
                          if (active.isNotEmpty) ...[
                            _SectionHeading(
                                title: 'قيد التنزيل', count: active.length),
                            ...active.map((task) => Padding(
                                  padding: const EdgeInsets.only(
                                      bottom: AppSpacing.sm),
                                  child: _taskTile(context, ref, task),
                                )),
                          ],
                          if (completed.isNotEmpty) ...[
                            _SectionHeading(
                                title: 'اكتملت', count: completed.length),
                            ...completed.map((task) => Padding(
                                  padding: const EdgeInsets.only(
                                      bottom: AppSpacing.sm),
                                  child: _taskTile(context, ref, task),
                                )),
                          ],
                          if (failed.isNotEmpty) ...[
                            _SectionHeading(
                                title: 'تعذّر التنزيل', count: failed.length),
                            ...failed.map((task) => Padding(
                                  padding: const EdgeInsets.only(
                                      bottom: AppSpacing.sm),
                                  child: _taskTile(context, ref, task),
                                )),
                          ],
                          AppSpacing.gapMd,
                          Text(
                            'المساحة الفعلية غير متاحة في نسخة المعاينة.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                                color: colors.textSecondary, fontSize: 13),
                          ),
                          AppSpacing.gapLg,
                        ],
                      )
                    : EmptyState(
                        icon: AppIcons.download,
                        title: 'الصق رابطًا وابدأ',
                        description:
                            'ستظهر التنزيلات المعروضة هنا كبيانات تجريبية.',
                        action: FilledButton.icon(
                          onPressed: () => context.go('/home'),
                          icon: const Icon(AppIcons.paste),
                          label: const Text('لصق رابط'),
                          style: FilledButton.styleFrom(
                            minimumSize: const Size(0, 56),
                            shape: AppRadius.shapeLg,
                          ),
                        ),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _taskTile(BuildContext context, WidgetRef ref, DownloadTask task) {
    final repository = ref.read(downloadRepositoryProvider);
    return DownloadTile(
      task: task,
      onPause: () => repository.pauseTask(task.id),
      onResume: () => repository.resumeTask(task.id),
      onCancel: () => repository.cancelTask(task.id),
      onDelete: () => repository.deleteTask(task.id),
      onRetry: () => repository.retryTask(task.id),
      onShare: () => _showUnavailable(context, 'الملف غير متاح للمشاركة بعد'),
      onOpen: () =>
          _showUnavailable(context, 'ملف الفيديو غير متاح للتشغيل بعد'),
    );
  }

  void _showUnavailable(BuildContext context, String message) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _confirmClearHistory(BuildContext context, WidgetRef ref) async {
    final colors = context.colors;
    final shouldClear = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('مسح السجل'),
        content:
            const Text('هل تريد مسح التنزيلات المكتملة والمتعثرة من السجل؟'),
        shape: RoundedRectangleBorder(borderRadius: AppRadius.radiusMd),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: Text('إلغاء', style: TextStyle(color: colors.textSecondary)),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('مسح'),
          ),
        ],
      ),
    );
    if (shouldClear == true) {
      ref.read(downloadRepositoryProvider).clearHistory();
    }
  }
}

class _SectionHeading extends StatelessWidget {
  const _SectionHeading({required this.title, required this.count});

  final String title;
  final int count;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    return Padding(
      padding: const EdgeInsetsDirectional.only(
          top: AppSpacing.md, bottom: AppSpacing.sm),
      child: Row(
        children: [
          Text(title,
              style: TextStyle(
                  color: colors.text,
                  fontSize: 16,
                  fontWeight: FontWeight.w600)),
          const SizedBox(width: AppSpacing.sm),
          Text('$count',
              style: TextStyle(color: colors.textSecondary, fontSize: 13)),
        ],
      ),
    );
  }
}
