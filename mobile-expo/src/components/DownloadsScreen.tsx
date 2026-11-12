import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DownloadIcon } from './Icons.tsx';
import { tokens, radii, fonts, type ThemeMode } from '../theme/tokens.ts';
import { copy } from '../i18n/copy.ts';
import type { ActiveDownloadItem } from '../hooks/useDownloader.ts';
import DownloadRow from './DownloadRow.tsx';
import EmptyState from './EmptyState.tsx';

type Props = {
  themeMode: ThemeMode;
  downloads: ActiveDownloadItem[];
  onPlay: (item: ActiveDownloadItem) => void;
  onOpen: (item: ActiveDownloadItem) => void;
  onRemove: (id: string) => void;
  onGoHome: () => void;
};

type Filter = 'all' | 'active' | 'done' | 'failed';

export default function DownloadsScreen({
  themeMode,
  downloads,
  onPlay,
  onOpen,
  onRemove,
  onGoHome,
}: Props) {
  const t = tokens[themeMode];
  const c = copy.ar;
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(() => {
    return downloads.filter((item) => {
      if (filter === 'active') return item.status === 'downloading';
      if (filter === 'done') return item.status === 'completed';
      if (filter === 'failed') return item.status === 'error';
      return true;
    });
  }, [downloads, filter]);

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'active', label: c.statusDownloading },
    { key: 'done', label: c.statusCompleted },
    { key: 'failed', label: c.statusError },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: t.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: t.ink }]}>{c.tabDownloads}</Text>
        {downloads.length > 0 ? (
          <Text style={[styles.count, { color: t.muted }]}>{downloads.length}</Text>
        ) : null}
      </View>
      <Text style={[styles.hint, { color: t.muted }]}>{c.downloadsHint}</Text>

      {downloads.length > 0 ? (
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
                <Text style={[styles.filterLabel, { color: active ? t.onPrimary : t.muted }]}>
                  {entry.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}

      {downloads.length === 0 ? (
        <EmptyState
          themeMode={themeMode}
          icon={<DownloadIcon size={26} color={t.muted} />}
          title={c.emptyDownloadsTitle}
          body={c.emptyDownloadsBody}
          actionLabel={c.goHome}
          onAction={onGoHome}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          themeMode={themeMode}
          icon={<DownloadIcon size={26} color={t.muted} />}
          title="لا عناصر في هذا التصنيف"
          body="بدّل التصنيف لعرض بقية التنزيلات."
        />
      ) : (
        <View style={styles.list}>
          {visible.map((item) => (
            <DownloadRow
              key={item.id}
              item={item}
              themeMode={themeMode}
              onPlay={onPlay}
              onOpen={onOpen}
              onRemove={onRemove}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 130,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 6,
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
  hint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'right',
    marginBottom: 16,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    gap: 10,
  },
});
