import React, { useState, useEffect } from 'react';
import {
  I18nManager,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

if (typeof document !== 'undefined') {
  document.documentElement.dir = 'rtl';
  document.documentElement.lang = 'ar';
  if (!document.getElementById('vidnest-web-a11y')) {
    const style = document.createElement('style');
    style.id = 'vidnest-web-a11y';
    style.textContent = `
      html, body, #root, [dir="rtl"], [dir="rtl"] * { direction: rtl !important; }
      :focus-visible { outline: 3px solid #6A4CFF !important; outline-offset: 2px !important; }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
      }
    `;
    document.head.appendChild(style);
  }
}
import { StatusBar } from 'expo-status-bar';
import { tokens, type ThemeMode } from './src/theme/tokens.ts';
import { useDownloader } from './src/hooks/useDownloader.ts';
import BottomNav, { type TabKey } from './src/components/BottomNav.tsx';
import HomeScreen from './src/components/HomeScreen.tsx';
import DownloadsScreen from './src/components/DownloadsScreen.tsx';
import LibraryScreen from './src/components/LibraryScreen.tsx';
import SettingsModal from './src/components/SettingsModal.tsx';

const DEFAULT_BASE_URL =
  process.env.EXPO_PUBLIC_VIDNEST_API_URL ?? 'https://6c55b2a011d7d5.lhr.life';

export default function App() {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(
    systemColorScheme === 'dark' ? 'dark' : 'light',
  );
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (systemColorScheme === 'dark' || systemColorScheme === 'light') {
      setThemeMode(systemColorScheme);
    }
  }, [systemColorScheme]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
      document.documentElement.style.colorScheme = themeMode;
      const focusColor = themeMode === 'dark' ? '#9A85FF' : '#6A4CFF';
      let style = document.getElementById('vidnest-web-a11y') as HTMLStyleElement | null;
      if (!style) {
        style = document.createElement('style');
        style.id = 'vidnest-web-a11y';
        document.head.appendChild(style);
      }
      style.textContent = `
        html, body, #root, [dir="rtl"], [dir="rtl"] * { direction: rtl !important; }
        :focus-visible { outline: 3px solid ${focusColor} !important; outline-offset: 2px !important; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
        }
      `;
    }
  }, [themeMode]);

  const t = tokens[themeMode];

  const {
    url,
    setUrl,
    isAnalyzing,
    preview,
    downloads,
    library,
    toastMessage,
    connStatus,
    serverUrl,
    setServerUrl,
    pasteFromClipboard,
    analyzeUrl,
    selectQualityOption,
    startDownload,
    shareItem,
    testConnection,
  } = useDownloader(DEFAULT_BASE_URL);

  const handleStartDownloadFromHome = async () => {
    const res = await startDownload();
    if (res) {
      setActiveTab('downloads');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.bg }]}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />

      {/* Main Screen Content */}
      <View style={styles.screenContainer}>
        {activeTab === 'home' && (
          <HomeScreen
            themeMode={themeMode}
            url={url}
            onUrlChange={setUrl}
            onPaste={pasteFromClipboard}
            onAnalyze={analyzeUrl}
            isAnalyzing={isAnalyzing}
            preview={preview}
            onSelectOption={selectQualityOption}
            onStartDownload={handleStartDownloadFromHome}
            recentDownloads={downloads}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}

        {activeTab === 'downloads' && (
          <DownloadsScreen
            themeMode={themeMode}
            downloads={downloads}
            onShareItem={shareItem}
          />
        )}

        {activeTab === 'library' && (
          <LibraryScreen
            themeMode={themeMode}
            items={library}
            onOpenItem={shareItem}
          />
        )}
      </View>

      {/* Top Toast Banner */}
      {toastMessage && (
        <View style={styles.toastWrapper}>
          <View
            accessibilityLiveRegion="polite"
            style={[
              styles.toastPill,
              {
                backgroundColor: t.primary,
              },
            ]}
          >
            <Text style={[styles.toastText, { color: t.onPrimary }]}>
              {toastMessage}
            </Text>
          </View>
        </View>
      )}

      {/* Bottom Floating Pill Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        themeMode={themeMode}
      />

      {/* Settings / Server Configuration Modal */}
      <SettingsModal
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        themeMode={themeMode}
        onToggleTheme={setThemeMode}
        serverUrl={serverUrl}
        onServerUrlChange={setServerUrl}
        onTestConnection={testConnection}
        connStatus={connStatus}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    position: 'relative',
  },
  toastWrapper: {
    position: 'absolute',
    top: 16,
    left: 20,
    right: 20,
    zIndex: 99,
    alignItems: 'center',
  },
  toastPill: {
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  toastText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
