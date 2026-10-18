from __future__ import annotations

import ipaddress
import hmac
import logging
import os
import re
import secrets
import shutil
import socket
import threading
import tempfile
import time
import uuid
from pathlib import Path
from urllib.parse import urlsplit

import yt_dlp
from flask import Flask, abort, jsonify, request, send_from_directory


DOWNLOAD_DIR = Path(
    os.environ.get("VIDNEST_DOWNLOAD_DIR", "/tmp/opencode/vidnest-web-downloads"),
).expanduser().resolve()
DOWNLOAD_DIR.mkdir(mode=0o700, parents=True, exist_ok=True)
try:
    os.chmod(DOWNLOAD_DIR, 0o700)
except OSError:
    pass
MAX_URL_LENGTH = 4_096
MAX_DOWNLOAD_BYTES = 1_000_000_000
MAX_STORAGE_BYTES = 2_000_000_000
LOCAL_AUTHORITIES = {"localhost:5000", "127.0.0.1:5000", "[::1]:5000"}
LOCAL_HOSTS = {"localhost", "127.0.0.1", "::1"}
ALLOWED_MEDIA_DOMAINS = (
    "youtube.com", "youtube-nocookie.com", "youtu.be",
    "tiktok.com", "instagram.com", "facebook.com", "fb.com", "fb.watch",
    "x.com", "twitter.com",
)
SAFE_MEDIA_EXTENSIONS = {
    "mp4", "m4v", "mkv", "webm", "mov", "3gp", "flv", "avi",
    "mp3", "m4a", "opus", "ogg", "flac", "wav", "aac",
}
SAFE_FILENAME = re.compile(
    rf"^[0-9a-f]{{32}}\.(?:{'|'.join(sorted(SAFE_MEDIA_EXTENSIONS))})$",
    re.IGNORECASE,
)
SAFE_FORMAT_ID = re.compile(r"^[A-Za-z0-9._-]{1,100}$")
ORPHAN_JOB_DIR = re.compile(r"^\.[0-9a-f]{32}-[a-z0-9_-]+$", re.IGNORECASE)
download_lock = threading.Lock()
csrf_token = secrets.token_urlsafe(32)
probe_lock = threading.Lock()
probe_cache: dict[str, dict[str, object]] = {}
PROBE_TTL_SECONDS = 600


def cleanup_orphaned_jobs() -> None:
    """Remove interrupted private work dirs left by a killed prior process."""
    for entry in DOWNLOAD_DIR.iterdir():
        if entry.is_dir() and not entry.is_symlink() and ORPHAN_JOB_DIR.fullmatch(entry.name):
            shutil.rmtree(entry, ignore_errors=True)


cleanup_orphaned_jobs()

app = Flask(__name__, static_folder="static", static_url_path="/static")
app.config["MAX_CONTENT_LENGTH"] = 16_384
app.logger.setLevel(logging.INFO)


@app.before_request
def require_local_browser_origin():
    # A loopback-only tool, not a LAN or public service. Also reject DNS-rebinding
    # Host headers so a hostile website cannot turn localhost into its origin.
    authority = request.host.lower()
    if authority not in LOCAL_AUTHORITIES:
        abort(400)

    if request.headers.get("Sec-Fetch-Site", "").lower() == "cross-site":
        abort(403)

    origin = request.headers.get("Origin")
    if origin:
        try:
            parsed = urlsplit(origin)
            origin_host = (parsed.hostname or "").lower()
            origin_port = parsed.port or (443 if parsed.scheme == "https" else 80)
        except ValueError:
            abort(403)
        origin_authority = f"[{origin_host}]:{origin_port}" if ":" in origin_host else f"{origin_host}:{origin_port}"
        if (
            parsed.scheme != "http"
            or origin_host not in LOCAL_HOSTS
            or origin_port != 5000
            or origin_authority != authority
        ):
            abort(403)

    if request.path in {"/api/formats", "/api/download"} and request.method == "POST":
        supplied_token = request.headers.get("X-VidNest-CSRF", "")
        if not supplied_token.isascii() or not hmac.compare_digest(supplied_token, csrf_token):
            abort(403)


def validate_media_url(raw_url: object) -> str:
    if not isinstance(raw_url, str):
        raise ValueError("Enter a media link.")
    value = raw_url.strip()
    if not value or len(value) > MAX_URL_LENGTH or any(ord(char) < 0x20 for char in value):
        raise ValueError("The link is empty or too long.")
    try:
        parsed = urlsplit(value)
        host = parsed.hostname
        port = parsed.port
    except ValueError as exc:
        raise ValueError("The link is malformed.") from exc

    if parsed.scheme.lower() != "https" or not host or parsed.username or parsed.password:
        raise ValueError("Use a valid HTTPS link from a supported media site.")
    if port not in (None, 443):
        raise ValueError("Only the standard HTTPS port is supported.")

    try:
        ascii_host = host.encode("idna").decode("ascii").lower().rstrip(".")
    except UnicodeError as exc:
        raise ValueError("The link host is invalid.") from exc
    if not any(ascii_host == root or ascii_host.endswith("." + root) for root in ALLOWED_MEDIA_DOMAINS):
        raise ValueError("This media site is not supported.")

    try:
        answers = socket.getaddrinfo(ascii_host, port or 443, type=socket.SOCK_STREAM)
        addresses = {ipaddress.ip_address(answer[4][0].split("%", 1)[0]) for answer in answers}
    except (OSError, ValueError) as exc:
        raise ValueError("Could not validate this site's network address.") from exc
    if not addresses or any(
        not address.is_global or address.is_multicast or address.is_reserved or address.is_unspecified
        for address in addresses
    ):
        raise ValueError("Links to private or local network addresses are blocked.")
    # Pass exactly the normalized hostname that was checked to yt-dlp.
    return parsed._replace(scheme="https", netloc=ascii_host, fragment="").geturl()


@app.after_request
def security_headers(response):
    response.headers.setdefault(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; "
        "connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'",
    )
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers.setdefault("Cross-Origin-Resource-Policy", "same-origin")
    if request.path == "/" or request.path.startswith("/api/") or request.path.startswith("/files/"):
        response.headers["Cache-Control"] = "no-store"
    return response


@app.errorhandler(413)
def request_too_large(_error):
    return jsonify(error="Request is too large."), 413


def parse_api_payload() -> dict:
    if not request.is_json:
        abort(415, description="Send the request as JSON.")
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        abort(400, description="The request body is invalid.")
    return payload


def yt_dlp_options(**overrides):
    options = {
        "noplaylist": True,
        "socket_timeout": 25,
        "retries": 2,
        "fragment_retries": 2,
        "quiet": True,
        "no_warnings": True,
        "cachedir": False,
    }
    options.update(overrides)
    return options


def public_format(item: dict) -> dict | None:
    format_id = item.get("format_id")
    ext = item.get("ext")
    if not isinstance(format_id, str) or not SAFE_FORMAT_ID.fullmatch(format_id):
        return None
    if not isinstance(ext, str) or ext.lower() not in SAFE_MEDIA_EXTENSIONS:
        return None
    height = item.get("height") if isinstance(item.get("height"), int) else None
    width = item.get("width") if isinstance(item.get("width"), int) else None
    filesize = item.get("filesize") or item.get("filesize_approx")
    filesize = filesize if isinstance(filesize, int) and filesize > 0 else None
    has_video = item.get("vcodec") not in (None, "none")
    has_audio = item.get("acodec") not in (None, "none")
    if not has_video and not has_audio:
        return None
    if has_video and height:
        quality = f"{height}p"
    elif has_video:
        quality = str(item.get("format_note") or "Video")[:60]
    else:
        quality = "Audio"
    return {
        "id": format_id,
        "ext": ext.lower(),
        "quality": quality,
        "width": width,
        "height": height,
        "filesize": filesize,
        "hasAudio": has_audio,
        "hasVideo": has_video,
        "format": str(item.get("format") or item.get("format_note") or "")[:100],
    }


@app.post("/api/formats")
def formats():
    payload = parse_api_payload()
    try:
        link = validate_media_url(payload.get("url"))
    except ValueError as exc:
        return jsonify(error=str(exc)), 400
    if not download_lock.acquire(blocking=False):
        response = jsonify(error="Another media request is running. Try again shortly.")
        response.headers["Retry-After"] = "5"
        return response, 429
    try:
        with yt_dlp.YoutubeDL(yt_dlp_options(skip_download=True, extract_flat=False)) as ydl:
            info = ydl.extract_info(link, download=False)
        if not isinstance(info, dict):
            raise RuntimeError("No media information was returned.")
        available = [
            item for item in (public_format(entry) for entry in info.get("formats", []))
            if item is not None
        ]
        # Prefer useful video renditions and retain an audio-only option. A
        # format with no audio is paired with yt-dlp's best audio at download.
        unique: dict[tuple, dict] = {}
        for item in available:
            key = (item["height"], item["ext"], item["hasAudio"], item["hasVideo"])
            previous = unique.get(key)
            if previous is None or (item["filesize"] or 0) > (previous["filesize"] or 0):
                unique[key] = item
        choices = list(unique.values())
        choices.sort(key=lambda item: (
            not item["hasVideo"], -(item["height"] or 0), item["ext"], item["id"],
        ))
        if not choices:
            return jsonify(error="No downloadable formats were found for this link."), 422
        probe_id = secrets.token_urlsafe(24)
        selectors = {}
        for item in choices:
            selectors[item["id"]] = (
                f"{item['id']}+bestaudio" if item["hasVideo"] and not item["hasAudio"]
                else item["id"]
            )
        with probe_lock:
            now = time.monotonic()
            for key in [key for key, value in probe_cache.items() if value["expires"] <= now]:
                probe_cache.pop(key, None)
            while len(probe_cache) >= 500:
                probe_cache.pop(next(iter(probe_cache)))
            probe_cache[probe_id] = {
                "url": link,
                "selectors": selectors,
                "expires": now + PROBE_TTL_SECONDS,
                "title": str(info.get("title") or "Video")[:200],
            }
        return jsonify(
            probeId=probe_id,
            title=str(info.get("title") or "Video")[:200],
            duration=info.get("duration") if isinstance(info.get("duration"), (int, float)) else None,
            formats=choices,
        )
    except Exception as exc:
        app.logger.warning("VidNest format probe failed (%s)", type(exc).__name__)
        return jsonify(error="Could not inspect this link. Check that it is public and try again."), 502
    finally:
        download_lock.release()


@app.get("/")
def index():
    html = (Path(app.static_folder) / "index.html").read_text(encoding="utf-8")
    return app.response_class(
        html.replace("__VIDNEST_CSRF_TOKEN__", csrf_token),
        mimetype="text/html",
    )


@app.post("/api/download")
def download():
    payload = parse_api_payload()
    try:
        link = validate_media_url(payload.get("url"))
    except ValueError as exc:
        return jsonify(error=str(exc)), 400

    probe_id = payload.get("probeId")
    format_id = payload.get("formatId")
    if not isinstance(probe_id, str) or not isinstance(format_id, str):
        return jsonify(error="Inspect the link and choose a quality first."), 400
    with probe_lock:
        probe = probe_cache.get(probe_id)
        if not probe or probe["expires"] <= time.monotonic():
            probe_cache.pop(probe_id, None)
            return jsonify(error="The format list expired. Inspect the link again."), 400
        if probe["url"] != link:
            return jsonify(error="The link changed. Inspect it again before downloading."), 400
        selector = probe["selectors"].get(format_id)
        title = probe["title"]
    if not isinstance(selector, str):
        return jsonify(error="That format is no longer available. Inspect the link again."), 400

    if not download_lock.acquire(blocking=False):
        response = jsonify(error="A download is already running. Try again shortly.")
        response.headers["Retry-After"] = "5"
        return response, 429

    job_id = uuid.uuid4().hex
    job_dir: Path | None = None
    try:
        used_bytes = sum(
            path.stat().st_size
            for path in DOWNLOAD_DIR.rglob("*")
            if path.is_file() and not path.is_symlink()
        )
        download_limit = min(MAX_DOWNLOAD_BYTES, MAX_STORAGE_BYTES - used_bytes)
        if download_limit <= 0:
            return jsonify(error="Local download storage is full. Remove old files and try again."), 507
        job_dir = Path(tempfile.mkdtemp(prefix=f".{job_id}-", dir=DOWNLOAD_DIR))
        options = {
            "outtmpl": str(job_dir / "media.%(ext)s"),
            "format": selector,
            "merge_output_format": "mkv",
            "noplaylist": True,
            "max_downloads": 1,
            "max_filesize": download_limit,
            "extractor_retries": 1,
            "restrictfilenames": True,
        }
        with yt_dlp.YoutubeDL(options) as ydl:
            info = ydl.extract_info(link, download=True)
            if not isinstance(info, dict):
                raise RuntimeError("No media information was returned.")
        # Select the finished output in the private per-job directory rather
        # than prepare_filename(), which may name a pre-merge video-only file.
        outputs = [
            path
            for path in job_dir.iterdir()
            if path.is_file() and not path.is_symlink()
            and not path.name.endswith((".part", ".ytdl"))
        ]
        merged = [path for path in outputs if path.suffix.lower() == ".mkv"]
        if merged:
            output_path = merged[0].resolve()
        elif len(outputs) == 1:
            output_path = outputs[0].resolve()
        else:
            raise RuntimeError("The download did not produce one complete media file.")
        if output_path.parent != job_dir.resolve():
            raise RuntimeError("The download output path was invalid.")
        extension = output_path.suffix.removeprefix(".").lower()
        if extension not in SAFE_MEDIA_EXTENSIONS or output_path.is_symlink():
            raise RuntimeError("The downloaded file type is not allowed.")
        if not output_path.is_file() or output_path.stat().st_size <= 0:
            raise RuntimeError("The download did not produce a media file.")
        if output_path.stat().st_size > download_limit:
            raise RuntimeError("The file exceeds the download size limit.")
        final_path = DOWNLOAD_DIR / f"{job_id}.{extension}"
        os.replace(output_path, final_path)
        return jsonify(
            title=str(info.get("title") or title or "Video")[:200],
            file=final_path.name,
        )
    except Exception as exc:
        # Keep source URLs, cookies embedded in query strings, and local paths
        # out of logs and client-visible errors.
        app.logger.warning("VidNest download failed (%s)", type(exc).__name__)
        return jsonify(error="The download failed. Check the link and try again."), 502
    finally:
        if job_dir is not None:
            shutil.rmtree(job_dir, ignore_errors=True)
        download_lock.release()


@app.get("/files/<path:name>")
def files(name: str):
    if not SAFE_FILENAME.fullmatch(name):
        abort(404)
    path = DOWNLOAD_DIR / name
    if path.is_symlink() or not path.is_file() or path.resolve().parent != DOWNLOAD_DIR.resolve():
        abort(404)
    return send_from_directory(DOWNLOAD_DIR, name, as_attachment=True, conditional=True)


if __name__ == "__main__":
    # Intentionally loopback-only. Use a properly secured WSGI deployment if
    # remote access is required; do not bind this development server publicly.
    app.run(host="127.0.0.1", port=5000, debug=False, threaded=True)
