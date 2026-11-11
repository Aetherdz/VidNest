import 'package:flutter_test/flutter_test.dart';
import 'package:vidnest/data/models/download_task.dart';
import 'package:vidnest/data/models/media_item.dart';
import 'package:vidnest/data/repositories/download_repository.dart';

void main() {
  group('DownloadRepository Tests', () {
    late DownloadRepository repo;

    setUp(() {
      repo = DownloadRepository();
    });

    tearDown(() {
      repo.dispose();
    });

    test('initializes with seed tasks in completed state', () {
      expect(repo.allTasks.length, greaterThanOrEqualTo(3));
      expect(repo.allTasks.every((t) => t.isCompleted), isTrue);
    });

    test('startDownload creates an active downloading task', () {
      const media = MediaItem(
        id: 'test_m',
        url: 'https://youtube.com/watch?v=sample',
        title: 'Sample Video',
        uploader: 'Tester',
        extractor: 'YouTube',
        formats: [],
      );
      const format = MediaFormat(
          id: '1080p',
          quality: '1080p',
          ext: 'mp4',
          filesize: 50 * 1024 * 1024);

      final task = repo.startDownload(media, format);
      expect(task.status, DownloadStatus.downloading);
      expect(task.progress, greaterThan(0));
      expect(repo.allTasks.first.id, task.id);
    });

    test('pauseTask and resumeTask toggle download state', () {
      const media = MediaItem(
        id: 'm_pause',
        url: 'https://youtube.com/watch?v=pause',
        title: 'Pause Test',
        uploader: 'Tester',
        extractor: 'YouTube',
        formats: [],
      );
      const format = MediaFormat(id: '720p', quality: '720p', ext: 'mp4');

      final task = repo.startDownload(media, format);
      repo.pauseTask(task.id);
      expect(repo.allTasks.firstWhere((t) => t.id == task.id).status,
          DownloadStatus.paused);

      repo.resumeTask(task.id);
      expect(repo.allTasks.firstWhere((t) => t.id == task.id).status,
          DownloadStatus.downloading);
    });

    test('cancelTask removes task from list', () {
      const media = MediaItem(
        id: 'm_cancel',
        url: 'https://youtube.com/watch?v=cancel',
        title: 'Cancel Test',
        uploader: 'Tester',
        extractor: 'YouTube',
        formats: [],
      );
      const format = MediaFormat(id: '480p', quality: '480p', ext: 'mp4');

      final task = repo.startDownload(media, format);
      expect(repo.allTasks.any((t) => t.id == task.id), isTrue);

      repo.cancelTask(task.id);
      expect(repo.allTasks.any((t) => t.id == task.id), isFalse);
    });

    test('clearHistory removes completed tasks', () {
      expect(repo.allTasks.any((t) => t.isCompleted), isTrue);
      repo.clearHistory();
      expect(repo.allTasks.any((t) => t.isCompleted), isFalse);
    });

    test('renameTask trims title and ignores empty replacements', () {
      repo.renameTask('init_1', '  renamed media  ');
      expect(
          repo.allTasks.firstWhere((task) => task.id == 'init_1').media.title,
          'renamed media');

      repo.renameTask('init_1', '   ');
      expect(
          repo.allTasks.firstWhere((task) => task.id == 'init_1').media.title,
          'renamed media');
    });

    test('unknown media size stays unknown instead of guessing a value', () {
      const format = MediaFormat(id: 'unknown', quality: 'unknown', ext: 'mp4');
      expect(format.formattedSize, 'غير معروف');
    });
  });
}
