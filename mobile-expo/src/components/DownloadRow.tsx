import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AudioIcon, OpenIcon, PlayIcon, VideoIcon } from './Icons.tsx';
import { tokens, radii, fonts, type ThemeMode } from '../theme/tokens.ts';
import { copy } from '../i18n/copy.ts';
import type { ActiveDownloadItem } from '../hooks/useDownloader.ts';

type Props = {
  item: ActiveDownloadItem;
  themeMode: ThemeMode;
  onPlay: (item: ActiveDownloadItem) => void;
  onOpen: (item: ActiveDownloadItem) => void;
  onRemove?: (id: string) => void;
};

export default function DownloadRow({ item, themeMode, onPlay, onOpen, onRemove }: Props) {
  const t = tokens[themeMode];
  const c = copy.ar;
  const isDone = item.status === 'completed';
  const isError = item.status === 'error';

  const statusLabel = isDone ? c.statusCompleted : isError ? c.statusError : c.statusDownloading;

  return (
    <View style={[styles.row, { backgroundColor: t.surface, borderColor: t.line }]}>
      <TouchableOpacity
        activeOpacity={isDone ? 0.8 : 1}
        onPress={() => isDone && onPlay(item)}
        disabled={!isDone}
        style={[styles.thumb, { backgroundColor: t.surfaceAlt, borderColor: t.line }]}
        accessibilityRole="button"
        accessibilityLabel={isDone ? `${c.play}: ${item.title}` : item.title}
        accessibilityState={{ disabled: !isDone }}
      >
        {item.kind === 'audio' ? (
          <AudioIcon size={20} color={t.muted} />
        ) : (
          <VideoIcon size={20} color={t.muted} />
        )}
        {item.duration ? (
          <Text style={[styles.thumbDuration, { color: t.muted }]}>{item.duration}</Text>
        ) : null}
      </TouchableOpacity>

      <View style={styles.mid}>
        <Text style={[styles.title, { color: t.ink }]} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: t.muted }]} numberOfLines={1}>
            {[item.source, item.sizeFormatted !== '—' ? item.sizeFormatted : null]
              .filter(Boolean)
              .join(' · ')}
          </Text>
          <View
            style={[
              styles.statusChip,
              { backgroundColor: isError ? t.dangerBg : isDone ? t.mintBg : t.accentLight },
            ]}
          >
            {item.progress != null && !isDone && !isError ? (
              <Text style={[styles.statusText, { color: t.accentText }]}>{item.progress}%</Text>
            ) : (
              <Text
                style={[
                  styles.statusText,
                  { color: isError ? t.danger : isDone ? t.accentText : t.accentText },
                ]}
              >
                {statusLabel}
              </Text>
            )}
          </View>
        </View>

        {!isDone && !isError && (
          <View style={[styles.track, { backgroundColor: t.surfaceAlt }]}>
            <View
              style={[
                styles.fill,
                {
                  backgroundColor: t.accent,
                  width: item.progress == null ? '35%' : `${item.progress}%`,
                },
              ]}
            />
          </View>
        )}

        {isError && item.errorMessage ? (
          <Text style={[styles.error, { color: t.danger }]} numberOfLines={2}>
            {item.errorMessage}
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        {isDone ? (
          <>
            <TouchableOpacity
              onPress={() => onPlay(item)}
              style={[styles.iconButton, { backgroundColor: t.accentLight }]}
              accessibilityRole="button"
              accessibilityLabel={`${c.play}: ${item.title}`}
              activeOpacity={0.8}
            >
              <PlayIcon size={16} color={t.accentText} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onOpen(item)}
              style={[styles.iconButton, { backgroundColor: t.surfaceAlt }]}
              accessibilityRole="button"
              accessibilityLabel={`${c.open}: ${item.title}`}
              activeOpacity={0.8}
            >
              <OpenIcon size={16} color={t.ink} />
            </TouchableOpacity>
          </>
        ) : isError ? (
          <TouchableOpacity
            onPress={() => onRemove?.(item.id)}
            style={[styles.textButton, { borderColor: t.line }]}
            accessibilityRole="button"
            accessibilityLabel={`${c.remove}: ${item.title}`}
            activeOpacity={0.8}
          >
            <Text style={[styles.textButtonLabel, { color: t.muted }]}>{c.remove}</Text>
          </TouchableOpacity>
        ) : (
          <ActivityIndicator size="small" color={t.accent} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: radii.row,
    borderWidth: 1,
    minHeight: 76,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radii.thumb,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  thumbDuration: {
    fontFamily: fonts.medium,
    fontSize: 9,
    fontWeight: '500',
  },
  mid: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    textAlign: 'right',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    flexShrink: 1,
    textAlign: 'right',
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  statusText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    fontWeight: '600',
  },
  track: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 2,
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButton: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButtonLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    fontWeight: '600',
  },
});
