// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appName => 'VidNest';

  @override
  String get appTagline => 'Quiet Universal Media Downloader';

  @override
  String get headline => 'What do you want to download today?';

  @override
  String get intro =>
      'Paste a video or audio link, inspect available qualities instantly, and download in one clean click.';

  @override
  String get urlFieldPlaceholder => 'Paste video or audio link here...';

  @override
  String get pasteButton => 'Paste';

  @override
  String get clearButton => 'Clear';

  @override
  String get pasteAndAnalyze => 'Paste & Analyze';

  @override
  String get downloadButton => 'Download';

  @override
  String get startDownload => 'Start Download';

  @override
  String get analyzing => 'Analyzing media link...';

  @override
  String get supportedSources => 'Supported Sources';

  @override
  String get recentDownloads => 'Recent Downloads';

  @override
  String get noRecentDownloads =>
      'No downloads yet. Paste a link above to get started.';

  @override
  String get navHome => 'Home';

  @override
  String get navDownloads => 'Downloads';

  @override
  String get navLibrary => 'Library';

  @override
  String get tabInProgress => 'In Progress';

  @override
  String get tabCompleted => 'Completed';

  @override
  String get tabFailed => 'Failed';

  @override
  String get noActiveDownloads => 'No active downloads right now.';

  @override
  String get noCompletedDownloads => 'No completed downloads found.';

  @override
  String get noFailedDownloads => 'No failed downloads.';

  @override
  String get storageUsed => 'Total storage used';

  @override
  String get libraryTitle => 'Media Library';

  @override
  String get searchLibrary => 'Search downloaded videos & audio...';

  @override
  String get sortByDate => 'Date';

  @override
  String get sortByName => 'Name';

  @override
  String get sortBySize => 'Size';

  @override
  String get settingsTitle => 'Settings';

  @override
  String get languageLabel => 'App Language';

  @override
  String get themeLabel => 'Theme Appearance';

  @override
  String get themeLight => 'Light';

  @override
  String get themeDark => 'Dark';

  @override
  String get themeSystem => 'System Default';

  @override
  String get wifiOnlyLabel => 'Download over Wi-Fi only';

  @override
  String get defaultQualityLabel => 'Default Quality';

  @override
  String get concurrentDownloadsLabel => 'Max Concurrent Downloads';

  @override
  String get clearHistoryLabel => 'Clear Download History';

  @override
  String get clearHistoryConfirm =>
      'Are you sure you want to clear your download history?';

  @override
  String get aboutLabel => 'About VidNest';

  @override
  String get aboutText =>
      'VidNest — Privacy-first ad-free media downloader. Architected by Atheerium (zaikabdou).';

  @override
  String get openMedia => 'Open';

  @override
  String get shareMedia => 'Share';

  @override
  String get deleteMedia => 'Delete';

  @override
  String get retryDownload => 'Retry';

  @override
  String get pauseDownload => 'Pause';

  @override
  String get resumeDownload => 'Resume';

  @override
  String get cancelDownload => 'Cancel';

  @override
  String get videoOption => 'Video (MP4)';

  @override
  String get audioOption => 'Audio (MP3)';

  @override
  String get chooseQuality => 'Choose Quality';
}
