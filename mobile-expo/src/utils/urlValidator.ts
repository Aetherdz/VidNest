export type FormatOption = {
  id: string;
  quality?: string;
  ext?: string;
  height?: number | null;
  filesize?: number | null;
  filesizeApprox?: number | null;
  hasVideo?: boolean;
  [key: string]: unknown;
};

export function extractUrlFromText(text: string): string | null {
  const match = text.match(/https:\/\/[^\s<>"'`]+/i);
  if (!match) return null;
  let candidate = match[0].replace(/[,.!?;:\]}]+$/, "");
  while (candidate.endsWith(")") && (candidate.match(/\(/g)?.length ?? 0) < (candidate.match(/\)/g)?.length ?? 0)) candidate = candidate.slice(0, -1);
  return candidate || null;
}

export function validatePublicHttpsUrl(raw: string): { valid: boolean; normalized?: string; host?: string; error?: string } {
  let url: URL;
  try { url = new URL(raw.trim()); } catch { return { valid: false, error: "Enter a valid URL." }; }
  if (url.protocol !== "https:") return { valid: false, error: "Only HTTPS links are supported." };
  if (url.username || url.password) return { valid: false, error: "Links containing credentials are not allowed." };
  if (url.port && url.port !== "443") return { valid: false, error: "Custom ports are not allowed." };
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (!host || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return { valid: false, error: "Private network addresses are not allowed." };
  if (host.includes(":")) {
    if (host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe8") || host.startsWith("fe9") || host.startsWith("fea") || host.startsWith("feb")) return { valid: false, error: "Private network addresses are not allowed." };
  } else if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) {
    const octets = host.split(".").map(Number);
    if (octets.some((part) => part > 255) || octets[0] === 0 || octets[0] === 10 || octets[0] === 127 || octets[0] === 192 && octets[1] === 168 || octets[0] === 169 && octets[1] === 254 || octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31 || octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127) return { valid: false, error: "Private network addresses are not allowed." };
  }
  url.hash = "";
  return { valid: true, normalized: url.toString(), host };
}

const hasVideo = (f: FormatOption) => f.hasVideo ?? (f.height != null && f.height > 0);
const isAudio = (f: FormatOption) => !hasVideo(f) && /^(m4a|mp3)$/i.test(f.ext ?? "");
const size = (f: FormatOption) => f.filesize ?? f.filesizeApprox ?? 0;
const best = (a: FormatOption, b: FormatOption) => (b.height ?? 0) - (a.height ?? 0) || Number(/mp4/i.test(b.ext ?? "")) - Number(/mp4/i.test(a.ext ?? "")) || size(b) - size(a);

export function pickBestFormat(formats: FormatOption[], mode: "video" | "audio" | number): FormatOption | null {
  const candidates = mode === "audio" ? formats.filter(isAudio) : formats.filter((f) => hasVideo(f) && (typeof mode !== "number" || (f.height ?? 0) <= mode));
  return [...candidates].sort(best)[0] ?? null;
}

export function formatBytes(bytes?: number | null): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function formatDuration(seconds?: number | null): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return "—";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600), m = Math.floor(total % 3600 / 60), s = total % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}
