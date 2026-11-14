// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get appName => 'VidNest';

  @override
  String get appTagline => 'أداة الوسائط الهادئة';

  @override
  String get headline => 'ماذا تريد أن تحمّل اليوم؟';

  @override
  String get intro =>
      'الصق رابط فيديو أو مقطع صوتي، استعرض خيارات الدقة فورًا، ثم احفظ الملف مباشرة في جهازك دون إعلانات وبأعلى جودة.';

  @override
  String get urlFieldPlaceholder => 'الصق رابط الفيديو أو الصوت هنا...';

  @override
  String get pasteButton => 'لصق';

  @override
  String get clearButton => 'مسح';

  @override
  String get pasteAndAnalyze => 'لصق وتحليل';

  @override
  String get downloadButton => 'تنزيل';

  @override
  String get startDownload => 'ابدأ التنزيل';

  @override
  String get analyzing => 'جارٍ تحليل الرابط...';

  @override
  String get supportedSources => 'المنصات المدعومة';

  @override
  String get recentDownloads => 'آخر التنزيلات';

  @override
  String get noRecentDownloads =>
      'لا توجد تنزيلات حتى الآن. الصق رابطًا أعلاه للبدء.';

  @override
  String get navHome => 'الرئيسية';

  @override
  String get navDownloads => 'التنزيلات';

  @override
  String get navLibrary => 'المكتبة';

  @override
  String get tabInProgress => 'قيد التنزيل';

  @override
  String get tabCompleted => 'المكتملة';

  @override
  String get tabFailed => 'المتعثرة';

  @override
  String get noActiveDownloads => 'لا توجد تنزيلات نشطة حاليًا.';

  @override
  String get noCompletedDownloads => 'لا توجد ملفات مكتملة حتى الآن.';

  @override
  String get noFailedDownloads => 'لا توجد تنزيلات متعثرة.';

  @override
  String get storageUsed => 'المساحة الإجمالية المستخدمة';

  @override
  String get libraryTitle => 'مكتبة الوسائط';

  @override
  String get searchLibrary => 'ابحث في الفيديوهات والصوتيات المحفوظة...';

  @override
  String get sortByDate => 'التاريخ';

  @override
  String get sortByName => 'الاسم';

  @override
  String get sortBySize => 'الحجم';

  @override
  String get settingsTitle => 'الإعدادات';

  @override
  String get languageLabel => 'لغة التطبيق';

  @override
  String get themeLabel => 'مظهر التطبيق';

  @override
  String get themeLight => 'نهاري';

  @override
  String get themeDark => 'ليلي';

  @override
  String get themeSystem => 'تلقائي حسب النظام';

  @override
  String get wifiOnlyLabel => 'التنزيل عبر Wi-Fi فقط';

  @override
  String get defaultQualityLabel => 'الجودة الافتراضية';

  @override
  String get concurrentDownloadsLabel => 'الحد الأقصى للتحميلات المتزامنة';

  @override
  String get clearHistoryLabel => 'مسح سجل التنزيلات';

  @override
  String get clearHistoryConfirm =>
      'هل أنت متأكد من رغبتك في مسح سجل التنزيلات بالكامل؟';

  @override
  String get aboutLabel => 'عن تطبيق VidNest';

  @override
  String get aboutText =>
      'VidNest — منصة تنزيل وسائط خاصة وهادئة بدون إعلانات. تصميم وبنية Atheerium (zaikabdou).';

  @override
  String get openMedia => 'تشغيل';

  @override
  String get shareMedia => 'مشاركة';

  @override
  String get deleteMedia => 'حذف';

  @override
  String get retryDownload => 'إعادة المحاولة';

  @override
  String get pauseDownload => 'إيقاف مؤقت';

  @override
  String get resumeDownload => 'استئناف';

  @override
  String get cancelDownload => 'إلغاء';

  @override
  String get videoOption => 'فيديو (MP4)';

  @override
  String get audioOption => 'صوت فقط (MP3)';

  @override
  String get chooseQuality => 'اختر الدقة المطلوبة';

  @override
  String get languageTitle => 'اختر لغتك';

  @override
  String get languageStart => 'ابدأ';

  @override
  String get languageUnsupported => 'هذه اللغة غير متاحة حاليًا.';

  @override
  String get searchHint => 'ابحث للتنزيل';

  @override
  String get clipboardTitle => 'الرابط الذي نسخته';

  @override
  String get sectionTrending => 'عمليات البحث الشائعة';

  @override
  String get sectionSites => 'عرض المواقع';

  @override
  String get viewAll => 'عرض الكل';

  @override
  String get sitesAllHint => 'يدعم VidNest أكثر من 1800 موقع.';

  @override
  String get navDownload => 'تنزيل';

  @override
  String get navPlay => 'تشغيل';

  @override
  String get navSettings => 'الإعدادات';

  @override
  String get playTitle => 'جاهز للتشغيل';

  @override
  String get playEmpty => 'ستظهر التنزيلات المكتملة هنا.';

  @override
  String get sheetMusic => 'الموسيقى';

  @override
  String get sheetVideo => 'فيديو';

  @override
  String get audioClassic => 'تنزيل MP3 الكلاسيكي';

  @override
  String get videoMp4 => 'MP4';

  @override
  String get permissionTitle => 'السماح بالوصول إلى جميع الملفات';

  @override
  String get permissionSubtitle => 'السماح بالوصول إلى التخزين';

  @override
  String get permissionAllow => 'السماح';

  @override
  String get permissionCancel => 'إلغاء';

  @override
  String get downloadStarted => 'بدأ التنزيل';

  @override
  String get linkNotSupported => 'الصق رابط وسائط مدعومًا.';

  @override
  String get permissionDenied => 'لم يتم منح الوصول إلى التخزين.';

  @override
  String get showAction => 'عرض';

  @override
  String get trendingToto => 'toto';

  @override
  String get trendingGnawi => 'Gnawi';

  @override
  String get trendingBaqarah => 'سورة البقرة';

  @override
  String get trendingLFerda => 'LFerda';

  @override
  String get siteTikTok => 'TikTok';

  @override
  String get siteFacebook => 'Facebook';

  @override
  String get siteInstagram => 'Instagram';

  @override
  String get siteYouTube => 'YouTube';

  @override
  String get langArabic => 'العربية';

  @override
  String get langFrench => 'Français';

  @override
  String get langEnglish => 'English (US)';

  @override
  String get langAfrikaans => 'Afrikaans';

  @override
  String get langAzerbaijani => 'Azərbaycan';

  @override
  String get langIndonesian => 'Bahasa Indonesia';

  @override
  String get langMalay => 'Bahasa Malaysia';

  @override
  String get langBosnian => 'Bosanski';

  @override
  String get langCatalan => 'Català';

  @override
  String get langCzech => 'Čeština';

  @override
  String get langDanish => 'Dansk';

  @override
  String get langGerman => 'Deutsch';

  @override
  String get langEstonian => 'Eesti';

  @override
  String get langSpanish => 'Español';

  @override
  String get langPersian => 'فارسی';

  @override
  String get langFinnish => 'Suomi';

  @override
  String get langFilipino => 'Filipino';

  @override
  String get langGalician => 'Galego';

  @override
  String get langGreek => 'Ελληνικά';

  @override
  String get langHebrew => 'עברית';

  @override
  String get langHindi => 'हिन्दी';

  @override
  String get langCroatian => 'Hrvatski';

  @override
  String get langHungarian => 'Magyar';

  @override
  String get langIcelandic => 'Íslenska';

  @override
  String get langItalian => 'Italiano';

  @override
  String get langJapanese => '日本語';

  @override
  String get langKorean => '한국어';

  @override
  String get langLithuanian => 'Lietuvių';

  @override
  String get langLatvian => 'Latviešu';

  @override
  String get langDutch => 'Nederlands';

  @override
  String get langNorwegian => 'Norsk';

  @override
  String get langPolish => 'Polski';

  @override
  String get langPortuguese => 'Português';

  @override
  String get langRomanian => 'Română';

  @override
  String get langRussian => 'Русский';

  @override
  String get langSerbian => 'Српски';

  @override
  String get langSlovak => 'Slovenčina';

  @override
  String get langSlovenian => 'Slovenščina';

  @override
  String get langSwedish => 'Svenska';

  @override
  String get langThai => 'ไทย';

  @override
  String get langTurkish => 'Türkçe';

  @override
  String get langUkrainian => 'Українська';

  @override
  String get langVietnamese => 'Tiếng Việt';

  @override
  String get langChinese => '中文';
}
