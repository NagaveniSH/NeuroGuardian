import 'package:flutter_test/flutter_test.dart';
import 'package:frontend_flutter/providers/auth_provider.dart';

void main() {
  group('AuthProvider Unit Tests', () {
    late AuthProvider authProvider;

    setUp(() {
      authProvider = AuthProvider();
    });

    test('Initial auth state is not authenticated', () {
      expect(authProvider.isAuthenticated, false);
      expect(authProvider.currentUser, null);
    });

    test('Successful login updates currentUser and authenticated state', () async {
      final result = await authProvider.login("caregiver@neuroguardian.com", "password123");
      expect(result, true);
      expect(authProvider.isAuthenticated, true);
      expect(authProvider.currentUser?.email, "caregiver@neuroguardian.com");
    });
  });
}
