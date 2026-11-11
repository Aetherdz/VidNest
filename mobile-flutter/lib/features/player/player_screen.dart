import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_icons.dart';
import '../../core/theme/app_spacing.dart';
import '../../data/models/download_task.dart';

class PlayerScreen extends StatefulWidget {
  const PlayerScreen({super.key, required this.task});

  final DownloadTask task;

  @override
  State<PlayerScreen> createState() => _PlayerScreenState();
}

class _PlayerScreenState extends State<PlayerScreen> {
  late final VideoPlayerController _controller;
  Object? _initializationError;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.file(File(widget.task.filePath!));
    _initializePlayer();
  }

  Future<void> _initializePlayer() async {
    try {
      await _controller.initialize();
      await _controller.setLooping(false);
      await _controller.play();
      if (mounted) setState(() {});
    } catch (error) {
      if (mounted) setState(() => _initializationError = error);
    }
  }

  @override
  void dispose() {
    unawaited(_controller.dispose());
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final initialized = _controller.value.isInitialized;

    return Scaffold(
      backgroundColor: const Color(0xFF101828),
      appBar: AppBar(
        backgroundColor: const Color(0xFF101828),
        foregroundColor: Colors.white,
        title: Text(
          widget.task.media.title,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Center(
                child: _initializationError != null
                    ? const _PlayerMessage(
                        icon: AppIcons.close,
                        message: 'تعذّر تشغيل هذا الملف.',
                      )
                    : initialized
                        ? AspectRatio(
                            aspectRatio: _controller.value.aspectRatio,
                            child: VideoPlayer(_controller),
                          )
                        : const CircularProgressIndicator(
                            color: Color(0xFFF26B1D),
                          ),
              ),
            ),
            if (initialized)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
                color: colors.surface,
                child: ValueListenableBuilder<VideoPlayerValue>(
                  valueListenable: _controller,
                  builder: (context, value, _) => Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Slider(
                              value: value.duration.inMilliseconds == 0
                                  ? 0
                                  : value.position.inMilliseconds
                                      .clamp(0, value.duration.inMilliseconds)
                                      .toDouble(),
                              max: value.duration.inMilliseconds == 0
                                  ? 1
                                  : value.duration.inMilliseconds.toDouble(),
                              onChanged: value.duration.inMilliseconds == 0
                                  ? null
                                  : (position) => _controller.seekTo(
                                        Duration(
                                          milliseconds: position.round(),
                                        ),
                                      ),
                            ),
                          ),
                          IconButton.filled(
                            tooltip: value.isPlaying ? 'إيقاف مؤقت' : 'تشغيل',
                            onPressed: () => value.isPlaying
                                ? _controller.pause()
                                : _controller.play(),
                            icon: Icon(
                              value.isPlaying ? AppIcons.pause : AppIcons.play,
                              textDirection: TextDirection.ltr,
                            ),
                          ),
                        ],
                      ),
                      Align(
                        alignment: AlignmentDirectional.centerStart,
                        child: Directionality(
                          textDirection: TextDirection.ltr,
                          child: Text(
                            '${_formatDuration(value.position)} / ${_formatDuration(value.duration)}',
                            style: TextStyle(
                              color: colors.textSecondary,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ),
                      AppSpacing.gapSm,
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  String _formatDuration(Duration duration) {
    final minutes = duration.inMinutes;
    final seconds = duration.inSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }
}

class _PlayerMessage extends StatelessWidget {
  const _PlayerMessage({required this.icon, required this.message});

  final IconData icon;
  final String message;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: Colors.white70, size: 32),
        AppSpacing.gapMd,
        Text(
          message,
          style: const TextStyle(color: Colors.white, fontSize: 16),
        ),
      ],
    );
  }
}
