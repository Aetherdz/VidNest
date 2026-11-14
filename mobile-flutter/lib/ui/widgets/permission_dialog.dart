import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';
import '../../core/widgets/vidnest_logo.dart';
import '../theme/app_theme.dart';

/// Centered storage-permission dialog. Returns `true` when the user allows.
Future<bool> showStoragePermissionDialog(BuildContext context) async {
  final palette = context.palette;
  final result = await showDialog<bool>(
    context: context,
    barrierColor: palette.scrim,
    builder: (dialogContext) => const PermissionDialog(),
  );
  return result ?? false;
}

class PermissionDialog extends StatelessWidget {
  const PermissionDialog({super.key});

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final l10n = AppLocalizations.of(context)!;

    return Dialog(
      backgroundColor: palette.surface,
      surfaceTintColor: palette.transparent,
      elevation: 12,
      insetPadding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
      shape: const RoundedRectangleBorder(
        borderRadius: VidNestPalette.radiusDialog,
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const _PermissionIllustration(),
            const SizedBox(height: 24),
            Text(
              l10n.permissionTitle,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: palette.text,
                fontSize: 18,
                fontWeight: FontWeight.w600,
                height: 1.35,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              l10n.permissionSubtitle,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: palette.textSecondary,
                fontSize: 15,
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: FilledButton(
                    style: FilledButton.styleFrom(
                      minimumSize: const Size(0, 48),
                      backgroundColor: palette.primary,
                      foregroundColor: palette.onPrimary,
                    ),
                    onPressed: () => Navigator.of(context).pop(true),
                    child: Text(l10n.permissionAllow),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: FilledButton(
                    style: FilledButton.styleFrom(
                      minimumSize: const Size(0, 48),
                      backgroundColor: palette.surfaceSubtle,
                      foregroundColor: palette.text,
                    ),
                    onPressed: () => Navigator.of(context).pop(false),
                    child: Text(l10n.permissionCancel),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _PermissionIllustration extends StatelessWidget {
  const _PermissionIllustration();

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: palette.surfaceSubtle,
        borderRadius: VidNestPalette.radiusCard,
      ),
      child: Row(
        children: [
          Container(
            width: 46,
            height: 28,
            padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              color: palette.primary,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Container(
                  width: 22,
                  height: 22,
                  decoration: BoxDecoration(
                    color: palette.surface,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.touch_app_rounded,
                    size: 14,
                    color: palette.primary,
                  ),
                ),
              ],
            ),
          ),
          const Spacer(),
          Text(
            'VidNest',
            style: TextStyle(
              color: palette.text,
              fontSize: 15,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(width: 10),
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: palette.primary,
              shape: BoxShape.circle,
            ),
            child: const Center(child: VidNestLogo(size: 24)),
          ),
        ],
      ),
    );
  }
}
