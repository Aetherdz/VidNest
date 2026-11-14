import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:vidnest/main.dart';

void main() {
  testWidgets('VidNest App opens on the language screen', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: VidNestApp(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('اختر لغتك'), findsOneWidget);
    expect(find.text('ابدأ'), findsOneWidget);
  });
}
