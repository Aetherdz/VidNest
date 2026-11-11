import React, { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  VidNestLogo,
  MenuIcon,
  ClipIcon,
  DownloadIcon,
  PlayIcon,
  CheckIcon,
  PlatformDot,
} from './Icons.tsx';
import { tokens, radii, gradients, type ThemeMode } from '../theme/tokens.ts';
import { copy } from '../i18n/copy.ts';
import type { ActiveDownloadItem, PreviewData } from '../hooks/useDownloader.ts';

type Props = {
  themeMode: ThemeMode;
  url: string;
  onUrlChange: (text: string) => void;
  onPaste: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  preview: PreviewData | null;
  onSelectOption: (id: string) => void;
  onStartDownload: () => void;
  recentDownloads: ActiveDownloadItem[];
  onOpenSettings: () => void;
};

export default function HomeScreen({
  themeMode,
  url,
  onUrlChange,
  onPaste,
  onAnalyze,
  isAnalyzing,
  preview,
  onSelectOption,
  onStartDownload,
  recentDownloads,
  onOpenSettings,
}: Props) {
  const t = tokens[themeMode];
  const c = copy.ar;
  const [isFocused, setIsFocused] = useState(false);

  const canAnalyze = url.trim().length >= 8 && !isAnalyzing;

  // Detect which chip matches current URL
  const matchingPlatformId = c.platforms.find((p) =>
    p.match.some((keyword) => url.toLowerCase().includes(keyword)),
  )?.id;

  const handleChipPress = (sampleUrl: string) => {
    onUrlChange(sampleUrl);
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
          onPress={onOpenSettings}
          style={[
            styles.menuButton,
            {
              backgroundColor: t.surface,
              borderColor: t.line,
            },
          ]}
          accessibilityLabel="القائمة والإعدادات"
        >
          <MenuIcon size={20} color={t.ink} />
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
          dir="rtl"
          textAlign="right"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.textInput,
            { color: t.ink, writingDirection: url ? 'ltr' : 'rtl' },
          ]}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPaste}
          style={[styles.pasteButton, { backgroundColor: t.accentLight }]}
          accessibilityLabel="لصق الرابط"
        >
          <ClipIcon size={22} color={t.accent} />
        </TouchableOpacity>
      </View>

      {/* Download Action Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={!canAnalyze}
        onPress={onAnalyze}
        style={[
          styles.downloadButton,
          {
            backgroundColor: canAnalyze ? t.primary : t.surfaceAlt,
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

      {/* Platform Chips */}
      <View style={styles.chipsContainer}>
        {c.platforms.map((platform) => {
          const isSelected = matchingPlatformId === platform.id;
          return (
            <TouchableOpacity
              key={platform.id}
              activeOpacity={0.7}
              onPress={() => handleChipPress(platform.sample)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? t.accent : t.surface,
                  borderColor: isSelected ? t.accent : t.line,
                },
              ]}
            >
              <PlatformDot color={platform.color} size={8} />
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isSelected ? '#FFFFFF' : t.ink,
                    fontWeight: isSelected ? '700' : '500',
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
          {/* 16:9 Thumbnail preview with play icon & duration */}
          <View
            style={[
              styles.previewThumbnail,
              {
                backgroundColor: gradients[preview.gradientIndex % gradients.length][0],
              },
            ]}
          >
            <View
              style={[
                styles.playOverlay,
                {
                  backgroundColor: gradients[preview.gradientIndex % gradients.length][1],
                  opacity: 0.6,
                },
              ]}
            />
            <View style={styles.playIconWrapper}>
              <PlayIcon size={38} color="#FFFFFF" />
            </View>
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{preview.duration}</Text>
            </View>
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
      <Text style={[styles.sectionTitle, { color: t.ink }]}>{c.recentTitle}</Text>
      <View style={styles.recentList}>
        {recentDownloads.slice(0, 2).map((item) => {
          const isComplete = item.progress >= 100;
          const bgGrad = gradients[item.gradientIndex % gradients.length][0];

          return (
            <View
              key={item.id}
              style={[
                styles.recentRow,
                {
                  backgroundColor: t.surface,
                  borderColor: t.line,
                },
              ]}
            >
              <View style={[styles.recentThumb, { backgroundColor: bgGrad }]} />
              <View style={styles.recentMid}>
                <Text style={[styles.recentItemTitle, { color: t.ink }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.recentSubtitle, { color: t.muted }]}>
                  {item.source} · {item.sizeFormatted}
                </Text>
                {!isComplete && (
                  <View style={[styles.progressBarBg, { backgroundColor: t.surfaceAlt }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${item.progress}%`,
                          backgroundColor: t.accent,
                        },
                      ]}
                    />
                  </View>
                )}
              </View>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isComplete ? t.mintBg : t.accentLight,
                  },
                ]}
              >
                {isComplete ? (
                  <CheckIcon size={18} color={t.mint} />
                ) : (
                  <Text style={[styles.progressBadgeText, { color: t.accentText }]}>
                    {item.progress}%
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

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
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 110, // Space for floating bottom nav
  },
  topRow: {
    flexDirection: 'row', // RTL: Brand on right, Menu on left
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
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
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
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 40,
    textAlign: 'right',
    marginBottom: 20,
    letterSpacing: -0.3,
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
    paddingHorizontal: 16,
    borderRadius: 24,
    justifyContent: 'center',
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipText: {
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingTop: 12,
    paddingHorizontal: 6,
    textAlign: 'right',
  },
  previewSource: {
    fontSize: 13,
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
    fontSize: 15,
    fontWeight: '700',
  },
  qualitySize: {
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
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 12,
    marginTop: 8,
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
  },
  recentMid: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 3,
  },
  recentItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
  },
  recentSubtitle: {
    fontSize: 12.5,
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
    fontSize: 13,
    fontWeight: '500',
  },
});
