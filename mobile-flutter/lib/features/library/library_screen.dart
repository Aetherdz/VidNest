import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';
import 'package:video_thumbnail/video_thumbnail.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_icons.dart';
import '../../core/theme/app_radius.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/widgets/app_button.dart';
import '../../core/widgets/demo_notice.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/responsive_container.dart';
import '../../data/models/download_task.dart';
import '../../data/providers/download_provider.dart';
import '../player/player_screen.dart';

enum LibrarySort { date, name, size }

class LibraryScreen extends ConsumerStatefulWidget {
  const LibraryScreen({super.key});

  @override
  ConsumerState<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends ConsumerState<LibraryScreen> {
  final _searchController = TextEditingController();
  final Map<String, Future<Uint8List?>> _thumbnails = {};
  final Map<String, Future<bool>> _fileAvailability = {};
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

    var filtered = completedTasks.where((task) {
      if (_searchQuery.isEmpty) return true;
      final query = _searchQuery.toLowerCase();
      return task.media.title.toLowerCase().contains(query) ||
          task.media.extractor.toLowerCase().contains(query) ||
          task.media.uploader.toLowerCase().contains(query);
    }).toList();

    switch (_sortBy) {
      case LibrarySort.date:
        filtered.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      case LibrarySort.name:
        filtered.sort((a, b) => a.media.title.compareTo(b.media.title));
      case LibrarySort.size:
        filtered.sort((a, b) =>
            (b.format.filesize ?? 0).compareTo(a.format.filesize ?? 0));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('المكتبة',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 28)),
      ),
      body: SafeArea(
        child: ResponsiveContainer(
          padding: AppSpacing.insetAllMd,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const DemoNotice(),
              AppSpacing.gapMd,
              Container(
                decoration: BoxDecoration(
                  color: colors.surface,
                  borderRadius: AppRadius.radiusMd,
                  border: Border.all(color: colors.border),
                ),
                padding: const EdgeInsetsDirectional.only(
                    start: AppSpacing.md, end: AppSpacing.xs),
                child: Row(
                  children: [
                    Icon(AppIcons.search,
                        size: 20, color: colors.textSecondary),
                    AppSpacing.gapSm,
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        onChanged: (value) =>
                            setState(() => _searchQuery = value.trim()),
                        style: TextStyle(color: colors.text, fontSize: 16),
                        decoration: InputDecoration(
                          hintText: 'ابحث في الملفات المحفوظة',
                          hintStyle: TextStyle(
                              color: colors.textSecondary, fontSize: 13),
                          border: InputBorder.none,
                          enabledBorder: InputBorder.none,
                          focusedBorder: InputBorder.none,
                          isDense: true,
                          contentPadding: const EdgeInsets.symmetric(
                              vertical: AppSpacing.md),
                        ),
                      ),
                    ),
                    if (_searchQuery.isNotEmpty)
                      IconButton(
                        tooltip: 'مسح البحث',
                        constraints:
                            const BoxConstraints(minWidth: 48, minHeight: 48),
                        icon: const Icon(AppIcons.clear),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      ),
                  ],
                ),
              ),
              AppSpacing.gapSm,
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    Text('الترتيب:',
                        style: TextStyle(
                            color: colors.textSecondary, fontSize: 13)),
                    const SizedBox(width: AppSpacing.sm),
                    _buildSortChip(LibrarySort.date, 'الأحدث', AppIcons.date),
                    const SizedBox(width: AppSpacing.sm),
                    _buildSortChip(LibrarySort.name, 'الاسم', AppIcons.name),
                    const SizedBox(width: AppSpacing.sm),
                    _buildSortChip(LibrarySort.size, 'الحجم', AppIcons.size),
                  ],
                ),
              ),
              AppSpacing.gapMd,
              Expanded(
                child: filtered.isEmpty
                    ? EmptyState(
                        icon: AppIcons.library,
                        title: _searchQuery.isEmpty
                            ? 'الصق رابطًا وابدأ'
                            : 'لا توجد نتائج مطابقة',
                        description: _searchQuery.isEmpty
                            ? 'ستظهر الملفات المحلية بعد اكتمال تنزيلها.'
                            : 'جرّب البحث باسم آخر.',
                        action: _searchQuery.isEmpty
                            ? AppButton(
                                text: 'العودة إلى الرئيسية',
                                icon: const Icon(AppIcons.paste),
                                onPressed: () => context.go('/home'),
                              )
                            : null,
                      )
                    : GridView.builder(
                        itemCount: filtered.length,
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: AppSpacing.sm,
                          mainAxisSpacing: AppSpacing.sm,
                          childAspectRatio: 0.78,
                        ),
                        itemBuilder: (context, index) =>
                            _libraryTile(context, filtered[index]),
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
    final selected = _sortBy == sort;
    return InkWell(
      onTap: () => setState(() => _sortBy = sort),
      borderRadius: AppRadius.radiusPill,
      child: Container(
        constraints: const BoxConstraints(minHeight: 44),
        padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md, vertical: AppSpacing.xs),
        decoration: BoxDecoration(
          color: selected ? colors.surfaceSubtle : colors.surface,
          borderRadius: AppRadius.radiusPill,
          border: Border.all(color: selected ? colors.text : colors.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: colors.textSecondary),
            const SizedBox(width: AppSpacing.xs),
            Text(label,
                style: TextStyle(
                    color: colors.text,
                    fontSize: 13,
                    fontWeight: selected ? FontWeight.w600 : FontWeight.w400)),
          ],
        ),
      ),
    );
  }

  Widget _libraryTile(BuildContext context, DownloadTask task) {
    final colors = context.colors;
    final thumbnailPath = task.filePath;

    return Material(
      color: colors.surface,
      shape: RoundedRectangleBorder(
        borderRadius: AppRadius.radiusMd,
        side: BorderSide(color: colors.border),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => _openFile(context, task),
        onLongPress: () => _showItemActions(context, task),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              flex: 6,
              child: FutureBuilder<bool>(
                future: _localFileExists(thumbnailPath),
                builder: (context, fileSnapshot) {
                  final fileExists = fileSnapshot.data ?? false;
                  final duration = fileExists ? task.media.duration : null;
                  final height = fileExists ? task.format.height : null;

                  return Stack(
                    fit: StackFit.expand,
                    children: [
                      Container(color: colors.surfaceSubtle),
                      if (fileExists &&
                          thumbnailPath != null &&
                          task.format.hasVideo)
                        FutureBuilder<Uint8List?>(
                          future: _thumbnailFor(thumbnailPath),
                          builder: (context, snapshot) {
                            final bytes = snapshot.data;
                            if (bytes == null) return const SizedBox.shrink();
                            return Image.memory(bytes,
                                fit: BoxFit.cover, gaplessPlayback: true);
                          },
                        ),
                      Center(
                        child: Icon(
                          task.format.hasVideo ? AppIcons.play : AppIcons.audio,
                          size: 30,
                          color: colors.primary,
                          textDirection:
                              task.format.hasVideo ? TextDirection.ltr : null,
                        ),
                      ),
                      if (duration != null && duration > 0)
                        PositionedDirectional(
                          start: AppSpacing.sm,
                          bottom: AppSpacing.sm,
                          child: _metadataBadge(_formatDuration(duration)),
                        ),
                      if (task.format.hasVideo && height != null)
                        PositionedDirectional(
                          end: AppSpacing.sm,
                          bottom: AppSpacing.sm,
                          child: _metadataBadge('${height}p'),
                        ),
                      if (fileExists && !task.format.hasVideo)
                        PositionedDirectional(
                          end: AppSpacing.sm,
                          bottom: AppSpacing.sm,
                          child: _metadataBadge('صوت'),
                        ),
                    ],
                  );
                },
              ),
            ),
            Padding(
              padding: AppSpacing.insetAllSm,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    task.media.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                        color: colors.text,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        height: 1.35),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    '${task.media.extractor} · ${task.format.formattedSize}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(color: colors.textSecondary, fontSize: 13),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _metadataBadge(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
      decoration: BoxDecoration(
        color: const Color(0xFF101828),
        borderRadius: AppRadius.radiusPill,
      ),
      child: Text(label,
          style: const TextStyle(
              color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
    );
  }

  Future<Uint8List?> _thumbnailFor(String path) {
    if (kIsWeb) return Future.value(null);
    return _thumbnails.putIfAbsent(path, () async {
      try {
        return await VideoThumbnail.thumbnailData(
          video: path,
          imageFormat: ImageFormat.JPEG,
          maxWidth: 360,
          quality: 75,
        );
      } catch (_) {
        return null;
      }
    });
  }

  Future<bool> _localFileExists(String? path) {
    if (path == null || kIsWeb) return Future.value(false);
    return _fileAvailability.putIfAbsent(path, () async {
      try {
        return await File(path).exists();
      } catch (_) {
        return false;
      }
    });
  }

  Future<void> _openFile(BuildContext context, DownloadTask task) async {
    final path = task.filePath;
    if (path == null) {
      _showMessage(context, 'الملف غير متاح للتشغيل بعد');
      return;
    }
    final exists = await _localFileExists(path);
    if (!context.mounted) return;
    if (!exists) {
      _showMessage(context, 'الملف غير متاح للتشغيل بعد');
      return;
    }
    await Navigator.of(context).push<void>(
      MaterialPageRoute<void>(
        builder: (_) => PlayerScreen(task: task),
      ),
    );
  }

  Future<void> _showItemActions(BuildContext context, DownloadTask task) async {
    final action = await showModalBottomSheet<String>(
      context: context,
      showDragHandle: true,
      builder: (sheetContext) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
                leading: const Icon(AppIcons.share),
                title: const Text('مشاركة'),
                onTap: () => Navigator.pop(sheetContext, 'share')),
            ListTile(
                leading: const Icon(AppIcons.name),
                title: const Text('إعادة تسمية'),
                onTap: () => Navigator.pop(sheetContext, 'rename')),
            ListTile(
                leading: const Icon(AppIcons.delete),
                title: const Text('حذف'),
                onTap: () => Navigator.pop(sheetContext, 'delete')),
            const SizedBox(height: AppSpacing.sm),
          ],
        ),
      ),
    );
    if (!context.mounted) return;
    switch (action) {
      case 'share':
        await _shareFile(context, task);
        break;
      case 'rename':
        await _renameFile(context, task);
        break;
      case 'delete':
        await _confirmDelete(context, task);
        break;
    }
  }

  Future<void> _shareFile(BuildContext context, DownloadTask task) async {
    try {
      final box = context.findRenderObject() as RenderBox?;
      final shareOrigin = box == null
          ? const Rect.fromLTWH(0, 0, 1, 1)
          : box.localToGlobal(Offset.zero) & box.size;
      final path = task.filePath;
      if (path == null || !await _localFileExists(path)) {
        if (context.mounted) {
          _showMessage(context, 'الملف غير متاح للمشاركة بعد');
        }
        return;
      }
      await Share.shareXFiles(
        [XFile(path)],
        text: task.media.title,
        sharePositionOrigin: shareOrigin,
      );
    } catch (_) {
      if (context.mounted) _showMessage(context, 'تعذّرت مشاركة الملف');
    }
  }

  Future<void> _renameFile(BuildContext context, DownloadTask task) async {
    final controller = TextEditingController(text: task.media.title);
    final title = await showDialog<String>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('إعادة تسمية'),
        content: TextField(
          controller: controller,
          autofocus: true,
          maxLength: 160,
          decoration: const InputDecoration(labelText: 'اسم الملف'),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('إلغاء')),
          FilledButton(
              onPressed: () => Navigator.pop(dialogContext, controller.text),
              child: const Text('حفظ')),
        ],
      ),
    );
    controller.dispose();
    if (title == null || title.trim().isEmpty || !context.mounted) return;
    ref.read(downloadRepositoryProvider).renameTask(task.id, title);
  }

  Future<void> _confirmDelete(BuildContext context, DownloadTask task) async {
    final shouldDelete = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('حذف الملف'),
        content: const Text('هل تريد حذف هذا العنصر من المكتبة؟'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: const Text('إلغاء')),
          FilledButton(
              onPressed: () => Navigator.pop(dialogContext, true),
              child: const Text('حذف')),
        ],
      ),
    );
    if (shouldDelete == true) {
      ref.read(downloadRepositoryProvider).deleteTask(task.id);
    }
  }

  void _showMessage(BuildContext context, String message) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }

  String _formatDuration(int seconds) {
    final minutes = seconds ~/ 60;
    final remainder = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${remainder.toString().padLeft(2, '0')}';
  }
}
