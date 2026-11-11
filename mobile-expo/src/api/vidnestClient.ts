import { pickBestFormat, validatePublicHttpsUrl, type FormatOption } from "../utils/urlValidator.ts";

export const DEFAULT_SERVER_URL = "https://6c55b2a011d7d5.lhr.life";

export type ProbeResponse = { probeId: string; formats: FormatOption[]; title?: string; [key: string]: unknown };
export type DownloadResponse = { file: string; title: string; url: string; [key: string]: unknown };

export class VidNestClient {
  readonly baseUrl: string;
  private csrf = "";
  private fetcher: typeof fetch;

  constructor(baseUrl: string, fetcher: typeof fetch = fetch) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.fetcher = fetcher;
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
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", "X-VidNest-CSRF": this.csrf }, body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({})) as Record<string, unknown>;
    if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : `Request failed (${response.status}).`);
    return data as T;
  }

  async probeFormats(url: string): Promise<ProbeResponse> {
    const checked = validatePublicHttpsUrl(url);
    if (!checked.valid || !checked.normalized) throw new Error(checked.error ?? "Invalid URL.");
    const result = await this.post<ProbeResponse>("/api/formats", { url: checked.normalized });
    if (!result.probeId || !Array.isArray(result.formats) || result.formats.length === 0) throw new Error("No downloadable formats were found.");
    return result;
  }

  async downloadFormat(url: string, probeId: string, formatId: string): Promise<DownloadResponse> {
    const checked = validatePublicHttpsUrl(url);
    if (!checked.valid || !checked.normalized) throw new Error(checked.error ?? "Invalid URL.");
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
    const direct = await this.post<DownloadResponse & { formatId?: string }>("/api/quick-download", { url: checked.normalized, mode });
    return {
      ...direct,
      url: `${this.baseUrl}/files/${encodeURIComponent(direct.file)}`,
      chosenFormat: direct.formatId ? { id: direct.formatId, ext: direct.file.split(".").pop() ?? "mp4" } : undefined,
    };
  }
}
