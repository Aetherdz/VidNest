import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { AudioIcon, CloseIcon, OpenIcon, ShareIcon, VideoIcon } from './Icons.tsx';
import { tokens, radii, fonts, type ThemeMode } from '../theme/tokens.ts';
import { copy } from '../i18n/copy.ts';
import type { MediaKind } from '../hooks/useDownloader.ts';

export type PlayableItem = {
  title: string;
  source?: string;
  url?: string;
  file?: string;
  kind?: MediaKind;
  duration?: string;
};

type Props = {
  visible: boolean;
  item: PlayableItem | null;
  themeMode: ThemeMode;
  onClose: () => void;
  onOpen: (item: PlayableItem) => void;
  onShare: (item: PlayableItem) => void;
};

function PlayerSurface({
  source,
  kind,
  themeMode,
}: {
  source: string;
  kind: MediaKind;
  themeMode: ThemeMode;
}) {
  const t = tokens[themeMode];
  const c = copy.ar;

  const player = useVideoPlayer(source, (instance) => {
    instance.loop = false;
    instance.play();
  });

  const statusEvent = useEvent(player, 'statusChange');
  const status = statusEvent?.status ?? player.status;
  const error = statusEvent?.error;

  const isAudio = kind === 'audio';

  return (
    <View style={styles.surface}>
      <VideoView
        player={player}
        style={[styles.video, isAudio ? styles.audioView : styles.videoView]}
        nativeControls
        contentFit="contain"
        allowsFullscreen={!isAudio}
        accessibilityLabel={c.play}
      />

      {status === 'loading' && (
        <View style={[styles.overlay, { backgroundColor: 'rgba(11,15,25,0.72)' }]} pointerEvents="none">
          <ActivityIndicator color="#FFFFFF" />
          <Text style={styles.overlayText}>{c.playerLoading}</Text>
        </View>
      )}

      {status === 'error' && (
        <View style={[styles.overlay, { backgroundColor: 'rgba(11,15,25,0.86)' }]} pointerEvents="none">
          <Text style={styles.overlayText}>{c.playerError}</Text>
          {error?.message ? (
            <Text style={[styles.overlayHint, { color: t.muted }]} numberOfLines={2}>
              {error.message}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

export default function PlayerModal({ visible, item, themeMode, onClose, onOpen, onShare }: Props) {
  const t = tokens[themeMode];
  const c = copy.ar;

  useEffect(() => {
    if (!visible || Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [visible, onClose]);

  const source = item?.url ?? item?.file;
  const kind: MediaKind = item?.kind ?? 'video';
  const canOpen = Boolean(source);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.backdrop, { backgroundColor: 'rgba(11,15,25,0.62)' }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={c.playerClose}
        />

        <View
          style={[styles.card, { backgroundColor: t.surface, borderColor: t.line }]}
          accessibilityViewIsModal
        >
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: t.ink }]} numberOfLines={2}>
                {item?.title ?? ''}
              </Text>
              <View style={styles.metaRow}>
                {kind === 'audio' ? (
                  <AudioIcon size={14} color={t.muted} />
                ) : (
                  <VideoIcon size={14} color={t.muted} />
                )}
                <Text style={[styles.meta, { color: t.muted }]} numberOfLines={1}>
                  {[item?.source, item?.duration].filter(Boolean).join(' · ') || c.unknownValue}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.iconButton, { backgroundColor: t.surfaceAlt }]}
              accessibilityRole="button"
              accessibilityLabel={c.playerClose}
              activeOpacity={0.8}
            >
              <CloseIcon size={18} color={t.ink} />
            </TouchableOpacity>
          </View>

          {/* Mount the player only while open: closing unmounts it, which stops
              playback instead of leaving audio running behind a hidden modal. */}
          {visible && source ? (
            <PlayerSurface
              key={source}
              source={source}
              kind={kind}
              themeMode={themeMode}
            />
          ) : !source ? (
            <View style={[styles.noSource, { backgroundColor: t.surfaceAlt, borderColor: t.line }]}>
              {kind === 'audio' ? (
                <AudioIcon size={26} color={t.muted} />
              ) : (
                <VideoIcon size={26} color={t.muted} />
              )}
              <Text style={[styles.noSourceText, { color: t.muted }]}>{c.playerNoSource}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => item && onOpen(item)}
              disabled={!canOpen}
              style={[
                styles.primaryAction,
                { backgroundColor: canOpen ? t.primary : t.surfaceAlt },
              ]}
              accessibilityRole="button"
              accessibilityLabel={c.playerOpenExternal}
              accessibilityState={{ disabled: !canOpen }}
              activeOpacity={0.85}
            >
              <OpenIcon size={18} color={canOpen ? t.onPrimary : t.muted} />
              <Text
                style={[styles.primaryActionText, { color: canOpen ? t.onPrimary : t.muted }]}
              >
                {c.open}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => item && onShare(item)}
              disabled={!canOpen}
              style={[styles.secondaryAction, { borderColor: t.line }]}
              accessibilityRole="button"
              accessibilityLabel={c.share}
              accessibilityState={{ disabled: !canOpen }}
              activeOpacity={0.85}
            >
              <ShareIcon size={18} color={canOpen ? t.ink : t.muted} />
              <Text style={[styles.secondaryActionText, { color: canOpen ? t.ink : t.muted }]}>
                {c.share}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.hint, { color: t.muted }]}>{c.playerHint}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    borderRadius: radii.card,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    ...Platform.select({
      web: { boxShadow: '0 24px 60px rgba(11,15,25,0.28)' } as object,
      default: {
        shadowColor: '#0B0F19',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.24,
        shadowRadius: 30,
        elevation: 14,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    textAlign: 'right',
    flexShrink: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surface: {
    width: '100%',
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: '#0B0F19',
  },
  video: {
    width: '100%',
    backgroundColor: '#0B0F19',
  },
  videoView: {
    aspectRatio: 16 / 9,
  },
  audioView: {
    height: 96,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
  },
  overlayText: {
    fontFamily: fonts.medium,
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
  },
  overlayHint: {
    fontFamily: fonts.regular,
    fontSize: 11,
    textAlign: 'center',
  },
  noSource: {
    width: '100%',
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 10,
  },
  noSourceText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 320,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryAction: {
    flex: 1,
    minHeight: 46,
    borderRadius: radii.btn,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryAction: {
    flex: 1,
    minHeight: 46,
    borderRadius: radii.btn,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 11,
    textAlign: 'center',
  },
});
