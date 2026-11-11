import '../models/media_item.dart';

abstract class MediaExtractor {
  bool canHandle(String url);
  Future<MediaItem> extract(String url);
}
