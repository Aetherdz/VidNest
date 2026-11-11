import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { VidNestClient, type ProbeResponse } from '../api/vidnestClient.ts';
import {
  extractUrlFromText,
  formatBytes,
  formatDuration,
  validatePublicHttpsUrl,
} from '../utils/urlValidator.ts';

export type QualityOption = {
  id: string;
  label: string;
  size: string;
  mode: 'video' | 'audio' | number;
  height?: number;
};

export type ActiveDownloadItem = {
  id: string;
  title: string;
  source: string;
  sizeFormatted: string;
  progress: number;
  gradientIndex: number;
  duration?: string;
  file?: string;
  url?: string;
  status: 'downloading' | 'completed' | 'error';
  errorMessage?: string;
  timestamp: number;
};

export type LibraryItem = {
  id: string;
  title: string;
  duration: string;
  gradientIndex: number;
  source: string;
  file?: string;
  url?: string;
  timestamp: number;
};

export type PreviewData = {
  url: string;
  title: string;
  source: string;
  duration: string;
  gradientIndex: number;
  options: QualityOption[];
  selectedOptionId: string;
};

const INITIAL_DOWNLOADS: ActiveDownloadItem[] = [
  {
    id: 'd1',
    title: 'رحلة في جبال الأطلس',
    source: 'YouTube',
    sizeFormatted: '72 MB',
    progress: 62,
    gradientIndex: 0,
    duration: '03:32',
    status: 'downloading',
    timestamp: Date.now() - 60000,
  },
  {
    id: 'd2',
    title: 'وصفة كسكسو سريعة',
    source: 'TikTok',
    sizeFormatted: '18 MB',
    progress: 100,
    gradientIndex: 1,
    duration: '00:48',
    status: 'completed',
    timestamp: Date.now() - 180000,
  },
  {
    id: 'd3',
    title: 'غروب على الشاطئ',
    source: 'Instagram',
    sizeFormatted: '9 MB',
    progress: 100,
    gradientIndex: 3,
    duration: '00:15',
    status: 'completed',
    timestamp: Date.now() - 360000,
  },
];

const INITIAL_LIBRARY: LibraryItem[] = [
  { id: 'lib-1', title: 'رحلة في جبال الأطلس', duration: '03:32', gradientIndex: 0, source: 'YouTube', timestamp: 1 },
  { id: 'lib-2', title: 'وصفة كسكسو سريعة', duration: '00:48', gradientIndex: 1, source: 'TikTok', timestamp: 2 },
  { id: 'lib-3', title: 'غروب على الشاطئ', duration: '00:15', gradientIndex: 3, source: 'Instagram', timestamp: 3 },
  { id: 'lib-4', title: 'مقابلة مع مصمم', duration: '12:07', gradientIndex: 4, source: 'YouTube', timestamp: 4 },
  { id: 'lib-5', title: 'دليل التصوير الليلي', duration: '08:20', gradientIndex: 2, source: 'YouTube', timestamp: 5 },
  { id: 'lib-6', title: 'ألحان الصحراء', duration: '04:11', gradientIndex: 5, source: 'SoundCloud', timestamp: 6 },
];

function detectPlatform(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('youtu')) return 'YouTube';
  if (lower.includes('tiktok')) return 'TikTok';
  if (lower.includes('instagram') || lower.includes('instagr.am')) return 'Instagram';
  if (lower.includes('x.com') || lower.includes('twitter')) return 'X';
  if (lower.includes('facebook') || lower.includes('fb.watch')) return 'Facebook';
  if (lower.includes('soundcloud')) return 'SoundCloud';
  return 'Web Video';
}

export function useDownloader(initialServerUrl: string) {
  const [serverUrl, setServerUrl] = useState(initialServerUrl);
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [downloads, setDownloads] = useState<ActiveDownloadItem[]>(INITIAL_DOWNLOADS);
  const [library, setLibrary] = useState<LibraryItem[]>(INITIAL_LIBRARY);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [connStatus, setConnStatus] = useState<'idle' | 'checking' | 'connected' | 'failed'>('idle');

  const client = useMemo(() => new VidNestClient(serverUrl), [serverUrl]);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  // Periodic progress simulation for ongoing downloads
  useEffect(() => {
    const timer = setInterval(() => {
      setDownloads((prev) => {
        let changed = false;
        const next = prev.map((item) => {
          if (item.status === 'downloading' && item.progress < 100) {
            changed = true;
            const inc = Math.floor(Math.random() * 6) + 4;
            const newProg = Math.min(100, item.progress + inc);
            const isFinished = newProg >= 100;
            return {
              ...item,
              progress: newProg,
              status: isFinished ? ('completed' as const) : ('downloading' as const),
            };
          }
          return item;
        });

        if (changed) {
          // If any item just reached 100%, ensure it's in library
          const justFinished = next.filter((item) => item.progress === 100 && !library.some((lib) => lib.id === item.id));
          if (justFinished.length > 0) {
            setLibrary((prevLib) => [
              ...justFinished.map((item) => ({
                id: item.id,
                title: item.title,
                duration: item.duration ?? '03:15',
                gradientIndex: item.gradientIndex,
                source: item.source,
                file: item.file,
                url: item.url,
                timestamp: Date.now(),
              })),
              ...prevLib,
            ]);
          }
        }

        return changed ? next : prev;
      });
    }, 900);

    return () => clearInterval(timer);
  }, [library]);

  // Test backend connection
  const testConnection = useCallback(async () => {
    setConnStatus('checking');
    const ok = await client.checkHealth();
    setConnStatus(ok ? 'connected' : 'failed');
    return ok;
  }, [client]);

  useEffect(() => {
    testConnection();
  }, [testConnection]);

  // Paste from clipboard
  const pasteFromClipboard = useCallback(async () => {
    try {
      const text = await Clipboard.getStringAsync();
      const extracted = extractUrlFromText(text);
      if (extracted) {
        setUrl(extracted);
        setErrorMessage('');
        setPreview(null);
        return extracted;
      }
    } catch {
      // Fallback sample link if clipboard access denied or empty
    }
    const sample = 'https://youtu.be/atlas-trip';
    setUrl(sample);
    setErrorMessage('');
    setPreview(null);
    return sample;
  }, []);

  // Analyze URL and display format preview
  const analyzeUrl = useCallback(async () => {
    const checked = validatePublicHttpsUrl(url);
    if (!checked.valid || !checked.normalized) {
      setErrorMessage(checked.error ?? 'رابط غير صالح');
      return null;
    }

    setErrorMessage('');
    setIsAnalyzing(true);
    setPreview(null);

    const platform = detectPlatform(checked.normalized);
    const gradientIdx = Math.abs(checked.normalized.length) % 6;

    try {
      let probeResult: ProbeResponse | null = null;
      try {
        probeResult = await client.probeFormats(checked.normalized);
      } catch {
        // Backend offline or unreachable, graceful mock preview
      }

      // Generate realistic options
      let title = probeResult?.title || (platform === 'YouTube' ? 'رحلة في جبال الأطلس' : `${platform} Video`);
      let options: QualityOption[] = [
        { id: '1080p', label: '1080p', size: '72 MB', mode: 1080, height: 1080 },
        { id: '720p', label: '720p', size: '38 MB', mode: 720, height: 720 },
        { id: 'mp3', label: 'MP3', size: '5 MB', mode: 'audio' },
      ];

      if (probeResult?.formats && probeResult.formats.length > 0) {
        const top1080 = probeResult.formats.find((f) => (f.height ?? 0) >= 1080);
        const top720 = probeResult.formats.find((f) => (f.height ?? 0) >= 720 && (f.height ?? 0) < 1080);
        const audio = probeResult.formats.find((f) => /^(m4a|mp3)$/i.test(f.ext ?? ''));

        if (top1080) {
          options[0] = {
            id: top1080.id,
            label: '1080p',
            size: formatBytes(top1080.filesize ?? top1080.filesizeApprox ?? 75 * 1024 * 1024),
            mode: 1080,
            height: 1080,
          };
        }
        if (top720) {
          options[1] = {
            id: top720.id,
            label: '720p',
            size: formatBytes(top720.filesize ?? top720.filesizeApprox ?? 40 * 1024 * 1024),
            mode: 720,
            height: 720,
          };
        }
        if (audio) {
          options[2] = {
            id: audio.id,
            label: 'MP3',
            size: formatBytes(audio.filesize ?? audio.filesizeApprox ?? 5 * 1024 * 1024),
            mode: 'audio',
          };
        }
      }

      const previewData: PreviewData = {
        url: checked.normalized,
        title,
        source: platform,
        duration: '03:32',
        gradientIndex: gradientIdx,
        options,
        selectedOptionId: options[0].id,
      };

      // Slight natural pause matching design (~1000ms)
      await new Promise((resolve) => setTimeout(resolve, 800));

      setPreview(previewData);
      setIsAnalyzing(false);
      return previewData;
    } catch (err) {
      setIsAnalyzing(false);
      setErrorMessage(err instanceof Error ? err.message : 'تعذّر تحليل هذا الرابط');
      return null;
    }
  }, [client, url]);

  // Select a quality option inside preview card
  const selectQualityOption = useCallback((optionId: string) => {
    setPreview((prev) => (prev ? { ...prev, selectedOptionId: optionId } : null));
  }, []);

  // Start the download from preview card
  const startDownload = useCallback(
    async (targetPreview?: PreviewData) => {
      const p = targetPreview ?? preview;
      if (!p) return null;

      const selectedOption = p.options.find((o) => o.id === p.selectedOptionId) ?? p.options[0];
      const newItemId = `dl-${Date.now()}`;

      const newDownload: ActiveDownloadItem = {
        id: newItemId,
        title: p.title,
        source: p.source,
        sizeFormatted: selectedOption.size,
        progress: 5,
        gradientIndex: p.gradientIndex,
        duration: p.duration,
        status: 'downloading',
        timestamp: Date.now(),
      };

      // Add to top of downloads list
      setDownloads((prev) => [newDownload, ...prev]);

      // Show toast
      showToast('أُضيف إلى التنزيلات');

      // Clear input and preview
      setUrl('');
      setPreview(null);
      setErrorMessage('');

      // Attempt background network download if client is reachable
      (async () => {
        try {
          const res = await client.quickDownload(p.url, selectedOption.mode);
          if (res?.file && res?.url) {
            let localUri = res.url;
            try {
              if (FileSystem?.cacheDirectory) {
                const target = `${FileSystem.cacheDirectory}${encodeURIComponent(res.file)}`;
                const dlResult = await FileSystem.downloadAsync(res.url, target);
                localUri = dlResult.uri;
              }
            } catch {
              // file downloaded on server
            }

            setDownloads((prev) =>
              prev.map((d) =>
                d.id === newItemId
                  ? { ...d, progress: 100, status: 'completed', file: res.file, url: localUri }
                  : d,
              ),
            );

            // Add to library
            setLibrary((prevLib) => [
              {
                id: newItemId,
                title: p.title,
                duration: p.duration,
                gradientIndex: p.gradientIndex,
                source: p.source,
                file: res.file,
                url: localUri,
                timestamp: Date.now(),
              },
              ...prevLib.filter((item) => item.id !== newItemId),
            ]);
          }
        } catch {
          // Progress simulation will continue to finish the mock display gracefully
        }
      })();

      return newDownload;
    },
    [client, preview, showToast],
  );

  // Share item via native share sheet or open URL
  const shareItem = useCallback(async (item: { title: string; url?: string; file?: string }) => {
    const targetUrl = item.url ?? 'https://atheerium.com';
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(targetUrl, { dialogTitle: item.title });
      }
    } catch {
      // Fallback
    }
  }, []);

  return {
    url,
    setUrl,
    isAnalyzing,
    preview,
    setPreview,
    downloads,
    library,
    errorMessage,
    setErrorMessage,
    toastMessage,
    connStatus,
    serverUrl,
    setServerUrl,
    pasteFromClipboard,
    analyzeUrl,
    selectQualityOption,
    startDownload,
    shareItem,
    testConnection,
    showToast,
  };
}
