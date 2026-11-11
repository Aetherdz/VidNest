// ignore_for_file: deprecated_member_use
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_icons.dart';
import '../../core/theme/app_radius.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/widgets/responsive_container.dart';
import '../../core/widgets/vidnest_logo.dart';
import '../../data/providers/download_provider.dart';
import '../../data/providers/settings_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = context.colors;
    final settings = ref.watch(settingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('الإعدادات',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 28)),
      ),
      body: SafeArea(
        child: ResponsiveContainer(
          padding: AppSpacing.insetAllMd,
          child: ListView(
            children: [
              // Theme Appearance Section
              _buildSectionTitle(context, 'مظهر التطبيق'),
              Card(
                color: colors.surface,
                clipBehavior: Clip.antiAlias,
                shape: RoundedRectangleBorder(
                  borderRadius: AppRadius.radiusMd,
                  side: BorderSide(color: colors.border, width: 1),
                ),
                child: Column(
                  children: [
                    RadioListTile<ThemeMode>(
                      value: ThemeMode.system,
                      groupValue: settings.themeMode,
                      title: const Text('تلقائي حسب النظام',
                          style: TextStyle(fontSize: 16)),
                      activeColor: colors.primary,
                      onChanged: (mode) {
                        if (mode != null) {
                          ref
                              .read(settingsProvider.notifier)
                              .setThemeMode(mode);
                        }
                      },
                    ),
                    Divider(height: 1, color: colors.border),
                    RadioListTile<ThemeMode>(
                      value: ThemeMode.light,
                      groupValue: settings.themeMode,
                      title: const Text('فاتح', style: TextStyle(fontSize: 16)),
                      activeColor: colors.primary,
                      onChanged: (mode) {
                        if (mode != null) {
                          ref
                              .read(settingsProvider.notifier)
                              .setThemeMode(mode);
                        }
                      },
                    ),
                    Divider(height: 1, color: colors.border),
                    RadioListTile<ThemeMode>(
                      value: ThemeMode.dark,
                      groupValue: settings.themeMode,
                      title: const Text('داكن', style: TextStyle(fontSize: 16)),
                      activeColor: colors.primary,
                      onChanged: (mode) {
                        if (mode != null) {
                          ref
                              .read(settingsProvider.notifier)
                              .setThemeMode(mode);
                        }
                      },
                    ),
                  ],
                ),
              ),
              AppSpacing.gapLg,

              // Language Section
              _buildSectionTitle(context, 'لغة التطبيق'),
              Card(
                color: colors.surface,
                clipBehavior: Clip.antiAlias,
                shape: RoundedRectangleBorder(
                  borderRadius: AppRadius.radiusMd,
                  side: BorderSide(color: colors.border, width: 1),
                ),
                child: Column(
                  children: [
                    RadioListTile<String>(
                      value: 'ar',
                      groupValue: settings.locale.languageCode,
                      title: const Text('العربية (RTL)',
                          style: TextStyle(fontSize: 16)),
                      activeColor: colors.primary,
                      onChanged: (lang) {
                        if (lang != null) {
                          ref
                              .read(settingsProvider.notifier)
                              .setLocale(Locale(lang));
                        }
                      },
                    ),
                    Divider(height: 1, color: colors.border),
                    RadioListTile<String>(
                      value: 'en',
                      groupValue: settings.locale.languageCode,
                      title: const Text('English (LTR)',
                          style: TextStyle(fontSize: 16)),
                      activeColor: colors.primary,
                      onChanged: (lang) {
                        if (lang != null) {
                          ref
                              .read(settingsProvider.notifier)
                              .setLocale(Locale(lang));
                        }
                      },
                    ),
                  ],
                ),
              ),
              AppSpacing.gapLg,

              // Network & Download Options
              _buildSectionTitle(context, 'خيارات الشبكة والتنزيل'),
              Card(
                color: colors.surface,
                clipBehavior: Clip.antiAlias,
                shape: RoundedRectangleBorder(
                  borderRadius: AppRadius.radiusMd,
                  side: BorderSide(color: colors.border, width: 1),
                ),
                child: Column(
                  children: [
                    SwitchListTile(
                      value: settings.wifiOnly,
                      title: const Text('التنزيل عبر Wi-Fi فقط',
                          style: TextStyle(fontSize: 16)),
                      subtitle: Text('تجنب استهلاك باقة البيانات المتنقلة',
                          style: TextStyle(
                              color: colors.textSecondary, fontSize: 13)),
                      activeThumbColor: colors.primary,
                      onChanged: (val) => ref
                          .read(settingsProvider.notifier)
                          .toggleWifiOnly(val),
                    ),
                    Divider(height: 1, color: colors.border),
                    ListTile(
                      title: Text(
                        'مسح سجل التنزيلات بالكامل',
                        style: TextStyle(
                            color: Theme.of(context).colorScheme.error,
                            fontSize: 16,
                            fontWeight: FontWeight.w500),
                      ),
                      leading: Icon(AppIcons.delete,
                          color: Theme.of(context).colorScheme.error),
                      onTap: () {
                        showDialog(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            title: const Text('تأكيد المسح'),
                            content: const Text(
                                'هل أنت متأكد من رغبتك في مسح سجل التنزيلات بالكامل؟'),
                            shape: AppRadius.shapeMd,
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(ctx),
                                child: Text('إلغاء',
                                    style:
                                        TextStyle(color: colors.textSecondary)),
                              ),
                              FilledButton(
                                onPressed: () {
                                  ref
                                      .read(downloadRepositoryProvider)
                                      .clearHistory();
                                  Navigator.pop(ctx);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                        content:
                                            Text('تم مسح سجل التنزيلات بنجاح')),
                                  );
                                },
                                child: const Text('مسح'),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
              AppSpacing.gapLg,

              // About Card
              _buildSectionTitle(context, 'عن التطبيق'),
              Container(
                padding: AppSpacing.insetAllMd,
                decoration: BoxDecoration(
                  color: colors.surface,
                  borderRadius: AppRadius.radiusMd,
                  border: Border.all(color: colors.border, width: 1),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        VidNestLogo(size: 34),
                        SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'VidNest v4.0.0',
                              style: TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            Text(
                              'تحميل بسيط، آمن، واضح',
                              style:
                                  TextStyle(fontSize: 13, color: Colors.grey),
                            ),
                          ],
                        ),
                      ],
                    ),
                    AppSpacing.gapMd,
                    Text(
                      'أداة تنزيل وسائط سريعة وهادئة وخاصة تدعم أكثر من 1,800 موقع عالمي، مصممة بأعلى معايير الخصوصية والأناقة، بدون إعلانات وبدون تعقب.',
                      style: TextStyle(
                          color: colors.textSecondary,
                          fontSize: 13,
                          height: 1.5),
                    ),
                    AppSpacing.gapSm,
                    Text(
                      'تصميم وهندسة: Atheerium (zaikabdou)',
                      style: TextStyle(
                          color: colors.textSecondary,
                          fontSize: 13,
                          fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              AppSpacing.gapXxl,
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm, right: 4, left: 4),
      child: Text(
        title,
        style: TextStyle(
          color: context.colors.text,
          fontSize: 16,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
