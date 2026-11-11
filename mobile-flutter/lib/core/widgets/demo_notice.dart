import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';

class DemoNotice extends StatelessWidget {
  const DemoNotice({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    return Container(
      width: double.infinity,
      padding: AppSpacing.insetAllSm,
      decoration: BoxDecoration(
        color: colors.surfaceSubtle,
        borderRadius: AppRadius.radiusSm,
        border: Border.all(color: colors.border),
      ),
      child: Text(
        'نسخة معاينة: التنزيلات وبيانات الملفات تجريبية، ولا تُحفظ ملفات فعلية.',
        style: TextStyle(color: colors.textSecondary, fontSize: 13),
      ),
    );
  }
}
