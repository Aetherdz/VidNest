import { pickBestFormat, validatePublicHttpsUrl, type FormatOption } from "../utils/urlValidator.ts";

export const DEFAULT_SERVER_URL = "https://vidnest-web.onrender.com";

export type ProbeResponse = { probeId: string; formats: FormatOption[]; title?: string; [key: string]: unknown };
export type DownloadResponse = { file: string; title: string; url: string; [key: string]: unknown };

const YOUTUBE_RESIDENTIAL_APIS = [
  { kind: "piped" as const, base: "https://pipedapi.kavin.rocks" },
  { kind: "piped" as const, base: "https://pipedapi.adminforge.de" },
  { kind: "invidious" as const, base: "https://inv.nadeko.net" },
  { kind: "invidious" as const, base: "https://invidious.nerdvpn.de" },
];

export function extractYouTubeVideoId(rawUrl: string): string {
  try {
    const parsed = new URL(String(rawUrl || ""));
    const host = parsed.hostname.toLowerCase().replace(/^(www\.|m\.)/, "");
    let id = "";
    if (host === "youtu.be") {
      id = parsed.pathname.split("/").filter(Boolean)[0] ?? "";
    } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (parsed.pathname === "/watch") {
        id = parsed.searchParams.get("v") ?? "";
      } else {
        const parts = parsed.pathname.split("/").filter(Boolean);
        if (parts.length >= 2 && ["shorts", "embed", "live", "v"].includes(parts[0])) {
          id = parts[1];
        }
      }
    }
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : "";
  } catch {
    return "";
  }
}

export function isTikTokUrl(rawUrl: string): boolean {
  try {
    const u = new URL(String(rawUrl || ""));
    const host = u.hostname.toLowerCase();
    return host === "tiktok.com" || host.endsWith(".tiktok.com");
  } catch {
    return false;
  }
}

export function extractTwitterStatusId(rawUrl: string): string {
  try {
    const u = new URL(String(rawUrl || ""));
    const host = u.hostname.toLowerCase().replace(/^(www\.|m\.|mobile\.)/, "");
    if (host !== "x.com" && host !== "twitter.com" && host !== "fxtwitter.com" && host !== "vxtwitter.com") {
      return "";
    }
    const m = u.pathname.match(/\/status(?:es)?\/(\d{1,25})/);
    return m ? m[1] : "";
  } catch {
    return "";
  }
}

export class VidNestClient {
  readonly baseUrl: string;
  private csrf = "";
  private fetcher: typeof fetch;
  private cachedDirectStreams = new Map<string, { title: string; url: string; ext: string }>();

  constructor(baseUrl: string, fetcher: typeof fetch = fetch) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.fetcher = fetcher;
  }

  private async probeYouTubeResidential(videoId: string): Promise<ProbeResponse | null> {
    if (!videoId || this.fetcher !== fetch) return null;
    for (const inst of YOUTUBE_RESIDENTIAL_APIS) {
      const endpoint =
        inst.kind === "piped"
          ? `${inst.base}/streams/${videoId}`
          : `${inst.base}/api/v1/videos/${videoId}`;
      try {
        const resp = await this.fetcher(endpoint, { headers: { Accept: "application/json" } });
        if (!resp.ok) continue;
        const data = (await resp.json()) as Record<string, unknown>;
        const formats: FormatOption[] = [];
        const title = String(data.title || "YouTube Video").slice(0, 200);
        if (inst.kind === "piped") {
          const videoStreams = Array.isArray(data.videoStreams) ? data.videoStreams : [];
          videoStreams.forEach((vs: Record<string, unknown>, idx: number) => {
            if (!vs || typeof vs.url !== "string") return;
            const id = String(vs.itag || `pipedv${idx}`);
            const height = typeof vs.height === "number" ? vs.height : 720;
            const ext = String(vs.mimeType || "").includes("webm") ? "webm" : "mp4";
            formats.push({
              id,
              ext,
              height,
              hasVideo: true,
              hasAudio: !vs.videoOnly,
              filesize: typeof vs.contentLength === "number" ? vs.contentLength : undefined,
            });
            this.cachedDirectStreams.set(`${videoId}:${id}`, { title, url: vs.url, ext });
          });
          const audioStreams = Array.isArray(data.audioStreams) ? data.audioStreams : [];
          audioStreams.forEach((aus: Record<string, unknown>, idx: number) => {
            if (!aus || typeof aus.url !== "string") return;
            const id = String(aus.itag || `pipeda${idx}`);
            const ext = String(aus.mimeType || "").includes("mp4") ? "m4a" : "webm";
            formats.push({
              id,
              ext,
              hasVideo: false,
              hasAudio: true,
              filesize: typeof aus.contentLength === "number" ? aus.contentLength : undefined,
            });
            this.cachedDirectStreams.set(`${videoId}:${id}`, { title, url: aus.url, ext });
          });
        } else {
          const rawStreams = [
            ...(Array.isArray(data.formatStreams) ? data.formatStreams : []),
            ...(Array.isArray(data.adaptiveFormats) ? data.adaptiveFormats : []),
          ];
          rawStreams.forEach((fs: Record<string, unknown>, idx: number) => {
            if (!fs || typeof fs.url !== "string") return;
            const id = String(fs.itag || `inv${idx}`);
            const mime = String(fs.type || "").toLowerCase();
            const isAudio = mime.startsWith("audio/");
            const ext = isAudio && mime.includes("mp4") ? "m4a" : mime.includes("webm") ? "webm" : "mp4";
            const parsedH = parseInt(String(fs.resolution || "").replace("p", ""), 10);
            const height = Number.isFinite(parsedH) ? parsedH : isAudio ? undefined : 720;
            formats.push({
              id,
              ext,
              height,
              hasVideo: !isAudio,
              hasAudio: true,
            });
            this.cachedDirectStreams.set(`${videoId}:${id}`, { title, url: fs.url, ext });
          });
        }
        if (formats.length > 0) {
          return {
            probeId: `residential-${videoId}`,
            title,
            formats,
          };
        }
      } catch {
        // continue to next residential-reachable instance
      }
    }
    return null;
  }

  private async probeTikTokResidential(rawUrl: string): Promise<ProbeResponse | null> {
    if (!isTikTokUrl(rawUrl)) return null;
    try {
      const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(rawUrl)}&hd=1`;
      const resp = await this.fetcher(apiUrl, { headers: { Accept: "application/json" } });
      if (!resp.ok) return null;
      const json = (await resp.json()) as Record<string, unknown>;
      if (!json || json.code !== 0 || !json.data) return null;
      const d = json.data as Record<string, unknown>;
      const absUrl = (u: unknown) => {
        if (!u || typeof u !== "string") return "";
        if (u.startsWith("http://") || u.startsWith("https://")) return u;
        return `https://www.tikwm.com${u.startsWith("/") ? "" : "/"}${u}`;
      };
      const formats: FormatOption[] = [];
      const title = String(d.title || "TikTok Video").slice(0, 200);
      const probeId = `tiktok-${String(d.id || "video")}`;
      const hdUrl = absUrl(d.hdplay || d.play);
      const sdUrl = absUrl(d.play);
      const wmUrl = absUrl(d.wmplay);
      const audioUrl = absUrl(d.music);

      if (hdUrl) {
        formats.push({
          id: "hd",
          ext: "mp4",
          height: 1080,
          hasVideo: true,
          hasAudio: true,
          filesize: typeof d.hd_size === "number" && d.hd_size > 0 ? d.hd_size : typeof d.size === "number" ? d.size : undefined,
        });
        this.cachedDirectStreams.set(`${probeId}:hd`, { title, url: hdUrl, ext: "mp4" });
      }
      if (sdUrl && sdUrl !== hdUrl) {
        formats.push({
          id: "sd",
          ext: "mp4",
          height: 720,
          hasVideo: true,
          hasAudio: true,
          filesize: typeof d.size === "number" ? d.size : undefined,
        });
        this.cachedDirectStreams.set(`${probeId}:sd`, { title, url: sdUrl, ext: "mp4" });
      }
      if (wmUrl) {
        formats.push({
          id: "wm",
          ext: "mp4",
          height: 540,
          hasVideo: true,
          hasAudio: true,
          filesize: typeof d.wm_size === "number" ? d.wm_size : undefined,
        });
        this.cachedDirectStreams.set(`${probeId}:wm`, { title, url: wmUrl, ext: "mp4" });
      }
      if (audioUrl) {
        formats.push({
          id: "audio",
          ext: "mp3",
          hasVideo: false,
          hasAudio: true,
        });
        this.cachedDirectStreams.set(`${probeId}:audio`, { title, url: audioUrl, ext: "mp3" });
      }

      if (formats.length === 0) return null;
      return {
        probeId,
        title,
        formats,
      };
    } catch {
      return null;
    }
  }

  private async probeTwitterResidential(rawUrl: string): Promise<ProbeResponse | null> {
    const tweetId = extractTwitterStatusId(rawUrl);
    if (!tweetId) return null;
    const probeId = `x-${tweetId}`;
    try {
      const vxRes = await this.fetcher(`https://api.vxtwitter.com/Twitter/status/${tweetId}`, {
        headers: { Accept: "application/json" },
      });
      if (vxRes.ok) {
        const vxData = (await vxRes.json()) as Record<string, unknown>;
        const media = ((Array.isArray(vxData?.media_extended) ? vxData.media_extended : []) as Record<string, unknown>[])
          .filter((m) => (m.type === "video" || m.type === "gif") && typeof m.url === "string");
        if (media.length > 0) {
          const title = String(vxData.text || "X Video").slice(0, 200);
          const formats: FormatOption[] = media.map((m, idx) => {
            const sizeObj = m.size as Record<string, unknown> | undefined;
            const h = typeof sizeObj?.height === "number" ? sizeObj.height : 720;
            const id = `x-${idx}`;
            this.cachedDirectStreams.set(`${probeId}:${id}`, { title, url: m.url as string, ext: "mp4" });
            return {
              id,
              ext: "mp4",
              height: h,
              hasVideo: true,
              hasAudio: true,
            };
          });
          return {
            probeId,
            title,
            formats,
          };
        }
      }
    } catch {
      // try fxtwitter
    }

    try {
      const fxRes = await this.fetcher(`https://api.fxtwitter.com/i/status/${tweetId}`, {
        headers: { Accept: "application/json" },
      });
      if (fxRes.ok) {
        const fxData = (await fxRes.json()) as Record<string, unknown>;
        const tweet = fxData?.tweet as Record<string, unknown> | undefined;
        const mediaObj = tweet?.media as Record<string, unknown> | undefined;
        const videos = (Array.isArray(mediaObj?.videos) ? mediaObj.videos : (Array.isArray(mediaObj?.all) ? mediaObj.all : [])) as Record<string, unknown>[];
        const videoItems = videos.filter((m) => m.type === "video" || m.type === "gif");
        if (videoItems.length > 0) {
          const title = String(tweet?.text || "X Video").slice(0, 200);
          const formats: FormatOption[] = [];
          for (const [idx, v] of videoItems.entries()) {
            const variants = (Array.isArray(v.variants) ? v.variants : []) as Record<string, unknown>[];
            for (const [vIdx, vr] of variants.entries()) {
              if (!vr?.url || typeof vr.url !== "string" || !String(vr.content_type || "").includes("mp4")) continue;
              const resMatch = String(vr.url).match(/\/(\d+)x(\d+)\//);
              const h = resMatch ? Math.min(parseInt(resMatch[1], 10), parseInt(resMatch[2], 10)) : 720;
              const id = `x-${idx}-${vIdx}`;
              formats.push({
                id,
                ext: "mp4",
                height: h,
                hasVideo: true,
                hasAudio: true,
              });
              this.cachedDirectStreams.set(`${probeId}:${id}`, { title, url: vr.url, ext: "mp4" });
            }
            if (typeof v.url === "string" && formats.length === 0) {
              const h = typeof v.height === "number" ? v.height : 720;
              const id = `x-${idx}`;
              formats.push({
                id,
                ext: "mp4",
                height: h,
                hasVideo: true,
                hasAudio: true,
              });
              this.cachedDirectStreams.set(`${probeId}:${id}`, { title, url: v.url, ext: "mp4" });
            }
          }
          if (formats.length > 0) {
            formats.sort((a, b) => (b.height ?? 0) - (a.height ?? 0));
            return {
              probeId,
              title,
              formats,
            };
          }
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  async getSession(): Promise<string> {
    if (this.csrf) return this.csrf;
    try {
      const response = await this.fetcher(`${this.baseUrl}/api/session`, { headers: { Accept: "application/json" } });
      if (response.ok) {
        const data = await response.json().catch(() => ({})) as Record<string, unknown>;
        const header = response.headers.get("x-vidnest-csrf") ?? "";
        const token = typeof data.csrfToken === "string" ? data.csrfToken : typeof data.csrf === "string" ? data.csrf : typeof data.token === "string" ? data.token : header;
        if (token) { this.csrf = token; return token; }
      }
    } catch { /* Web deployments can expose the token only in their HTML meta tag. */ }
    const page = await this.fetcher(this.baseUrl, { headers: { Accept: "text/html" } });
    if (!page.ok) throw new Error(`Session request failed (${page.status}).`);
    const html = await page.text();
    const token = html.match(/<meta\s+[^>]*name=["']vidnest-csrf["'][^>]*content=["']([^"']*)["']/i)?.[1]
      ?? html.match(/<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']vidnest-csrf["']/i)?.[1]
      ?? "";
    this.csrf = token;
    return token;
  }

  async ensureSession(): Promise<string> { return this.getSession(); }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.fetcher(`${this.baseUrl}/healthz`, { headers: { Accept: "application/json" } });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    await this.ensureSession();
    const response = await this.fetcher(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-VidNest-CSRF": this.csrf,
      },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({})) as Record<string, unknown>;
    if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : `Request failed (${response.status}).`);
    return data as T;
  }

  async probeFormats(url: string): Promise<ProbeResponse> {
    const checked = validatePublicHttpsUrl(url);
    if (!checked.valid || !checked.normalized) throw new Error(checked.error ?? "Invalid URL.");
    try {
      const result = await this.post<ProbeResponse>("/api/formats", { url: checked.normalized });
      if (!result.probeId || !Array.isArray(result.formats) || result.formats.length === 0) throw new Error("No downloadable formats were found.");
      return result;
    } catch (err) {
      if (isTikTokUrl(checked.normalized)) {
        const fallback = await this.probeTikTokResidential(checked.normalized);
        if (fallback) return fallback;
      }
      if (extractTwitterStatusId(checked.normalized)) {
        const fallback = await this.probeTwitterResidential(checked.normalized);
        if (fallback) return fallback;
      }
      const ytId = extractYouTubeVideoId(checked.normalized);
      if (ytId) {
        const fallback = await this.probeYouTubeResidential(ytId);
        if (fallback) return fallback;
      }
      throw err;
    }
  }

  async downloadFormat(url: string, probeId: string, formatId: string): Promise<DownloadResponse> {
    const checked = validatePublicHttpsUrl(url);
    if (!checked.valid || !checked.normalized) throw new Error(checked.error ?? "Invalid URL.");
    if (probeId.startsWith("residential-")) {
      const ytId = probeId.slice("residential-".length);
      const stream = this.cachedDirectStreams.get(`${ytId}:${formatId}`);
      if (stream) {
        return {
          file: `${ytId}.${stream.ext}`,
          title: stream.title,
          url: stream.url,
        };
      }
    }
    if (probeId.startsWith("tiktok-") || probeId.startsWith("x-")) {
      const stream = this.cachedDirectStreams.get(`${probeId}:${formatId}`);
      if (stream) {
        return {
          file: `${probeId}.${stream.ext}`,
          title: stream.title,
          url: stream.url,
        };
      }
    }
    const result = await this.post<DownloadResponse>("/api/download", { url: checked.normalized, probeId, formatId });
    if (typeof result.file !== "string" || typeof result.title !== "string") throw new Error("The server returned an invalid download response.");
    return { ...result, url: `${this.baseUrl}/files/${encodeURIComponent(result.file)}` };
  }

  async download(url: string, probeId: string, formatId: string): Promise<DownloadResponse> { return this.downloadFormat(url, probeId, formatId); }

  async probeAndDownload(url: string, mode: "video" | "audio" | number): Promise<DownloadResponse & { chosenFormat: FormatOption }> {
    await this.getSession();
    const probe = await this.probeFormats(url);
    const chosenFormat = pickBestFormat(probe.formats, mode);
    if (!chosenFormat) throw new Error("No format matches the selected mode.");
    const result = await this.downloadFormat(url, probe.probeId, chosenFormat.id);
    return { ...result, chosenFormat };
  }

  async quickDownload(url: string, mode: "video" | "audio" | number, options?: { direct?: boolean }): Promise<DownloadResponse & { chosenFormat?: FormatOption }> {
    if (options?.direct === false) {
      return this.probeAndDownload(url, mode);
    }
    await this.getSession();
    const checked = validatePublicHttpsUrl(url);
    if (!checked.valid || !checked.normalized) throw new Error(checked.error ?? "Invalid URL.");
    try {
      const direct = await this.post<DownloadResponse & { formatId?: string }>("/api/quick-download", { url: checked.normalized, mode });
      return {
        ...direct,
        url: `${this.baseUrl}/files/${encodeURIComponent(direct.file)}`,
        chosenFormat: direct.formatId ? { id: direct.formatId, ext: direct.file.split(".").pop() ?? "mp4" } : undefined,
      };
    } catch (err) {
      if ((isTikTokUrl(checked.normalized) || extractTwitterStatusId(checked.normalized)) && this.fetcher === fetch) {
        return this.probeAndDownload(checked.normalized, mode);
      }
      const ytId = extractYouTubeVideoId(checked.normalized);
      if (ytId && this.fetcher === fetch) {
        return this.probeAndDownload(checked.normalized, mode);
      }
      throw err;
    }
  }
}
