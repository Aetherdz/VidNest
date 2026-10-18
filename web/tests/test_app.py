import os
import tempfile
import time
import unittest
from pathlib import Path
from unittest.mock import patch

import app as webapp


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


class VidNestWebTests(unittest.TestCase):
    def setUp(self):
        webapp.app.config.update(TESTING=True)
        self.client = webapp.app.test_client()
        self.base_url = "http://localhost:5000"

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


if __name__ == "__main__":
    unittest.main()
