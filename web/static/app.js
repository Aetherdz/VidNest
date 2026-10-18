"use strict";

const copy = {
  ar: {
    lang: "ar", dir: "rtl", switch: "EN", localBadge: "محلي وخاص",
    eyebrow: "مساحة بسيطة لوسائطك", headline: "اختر ما يناسبك.", headlineAccent: "واحتفظ به.",
    intro: "الصق رابطًا عامًا، استعرض الجودات المتاحة، ثم نزّل النسخة التي تريدها.", urlLabel: "رابط الفيديو",
    paste: "لصق", inspect: "استعراض الجودات", inspecting: "جارٍ فحص الرابط…", availableLabel: "متاح لهذا الرابط",
    formatsTitle: "اختر الجودة", download: "تنزيل الاختيار", downloading: "جارٍ تجهيز التنزيل…",
    formatFootnote: "الجودات المعروضة يحددها المصدر، وقد تختلف حسب الرابط.",
    privacy: "المعالجة على جهازك. نزّل فقط المحتوى الذي تملك الإذن بحفظه.",
    recent: "آخر الملفات", clear: "مسح السجل", save: "حفظ الملف", footer: "مصمم لحفظ ما يستحق العودة إليه.",
    success: "اكتمل التنزيل. الملف متاح في القائمة أدناه.", pasteDenied: "تعذّر الوصول إلى الحافظة. الصق الرابط يدويًا.",
    genericError: "تعذّر إكمال الطلب. تحقق من الرابط وحاول مجددًا.", empty: "أدخل رابط فيديو أولًا.",
    noFormats: "لم يعرض هذا الرابط جودات قابلة للتنزيل.", clearConfirm: "مسح قائمة الملفات الأخيرة؟",
    count: (n) => `${n} جودة`, audio: "صوت فقط", hasAudio: "صوت مضمّن", videoOnly: "فيديو — سيضاف أفضل صوت متاح",
  },
  en: {
    lang: "en", dir: "ltr", switch: "عربي", localBadge: "Local & private",
    eyebrow: "A simpler place for your media", headline: "Pick what fits.", headlineAccent: "Keep it close.",
    intro: "Paste a public link, inspect the available qualities, then download the version you want.", urlLabel: "Video link",
    paste: "Paste", inspect: "Show available qualities", inspecting: "Inspecting link…", availableLabel: "Available for this link",
    formatsTitle: "Choose quality", download: "Download selection", downloading: "Preparing download…",
    formatFootnote: "Qualities are provided by the source and vary by link.",
    privacy: "Processed on this device. Only save content you have permission to download.",
    recent: "Recent files", clear: "Clear history", save: "Save file", footer: "Made for the things worth keeping.",
    success: "Download complete. Your file is listed below.", pasteDenied: "Clipboard access was denied. Paste the link manually.",
    genericError: "The request failed. Check the link and try again.", empty: "Enter a video link first.",
    noFormats: "No downloadable qualities were returned for this link.", clearConfirm: "Clear recent files?",
    count: (n) => `${n} qualities`, audio: "Audio only", hasAudio: "Audio included", videoOnly: "Video — best available audio will be added",
  },
};

const $ = (id) => document.getElementById(id);
const form = $("download-form");
const input = $("url");
const inspectButton = $("inspect");
const downloadButton = $("download");
const message = $("message");
let language = localStorage.getItem("vidnest-language") === "en" ? "en" : "ar";
let recent = readRecent();
let probe = null;
let selectedFormat = null;
let requestInProgress = false;

function text(key) { return copy[language][key]; }
function readRecent() {
  try {
    const value = JSON.parse(localStorage.getItem("vidnest-recent") || "[]");
    return Array.isArray(value) ? value.filter((item) => item && typeof item.file === "string" && typeof item.title === "string").slice(0, 20) : [];
  } catch { return []; }
}
function saveRecent() {
  try { localStorage.setItem("vidnest-recent", JSON.stringify(recent)); } catch { /* optional storage */ }
}
function setMessage(value, error = false) {
  message.textContent = value;
  message.dataset.error = error ? "true" : "false";
}
function formatSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) { size /= 1024; unit += 1; }
  return `${size < 10 && unit > 0 ? size.toFixed(1) : Math.round(size)} ${units[unit]}`;
}
function renderRecent() {
  const section = $("recent-section");
  const list = $("recent-list");
  list.replaceChildren();
  section.hidden = recent.length === 0;
  recent.forEach((item) => {
    const row = document.createElement("li");
    row.className = "recent-item";
    const title = document.createElement("span");
    title.className = "recent-title";
    title.textContent = item.title;
    const link = document.createElement("a");
    link.className = "save-link";
    link.href = `/files/${encodeURIComponent(item.file)}`;
    link.download = "";
    link.textContent = text("save");
    row.append(title, link);
    list.append(row);
  });
}
function renderFormats(result) {
  const list = $("format-list");
  list.replaceChildren();
  $("media-title").textContent = result.title || "";
  $("format-count").textContent = text("count")(result.formats.length);
  result.formats.forEach((format, index) => {
    const wrapper = document.createElement("label");
    wrapper.className = "format-option";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "format";
    radio.value = format.id;
    radio.checked = index === 0;
    const card = document.createElement("span");
    card.className = "format-card";
    const main = document.createElement("span");
    main.className = "format-main";
    const quality = document.createElement("span");
    quality.className = "format-quality";
    quality.textContent = format.hasVideo ? format.quality : text("audio");
    const details = document.createElement("span");
    details.className = "format-details";
    const audioDetail = format.hasVideo ? (format.hasAudio ? text("hasAudio") : text("videoOnly")) : "";
    details.textContent = [format.ext.toUpperCase(), audioDetail, format.format].filter(Boolean).join(" · ");
    main.append(quality, details);
    const size = document.createElement("span");
    size.className = "format-size";
    size.textContent = formatSize(format.filesize);
    card.append(main, size);
    wrapper.append(radio, card);
    radio.addEventListener("change", () => {
      selectedFormat = format.id;
      downloadButton.disabled = requestInProgress || !selectedFormat;
    });
    list.append(wrapper);
  });
  selectedFormat = result.formats[0]?.id || null;
  downloadButton.disabled = !selectedFormat;
  $("formats-panel").hidden = false;
}
function applyLanguage() {
  document.documentElement.lang = text("lang");
  document.documentElement.dir = text("dir");
  document.querySelectorAll("[data-copy]").forEach((element) => {
    const key = element.dataset.copy;
    if (typeof copy[language][key] === "string") element.textContent = text(key);
  });
  $("language").textContent = text("switch");
  $("paste").setAttribute("aria-label", text("paste"));
  renderRecent();
  if (probe) renderFormats(probe);
}
function updateInspect() {
  inspectButton.disabled = requestInProgress || input.value.trim().length < 8;
}
function resetFormats() {
  probe = null;
  selectedFormat = null;
  $("formats-panel").hidden = true;
}
async function postJson(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-VidNest-CSRF": document.querySelector('meta[name="vidnest-csrf"]').content,
    },
    body: JSON.stringify(body),
  });
  let result;
  try { result = await response.json(); } catch { throw new Error(text("genericError")); }
  if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : text("genericError"));
  return result;
}

input.addEventListener("input", () => {
  resetFormats();
  setMessage("");
  updateInspect();
});
$("language").addEventListener("click", () => {
  language = language === "ar" ? "en" : "ar";
  try { localStorage.setItem("vidnest-language", language); } catch { /* optional storage */ }
  applyLanguage();
});
$("paste").addEventListener("click", async () => {
  try {
    input.value = await navigator.clipboard.readText();
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  } catch { setMessage(text("pasteDenied"), true); }
});
$("clear-recent").addEventListener("click", () => {
  if (!window.confirm(text("clearConfirm"))) return;
  recent = [];
  saveRecent();
  renderRecent();
});
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (requestInProgress) return;
  const url = input.value.trim();
  if (!url) { setMessage(text("empty"), true); return; }
  requestInProgress = true;
  inspectButton.setAttribute("aria-busy", "true");
  inspectButton.querySelector("span").textContent = text("inspecting");
  updateInspect();
  resetFormats();
  setMessage("");
  try {
    const result = await postJson("/api/formats", { url });
    if (!Array.isArray(result.formats) || result.formats.length === 0 || typeof result.probeId !== "string") {
      throw new Error(text("noFormats"));
    }
    probe = { ...result, url };
    renderFormats(probe);
  } catch (error) {
    setMessage(error instanceof Error ? error.message : text("genericError"), true);
  } finally {
    requestInProgress = false;
    inspectButton.removeAttribute("aria-busy");
    inspectButton.querySelector("span").textContent = text("inspect");
    updateInspect();
  }
});
downloadButton.addEventListener("click", async () => {
  if (!probe || !selectedFormat || requestInProgress) return;
  requestInProgress = true;
  downloadButton.disabled = true;
  downloadButton.setAttribute("aria-busy", "true");
  downloadButton.querySelector("span").textContent = text("downloading");
  setMessage("");
  try {
    const result = await postJson("/api/download", {
      url: probe.url,
      probeId: probe.probeId,
      formatId: selectedFormat,
    });
    if (typeof result.file !== "string" || typeof result.title !== "string") throw new Error(text("genericError"));
    recent.unshift({ title: result.title.slice(0, 200), file: result.file });
    recent = recent.slice(0, 20);
    saveRecent();
    renderRecent();
    setMessage(text("success"));
    const anchor = document.createElement("a");
    anchor.href = `/files/${encodeURIComponent(result.file)}`;
    anchor.download = "";
    anchor.click();
  } catch (error) {
    setMessage(error instanceof Error ? error.message : text("genericError"), true);
  } finally {
    requestInProgress = false;
    downloadButton.removeAttribute("aria-busy");
    downloadButton.querySelector("span").textContent = text("download");
    downloadButton.disabled = !selectedFormat;
  }
});

applyLanguage();
updateInspect();
