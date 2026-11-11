class MediaFormat {
  const MediaFormat({
    required this.id,
    required this.quality,
    required this.ext,
    this.filesize,
    this.hasVideo = true,
    this.hasAudio = true,
    this.height,
    this.directUrl,
  });

  final String id;
  final String quality;
  final String ext;
  final int? filesize;
  final bool hasVideo;
  final bool hasAudio;
  final int? height;
  final String? directUrl;

  String get formattedSize {
    if (filesize == null || filesize! <= 0) return 'غير معروف';
    final bytes = filesize!;
    if (bytes >= 1024 * 1024 * 1024) {
      return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
    } else if (bytes >= 1024 * 1024) {
      return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    } else if (bytes >= 1024) {
      return '${(bytes / 1024).toStringAsFixed(0)} KB';
    }
    return '$bytes B';
  }

  String get label {
    if (!hasVideo) return 'Audio (${ext.toUpperCase()})';
    return '$quality (${ext.toUpperCase()})';
  }
}

class MediaItem {
  const MediaItem({
    required this.id,
    required this.url,
    required this.title,
    required this.uploader,
    required this.extractor,
    this.duration,
    this.thumbnailUrl,
    required this.formats,
    this.selectedFormatId,
  });

  final String id;
  final String url;
  final String title;
  final String uploader;
  final String extractor;
  final int? duration;
  final String? thumbnailUrl;
  final List<MediaFormat> formats;
  final String? selectedFormatId;

  MediaFormat? get selectedFormat {
    if (selectedFormatId == null) {
      return formats.isNotEmpty ? formats.first : null;
    }
    return formats.firstWhere(
      (f) => f.id == selectedFormatId,
      orElse: () => formats.first,
    );
  }

  String get formattedDuration {
    if (duration == null || duration! <= 0) return '—';
    final m = duration! ~/ 60;
    final s = duration! % 60;
    final mm = m.toString().padLeft(2, '0');
    final ss = s.toString().padLeft(2, '0');
    return '$mm:$ss';
  }

  MediaItem copyWith({
    String? id,
    String? url,
    String? title,
    String? uploader,
    String? extractor,
    int? duration,
    String? thumbnailUrl,
    List<MediaFormat>? formats,
    String? selectedFormatId,
  }) {
    return MediaItem(
      id: id ?? this.id,
      url: url ?? this.url,
      title: title ?? this.title,
      uploader: uploader ?? this.uploader,
      extractor: extractor ?? this.extractor,
      duration: duration ?? this.duration,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      formats: formats ?? this.formats,
      selectedFormatId: selectedFormatId ?? this.selectedFormatId,
    );
  }
}
