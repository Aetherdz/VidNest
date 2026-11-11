import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_icons.dart';
import '../../core/theme/app_radius.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/widgets/app_button.dart';
import '../../core/widgets/download_tile.dart';
import '../../core/widgets/demo_notice.dart';
import '../../core/widgets/platform_chip.dart';
import '../../core/widgets/responsive_container.dart';
import '../../core/widgets/url_field.dart';
import '../../core/widgets/vidnest_logo.dart';
import '../../data/models/download_task.dart';
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
  String? _lastStartedUrl;

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  void _analyzeUrl(String url) async {
    if (!_isValidHttpsUrl(url)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('أدخل رابط HTTPS صالحًا للبدء')),
      );
      return;
    }

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
            _lastStartedUrl = url;
            Navigator.of(ctx).pop();
            _urlController.clear();
            setState(() {});
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: const Text('بدأت محاكاة التنزيل؛ لن يُحفظ ملف فعلي.'),
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
    final allTasks = ref.watch(allTasksListProvider);
    final recentTasks = allTasks.take(3).toList();
    final canDownload = _isValidHttpsUrl(_urlController.text);
    DownloadTask? lastTask;
    if (_lastStartedUrl != null) {
      for (final task in allTasks) {
        if (task.media.url == _lastStartedUrl) {
          lastTask = task;
          break;
        }
      }
    }
    final isDownloading = lastTask?.isActive ?? false;
    final isDone = lastTask?.isCompleted ?? false;
    final matchesLastUrl = _urlController.text.trim().isEmpty ||
        _urlController.text.trim() == _lastStartedUrl;
    final downloadLabel = analysis.isAnalyzing
        ? 'جارٍ تحليل الرابط'
        : matchesLastUrl && isDownloading
            ? 'جارٍ محاكاة التنزيل'
            : matchesLastUrl && isDone
                ? 'اكتملت المحاكاة'
                : 'تنزيل تجريبي';

    return Scaffold(
      appBar: AppBar(
        title: const VidNestLogo(size: 32, showBadge: true),
        actions: [
          IconButton(
            icon: const Icon(AppIcons.settings),
            onPressed: () => context.push('/settings'),
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
                const DemoNotice(),
                AppSpacing.gapMd,
                // Hero Header
                Text(
                  'أداة الوسائط الهادئة',
                  style: TextStyle(
                    color: colors.textSecondary,
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
                    fontSize: 28,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'الصق رابط فيديو أو مقطع صوتي، استعرض خيارات الدقة فورًا، ثم احفظ الملف مباشرة في جهازك دون إعلانات وبأعلى جودة.',
                  style: TextStyle(
                    color: colors.textSecondary,
                    fontSize: 16,
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
                  onChanged: (_) => setState(() {}),
                  onCleared: () {
                    ref.read(mediaAnalysisProvider.notifier).clear();
                  },
                ),
                AppSpacing.gapSm,

                // Primary download action
                Row(
                  children: [
                    Expanded(
                      child: AppButton(
                        text: downloadLabel,
                        icon: Icon(AppIcons.download,
                            size: 20, color: colors.text),
                        isLoading: analysis.isAnalyzing || isDownloading,
                        onPressed: canDownload &&
                                !analysis.isAnalyzing &&
                                !isDownloading
                            ? () => _analyzeUrl(_urlController.text.trim())
                            : null,
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
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                AppSpacing.gapSm,
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: SupportedPlatform.values.map((plat) {
                      final isSel = _selectedPlatform == plat;
                      return Padding(
                        padding: const EdgeInsetsDirectional.only(
                            end: AppSpacing.sm),
                        child: PlatformChip(
                          platform: plat,
                          isSelected: isSel,
                          onTap: () {
                            setState(() {
                              _selectedPlatform = plat;
                              _urlController.text = plat.sampleUrl;
                            });
                            _analyzeUrl(plat.sampleUrl);
                          },
                        ),
                      );
                    }).toList(),
                  ),
                ),
                AppSpacing.gapXl,

                // Recent Downloads Section
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        'آخر التنزيلات',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: colors.text,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    if (recentTasks.isNotEmpty)
                      TextButton(
                        onPressed: () => context.go('/downloads'),
                        child: Text(
                          'عرض الكل',
                          style: TextStyle(
                              color: colors.text,
                              fontSize: 13,
                              fontWeight: FontWeight.w600),
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
                        style: TextStyle(
                            color: colors.textSecondary, fontSize: 13),
                      ),
                    ),
                  )
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: recentTasks.length,
                    separatorBuilder: (_, __) =>
                        const SizedBox(height: AppSpacing.sm),
                    itemBuilder: (context, index) {
                      final task = recentTasks[index];
                      return DownloadTile(
                        task: task,
                        onPause: () => ref
                            .read(downloadRepositoryProvider)
                            .pauseTask(task.id),
                        onResume: () => ref
                            .read(downloadRepositoryProvider)
                            .resumeTask(task.id),
                        onCancel: () => ref
                            .read(downloadRepositoryProvider)
                            .cancelTask(task.id),
                        onDelete: () => ref
                            .read(downloadRepositoryProvider)
                            .deleteTask(task.id),
                        onRetry: () => ref
                            .read(downloadRepositoryProvider)
                            .retryTask(task.id),
                        onShare: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: Text(
                                    'مشاركة الملفات غير متاحة في نسخة المعاينة')),
                          );
                        },
                        onOpen: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: Text(
                                    'الملف غير متاح للتشغيل في نسخة المعاينة')),
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

bool _isValidHttpsUrl(String value) {
  final uri = Uri.tryParse(value.trim());
  if (uri == null ||
      uri.scheme.toLowerCase() != 'https' ||
      uri.host.isEmpty ||
      uri.userInfo.isNotEmpty) {
    return false;
  }

  final host = uri.host.toLowerCase();
  if (host == 'localhost' ||
      host.endsWith('.local') ||
      host == '::1' ||
      host == '0.0.0.0') {
    return false;
  }
  final ipv4 = RegExp(r'^\d{1,3}(?:\.\d{1,3}){3}$');
  if (ipv4.hasMatch(host)) {
    final parts = host.split('.').map(int.parse).toList();
    if (parts.any((part) => part > 255) ||
        parts[0] == 10 ||
        parts[0] == 127 ||
        (parts[0] == 192 && parts[1] == 168) ||
        (parts[0] == 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] == 169 && parts[1] == 254)) {
      return false;
    }
  }
  return true;
}
