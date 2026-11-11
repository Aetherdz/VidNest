import 'media_item.dart';

enum DownloadStatus {
  queued,
  downloading,
  completed,
  paused,
  failed,
}

class DownloadTask {
  const DownloadTask({
    required this.id,
    required this.media,
    required this.format,
    this.progress = 0.0,
    this.status = DownloadStatus.queued,
    this.downloadedBytes = 0,
    this.totalBytes = 0,
    this.speedText = '',
    this.filePath,
    this.errorMessage,
    required this.createdAt,
  });

  final String id;
  final MediaItem media;
  final MediaFormat format;
  final double progress;
  final DownloadStatus status;
  final int downloadedBytes;
  final int totalBytes;
  final String speedText;
  final String? filePath;
  final String? errorMessage;
  final DateTime createdAt;

  bool get isCompleted => status == DownloadStatus.completed;
  bool get isActive => status == DownloadStatus.downloading || status == DownloadStatus.queued;
  bool get isFailed => status == DownloadStatus.failed;
  bool get isPaused => status == DownloadStatus.paused;

  String get percentText => '${(progress * 100).clamp(0, 100).toInt()}%';

  String get sizeSummary {
    if (totalBytes > 0) {
      final cur = (downloadedBytes / (1024 * 1024)).toStringAsFixed(1);
      final tot = (totalBytes / (1024 * 1024)).toStringAsFixed(1);
      return '$cur / $tot MB';
    }
    return format.formattedSize;
  }

  DownloadTask copyWith({
    String? id,
    MediaItem? media,
    MediaFormat? format,
    double? progress,
    DownloadStatus? status,
    int? downloadedBytes,
    int? totalBytes,
    String? speedText,
    String? filePath,
    String? errorMessage,
    DateTime? createdAt,
  }) {
    return DownloadTask(
      id: id ?? this.id,
      media: media ?? this.media,
      format: format ?? this.format,
      progress: progress ?? this.progress,
      status: status ?? this.status,
      downloadedBytes: downloadedBytes ?? this.downloadedBytes,
      totalBytes: totalBytes ?? this.totalBytes,
      speedText: speedText ?? this.speedText,
      filePath: filePath ?? this.filePath,
      errorMessage: errorMessage ?? this.errorMessage,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
