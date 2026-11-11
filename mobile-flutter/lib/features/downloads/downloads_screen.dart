import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radius.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/widgets/download_tile.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/responsive_container.dart';
import '../../data/models/download_task.dart';
import '../../data/providers/download_provider.dart';

class DownloadsScreen extends ConsumerStatefulWidget {
  const DownloadsScreen({super.key});

  @override
  ConsumerState<DownloadsScreen> createState() => _DownloadsScreenState();
}

class _DownloadsScreenState extends ConsumerState<DownloadsScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final active = ref.watch(activeTasksProvider);
    final completed = ref.watch(completedTasksProvider);
    final failed = ref.watch(failedTasksProvider);

    int totalBytes = 0;
    for (final c in completed) {
      totalBytes += c.downloadedBytes;
    }
    final totalSizeMb = (totalBytes / (1024 * 1024)).toStringAsFixed(1);

    return Scaffold(
      appBar: AppBar(
        title: const Text('التنزيلات', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        actions: [
          if (completed.isNotEmpty || failed.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_sweep_outlined),
              tooltip: 'مسح السجل',
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('مسح السجل'),
                    content: const Text('هل أنت متأكد من مسح جميع التنزيلات المكتملة والمتعثرة من السجل؟'),
                    shape: AppRadius.shapeMd,
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(ctx),
                        child: Text('إلغاء', style: TextStyle(color: colors.textSecondary)),
                      ),
                      FilledButton(
                        onPressed: () {
                          ref.read(downloadRepositoryProvider).clearHistory();
                          Navigator.pop(ctx);
                        },
                        child: const Text('مسح'),
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Container(
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: colors.border, width: 1)),
            ),
            child: TabBar(
              controller: _tabController,
              labelColor: colors.primary,
              unselectedLabelColor: colors.textSecondary,
              indicatorColor: colors.primary,
              indicatorWeight: 2.5,
              labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
              tabs: [
                Tab(text: 'قيد التنزيل (${active.length})'),
                Tab(text: 'المكتملة (${completed.length})'),
                Tab(text: 'المتعثرة (${failed.length})'),
              ],
            ),
          ),
        ),
      ),
      body: SafeArea(
        child: ResponsiveContainer(
          child: Column(
            children: [
              // Storage Info Bar
              Container(
                margin: const EdgeInsets.all(AppSpacing.md),
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 10),
                decoration: BoxDecoration(
                  color: colors.surfaceSubtle,
                  borderRadius: AppRadius.radiusSm,
                  border: Border.all(color: colors.border, width: 1),
                ),
                child: Row(
                  children: [
                    Icon(Icons.storage_rounded, size: 18, color: colors.primary),
                    AppSpacing.gapSm,
                    Text(
                      'المساحة الإجمالية المستخدمة: ',
                      style: TextStyle(color: colors.textSecondary, fontSize: 12),
                    ),
                    Text(
                      '$totalSizeMb MB',
                      style: TextStyle(color: colors.text, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ],
                ),
              ),

              // Tab Views
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildTaskList(
                      active,
                      emptyTitle: 'لا توجد تنزيلات نشطة حاليًا',
                      emptyDesc: 'الصق رابطًا في الصفحة الرئيسية لبدء التنزيل فورًا.',
                      emptyIcon: Icons.downloading_rounded,
                    ),
                    _buildTaskList(
                      completed,
                      emptyTitle: 'لا توجد تنزيلات مكتملة حتى الآن',
                      emptyDesc: 'الملفات المكتملة ستظهر هنا لتشغيلها ومشاركتها.',
                      emptyIcon: Icons.task_alt_rounded,
                    ),
                    _buildTaskList(
                      failed,
                      emptyTitle: 'لا توجد تنزيلات متعثرة',
                      emptyDesc: 'كافة عمليات التنزيل تمت بنجاح وبدون مشاكل.',
                      emptyIcon: Icons.sentiment_satisfied_rounded,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTaskList(
    List<DownloadTask> tasks, {
    required String emptyTitle,
    required String emptyDesc,
    required IconData emptyIcon,
  }) {
    if (tasks.isEmpty) {
      return EmptyState(
        icon: emptyIcon,
        title: emptyTitle,
        description: emptyDesc,
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
      itemCount: tasks.length,
      separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
      itemBuilder: (context, index) {
        final task = tasks[index];
        return DownloadTile(
          task: task,
          onPause: () => ref.read(downloadRepositoryProvider).pauseTask(task.id),
          onResume: () => ref.read(downloadRepositoryProvider).resumeTask(task.id),
          onCancel: () => ref.read(downloadRepositoryProvider).cancelTask(task.id),
          onDelete: () => ref.read(downloadRepositoryProvider).deleteTask(task.id),
          onRetry: () => ref.read(downloadRepositoryProvider).retryTask(task.id),
          onShare: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('تم فتح نافذة المشاركة')),
            );
          },
          onOpen: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('تشغيل: ${task.media.title}')),
            );
          },
        );
      },
    );
  }
}
