import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AudioIcon,
  LibraryIcon,
  OpenIcon,
  PlayIcon,
  SearchIcon,
  VideoIcon,
} from './Icons.tsx';
import { tokens, radii, fonts, type ThemeMode } from '../theme/tokens.ts';
import { copy } from '../i18n/copy.ts';
import type { LibraryItem, MediaKind } from '../hooks/useDownloader.ts';
import EmptyState from './EmptyState.tsx';

type Props = {
  themeMode: ThemeMode;
  items: LibraryItem[];
  onPlay: (item: LibraryItem) => void;
  onOpen: (item: LibraryItem) => void;
  onGoHome: () => void;
};

type Filter = 'all' | MediaKind;

export default function LibraryScreen({ themeMode, items, onPlay, onOpen, onGoHome }: Props) {
  const t = tokens[themeMode];
  const c = copy.ar;
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter((item) => {
      if (filter !== 'all' && item.kind !== filter) return false;
      if (!term) return true;
      return `${item.title} ${item.source}`.toLowerCase().includes(term);
    });
  }, [items, query, filter]);

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'video', label: 'فيديو' },
    { key: 'audio', label: 'صوت' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: t.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: t.ink }]}>{c.tabLibrary}</Text>
        {items.length > 0 ? (
          <Text style={[styles.count, { color: t.muted }]}>{items.length}</Text>
        ) : null}
      </View>

      {items.length > 0 ? (
        <>
          <View style={[styles.searchBox, { backgroundColor: t.surface, borderColor: t.line }]}>
            <SearchIcon size={18} color={t.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="ابحث في مكتبتك"
              placeholderTextColor={t.muted}
              style={[styles.searchInput, { color: t.ink }]}
              accessibilityLabel="بحث في المكتبة"
              returnKeyType="search"
            />
          </View>

          <View style={styles.filters} accessibilityRole="tablist">
            {filters.map((entry) => {
              const active = filter === entry.key;
              return (
                <TouchableOpacity
                  key={entry.key}
                  onPress={() => setFilter(entry.key)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: active ? t.primary : 'transparent',
                      borderColor: active ? t.primary : t.line,
                    },
                  ]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.filterLabel,
                      { color: active ? t.onPrimary : t.muted },
                    ]}
                  >
                    {entry.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          themeMode={themeMode}
          icon={<LibraryIcon size={26} color={t.muted} />}
          title={c.emptyLibraryTitle}
          body={c.emptyLibraryBody}
          actionLabel={c.goHome}
          onAction={onGoHome}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          themeMode={themeMode}
          icon={<SearchIcon size={26} color={t.muted} />}
          title="لا نتائج مطابقة"
          body="جرّب كلمة أخرى أو أعد التصفية إلى الكل."
        />
      ) : (
        <View style={styles.grid}>
          {visible.map((item) => (
            <View
              key={item.id}
              style={[styles.card, { backgroundColor: t.surface, borderColor: t.line }]}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => onPlay(item)}
                style={[styles.preview, { backgroundColor: t.surfaceAlt }]}
                accessibilityRole="button"
                accessibilityLabel={`${c.play}: ${item.title}`}
              >
                {item.kind === 'audio' ? (
                  <AudioIcon size={24} color={t.muted} />
                ) : (
                  <VideoIcon size={24} color={t.muted} />
                )}
                {item.duration ? (
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>{item.duration}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>

              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { color: t.ink }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[styles.cardMeta, { color: t.muted }]} numberOfLines={1}>
                  {[item.source, item.sizeFormatted].filter(Boolean).join(' · ')}
                </Text>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    onPress={() => onPlay(item)}
                    style={[styles.playButton, { backgroundColor: t.accentLight }]}
                    accessibilityRole="button"
                    accessibilityLabel={`${c.play}: ${item.title}`}
                    activeOpacity={0.85}
                  >
                    <PlayIcon size={14} color={t.accentText} />
                    <Text style={[styles.playLabel, { color: t.accentText }]}>{c.play}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => onOpen(item)}
                    style={[styles.openButton, { borderColor: t.line }]}
                    accessibilityRole="button"
                    accessibilityLabel={`${c.open}: ${item.title}`}
                    activeOpacity={0.85}
                  >
                    <OpenIcon size={14} color={t.ink} />
                    <Text style={[styles.openLabel, { color: t.ink }]}>{c.open}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 130,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'right',
  },
  count: {
    fontFamily: fonts.medium,
    fontSize: 13,
    fontWeight: '500',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: radii.chip,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: 'right',
    outlineStyle: 'none',
  } as object,
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    minHeight: 36,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flexGrow: 1,
    flexBasis: 240,
    maxWidth: 340,
    borderRadius: radii.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  preview: {
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(11,15,25,0.72)',
  },
  durationText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardBody: {
    padding: 12,
    gap: 6,
  },
  cardTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    textAlign: 'right',
  },
  cardMeta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    textAlign: 'right',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  playButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  playLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    fontWeight: '700',
  },
  openButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  openLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    fontWeight: '600',
  },
});
