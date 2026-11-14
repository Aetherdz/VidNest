/// The third-party platforms the existing extractor understands.
enum SupportedSite { tiktok, facebook, instagram, youtube, x, soundcloud }

class DetectedLink {
  const DetectedLink({
    required this.url,
    required this.host,
    this.site,
  });

  final String url;
  final String host;
  final SupportedSite? site;
}

final RegExp _urlPattern = RegExp(
  r'https?://[^\s<>"]+',
  caseSensitive: false,
);

final RegExp _hostPattern = RegExp(r'^[a-z0-9.-]+\.[a-z]{2,}$');

String? _extractUrl(String rawText) {
  final match = _urlPattern.firstMatch(rawText.trim());
  if (match == null) return null;
  final candidate =
      match.group(0)!.replaceFirst(RegExp(r'[)\].,;!?]+$'), '');
  final uri = Uri.tryParse(candidate);
  if (uri == null || uri.host.isEmpty) return null;
  if (uri.scheme != 'http' && uri.scheme != 'https') return null;
  final host = uri.host.toLowerCase().replaceFirst(RegExp(r'^www\.'), '');
  if (!_hostPattern.hasMatch(host) || host.split('.').length > 6) return null;
  return candidate;
}

/// Maps a hostname to one of the highlighted platforms, or `null`.
SupportedSite? siteForHost(String host) {
  final normalized = host.toLowerCase().replaceFirst(RegExp(r'^www\.'), '');
  bool matches(String suffix) =>
      normalized == suffix || normalized.endsWith('.$suffix');

  if (matches('tiktok.com')) return SupportedSite.tiktok;
  if (matches('youtube.com') || matches('youtu.be')) {
    return SupportedSite.youtube;
  }
  if (matches('instagram.com')) return SupportedSite.instagram;
  if (matches('facebook.com') || matches('fb.watch')) {
    return SupportedSite.facebook;
  }
  if (matches('x.com') || matches('twitter.com')) return SupportedSite.x;
  if (matches('soundcloud.com')) return SupportedSite.soundcloud;
  return null;
}

/// Extracts the first supported URL from arbitrary clipboard text.
/// Returns `null` for unsupported or malformed input.
DetectedLink? detectSupportedLink(String? rawText) {
  if (rawText == null) return null;
  final candidate = _extractUrl(rawText);
  if (candidate == null) return null;
  final host = Uri.parse(candidate).host.toLowerCase();
  final site = siteForHost(host);
  if (site == null) return null;
  return DetectedLink(url: candidate, host: host, site: site);
}

/// Describes any http(s) URL accepted by the existing extractor. `site` stays
/// `null` for the 1,800+ platforms without a dedicated glyph.
DetectedLink? describeMediaLink(String? url) {
  if (url == null) return null;
  final normalized = url.trim();
  final candidate = _extractUrl(normalized) ?? _extractUrl('https://$normalized');
  if (candidate == null) return null;
  final host = Uri.parse(candidate).host.toLowerCase();
  return DetectedLink(url: candidate, host: host, site: siteForHost(host));
}

/// Raw URL string for the search field, or `null` when it is not http(s).
String? normalizeMediaUrl(String? rawText) {
  if (rawText == null) return null;
  final url = _extractUrl(rawText);
  if (url != null) return url;
  return _extractUrl('https://${rawText.trim()}');
}
