import React from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CheckIcon, PlayIcon, PlatformIcon } from './Icons.tsx';
import { tokens, radii, fonts, type ThemeMode } from '../theme/tokens.ts';
import { copy } from '../i18n/copy.ts';
import type { ActiveDownloadItem } from '../hooks/useDownloader.ts';

type Props = {
  themeMode: ThemeMode;
  downloads: ActiveDownloadItem[];
  onShareItem: (item: ActiveDownloadItem) => void;
};

export default function DownloadsScreen({
  themeMode,
  downloads,
  onShareItem,
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
        <Text style={[styles.title, { color: t.ink }]}>{c.tabDownloads}</Text>
      </View>

      {/* Storage Hint */}
      <Text style={[styles.hint, { color: t.muted }]}>{c.downloadsHint}</Text>

      {/* Downloads List */}
      <View style={styles.list}>
        {downloads.map((item, idx) => {
          const isComplete = item.progress >= 100;
          const badgeText = idx % 2 === 0 ? '4K' : 'HD';
          const srcLower = (item.source || '').toLowerCase();
          const platId = srcLower.includes('tiktok')
            ? 'tiktok'
            : srcLower.includes('youtu')
            ? 'youtube'
            : srcLower.includes('insta')
            ? 'instagram'
            : srcLower.includes('x') || srcLower.includes('twit')
            ? 'x'
            : srcLower.includes('sound')
            ? 'soundcloud'
            : srcLower.includes('face') || srcLower.includes('fb')
            ? 'facebook'
            : 'youtube';

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={isComplete ? 0.75 : 1}
              onPress={() => isComplete && onShareItem(item)}
              style={[
                styles.row,
                {
                  backgroundColor: t.surface,
                  borderColor: t.line,
                },
              ]}
            >
              {/* Crafted Media Thumbnail with Platform Vector Badge */}
              <View style={styles.thumb}>
                <PlatformIcon id={platId} size={30} />
                <View style={styles.thumbTagBadge}>
                  <Text style={styles.thumbTagText}>{badgeText}</Text>
                </View>
              </View>

              {/* Middle Information */}
              <View style={styles.mid}>
                <Text style={[styles.itemTitle, { color: t.ink }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.subtitle, { color: t.muted }]}>
                  {item.source} · {item.sizeFormatted}
                </Text>
                {!isComplete && (
                  <View style={[styles.barBg, { backgroundColor: t.surfaceAlt }]}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${item.progress}%`,
                          backgroundColor: t.accent,
                        },
                      ]}
                    />
                  </View>
                )}
              </View>

              {/* Action / Percentage badge */}
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isComplete ? t.mintBg : t.accentLight,
                  },
                ]}
              >
                {isComplete ? (
                  <CheckIcon size={18} color={t.accentText} />
                ) : (
                  <Text style={[styles.badgeText, { color: t.accentText }]}>
                    {item.progress}%
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {downloads.length === 0 && (
          <View style={[styles.emptyBox, { backgroundColor: t.surface, borderColor: t.line }]}>
            <Text style={[styles.emptyText, { color: t.muted }]}>{c.emptyDownloads}</Text>
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
    marginBottom: 6,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'right',
    letterSpacing: 0,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 22,
    lineHeight: 22,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: radii.row,
    borderWidth: 1,
    gap: 12,
    minHeight: 68,
  },
  thumb: {
    width: 58,
    height: 58,
    borderRadius: radii.thumb,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  thumbPlayCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(251, 146, 60, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbTagBadge: {
    position: 'absolute',
    bottom: 3,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  thumbTagText: {
    fontFamily: fonts.bold,
    color: '#FDBA74',
    fontSize: 9,
    fontWeight: '700',
  },
  mid: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 3,
  },
  itemTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    textAlign: 'right',
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'right',
  },
  barBg: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  badge: {
    minWidth: 48,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyBox: {
    padding: 32,
    borderRadius: radii.card,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
});
