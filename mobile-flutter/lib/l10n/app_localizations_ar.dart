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
}
