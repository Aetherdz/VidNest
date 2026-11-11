import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HomeIcon, DownloadIcon, LibraryIcon } from './Icons.tsx';
import { tokens, fonts, type ThemeMode } from '../theme/tokens.ts';

export type TabKey = 'home' | 'downloads' | 'library';

type Props = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  themeMode: ThemeMode;
};

export default function BottomNav({ activeTab, onTabChange, themeMode }: Props) {
  const t = tokens[themeMode];

  const tabs: { key: TabKey; label: string; icon: (color: string) => React.ReactNode }[] = [
    {
      key: 'home',
      label: 'الرئيسية',
      icon: (color) => <HomeIcon size={22} color={color} />,
    },
    {
      key: 'downloads',
      label: 'التنزيلات',
      icon: (color) => <DownloadIcon size={22} color={color} />,
    },
    {
      key: 'library',
      label: 'المكتبة',
      icon: (color) => <LibraryIcon size={22} color={color} />,
    },
  ];

  return (
    <View style={styles.navWrapper}>
      <View
        style={[
          styles.navBar,
          {
            backgroundColor: t.surface,
            borderColor: t.line,
          },
        ]}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const iconColor = isActive ? t.mint : t.muted;

          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.8}
              onPress={() => onTabChange(tab.key)}
              style={styles.tabButton}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
            >
              {/* Active Pill behind icon */}
              <View
                style={[
                  styles.iconContainer,
                  isActive && {
                    backgroundColor: t.mintBg,
                    width: 64,
                  },
                ]}
              >
                {tab.icon(iconColor)}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    fontFamily: isActive ? fonts.bold : fonts.medium,
                    color: isActive ? t.ink : t.muted,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'android' ? 24 : 16,
    zIndex: 10,
    maxWidth: 532,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 14,
    marginHorizontal: 'auto',
  },
  navBar: {
    height: 74,
    borderRadius: 30,
    borderWidth: 1,
    flexDirection: 'row', // RTL: Home on Right, Downloads in Middle, Library on Left
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    // Soft studio carbon shadow
    shadowColor: '#111315',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  iconContainer: {
    width: 54,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    letterSpacing: -0.2,
  },
});
