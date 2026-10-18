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


if __name__ == "__main__":
    unittest.main()
