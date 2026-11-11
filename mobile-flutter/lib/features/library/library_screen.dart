import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radius.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/responsive_container.dart';
import '../../data/providers/download_provider.dart';

enum LibrarySort { date, name, size }

class LibraryScreen extends ConsumerStatefulWidget {
  const LibraryScreen({super.key});

  @override
  ConsumerState<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends ConsumerState<LibraryScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';
  LibrarySort _sortBy = LibrarySort.date;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final completedTasks = ref.watch(completedTasksProvider);

    // Filter
    var filtered = completedTasks.where((t) {
      if (_searchQuery.isEmpty) return true;
      final q = _searchQuery.toLowerCase();
      return t.media.title.toLowerCase().contains(q) ||
          t.media.extractor.toLowerCase().contains(q) ||
          t.media.uploader.toLowerCase().contains(q);
    }).toList();

    // Sort
    switch (_sortBy) {
      case LibrarySort.date:
        filtered.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      case LibrarySort.name:
        filtered.sort((a, b) => a.media.title.compareTo(b.media.title));
      case LibrarySort.size:
        filtered.sort((a, b) => (b.format.filesize ?? 0).compareTo(a.format.filesize ?? 0));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('مكتبة الوسائط', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
      ),
      body: SafeArea(
        child: ResponsiveContainer(
          padding: AppSpacing.insetAllMd,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Search Field
              Container(
                decoration: BoxDecoration(
                  color: colors.surface,
                  borderRadius: AppRadius.radiusSm,
                  border: Border.all(color: colors.border, width: 1),
                ),
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: Row(
                  children: [
                    Icon(Icons.search_rounded, size: 20, color: colors.textSecondary),
                    AppSpacing.gapSm,
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        onChanged: (val) => setState(() => _searchQuery = val.trim()),
                        style: TextStyle(color: colors.text, fontSize: 13),
                        decoration: InputDecoration(
                          hintText: 'ابحث في الفيديوهات والصوتيات المحفوظة...',
                          hintStyle: TextStyle(color: colors.textSecondary, fontSize: 13),
                          border: InputBorder.none,
                          enabledBorder: InputBorder.none,
                          focusedBorder: InputBorder.none,
                          isDense: true,
                          contentPadding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
                    if (_searchQuery.isNotEmpty)
                      IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      ),
                  ],
                ),
              ),
              AppSpacing.gapSm,

              // Sort Row
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    Text(
                      'الترتيب: ',
                      style: TextStyle(color: colors.textSecondary, fontSize: 12),
                    ),
                    AppSpacing.gapSm,
                    _buildSortChip(LibrarySort.date, 'التاريخ', Icons.calendar_today_rounded),
                    const SizedBox(width: 6),
                    _buildSortChip(LibrarySort.name, 'الاسم', Icons.sort_by_alpha_rounded),
                    const SizedBox(width: 6),
                    _buildSortChip(LibrarySort.size, 'الحجم', Icons.data_usage_rounded),
                  ],
                ),
              ),
              AppSpacing.gapMd,

              // Content List
              Expanded(
                child: filtered.isEmpty
                    ? EmptyState(
                        icon: Icons.video_library_outlined,
                        title: _searchQuery.isEmpty ? 'لا توجد ملفات في المكتبة' : 'لا توجد نتائج مطابقة',
                        description: _searchQuery.isEmpty
                            ? 'الملفات المكتملة ستظهر هنا مرتبة وجاهزة للتشغيل.'
                            : 'جرّب البحث باسم آخر أو بمصطلح مختلف.',
                      )
                    : ListView.separated(
                        itemCount: filtered.length,
                        separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
                        itemBuilder: (context, index) {
                          final task = filtered[index];
                          return Container(
                            decoration: BoxDecoration(
                              color: colors.surface,
                              borderRadius: AppRadius.radiusMd,
                              border: Border.all(color: colors.border, width: 1),
                            ),
                            padding: AppSpacing.insetAllMd,
                            child: Row(
                              children: [
                                // Thumbnail / Icon
                                Container(
                                  width: 48,
                                  height: 48,
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [colors.primary, colors.primaryDark],
                                    ),
                                    borderRadius: AppRadius.radiusSm,
                                  ),
                                  child: Center(
                                    child: Icon(
                                      task.format.hasVideo ? Icons.play_arrow_rounded : Icons.graphic_eq_rounded,
                                      color: Colors.white,
                                      size: 24,
                                    ),
                                  ),
                                ),
                                AppSpacing.gapMd,
                                // Metadata
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
                                          fontSize: 13,
                                        ),
                                      ),
                                      const SizedBox(height: 3),
                                      Text(
                                        '${task.media.extractor} · ${task.format.quality} · ${task.format.formattedSize}',
                                        style: TextStyle(color: colors.textSecondary, fontSize: 11),
                                      ),
                                    ],
                                  ),
                                ),
                                // Action buttons
                                IconButton(
                                  icon: const Icon(Icons.share_rounded, size: 18),
                                  tooltip: 'مشاركة',
                                  onPressed: () {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('تم فتح نافذة المشاركة')),
                                    );
                                  },
                                ),
                                IconButton(
                                  icon: Icon(Icons.play_circle_fill_rounded, size: 26, color: colors.primary),
                                  tooltip: 'تشغيل',
                                  onPressed: () {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text('تشغيل: ${task.media.title}')),
                                    );
                                  },
                                ),
                              ],
                            ),
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSortChip(LibrarySort sort, String label, IconData icon) {
    final colors = context.colors;
    final isSelected = _sortBy == sort;

    return InkWell(
      onTap: () => setState(() => _sortBy = sort),
      borderRadius: AppRadius.radiusPill,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? colors.primaryTint : colors.surfaceSubtle,
          borderRadius: AppRadius.radiusPill,
          border: Border.all(
            color: isSelected ? colors.primary : colors.border,
            width: isSelected ? 1.2 : 0.8,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 13, color: isSelected ? colors.primaryDark : colors.textSecondary),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? colors.primaryDark : colors.text,
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
