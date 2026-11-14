import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';
import 'app_localizations_fr.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
      : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('en'),
    Locale('fr')
  ];

  /// No description provided for @appName.
  ///
  /// In en, this message translates to:
  /// **'VidNest'**
  String get appName;

  /// No description provided for @appTagline.
  ///
  /// In en, this message translates to:
  /// **'Quiet Universal Media Downloader'**
  String get appTagline;

  /// No description provided for @headline.
  ///
  /// In en, this message translates to:
  /// **'What do you want to download today?'**
  String get headline;

  /// No description provided for @intro.
  ///
  /// In en, this message translates to:
  /// **'Paste a video or audio link, inspect available qualities instantly, and download in one clean click.'**
  String get intro;

  /// No description provided for @urlFieldPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Paste video or audio link here...'**
  String get urlFieldPlaceholder;

  /// No description provided for @pasteButton.
  ///
  /// In en, this message translates to:
  /// **'Paste'**
  String get pasteButton;

  /// No description provided for @clearButton.
  ///
  /// In en, this message translates to:
  /// **'Clear'**
  String get clearButton;

  /// No description provided for @pasteAndAnalyze.
  ///
  /// In en, this message translates to:
  /// **'Paste & Analyze'**
  String get pasteAndAnalyze;

  /// No description provided for @downloadButton.
  ///
  /// In en, this message translates to:
  /// **'Download'**
  String get downloadButton;

  /// No description provided for @startDownload.
  ///
  /// In en, this message translates to:
  /// **'Start Download'**
  String get startDownload;

  /// No description provided for @analyzing.
  ///
  /// In en, this message translates to:
  /// **'Analyzing media link...'**
  String get analyzing;

  /// No description provided for @supportedSources.
  ///
  /// In en, this message translates to:
  /// **'Supported Sources'**
  String get supportedSources;

  /// No description provided for @recentDownloads.
  ///
  /// In en, this message translates to:
  /// **'Recent Downloads'**
  String get recentDownloads;

  /// No description provided for @noRecentDownloads.
  ///
  /// In en, this message translates to:
  /// **'No downloads yet. Paste a link above to get started.'**
  String get noRecentDownloads;

  /// No description provided for @navHome.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get navHome;

  /// No description provided for @navDownloads.
  ///
  /// In en, this message translates to:
  /// **'Downloads'**
  String get navDownloads;

  /// No description provided for @navLibrary.
  ///
  /// In en, this message translates to:
  /// **'Library'**
  String get navLibrary;

  /// No description provided for @tabInProgress.
  ///
  /// In en, this message translates to:
  /// **'In Progress'**
  String get tabInProgress;

  /// No description provided for @tabCompleted.
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get tabCompleted;

  /// No description provided for @tabFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed'**
  String get tabFailed;

  /// No description provided for @noActiveDownloads.
  ///
  /// In en, this message translates to:
  /// **'No active downloads right now.'**
  String get noActiveDownloads;

  /// No description provided for @noCompletedDownloads.
  ///
  /// In en, this message translates to:
  /// **'No completed downloads found.'**
  String get noCompletedDownloads;

  /// No description provided for @noFailedDownloads.
  ///
  /// In en, this message translates to:
  /// **'No failed downloads.'**
  String get noFailedDownloads;

  /// No description provided for @storageUsed.
  ///
  /// In en, this message translates to:
  /// **'Total storage used'**
  String get storageUsed;

  /// No description provided for @libraryTitle.
  ///
  /// In en, this message translates to:
  /// **'Media Library'**
  String get libraryTitle;

  /// No description provided for @searchLibrary.
  ///
  /// In en, this message translates to:
  /// **'Search downloaded videos & audio...'**
  String get searchLibrary;

  /// No description provided for @sortByDate.
  ///
  /// In en, this message translates to:
  /// **'Date'**
  String get sortByDate;

  /// No description provided for @sortByName.
  ///
  /// In en, this message translates to:
  /// **'Name'**
  String get sortByName;

  /// No description provided for @sortBySize.
  ///
  /// In en, this message translates to:
  /// **'Size'**
  String get sortBySize;

  /// No description provided for @settingsTitle.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settingsTitle;

  /// No description provided for @languageLabel.
  ///
  /// In en, this message translates to:
  /// **'App Language'**
  String get languageLabel;

  /// No description provided for @themeLabel.
  ///
  /// In en, this message translates to:
  /// **'Theme Appearance'**
  String get themeLabel;

  /// No description provided for @themeLight.
  ///
  /// In en, this message translates to:
  /// **'Light'**
  String get themeLight;

  /// No description provided for @themeDark.
  ///
  /// In en, this message translates to:
  /// **'Dark'**
  String get themeDark;

  /// No description provided for @themeSystem.
  ///
  /// In en, this message translates to:
  /// **'System Default'**
  String get themeSystem;

  /// No description provided for @wifiOnlyLabel.
  ///
  /// In en, this message translates to:
  /// **'Download over Wi-Fi only'**
  String get wifiOnlyLabel;

  /// No description provided for @defaultQualityLabel.
  ///
  /// In en, this message translates to:
  /// **'Default Quality'**
  String get defaultQualityLabel;

  /// No description provided for @concurrentDownloadsLabel.
  ///
  /// In en, this message translates to:
  /// **'Max Concurrent Downloads'**
  String get concurrentDownloadsLabel;

  /// No description provided for @clearHistoryLabel.
  ///
  /// In en, this message translates to:
  /// **'Clear Download History'**
  String get clearHistoryLabel;

  /// No description provided for @clearHistoryConfirm.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to clear your download history?'**
  String get clearHistoryConfirm;

  /// No description provided for @aboutLabel.
  ///
  /// In en, this message translates to:
  /// **'About VidNest'**
  String get aboutLabel;

  /// No description provided for @aboutText.
  ///
  /// In en, this message translates to:
  /// **'VidNest — Privacy-first ad-free media downloader. Architected by Atheerium (zaikabdou).'**
  String get aboutText;

  /// No description provided for @openMedia.
  ///
  /// In en, this message translates to:
  /// **'Open'**
  String get openMedia;

  /// No description provided for @shareMedia.
  ///
  /// In en, this message translates to:
  /// **'Share'**
  String get shareMedia;

  /// No description provided for @deleteMedia.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get deleteMedia;

  /// No description provided for @retryDownload.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get retryDownload;

  /// No description provided for @pauseDownload.
  ///
  /// In en, this message translates to:
  /// **'Pause'**
  String get pauseDownload;

  /// No description provided for @resumeDownload.
  ///
  /// In en, this message translates to:
  /// **'Resume'**
  String get resumeDownload;

  /// No description provided for @cancelDownload.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancelDownload;

  /// No description provided for @videoOption.
  ///
  /// In en, this message translates to:
  /// **'Video (MP4)'**
  String get videoOption;

  /// No description provided for @audioOption.
  ///
  /// In en, this message translates to:
  /// **'Audio (MP3)'**
  String get audioOption;

  /// No description provided for @chooseQuality.
  ///
  /// In en, this message translates to:
  /// **'Choose Quality'**
  String get chooseQuality;

  /// No description provided for @languageTitle.
  ///
  /// In en, this message translates to:
  /// **'Choose your language'**
  String get languageTitle;

  /// No description provided for @languageStart.
  ///
  /// In en, this message translates to:
  /// **'Get started'**
  String get languageStart;

  /// No description provided for @languageUnsupported.
  ///
  /// In en, this message translates to:
  /// **'This language is not available yet.'**
  String get languageUnsupported;

  /// No description provided for @searchHint.
  ///
  /// In en, this message translates to:
  /// **'Search to download'**
  String get searchHint;

  /// No description provided for @clipboardTitle.
  ///
  /// In en, this message translates to:
  /// **'The link you copied'**
  String get clipboardTitle;

  /// No description provided for @sectionTrending.
  ///
  /// In en, this message translates to:
  /// **'Popular searches'**
  String get sectionTrending;

  /// No description provided for @sectionSites.
  ///
  /// In en, this message translates to:
  /// **'Browse sites'**
  String get sectionSites;

  /// No description provided for @viewAll.
  ///
  /// In en, this message translates to:
  /// **'View all'**
  String get viewAll;

  /// No description provided for @sitesAllHint.
  ///
  /// In en, this message translates to:
  /// **'VidNest supports more than 1,800 sites.'**
  String get sitesAllHint;

  /// No description provided for @navDownload.
  ///
  /// In en, this message translates to:
  /// **'Download'**
  String get navDownload;

  /// No description provided for @navPlay.
  ///
  /// In en, this message translates to:
  /// **'Play'**
  String get navPlay;

  /// No description provided for @navSettings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get navSettings;

  /// No description provided for @playTitle.
  ///
  /// In en, this message translates to:
  /// **'Ready to play'**
  String get playTitle;

  /// No description provided for @playEmpty.
  ///
  /// In en, this message translates to:
  /// **'Completed downloads will appear here.'**
  String get playEmpty;

  /// No description provided for @sheetMusic.
  ///
  /// In en, this message translates to:
  /// **'Music'**
  String get sheetMusic;

  /// No description provided for @sheetVideo.
  ///
  /// In en, this message translates to:
  /// **'Video'**
  String get sheetVideo;

  /// No description provided for @audioClassic.
  ///
  /// In en, this message translates to:
  /// **'Download classic MP3'**
  String get audioClassic;

  /// No description provided for @videoMp4.
  ///
  /// In en, this message translates to:
  /// **'MP4'**
  String get videoMp4;

  /// No description provided for @permissionTitle.
  ///
  /// In en, this message translates to:
  /// **'Allow access to all files'**
  String get permissionTitle;

  /// No description provided for @permissionSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Allow access to storage'**
  String get permissionSubtitle;

  /// No description provided for @permissionAllow.
  ///
  /// In en, this message translates to:
  /// **'Allow'**
  String get permissionAllow;

  /// No description provided for @permissionCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get permissionCancel;

  /// No description provided for @downloadStarted.
  ///
  /// In en, this message translates to:
  /// **'Download started'**
  String get downloadStarted;

  /// No description provided for @linkNotSupported.
  ///
  /// In en, this message translates to:
  /// **'Paste a supported media link.'**
  String get linkNotSupported;

  /// No description provided for @permissionDenied.
  ///
  /// In en, this message translates to:
  /// **'Storage access was not granted.'**
  String get permissionDenied;

  /// No description provided for @showAction.
  ///
  /// In en, this message translates to:
  /// **'View'**
  String get showAction;

  /// No description provided for @trendingToto.
  ///
  /// In en, this message translates to:
  /// **'toto'**
  String get trendingToto;

  /// No description provided for @trendingGnawi.
  ///
  /// In en, this message translates to:
  /// **'Gnawi'**
  String get trendingGnawi;

  /// No description provided for @trendingBaqarah.
  ///
  /// In en, this message translates to:
  /// **'سورة البقرة'**
  String get trendingBaqarah;

  /// No description provided for @trendingLFerda.
  ///
  /// In en, this message translates to:
  /// **'LFerda'**
  String get trendingLFerda;

  /// No description provided for @siteTikTok.
  ///
  /// In en, this message translates to:
  /// **'TikTok'**
  String get siteTikTok;

  /// No description provided for @siteFacebook.
  ///
  /// In en, this message translates to:
  /// **'Facebook'**
  String get siteFacebook;

  /// No description provided for @siteInstagram.
  ///
  /// In en, this message translates to:
  /// **'Instagram'**
  String get siteInstagram;

  /// No description provided for @siteYouTube.
  ///
  /// In en, this message translates to:
  /// **'YouTube'**
  String get siteYouTube;

  /// No description provided for @langArabic.
  ///
  /// In en, this message translates to:
  /// **'العربية'**
  String get langArabic;

  /// No description provided for @langFrench.
  ///
  /// In en, this message translates to:
  /// **'Français'**
  String get langFrench;

  /// No description provided for @langEnglish.
  ///
  /// In en, this message translates to:
  /// **'English (US)'**
  String get langEnglish;

  /// No description provided for @langAfrikaans.
  ///
  /// In en, this message translates to:
  /// **'Afrikaans'**
  String get langAfrikaans;

  /// No description provided for @langAzerbaijani.
  ///
  /// In en, this message translates to:
  /// **'Azərbaycan'**
  String get langAzerbaijani;

  /// No description provided for @langIndonesian.
  ///
  /// In en, this message translates to:
  /// **'Bahasa Indonesia'**
  String get langIndonesian;

  /// No description provided for @langMalay.
  ///
  /// In en, this message translates to:
  /// **'Bahasa Malaysia'**
  String get langMalay;

  /// No description provided for @langBosnian.
  ///
  /// In en, this message translates to:
  /// **'Bosanski'**
  String get langBosnian;

  /// No description provided for @langCatalan.
  ///
  /// In en, this message translates to:
  /// **'Català'**
  String get langCatalan;

  /// No description provided for @langCzech.
  ///
  /// In en, this message translates to:
  /// **'Čeština'**
  String get langCzech;

  /// No description provided for @langDanish.
  ///
  /// In en, this message translates to:
  /// **'Dansk'**
  String get langDanish;

  /// No description provided for @langGerman.
  ///
  /// In en, this message translates to:
  /// **'Deutsch'**
  String get langGerman;

  /// No description provided for @langEstonian.
  ///
  /// In en, this message translates to:
  /// **'Eesti'**
  String get langEstonian;

  /// No description provided for @langSpanish.
  ///
  /// In en, this message translates to:
  /// **'Español'**
  String get langSpanish;

  /// No description provided for @langPersian.
  ///
  /// In en, this message translates to:
  /// **'فارسی'**
  String get langPersian;

  /// No description provided for @langFinnish.
  ///
  /// In en, this message translates to:
  /// **'Suomi'**
  String get langFinnish;

  /// No description provided for @langFilipino.
  ///
  /// In en, this message translates to:
  /// **'Filipino'**
  String get langFilipino;

  /// No description provided for @langGalician.
  ///
  /// In en, this message translates to:
  /// **'Galego'**
  String get langGalician;

  /// No description provided for @langGreek.
  ///
  /// In en, this message translates to:
  /// **'Ελληνικά'**
  String get langGreek;

  /// No description provided for @langHebrew.
  ///
  /// In en, this message translates to:
  /// **'עברית'**
  String get langHebrew;

  /// No description provided for @langHindi.
  ///
  /// In en, this message translates to:
  /// **'हिन्दी'**
  String get langHindi;

  /// No description provided for @langCroatian.
  ///
  /// In en, this message translates to:
  /// **'Hrvatski'**
  String get langCroatian;

  /// No description provided for @langHungarian.
  ///
  /// In en, this message translates to:
  /// **'Magyar'**
  String get langHungarian;

  /// No description provided for @langIcelandic.
  ///
  /// In en, this message translates to:
  /// **'Íslenska'**
  String get langIcelandic;

  /// No description provided for @langItalian.
  ///
  /// In en, this message translates to:
  /// **'Italiano'**
  String get langItalian;

  /// No description provided for @langJapanese.
  ///
  /// In en, this message translates to:
  /// **'日本語'**
  String get langJapanese;

  /// No description provided for @langKorean.
  ///
  /// In en, this message translates to:
  /// **'한국어'**
  String get langKorean;

  /// No description provided for @langLithuanian.
  ///
  /// In en, this message translates to:
  /// **'Lietuvių'**
  String get langLithuanian;

  /// No description provided for @langLatvian.
  ///
  /// In en, this message translates to:
  /// **'Latviešu'**
  String get langLatvian;

  /// No description provided for @langDutch.
  ///
  /// In en, this message translates to:
  /// **'Nederlands'**
  String get langDutch;

  /// No description provided for @langNorwegian.
  ///
  /// In en, this message translates to:
  /// **'Norsk'**
  String get langNorwegian;

  /// No description provided for @langPolish.
  ///
  /// In en, this message translates to:
  /// **'Polski'**
  String get langPolish;

  /// No description provided for @langPortuguese.
  ///
  /// In en, this message translates to:
  /// **'Português'**
  String get langPortuguese;

  /// No description provided for @langRomanian.
  ///
  /// In en, this message translates to:
  /// **'Română'**
  String get langRomanian;

  /// No description provided for @langRussian.
  ///
  /// In en, this message translates to:
  /// **'Русский'**
  String get langRussian;

  /// No description provided for @langSerbian.
  ///
  /// In en, this message translates to:
  /// **'Српски'**
  String get langSerbian;

  /// No description provided for @langSlovak.
  ///
  /// In en, this message translates to:
  /// **'Slovenčina'**
  String get langSlovak;

  /// No description provided for @langSlovenian.
  ///
  /// In en, this message translates to:
  /// **'Slovenščina'**
  String get langSlovenian;

  /// No description provided for @langSwedish.
  ///
  /// In en, this message translates to:
  /// **'Svenska'**
  String get langSwedish;

  /// No description provided for @langThai.
  ///
  /// In en, this message translates to:
  /// **'ไทย'**
  String get langThai;

  /// No description provided for @langTurkish.
  ///
  /// In en, this message translates to:
  /// **'Türkçe'**
  String get langTurkish;

  /// No description provided for @langUkrainian.
  ///
  /// In en, this message translates to:
  /// **'Українська'**
  String get langUkrainian;

  /// No description provided for @langVietnamese.
  ///
  /// In en, this message translates to:
  /// **'Tiếng Việt'**
  String get langVietnamese;

  /// No description provided for @langChinese.
  ///
  /// In en, this message translates to:
  /// **'中文'**
  String get langChinese;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['ar', 'en', 'fr'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'en':
      return AppLocalizationsEn();
    case 'fr':
      return AppLocalizationsFr();
  }

  throw FlutterError(
      'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
      'an issue with the localizations generation tool. Please file an issue '
      'on GitHub with a reproducible sample app and the gen-l10n configuration '
      'that was used.');
}
