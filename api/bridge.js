const RENDER_BASE = "https://vidnest-web.onrender.com";

const ALLOWED_ORIGINS = new Set([
  "https://aetherdz.github.io",
  "https://vidnest-six.vercel.app",
  "https://vidnest.vercel.app",
  "https://vidnest-web.vercel.app",
  "https://vidnest-atheerium-dz.vercel.app",
  "https://vidnest-aether-dz.vercel.app",
  "http://127.0.0.1:8081",
  "http://localhost:8081",
  "http://127.0.0.1:5000",
  "http://localhost:5000",
]);

const YOUTUBE_FEDERATED_APIS = [
  { kind: "piped", base: "https://pipedapi.kavin.rocks" },
  { kind: "piped", base: "https://pipedapi.adminforge.de" },
  { kind: "invidious", base: "https://inv.nadeko.net" },
  { kind: "invidious", base: "https://invidious.nerdvpn.de" },
];

function extractYouTubeVideoId(rawUrl) {
  try {
    const u = new URL(String(rawUrl || ""));
    const host = u.hostname.toLowerCase().replace(/^(www\.|m\.)/, "");
    let id = "";
    if (host === "youtu.be") {
      id = u.pathname.split("/").filter(Boolean)[0] || "";
    } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch") {
        id = u.searchParams.get("v") || "";
      } else {
        const parts = u.pathname.split("/").filter(Boolean);
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

function isTikTokUrl(rawUrl) {
  try {
    const u = new URL(String(rawUrl || ""));
    const host = u.hostname.toLowerCase();
    return host === "tiktok.com" || host.endsWith(".tiktok.com");
  } catch {
    return false;
  }
}

async function probeTikTokFallback(rawUrl) {
  if (!isTikTokUrl(rawUrl)) return null;
  try {
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(rawUrl)}&hd=1`;
    const r = await fetch(apiUrl, {
      headers: { Accept: "application/json", "User-Agent": "VidNest/4.0" },
    });
    if (!r.ok) return null;
    const json = await r.json();
    if (!json || json.code !== 0 || !json.data) return null;
    const d = json.data;
    const absUrl = (u) => {
      if (!u || typeof u !== "string") return "";
      if (u.startsWith("http://") || u.startsWith("https://")) return u;
      return `https://www.tikwm.com${u.startsWith("/") ? "" : "/"}${u}`;
    };
    const formats = [];
    const hdUrl = absUrl(d.hdplay || d.play);
    const sdUrl = absUrl(d.play);
    const wmUrl = absUrl(d.wmplay);
    const audioUrl = absUrl(d.music);
    if (hdUrl) {
      formats.push({
        id: "hd",
        ext: "mp4",
        quality: "1080p",
        height: 1080,
        width: 1080,
        filesize: typeof d.hd_size === "number" && d.hd_size > 0 ? d.hd_size : typeof d.size === "number" ? d.size : null,
        hasVideo: true,
        hasAudio: true,
        format: "HD No-Watermark (MP4)",
        directUrl: hdUrl,
      });
    }
    if (sdUrl && sdUrl !== hdUrl) {
      formats.push({
        id: "sd",
        ext: "mp4",
        quality: "720p",
        height: 720,
        width: 720,
        filesize: typeof d.size === "number" ? d.size : null,
        hasVideo: true,
        hasAudio: true,
        format: "Standard No-Watermark (MP4)",
        directUrl: sdUrl,
      });
    }
    if (wmUrl) {
      formats.push({
        id: "wm",
        ext: "mp4",
        quality: "540p",
        height: 540,
        width: 540,
        filesize: typeof d.wm_size === "number" ? d.wm_size : null,
        hasVideo: true,
        hasAudio: true,
        format: "Watermarked (MP4)",
        directUrl: wmUrl,
      });
    }
    if (audioUrl) {
      formats.push({
        id: "audio",
        ext: "mp3",
        quality: "Audio",
        height: null,
        width: null,
        filesize: null,
        hasVideo: false,
        hasAudio: true,
        format: "Original Audio (MP3)",
        directUrl: audioUrl,
      });
    }
    if (formats.length === 0) return null;
    return {
      probeId: `tiktok-${d.id || "video"}`,
      title: String(d.title || "TikTok Video").slice(0, 200),
      uploader: String(d.author?.nickname || d.author?.unique_id || "TikTok").slice(0, 120),
      extractor: "TikTok",
      duration: typeof d.duration === "number" ? d.duration : null,
      thumbnail: absUrl(d.cover || d.origin_cover) || null,
      formats,
    };
  } catch {
    return null;
  }
}

function extractTwitterStatusId(rawUrl) {
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

async function probeTwitterFallback(rawUrl) {
  const tweetId = extractTwitterStatusId(rawUrl);
  if (!tweetId) return null;
  try {
    const fxRes = await fetch(`https://api.fxtwitter.com/i/status/${tweetId}`, {
      headers: { Accept: "application/json", "User-Agent": "VidNest/4.0" },
    });
    if (fxRes.ok) {
      const fxData = await fxRes.json().catch(() => ({}));
      const tweet = fxData?.tweet;
      const videos = tweet?.media?.videos || (tweet?.media?.all || []).filter((m) => m.type === "video" || m.type === "gif");
      if (Array.isArray(videos) && videos.length > 0) {
        const formats = [];
        for (const [idx, v] of videos.entries()) {
          if (Array.isArray(v.variants) && v.variants.length > 0) {
            for (const [vIdx, vr] of v.variants.entries()) {
              if (!vr?.url || !String(vr.content_type || "").includes("mp4")) continue;
              const resMatch = String(vr.url).match(/\/(\d+)x(\d+)\//);
              const h = resMatch ? Math.min(parseInt(resMatch[1], 10), parseInt(resMatch[2], 10)) : 720;
              formats.push({
                id: `x-${idx}-${vIdx}`,
                ext: "mp4",
                quality: `${h}p`,
                height: h,
                width: v.width || null,
                filesize: null,
                hasVideo: true,
                hasAudio: true,
                format: `${h}p (MP4)`,
                directUrl: vr.url,
              });
            }
          }
          if (v.url && formats.length === 0) {
            const h = typeof v.height === "number" ? v.height : 720;
            formats.push({
              id: `x-${idx}`,
              ext: "mp4",
              quality: `${h}p`,
              height: h,
              width: typeof v.width === "number" ? v.width : null,
              filesize: null,
              hasVideo: true,
              hasAudio: true,
              format: `${h}p (MP4)`,
              directUrl: v.url,
            });
          }
        }
        if (formats.length > 0) {
          formats.sort((a, b) => (b.height || 0) - (a.height || 0));
          return {
            probeId: `x-${tweetId}`,
            title: String(tweet.text || "X Video").slice(0, 200),
            uploader: String(tweet.author?.name || tweet.author?.screen_name || "X").slice(0, 120),
            extractor: "X",
            duration: typeof videos[0].duration === "number" ? Math.round(videos[0].duration) : null,
            thumbnail: videos[0].thumbnail_url || null,
            formats,
          };
        }
      }
    }
  } catch {
    // fall through to vxtwitter
  }
  try {
    const vxRes = await fetch(`https://api.vxtwitter.com/Twitter/status/${tweetId}`, {
      headers: { Accept: "application/json", "User-Agent": "VidNest/4.0" },
    });
    if (vxRes.ok) {
      const vxData = await vxRes.json().catch(() => ({}));
      const media = (vxData?.media_extended || []).filter((m) => (m.type === "video" || m.type === "gif") && m.url);
      if (media.length > 0) {
        const formats = media.map((m, idx) => {
          const h = typeof m.size?.height === "number" ? m.size.height : 720;
          return {
            id: `vx-${idx}`,
            ext: "mp4",
            quality: `${h}p`,
            height: h,
            width: typeof m.size?.width === "number" ? m.size.width : null,
            filesize: null,
            hasVideo: true,
            hasAudio: true,
            format: `${h}p (MP4)`,
            directUrl: m.url,
          };
        });
        return {
          probeId: `x-${tweetId}`,
          title: String(vxData.text || "X Video").slice(0, 200),
          uploader: String(vxData.user_name || vxData.user_screen_name || "X").slice(0, 120),
          extractor: "X",
          duration: typeof media[0].duration_millis === "number" ? Math.round(media[0].duration_millis / 1000) : null,
          thumbnail: media[0].thumbnail_url || null,
          formats,
        };
      }
    }
  } catch {
    // ignore
  }
  return null;
}

async function probeDirectPlatformFallback(rawUrl) {
  const ytId = extractYouTubeVideoId(rawUrl);
  if (ytId) {
    const fed = await probeYouTubeFederated(ytId);
    if (fed) return fed;
  }
  if (isTikTokUrl(rawUrl)) {
    const tk = await probeTikTokFallback(rawUrl);
    if (tk) return tk;
  }
  if (extractTwitterStatusId(rawUrl)) {
    const tw = await probeTwitterFallback(rawUrl);
    if (tw) return tw;
  }
  return null;
}

async function probeYouTubeInnertubeIos(videoId) {
  if (!videoId) return null;
  try {
    const gRes = await fetch("https://www.youtube.com/youtubei/v1/guide?prettyPrint=false", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context: { client: { clientName: "WEB", clientVersion: "2.20250312.04.00" } },
      }),
    });
    const gData = await gRes.json().catch(() => ({}));
    const visitorData = gData?.responseContext?.visitorData;
    const client = {
      clientName: "IOS",
      clientVersion: "20.10.4",
      deviceMake: "Apple",
      deviceModel: "iPhone16,2",
      osName: "iPhone",
      osVersion: "18.3.2.22D82",
      userAgent: "com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X;)",
      ...(visitorData ? { visitorData } : {}),
    };
    const pRes = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": client.userAgent,
        ...(visitorData ? { "X-Goog-Visitor-Id": visitorData } : {}),
      },
      body: JSON.stringify({
        videoId,
        context: { client },
        contentCheckOk: true,
        racyCheckOk: true,
      }),
    });
    if (!pRes.ok) return null;
    const data = await pRes.json();
    const rawFormats = [
      ...(data?.streamingData?.formats || []),
      ...(data?.streamingData?.adaptiveFormats || []),
    ].filter((f) => f && typeof f.url === "string");
    if (rawFormats.length === 0) return null;

    const seen = new Map();
    for (const f of rawFormats) {
      const mime = String(f.mimeType || "").toLowerCase();
      const isAudio = mime.startsWith("audio/");
      const hasVideo = !isAudio && (mime.startsWith("video/") || typeof f.height === "number");
      const hasAudio = isAudio || Boolean(f.audioQuality);
      const ext = isAudio
        ? mime.includes("mp4")
          ? "m4a"
          : "webm"
        : mime.includes("webm")
        ? "webm"
        : "mp4";
      const height = typeof f.height === "number" ? f.height : null;
      const filesize = f.contentLength ? parseInt(String(f.contentLength), 10) : null;
      const key = `${hasVideo ? height || "v" : "a"}-${ext}-${hasAudio}`;
      const prev = seen.get(key);
      if (!prev || (filesize || 0) > (prev.filesize || 0)) {
        seen.set(key, {
          id: String(f.itag || key),
          ext,
          quality: hasVideo ? `${height || 720}p` : "Audio",
          height,
          width: typeof f.width === "number" ? f.width : null,
          filesize: Number.isFinite(filesize) ? filesize : null,
          hasVideo,
          hasAudio,
          format: hasVideo ? `${f.qualityLabel || `${height}p`} (${ext.toUpperCase()})` : `Audio (${ext.toUpperCase()})`,
          directUrl: f.url,
        });
      }
    }
    const formats = Array.from(seen.values()).sort((a, b) => {
      if (a.hasVideo !== b.hasVideo) return a.hasVideo ? -1 : 1;
      return (b.height || 0) - (a.height || 0);
    });
    const thumbs = data?.videoDetails?.thumbnail?.thumbnails || [];
    const bestThumb = thumbs.length > 0 ? thumbs[thumbs.length - 1].url : null;
    return {
      probeId: `ios-${videoId}`,
      title: String(data?.videoDetails?.title || "YouTube Video").slice(0, 200),
      uploader: String(data?.videoDetails?.author || "YouTube").slice(0, 120),
      extractor: "Youtube",
      duration: data?.videoDetails?.lengthSeconds ? Number(data.videoDetails.lengthSeconds) : null,
      thumbnail: bestThumb,
      formats,
    };
  } catch {
    return null;
  }
}

async function probeYouTubeFederated(videoId) {
  if (!videoId) return null;
  const iosResult = await probeYouTubeInnertubeIos(videoId);
  if (iosResult) return iosResult;

  for (const inst of YOUTUBE_FEDERATED_APIS) {
    const endpoint =
      inst.kind === "piped"
        ? `${inst.base}/streams/${videoId}`
        : `${inst.base}/api/v1/videos/${videoId}`;
    try {
      const r = await fetch(endpoint, { headers: { Accept: "application/json", "User-Agent": "VidNest/4.0" } });
      if (!r.ok) continue;
      const data = await r.json();
      const formats = [];
      if (inst.kind === "piped") {
        for (const [idx, vs] of (data.videoStreams || []).entries()) {
          if (!vs || typeof vs.url !== "string") continue;
          const height = typeof vs.height === "number" ? vs.height : 720;
          const ext = String(vs.mimeType || "").includes("webm") ? "webm" : "mp4";
          formats.push({
            id: String(vs.itag || `pipedv${idx}`),
            ext,
            quality: `${height}p`,
            height,
            width: typeof vs.width === "number" ? vs.width : null,
            filesize: typeof vs.contentLength === "number" ? vs.contentLength : null,
            hasVideo: true,
            hasAudio: !vs.videoOnly,
            format: `${height}p (${ext})`,
            directUrl: vs.url,
          });
        }
        for (const [idx, aus] of (data.audioStreams || []).entries()) {
          if (!aus || typeof aus.url !== "string") continue;
          const ext = String(aus.mimeType || "").includes("mp4") ? "m4a" : "webm";
          formats.push({
            id: String(aus.itag || `pipeda${idx}`),
            ext,
            quality: "Audio",
            height: null,
            width: null,
            filesize: typeof aus.contentLength === "number" ? aus.contentLength : null,
            hasVideo: false,
            hasAudio: true,
            format: `Audio (${ext})`,
            directUrl: aus.url,
          });
        }
      } else {
        for (const [idx, fs] of [...(data.formatStreams || []), ...(data.adaptiveFormats || [])].entries()) {
          if (!fs || typeof fs.url !== "string") continue;
          const mime = String(fs.type || "").toLowerCase();
          const isAudio = mime.startsWith("audio/");
          const ext = isAudio && mime.includes("mp4") ? "m4a" : mime.includes("webm") ? "webm" : "mp4";
          const h = parseInt(String(fs.resolution || "").replace("p", ""), 10);
          const height = Number.isFinite(h) ? h : isAudio ? null : 720;
          formats.push({
            id: String(fs.itag || `inv${idx}`),
            ext,
            quality: isAudio ? "Audio" : `${height}p`,
            height,
            width: null,
            filesize: null,
            hasVideo: !isAudio,
            hasAudio: true,
            format: isAudio ? `Audio (${ext})` : `${height}p (${ext})`,
            directUrl: fs.url,
          });
        }
      }
      if (formats.length > 0) {
        return {
          probeId: `fed-${videoId}`,
          title: String(data.title || "YouTube Video").slice(0, 200),
          uploader: String(data.uploader || data.author || "").slice(0, 120),
          extractor: "YoutubeFederated",
          duration: typeof data.duration === "number" ? data.duration : null,
          formats,
        };
      }
    } catch {
      // try next instance
    }
  }
  return null;
}

let cachedCsrf = "";
let cachedAt = 0;

async function getRenderCsrf(forceRefresh = false) {
  if (!forceRefresh && cachedCsrf && Date.now() - cachedAt < 5 * 60 * 1000) {
    return cachedCsrf;
  }
  try {
    const sess = await fetch(`${RENDER_BASE}/api/session`, {
      headers: { Accept: "application/json", Origin: RENDER_BASE },
    });
    if (sess.ok) {
      const data = await sess.json().catch(() => ({}));
      const tok = data.csrfToken || data.csrf || sess.headers.get("x-vidnest-csrf") || "";
      if (tok) {
        cachedCsrf = tok;
        cachedAt = Date.now();
        return tok;
      }
    }
  } catch {
    // Fall back to HTML meta extraction below
  }
  const page = await fetch(`${RENDER_BASE}/`, { headers: { Accept: "text/html" } });
  const html = await page.text();
  const match =
    html.match(/<meta\s+[^>]*name=["']vidnest-csrf["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']vidnest-csrf["']/i);
  cachedCsrf = match ? match[1] : "";
  cachedAt = Date.now();
  return cachedCsrf;
}

function pickBestFormat(formats, mode) {
  if (!Array.isArray(formats) || formats.length === 0) return null;
  if (mode === "audio") {
    const audioOnly = formats.filter((f) => !f.hasVideo);
    const pool = audioOnly.length > 0 ? audioOnly : formats;
    const m4a = pool.find((f) => f.ext === "m4a" || f.id === "audio");
    return m4a || pool[0];
  }
  const videos = formats.filter((f) => f.hasVideo !== false);
  const withAudio = videos.filter((f) => f.hasAudio);
  const pool = withAudio.length > 0 ? withAudio : videos.length > 0 ? videos : formats;
  const maxHeight = typeof mode === "number" ? mode : /^\d+$/.test(String(mode)) ? Number(mode) : null;
  if (maxHeight) {
    const under = pool.filter((f) => typeof f.height === "number" && f.height <= maxHeight);
    if (under.length > 0) {
      under.sort((a, b) => (b.height || 0) - (a.height || 0));
      return under[0];
    }
  }
  const sorted = [...pool].sort((a, b) => (b.height || 0) - (a.height || 0));
  return sorted[0] || formats[0];
}

async function postRender(path, payload) {
  let csrf = await getRenderCsrf(false);
  let res = await fetch(`${RENDER_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: RENDER_BASE,
      "X-VidNest-CSRF": csrf,
    },
    body: JSON.stringify(payload),
  });
  if (res.status === 403) {
    csrf = await getRenderCsrf(true);
    res = await fetch(`${RENDER_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: RENDER_BASE,
        "X-VidNest-CSRF": csrf,
      },
      body: JSON.stringify(payload),
    });
  }
  return res;
}

module.exports = async function handler(req, res) {
  const origin = (req.headers.origin || "").replace(/\/+$/, "");
  if (origin && (ALLOWED_ORIGINS.has(origin) || origin.endsWith(".vercel.app"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-VidNest-CSRF");
    res.setHeader("Access-Control-Expose-Headers", "X-VidNest-CSRF");
  }

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  const rawEndpoint = String(req.query.endpoint || req.url || "").replace(/^\/+/, "").split("?")[0];

  try {
    if (rawEndpoint === "api/session" && req.method === "GET") {
      const csrf = await getRenderCsrf(false);
      res.setHeader("X-VidNest-CSRF", csrf);
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ csrfToken: csrf, csrf });
    }

    if (rawEndpoint === "api/formats" && req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const direct = await probeDirectPlatformFallback(body.url);
      if (direct) return res.status(200).json(direct);

      const upstream = await postRender("/api/formats", body);
      const data = await upstream.json().catch(() => ({ error: "Invalid upstream response" }));
      return res.status(upstream.status).json(data);
    }

    if (rawEndpoint === "api/download" && req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const probePrefix = String(body.probeId || "");
      if (
        probePrefix.startsWith("ios-") ||
        probePrefix.startsWith("fed-") ||
        probePrefix.startsWith("tiktok-") ||
        probePrefix.startsWith("x-") ||
        extractYouTubeVideoId(body.url) ||
        isTikTokUrl(body.url) ||
        extractTwitterStatusId(body.url)
      ) {
        const direct = await probeDirectPlatformFallback(body.url);
        const match = direct?.formats?.find((f) => f.id === String(body.formatId)) || direct?.formats?.[0];
        if (match && match.directUrl) {
          return res.status(200).json({
            file: match.directUrl,
            title: direct.title,
            formatId: match.id,
          });
        }
      }
      const upstream = await postRender("/api/download", body);
      const data = await upstream.json().catch(() => ({ error: "Invalid upstream response" }));
      return res.status(upstream.status).json(data);
    }

    if (rawEndpoint === "api/quick-download" && req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const directFallback = await probeDirectPlatformFallback(body.url);
      if (directFallback && Array.isArray(directFallback.formats) && directFallback.formats.length > 0) {
        const chosen = pickBestFormat(directFallback.formats, body.mode || "video");
        if (chosen && chosen.directUrl) {
          return res.status(200).json({
            file: chosen.directUrl,
            title: directFallback.title,
            formatId: chosen.id,
          });
        }
      }
      const direct = await postRender("/api/quick-download", body);
      if (direct.status !== 404) {
        const data = await direct.json().catch(() => ({ error: "Invalid upstream response" }));
        return res.status(direct.status).json(data);
      }
      const probeRes = await postRender("/api/formats", { url: body.url });
      const probeData = await probeRes.json().catch(() => ({}));
      if (!probeRes.ok) {
        return res.status(probeRes.status).json(probeData);
      }
      const chosen = pickBestFormat(probeData.formats, body.mode || "video");
      if (!chosen || !probeData.probeId) {
        return res.status(404).json({ error: "No downloadable formats found for this link." });
      }
      const dlRes = await postRender("/api/download", {
        url: body.url,
        probeId: probeData.probeId,
        formatId: chosen.id,
      });
      const dlData = await dlRes.json().catch(() => ({}));
      if (!dlRes.ok) {
        return res.status(dlRes.status).json(dlData);
      }
      return res.status(200).json({ ...dlData, formatId: chosen.id });
    }

    if (rawEndpoint.startsWith("files/") && req.method === "GET") {
      const fileName = rawEndpoint.slice("files/".length);
      if (!/^[0-9a-f]{32}\.[a-z0-9]{2,5}$/i.test(fileName)) {
        return res.status(404).json({ error: "File not found" });
      }
      return res.redirect(302, `${RENDER_BASE}/files/${encodeURIComponent(fileName)}`);
    }

    return res.status(404).json({ error: "Not found" });
  } catch (err) {
    return res.status(502).json({ error: err instanceof Error ? err.message : "Upstream proxy error" });
  }
};
