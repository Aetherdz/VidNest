import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PlayIcon, PlatformIcon, LibraryIcon } from './Icons.tsx';
import { tokens, radii, fonts, type ThemeMode } from '../theme/tokens.ts';
import { copy } from '../i18n/copy.ts';
import type { LibraryItem } from '../hooks/useDownloader.ts';

type Props = {
  themeMode: ThemeMode;
  items: LibraryItem[];
  onOpenItem: (item: LibraryItem) => void;
};

const PLATFORM_THEMES = {
  youtube: {
    bgStart: '#2A080C',
    bgEnd: '#120406',
    accent: '#FF0000',
    quality: '4K',
    glow: 'rgba(255, 0, 0, 0.28)',
  },
  tiktok: {
    bgStart: '#041B22',
    bgEnd: '#070D14',
    accent: '#00F2FE',
    quality: 'HD',
    glow: 'rgba(0, 242, 254, 0.22)',
  },
  instagram: {
    bgStart: '#2C0A28',
    bgEnd: '#110314',
    accent: '#E1306C',
    quality: '4K',
    glow: 'rgba(225, 48, 108, 0.25)',
  },
  x: {
    bgStart: '#0D1628',
    bgEnd: '#060A12',
    accent: '#38BDF8',
    quality: 'HD',
    glow: 'rgba(56, 189, 248, 0.20)',
  },
} as const;

export default function LibraryScreen({
  themeMode,
  items,
  onOpenItem,
}: Props) {
  const t = tokens[themeMode];
  const c = copy.ar;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: t.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header */}
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: t.ink }]}>{c.tabLibrary}</Text>
      </View>

      {/* 2-Column Grid */}
      <View style={styles.grid}>
        {items.map((item, index) => {
          const srcLower = (item.source || '').toLowerCase();
          const platId: 'youtube' | 'tiktok' | 'instagram' | 'x' = srcLower.includes('tiktok')
            ? 'tiktok'
            : srcLower.includes('youtu')
            ? 'youtube'
            : srcLower.includes('insta')
            ? 'instagram'
            : srcLower.includes('x') || srcLower.includes('twit')
            ? 'x'
            : (index % 4 === 0 ? 'youtube' : index % 4 === 1 ? 'tiktok' : index % 4 === 2 ? 'instagram' : 'x');

          const theme = PLATFORM_THEMES[platId];
          const badgeLabel = index % 2 === 0 ? '4K' : 'HD';

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => onOpenItem(item)}
              style={styles.tile}
              accessibilityRole="button"
              accessibilityLabel={`${item.title} - ${item.duration}`}
            >
              {/* Crafted Cinematic Platform Media Card */}
              <View
                style={[
                  styles.thumbnail,
                  {
                    backgroundColor: theme.bgEnd,
                    borderColor: t.line,
                  },
                ]}
              >
                {/* Dual-tone gradient glow */}
                <View
                  style={[
                    styles.gradientOverlay,
                    {
                      backgroundColor: theme.bgStart,
                      opacity: 0.85,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.ambientGlow,
                    {
                      backgroundColor: theme.glow,
                    },
                  ]}
                />

                {/* Platform Logo Watermark in Corner */}
                <View style={styles.watermarkWrapper}>
                  <PlatformIcon id={platId} size={64} />
                </View>

                {/* Top Quality Badge */}
                <View
                  style={[
                    styles.qualityBadge,
                    badgeLabel === '4K' ? styles.quality4K : styles.qualityHD,
                  ]}
                >
                  <Text
                    style={[
                      styles.qualityBadgeText,
                      { color: badgeLabel === '4K' ? '#FBBF24' : '#38BDF8' },
                    ]}
                  >
                    {badgeLabel}
                  </Text>
                </View>

                {/* Top Platform Badge */}
                <View style={styles.platformBadge}>
                  <PlatformIcon id={platId} size={20} />
                </View>

                {/* Center Glassmorphic Play Button */}
                <View style={styles.playButtonWrapper}>
                  <PlayIcon size={24} color="#FFFFFF" />
                </View>

                {/* Duration Badge */}
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{item.duration}</Text>
                </View>
              </View>

              {/* Title & Source under thumbnail */}
              <Text style={[styles.tileTitle, { color: t.ink }]} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.tileFooter}>
                <PlatformIcon id={platId} size={14} />
                <Text style={[styles.tileSource, { color: t.muted }]}>
                  {item.source} · {badgeLabel}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {items.length === 0 && (
          <View style={[styles.emptyBox, { backgroundColor: t.surface, borderColor: t.line }]}>
            <View style={[styles.emptyIconCircle, { backgroundColor: t.surfaceAlt }]}>
              <LibraryIcon size={34} color={t.muted} />
            </View>
            <Text style={[styles.emptyTitle, { color: t.ink }]}>مكتبتك هادئة وخالية</Text>
            <Text style={[styles.emptySubtitle, { color: t.muted }]}>
              مقاطع الفيديو التي تكتمل تنزيلاتها ستظهر هنا مرتبة وجاهزة للتشغيل في أي وقت دون إنترنت.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 130,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'right',
    letterSpacing: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
  },
  tile: {
    width: '47.5%',
    minHeight: 48,
    marginBottom: 10,
  },
  thumbnail: {
    aspectRatio: 1 / 1.05,
    borderRadius: radii.chip,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  ambientGlow: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: 40,
    opacity: 0.6,
  },
  watermarkWrapper: {
    position: 'absolute',
    bottom: -10,
    left: -10,
    opacity: 0.14,
    transform: [{ rotate: '12deg' }],
  },
  qualityBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 2,
  },
  quality4K: {
    backgroundColor: 'rgba(245, 158, 11, 0.22)',
    borderColor: 'rgba(245, 158, 11, 0.55)',
  },
  qualityHD: {
    backgroundColor: 'rgba(6, 182, 212, 0.22)',
    borderColor: 'rgba(6, 182, 212, 0.55)',
  },
  qualityBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    fontWeight: '700',
  },
  platformBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  playButtonWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  durationBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 2,
  },
  durationText: {
    fontFamily: fonts.semibold,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  tileTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'right',
    lineHeight: 21,
  },
  tileFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  tileSource: {
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: '500',
  },
  emptyBox: {
    width: '100%',
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderRadius: radii.card,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 320,
  },
});
