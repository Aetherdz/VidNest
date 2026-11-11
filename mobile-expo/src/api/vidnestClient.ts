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
      const ytId = extractYouTubeVideoId(checked.normalized);
      if (ytId && this.fetcher === fetch) {
        return this.probeAndDownload(checked.normalized, mode);
      }
      throw err;
    }
  }
}
