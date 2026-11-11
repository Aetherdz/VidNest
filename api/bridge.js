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

async function probeYouTubeFederated(videoId) {
  if (!videoId) return null;
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
  const pool = videos.length > 0 ? videos : formats;
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
      const upstream = await postRender("/api/formats", body);
      if (upstream.ok) {
        const data = await upstream.json().catch(() => ({}));
        return res.status(200).json(data);
      }
      const ytId = extractYouTubeVideoId(body.url);
      if (ytId) {
        const fed = await probeYouTubeFederated(ytId);
        if (fed) return res.status(200).json(fed);
      }
      const data = await upstream.json().catch(() => ({ error: "Invalid upstream response" }));
      return res.status(upstream.status).json(data);
    }

    if (rawEndpoint === "api/download" && req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const upstream = await postRender("/api/download", body);
      const data = await upstream.json().catch(() => ({ error: "Invalid upstream response" }));
      return res.status(upstream.status).json(data);
    }

    if (rawEndpoint === "api/quick-download" && req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
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
