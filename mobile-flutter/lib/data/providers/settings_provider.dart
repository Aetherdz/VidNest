import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SettingsState {
  const SettingsState({
    this.themeMode = ThemeMode.system,
    this.locale = const Locale('ar'),
    this.wifiOnly = false,
  });

  final ThemeMode themeMode;
  final Locale locale;
  final bool wifiOnly;

  SettingsState copyWith({
    ThemeMode? themeMode,
    Locale? locale,
    bool? wifiOnly,
  }) {
    return SettingsState(
      themeMode: themeMode ?? this.themeMode,
      locale: locale ?? this.locale,
      wifiOnly: wifiOnly ?? this.wifiOnly,
    );
  }
}

class SettingsNotifier extends StateNotifier<SettingsState> {
  SettingsNotifier() : super(const SettingsState());

  void setThemeMode(ThemeMode mode) {
    state = state.copyWith(themeMode: mode);
  }

  void setLocale(Locale loc) {
    state = state.copyWith(locale: loc);
  }

  void toggleWifiOnly(bool value) {
    state = state.copyWith(wifiOnly: value);
  }
}

final settingsProvider = StateNotifierProvider<SettingsNotifier, SettingsState>((ref) {
  return SettingsNotifier();
});
