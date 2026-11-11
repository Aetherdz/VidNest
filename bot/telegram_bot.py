"""VidNest Telegram bot.

Bilingual (Arabic-first / English) companion for the VidNest web companion.
The module can be driven in two ways:

* Webhook mode via :func:`handle_webhook_update`, which ``web/app.py`` calls
  from ``POST /api/telegram/webhook`` after the secret header has been
  verified.
* Standalone polling mode via :func:`run_polling`, using
  ``TELEGRAM_BOT_TOKEN`` from the environment.

Media URLs are checked with the exact same ``validate_media_url`` helper the
web app uses, so the bot never becomes an SSRF bypass.  Only formats that fit
inside Telegram's Bot API upload cap are offered, and the size is checked
again after downloading, immediately before the upload.

Design credit: Atheerium (https://atheerium.com).
"""

from __future__ import annotations

import json
import ipaddress
import logging
import os
import re
import shutil
import sys
import tempfile
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from inspect import Parameter, signature
from pathlib import Path
from typing import Any, Callable, Iterable

LOGGER = logging.getLogger("vidnest.telegram_bot")

# ---------------------------------------------------------------------------
# Web URL validation (shared with the Flask app, never re-implemented).
# ---------------------------------------------------------------------------
_PROJECT_ROOT = Path(__file__).resolve().parent.parent
_WEB_DIR = _PROJECT_ROOT / "web"
if str(_WEB_DIR) not in sys.path:
    sys.path.insert(0, str(_WEB_DIR))

try:  # ``web/`` is on sys.path, so the plain module import is the reliable one.
    import netguard  # type: ignore[no-redef]
except Exception:  # pragma: no cover - only when the web package is absent
    netguard = None  # type: ignore[assignment]


def _fail_closed_validate_media_url(raw_url: object) -> str:
    """Fallback validator used only when ``web.app`` cannot be imported.

    It mirrors the important parts of the real validator (HTTPS only, a real
    public-looking hostname, no IP literals, no local names) *and* resolves
    the host through :mod:`netguard`, so this degraded mode can never skip the
    DNS/IP-range check.  If ``netguard`` itself is missing the function fails
    closed and refuses every link.
    """
    if netguard is None:  # pragma: no cover - broken installation
        raise ValueError("Link validation is unavailable; refusing this link.")
    if not isinstance(raw_url, str):
        raise ValueError("Enter a media link.")
    value = raw_url.strip()
    if not value or len(value) > 4_096:
        raise ValueError("The link is empty or too long.")
    try:
        parsed = urllib.parse.urlsplit(value)
        host = parsed.hostname
        port = parsed.port
    except ValueError as exc:
        raise ValueError("The link is malformed.") from exc
    if parsed.scheme.lower() != "https" or not host:
        raise ValueError("Use a valid HTTPS link from a supported media site.")
    if parsed.username or parsed.password or port not in (None, 443):
        raise ValueError("Only the standard HTTPS port is supported.")
    try:
        ascii_host = host.encode("idna").decode("ascii").lower().rstrip(".")
    except UnicodeError as exc:
        raise ValueError("The link host is invalid.") from exc
    try:
        ipaddress.ip_address(ascii_host.strip("[]"))
    except ValueError:
        pass
    else:
        raise ValueError("Links to private or local network addresses are blocked.")
    if "." not in ascii_host or ascii_host.endswith(
        (".invalid", ".local", ".localhost", ".internal", ".example"),
    ):
        raise ValueError("This media site is not supported.")
    # Same DNS/IP-range gate the Flask app uses; never skipped.
    netguard.resolve_public_host(ascii_host, port or 443)
    return value


try:  # ``web/`` is on sys.path, so the plain module import is the reliable one.
    from app import validate_media_url  # type: ignore[no-redef]
except Exception:  # pragma: no cover - only when the web package is absent
    try:
        from web.app import validate_media_url  # type: ignore[no-redef]
    except Exception:
        validate_media_url = _fail_closed_validate_media_url  # type: ignore[assignment]


try:  # Imported lazily-friendly so unit tests can inject a fake extractor.
    import yt_dlp  # type: ignore[import-not-found]
except Exception:  # pragma: no cover
    yt_dlp = None  # type: ignore[assignment]


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
MAX_TELEGRAM_BYTES = 50 * 1000 * 1000  # Telegram Bot API upload ceiling: 50 MB.
MAX_REQUESTS_PER_WINDOW = 10
RATE_LIMIT_WINDOW_SECONDS = 600
DOWNLOAD_ROOT = Path("/tmp/opencode/vidnest-bot-downloads")
VIDEO_HEIGHTS = (1080, 720, 480, 360)
DESIGN_CREDIT = "Atheerium"
TELEGRAM_API_BASE = "https://api.telegram.org"
SESSION_TTL_SECONDS = 30 * 60
MAX_CALLBACK_DATA_BYTES = 64
SAFE_CALLBACK_KEY = re.compile(r"^[A-Za-z0-9._-]{1,100}$")
URL_PATTERN = re.compile(r"https://[^\s<>\"']+", re.IGNORECASE)

OVERSIZE_MESSAGE = (
    "حجم الملف يتجاوز حد تيليجرام (50MB) / File exceeds Telegram 50MB limit"
)
OVERSIZE_DETAIL = (
    "اختر جودة أقل أو استخدم تطبيق VidNest للهاتف.\n"
    "Choose a lower quality or use the VidNest Android app for larger files."
)
RATE_LIMIT_MESSAGE = (
    "تم تجاوز حد الطلبات (10 خلال 10 دقائق). حاول لاحقًا.\n"
    "Rate limit reached (10 requests per 10 minutes). Please try again later."
)
INVALID_URL_MESSAGE = (
    "الرابط غير صالح أو غير مدعوم. أرسل رابط HTTPS عام.\n"
    "Invalid or unsupported link. Send a public HTTPS link."
)
PROBE_FAILED_MESSAGE = (
    "تعذر قراءة الرابط. تأكد أنه عام وليس محميًا بكلمة مرور.\n"
    "Could not read this link. Make sure it is public and not password protected."
)
NO_URL_MESSAGE = (
    "أرسل رابط فيديو أو صوت يبدأ بـ https://\n"
    "Send a video or audio link that starts with https://"
)
SESSION_EXPIRED_MESSAGE = (
    "انتهت الجلسة. أرسل الرابط مرة أخرى.\n"
    "This session expired. Send the link again."
)
DOWNLOAD_FAILED_MESSAGE = (
    "تعذر تنزيل هذا الملف. جرّب جودة أخرى.\n"
    "Could not download this file. Try another quality."
)
UNSAFE_FORMAT_MESSAGE = (
    "صيغة غير صالحة. أرسل الرابط مرة أخرى.\n"
    "Invalid format selection. Send the link again."
)
START_MESSAGE = (
    "مرحبًا بك في VidNest.\n"
    "أرسل رابط HTTPS من أكثر من 1800 موقع، وسأعرض الجودات والأحجام المتاحة.\n\n"
    "Welcome to VidNest.\n"
    "Send an HTTPS link from 1,800+ sites and I will list available qualities and sizes.\n\n"
    "التصميم: Atheerium | Design: Atheerium (https://atheerium.com)"
)
HELP_MESSAGE = (
    "طريقة الاستخدام:\n"
    "1. أرسل رابط فيديو أو صوت يبدأ بـ https://\n"
    "2. اختر الجودة من الأزرار (1080p / 720p / 480p / 360p / M4A / MP3)\n"
    "3. سأرسل الملف مباشرة إلى المحادثة.\n\n"
    "الحد الأقصى لتيليجرام 50MB لكل ملف، و10 طلبات كل 10 دقائق.\n\n"
    "How to use:\n"
    "1. Send a video or audio link that starts with https://\n"
    "2. Pick a quality button (1080p / 720p / 480p / 360p / M4A / MP3)\n"
    "3. I will upload the file straight into this chat.\n\n"
    "Telegram caps uploads at 50MB per file and requests at 10 per 10 minutes.\n\n"
    "التصميم: Atheerium | Design: Atheerium (https://atheerium.com)"
)


class SlidingWindowLimiter:
    """Per-chat sliding-window limiter (10 requests / 600s by default)."""

    def __init__(
        self,
        max_requests: int = MAX_REQUESTS_PER_WINDOW,
        window_seconds: float = RATE_LIMIT_WINDOW_SECONDS,
        *,
        limit: int | None = None,
        window: float | None = None,
    ) -> None:
        self.max_requests = int(limit if limit is not None else max_requests)
        self.window_seconds = float(window if window is not None else window_seconds)
        self._lock = threading.Lock()
        self._events: dict[str, list[float]] = {}

    def allow(
        self,
        chat_id: object,
        limit: int | None = None,
        window_seconds: float | None = None,
    ) -> bool:
        """Record one request for ``chat_id`` and return whether it is allowed."""
        key = str(chat_id)
        effective_limit = int(limit if limit is not None else self.max_requests)
        effective_window = float(
            window_seconds if window_seconds is not None else self.window_seconds,
        )
        now = time.monotonic()
        cutoff = now - effective_window
        with self._lock:
            events = self._events.setdefault(key, [])
            while events and events[0] <= cutoff:
                events.pop(0)
            if len(events) >= effective_limit:
                return False
            events.append(now)
            if len(self._events) > 4_096:
                for name in [name for name, stamps in self._events.items() if not stamps]:
                    self._events.pop(name, None)
            return True

    # Compatibility helpers used by a few callers/tests.
    def check(self, chat_id: object) -> bool:
        return self.allow(chat_id)

    def reset(self, chat_id: object | None = None) -> None:
        with self._lock:
            if chat_id is None:
                self._events.clear()
            else:
                self._events.pop(str(chat_id), None)


rate_limiter = SlidingWindowLimiter()

_sessions: dict[str, dict[str, Any]] = {}
_sessions_lock = threading.Lock()


# ---------------------------------------------------------------------------
# Small helpers
# ---------------------------------------------------------------------------
def _as_int(value: object) -> int | None:
    try:
        number = int(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None
    return number if number > 0 else None


def _as_float(value: object) -> float | None:
    try:
        number = float(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None
    return number if number > 0 else None


def _format_size_bytes(fmt: dict[str, Any]) -> int | None:
    for key in ("filesize", "filesize_approx", "size"):
        size = _as_int(fmt.get(key))
        if size is not None:
            return size
    return None


def human_size(size: int | None) -> str:
    """Return a compact size label such as ``42.5 MB``."""
    if not size or size <= 0:
        return ""
    if size >= 1_000_000_000:
        return f"{size / 1_000_000_000:.1f} GB"
    if size >= 1_000_000:
        return f"{size / 1_000_000:.1f} MB"
    if size >= 1_000:
        return f"{size / 1_000:.0f} KB"
    return f"{size} B"


def extract_url(text: object) -> str | None:
    """Extract the first ``https://`` URL from a message."""
    if not isinstance(text, str):
        return None
    match = URL_PATTERN.search(text)
    if not match:
        return None
    url = match.group(0).rstrip(".,;:!?)]}>'\"")
    return url or None


# Older internal name kept for callers that imported it.
_extract_url = extract_url


def _button_label(choice: dict[str, Any]) -> str:
    size_label = human_size(choice.get("size"))
    return f"{choice['label']} | ~{size_label}" if size_label else str(choice["label"])


def build_inline_keyboard(choices: Iterable[dict[str, Any]]) -> dict[str, Any]:
    """Build a Telegram ``reply_markup`` with one button per format."""
    rows = []
    for choice in choices:
        key = str(choice.get("key") or "")
        if not SAFE_CALLBACK_KEY.fullmatch(key):
            continue
        data = f"dl:{key}"
        if len(data.encode("utf-8")) > MAX_CALLBACK_DATA_BYTES:
            continue
        rows.append([{"text": _button_label(choice), "callback_data": data}])
    return {"inline_keyboard": rows}


# Public aliases used by tests and by future callers.
build_format_keyboard = build_inline_keyboard


def _tier_for_height(height: int | None) -> int | None:
    if not height:
        return None
    if height >= 1080:
        return 1080
    if height >= 720:
        return 720
    if height >= 480:
        return 480
    if height >= 360:
        return 360
    return None


def _is_explicit_audio(fmt: dict[str, Any]) -> bool:
    vcodec = str(fmt.get("vcodec") or "").lower()
    return vcodec == "none"


def _video_choices(formats: Iterable[dict[str, Any]]) -> tuple[list[dict[str, Any]], bool]:
    """Return available video tiers and whether every video exceeds 50MB."""
    best: dict[int, tuple[tuple[float, int], dict[str, Any]]] = {}
    saw_video = False
    sizes_known = 0
    sizes_over = 0
    sizes_unknown = 0

    for fmt in formats:
        if not isinstance(fmt, dict):
            continue
        if _is_explicit_audio(fmt):
            continue
        height = _as_int(fmt.get("height"))
        if height is None:
            continue
        tier = _tier_for_height(height)
        if tier is None:
            continue
        saw_video = True
        size = _format_size_bytes(fmt)
        if size is not None:
            sizes_known += 1
            if size > MAX_TELEGRAM_BYTES:
                sizes_over += 1
                continue
        else:
            sizes_unknown += 1
        score = (_as_float(fmt.get("tbr")) or 0.0, _as_int(fmt.get("filesize")) or 0)
        current = best.get(tier)
        if current is None or score > current[0]:
            best[tier] = (score, fmt)

    choices: list[dict[str, Any]] = []
    for tier in VIDEO_HEIGHTS:
        entry = best.get(tier)
        if not entry:
            continue
        fmt = entry[1]
        key = str(fmt.get("format_id") or f"v{tier}")
        if not SAFE_CALLBACK_KEY.fullmatch(key):
            key = f"v{tier}"
        choices.append(
            {
                "key": key,
                "label": f"{tier}p",
                "kind": "video",
                "height": tier,
                "selector": str(fmt.get("format_id") or key),
                "size": _format_size_bytes(fmt),
                "ext": str(fmt.get("ext") or ""),
            },
        )

    all_over = (
        saw_video
        and sizes_known > 0
        and sizes_over == sizes_known
        and sizes_unknown == 0
    )
    return choices, all_over


def _audio_choices(formats: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    """Offer M4A and MP3, preferring real audio-only formats when present."""
    format_list = [fmt for fmt in formats if isinstance(fmt, dict)]
    if not format_list:
        return []
    actual: dict[str, dict[str, Any]] = {}
    for fmt in format_list:
        if not isinstance(fmt, dict):
            continue
        height = _as_int(fmt.get("height"))
        vcodec = str(fmt.get("vcodec") or "").lower()
        if height is not None and vcodec != "none":
            continue  # A muxed video format is not an audio-only choice.
        ext = str(fmt.get("ext") or "").lower()
        acodec = str(fmt.get("acodec") or "").lower()
        if ext == "m4a" or "mp4a" in acodec:
            actual.setdefault("m4a", fmt)
        if ext == "mp3" or "mp3" in acodec:
            actual.setdefault("mp3", fmt)

    choices: list[dict[str, Any]] = []
    for kind, label, fallback_selector, postprocessor in (
        ("m4a", "M4A", "bestaudio[ext=m4a]/bestaudio/best", "m4a"),
        ("mp3", "MP3", "bestaudio/best", "mp3"),
    ):
        fmt = actual.get(kind)
        size = _format_size_bytes(fmt) if fmt else None
        if size is not None and size > MAX_TELEGRAM_BYTES:
            fmt = None
            size = None
        if fmt is not None:
            key = str(fmt.get("format_id") or kind)
            selector = str(fmt.get("format_id") or fallback_selector)
        else:
            key = kind
            selector = fallback_selector
        if not SAFE_CALLBACK_KEY.fullmatch(key):
            key = kind
        choices.append(
            {
                "key": key,
                "label": label,
                "kind": "audio",
                "height": None,
                "selector": selector,
                "size": size,
                "postprocessor": postprocessor,
            },
        )
    return choices


def _instantiate_extractor(extractor_cls: object | None) -> object | None:
    """Instantiate a test extractor factory, or return an instance unchanged."""
    if extractor_cls is None:
        return None
    if isinstance(extractor_cls, dict):
        return extractor_cls
    if isinstance(extractor_cls, type):
        options = {
            "quiet": True,
            "no_warnings": True,
            "skip_download": True,
            "noplaylist": True,
            "socket_timeout": 30,
        }
        try:
            return extractor_cls(options)  # type: ignore[call-arg]
        except TypeError:
            try:
                return extractor_cls()  # type: ignore[call-arg]
            except TypeError:
                return extractor_cls  # type: ignore[return-value]
    return extractor_cls


def _probe_info(url: str, extractor_cls: object | None = None) -> dict[str, Any]:
    extractor = _instantiate_extractor(extractor_cls)
    if isinstance(extractor, dict):
        return extractor
    if extractor is not None and hasattr(extractor, "extract_info"):
        info = extractor.extract_info(url, download=False)  # type: ignore[attr-defined]
        return info if isinstance(info, dict) else {}
    if extractor is not None and callable(extractor):
        info = extractor(url)  # type: ignore[operator]
        return info if isinstance(info, dict) else {}

    if yt_dlp is None:  # pragma: no cover
        raise RuntimeError("yt-dlp is not installed")
    if netguard is None:  # pragma: no cover - broken installation
        raise RuntimeError("Network egress guard is unavailable")
    options = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "noplaylist": True,
        "socket_timeout": 30,
    }
    with netguard.public_egress_only():
        with yt_dlp.YoutubeDL(options) as ydl:  # type: ignore[union-attr]
            info = ydl.extract_info(url, download=False)
    return info if isinstance(info, dict) else {}


def probe_formats(url: str, extractor_cls: object | None = None) -> dict[str, Any]:
    """Probe ``url`` and return available, size-limited format choices."""
    info = _probe_info(url, extractor_cls=extractor_cls)
    raw_formats = info.get("formats")
    formats = [item for item in raw_formats if isinstance(item, dict)] if isinstance(
        raw_formats, list,
    ) else []

    video, all_video_over = _video_choices(formats)
    audio = _audio_choices(formats)
    choices = video + audio
    return {
        "title": str(info.get("title") or "")[:200],
        "uploader": str(info.get("uploader") or info.get("channel") or "")[:120],
        "duration": info.get("duration"),
        "formats": choices,
        "choices": choices,
        "oversize": bool(all_video_over),
    }


# ---------------------------------------------------------------------------
# Telegram transport
# ---------------------------------------------------------------------------
def _http_api(
    bot_token: str,
    method: str,
    payload: dict[str, Any],
    timeout: float = 30,
) -> dict[str, Any]:
    url = f"{TELEGRAM_API_BASE}/bot{urllib.parse.quote(bot_token, safe=':')}/{method}"
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            body = response.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as exc:  # pragma: no cover - network only
        detail = exc.read().decode("utf-8", "replace")
        raise RuntimeError(f"Telegram {method} failed: {exc.code} {detail}") from exc
    except urllib.error.URLError as exc:  # pragma: no cover - network only
        raise RuntimeError(f"Telegram {method} unreachable: {exc.reason}") from exc
    try:
        return json.loads(body) if body else {}
    except json.JSONDecodeError:
        return {"ok": False, "raw": body}


def _http_get(bot_token: str, method: str, params: dict[str, Any]) -> dict[str, Any]:
    query = urllib.parse.urlencode(params)
    url = (
        f"{TELEGRAM_API_BASE}/bot{urllib.parse.quote(bot_token, safe=':')}"
        f"/{method}?{query}"
    )
    try:
        with urllib.request.urlopen(url, timeout=60) as response:
            body = response.read().decode("utf-8", "replace")
    except urllib.error.URLError as exc:  # pragma: no cover - network only
        raise RuntimeError(f"Telegram {method} unreachable: {exc.reason}") from exc
    try:
        return json.loads(body) if body else {}
    except json.JSONDecodeError:
        return {"ok": False, "raw": body}


def _http_upload(
    bot_token: str,
    method: str,
    fields: dict[str, Any],
    file_field: str,
    file_path: Path,
) -> dict[str, Any]:
    """Minimal multipart upload for real Bot API deployments."""
    boundary = f"----VidNest{uuid.uuid4().hex}"
    chunks: list[bytes] = []
    for name, value in fields.items():
        if value is None:
            continue
        chunks.append(f"--{boundary}\r\n".encode())
        chunks.append(
            f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode(),
        )
        chunks.append(str(value).encode("utf-8"))
        chunks.append(b"\r\n")
    filename = file_path.name.replace('"', "_")
    chunks.append(f"--{boundary}\r\n".encode())
    chunks.append(
        (
            f'Content-Disposition: form-data; name="{file_field}"; '
            f'filename="{filename}"\r\n'
        ).encode(),
    )
    chunks.append(b"Content-Type: application/octet-stream\r\n\r\n")
    chunks.append(file_path.read_bytes())
    chunks.append(b"\r\n")
    chunks.append(f"--{boundary}--\r\n".encode())
    body = b"".join(chunks)
    url = f"{TELEGRAM_API_BASE}/bot{urllib.parse.quote(bot_token, safe=':')}/{method}"
    request = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=300) as response:
            raw = response.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as exc:  # pragma: no cover - network only
        detail = exc.read().decode("utf-8", "replace")
        raise RuntimeError(f"Telegram {method} failed: {exc.code} {detail}") from exc
    except urllib.error.URLError as exc:  # pragma: no cover - network only
        raise RuntimeError(f"Telegram {method} unreachable: {exc.reason}") from exc
    try:
        return json.loads(raw) if raw else {}
    except json.JSONDecodeError:
        return {"ok": False, "raw": raw}


def _api_call(
    api_caller: Callable[..., Any] | object | None,
    bot_token: str | None,
    method: str,
    payload: dict[str, Any],
) -> Any:
    """Call a fake/real Telegram client with a forgiving calling convention."""
    if api_caller is not None:
        camel = getattr(api_caller, method, None)
        snake_name = re.sub(r"(?<!^)(?=[A-Z])", "_", method).lower()
        snake = getattr(api_caller, snake_name, None)
        handler = camel if callable(camel) else snake
        if callable(handler):
            try:
                parameters = signature(handler).parameters
            except (TypeError, ValueError):
                parameters = {}
            accepts_any = any(
                parameter.kind is Parameter.VAR_KEYWORD
                for parameter in parameters.values()
            )
            if parameters and not accepts_any:
                payload = {
                    name: value
                    for name, value in payload.items()
                    if name in parameters
                }
            return handler(**payload)
        if callable(api_caller):
            try:
                return api_caller(method, payload)  # type: ignore[operator]
            except TypeError:
                return api_caller(method, **payload)  # type: ignore[operator]
        raise TypeError(f"api_caller cannot handle {method}")

    if not bot_token:
        raise RuntimeError("TELEGRAM_BOT_TOKEN is not configured")
    return _http_api(bot_token, method, payload)


def _send_message(
    api_caller: Callable[..., Any] | object | None,
    bot_token: str | None,
    chat_id: object,
    text: str,
    reply_markup: dict[str, Any] | None = None,
) -> Any:
    payload: dict[str, Any] = {
        "chat_id": chat_id,
        "text": text[:4_096],
        "disable_web_page_preview": True,
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup
    try:
        return _api_call(api_caller, bot_token, "sendMessage", payload)
    except Exception:
        LOGGER.exception("Failed to send Telegram message to chat %s", chat_id)
        return None


def _answer_callback(
    api_caller: Callable[..., Any] | object | None,
    bot_token: str | None,
    callback_query_id: object,
    text: str = "",
) -> None:
    if not callback_query_id:
        return
    try:
        _api_call(
            api_caller,
            bot_token,
            "answerCallbackQuery",
            {"callback_query_id": callback_query_id, "text": text[:200]},
        )
    except Exception:
        LOGGER.debug("answerCallbackQuery failed", exc_info=True)


def _send_media(
    api_caller: Callable[..., Any] | object | None,
    bot_token: str | None,
    chat_id: object,
    path: Path,
    choice: dict[str, Any],
    caption: str,
) -> Any:
    is_audio = choice.get("kind") == "audio"
    method = "sendAudio" if is_audio else "sendVideo"
    file_field = "audio" if is_audio else "video"
    payload: dict[str, Any] = {
        "chat_id": chat_id,
        file_field: str(path),
        "caption": caption[:1_024],
    }
    if is_audio:
        payload["title"] = caption[:1_024]
    else:
        payload["supports_streaming"] = True
    if api_caller is not None:
        return _api_call(api_caller, bot_token, method, payload)
    if not bot_token:
        raise RuntimeError("TELEGRAM_BOT_TOKEN is not configured")
    fields = dict(payload)
    fields.pop(file_field, None)
    return _http_upload(bot_token, method, fields, file_field, path)


# ---------------------------------------------------------------------------
# Download
# ---------------------------------------------------------------------------
def _extractor_for_download(extractor_cls: object | None) -> object | None:
    return _instantiate_extractor(extractor_cls)


def _download_media(
    url: str,
    choice: dict[str, Any],
    tmpdir: Path,
    extractor_cls: object | None = None,
) -> tuple[Path, int]:
    """Download one format into ``tmpdir`` and return ``(path, size)``."""
    selector = str(choice.get("selector") or choice.get("key") or "best")
    extractor = _extractor_for_download(extractor_cls)

    download_method = getattr(extractor, "download", None) if extractor is not None else None
    if callable(download_method):
        try:
            result = download_method(
                url=url,
                format_id=selector,
                outdir=str(tmpdir),
            )
        except TypeError:
            try:
                result = download_method(url, selector, str(tmpdir))
            except TypeError:
                result = download_method(url, str(tmpdir))
        if result:
            candidate = Path(str(result))
            if not candidate.is_absolute():
                candidate = tmpdir / candidate
            if candidate.is_file():
                return candidate, candidate.stat().st_size

    if extractor is not None and hasattr(extractor, "extract_info") and not callable(
        download_method,
    ):
        try:
            info = extractor.extract_info(url, download=True)  # type: ignore[attr-defined]
        except TypeError:
            info = extractor.extract_info(url)  # type: ignore[attr-defined]
        if isinstance(info, dict):
            requested = info.get("requested_downloads")
            if isinstance(requested, list):
                for item in requested:
                    if not isinstance(item, dict):
                        continue
                    filepath = item.get("filepath")
                    if filepath and Path(str(filepath)).is_file():
                        path = Path(str(filepath))
                        return path, path.stat().st_size

    if yt_dlp is None:  # pragma: no cover
        raise RuntimeError("yt-dlp is not installed")
    if netguard is None:  # pragma: no cover - broken installation
        raise RuntimeError("Network egress guard is unavailable")

    DOWNLOAD_ROOT.mkdir(parents=True, exist_ok=True)
    options: dict[str, Any] = {
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "format": selector,
        "outtmpl": str(tmpdir / "%(title).120s-%(id)s.%(ext)s"),
        "restrictfilenames": True,
        "overwrites": True,
        "retries": 2,
        "socket_timeout": 60,
        "max_filesize": MAX_TELEGRAM_BYTES + 1,
    }
    postprocessor = choice.get("postprocessor")
    if postprocessor:
        options["postprocessors"] = [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": str(postprocessor),
                "preferredquality": "192" if postprocessor == "mp3" else "0",
            },
        ]
    with netguard.public_egress_only():
        with yt_dlp.YoutubeDL(options) as ydl:  # type: ignore[union-attr]
            ydl.download([url])

    media_files = [
        path
        for path in tmpdir.rglob("*")
        if path.is_file()
        and not path.is_symlink()
        and not path.name.endswith((".part", ".ytdl", ".temp"))
    ]
    if not media_files:
        raise RuntimeError("The download produced no media file.")
    path = max(media_files, key=lambda item: item.stat().st_size)
    return path, path.stat().st_size


# Public alias.
download_format = _download_media


# ---------------------------------------------------------------------------
# Sessions
# ---------------------------------------------------------------------------
def _prune_sessions() -> None:
    cutoff = time.time() - SESSION_TTL_SECONDS
    with _sessions_lock:
        for key in [name for name, session in _sessions.items() if session.get("created", 0) < cutoff]:
            _sessions.pop(key, None)


def _store_session(
    chat_id: object,
    url: str,
    choices: list[dict[str, Any]],
    extractor_cls: object | None,
) -> None:
    _prune_sessions()
    with _sessions_lock:
        _sessions[str(chat_id)] = {
            "url": url,
            "choices": {choice["key"]: choice for choice in choices},
            "extractor_cls": extractor_cls,
            "created": time.time(),
        }


def _load_session(chat_id: object) -> dict[str, Any] | None:
    _prune_sessions()
    with _sessions_lock:
        return _sessions.get(str(chat_id))


def _chat_id_from_update(update: dict[str, Any]) -> object | None:
    message = update.get("message") or update.get("edited_message")
    if isinstance(message, dict):
        chat = message.get("chat")
        if isinstance(chat, dict) and chat.get("id") is not None:
            return chat["id"]
        sender = message.get("from")
        if isinstance(sender, dict) and sender.get("id") is not None:
            return sender["id"]
    callback = update.get("callback_query")
    if isinstance(callback, dict):
        callback_message = callback.get("message")
        if isinstance(callback_message, dict):
            chat = callback_message.get("chat")
            if isinstance(chat, dict) and chat.get("id") is not None:
                return chat["id"]
        sender = callback.get("from")
        if isinstance(sender, dict) and sender.get("id") is not None:
            return sender["id"]
    return None


# ---------------------------------------------------------------------------
# Update handling
# ---------------------------------------------------------------------------
def _handle_text_message(
    update: dict[str, Any],
    bot_token: str | None,
    api_caller: Callable[..., Any] | object | None,
    extractor_cls: object | None,
) -> dict[str, Any]:
    message = update.get("message") or update.get("edited_message")
    if not isinstance(message, dict):
        return {"ok": True}
    chat_id = _chat_id_from_update(update)
    text = message.get("text") or message.get("caption") or ""
    if chat_id is None or not isinstance(text, str):
        return {"ok": True}

    command = text.strip().split(maxsplit=1)[0].split("@", 1)[0].lower()
    if command == "/start":
        _send_message(api_caller, bot_token, chat_id, START_MESSAGE)
        return {"ok": True}
    if command in ("/help", "/commands"):
        _send_message(api_caller, bot_token, chat_id, HELP_MESSAGE)
        return {"ok": True}
    if command.startswith("/"):
        _send_message(api_caller, bot_token, chat_id, NO_URL_MESSAGE)
        return {"ok": True}

    url = extract_url(text)
    if not url:
        _send_message(api_caller, bot_token, chat_id, NO_URL_MESSAGE)
        return {"ok": True}

    if not rate_limiter.allow(chat_id):
        _send_message(api_caller, bot_token, chat_id, RATE_LIMIT_MESSAGE)
        return {"ok": True}

    try:
        validate_media_url(url)
    except ValueError as exc:
        detail = str(exc).strip()
        suffix = f"\n{detail}" if detail else ""
        _send_message(api_caller, bot_token, chat_id, INVALID_URL_MESSAGE + suffix)
        return {"ok": True}

    try:
        probe = probe_formats(url, extractor_cls=extractor_cls)
    except Exception:
        LOGGER.exception("Failed to probe %s", url)
        _send_message(api_caller, bot_token, chat_id, PROBE_FAILED_MESSAGE)
        return {"ok": True}

    choices = probe.get("choices") or []
    if not choices:
        _send_message(api_caller, bot_token, chat_id, PROBE_FAILED_MESSAGE)
        return {"ok": True}

    if probe.get("oversize"):
        _send_message(
            api_caller,
            bot_token,
            chat_id,
            f"{OVERSIZE_MESSAGE}\n{OVERSIZE_DETAIL}",
        )
        return {"ok": True}

    keyboard = build_inline_keyboard(choices)
    if not keyboard["inline_keyboard"]:
        _send_message(api_caller, bot_token, chat_id, PROBE_FAILED_MESSAGE)
        return {"ok": True}

    _store_session(chat_id, url, choices, extractor_cls)
    title = probe.get("title") or url
    uploader = probe.get("uploader") or ""
    header = f"{title}\n{uploader}\n" if uploader else f"{title}\n"
    header += (
        "اختر الجودة / Choose a quality\n"
        "الحد الأقصى 50MB لكل ملف / 50MB per file"
    )
    _send_message(api_caller, bot_token, chat_id, header, reply_markup=keyboard)
    return {"ok": True}


def _handle_callback_query(
    update: dict[str, Any],
    bot_token: str | None,
    api_caller: Callable[..., Any] | object | None,
    extractor_cls: object | None,
) -> dict[str, Any]:
    callback = update.get("callback_query")
    if not isinstance(callback, dict):
        return {"ok": True}
    callback_id = callback.get("id")
    data = callback.get("data") or ""
    chat_id = _chat_id_from_update(update)
    if chat_id is None:
        return {"ok": True}
    if not isinstance(data, str) or not data.startswith("dl:"):
        _answer_callback(api_caller, bot_token, callback_id)
        return {"ok": True}

    key = data[3:].strip()
    if not SAFE_CALLBACK_KEY.fullmatch(key):
        _answer_callback(api_caller, bot_token, callback_id)
        _send_message(api_caller, bot_token, chat_id, UNSAFE_FORMAT_MESSAGE)
        return {"ok": True}

    session = _load_session(chat_id)
    if not session:
        _answer_callback(api_caller, bot_token, callback_id)
        _send_message(api_caller, bot_token, chat_id, SESSION_EXPIRED_MESSAGE)
        return {"ok": True}

    choices = session.get("choices") or {}
    choice = choices.get(key)
    if not isinstance(choice, dict):
        # Tolerate a bare format id from an older keyboard.
        choice = {
            "key": key,
            "label": key,
            "kind": "audio" if key.lower() in ("mp3", "m4a") else "video",
            "selector": key,
            "size": None,
        }

    _answer_callback(api_caller, bot_token, callback_id)
    DOWNLOAD_ROOT.mkdir(parents=True, exist_ok=True)
    tmpdir = Path(tempfile.mkdtemp(prefix="job-", dir=str(DOWNLOAD_ROOT)))
    try:
        try:
            path, size = _download_media(
                str(session.get("url") or ""),
                choice,
                tmpdir,
                extractor_cls=extractor_cls or session.get("extractor_cls"),
            )
        except Exception:
            LOGGER.exception("Download failed for %s", session.get("url"))
            _send_message(api_caller, bot_token, chat_id, DOWNLOAD_FAILED_MESSAGE)
            return {"ok": True}

        if not isinstance(size, int) or size <= 0:
            try:
                size = path.stat().st_size
            except OSError:
                size = 0
        if size > MAX_TELEGRAM_BYTES:
            _send_message(
                api_caller,
                bot_token,
                chat_id,
                f"{OVERSIZE_MESSAGE}\n{OVERSIZE_DETAIL}",
            )
            return {"ok": True}

        caption = str(choice.get("label") or key)
        try:
            _send_media(api_caller, bot_token, chat_id, path, choice, caption)
        except Exception:
            LOGGER.exception("Upload failed for %s", path)
            _send_message(api_caller, bot_token, chat_id, DOWNLOAD_FAILED_MESSAGE)
        return {"ok": True}
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


def handle_webhook_update(
    update: dict,
    bot_token: str | None = None,
    api_caller: Callable[..., Any] | object | None = None,
    extractor_cls: object | None = None,
    token: str | None = None,
) -> dict:
    """Handle one Telegram update (webhook or polling) and return a status dict."""
    if not isinstance(update, dict):
        return {"ok": False, "error": "invalid update"}
    token = bot_token or token or os.environ.get("TELEGRAM_BOT_TOKEN", "")
    try:
        if isinstance(update.get("callback_query"), dict):
            return _handle_callback_query(update, token, api_caller, extractor_cls)
        return _handle_text_message(update, token, api_caller, extractor_cls)
    except Exception:
        LOGGER.exception("Unhandled Telegram update failure")
        return {"ok": False, "error": "update failed"}


# Convenience alias for callers that use the shorter name.
handle_update = handle_webhook_update


# ---------------------------------------------------------------------------
# Polling mode
# ---------------------------------------------------------------------------
def run_polling(
    bot_token: str | None = None,
    api_caller: Callable[..., Any] | object | None = None,
    extractor_cls: object | None = None,
) -> None:
    """Long-poll Telegram until interrupted (standalone CLI mode)."""
    token = bot_token or os.environ.get("TELEGRAM_BOT_TOKEN", "")
    if not token:
        raise SystemExit("TELEGRAM_BOT_TOKEN is required for polling mode.")

    offset: int | None = None
    LOGGER.info("VidNest bot polling started")
    while True:
        params: dict[str, Any] = {
            "timeout": 30,
            "allowed_updates": json.dumps(["message", "edited_message", "callback_query"]),
        }
        if offset is not None:
            params["offset"] = offset
        payload = _http_get(token, "getUpdates", params)
        for update in payload.get("result", []) or []:
            if not isinstance(update, dict):
                continue
            update_id = update.get("update_id")
            if isinstance(update_id, int):
                offset = update_id + 1
            handle_webhook_update(
                update,
                bot_token=token,
                api_caller=api_caller,
                extractor_cls=extractor_cls,
            )


def main() -> None:
    logging.basicConfig(
        level=os.environ.get("VIDNEST_BOT_LOG_LEVEL", "INFO").upper(),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    try:
        run_polling()
    except KeyboardInterrupt:  # pragma: no cover - interactive exit
        LOGGER.info("VidNest bot stopped")


if __name__ == "__main__":
    main()
