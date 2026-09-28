import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_flutter/main.dart';

void main() {
  testWidgets('NeuroGuardian App Loads Splash Screen Test', (WidgetTester tester) async {
    await tester.pumpWidget(const NeuroGuardianApp());
    expect(find.text('NeuroGuardian'), findsOneWidget);
    expect(find.text('Get Started'), findsOneWidget);
  });
}
