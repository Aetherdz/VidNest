import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radius.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/widgets/app_button.dart';
import '../../core/widgets/download_tile.dart';
import '../../core/widgets/platform_chip.dart';
import '../../core/widgets/responsive_container.dart';
import '../../core/widgets/url_field.dart';
import '../../core/widgets/vidnest_logo.dart';
import '../../data/providers/download_provider.dart';
import 'widgets/preview_bottom_sheet.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final _urlController = TextEditingController();
  SupportedPlatform? _selectedPlatform;

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  void _analyzeUrl(String url) async {
    final media = await ref.read(mediaAnalysisProvider.notifier).analyze(url);
    if (!mounted) return;

    if (media != null) {
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (ctx) => PreviewBottomSheet(
          media: media,
          onDownloadStarted: () {
            Navigator.of(ctx).pop();
            _urlController.clear();
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: const Text('أُضيف إلى قائمة التنزيلات'),
                behavior: SnackBarBehavior.floating,
                shape: AppRadius.shapeSm,
                action: SnackBarAction(
                  label: 'عرض',
                  onPressed: () => context.go('/downloads'),
                ),
              ),
            );
          },
        ),
      );
    } else {
      final err = ref.read(mediaAnalysisProvider).errorMessage;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(err ?? 'تعذّر تحليل هذا الرابط، تأكد من صحته'),
          behavior: SnackBarBehavior.floating,
          shape: AppRadius.shapeSm,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final analysis = ref.watch(mediaAnalysisProvider);
    final recentTasks = ref.watch(allTasksListProvider).take(3).toList();

    return Scaffold(
      appBar: AppBar(
        title: const VidNestLogo(size: 32, showBadge: true),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => context.go('/settings'),
            tooltip: 'الإعدادات',
          ),
          const SizedBox(width: AppSpacing.sm),
        ],
      ),
      body: SafeArea(
        child: ResponsiveContainer(
          padding: AppSpacing.insetAllMd,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                AppSpacing.gapMd,
                // Hero Header
                Text(
                  'أداة الوسائط الهادئة v4',
                  style: TextStyle(
                    color: colors.primary,
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'ماذا تريد أن تحمّل اليوم؟',
                  style: TextStyle(
                    color: colors.text,
                    fontWeight: FontWeight.bold,
                    fontSize: 24,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'الصق رابط فيديو أو مقطع صوتي، استعرض خيارات الدقة فورًا، ثم احفظ الملف مباشرة في جهازك دون إعلانات وبأعلى جودة.',
                  style: TextStyle(
                    color: colors.textSecondary,
                    fontSize: 13,
                    height: 1.5,
                  ),
                ),
                AppSpacing.gapLg,

                // URL Input Field
                UrlField(
                  controller: _urlController,
                  isLoading: analysis.isAnalyzing,
                  placeholder: 'https://...',
                  onAnalyze: _analyzeUrl,
                  onCleared: () {
                    ref.read(mediaAnalysisProvider.notifier).clear();
                  },
                ),
                AppSpacing.gapSm,

                // Action Buttons Row
                Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: AppButton(
                        text: 'استعراض الجودات',
                        icon: const Icon(Icons.search_rounded, size: 18, color: Colors.white),
                        isLoading: analysis.isAnalyzing,
                        onPressed: () {
                          final text = _urlController.text.trim();
                          if (text.isNotEmpty) _analyzeUrl(text);
                        },
                      ),
                    ),
                    AppSpacing.gapSm,
                    Expanded(
                      flex: 2,
                      child: AppButton(
                        text: 'تنزيل مباشر',
                        icon: Icon(Icons.flash_on_rounded, size: 18, color: colors.text),
                        variant: AppButtonVariant.secondary,
                        onPressed: () {
                          final text = _urlController.text.trim();
                          if (text.isNotEmpty) _analyzeUrl(text);
                        },
                      ),
                    ),
                  ],
                ),
                AppSpacing.gapLg,

                // Supported Platform Chips
                Text(
                  'المنصات المدعومة',
                  style: TextStyle(
                    color: colors.text,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                AppSpacing.gapSm,
                Wrap(
                  spacing: AppSpacing.sm,
                  runSpacing: AppSpacing.sm,
                  children: SupportedPlatform.values.map((plat) {
                    final isSel = _selectedPlatform == plat;
                    return PlatformChip(
                      platform: plat,
                      isSelected: isSel,
                      onTap: () {
                        setState(() => _selectedPlatform = plat);
                        _urlController.text = plat.sampleUrl;
                        _analyzeUrl(plat.sampleUrl);
                      },
                    );
                  }).toList(),
                ),
                AppSpacing.gapXl,

                // Recent Downloads Section
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'آخر التنزيلات',
                      style: TextStyle(
                        color: colors.text,
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (recentTasks.isNotEmpty)
                      TextButton(
                        onPressed: () => context.go('/downloads'),
                        child: Text(
                          'عرض الكل',
                          style: TextStyle(color: colors.primary, fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                      ),
                  ],
                ),
                AppSpacing.gapSm,

                if (recentTasks.isEmpty)
                  Container(
                    padding: AppSpacing.insetAllLg,
                    decoration: BoxDecoration(
                      color: colors.surface,
                      borderRadius: AppRadius.radiusMd,
                      border: Border.all(color: colors.border, width: 1),
                    ),
                    child: Center(
                      child: Text(
                        'لا توجد تنزيلات حتى الآن. الصق رابطًا أعلاه للبدء.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: colors.textSecondary, fontSize: 13),
                      ),
                    ),
                  )
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: recentTasks.length,
                    separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
                    itemBuilder: (context, index) {
                      final task = recentTasks[index];
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
                  ),
                AppSpacing.gapXxl,
              ],
            ),
          ),
        ),
      ),
    );
  }
}
