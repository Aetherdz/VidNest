import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/download_task.dart';
import '../../data/providers/download_provider.dart';
import '../../l10n/app_localizations.dart';
import '../../features/player/player_screen.dart';
import '../adapters/supported_link.dart';
import '../theme/app_theme.dart';
import '../widgets/media_thumb.dart';

/// Play tab: completed downloads from the existing repository, opened in the
/// existing [PlayerScreen]. No download logic is duplicated here.
class PlayScreen extends ConsumerWidget {
  const PlayScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final palette = context.palette;
    final l10n = AppLocalizations.of(context)!;
    final tasks = ref.watch(completedTasksProvider);

    return Scaffold(
      backgroundColor: palette.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 20, 16, 12),
              child: Text(
                l10n.playTitle,
                style: TextStyle(
                  color: palette.text,
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            Expanded(
              child: tasks.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 32),
                        child: Text(
                          l10n.playEmpty,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: palette.textSecondary,
                            fontSize: 15,
                          ),
                        ),
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                      itemCount: tasks.length,
                      separatorBuilder: (_, __) =>
                          const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final task = tasks[index];
                        return _PlayTile(task: task);
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PlayTile extends StatelessWidget {
  const _PlayTile({required this.task});

  final DownloadTask task;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final l10n = AppLocalizations.of(context)!;
    final link = describeMediaLink(task.media.url);

    return Material(
      color: palette.surfaceSubtle,
      borderRadius: VidNestPalette.radiusCard,
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        borderRadius: VidNestPalette.radiusCard,
        onTap: () {
          if (task.filePath == null) {
            ScaffoldMessenger.of(context)
              ..hideCurrentSnackBar()
              ..showSnackBar(SnackBar(content: Text(l10n.playEmpty)));
            return;
          }
          Navigator.of(context).push<void>(
            MaterialPageRoute<void>(
              builder: (_) => PlayerScreen(task: task),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              MediaThumb(
                size: 56,
                site: link?.site,
                imageUrl: task.media.thumbnailUrl,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      task.media.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: palette.text,
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${task.format.quality} · ${task.format.ext.toUpperCase()}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: palette.textSecondary,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Icon(Icons.play_arrow_rounded, color: palette.text, size: 24),
            ],
          ),
        ),
      ),
    );
  }
}
