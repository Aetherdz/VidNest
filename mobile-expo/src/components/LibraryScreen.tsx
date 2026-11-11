import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PlayIcon } from './Icons.tsx';
import { tokens, radii, gradients, type ThemeMode } from '../theme/tokens.ts';
import { copy } from '../i18n/copy.ts';
import type { LibraryItem } from '../hooks/useDownloader.ts';

type Props = {
  themeMode: ThemeMode;
  items: LibraryItem[];
  onOpenItem: (item: LibraryItem) => void;
};

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
          const gradPair = gradients[(item.gradientIndex ?? index) % gradients.length];
          const bgPrimary = gradPair[0];
          const bgSecondary = gradPair[1];

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => onOpenItem(item)}
              style={styles.tile}
              accessibilityRole="button"
              accessibilityLabel={`${item.title} - ${item.duration}`}
            >
              {/* Media Card Thumbnail */}
              <View
                style={[
                  styles.thumbnail,
                  {
                    backgroundColor: bgPrimary,
                    borderColor: t.line,
                  },
                ]}
              >
                {/* Secondary gradient tone overlay */}
                <View
                  style={[
                    styles.gradientOverlay,
                    {
                      backgroundColor: bgSecondary,
                      opacity: 0.5,
                    },
                  ]}
                />

                {/* Play triangle */}
                <View style={styles.playButtonWrapper}>
                  <PlayIcon size={26} color="#FFFFFF" />
                </View>

                {/* Duration Badge */}
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{item.duration}</Text>
                </View>
              </View>

              {/* Title under thumbnail */}
              <Text style={[styles.tileTitle, { color: t.ink }]} numberOfLines={2}>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}

        {items.length === 0 && (
          <View style={[styles.emptyBox, { backgroundColor: t.surface, borderColor: t.line }]}>
            <Text style={[styles.emptyText, { color: t.muted }]}>{c.emptyLibrary}</Text>
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
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'right',
    letterSpacing: -0.3,
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
    marginBottom: 8,
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
  playButtonWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  tileTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'right',
    lineHeight: 18,
  },
  emptyBox: {
    width: '100%',
    padding: 32,
    borderRadius: radii.card,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
});
