import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Animated,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { StatusBar } from "expo-status-bar";
import { useDownloader, type RecentDownload } from "../hooks/useDownloader.ts";
import { formatBytes, formatDuration, pickBestFormat, type FormatOption } from "../utils/urlValidator.ts";
import { tokens, spacing, radii, type ThemeMode } from "../theme/tokens.ts";
import { copy, type Lang } from "../i18n/copy.ts";

type Props = { baseUrl: string };

const SAMPLES = [
  { name: "YouTube", url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ" },
  { name: "TikTok", url: "https://vt.tiktok.com/ZSp5Jdssu/" },
  { name: "Instagram", url: "https://www.instagram.com/reel/Chunk8-jurw/" },
  { name: "SoundCloud", url: "https://soundcloud.com/forss/flickermood" },
  { name: "X", url: "https://x.com/Twitter/status/1234567890" },
  { name: "Facebook", url: "https://www.facebook.com/watch/?v=10153231379946729" },
];

function PressableScale({
  children,
  onPress,
  style,
  disabled,
  accessibilityRole,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  disabled?: boolean;
  accessibilityRole?: any;
  accessibilityLabel?: string;
}) {
  const animatedScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.95,
      stiffness: 380,
      damping: 24,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      stiffness: 380,
      damping: 24,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
      <Pressable
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default function CenteredDownloadInstrument({ baseUrl }: Props) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [lang, setLang] = useState<Lang>("ar");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [customServerUrl, setCustomServerUrl] = useState(baseUrl);
  const [connStatus, setConnStatus] = useState<"idle" | "checking" | "connected" | "failed">("idle");

  const t = tokens[themeMode];
  const c = copy[lang];
  const isRtl = c.dir === "rtl";

  const d = useDownloader(customServerUrl);
  const { width } = useWindowDimensions();
  const scale = useRef(new Animated.Value(1)).current;

  const isBusy = d.status === "probing" || d.status === "downloading";

  // Check backend health on initial mount
  useEffect(() => {
    d.testConnection().then((ok) => {
      setConnStatus(ok ? "connected" : "failed");
    });
  }, [d]);

  const handleTestConnection = useCallback(async () => {
    setConnStatus("checking");
    const ok = await d.testConnection();
    setConnStatus(ok ? "connected" : "failed");
  }, [d]);

  const handleDownload = useCallback(async () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    if (d.mode === "custom" && !d.probe) {
      await d.inspectFormats();
      return;
    }

    const result = await d.triggerCenterDownload();
    if (!result) return;

    try {
      const fileName = result.file;
      const target = `${FileSystem.cacheDirectory ?? ""}${encodeURIComponent(fileName)}`;
      const saved = await FileSystem.downloadAsync(result.url, target);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(saved.uri, {
          dialogTitle: result.title,
        });
      }
    } catch {
      // Server-side download remains saved in recentDownloads list
    }
  }, [d, scale]);

  const handleShareRecent = useCallback(async (item: RecentDownload) => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(item.url, { dialogTitle: item.title });
      } else {
        await Linking.openURL(item.url);
      }
    } catch {
      await Linking.openURL(item.url);
    }
  }, []);

  const openBacklink = useCallback(() => {
    Linking.openURL("https://atheerium.com").catch(() => {});
  }, []);

  return (
    <View style={[styles.screen, { backgroundColor: t.bg }]}>
      <StatusBar style={themeMode === "dark" ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top App Bar */}
        <View style={styles.topbar}>
          <View style={styles.brandGroup}>
            <Text style={[styles.logoText, { color: t.ink }]}>
              VidNest<Text style={{ color: t.primary }}>.</Text>
            </Text>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor:
                    connStatus === "connected"
                      ? t.mintBg
                      : connStatus === "checking"
                      ? t.accentLight
                      : t.dangerBg,
                  borderColor:
                    connStatus === "connected"
                      ? t.mint
                      : connStatus === "checking"
                      ? t.accent
                      : t.danger,
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      connStatus === "connected"
                        ? t.mint
                        : connStatus === "checking"
                        ? t.accent
                        : t.danger,
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      connStatus === "connected"
                        ? t.mint
                        : connStatus === "checking"
                        ? t.accent
                        : t.danger,
                  },
                ]}
              >
                {connStatus === "connected"
                  ? isRtl
                    ? "السيرفر متصل"
                    : "Server Connected"
                  : connStatus === "checking"
                  ? isRtl
                    ? "جارٍ الاتصال…"
                    : "Connecting…"
                  : isRtl
                  ? "تحقق من السيرفر"
                  : "Server Offline"}
              </Text>
            </View>
          </View>

          <View style={styles.topActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Server Settings"
              onPress={() => setSettingsOpen(true)}
              style={[styles.headerPill, { borderColor: t.line, backgroundColor: t.surface }]}
            >
              <Text style={[styles.headerPillText, { color: t.muted, fontWeight: '700' }]}>SET</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Switch Language"
              onPress={() => setLang(lang === "ar" ? "en" : "ar")}
              style={[styles.headerPill, { borderColor: t.line, backgroundColor: t.surface }]}
            >
              <Text style={[styles.headerPillText, { color: t.ink }]}>{lang === "ar" ? "EN" : "عربي"}</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Toggle Theme"
              onPress={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
              style={[styles.headerPill, { borderColor: t.line, backgroundColor: t.surface }]}
            >
              <Text style={[styles.headerPillText, { color: t.ink }]}>
                {themeMode === "dark" ? (isRtl ? "نهار" : "Light") : (isRtl ? "ليل" : "Dark")}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.pillBadge, { backgroundColor: t.primaryLight, borderColor: t.primaryBorder }]}>
            <Text style={[styles.pillBadgeText, { color: t.primary }]}>
              {isRtl ? "أداة التحميل العالمية · خالية من الإعلانات" : "Universal Downloader · Zero Ads"}
            </Text>
          </View>
          <Text style={[styles.heroHeading, { color: t.ink, textAlign: "center" }]}>
            {isRtl ? "تنزيل وتشغيل الوسائط." : "Download & Stream Media."}
            {"\n"}
            <Text style={{ color: t.primary }}>
              {isRtl ? "حر، فوري، بدون إعلانات." : "Quiet, Fast, No Ads."}
            </Text>
          </Text>
          <Text style={[styles.heroSubtitle, { color: t.muted, textAlign: "center" }]}>
            {isRtl
              ? "ألصق رابط أي فيديو أو صوت من أكثر من 1,800 موقع، وتولّ الباقي بضغطة زر."
              : "Paste any video or audio link from 1,800+ platforms. One tap takes care of the rest."}
          </Text>
        </View>

        {/* Main Input Instrument Card */}
        <View style={[styles.instrumentCard, { backgroundColor: t.surface, borderColor: t.line }]}>
          {/* Input Row */}
          <View style={[styles.inputContainer, { backgroundColor: t.surfaceAlt, borderColor: t.line }]}>
            <TextInput
              accessibilityLabel="Media URL Input"
              value={d.url}
              onChangeText={d.setUrl}
              placeholder={c.urlPlaceholder as string}
              placeholderTextColor={t.muted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              style={[
                styles.urlInput,
                {
                  color: t.ink,
                  textAlign: "left",
                  writingDirection: "ltr",
                },
              ]}
            />
            <View style={styles.inputInnerActions}>
              {!!d.url && (
                <Pressable
                  accessibilityRole="button"
                  onPress={d.clear}
                  hitSlop={8}
                  style={styles.clearBtn}
                >
                  <Text style={[styles.clearBtnText, { color: t.muted }]}>×</Text>
                </Pressable>
              )}
              <Pressable
                accessibilityRole="button"
                onPress={d.pasteFromClipboard}
                hitSlop={8}
                style={[styles.pasteBtn, { backgroundColor: t.primaryLight }]}
              >
                <Text style={[styles.pasteBtnText, { color: t.primary }]}>{c.paste as string}</Text>
              </Pressable>
            </View>
          </View>

          {/* Quick Platform Chips */}
          <View style={styles.platformStrip}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.platformScroll}>
              {SAMPLES.map((sample) => {
                const active = d.url === sample.url;
                return (
                  <Pressable
                    key={sample.name}
                    accessibilityRole="button"
                    accessibilityLabel={`Use sample ${sample.name}`}
                    onPress={() => d.selectSampleUrl(sample.url)}
                    style={[
                      styles.platformChip,
                      {
                        backgroundColor: active ? t.primary : t.surfaceAlt,
                        borderColor: active ? t.primary : t.line,
                      },
                    ]}
                  >
                    <Text style={[styles.platformChipText, { color: active ? "#FFFFFF" : t.ink }]}>
                      {sample.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Mode Tabs */}
          <View style={[styles.modesRow, { backgroundColor: t.surfaceAlt, borderColor: t.line }]}>
            {(["video", "audio", "custom"] as const).map((m) => {
              const selected = d.mode === m;
              const modeLabel =
                m === "video"
                  ? (c.video as { [k: string]: string })[lang]
                  : m === "audio"
                  ? (c.audio as { [k: string]: string })[lang]
                  : (c.custom as { [k: string]: string })[lang];
              return (
                <Pressable
                  key={m}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => d.setMode(m)}
                  style={[
                    styles.modeTab,
                    {
                      backgroundColor: selected ? t.surface : "transparent",
                      shadowOpacity: selected ? 0.08 : 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modeTabText,
                      {
                        color: selected ? t.primary : t.muted,
                        fontWeight: selected ? "700" : "500",
                      },
                    ]}
                  >
                    {modeLabel}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Probed Formats Details Card (in custom mode) */}
          {d.mode === "custom" && d.probe && (
            <View style={[styles.probeCard, { backgroundColor: t.surfaceAlt, borderColor: t.line }]}>
              {d.probe.title && (
                <View style={styles.probeHeader}>
                  <Text style={[styles.probeTitle, { color: t.ink }]} numberOfLines={2}>
                    {d.probe.title}
                  </Text>
                  {typeof d.probe.duration === "number" && (
                    <Text style={[styles.probeDuration, { color: t.muted }]}>
                      {formatDuration(d.probe.duration)}
                    </Text>
                  )}
                </View>
              )}

              <Text style={[styles.formatsTitle, { color: t.muted }]}>
                {isRtl ? "اختر الجودة المطلوبة:" : "Select format to download:"}
              </Text>

              <View style={styles.formatsList}>
                {d.probe.formats.slice(0, 8).map((fmt) => {
                  const isSelected = d.selectedFormatId === fmt.id;
                  return (
                    <Pressable
                      key={fmt.id}
                      accessibilityRole="button"
                      onPress={() => d.setSelectedFormatId(fmt.id)}
                      style={[
                        styles.formatRow,
                        {
                          backgroundColor: isSelected ? t.primaryLight : t.surface,
                          borderColor: isSelected ? t.primary : t.line,
                        },
                      ]}
                    >
                      <View style={styles.formatInfo}>
                        <Text
                          style={[
                            styles.formatQuality,
                            { color: isSelected ? t.primary : t.ink, fontWeight: isSelected ? "700" : "600" },
                          ]}
                        >
                          {fmt.quality || (fmt.hasVideo ? `${fmt.height || "720"}p` : "Audio")}
                        </Text>
                        <Text style={[styles.formatSub, { color: t.muted }]}>
                          {fmt.ext.toUpperCase()} · {formatBytes(fmt.filesize)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.radioCircle,
                          {
                            borderColor: isSelected ? t.primary : t.muted,
                            backgroundColor: isSelected ? t.primary : "transparent",
                          },
                        ]}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Error Message Banner */}
          {!!d.error && (
            <View style={[styles.errorBanner, { backgroundColor: t.dangerBg, borderColor: t.danger }]}>
              <Text style={[styles.errorText, { color: t.danger }]}>{d.error}</Text>
            </View>
          )}

          {/* Primary Action Button with Spring Physics */}
          <PressableScale
            accessibilityRole="button"
            disabled={isBusy || !d.url}
            onPress={handleDownload}
            style={[
              styles.primaryBtn,
              {
                backgroundColor: isBusy || !d.url ? t.line : t.primary,
              },
            ]}
          >
            {isBusy ? (
              <View style={styles.btnLoadingRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>
                  {d.status === "probing"
                    ? (c.inspecting as { [k: string]: string })[lang]
                    : (c.downloading as { [k: string]: string })[lang]}
                </Text>
              </View>
            ) : (
              <Text style={[styles.primaryBtnText, { color: !d.url ? t.muted : "#FFFFFF" }]}>
                {d.mode === "custom" && !d.probe
                  ? isRtl
                    ? "فحص واستعراض الجودات"
                    : "Inspect Formats"
                  : d.mode === "audio"
                  ? isRtl
                    ? "تحويل واستخراج صوت MP3"
                    : "Convert & Download MP3"
                  : (c.downloadNow as { [k: string]: string })[lang]}
              </Text>
            )}
          </PressableScale>
        </View>

        {/* Recent Downloads Section */}
        {d.recentDownloads.length > 0 && (
          <View style={[styles.recentSection, { backgroundColor: t.surface, borderColor: t.line }]}>
            <View style={styles.recentHeader}>
              <Text style={[styles.recentTitle, { color: t.ink }]}>{c.recentTitle as string}</Text>
              <Text style={[styles.recentCount, { color: t.primary }]}>{d.recentDownloads.length}</Text>
            </View>

            {d.recentDownloads.map((item, idx) => (
              <View
                key={`${item.file}-${idx}`}
                style={[styles.recentItem, { borderBottomColor: t.line }]}
              >
                <View style={styles.recentItemInfo}>
                  <Text style={[styles.recentItemTitle, { color: t.ink }]} numberOfLines={1}>
                    {item.title || "Media Download"}
                  </Text>
                  <Text style={[styles.recentItemSub, { color: t.muted }]} numberOfLines={1}>
                    {item.file}
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Share file"
                  onPress={() => handleShareRecent(item)}
                  style={[styles.shareActionBtn, { backgroundColor: t.primaryLight }]}
                >
                  <Text style={[styles.shareActionText, { color: t.primary }]}>{c.share as string}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Footer with Backlink */}
        <View style={styles.footerContainer}>
          <Text style={[styles.footerTagline, { color: t.muted }]}>
            VidNest · {isRtl ? "أداة هادئة لحفظ وتشغيل ما يستحق البقاء" : "A quiet instrument to keep what is worth returning to."}
          </Text>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Visit Atheerium website"
            onPress={openBacklink}
            style={[styles.backlinkPill, { backgroundColor: t.surface, borderColor: t.line }]}
          >
            <Text style={[styles.backlinkText, { color: t.primary }]}>
              {c.footer as string}
            </Text>
            <Text style={[styles.backlinkArrow, { color: t.muted }]}>↗</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={settingsOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSettingsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: t.surface, borderColor: t.line }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: t.ink }]}>{c.settings as string}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setSettingsOpen(false)}
                hitSlop={8}
                style={styles.modalCloseBtn}
              >
                <Text style={[styles.modalCloseText, { color: t.muted }]}>×</Text>
              </Pressable>
            </View>

            <Text style={[styles.modalDesc, { color: t.muted }]}>
              {isRtl
                ? "عنوان سيرفر معالجة الروابط (VidNest Backend). يمكنك تعديله لأي خادم خاص."
                : "Active VidNest backend endpoint processing extractions and downloads."}
            </Text>

            <TextInput
              accessibilityLabel="Backend Server URL"
              value={customServerUrl}
              onChangeText={setCustomServerUrl}
              placeholder="https://..."
              placeholderTextColor={t.muted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              style={[
                styles.modalInput,
                {
                  color: t.ink,
                  backgroundColor: t.surfaceAlt,
                  borderColor: t.line,
                },
              ]}
            />

            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={handleTestConnection}
                style={[styles.modalTestBtn, { borderColor: t.primary, backgroundColor: t.primaryLight }]}
              >
                <Text style={[styles.modalTestBtnText, { color: t.primary }]}>
                  {connStatus === "checking"
                    ? isRtl
                      ? "جارٍ الفحص…"
                      : "Checking…"
                    : (c.testConnection as string)}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  d.setServerUrl(customServerUrl);
                  setSettingsOpen(false);
                }}
                style={[styles.modalSaveBtn, { backgroundColor: t.primary }]}
              >
                  <Text style={[styles.modalSaveBtnText, { color: t.onPrimary }]}>{isRtl ? "حفظ وإغلاق" : "Save & Close"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  brandGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    minHeight: 48,
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  headerPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  heroSection: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  pillBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  pillBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  heroHeading: {
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 32,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 380,
  },
  instrumentCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    paddingLeft: spacing.sm,
    paddingRight: 4,
    minHeight: 48,
    marginBottom: spacing.sm,
  },
  urlInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 10,
  },
  inputInnerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  clearBtn: {
    padding: 6,
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  pasteBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  pasteBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  platformStrip: {
    marginBottom: spacing.md,
  },
  platformScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  platformChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  platformChipText: {
    fontSize: 11,
    fontWeight: "600",
  },
  modesRow: {
    flexDirection: "row",
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 3,
    marginBottom: spacing.md,
  },
  modeTab: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  modeTabText: {
    fontSize: 11,
  },
  probeCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  probeHeader: {
    marginBottom: spacing.sm,
  },
  probeTitle: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginBottom: 2,
  },
  probeDuration: {
    fontSize: 11,
  },
  formatsTitle: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
  },
  formatsList: {
    gap: 6,
  },
  formatRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  formatInfo: {
    flex: 1,
  },
  formatQuality: {
    fontSize: 13,
  },
  formatSub: {
    fontSize: 11,
    marginTop: 1,
  },
  radioCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  errorBanner: {
    borderRadius: radii.sm,
    borderWidth: 1,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
  primaryBtn: {
    minHeight: 48,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
  btnLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  recentSection: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  recentCount: {
    fontSize: 12,
    fontWeight: "700",
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  recentItemInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  recentItemTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  recentItemSub: {
    fontSize: 11,
  },
  shareActionBtn: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radii.sm,
  },
  shareActionText: {
    fontSize: 11,
    fontWeight: "700",
  },
  footerContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  footerTagline: {
    fontSize: 11,
    textAlign: "center",
  },
  backlinkPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  backlinkText: {
    fontSize: 11,
    fontWeight: "700",
  },
  backlinkArrow: {
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  modalCard: {
    width: "100%",
    maxWidth: 440,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalCloseBtn: {
    minHeight: 48,
    minWidth: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  modalDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: spacing.md,
  },
  modalInput: {
    borderRadius: radii.sm,
    borderWidth: 1,
    padding: 10,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  modalTestBtn: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 10,
    borderRadius: radii.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTestBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  modalSaveBtn: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 10,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSaveBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
