import 'package:flutter_test/flutter_test.dart';
import 'package:vidnest/data/extractors/mock_extractor.dart';

void main() {
  group('UniversalMediaExtractor Tests', () {
    const extractor = UniversalMediaExtractor();

    test('canHandle accepts valid HTTP and HTTPS links', () {
      expect(extractor.canHandle('https://www.tiktok.com/@user/video/123'), isTrue);
      expect(extractor.canHandle('https://youtu.be/xyz'), isTrue);
      expect(extractor.canHandle('http://example.com/video.mp4'), isTrue);
      expect(extractor.canHandle('ftp://example.com/file'), isFalse);
    });

    test('extracts TikTok video with HD 1080p and Audio options', () async {
      final media = await extractor.extract('https://www.tiktok.com/@algeria/video/123456');
      expect(media.extractor, 'TikTok');
      expect(media.formats, isNotEmpty);
      expect(media.formats.any((f) => f.quality == '1080p'), isTrue);
      expect(media.formats.any((f) => f.ext == 'mp3'), isTrue);
    });

    test('extracts YouTube video with rich formats and formatted duration', () async {
      final media = await extractor.extract('https://www.youtube.com/watch?v=aqz-KE-bpKQ');
      expect(media.extractor, 'YouTube');
      expect(media.duration, greaterThan(0));
      expect(media.formattedDuration, isNotEmpty);
      expect(media.formats.length, greaterThanOrEqualTo(3));
    });

    test('extracts SoundCloud track with audio-only formats', () async {
      final media = await extractor.extract('https://soundcloud.com/artist/desert-sounds');
      expect(media.extractor, 'SoundCloud');
      expect(media.formats.every((f) => !f.hasVideo), isTrue);
    });
  });
}
