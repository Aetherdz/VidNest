import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_colors.dart';
import '../theme/app_icons.dart';
import '../theme/app_radius.dart';
import '../theme/app_spacing.dart';

class UrlField extends StatefulWidget {
  const UrlField({
    super.key,
    required this.controller,
    required this.onAnalyze,
    this.onChanged,
    this.onCleared,
    this.placeholder = 'https://...',
    this.isLoading = false,
  });

  final TextEditingController controller;
  final ValueChanged<String> onAnalyze;
  final ValueChanged<String>? onChanged;
  final VoidCallback? onCleared;
  final String placeholder;
  final bool isLoading;

  @override
  State<UrlField> createState() => _UrlFieldState();
}

class _UrlFieldState extends State<UrlField> {
  bool _hasText = false;

  @override
  void initState() {
    super.initState();
    _hasText = widget.controller.text.trim().isNotEmpty;
    widget.controller.addListener(_onTextChanged);
  }

  @override
  void dispose() {
    widget.controller.removeListener(_onTextChanged);
    super.dispose();
  }

  void _onTextChanged() {
    final hasNow = widget.controller.text.trim().isNotEmpty;
    if (hasNow != _hasText) {
      setState(() => _hasText = hasNow);
    }
    widget.onChanged?.call(widget.controller.text);
  }

  String? _extractUrl(String text) {
    if (text.trim().isEmpty) return null;
    final match =
        RegExp(r'https?://[^\s"<>]+', caseSensitive: false).firstMatch(text);
    if (match != null) {
      String url = match.group(0)!;
      url = url.replaceAll(RegExp(r"[.,;:!?')]+$"), "");
      return url;
    }
    return null;
  }

  Future<void> _handlePaste() async {
    HapticFeedback.lightImpact();
    final data = await Clipboard.getData('text/plain');
    final raw = data?.text ?? '';
    final extracted = _extractUrl(raw) ?? raw.trim();
    if (extracted.isNotEmpty) {
      widget.controller.text = extracted;
      widget.onAnalyze(extracted);
    }
  }

  void _handleClear() {
    HapticFeedback.lightImpact();
    widget.controller.clear();
    widget.onCleared?.call();
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;

    return Container(
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: AppRadius.radiusSm,
        border: Border.all(color: colors.border, width: 1),
      ),
      padding:
          const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 4),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: widget.controller,
              enabled: !widget.isLoading,
              textDirection: TextDirection.ltr,
              keyboardType: TextInputType.url,
              textInputAction: TextInputAction.go,
              onSubmitted: (val) {
                final cleaned = _extractUrl(val) ?? val.trim();
                if (cleaned.isNotEmpty) widget.onAnalyze(cleaned);
              },
              style: TextStyle(
                color: colors.text,
                fontSize: 16,
                fontWeight: FontWeight.w400,
              ),
              decoration: InputDecoration(
                hintText: widget.placeholder,
                hintStyle: TextStyle(color: colors.textSecondary, fontSize: 13),
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                contentPadding:
                    const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                isDense: true,
              ),
            ),
          ),
          AppSpacing.gapSm,
          if (_hasText)
            IconButton(
              key: const ValueKey('clear_btn'),
              icon: Icon(AppIcons.clear, size: 20, color: colors.textSecondary),
              onPressed: widget.isLoading ? null : _handleClear,
              tooltip: 'مسح',
              constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
            ),
          TextButton.icon(
            key: const ValueKey('paste_btn'),
            onPressed: widget.isLoading ? null : _handlePaste,
            icon: Icon(AppIcons.paste, size: 18, color: colors.primary),
            label:
                Text('لصق', style: TextStyle(color: colors.text, fontSize: 13)),
            style: TextButton.styleFrom(
              minimumSize: const Size(48, 48),
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
          ),
        ],
      ),
    );
  }
}
