import concurrent.futures
import ipaddress
import json
import os
import sys
import tempfile
import time
import unittest
from pathlib import Path
from unittest.mock import patch

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
WEB_DIR = REPO_ROOT / "web"
for _p in (str(WEB_DIR), str(REPO_ROOT)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

import app as webapp

try:  # ``web/`` is on sys.path for the documented test command.
    import netguard
except ImportError:  # pragma: no cover - package-style import
    from web import netguard

try:  # The bot is optional; the web-only suite still has to import.
    from bot import telegram_bot
except ImportError:  # pragma: no cover - bot package not on sys.path
    telegram_bot = None


class FakeYoutubeDL:
    def __init__(self, options):
        self.options = options

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def extract_info(self, _url, download=True):
        if not download:
            return {
                "title": '<script>alert("x")</script>',
                "thumbnail": "https://attacker.invalid/thumbnail.jpg",
                "formats": [
                    {"format_id": "22", "ext": "mp4", "height": 720, "width": 1280,
                     "filesize": 1000, "vcodec": "avc1", "acodec": "mp4a", "format": "720p"},
                    {"format_id": "137", "ext": "mp4", "height": 1080, "width": 1920,
                     "filesize": 2000, "vcodec": "avc1", "acodec": "none", "format": "1080p"},
                    {"format_id": "140", "ext": "m4a", "vcodec": "none", "acodec": "mp4a", "format": "audio"},
                    {"format_id": "evil+{bad}", "ext": "mp4", "height": 9999, "vcodec": "avc1", "acodec": "none"},
                ],
            }
        self.output = Path(self.options["outtmpl"].replace("%(ext)s", "mp4"))
        self.output.write_bytes(b"media")
        return {"title": '<script>alert("x")</script>'}

    def prepare_filename(self, _info):
        return str(self.output)


class MergeCompletingYoutubeDL(FakeYoutubeDL):
    """yt-dlp's --max-downloads raises right after a finished download; a
    completed merge must not be reported as a failure."""

    def extract_info(self, url, download=True):
        info = super().extract_info(url, download=download)
        if download and self.options.get("max_downloads") is not None:
            raise webapp.yt_dlp.utils.MaxDownloadsReached()
        return info


class FakeTelegramClient:
    """Records Bot API calls instead of reaching api.telegram.org."""

    def __init__(self):
        self.calls = []

    def _record(self, method, payload):
        self.calls.append((method, payload))
        return {"ok": True}

    def sendMessage(self, **payload):
        return self._record("sendMessage", payload)

    def sendVideo(self, **payload):
        return self._record("sendVideo", payload)

    def sendAudio(self, **payload):
        return self._record("sendAudio", payload)

    def answerCallbackQuery(self, **payload):
        return self._record("answerCallbackQuery", payload)

    def messages(self):
        return [payload for method, payload in self.calls if method == "sendMessage"]


class FakeBotExtractor:
    """Injected yt-dlp stand-in for bot probing and downloading."""

    def __init__(self, formats, size=2_048):
        self.formats = formats
        self.size = size

    def extract_info(self, _url, download=False):
        return {"title": "VidNest Clip", "uploader": "tester", "formats": self.formats}

    def download(self, url, format_id, outdir):
        path = Path(outdir) / f"{format_id or 'media'}.mp4"
        path.write_bytes(b"x" * self.size)
        return str(path)


class VidNestWebTests(unittest.TestCase):
    def setUp(self):
        webapp.app.config.update(TESTING=True)
        self.client = webapp.app.test_client()
        self.base_url = "http://localhost:5000"

    def test_session_and_quick_download_endpoints(self):
        session = self.client.get("/api/session", base_url=self.base_url)
        self.assertEqual(session.status_code, 200)
        self.assertEqual(session.get_json(), {"ok": True, "csrfToken": webapp.csrf_token})
        page = self.client.get("/", base_url=self.base_url)
        self.assertIn(b'id="quick-download-btn"', page.data)
        with tempfile.TemporaryDirectory() as temporary:
            previous_dir = webapp.DOWNLOAD_DIR
            webapp.DOWNLOAD_DIR = Path(temporary)
            try:
                with patch.object(webapp, "validate_media_url", return_value="https://youtube.com/watch?v=x"), \
                     patch.object(webapp.yt_dlp, "YoutubeDL", FakeYoutubeDL):
                    for mode, expected in (("video", "137"), ("audio", "140")):
                        response = self.client.post(
                            "/api/quick-download", base_url=self.base_url,
                            headers={"Origin": self.base_url, "X-VidNest-CSRF": webapp.csrf_token},
                            json={"url": "https://youtube.com/watch?v=x", "mode": mode},
                        )
                        self.assertEqual(response.status_code, 200, response.get_data(as_text=True))
                        data = response.get_json()
                        self.assertEqual(data["mode"], mode)
                        self.assertEqual(data["formatId"], expected)
                        self.assertRegex(data["file"], r"^[0-9a-f]{32}\.mp4$")
            finally:
                webapp.DOWNLOAD_DIR = previous_dir

    def test_landing_page_has_vidnest_brand_and_security_headers(self):
        response = self.client.get("/", base_url=self.base_url)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"VidNest", response.data)
        self.assertIn(webapp.csrf_token.encode(), response.data)
        self.assertIn("default-src 'self'", response.headers["Content-Security-Policy"])
        self.assertEqual(response.headers["X-Frame-Options"], "DENY")
        response.close()

    def test_rejects_untrusted_host_and_cross_origin_post(self):
        response = self.client.get("/", base_url=self.base_url, headers={"Host": "attacker.example"})
        self.assertEqual(response.status_code, 400)
        response = self.client.post(
            "/api/download",
            base_url=self.base_url,
            headers={"Origin": "https://attacker.example"},
            json={"url": "https://youtube.com/watch?v=1"},
        )
        self.assertEqual(response.status_code, 403)

    def test_rejects_wrong_host_port_and_missing_csrf_token(self):
        response = self.client.get("/", base_url="http://localhost:5001")
        self.assertEqual(response.status_code, 400)
        response = self.client.post(
            "/api/download",
            base_url=self.base_url,
            headers={"Origin": self.base_url},
            json={"url": "https://youtube.com/watch?v=1"},
        )
        self.assertEqual(response.status_code, 403)
        response = self.client.post(
            "/api/download",
            base_url=self.base_url,
            headers={
                "Origin": self.base_url,
                "X-VidNest-CSRF": "caf\xe9",
            },
            json={"url": "https://youtube.com/watch?v=1"},
        )
        self.assertEqual(response.status_code, 403)

    def test_format_probe_requires_csrf_and_returns_safe_choices_only(self):
        missing_token = self.client.post(
            "/api/formats", base_url=self.base_url,
            headers={"Origin": self.base_url}, json={"url": "https://youtube.com/watch?v=x"},
        )
        self.assertEqual(missing_token.status_code, 403)
        with patch.object(webapp, "validate_media_url", return_value="https://youtube.com/watch?v=x"), \
             patch.object(webapp.yt_dlp, "YoutubeDL", FakeYoutubeDL):
            response = self.client.post(
                "/api/formats", base_url=self.base_url,
                headers={"Origin": self.base_url, "X-VidNest-CSRF": webapp.csrf_token},
                json={"url": "https://youtube.com/watch?v=x"},
            )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual({"22", "137", "140"}, {item["id"] for item in data["formats"]})
        self.assertNotIn("thumbnail", data)
        self.assertNotIn("url", data)
        self.assertIn("<script>", data["title"])
        self.assertEqual(webapp.probe_cache[data["probeId"]]["selectors"]["137"], "137+bestaudio")

    def test_download_rejects_unprobed_format_selector_without_calling_extractor(self):
        probe_id = "known-probe"
        webapp.probe_cache[probe_id] = {
            "url": "https://youtube.com/watch?v=x",
            "selectors": {"22": "22"},
            "expires": time.monotonic() + 600,
            "title": "Video",
        }
        try:
            with patch.object(webapp, "validate_media_url", return_value="https://youtube.com/watch?v=x"), \
                 patch.object(webapp.yt_dlp, "YoutubeDL") as ydl:
                response = self.client.post(
                    "/api/download", base_url=self.base_url,
                    headers={"Origin": self.base_url, "X-VidNest-CSRF": webapp.csrf_token},
                    json={
                        "url": "https://youtube.com/watch?v=x",
                        "probeId": probe_id,
                        "formatId": "22+{__import__('os').system('id')}",
                    },
                )
            self.assertEqual(response.status_code, 400)
            ydl.assert_not_called()
        finally:
            webapp.probe_cache.pop(probe_id, None)

    def test_url_validation_rejects_userinfo_http_and_unknown_hosts(self):
        for link in (
            "http://youtube.com/watch?v=x",
            "https://user:pass@youtube.com/watch?v=x",
            "https://youtube.com.attacker.invalid/watch?v=x",
            "https://127.0.0.1/admin",
            "https://youtube.com:8443/watch?v=x",
        ):
            with self.subTest(link=link), self.assertRaises(ValueError):
                webapp.validate_media_url(link)

    def test_url_validation_rejects_private_dns_answers(self):
        private_answer = (None, None, None, None, ("10.1.2.3", 443))
        with patch.object(webapp.socket, "getaddrinfo", return_value=[private_answer]):
            with self.assertRaisesRegex(ValueError, "private or local"):
                webapp.validate_media_url("https://youtube.com/watch?v=x")

        multicast_answer = (None, None, None, None, ("224.0.0.251", 443))
        with patch.object(webapp.socket, "getaddrinfo", return_value=[multicast_answer]):
            with self.assertRaisesRegex(ValueError, "private or local"):
                webapp.validate_media_url("https://youtube.com/watch?v=x")

    def test_startup_cleanup_removes_only_job_temp_directories(self):
        with tempfile.TemporaryDirectory() as temporary:
            previous_dir = webapp.DOWNLOAD_DIR
            webapp.DOWNLOAD_DIR = Path(temporary)
            try:
                orphan = Path(temporary) / ("." + "a" * 32 + "-abc123")
                orphan.mkdir()
                (orphan / "partial.mp4.part").write_bytes(b"partial")
                unrelated = Path(temporary) / ".keep-me"
                unrelated.mkdir()
                webapp.cleanup_orphaned_jobs()
                self.assertFalse(orphan.exists())
                self.assertTrue(unrelated.exists())
            finally:
                webapp.DOWNLOAD_DIR = previous_dir

    def test_url_validation_hands_normalized_ascii_host_to_downloader(self):
        public_answer = (None, None, None, None, ("142.250.72.14", 443))
        with patch.object(webapp.socket, "getaddrinfo", return_value=[public_answer]):
            normalized = webapp.validate_media_url("HTTPS://WWW.YOUTUBE.COM:443/watch?v=x#player")
        self.assertEqual(normalized, "https://www.youtube.com/watch?v=x")

    def test_download_uses_random_filename_and_file_serving_is_safe(self):
        with tempfile.TemporaryDirectory() as temporary:
            previous_dir = webapp.DOWNLOAD_DIR
            webapp.DOWNLOAD_DIR = Path(temporary)
            try:
                with patch.object(webapp, "validate_media_url", return_value="https://youtube.com/watch?v=x"), \
                     patch.object(webapp.yt_dlp, "YoutubeDL", FakeYoutubeDL):
                    probe_id = "test-probe"
                    webapp.probe_cache[probe_id] = {
                        "url": "https://youtube.com/watch?v=x",
                        "selectors": {"22": "22"},
                        "expires": time.monotonic() + 600,
                        "title": "Video",
                    }
                    response = self.client.post(
                        "/api/download",
                        base_url=self.base_url,
                        headers={
                            "Origin": self.base_url,
                            "X-VidNest-CSRF": webapp.csrf_token,
                        },
                        json={"url": "https://youtube.com/watch?v=x", "probeId": probe_id, "formatId": "22"},
                    )
                self.assertEqual(response.status_code, 200)
                data = response.get_json()
                self.assertIn("<script>", data["title"])
                self.assertRegex(data["file"], r"^[0-9a-f]{32}\.mp4$")
                file_response = self.client.get("/files/" + data["file"], base_url=self.base_url)
                self.assertEqual(file_response.data, b"media")
                file_response.close()
                self.assertEqual(self.client.get("/files/../../app.py", base_url=self.base_url).status_code, 404)
                self.assertEqual(
                    self.client.get(
                        "/files/" + "a" * 32 + ".html",
                        base_url=self.base_url,
                    ).status_code,
                    404,
                )
                outside = Path(temporary).parent / f"{Path(temporary).name}-outside.txt"
                outside.write_text("not a download", encoding="utf-8")
                link = Path(temporary) / ("a" * 32 + ".mp4")
                link.symlink_to(outside)
                self.assertEqual(
                    self.client.get("/files/" + link.name, base_url=self.base_url).status_code,
                    404,
                )
                outside.unlink()
                webapp.probe_cache.pop("test-probe", None)
            finally:
                webapp.DOWNLOAD_DIR = previous_dir

    def test_busy_download_has_retry_after_header(self):
        self.assertTrue(webapp.download_lock.acquire(blocking=False))
        probe_id = "busy-probe"
        webapp.probe_cache[probe_id] = {
            "url": "https://youtube.com/watch?v=x",
            "selectors": {"22": "22"},
            "expires": time.monotonic() + 600,
            "title": "Video",
        }
        try:
            with patch.object(webapp, "validate_media_url", return_value="https://youtube.com/watch?v=x"):
                response = self.client.post(
                    "/api/download",
                    base_url=self.base_url,
                    headers={
                        "Origin": self.base_url,
                        "X-VidNest-CSRF": webapp.csrf_token,
                    },
                    json={"url": "https://youtube.com/watch?v=x", "probeId": probe_id, "formatId": "22"},
                )
            self.assertEqual(response.status_code, 429)
            self.assertEqual(response.headers.get("Retry-After"), "5")
        finally:
            webapp.download_lock.release()
            webapp.probe_cache.pop(probe_id, None)


    def test_healthz_is_available_without_host_checks(self):
        response = self.client.get("/healthz", base_url=self.base_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {"ok": True, "service": "vidnest-web"})
        response = self.client.get(
            "/healthz", base_url=self.base_url, headers={"Host": "checker.example"}
        )
        self.assertEqual(response.status_code, 200)

    def test_public_mode_accepts_own_host_and_keeps_origin_and_csrf_gates(self):
        previous_public = webapp.PUBLIC_MODE
        webapp.PUBLIC_MODE = True
        public_base = "https://vidnest-web.onrender.com"
        try:
            response = self.client.get("/", base_url=public_base)
            self.assertEqual(response.status_code, 200)
            response.close()
            blocked_origin = self.client.post(
                "/api/formats", base_url=public_base,
                headers={"Origin": "https://attacker.example", "X-VidNest-CSRF": webapp.csrf_token},
                json={"url": "https://youtube.com/watch?v=x"},
            )
            self.assertEqual(blocked_origin.status_code, 403)
            missing_token = self.client.post(
                "/api/formats", base_url=public_base,
                headers={"Origin": public_base},
                json={"url": "https://youtube.com/watch?v=x"},
            )
            self.assertEqual(missing_token.status_code, 403)
            with patch.object(webapp, "validate_media_url", return_value="https://youtube.com/watch?v=x"), \
                 patch.object(webapp.yt_dlp, "YoutubeDL", FakeYoutubeDL):
                allowed = self.client.post(
                    "/api/formats", base_url=public_base,
                    headers={"Origin": public_base, "X-VidNest-CSRF": webapp.csrf_token},
                    json={"url": "https://youtube.com/watch?v=x"},
                )
            self.assertEqual(allowed.status_code, 200)
            self.assertTrue(allowed.get_json()["formats"])
        finally:
            webapp.PUBLIC_MODE = previous_public

    def test_rate_limiter_blocks_flood_per_client(self):
        webapp.rate_limiter.reset()
        previous_limit = webapp.RATE_LIMIT_DOWNLOADS
        webapp.RATE_LIMIT_DOWNLOADS = 2
        try:
            overrides = {"REMOTE_ADDR": "203.0.113.7"}
            codes = []
            last = None
            for _ in range(3):
                last = self.client.post(
                    "/api/download", base_url=self.base_url,
                    environ_overrides=overrides,
                    json={"url": "https://youtube.com/watch?v=x"},
                )
                codes.append(last.status_code)
            self.assertEqual(codes[:2], [403, 403])
            self.assertEqual(codes[2], 429)
            self.assertEqual(last.headers.get("Retry-After"), "60")
        finally:
            webapp.RATE_LIMIT_DOWNLOADS = previous_limit
            webapp.rate_limiter.reset()

    def test_stale_downloads_are_swept_but_fresh_ones_stay(self):
        with tempfile.TemporaryDirectory() as temporary:
            previous_dir = webapp.DOWNLOAD_DIR
            webapp.DOWNLOAD_DIR = Path(temporary)
            try:
                stale = Path(temporary) / ("b" * 32 + ".mp4")
                fresh = Path(temporary) / ("c" * 32 + ".mp4")
                stale.write_bytes(b"old")
                fresh.write_bytes(b"new")
                old_time = time.time() - webapp.STALE_DOWNLOAD_SECONDS - 60
                os.utime(stale, (old_time, old_time))
                webapp.sweep_stale_downloads()
                self.assertFalse(stale.exists())
                self.assertTrue(fresh.exists())
            finally:
                webapp.DOWNLOAD_DIR = previous_dir


    def test_completed_merge_download_is_not_reported_as_failure(self):
        with tempfile.TemporaryDirectory() as temporary:
            previous_dir = webapp.DOWNLOAD_DIR
            webapp.DOWNLOAD_DIR = Path(temporary)
            try:
                with patch.object(webapp, "validate_media_url", return_value="https://youtube.com/watch?v=x"), \
                     patch.object(webapp.yt_dlp, "YoutubeDL", MergeCompletingYoutubeDL):
                    probe_id = "merge-probe"
                    webapp.probe_cache[probe_id] = {
                        "url": "https://youtube.com/watch?v=x",
                        "selectors": {"137": "137+bestaudio"},
                        "expires": time.monotonic() + 600,
                        "title": "Video",
                    }
                    response = self.client.post(
                        "/api/download",
                        base_url=self.base_url,
                        headers={
                            "Origin": self.base_url,
                            "X-VidNest-CSRF": webapp.csrf_token,
                        },
                        json={"url": "https://youtube.com/watch?v=x", "probeId": probe_id, "formatId": "137"},
                    )
                self.assertEqual(response.status_code, 200)
                data = response.get_json()
                self.assertRegex(data["file"], r"^[0-9a-f]{32}\.mp4$")
                self.assertTrue((Path(temporary) / data["file"]).exists())
                webapp.probe_cache.pop("merge-probe", None)
            finally:
                webapp.DOWNLOAD_DIR = previous_dir


    def test_universal_url_validation_accepts_any_public_https_domain(self):
        public_answer = (None, None, None, None, ("93.184.216.34", 443))
        links = (
            "https://www.bilibili.com/video/BV1xx411c7mD",
            "https://vimeo.com/123456789",
            "https://soundcloud.com/artist/track",
            "https://www.twitch.tv/videos/12345",
        )
        with patch.object(webapp.socket, "getaddrinfo", return_value=[public_answer]):
            for link in links:
                with self.subTest(link=link):
                    self.assertEqual(webapp.validate_media_url(link), link)

    def test_netguard_blocks_all_private_and_reserved_ranges(self):
        blocked = (
            "127.0.0.1",
            "10.0.0.1",
            "172.16.0.1",
            "192.168.1.1",
            "169.254.169.254",
            "100.64.0.1",
            "0.0.0.0",
            "224.0.0.1",
            "::1",
            "fe80::1",
            "fc00::1",
            "::ffff:127.0.0.1",
        )
        for address in blocked:
            with self.subTest(address=address):
                self.assertFalse(netguard.is_public_ip(ipaddress.ip_address(address)))
        for address in ("93.184.216.34", "2606:2800:220:1:248:1893:25c8:1946"):
            with self.subTest(address=address):
                self.assertTrue(netguard.is_public_ip(ipaddress.ip_address(address)))

    def test_public_egress_only_blocks_dns_rebinding_and_private_socket_connect(self):
        import socket as socket_module

        # 1) Private, loopback, link-local/metadata targets are rejected at
        # connect() time, before any packet leaves the process.
        for target in (
            ("127.0.0.1", 80),
            ("169.254.169.254", 80),
            ("10.1.2.3", 80),
            ("192.168.0.10", 80),
        ):
            with self.subTest(target=target):
                sock = socket_module.socket(
                    socket_module.AF_INET, socket_module.SOCK_STREAM,
                )
                try:
                    with netguard.public_egress_only():
                        with self.assertRaisesRegex(ValueError, "private or local"):
                            sock.connect(target)
                        with self.assertRaisesRegex(ValueError, "private or local"):
                            sock.connect_ex(target)
                finally:
                    sock.close()

        sock6 = socket_module.socket(socket_module.AF_INET6, socket_module.SOCK_STREAM)
        try:
            with netguard.public_egress_only():
                with self.assertRaisesRegex(ValueError, "private or local"):
                    sock6.connect(("::1", 80))
        finally:
            sock6.close()

        # 2) DNS rebinding: the name was validated as public but resolves to a
        # private address when the connection is actually made.
        rebinding = [
            (socket_module.AF_INET, socket_module.SOCK_STREAM, 6, "", ("127.0.0.1", 80)),
        ]
        sock = socket_module.socket(socket_module.AF_INET, socket_module.SOCK_STREAM)
        try:
            with patch.object(netguard.socket, "getaddrinfo", return_value=rebinding):
                with netguard.public_egress_only():
                    with self.assertRaisesRegex(ValueError, "private or local"):
                        sock.connect(("rebind.attacker.example", 80))
        finally:
            sock.close()

        # 3) The guard is scoped to the opted-in thread/context: normal local
        # sockets still connect outside it.
        listener = socket_module.socket(socket_module.AF_INET, socket_module.SOCK_STREAM)
        listener.bind(("127.0.0.1", 0))
        listener.listen(1)
        port = listener.getsockname()[1]
        try:
            blocked = socket_module.socket(socket_module.AF_INET, socket_module.SOCK_STREAM)
            try:
                with netguard.public_egress_only():
                    with self.assertRaisesRegex(ValueError, "private or local"):
                        blocked.connect(("127.0.0.1", port))
            finally:
                blocked.close()
            client = socket_module.create_connection(("127.0.0.1", port), timeout=2)
            client.close()
        finally:
            listener.close()

    def test_api_platforms_returns_universal_catalog(self):
        response = self.client.get("/api/platforms", base_url=self.base_url)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["universal"])
        self.assertGreaterEqual(data["count"], 1800)
        # The featured catalog ships 13 named sites plus the "universal" entry
        # (the full 1,800+ coverage is advertised through ``count``).
        self.assertGreaterEqual(len(data["platforms"]), 14)
        self.assertIn("universal", {platform["id"] for platform in data["platforms"]})

    def test_seo_and_ai_search_routes(self):
        robots = self.client.get("/robots.txt", base_url=self.base_url)
        self.assertEqual(robots.status_code, 200)
        self.assertEqual(robots.mimetype, "text/plain")
        robots_text = robots.get_data(as_text=True)
        for crawler in ("GPTBot", "PerplexityBot", "ClaudeBot"):
            self.assertIn(crawler, robots_text)

        sitemap = self.client.get("/sitemap.xml", base_url=self.base_url)
        self.assertEqual(sitemap.status_code, 200)
        self.assertIn("xml", sitemap.mimetype)
        self.assertIn("<urlset", sitemap.get_data(as_text=True))

        llms = self.client.get("/llms.txt", base_url=self.base_url)
        self.assertEqual(llms.status_code, 200)
        llms_text = llms.get_data(as_text=True)
        self.assertIn("VidNest", llms_text)
        self.assertIn("Atheerium", llms_text)

        manifest = self.client.get("/manifest.webmanifest", base_url=self.base_url)
        self.assertEqual(manifest.status_code, 200)
        manifest_data = json.loads(manifest.get_data(as_text=True))
        self.assertIn("VidNest", manifest_data["name"])
        self.assertEqual(manifest_data["start_url"], "/")

        page = self.client.get("/", base_url=self.base_url)
        self.assertEqual(page.status_code, 200)
        html = page.get_data(as_text=True)
        for needle in ("application/ld+json", "SoftwareApplication", "FAQPage", "Atheerium"):
            self.assertIn(needle, html)
        page.close()

    def test_concurrent_probes_and_downloads_succeed(self):
        probe_ids = [f"concurrent-probe-{index}" for index in range(2)]
        for probe_id in probe_ids:
            webapp.probe_cache[probe_id] = {
                "url": "https://youtube.com/watch?v=x",
                "selectors": {"22": "22"},
                "expires": time.monotonic() + 600,
                "title": "Video",
            }

        def probe() -> int:
            client = webapp.app.test_client()
            return client.post(
                "/api/formats", base_url=self.base_url,
                headers={"Origin": self.base_url, "X-VidNest-CSRF": webapp.csrf_token},
                json={"url": "https://youtube.com/watch?v=x"},
            ).status_code

        def fetch(probe_id: str) -> int:
            client = webapp.app.test_client()
            return client.post(
                "/api/download", base_url=self.base_url,
                headers={"Origin": self.base_url, "X-VidNest-CSRF": webapp.csrf_token},
                json={
                    "url": "https://youtube.com/watch?v=x",
                    "probeId": probe_id,
                    "formatId": "22",
                },
            ).status_code

        with tempfile.TemporaryDirectory() as temporary:
            previous_dir = webapp.DOWNLOAD_DIR
            webapp.DOWNLOAD_DIR = Path(temporary)
            try:
                with patch.object(webapp, "validate_media_url", return_value="https://youtube.com/watch?v=x"), \
                     patch.object(webapp.yt_dlp, "YoutubeDL", FakeYoutubeDL):
                    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
                        futures = [pool.submit(probe) for _ in range(4)]
                        futures += [pool.submit(fetch, probe_id) for probe_id in probe_ids]
                        results = [future.result(timeout=30) for future in futures]
            finally:
                webapp.DOWNLOAD_DIR = previous_dir
                for probe_id in probe_ids:
                    webapp.probe_cache.pop(probe_id, None)
        self.assertEqual(results, [200] * 6)

    def test_telegram_webhook_and_bot_handlers(self):
        self.assertIsNotNone(telegram_bot, "bot.telegram_bot must be importable")

        previous_secret = webapp.TELEGRAM_WEBHOOK_SECRET
        webapp.TELEGRAM_WEBHOOK_SECRET = "test-webhook-secret"
        try:
            missing = self.client.post(
                "/api/telegram/webhook", base_url=self.base_url, json={"update_id": 1},
            )
            self.assertEqual(missing.status_code, 403)
            wrong = self.client.post(
                "/api/telegram/webhook", base_url=self.base_url, json={"update_id": 1},
                headers={"X-Telegram-Bot-Api-Secret-Token": "not-the-secret"},
            )
            self.assertEqual(wrong.status_code, 403)
            allowed = self.client.post(
                "/api/telegram/webhook", base_url=self.base_url, json={"update_id": 1},
                headers={"X-Telegram-Bot-Api-Secret-Token": "test-webhook-secret"},
            )
            self.assertEqual(allowed.status_code, 200)
            self.assertEqual(allowed.get_json(), {"ok": True})
        finally:
            webapp.TELEGRAM_WEBHOOK_SECRET = previous_secret

        telegram_bot.rate_limiter.reset()
        client = FakeTelegramClient()
        chat_id = 4242

        started = telegram_bot.handle_webhook_update(
            {"message": {"chat": {"id": chat_id}, "text": "/start"}},
            bot_token="", api_caller=client,
        )
        self.assertTrue(started["ok"])
        start_text = client.messages()[-1]["text"]
        self.assertIn("VidNest", start_text)
        self.assertIn("Atheerium", start_text)

        formats = [
            {"format_id": "22", "ext": "mp4", "height": 720, "filesize": 2_000_000,
             "vcodec": "avc1", "acodec": "mp4a", "tbr": 1200},
            {"format_id": "140", "ext": "m4a", "vcodec": "none", "acodec": "mp4a",
             "filesize": 900_000, "tbr": 128},
        ]
        extractor = FakeBotExtractor(formats)
        url = "https://www.youtube.com/watch?v=abc123"
        with patch.object(telegram_bot, "validate_media_url", return_value=url):
            sent = telegram_bot.handle_webhook_update(
                {"message": {"chat": {"id": chat_id}, "text": f"download {url}"}},
                bot_token="", api_caller=client, extractor_cls=extractor,
            )
        self.assertTrue(sent["ok"])
        keyboard_message = client.messages()[-1]
        self.assertIn("reply_markup", keyboard_message)
        callback_data = [
            button["callback_data"]
            for row in keyboard_message["reply_markup"]["inline_keyboard"]
            for button in row
        ]
        self.assertIn("dl:22", callback_data)
        self.assertTrue(all(data.startswith("dl:") for data in callback_data))

        oversized = FakeBotExtractor([
            {"format_id": "137", "ext": "mp4", "height": 1080, "filesize": 60_000_000,
             "vcodec": "avc1", "acodec": "mp4a", "tbr": 4000},
        ])
        with patch.object(telegram_bot, "validate_media_url", return_value=url):
            refused = telegram_bot.handle_webhook_update(
                {"message": {"chat": {"id": chat_id + 1}, "text": url}},
                bot_token="", api_caller=client, extractor_cls=oversized,
            )
        self.assertTrue(refused["ok"])
        refusal = client.messages()[-1]["text"]
        self.assertIn("50MB", refusal)
        self.assertIn("VidNest", refusal)

        download_client = FakeTelegramClient()
        callback = telegram_bot.handle_webhook_update(
            {
                "callback_query": {
                    "id": "callback-1",
                    "data": "dl:22",
                    "from": {"id": chat_id},
                    "message": {"chat": {"id": chat_id}},
                },
            },
            bot_token="", api_caller=download_client, extractor_cls=extractor,
        )
        self.assertTrue(callback["ok"])
        self.assertIn(
            "answerCallbackQuery",
            [method for method, _payload in download_client.calls],
        )
        video_calls = [
            payload for method, payload in download_client.calls if method == "sendVideo"
        ]
        self.assertEqual(len(video_calls), 1)
        self.assertEqual(video_calls[0]["caption"], "720p")
        self.assertFalse(Path(video_calls[0]["video"]).exists())

    def test_cors_allowlist_permits_configured_origins_and_blocks_others(self):
        allowed_origin = "https://aetherdz.github.io"
        preflight = self.client.options(
            "/api/formats",
            base_url=self.base_url,
            headers={
                "Origin": allowed_origin,
                "Sec-Fetch-Site": "cross-site",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type, X-VidNest-CSRF",
            },
        )
        self.assertEqual(preflight.status_code, 200)
        self.assertEqual(preflight.headers.get("Access-Control-Allow-Origin"), allowed_origin)
        self.assertEqual(preflight.headers.get("Vary"), "Origin")
        self.assertIn("X-VidNest-CSRF", preflight.headers.get("Access-Control-Allow-Headers", ""))

        session_resp = self.client.get(
            "/api/session",
            base_url=self.base_url,
            headers={"Origin": allowed_origin, "Sec-Fetch-Site": "cross-site"},
        )
        self.assertEqual(session_resp.status_code, 200)
        self.assertEqual(session_resp.headers.get("Access-Control-Allow-Origin"), allowed_origin)

        with patch.object(webapp, "validate_media_url", return_value="https://youtube.com/watch?v=x"), \
             patch.object(webapp.yt_dlp, "YoutubeDL", FakeYoutubeDL):
            probe_resp = self.client.post(
                "/api/formats",
                base_url=self.base_url,
                headers={
                    "Origin": allowed_origin,
                    "Sec-Fetch-Site": "cross-site",
                    "X-VidNest-CSRF": webapp.csrf_token,
                },
                json={"url": "https://youtube.com/watch?v=x"},
            )
        self.assertEqual(probe_resp.status_code, 200)
        self.assertEqual(probe_resp.headers.get("Access-Control-Allow-Origin"), allowed_origin)

        blocked_preflight = self.client.options(
            "/api/formats",
            base_url=self.base_url,
            headers={"Origin": "https://evil.example", "Sec-Fetch-Site": "cross-site"},
        )
        self.assertEqual(blocked_preflight.status_code, 403)
        self.assertIsNone(blocked_preflight.headers.get("Access-Control-Allow-Origin"))


if __name__ == "__main__":
    unittest.main()
