import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Linking, Platform } from 'react-native';
import { VidNestClient, type ProbeResponse } from '../api/vidnestClient.ts';
import {
  extractUrlFromText,
  formatBytes,
  formatDuration,
  validatePublicHttpsUrl,
  type FormatOption,
} from '../utils/urlValidator.ts';
import { copy } from '../i18n/copy.ts';

export type MediaKind = 'video' | 'audio';

export type QualityOption = {
  id: string;
  label: string;
  size: string;
  mode: MediaKind | number;
  height?: number;
};

export type DownloadStatus = 'downloading' | 'completed' | 'error';

export type ActiveDownloadItem = {
  id: string;
  title: string;
  source: string;
  sizeFormatted: string;
  /** null means indeterminate: the server does not stream progress. */
  progress: number | null;
  kind: MediaKind;
  duration?: string;
  file?: string;
  url?: string;
  status: DownloadStatus;
  errorMessage?: string;
  timestamp: number;
};

export type LibraryItem = {
  id: string;
  title: string;
  source: string;
  kind: MediaKind;
  duration?: string;
  sizeFormatted?: string;
  file?: string;
  url?: string;
  timestamp: number;
};

export type PreviewData = {
  url: string;
  title: string;
  source: string;
  duration?: string;
  kind: MediaKind;
  options: QualityOption[];
  selectedOptionId: string;
};

const AUDIO_EXT = /^(mp3|m4a|aac|opus|ogg|flac|wav)$/i;

function detectPlatform(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('youtu')) return 'YouTube';
  if (lower.includes('tiktok')) return 'TikTok';
  if (lower.includes('instagram') || lower.includes('instagr.am')) return 'Instagram';
  if (lower.includes('x.com') || lower.includes('twitter')) return 'X';
  if (lower.includes('facebook') || lower.includes('fb.watch')) return 'Facebook';
  if (lower.includes('soundcloud')) return 'SoundCloud';
  if (lower.includes('vimeo')) return 'Vimeo';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'VidNest';
  }
}

function isAudioFormat(format: FormatOption): boolean {
  const hasVideo = format.hasVideo ?? (format.height != null && format.height > 0);
  return !hasVideo || AUDIO_EXT.test(format.ext ?? '');
}

function qualityLabel(format: FormatOption): string {
  if (format.height && format.height > 0) return `${format.height}p`;
  if (format.quality) return String(format.quality);
  if (format.ext) return String(format.ext).toUpperCase();
  return '—';
}

function sizeLabel(format: FormatOption): string {
  return formatBytes(format.filesize ?? format.filesizeApprox ?? null);
}

/** Build the quality list strictly from what the server returned. */
function buildOptions(formats: FormatOption[]): QualityOption[] {
  const seen = new Set<string>();
  const options: QualityOption[] = [];

  formats
    .filter((format) => !isAudioFormat(format))
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0))
    .forEach((format) => {
      const label = qualityLabel(format);
      if (seen.has(`v:${label}`)) return;
      seen.add(`v:${label}`);
      options.push({
        id: format.id,
        label,
        size: sizeLabel(format),
        mode: format.height ?? 'video',
        height: format.height ?? undefined,
      });
    });

  formats
    .filter(isAudioFormat)
    .sort((a, b) => (b.filesize ?? 0) - (a.filesize ?? 0))
    .forEach((format) => {
      const label = String(format.ext ?? 'audio').toUpperCase();
      if (seen.has(`a:${label}`)) return;
      seen.add(`a:${label}`);
      options.push({ id: format.id, label, size: sizeLabel(format), mode: 'audio' });
    });

  return options.slice(0, 6);
}

export function useDownloader(initialServerUrl: string) {
  const [serverUrl, setServerUrl] = useState(initialServerUrl);
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [downloads, setDownloads] = useState<ActiveDownloadItem[]>([]);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [connStatus, setConnStatus] = useState<'idle' | 'checking' | 'connected' | 'failed'>('idle');

  const client = useMemo(() => new VidNestClient(serverUrl), [serverUrl]);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 2400);
  }, []);

  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    },
    [],
  );

  const testConnection = useCallback(async () => {
    setConnStatus('checking');
    const ok = await client.checkHealth();
    setConnStatus(ok ? 'connected' : 'failed');
    return ok;
  }, [client]);

  useEffect(() => {
    testConnection();
  }, [testConnection]);

  const clearUrl = useCallback(() => {
    setUrl('');
    setPreview(null);
    setErrorMessage('');
  }, []);

  const analyzeUrl = useCallback(
    async (customUrl?: string) => {
      const target =
        typeof customUrl === 'string' && customUrl.trim() ? customUrl.trim() : url.trim();
      const checked = validatePublicHttpsUrl(target);
      if (!checked.valid || !checked.normalized) {
        setErrorMessage(copy.ar.errorInvalidUrl);
        return null;
      }

      setErrorMessage('');
      setIsAnalyzing(true);
      setPreview(null);

      try {
        const probeResult: ProbeResponse = await client.probeFormats(checked.normalized);
        const options = buildOptions(Array.isArray(probeResult?.formats) ? probeResult.formats : []);
        if (options.length === 0) {
          setErrorMessage(copy.ar.errorNoFormats);
          return null;
        }

        const rawDuration = probeResult.duration;
        const duration =
          typeof rawDuration === 'number' && Number.isFinite(rawDuration)
            ? formatDuration(rawDuration)
            : undefined;

        const videoOptions = options.filter((option) => option.mode !== 'audio');
        const data: PreviewData = {
          url: checked.normalized,
          title: (probeResult.title || detectPlatform(checked.normalized)).slice(0, 200),
          source: detectPlatform(checked.normalized),
          duration,
          kind: videoOptions.length > 0 ? 'video' : 'audio',
          options,
          selectedOptionId: (videoOptions[0] ?? options[0]).id,
        };
        setPreview(data);
        return data;
      } catch {
        setErrorMessage(copy.ar.errorAnalyze);
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [client, url],
  );

  const pasteFromClipboard = useCallback(async () => {
    try {
      const text = await Clipboard.getStringAsync();
      const extracted = extractUrlFromText(text ?? '');
      if (!extracted) {
        setErrorMessage(copy.ar.errorNoClipboard);
        return null;
      }
      setUrl(extracted);
      setErrorMessage('');
      setPreview(null);
      analyzeUrl(extracted);
      return extracted;
    } catch {
      setErrorMessage(copy.ar.errorNoClipboard);
      return null;
    }
  }, [analyzeUrl]);

  const onUrlChange = useCallback(
    (newText: string) => {
      const extracted = extractUrlFromText(newText);
      if (extracted && extracted !== newText.trim()) {
        setUrl(extracted);
        setErrorMessage('');
        setPreview(null);
        analyzeUrl(extracted);
        return;
      }
      setUrl(newText);
      setErrorMessage('');
      if (!newText.trim()) setPreview(null);
    },
    [analyzeUrl],
  );

  const selectQualityOption = useCallback((optionId: string) => {
    setPreview((prev) => (prev ? { ...prev, selectedOptionId: optionId } : null));
  }, []);

  const startDownload = useCallback(
    async (targetPreview?: PreviewData) => {
      const data = targetPreview ?? preview;
      if (!data) return null;

      const option = data.options.find((item) => item.id === data.selectedOptionId) ?? data.options[0];
      const id = `dl-${Date.now()}`;
      const kind: MediaKind = option.mode === 'audio' ? 'audio' : 'video';

      const item: ActiveDownloadItem = {
        id,
        title: data.title,
        source: data.source,
        sizeFormatted: option.size,
        progress: null,
        kind,
        duration: data.duration,
        status: 'downloading',
        timestamp: Date.now(),
      };

      setDownloads((prev) => [item, ...prev]);
      showToast(copy.ar.toastAdded);
      setUrl('');
      setPreview(null);
      setErrorMessage('');

      try {
        const res = await client.quickDownload(data.url, option.mode);
        let localUri = res.url;
        try {
          if (FileSystem?.cacheDirectory) {
            const target = `${FileSystem.cacheDirectory}${encodeURIComponent(res.file)}`;
            const downloaded = await FileSystem.downloadAsync(res.url, target);
            localUri = downloaded.uri;
          }
        } catch {
          // The file stays on the server; the remote URL is still openable.
        }

        setDownloads((prev) =>
          prev.map((entry) =>
            entry.id === id
              ? { ...entry, progress: 100, status: 'completed', file: res.file, url: localUri }
              : entry,
          ),
        );
        setLibrary((prev) => [
          {
            id,
            title: data.title,
            source: data.source,
            kind,
            duration: data.duration,
            sizeFormatted: option.size,
            file: res.file,
            url: localUri,
            timestamp: Date.now(),
          },
          ...prev.filter((entry) => entry.id !== id),
        ]);
      } catch (error) {
        const message = error instanceof Error ? error.message : copy.ar.errorNetwork;
        setDownloads((prev) =>
          prev.map((entry) =>
            entry.id === id ? { ...entry, status: 'error', errorMessage: message } : entry,
          ),
        );
        setErrorMessage(message);
      }

      return item;
    },
    [client, preview, showToast],
  );

  /** Open the media itself, outside the app. */
  const openItem = useCallback(
    async (item: { title: string; url?: string; file?: string }) => {
      const target = item.url ?? item.file;
      if (!target) {
        showToast(copy.ar.playerNoSource);
        return false;
      }
      try {
        if (Platform.OS === 'web') {
          const opened = typeof window !== 'undefined' ? window.open(target, '_blank', 'noopener,noreferrer') : null;
          if (!opened) throw new Error('blocked');
          return true;
        }
        if (/^https?:\/\//i.test(target)) {
          await Linking.openURL(target);
          return true;
        }
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(target, { dialogTitle: item.title });
          return true;
        }
        throw new Error('unavailable');
      } catch {
        showToast(copy.ar.openFailed);
        return false;
      }
    },
    [showToast],
  );

  const shareItem = useCallback(
    async (item: { title: string; url?: string; file?: string }) => {
      const target = item.url ?? item.file;
      if (!target) {
        showToast(copy.ar.playerNoSource);
        return false;
      }
      try {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(target, { dialogTitle: item.title });
          return true;
        }
        await Clipboard.setStringAsync(target);
        showToast(copy.ar.copyLink);
        return true;
      } catch {
        showToast(copy.ar.shareFailed);
        return false;
      }
    },
    [showToast],
  );

  const removeItem = useCallback((id: string) => {
    setDownloads((prev) => prev.filter((entry) => entry.id !== id));
    setLibrary((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  return {
    url,
    setUrl,
    isAnalyzing,
    preview,
    downloads,
    library,
    errorMessage,
    setErrorMessage,
    toastMessage,
    connStatus,
    serverUrl,
    setServerUrl,
    pasteFromClipboard,
    onUrlChange,
    clearUrl,
    analyzeUrl,
    selectQualityOption,
    startDownload,
    openItem,
    shareItem,
    removeItem,
    testConnection,
    showToast,
  };
}
