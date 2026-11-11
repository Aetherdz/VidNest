import 'package:flutter/material.dart';

class ResponsiveContainer extends StatelessWidget {
  const ResponsiveContainer({
    super.key,
    required this.child,
    this.maxWidth = 720.0,
    this.padding,
    this.center = true,
  });

  final Widget child;
  final double maxWidth;
  final EdgeInsetsGeometry? padding;
  final bool center;

  @override
  Widget build(BuildContext context) {
    Widget content = ConstrainedBox(
      constraints: BoxConstraints(maxWidth: maxWidth),
      child: padding != null ? Padding(padding: padding!, child: child) : child,
    );

    if (center) {
      content = Align(
        alignment: Alignment.topCenter,
        child: content,
      );
    }

    return content;
  }
}
