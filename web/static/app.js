"use strict";

const copy = {
  ar: {
    lang: "ar",
    dir: "rtl",
    switch: "EN",
    designerCredit: "by Atheerium",
    statusPill: "+1,800 موقع · بدون إعلانات",
    eyebrow: "أداة الوسائط الهادئة",
    headline: "حمّل ما تحب، واحتفظ به بسهولة.",
    heroCta: "ابدأ التنزيل",
    heroNote: "بدون حساب · بدون إعلانات · مع احترام خصوصيتك",
    phonePreviewLabel: "معاينة واجهة تطبيق VidNest",
    phoneKicker: "الصق، اختر، احفظ",
    phoneTitle: "ماذا تريد أن تحمّل اليوم؟",
    phonePaste: "لصق",
    phoneDownload: "تنزيل",
    phonePreview: "معاينة الفيديو",
    phoneQuality: "أفضل جودة · 1080p",
    phoneHome: "الرئيسية",
    phoneDownloads: "التنزيلات",
    phoneLibrary: "المكتبة",
    footerPrivacy: "معلومات الخصوصية",
    footerContact: "تواصل معنا",
    intro: "الصق رابط فيديو أو مقطع صوتي، استعرض خيارات الدقة فورًا، ثم احفظ الملف مباشرة في جهازك دون إعلانات وبأعلى جودة.",
    urlLabel: "رابط الفيديو أو الصوت",
    urlPlaceholder: "https://...",
    clearUrl: "مسح الرابط",
    paste: "لصق",
    inspect: "استعراض الجودات",
    inspecting: "جارٍ التحليل…",
    quickDownload: "تنزيل مباشر",
    availableLabel: "متاح لهذا الرابط",
    formatsTitle: "اختر الجودة المطلوبة",
    filterAll: "الكل",
    filterVideo: "فيديو",
    filterAudio: "صوت فقط",
    noFilteredFormats: "لا تتوفر خيارات مطابقة لهذا التصنيف.",
    download: "ابدأ التنزيل",
    downloading: "جارٍ التنزيل…",
    formatFootnote: "الجودات المعروضة مستخرجة مباشرة من المصدر الأصلي بدون ضغط إضافي.",
    recentDownloads: "آخر التنزيلات",
    viewAll: "عرض الكل",
    downloadsTitle: "التنزيلات",
    downloadsHint: "تُحفظ الملفات في مجلد التنزيلات على جهازك ويمكنك تنزيلها أو الرجوع إليها.",
    clear: "مسح السجل",
    clearConfirm: "هل تريد بالتأكيد مسح قائمة التنزيلات؟",
    libraryTitle: "المكتبة",
    libraryHint: "مكتبتك المحلية من مقاطع الفيديو والصوتيات الجاهزة للتشغيل المباشر.",
    navHome: "الرئيسية",
    navDownloads: "التنزيلات",
    navLibrary: "المكتبة",
    stepsHeading: "ثلاث خطوات بسيطة لحفظ أي محتوى",
    step1Title: "الصق الرابط",
    step1Desc: "انسخ رابط أي فيديو أو ملف صوتي من منصتك المفضلة والصقه في مربع البحث.",
    step2Title: "اختر الدقة",
    step2Desc: "استعرض خيارات الدقة المتاحة من 4K وحتى المقاطع الصوتية عالية النقاوة.",
    step3Title: "احفظ واستمتع",
    step3Desc: "نزّل الملف لجهازك واستمتع بالمشاهدة والاستماع في أي وقت وبدون انترنت.",
    featuresHeading: "لماذا تختار VidNest؟",
    feat1Title: "سرعة وجودة أوضح",
    feat1Desc: "استخراج سريع ودمج أفضل تدفق فيديو وصوت متاح عند دعم المصدر.",
    feat2Title: "خصوصية وأمان تام",
    feat2Desc: "بدون تسجيل حساب، بدون ملفات تعريف ارتباط للتعقب، وخالٍ من الإعلانات تمامًا.",
    feat3Title: "+1,800 موقع مدعوم",
    feat3Desc: "تغطية عالمية تشمل كبرى منصات الفيديو وشبكات التواصل وبودكاست الصوت.",
    feat4Title: "دمج ذكي للصوت والفيديو",
    feat4Desc: "دمج تلقائي لأعلى دقة تصوير مع أفضل دفق صوتي متاح من خلال خوارزميات FFmpeg.",
    apkTitle: "حمّل تطبيق VidNest للأندرويد",
    apkDesc: "تجربة أصيلة ومتكاملة على جهازك المحمول، مع مشغل وسائط مدمج وتشغيل في الخلفية ومكتبة منظمة.",
    apkCta: "تنزيل حزمة APK الرسمية",
    faqHeading: "الأسئلة الشائعة",
    faq1Q: "كيف يضمن VidNest خصوصية المستخدم؟",
    faq1A: "لا يقوم VidNest بتسجيل بياناتك الشخصية أو بناء ملفات تتبع، وتُمسح الملفات المؤقتة تلقائيًا بعد اكتمال التنزيل.",
    faq2Q: "هل الخدمة مجانية تمامًا وبدون إعلانات؟",
    faq2A: "نعم، VidNest أداة مفتوحة ومجانية تمامًا وبدون أي إعلانات أو نوافذ منبثقة أو أدوات تتبع تجارية.",
    faq3Q: "هل يدعم تنزيل الفيديوهات بدقة 4K؟",
    faq3A: "نعم، للمصادر التي تدعم دقة 4K، يدمج محرك VidNest تدفق الفيديو الفائق مع أفضل جودة صوت عبر خوادم آمنة.",
    audioOnly: "صوت فقط",
    hasAudio: "صوت مضمّن",
    videoOnly: "فيديو — سيُدمج مع أفضل صوت",
    empty: "يُرجى إدخال رابط فيديو أو صوت أولًا.",
    pasteDenied: "تعذّر الوصول إلى الحافظة تلقائيًا. يُرجى لصق الرابط يدويًا.",
    genericError: "تعذّر إكمال الطلب. تحقق من صحة الرابط وحاول مجددًا.",
    noFormats: "لم يعرض هذا الرابط جودات قابلة للتنزيل. تأكد من أن الرابط عام ومتاح.",
    successToast: "أُضيف إلى التنزيلات",
    analyzingStage: "جارٍ فحص الرابط والاتصال بالمصدر…",
    downloadingStage: "جارٍ استخراج وتنزيل تدفق الوسائط…",
    finalizingStage: "جارٍ المعالجة النهائية والدمج…",
    completeStage: "اكتمل التنزيل بنجاح",
    errorStage: "فشل التنزيل",
    emptyDownloads: "لا توجد تنزيلات حتى الآن.",
    emptyLibrary: "المكتبة فارغة. قم بتنزيل ملفات لتظهر هنا.",
    saveFile: "حفظ الملف",
    retry: "إعادة المحاولة",
    countText: (n) => `${n} جودة متاحة`,
  },
  en: {
    lang: "en",
    dir: "ltr",
    switch: "عربي",
    designerCredit: "by Atheerium",
    statusPill: "1,800+ Sites · Zero Ads",
    eyebrow: "Quiet Media Instrument",
    headline: "Save what you love.",
    heroCta: "Start your download",
    heroNote: "No account · No ads · Privacy respected",
    phonePreviewLabel: "VidNest app preview",
    phoneKicker: "Paste, choose, save",
    phoneTitle: "What would you like to download?",
    phonePaste: "Paste",
    phoneDownload: "Download",
    phonePreview: "Video preview",
    phoneQuality: "Best quality · 1080p",
    phoneHome: "Home",
    phoneDownloads: "Downloads",
    phoneLibrary: "Library",
    footerPrivacy: "Privacy information",
    footerContact: "Contact us",
    intro: "Paste a video or audio link, inspect available qualities instantly, and download the format that fits your device in one clean click.",
    urlLabel: "Video or audio link",
    urlPlaceholder: "https://...",
    clearUrl: "Clear link",
    paste: "Paste",
    inspect: "Inspect qualities",
    inspecting: "Analyzing…",
    quickDownload: "Quick download",
    availableLabel: "Available for this link",
    formatsTitle: "Choose quality",
    filterAll: "All",
    filterVideo: "Video",
    filterAudio: "Audio only",
    noFilteredFormats: "No formats match this filter.",
    download: "Start download",
    downloading: "Downloading…",
    formatFootnote: "Qualities are extracted directly from the original source with zero added compression.",
    recentDownloads: "Recent downloads",
    viewAll: "View all",
    downloadsTitle: "Downloads",
    downloadsHint: "Files are saved to your device and can be retrieved or downloaded at any time.",
    clear: "Clear history",
    clearConfirm: "Are you sure you want to clear your download history?",
    libraryTitle: "Library",
    libraryHint: "Your collection of saved audio and video files ready for direct playback.",
    navHome: "Home",
    navDownloads: "Downloads",
    navLibrary: "Library",
    stepsHeading: "Three simple steps to save any media",
    step1Title: "Paste link",
    step1Desc: "Copy any video or audio link from your favorite platform and paste it into the box.",
    step2Title: "Choose quality",
    step2Desc: "Inspect available resolution options from 4K down to lossless audio streams.",
    step3Title: "Save & enjoy",
    step3Desc: "Download directly to your device and enjoy offline playback with zero ads.",
    featuresHeading: "Why VidNest?",
    feat1Title: "Fast, source-matched quality",
    feat1Desc: "Quick extraction and merging of the best available video and audio when the source supports it.",
    feat2Title: "Quiet & private",
    feat2Desc: "No account, no tracking profiles, and no advertisements.",
    feat3Title: "1,800+ supported sites",
    feat3Desc: "Universal coverage across major video networks, social media, and podcasts.",
    feat4Title: "Smart audio and video merging",
    feat4Desc: "Automatically combines the highest available video resolution with the best available audio stream using FFmpeg.",
    apkTitle: "Get VidNest for Android",
    apkDesc: "A complete mobile companion with background playback, picture-in-picture, and an offline media library.",
    apkCta: "Download Official APK",
    faqHeading: "Frequently Asked Questions",
    faq1Q: "How does VidNest ensure user privacy?",
    faq1A: "VidNest does not log personal activity or build user profiles. Temporary files are removed automatically.",
    faq2Q: "Is VidNest completely free and ad-free?",
    faq2A: "Yes. VidNest is open-source, completely free, and contains zero advertisements or commercial trackers.",
    faq3Q: "Does VidNest support 4K video downloads?",
    faq3A: "Yes. When sources offer 4K streams, VidNest pairs high-resolution video with best audio automatically.",
    audioOnly: "Audio only",
    hasAudio: "Audio included",
    videoOnly: "Video — best audio will be merged",
    empty: "Please enter a video or audio link first.",
    pasteDenied: "Clipboard access was denied. Please paste the link manually.",
    genericError: "The request failed. Please verify the link and try again.",
    noFormats: "No downloadable formats were found for this link. Ensure the link is public.",
    successToast: "Added to downloads",
    analyzingStage: "Analyzing link and connecting to host…",
    downloadingStage: "Extracting and downloading media stream…",
    finalizingStage: "Finalizing and merging media…",
    completeStage: "Download complete",
    errorStage: "Download failed",
    emptyDownloads: "No downloads yet.",
    emptyLibrary: "Your library is empty. Download files to see them here.",
    saveFile: "Save file",
    retry: "Retry",
    countText: (n) => `${n} qualities available`,
  },
};

// DOM References
const $ = (id) => document.getElementById(id);
const form = $("download-form");
const input = $("url");
const clearUrlButton = $("clear-url");
const pasteButton = $("paste");
const inspectButton = $("inspect");
const quickButton = $("quick-download-btn");
const downloadButton = $("download");
const message = $("message");
const themeToggleButton = $("theme-toggle");
const languageButton = $("language");
const filterAllButton = $("filter-all");
const filterVideoButton = $("filter-video");
const filterAudioButton = $("filter-audio");
const navIndicator = $("nav-indicator");

// State
let language = localStorage.getItem("vidnest-lang") === "en" ? "en" : "ar";
let theme = localStorage.getItem("vidnest-theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
let activeView = "home";
let activeFilter = "all";
let probe = null;
let selectedFormat = null;
let requestInProgress = false;
let activeJobId = null;

function t(key) {
  return copy[language][key] || "";
}

function readRecent() {
  try {
    const raw = localStorage.getItem("vidnest_recent_downloads") || localStorage.getItem("vidnest-recent");
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => item && typeof item.file === "string" && typeof item.title === "string").slice(0, 30);
    }
  } catch {
    /* ignore parse errors */
  }
  return [];
}

let recent = readRecent();

function saveRecent() {
  try {
    const serialized = JSON.stringify(recent.slice(0, 30));
    localStorage.setItem("vidnest_recent_downloads", serialized);
    localStorage.setItem("vidnest-recent", serialized);
  } catch {
    /* quota error fallback */
  }
}

function extractUrlFromText(text) {
  if (typeof text !== "string" || !text.trim()) return null;
  const match = text.match(/https:\/\/[^\s"'<>]+/i);
  if (!match) return null;
  let url = match[0];
  url = url.replace(/[.,;:!?)]+$/, "");
  return url;
}

function resolveApiBase() {
  const csrfMeta = document.querySelector('meta[name="vidnest-csrf"]');
  const csrfVal = csrfMeta ? (csrfMeta.getAttribute("content") || "").trim() : "";
  // When served directly by the Flask backend, __VIDNEST_CSRF_TOKEN__ is replaced in-page.
  if (csrfVal && csrfVal !== "__VIDNEST_CSRF_TOKEN__") {
    return "";
  }
  const apiMeta = document.querySelector('meta[name="vidnest-api"]');
  const configured = apiMeta ? (apiMeta.getAttribute("content") || "").trim().replace(/\/+$/, "") : "";
  return configured || "https://vidnest-web.onrender.com";
}

const API_BASE = resolveApiBase();
const BRIDGE_API_BASE =
  typeof window !== "undefined" && window.location && window.location.hostname.endsWith(".vercel.app")
    ? ""
    : "https://vidnest-six.vercel.app";
let activeApiBase = API_BASE;
let cachedCsrfToken = "";

const CLIENT_YOUTUBE_APIS = [
  { kind: "piped", base: "https://pipedapi.kavin.rocks" },
  { kind: "piped", base: "https://pipedapi.adminforge.de" },
  { kind: "invidious", base: "https://inv.nadeko.net" },
  { kind: "invidious", base: "https://invidious.nerdvpn.de" },
];

function extractYouTubeVideoId(rawUrl) {
  try {
    const parsed = new URL(String(rawUrl || ""));
    const host = parsed.hostname.toLowerCase().replace(/^(www\.|m\.)/, "");
    let id = "";
    if (host === "youtu.be") {
      id = parsed.pathname.split("/").filter(Boolean)[0] || "";
    } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (parsed.pathname === "/watch") {
        id = parsed.searchParams.get("v") || "";
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

function isTikTokUrl(rawUrl) {
  try {
    const u = new URL(String(rawUrl || ""));
    const host = u.hostname.toLowerCase();
    return host === "tiktok.com" || host.endsWith(".tiktok.com");
  } catch {
    return false;
  }
}

async function probeTikTokFromClient(url) {
  if (!isTikTokUrl(url)) return null;
  try {
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
    const resp = await fetch(apiUrl, { headers: { Accept: "application/json" } });
    if (!resp.ok) return null;
    const json = await resp.json();
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
        id: "tiktok-hd",
        ext: "mp4",
        quality: "1080p",
        height: 1080,
        filesize: typeof d.hd_size === "number" && d.hd_size > 0 ? d.hd_size : typeof d.size === "number" ? d.size : null,
        hasVideo: true,
        hasAudio: true,
        format: "HD No-Watermark (MP4)",
        directUrl: hdUrl,
      });
    }
    if (sdUrl && sdUrl !== hdUrl) {
      formats.push({
        id: "tiktok-sd",
        ext: "mp4",
        quality: "720p",
        height: 720,
        filesize: typeof d.size === "number" ? d.size : null,
        hasVideo: true,
        hasAudio: true,
        format: "Standard No-Watermark (MP4)",
        directUrl: sdUrl,
      });
    }
    if (wmUrl) {
      formats.push({
        id: "tiktok-wm",
        ext: "mp4",
        quality: "540p",
        height: 540,
        filesize: typeof d.wm_size === "number" ? d.wm_size : null,
        hasVideo: true,
        hasAudio: true,
        format: "Watermarked (MP4)",
        directUrl: wmUrl,
      });
    }
    if (audioUrl) {
      formats.push({
        id: "tiktok-audio",
        ext: "mp3",
        quality: "Audio",
        height: null,
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
      extractor: "TikTokClientFallback",
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

async function probeTwitterFromClient(rawUrl) {
  const tweetId = extractTwitterStatusId(rawUrl);
  if (!tweetId) return null;
  try {
    const vxRes = await fetch(`https://api.vxtwitter.com/Twitter/status/${tweetId}`, {
      headers: { Accept: "application/json" },
    });
    if (vxRes.ok) {
      const vxData = await vxRes.json();
      const media = (vxData?.media_extended || []).filter((m) => (m.type === "video" || m.type === "gif") && m.url);
      if (media.length > 0) {
        const formats = media.map((m, idx) => {
          const h = typeof m.size?.height === "number" ? m.size.height : 720;
          return {
            id: `x-${idx}`,
            ext: "mp4",
            quality: `${h}p`,
            height: h,
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
          extractor: "XClientFallback",
          duration: null,
          thumbnail: media[0].thumbnail_url || null,
          formats,
        };
      }
    }
  } catch {
    /* fallback to fxtwitter */
  }
  try {
    const fxRes = await fetch(`https://api.fxtwitter.com/i/status/${tweetId}`, {
      headers: { Accept: "application/json" },
    });
    if (fxRes.ok) {
      const fxData = await fxRes.json();
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
            extractor: "XClientFallback",
            duration: typeof videos[0].duration === "number" ? Math.round(videos[0].duration) : null,
            thumbnail: videos[0].thumbnail_url || null,
            formats,
          };
        }
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

async function probeYouTubeFromClient(videoId) {
  if (!videoId) return null;
  for (const inst of CLIENT_YOUTUBE_APIS) {
    const endpoint =
      inst.kind === "piped"
        ? `${inst.base}/streams/${videoId}`
        : `${inst.base}/api/v1/videos/${videoId}`;
    try {
      const resp = await fetch(endpoint, { headers: { Accept: "application/json" } });
      if (!resp.ok) continue;
      const data = await resp.json();
      const formats = [];
      if (inst.kind === "piped") {
        (data.videoStreams || []).forEach((vs, idx) => {
          if (!vs || typeof vs.url !== "string") return;
          const height = typeof vs.height === "number" ? vs.height : 720;
          const ext = String(vs.mimeType || "").includes("webm") ? "webm" : "mp4";
          formats.push({
            id: String(vs.itag || `v${idx}`),
            ext,
            quality: `${height}p`,
            height,
            filesize: typeof vs.contentLength === "number" ? vs.contentLength : null,
            hasVideo: true,
            hasAudio: !vs.videoOnly,
            format: `${height}p (${ext})`,
            directUrl: vs.url,
          });
        });
        (data.audioStreams || []).forEach((aus, idx) => {
          if (!aus || typeof aus.url !== "string") return;
          const ext = String(aus.mimeType || "").includes("mp4") ? "m4a" : "webm";
          formats.push({
            id: String(aus.itag || `a${idx}`),
            ext,
            quality: "Audio",
            height: null,
            filesize: typeof aus.contentLength === "number" ? aus.contentLength : null,
            hasVideo: false,
            hasAudio: true,
            format: `Audio (${ext})`,
            directUrl: aus.url,
          });
        });
      } else {
        [...(data.formatStreams || []), ...(data.adaptiveFormats || [])].forEach((fs, idx) => {
          if (!fs || typeof fs.url !== "string") return;
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
            filesize: null,
            hasVideo: !isAudio,
            hasAudio: true,
            format: isAudio ? `Audio (${ext})` : `${height}p (${ext})`,
            directUrl: fs.url,
          });
        });
      }
      if (formats.length > 0) {
        return {
          probeId: `client-${videoId}`,
          title: String(data.title || "YouTube Video").slice(0, 200),
          uploader: String(data.uploader || data.author || "YouTube").slice(0, 120),
          extractor: "YoutubeClientFallback",
          duration: typeof data.duration === "number" ? data.duration : null,
          formats,
        };
      }
    } catch {
      /* continue to next residential-reachable instance */
    }
  }
  return null;
}

function getCsrfToken() {
  if (cachedCsrfToken) return cachedCsrfToken;
  const meta = document.querySelector('meta[name="vidnest-csrf"]');
  const content = meta ? (meta.getAttribute("content") || "").trim() : "";
  if (content && content !== "__VIDNEST_CSRF_TOKEN__") {
    cachedCsrfToken = content;
    return content;
  }
  return "";
}

async function ensureCsrfToken() {
  const existing = getCsrfToken();
  if (existing) return existing;
  const bases = activeApiBase === BRIDGE_API_BASE ? [activeApiBase] : [activeApiBase, BRIDGE_API_BASE];
  for (const base of bases) {
    try {
      const response = await fetch(`${base}/api/session`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) continue;
      const data = await response.json();
      if (data && typeof data.csrfToken === "string" && data.csrfToken) {
        activeApiBase = base;
        cachedCsrfToken = data.csrfToken;
        const meta = document.querySelector('meta[name="vidnest-csrf"]');
        if (meta) meta.setAttribute("content", data.csrfToken);
        return data.csrfToken;
      }
    } catch {
      /* try bridge base next */
    }
  }
  throw new Error(t("genericError"));
}

function buildFileUrl(fileName) {
  if (/^https?:\/\//i.test(fileName)) return fileName;
  return `${activeApiBase}/files/${encodeURIComponent(fileName)}`;
}

function setMessage(textMsg, isError = false) {
  if (!message) return;
  message.textContent = textMsg;
  message.dataset.error = isError ? "true" : "false";
}

function showToast(toastText) {
  const region = $("toast-region");
  if (!region) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = toastText;
  region.replaceChildren(toast);
  setTimeout(() => {
    toast.classList.add("toast-out");
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 240);
  }, 2200);
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "--:--";
  const sec = Math.floor(seconds % 60);
  const min = Math.floor((seconds / 60) % 60);
  const hrs = Math.floor(seconds / 3600);
  if (hrs > 0) {
    return `${hrs}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function formatSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size < 10 && unit > 0 ? size.toFixed(1) : Math.round(size)} ${units[unit]}`;
}

function detectPlatform(urlString) {
  if (!urlString || typeof urlString !== "string") return null;
  let host = "";
  try {
    const parsed = new URL(urlString.trim());
    host = parsed.hostname.toLowerCase();
  } catch {
    return null;
  }
  if (host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtu.be") return "youtube";
  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "tiktok";
  if (host === "instagram.com" || host.endsWith(".instagram.com")) return "instagram";
  if (host === "x.com" || host.endsWith(".x.com") || host === "twitter.com" || host.endsWith(".twitter.com")) return "x";
  if (host === "facebook.com" || host.endsWith(".facebook.com") || host === "fb.com" || host === "fb.watch") return "facebook";
  if (host === "vimeo.com" || host.endsWith(".vimeo.com")) return "vimeo";
  if (host === "soundcloud.com" || host.endsWith(".soundcloud.com")) return "soundcloud";
  return "universal";
}

function updatePlatformChips() {
  const currentUrl = input ? input.value.trim() : "";
  const detected = detectPlatform(currentUrl);
  document.querySelectorAll(".chip").forEach((chip) => {
    const platform = chip.dataset.platform;
    const isMatch = Boolean(detected && (platform === detected || (detected !== "universal" && platform === detected)));
    chip.classList.toggle("active", isMatch);
  });
}

function updateInspect() {
  const val = input ? input.value.trim() : "";
  const hasText = val.length > 0;
  if (clearUrlButton) clearUrlButton.hidden = !hasText;
  if (pasteButton) pasteButton.hidden = hasText;
  const isReady = val.length >= 8 && val.startsWith("https://");
  if (inspectButton) inspectButton.disabled = requestInProgress || !isReady;
  if (quickButton) quickButton.disabled = !isReady;
  updatePlatformChips();
}

function resetFormats() {
  probe = null;
  selectedFormat = null;
  const panel = $("formats-panel");
  if (panel) panel.hidden = true;
  const playerContainer = $("preview-player-container");
  if (playerContainer) {
    playerContainer.replaceChildren();
    playerContainer.hidden = true;
  }
  const previewThumbnail = $("preview-thumbnail");
  if (previewThumbnail) previewThumbnail.hidden = false;
  const thumbImg = $("preview-thumb-img");
  if (thumbImg) {
    thumbImg.hidden = true;
    thumbImg.removeAttribute("src");
  }
  const playBtn = $("preview-play-btn");
  if (playBtn) playBtn.hidden = true;
}

function createSvgIcon(iconId) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "icon");
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", `#i-${iconId}`);
  svg.append(use);
  return svg;
}

// Navigation & Pill Indicator
function setView(viewName) {
  activeView = viewName;
  const views = ["home", "downloads", "library"];
  const viewIndex = views.indexOf(viewName);

  document.querySelectorAll(".view").forEach((v) => {
    const isTarget = v.id === `view-${viewName}`;
    v.classList.toggle("active", isTarget);
    if (isTarget) {
      v.removeAttribute("hidden");
    } else {
      v.setAttribute("hidden", "");
    }
  });

  document.querySelectorAll(".nav-tab").forEach((tab) => {
    const isTarget = tab.dataset.view === viewName;
    tab.classList.toggle("active", isTarget);
    if (isTarget) {
      tab.setAttribute("aria-current", "page");
    } else {
      tab.removeAttribute("aria-current");
    }
  });

  if (navIndicator && viewIndex >= 0) {
    navIndicator.style.insetInlineStart = `calc(6px + ${viewIndex} * (100% - 12px) / 3)`;
  }

  if (viewName === "downloads") {
    renderDownloads();
  } else if (viewName === "library") {
    renderLibrary();
  }
}

function pickBestFormatOption(formats, platform) {
  if (!Array.isArray(formats) || formats.length === 0) return null;
  if (platform === "soundcloud") {
    const audio = formats.find((f) => !f.hasVideo && /^(mp3|m4a|aac|wav)$/i.test(f.ext || "")) ||
                  formats.find((f) => !f.hasVideo) || formats[0];
    return audio ? audio.id : formats[0].id;
  }
  // Video platforms: prioritize highest HD mp4 with audio
  const hdWithAudio = formats
    .filter((f) => f.hasVideo && f.hasAudio && f.ext === "mp4")
    .sort((a, b) => (b.height || 0) - (a.height || 0));
  if (hdWithAudio.length > 0) return hdWithAudio[0].id;

  const anyHdVideo = formats
    .filter((f) => f.hasVideo)
    .sort((a, b) => (b.height || 0) - (a.height || 0));
  if (anyHdVideo.length > 0) return anyHdVideo[0].id;

  return formats[0].id;
}

// Render Formats Radiogroup
function renderFormats(result) {
  const list = $("format-list");
  if (!list) return;
  list.replaceChildren();

  const titleEl = $("media-title");
  if (titleEl) titleEl.textContent = result.title || "";

  const metaEl = $("media-meta");
  if (metaEl) {
    const parts = [result.uploader, result.extractor].filter(Boolean);
    metaEl.textContent = parts.join(" · ");
  }

  const durationEl = $("preview-duration");
  if (durationEl) {
    durationEl.textContent = formatDuration(result.duration);
  }

  const thumbEl = $("preview-thumbnail");
  if (thumbEl) {
    thumbEl.style.removeProperty("background");
  }

  const thumbImg = $("preview-thumb-img");
  if (thumbImg) {
    if (result.thumbnail) {
      thumbImg.src = result.thumbnail;
      thumbImg.hidden = false;
    } else {
      thumbImg.hidden = true;
      thumbImg.removeAttribute("src");
    }
  }

  const filtered = result.formats.filter((format) => {
    if (activeFilter === "video") return format.hasVideo;
    if (activeFilter === "audio") return !format.hasVideo;
    return true;
  });

  const countEl = $("format-count");
  if (countEl) {
    countEl.textContent = typeof t("countText") === "function" ? t("countText")(filtered.length) : `${filtered.length}`;
  }

  if (filtered.length === 0) {
    const emptyNotice = document.createElement("p");
    emptyNotice.className = "message-banner";
    emptyNotice.dataset.error = "false";
    emptyNotice.textContent = t("noFilteredFormats");
    list.append(emptyNotice);
    selectedFormat = null;
    if (downloadButton) downloadButton.disabled = true;
    $("formats-panel").hidden = false;
    return;
  }

  const platform = detectPlatform(result.url || (input ? input.value : ""));
  if (!selectedFormat || !filtered.some((f) => f.id === selectedFormat)) {
    selectedFormat = pickBestFormatOption(filtered, platform) || filtered[0].id;
  }

  filtered.forEach((format) => {
    const wrapper = document.createElement("label");
    wrapper.className = "format-option";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "media-format";
    radio.value = format.id;
    radio.checked = format.id === selectedFormat;

    const card = document.createElement("span");
    card.className = "format-card";

    const main = document.createElement("span");
    main.className = "format-main";

    const qualityText = document.createElement("span");
    qualityText.className = "format-quality";
    qualityText.textContent = format.hasVideo ? (format.quality || "Video") : t("audioOnly");

    const details = document.createElement("span");
    details.className = "format-details";
    const audioDetail = format.hasVideo ? (format.hasAudio ? t("hasAudio") : t("videoOnly")) : "";
    details.textContent = [format.ext ? format.ext.toUpperCase() : "", audioDetail].filter(Boolean).join(" · ");

    main.append(qualityText, details);

    const size = document.createElement("span");
    size.className = "format-size";
    size.textContent = formatSize(format.filesize);

    card.append(main, size);
    wrapper.append(radio, card);

    radio.addEventListener("change", () => {
      selectedFormat = format.id;
      if (downloadButton) downloadButton.disabled = !selectedFormat;
    });

    list.append(wrapper);
  });

  // Setup inline player
  const playerContainer = $("preview-player-container");
  const playBtn = $("preview-play-btn");

  if (playerContainer) {
    playerContainer.hidden = true;
    playerContainer.replaceChildren();
  }

  function getActiveDirectStream() {
    const chosen = result.formats.find((f) => f.id === selectedFormat);
    if (chosen && chosen.directUrl) return { url: chosen.directUrl, isAudio: !chosen.hasVideo };
    const anyDirect = result.formats.find((f) => f.directUrl);
    if (anyDirect) return { url: anyDirect.directUrl, isAudio: !anyDirect.hasVideo };
    return null;
  }

  function renderInlinePlayer(streamInfo) {
    if (!playerContainer || !streamInfo) return;
    playerContainer.replaceChildren();
    if (streamInfo.isAudio) {
      const audioEl = document.createElement("audio");
      audioEl.controls = true;
      audioEl.playsInline = true;
      audioEl.preload = "metadata";
      audioEl.src = streamInfo.url;
      audioEl.autoplay = true;
      playerContainer.append(audioEl);
    } else {
      const videoEl = document.createElement("video");
      videoEl.controls = true;
      videoEl.playsInline = true;
      videoEl.preload = "metadata";
      videoEl.src = streamInfo.url;
      videoEl.autoplay = true;
      playerContainer.append(videoEl);
    }
    if (thumbEl) thumbEl.hidden = true;
    playerContainer.hidden = false;
  }

  const directInfo = getActiveDirectStream();
  if (playBtn) {
    if (directInfo) {
      playBtn.hidden = false;
      playBtn.onclick = (e) => {
        e.stopPropagation();
        renderInlinePlayer(getActiveDirectStream());
      };
    } else {
      playBtn.hidden = true;
    }
  }

  if (thumbEl) {
    thumbEl.hidden = false;
    thumbEl.onclick = () => {
      const info = getActiveDirectStream();
      if (info) renderInlinePlayer(info);
    };
  }

  if (downloadButton) downloadButton.disabled = !selectedFormat;
  const panel = $("formats-panel");
  if (panel) {
    panel.hidden = false;
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function setFilter(filterType) {
  activeFilter = filterType;
  [filterAllButton, filterVideoButton, filterAudioButton].forEach((btn) => {
    if (!btn) return;
    const isTarget = btn.dataset.filter === filterType;
    btn.classList.toggle("active", isTarget);
    btn.setAttribute("aria-selected", isTarget ? "true" : "false");
  });
  if (probe) {
    renderFormats(probe);
  }
}

// Media Row Builder (Home Recent, Downloads, Library)
function createMediaRow(item, isActiveDownloading = false, stageText = "") {
  const row = document.createElement("div");
  row.className = "media-row";
  row.style.flexDirection = "column";
  row.style.alignItems = "stretch";

  const topWrap = document.createElement("div");
  topWrap.style.display = "flex";
  topWrap.style.alignItems = "center";
  topWrap.style.gap = "12px";
  topWrap.style.width = "100%";

  const thumb = document.createElement("div");
  thumb.className = "media-thumb";
  if (item.thumbnail) {
    const tImg = document.createElement("img");
    tImg.className = "media-thumb-img";
    tImg.referrerPolicy = "no-referrer";
    tImg.src = item.thumbnail;
    tImg.alt = "";
    thumb.append(tImg);
  }
  thumb.append(createSvgIcon(item.kind === "audio" ? "play" : "play"));

  const content = document.createElement("div");
  content.className = "media-content";

  const title = document.createElement("span");
  title.className = "media-row-title";
  title.textContent = item.title;

  const meta = document.createElement("span");
  meta.className = "media-row-meta";
  const metaParts = [item.source || "VidNest"];
  if (item.size) metaParts.push(item.size);
  meta.textContent = metaParts.join(" · ");

  content.append(title, meta);
  topWrap.append(thumb, content);

  if (isActiveDownloading) {
    const progWrap = document.createElement("div");
    progWrap.className = "progress-bar-wrap";

    const track = document.createElement("div");
    track.className = "progress-track";

    const ind = document.createElement("div");
    ind.className = "progress-indeterminate";
    track.append(ind);

    const stageEl = document.createElement("div");
    stageEl.className = "progress-stage-text";
    stageEl.textContent = stageText || t("downloadingStage");

    progWrap.append(track, stageEl);
    content.append(progWrap);

    const badge = document.createElement("span");
    badge.className = "media-row-badge badge-soft";
    const spinner = document.createElement("span");
    spinner.className = "btn-spinner";
    badge.append(spinner);
    topWrap.append(badge);
    row.append(topWrap);
  } else {
    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.alignItems = "center";
    actions.style.gap = "8px";

    const previewBtn = document.createElement("button");
    previewBtn.className = "media-preview-btn";
    previewBtn.type = "button";
    previewBtn.setAttribute("aria-label", "معاينة");
    previewBtn.append(createSvgIcon("play"));

    const badge = document.createElement("a");
    badge.className = "media-row-badge badge-mint badge-link";
    badge.href = buildFileUrl(item.file);
    badge.download = "";
    badge.setAttribute("aria-label", t("saveFile"));
    badge.append(createSvgIcon("check"));

    actions.append(previewBtn, badge);
    topWrap.append(actions);
    row.append(topWrap);

    const inlinePreviewWrap = document.createElement("div");
    inlinePreviewWrap.className = "media-row-preview";
    inlinePreviewWrap.hidden = true;
    row.append(inlinePreviewWrap);

    let isPlaying = false;
    function togglePreview() {
      isPlaying = !isPlaying;
      if (isPlaying) {
        inlinePreviewWrap.replaceChildren();
        const fileUrl = buildFileUrl(item.file);
        if (item.kind === "audio") {
          const audioEl = document.createElement("audio");
          audioEl.controls = true;
          audioEl.playsInline = true;
          audioEl.preload = "metadata";
          audioEl.src = fileUrl;
          audioEl.autoplay = true;
          inlinePreviewWrap.append(audioEl);
        } else {
          const videoEl = document.createElement("video");
          videoEl.controls = true;
          videoEl.playsInline = true;
          videoEl.preload = "metadata";
          videoEl.src = fileUrl;
          videoEl.autoplay = true;
          inlinePreviewWrap.append(videoEl);
        }
        inlinePreviewWrap.hidden = false;
      } else {
        inlinePreviewWrap.replaceChildren();
        inlinePreviewWrap.hidden = true;
      }
    }

    previewBtn.addEventListener("click", togglePreview);
    thumb.addEventListener("click", togglePreview);
  }

  return row;
}

function renderHomeRecent() {
  const container = $("home-recent-list");
  if (!container) return;
  container.replaceChildren();

  const slice = recent.slice(0, 2);
  if (slice.length === 0) {
    const emptyNotice = document.createElement("p");
    emptyNotice.className = "empty-state";
    emptyNotice.textContent = t("emptyDownloads");
    container.append(emptyNotice);
    return;
  }

  slice.forEach((item) => {
    container.append(createMediaRow(item));
  });
}

function renderDownloads() {
  const container = $("downloads-list");
  if (!container) return;
  container.replaceChildren();

  if (activeJob) {
    container.append(createMediaRow(activeJob, true, activeJob.stage));
  }

  if (recent.length === 0 && !activeJob) {
    const emptyNotice = document.createElement("div");
    emptyNotice.className = "empty-state";
    emptyNotice.append(createSvgIcon("down"));
    const p = document.createElement("p");
    p.textContent = t("emptyDownloads");
    emptyNotice.append(p);
    container.append(emptyNotice);
    return;
  }

  recent.forEach((item) => {
    container.append(createMediaRow(item));
  });
}

function renderLibrary() {
  const grid = $("library-grid");
  if (!grid) return;
  grid.replaceChildren();

  if (recent.length === 0) {
    const emptyNotice = document.createElement("div");
    emptyNotice.className = "empty-state";
    emptyNotice.append(createSvgIcon("lib"));
    const p = document.createElement("p");
    p.textContent = t("emptyLibrary");
    emptyNotice.append(p);
    grid.append(emptyNotice);
    return;
  }

  recent.forEach((item) => {
    const tile = document.createElement("a");
    tile.className = "library-tile";
    tile.href = buildFileUrl(item.file);
    tile.download = "";

    const thumb = document.createElement("div");
    thumb.className = "tile-thumb";
    thumb.append(createSvgIcon("play"));

    if (item.duration) {
      const dur = document.createElement("span");
      dur.className = "tile-duration";
      dur.textContent = item.duration;
      thumb.append(dur);
    }

    const title = document.createElement("h3");
    title.className = "tile-title";
    title.textContent = item.title;

    tile.append(thumb, title);
    grid.append(tile);
  });
}

let activeJob = null;

async function postJson(path, body) {
  if (path === "/api/download" && probe && Array.isArray(probe.formats)) {
    const matched = probe.formats.find((f) => f.id === body.formatId);
    if (matched && typeof matched.directUrl === "string" && matched.directUrl) {
      return { file: matched.directUrl, title: probe.title || "Media" };
    }
  }

  let csrfValue = "";
  try {
    csrfValue = await ensureCsrfToken();
  } catch {
    csrfValue = "";
  }

  const bases = activeApiBase === BRIDGE_API_BASE ? [activeApiBase] : [activeApiBase, BRIDGE_API_BASE];
  let lastError = null;

  for (const base of bases) {
    try {
      const response = await fetch(`${base}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-VidNest-CSRF": csrfValue,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json().catch(() => ({}));
      if (response.ok) {
        activeApiBase = base;
        return result;
      }
      lastError = new Error(typeof result.error === "string" ? result.error : t("genericError"));
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(t("genericError"));
    }
  }

  // Tier-3 Client-Side Multi-Provider Fallbacks (TikTok, X/Twitter, YouTube)
  const targetUrl = body && body.url ? body.url : "";
  const ytId = targetUrl ? extractYouTubeVideoId(targetUrl) : "";
  const isTikTok = targetUrl && isTikTokUrl(targetUrl);
  const isX = targetUrl && Boolean(extractTwitterStatusId(targetUrl));

  let clientProbe = null;
  if (isTikTok) {
    clientProbe = await probeTikTokFromClient(targetUrl);
  } else if (isX) {
    clientProbe = await probeTwitterFromClient(targetUrl);
  } else if (ytId) {
    clientProbe = await probeYouTubeFromClient(ytId);
  }

  if (clientProbe && Array.isArray(clientProbe.formats) && clientProbe.formats.length > 0) {
    if (path === "/api/formats") {
      return clientProbe;
    }
    if (path === "/api/quick-download" || path === "/api/download") {
      const chosen =
        body.mode === "audio"
          ? clientProbe.formats.find((f) => !f.hasVideo) || clientProbe.formats[0]
          : clientProbe.formats.find((f) => f.hasVideo) || clientProbe.formats[0];
      if (chosen && chosen.directUrl) {
        return { file: chosen.directUrl, title: clientProbe.title, formatId: chosen.id };
      }
    }
  }

  throw lastError || new Error(t("genericError"));
}

// Download Lifecycle with Staged Progress States
async function triggerDownloadExecution(payload, downloadTitle, downloadSource, durationText) {
  requestInProgress = true;
  updateInspect();

  activeJob = {
    title: downloadTitle || "Media",
    source: downloadSource || "VidNest",
    stage: t("analyzingStage"),
    duration: durationText || "",
  };

  showToast(t("successToast"));
  setView("downloads");

  // Advance stages cleanly without fake numbers
  const stageTimer1 = setTimeout(() => {
    if (activeJob) {
      activeJob.stage = t("downloadingStage");
      renderDownloads();
    }
  }, 700);

  const stageTimer2 = setTimeout(() => {
    if (activeJob) {
      activeJob.stage = t("finalizingStage");
      renderDownloads();
    }
  }, 2200);

  try {
    let result = null;
    if (selectedFormat && selectedFormat.directUrl && !payload.mode) {
      result = {
        file: selectedFormat.directUrl,
        title: downloadTitle || probe?.title || "Media",
        formatId: selectedFormat.id,
      };
    } else {
      const endpoint = payload.mode ? "/api/quick-download" : "/api/download";
      result = await postJson(endpoint, payload);
    }

    clearTimeout(stageTimer1);
    clearTimeout(stageTimer2);

    const savedItem = {
      title: (result.title || downloadTitle || "Media").slice(0, 200),
      file: result.file,
      kind: payload.mode === "audio" ? "audio" : "video",
      ts: Date.now(),
      duration: durationText || "",
      source: downloadSource || "VidNest",
    };

    activeJob = null;
    recent.unshift(savedItem);
    recent = recent.slice(0, 30);
    saveRecent();

    renderHomeRecent();
    renderDownloads();
    renderLibrary();

    // Trigger direct browser save
    const anchor = document.createElement("a");
    anchor.href = buildFileUrl(result.file);
    anchor.download = "";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();

    if (input) {
      input.value = "";
      updateInspect();
    }
    resetFormats();
    setMessage("");
  } catch (error) {
    clearTimeout(stageTimer1);
    clearTimeout(stageTimer2);
    activeJob = null;
    renderDownloads();
    const errMsg = error instanceof Error ? error.message : t("genericError");
    setMessage(errMsg, true);
    showToast(errMsg);
  } finally {
    requestInProgress = false;
    updateInspect();
  }
}

// Event Listeners
if (input) {
  input.addEventListener("input", () => {
    resetFormats();
    setMessage("");
    updateInspect();
  });
  input.addEventListener("paste", (e) => {
    const pasted = (e.clipboardData || window.clipboardData)?.getData("text");
    if (pasted) {
      const extracted = extractUrlFromText(pasted);
      if (extracted) {
        e.preventDefault();
        input.value = extracted;
        updateInspect();
        inspectFormats(extracted);
      }
    }
  });
}

if (clearUrlButton) {
  clearUrlButton.addEventListener("click", () => {
    if (!input) return;
    input.value = "";
    resetFormats();
    setMessage("");
    updateInspect();
    input.focus();
  });
}

if (pasteButton) {
  pasteButton.addEventListener("click", async () => {
    try {
      if (!input) return;
      const textFromClipboard = await navigator.clipboard.readText();
      const extracted = extractUrlFromText(textFromClipboard) || (textFromClipboard ? textFromClipboard.trim() : "");
      if (extracted) {
        input.value = extracted;
        updateInspect();
        input.focus();
        if (extracted.startsWith("https://")) {
          inspectFormats(extracted);
        }
      } else {
        input.value = "https://www.youtube.com/watch?v=aqz-KE-bpKQ";
        updateInspect();
        input.focus();
        inspectFormats(input.value);
      }
    } catch {
      if (input && !input.value.trim()) {
        input.value = "https://www.youtube.com/watch?v=aqz-KE-bpKQ";
        updateInspect();
        input.focus();
        inspectFormats(input.value);
      } else {
        setMessage(t("pasteDenied"), true);
      }
    }
  });
}

document.querySelectorAll(".chip").forEach((chip) => {
  if (chip.id === "more-platforms-btn") return;
  // Chips are shortcuts, not examples: they focus the field and say what to paste.
  chip.addEventListener("click", () => {
    if (!input) return;
    const name = (chip.textContent || "").trim();
    input.focus();
    setMessage(name ? `الصق رابط ${name} في الحقل أعلاه.` : "الصق الرابط في الحقل أعلاه.");
  });
});

const morePlatformsBtn = document.getElementById("more-platforms-btn");
const extraPlatformsDrawer = document.getElementById("extra-platforms");
if (morePlatformsBtn && extraPlatformsDrawer) {
  morePlatformsBtn.addEventListener("click", () => {
    const isHidden = extraPlatformsDrawer.hasAttribute("hidden");
    if (isHidden) {
      extraPlatformsDrawer.removeAttribute("hidden");
      morePlatformsBtn.setAttribute("aria-expanded", "true");
      morePlatformsBtn.innerHTML = `
        <svg class="chip-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 12h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        <span>إخفاء</span>
      `;
    } else {
      extraPlatformsDrawer.setAttribute("hidden", "");
      morePlatformsBtn.setAttribute("aria-expanded", "false");
      morePlatformsBtn.innerHTML = `
        <svg class="chip-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        <span>+1,800 المزيد</span>
      `;
    }
  });
}

if (themeToggleButton) {
  themeToggleButton.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    updateThemeColor(nextTheme);
    try {
      localStorage.setItem("vidnest-theme", nextTheme);
    } catch {
      /* storage fallback */
    }
  });
}

function updateThemeColor(activeTheme) {
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute(
      "content",
      activeTheme === "dark" ? "#101828" : "#FFFFFF"
    );
  }
}

function applyLanguage() {
  document.documentElement.lang = t("lang");
  document.documentElement.dir = t("dir");

  document.querySelectorAll("[data-copy]").forEach((el) => {
    const key = el.dataset.copy;
    const val = t(key);
    if (typeof val === "string") {
      el.textContent = val;
    }
  });

  document.querySelectorAll("[data-aria-label]").forEach((el) => {
    const key = el.dataset.ariaLabel;
    const val = t(key);
    if (typeof val === "string") el.setAttribute("aria-label", val);
  });

  if (languageButton) languageButton.textContent = t("switch");
  if (input) input.setAttribute("placeholder", t("urlPlaceholder"));

  renderHomeRecent();
  renderDownloads();
  renderLibrary();
  if (probe) renderFormats(probe);
}

if (languageButton) {
  languageButton.addEventListener("click", () => {
    language = language === "ar" ? "en" : "ar";
    try {
      localStorage.setItem("vidnest-lang", language);
    } catch {
      /* storage fallback */
    }
    applyLanguage();
  });
}

if (filterAllButton) filterAllButton.addEventListener("click", () => setFilter("all"));
if (filterVideoButton) filterVideoButton.addEventListener("click", () => setFilter("video"));
if (filterAudioButton) filterAudioButton.addEventListener("click", () => setFilter("audio"));

document.querySelectorAll(".nav-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.view;
    if (target) setView(target);
  });
});

const viewAllLink = $("view-all-downloads-link");
if (viewAllLink) {
  viewAllLink.addEventListener("click", () => setView("downloads"));
}

const clearDownloadsBtn = $("clear-downloads-btn");
if (clearDownloadsBtn) {
  clearDownloadsBtn.addEventListener("click", () => {
    if (!window.confirm(t("clearConfirm"))) return;
    recent = [];
    saveRecent();
    renderHomeRecent();
    renderDownloads();
    renderLibrary();
  });
}

// Format Inspection
async function inspectFormats(targetUrl) {
  if (requestInProgress) return;

  const url = typeof targetUrl === "string" && targetUrl.trim()
    ? targetUrl.trim()
    : (input ? input.value.trim() : "");
  if (!url) {
    setMessage(t("empty"), true);
    return;
  }

  requestInProgress = true;
  if (inspectButton) {
    inspectButton.setAttribute("aria-busy", "true");
    const sp = inspectButton.querySelector(".btn-spinner");
    if (sp) sp.hidden = false;
    const tx = inspectButton.querySelector(".btn-text");
    if (tx) tx.textContent = t("inspecting");
  }
  updateInspect();
  resetFormats();
  setMessage("");

  try {
    const candidates = [];
    if (isTikTokUrl(url)) {
      candidates.push(probeTikTokFromClient(url));
    }
    if (extractTwitterStatusId(url)) {
      candidates.push(probeTwitterFromClient(url));
    }
    if (extractYouTubeVideoId(url)) {
      candidates.push(probeYouTubeFromClient(url));
    }
    candidates.push(postJson("/api/formats", { url }));

    const validCandidates = candidates.map((p) =>
      Promise.resolve(p).then((res) => {
        if (!res || !Array.isArray(res.formats) || res.formats.length === 0 || typeof res.probeId !== "string") {
          throw new Error(t("noFormats"));
        }
        return res;
      })
    );

    const result = await Promise.any(validCandidates);
    probe = { ...result, url };
    requestInProgress = false;
    renderFormats(probe);
  } catch (error) {
    setMessage(error instanceof Error ? error.message : t("genericError"), true);
  } finally {
    requestInProgress = false;
    if (downloadButton && selectedFormat) {
      downloadButton.disabled = false;
    }
    if (inspectButton) {
      inspectButton.removeAttribute("aria-busy");
      const sp = inspectButton.querySelector(".btn-spinner");
      if (sp) sp.hidden = true;
      const tx = inspectButton.querySelector(".btn-text");
      if (tx) tx.textContent = t("inspect");
    }
    updateInspect();
  }
}

// Form Submit: Format Probe
if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    inspectFormats();
  });
}

// Share Target Query Parameter Handling
function handleInitialShareTarget() {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("url") || params.get("text") || params.get("title") || "";
    if (raw) {
      const extracted = extractUrlFromText(raw) || (raw.startsWith("https://") ? raw.trim() : null);
      if (extracted && input) {
        input.value = extracted;
        updateInspect();
        input.focus();
        inspectFormats(extracted);
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
  } catch {
    /* ignore search params */
  }
}

// Direct / Quick Download Button
if (quickButton) {
  quickButton.addEventListener("click", async () => {
    const url = input ? input.value.trim() : "";
    if (requestInProgress || !url) {
      setMessage(t("empty"), true);
      return;
    }
    const detected = detectPlatform(url) || "universal";
    await triggerDownloadExecution(
      { url, mode: "video" },
      url.split("/").filter(Boolean).pop() || "Media",
      detected,
      ""
    );
  });
}

// Download Selected Format
if (downloadButton) {
  downloadButton.addEventListener("click", async () => {
    if (!probe || !selectedFormat || requestInProgress) return;
    const chosenFormat = probe.formats.find((f) => f.id === selectedFormat);
    await triggerDownloadExecution(
      {
        url: probe.url,
        probeId: probe.probeId,
        formatId: selectedFormat,
      },
      probe.title,
      probe.uploader || probe.extractor,
      formatDuration(probe.duration)
    );
  });
}

// IntersectionObserver for Section Reveal
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll(".step-card, .feature-card, .faq-item, .apk-banner").forEach((el) => {
    observer.observe(el);
  });
}

// Initial setup
document.documentElement.setAttribute("data-theme", theme);
updateThemeColor(theme);
applyLanguage();
updateInspect();
setView("home");
handleInitialShareTarget();
