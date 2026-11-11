import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:vidnest/main.dart';

void main() {
  testWidgets('VidNest App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: VidNestApp(),
      ),
    );
    await tester.pumpAndSettle();

    // Verify app headline
    expect(find.text('ماذا تريد أن تحمّل اليوم؟'), findsOneWidget);
  });
}
