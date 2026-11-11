import '../models/media_item.dart';
import 'extractor_interface.dart';

class UniversalMediaExtractor implements MediaExtractor {
  const UniversalMediaExtractor();

  @override
  bool canHandle(String url) {
    final lower = url.toLowerCase().trim();
    return lower.startsWith('http://') || lower.startsWith('https://');
  }

  @override
  Future<MediaItem> extract(String url) async {
    final lower = url.toLowerCase().trim();
    String extractor = 'Universal';
    String title = 'مقطع فيديو عالي الدقة';
    String uploader = 'Atheerium Creator';
    int duration = 212; // 03:32
    bool isAudioOnly = false;

    if (lower.contains('tiktok.com')) {
      extractor = 'TikTok';
      title = 'رحلة استكشاف الصحراء الجزائرية #الجزائر #سياحة';
      uploader = '@algeria_vibes';
      duration = 48;
    } else if (lower.contains('youtube.com') || lower.contains('youtu.be')) {
      extractor = 'YouTube';
      title = 'دليل التصوير السينمائي بالهاتف المحمول 2026';
      uploader = 'فنون التصوير الرقمي';
      duration = 545; // 09:05
    } else if (lower.contains('instagram.com')) {
      extractor = 'Instagram';
      title = 'غروب مذهل فوق قمم الأوراس الشامخة';
      uploader = '@auras_traveler';
      duration = 24;
    } else if (lower.contains('x.com') || lower.contains('twitter.com')) {
      extractor = 'X';
      title = 'لقطات حصرية لانطلاق القمر الصناعي العربي الجديد';
      uploader = '@SpaceArabia';
      duration = 88;
    } else if (lower.contains('soundcloud.com')) {
      extractor = 'SoundCloud';
      title = 'مقطوعة هادئة مستوحاة من رمال الصحراء والرياح';
      uploader = 'Atheerium Sounds';
      duration = 265;
      isAudioOnly = true;
    } else if (lower.contains('facebook.com') || lower.contains('fb.watch')) {
      extractor = 'Facebook';
      title = 'تقرير وثائقي عن الصناعات التقليدية والحرف اليدوية';
      uploader = 'تراث وأصالة';
      duration = 340;
    }

    final formats = <MediaFormat>[];
    if (isAudioOnly) {
      formats.addAll([
        const MediaFormat(
          id: 'mp3_320',
          quality: '320 kbps',
          ext: 'mp3',
          filesize: 8 * 1024 * 1024,
          hasVideo: false,
          hasAudio: true,
        ),
        const MediaFormat(
          id: 'm4a_256',
          quality: '256 kbps',
          ext: 'm4a',
          filesize: 6 * 1024 * 1024,
          hasVideo: false,
          hasAudio: true,
        ),
      ]);
    } else {
      formats.addAll([
        const MediaFormat(
          id: '1080p',
          quality: '1080p',
          ext: 'mp4',
          filesize: 68 * 1024 * 1024,
          hasVideo: true,
          hasAudio: true,
        ),
        const MediaFormat(
          id: '720p',
          quality: '720p',
          ext: 'mp4',
          filesize: 36 * 1024 * 1024,
          hasVideo: true,
          hasAudio: true,
        ),
        const MediaFormat(
          id: '480p',
          quality: '480p',
          ext: 'mp4',
          filesize: 18 * 1024 * 1024,
          hasVideo: true,
          hasAudio: true,
        ),
        const MediaFormat(
          id: 'audio_mp3',
          quality: 'صوت فقط (MP3)',
          ext: 'mp3',
          filesize: 5 * 1024 * 1024,
          hasVideo: false,
          hasAudio: true,
        ),
      ]);
    }

    return MediaItem(
      id: 'media_${DateTime.now().millisecondsSinceEpoch}',
      url: url,
      title: title,
      uploader: uploader,
      extractor: extractor,
      duration: duration,
      formats: formats,
      selectedFormatId: formats.first.id,
    );
  }
}
