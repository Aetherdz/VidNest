import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';

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
    Locale('en')
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
      <String>['ar', 'en'].contains(locale.languageCode);

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
  }

  throw FlutterError(
      'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
      'an issue with the localizations generation tool. Please file an issue '
      'on GitHub with a reproducible sample app and the gen-l10n configuration '
      'that was used.');
}
