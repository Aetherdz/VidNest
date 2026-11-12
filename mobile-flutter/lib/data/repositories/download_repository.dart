import 'dart:async';
import 'dart:math';
import '../models/download_task.dart';
import '../models/media_item.dart';

class DownloadRepository {
  /// Production starts empty: the queue only ever shows real user downloads.
  /// Tests may inject tasks through [initialTasks].
  DownloadRepository({List<DownloadTask> initialTasks = const []}) {
    _tasks.addAll(initialTasks);
    _startProgressSimulator();
  }

  final _tasks = <DownloadTask>[];
  final _tasksController = StreamController<List<DownloadTask>>.broadcast();
  Timer? _progressTimer;

  Stream<List<DownloadTask>> watchTasks() => _tasksController.stream;
  List<DownloadTask> get allTasks => List.unmodifiable(_tasks);

  void _notify() {
    _tasksController.add(List.unmodifiable(_tasks));
  }

  void _startProgressSimulator() {
    _progressTimer = Timer.periodic(const Duration(milliseconds: 700), (_) {
      bool changed = false;
      final rng = Random();

      for (int i = 0; i < _tasks.length; i++) {
        final t = _tasks[i];
        if (t.status == DownloadStatus.downloading && t.progress < 1.0) {
          changed = true;
          final step = 0.04 + rng.nextDouble() * 0.06;
          final newProg = (t.progress + step).clamp(0.0, 1.0);
          final isDone = newProg >= 1.0;
          final total = t.format.filesize ?? (40 * 1024 * 1024);
          final downloaded = (total * newProg).toInt();

          _tasks[i] = t.copyWith(
            progress: newProg,
            downloadedBytes: downloaded,
            totalBytes: total,
            speedText: isDone
                ? ''
                : '${(1.8 + rng.nextDouble() * 1.5).toStringAsFixed(1)} MB/s',
            status:
                isDone ? DownloadStatus.completed : DownloadStatus.downloading,
            filePath: isDone
                ? '/storage/downloads/${t.media.id}.${t.format.ext}'
                : null,
          );
        }
      }

      if (changed) _notify();
    });
  }

  DownloadTask startDownload(MediaItem media, MediaFormat format) {
    final total = format.filesize ?? (45 * 1024 * 1024);
    final task = DownloadTask(
      id: 'task_${DateTime.now().millisecondsSinceEpoch}',
      media: media,
      format: format,
      progress: 0.05,
      status: DownloadStatus.downloading,
      downloadedBytes: (total * 0.05).toInt(),
      totalBytes: total,
      speedText: '2.1 MB/s',
      createdAt: DateTime.now(),
    );

    _tasks.insert(0, task);
    _notify();
    return task;
  }

  void pauseTask(String id) {
    final idx = _tasks.indexWhere((t) => t.id == id);
    if (idx != -1 && _tasks[idx].status == DownloadStatus.downloading) {
      _tasks[idx] = _tasks[idx].copyWith(
        status: DownloadStatus.paused,
        speedText: '',
      );
      _notify();
    }
  }

  void resumeTask(String id) {
    final idx = _tasks.indexWhere((t) => t.id == id);
    if (idx != -1 && _tasks[idx].status == DownloadStatus.paused) {
      _tasks[idx] = _tasks[idx].copyWith(
        status: DownloadStatus.downloading,
        speedText: '2.4 MB/s',
      );
      _notify();
    }
  }

  void retryTask(String id) {
    final idx = _tasks.indexWhere((t) => t.id == id);
    if (idx != -1) {
      _tasks[idx] = _tasks[idx].copyWith(
        status: DownloadStatus.downloading,
        progress: 0.05,
        errorMessage: null,
        speedText: '1.9 MB/s',
      );
      _notify();
    }
  }

  void cancelTask(String id) {
    final idx = _tasks.indexWhere((t) => t.id == id);
    if (idx != -1) {
      _tasks.removeAt(idx);
      _notify();
    }
  }

  void deleteTask(String id) {
    cancelTask(id);
  }

  void renameTask(String id, String title) {
    final normalizedTitle = title.trim();
    if (normalizedTitle.isEmpty) return;
    final index = _tasks.indexWhere((task) => task.id == id);
    if (index == -1) return;
    _tasks[index] = _tasks[index].copyWith(
      media: _tasks[index].media.copyWith(title: normalizedTitle),
    );
    _notify();
  }

  void clearHistory() {
    _tasks.removeWhere((t) => t.isCompleted || t.isFailed);
    _notify();
  }

  void dispose() {
    _progressTimer?.cancel();
    _tasksController.close();
  }
}
