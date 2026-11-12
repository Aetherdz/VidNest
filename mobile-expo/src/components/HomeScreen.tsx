import React, { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  VidNestLogo,
  SunIcon,
  MoonIcon,
  ClipIcon,
  CloseIcon,
  DownloadIcon,
  PlayIcon,
  CheckIcon,
  PlatformIcon,
} from './Icons.tsx';
import { tokens, radii, fonts, type ThemeMode } from '../theme/tokens.ts';
import { copy } from '../i18n/copy.ts';
import type { ActiveDownloadItem, PreviewData } from '../hooks/useDownloader.ts';
import DownloadRow from './DownloadRow.tsx';
import EmptyState from './EmptyState.tsx';

type Props = {
  themeMode: ThemeMode;
  url: string;
  onUrlChange: (text: string) => void;
  onClear?: () => void;
  onPaste: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  preview: PreviewData | null;
  onSelectOption: (id: string) => void;
  onStartDownload: () => void;
  recentDownloads: ActiveDownloadItem[];
  onToggleTheme: () => void;
  onPlay: (item: ActiveDownloadItem) => void;
  onOpen: (item: ActiveDownloadItem) => void;
  onRemove: (id: string) => void;
  onGoDownloads: () => void;
};

export default function HomeScreen({
  themeMode,
  url,
  onUrlChange,
  onClear,
  onPaste,
  onAnalyze,
  isAnalyzing,
  preview,
  onSelectOption,
  onStartDownload,
  recentDownloads,
  onToggleTheme,
  onPlay,
  onOpen,
  onRemove,
  onGoDownloads,
}: Props) {
  const t = tokens[themeMode];
  const c = copy.ar;
  const [isFocused, setIsFocused] = useState(false);

  const canAnalyze = url.trim().length >= 8 && !isAnalyzing;

  const matchingPlatformId = c.platforms.find((p) =>
    p.match.some((keyword) => url.toLowerCase().includes(keyword)),
  )?.id;

  const openPlatform = (platformUrl: string) => {
    Linking.openURL(platformUrl).catch(() => {});
  };

  const openAtheerium = () => {
    Linking.openURL(c.byAtheeriumUrl).catch(() => {});
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: t.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <VidNestLogo size={38} />
          <Text style={[styles.brandTitle, { color: t.ink }]}>{c.brand}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onToggleTheme}
          style={[
            styles.menuButton,
            {
              backgroundColor: t.surface,
              borderColor: t.line,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            themeMode === 'dark' ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'
          }
        >
          {themeMode === 'dark' ? (
            <SunIcon size={20} color={t.ink} />
          ) : (
            <MoonIcon size={20} color={t.ink} />
          )}
        </TouchableOpacity>
      </View>

      {/* Headline */}
      <Text style={[styles.headline, { color: t.ink }]}>{c.headline}</Text>

      {/* URL Input Box */}
      <View
        style={[
          styles.inputBox,
          {
            backgroundColor: t.surface,
            borderColor: isFocused ? t.accent : t.line,
            shadowColor: isFocused ? t.accent : 'transparent',
            shadowOpacity: isFocused ? 0.2 : 0,
            shadowRadius: isFocused ? 8 : 0,
            elevation: isFocused ? 3 : 0,
          },
        ]}
      >
        <TextInput
          value={url}
          onChangeText={onUrlChange}
          placeholder={c.urlPlaceholder}
          placeholderTextColor={t.muted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          textAlign="right"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.textInput,
            { color: t.ink, writingDirection: url ? 'ltr' : 'rtl' },
          ]}
        />
        {url.trim().length > 0 ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (onClear) onClear();
              else onUrlChange('');
            }}
            style={[styles.pasteButton, { backgroundColor: t.surfaceAlt }]}
            accessibilityRole="button"
            accessibilityLabel="مسح الرابط"
          >
            <CloseIcon size={18} color={t.muted} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPaste}
            style={[styles.pasteButton, { backgroundColor: t.accentLight }]}
            accessibilityRole="button"
            accessibilityLabel="لصق الرابط"
          >
            <ClipIcon size={20} color={t.accentText} />
          </TouchableOpacity>
        )}
      </View>

      {/* Download Action Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={!canAnalyze}
        onPress={onAnalyze}
        style={[
          styles.downloadButton,
          {
            backgroundColor: canAnalyze ? t.primary : 'transparent',
            borderWidth: canAnalyze ? 0 : 1,
            borderColor: t.line,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={isAnalyzing ? c.analyzing : c.download}
      >
        {isAnalyzing ? (
          <View style={styles.analyzingRow}>
            <ActivityIndicator size="small" color={t.onPrimary} style={{ marginStart: 8 }} />
            <Text style={[styles.downloadButtonText, { color: t.onPrimary }]}>{c.analyzing}</Text>
          </View>
        ) : (
          <View style={styles.downloadRow}>
            <DownloadIcon size={22} color={canAnalyze ? t.onPrimary : t.muted} />
            <Text
              style={[
                styles.downloadButtonText,
                { color: canAnalyze ? t.onPrimary : t.muted, marginStart: 8 },
              ]}
            >
              {c.download}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Platform shortcuts: open the platform to copy a link, never inject one */}
      <View style={styles.chipsContainer}>
        {c.platforms.slice(0, 4).map((platform) => {
          const isSelected = matchingPlatformId === platform.id;
          return (
            <TouchableOpacity
              key={platform.id}
              activeOpacity={0.7}
              onPress={() => openPlatform(platform.url)}
              accessibilityRole="link"
              accessibilityHint={c.platformHint}
              accessibilityLabel={`${platform.name} — ${c.platformHint}`}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? t.primary : t.surface,
                  borderColor: isSelected ? t.primary : t.line,
                },
              ]}
            >
              <PlatformIcon
                id={platform.id}
                size={22}
                color={isSelected ? t.onPrimary : platform.color}
              />
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isSelected ? t.onPrimary : t.ink,
                    fontWeight: isSelected ? '700' : '600',
                  },
                ]}
              >
                {platform.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Format Preview Card */}
      {preview && (
        <View
          style={[
            styles.previewCard,
            {
              backgroundColor: t.surface,
              borderColor: t.line,
            },
          ]}
        >
          {/* Media header: neutral surface, real duration only when the server reports it */}
          <View style={[styles.previewThumbnail, { backgroundColor: t.surfaceAlt, borderColor: t.line }]}>
            <View style={[styles.playIconWrapper, { backgroundColor: t.surface, borderColor: t.line }]}>
              <PlayIcon size={24} color={t.muted} />
            </View>
            {preview.duration ? (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{preview.duration}</Text>
              </View>
            ) : null}
          </View>

          {/* Title and Source */}
          <Text style={[styles.previewTitle, { color: t.ink }]} numberOfLines={2}>
            {preview.title}
          </Text>
          <Text style={[styles.previewSource, { color: t.muted }]}>{preview.source}</Text>

          {/* 3-Option Quality Selector */}
          <View style={styles.qualitySegment}>
            {preview.options.map((opt) => {
              const isSelected = preview.selectedOptionId === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.8}
                  onPress={() => onSelectOption(opt.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  style={[
                    styles.qualityOption,
                    {
                      backgroundColor: isSelected ? t.accentLight : 'transparent',
                      borderColor: isSelected ? t.accent : t.line,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.qualityLabel,
                      {
                        color: isSelected ? t.accentText : t.ink,
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <Text
                    style={[
                      styles.qualitySize,
                      {
                        color: isSelected ? t.accentText : t.muted,
                      },
                    ]}
                  >
                    {opt.size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Start Download Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onStartDownload}
            style={[
              styles.startDownloadButton,
              {
                backgroundColor: t.primary,
              },
            ]}
          >
            <DownloadIcon size={20} color={t.onPrimary} />
            <Text style={[styles.startDownloadText, { color: t.onPrimary, marginStart: 8 }]}>
              {c.startDownload}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recent Downloads Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: t.ink }]}>{c.recentTitle}</Text>
        {recentDownloads.length > 0 ? (
          <TouchableOpacity
            onPress={onGoDownloads}
            accessibilityRole="button"
            accessibilityLabel={c.tabDownloads}
            activeOpacity={0.7}
          >
            <Text style={[styles.sectionLink, { color: t.accentText }]}>{c.tabDownloads}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {recentDownloads.length === 0 ? (
        <EmptyState
          themeMode={themeMode}
          icon={<DownloadIcon size={24} color={t.muted} />}
          title={c.emptyRecent}
          body={c.emptyDownloadsBody}
        />
      ) : (
        <View style={styles.recentList}>
          {recentDownloads.slice(0, 3).map((item) => (
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

      {/* Credit & Backlink */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={openAtheerium}
        style={styles.creditContainer}
      >
        <Text style={[styles.creditText, { color: t.muted }]}>
          {c.byAtheerium} · {c.designerCredit}
        </Text>
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandTitle: {
    fontFamily: fonts.bold,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0,
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontFamily: fonts.bold,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 44,
    textAlign: 'right',
    marginBottom: 20,
    letterSpacing: 0,
  },
  inputBox: {
    borderRadius: radii.box,
    borderWidth: 1.5,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  textInput: {
    fontFamily: fonts.medium,
    flex: 1,
    minHeight: 48,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontWeight: '500',
  },
  pasteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButton: {
    width: '100%',
    height: 58,
    borderRadius: radii.btn,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  downloadRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analyzingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadButtonText: {
    fontFamily: fonts.bold,
    fontSize: 17,
    fontWeight: '700',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: 15,
    borderRadius: 24,
    justifyContent: 'center',
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  chipText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  previewCard: {
    borderRadius: radii.card,
    borderWidth: 1,
    padding: 12,
    marginBottom: 26,
  },
  previewThumbnail: {
    aspectRatio: 16 / 9,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  playIconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  durationText: {
    fontFamily: fonts.semibold,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  previewTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    paddingTop: 12,
    paddingHorizontal: 6,
    textAlign: 'right',
  },
  previewSource: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: 6,
    marginBottom: 12,
    textAlign: 'right',
  },
  qualitySegment: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  qualityOption: {
    flex: 1,
    minHeight: 54,
    borderWidth: 1.5,
    borderRadius: 18,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  qualityLabel: {
    fontFamily: fonts.bold,
    fontSize: 15,
    fontWeight: '700',
  },
  qualitySize: {
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: '500',
  },
  startDownloadButton: {
    width: '100%',
    minHeight: 54,
    borderRadius: radii.btn,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startDownloadText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'right',
  },
  sectionLink: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    fontWeight: '600',
  },
  recentList: {
    gap: 10,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: radii.row,
    borderWidth: 1,
    gap: 12,
  },
  recentThumb: {
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
  recentMid: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 3,
  },
  recentItemTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    textAlign: 'right',
  },
  recentSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'right',
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statusBadge: {
    minWidth: 46,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  progressBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    fontWeight: '700',
  },
  creditContainer: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 10,
  },
  creditText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    fontWeight: '500',
  },
});
