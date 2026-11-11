#!/usr/bin/env python3
"""
tools/test_platforms.py
Comprehensive real-world developer verification suite for VidNest:
1. URL Validation & Contract tests across 10 platforms:
   YouTube, TikTok, Instagram, Facebook, X, Vimeo, SoundCloud, Bilibili, Dailymotion, Reddit.
2. SSRF Security tests confirming internal/metadata IPs are strictly blocked.
3. yt-dlp Extraction tests (real YouTube & SoundCloud probes + auth-gated error mapping).
4. Web API integration tests against the live server on port 5000.
"""

import ipaddress
import json
import os
import sys
import unittest
import urllib.error
import urllib.request
from pathlib import Path
from unittest.mock import MagicMock, patch

REPO_ROOT = Path(__file__).resolve().parent.parent
WEB_DIR = REPO_ROOT / "web"
for p in (str(WEB_DIR), str(REPO_ROOT)):
    if p not in sys.path:
        sys.path.insert(0, p)

import app as webapp
import yt_dlp
from app import NODE_PATH, validate_media_url, yt_dlp_options
from netguard import is_public_ip, public_egress_only


class TestPlatformUrlValidation(unittest.TestCase):
    """Verifies that the URL validator accurately contracts with top platforms."""

    PLATFORM_SAMPLE_URLS = {
        "YouTube": "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
        "TikTok": "https://www.tiktok.com/@tiktok/video/7106594312292453678",
        "Instagram": "https://www.instagram.com/reel/C8r_Bv3M-Q0/",
        "Facebook": "https://www.facebook.com/watch/?v=10153231379946729",
        "X": "https://x.com/Twitter/status/1234567890",
        "Vimeo": "https://vimeo.com/76979871",
        "SoundCloud": "https://soundcloud.com/forss/flickermood",
        "Bilibili": "https://www.bilibili.com/video/BV1xx411c7mD",
        "Dailymotion": "https://www.dailymotion.com/video/x7tgad0",
        "Reddit": "https://www.reddit.com/r/videos/comments/65961h/big_buck_bunny/",
    }

    def test_all_top_platform_urls_are_accepted(self):
        for name, url in self.PLATFORM_SAMPLE_URLS.items():
            with self.subTest(platform=name, url=url):
                normalized = validate_media_url(url)
                self.assertTrue(normalized.startswith("https://"), f"{name} must normalize to HTTPS")
                self.assertNotIn("#", normalized, f"{name} must have fragments stripped")


class TestSSRFSecurityPrevention(unittest.TestCase):
    """Guarantees strict rejection of internal/loopback/cloud-metadata targets."""

    BLOCKED_TARGETS = [
        "http://169.254.169.254",
        "http://169.254.169.254/latest/meta-data/",
        "http://127.0.0.1",
        "http://127.0.0.1:5000",
        "http://[::1]",
        "https://127.0.0.1",
        "https://169.254.169.254",
        "https://[::1]",
        "http://localhost",
        "https://localhost",
        "https://localhost:5000",
        "https://metadata.google.internal",
        "https://metadata.google.internal/computeMetadata/v1/",
        "ftp://example.com/video.mp4",
        "file:///etc/passwd",
    ]

    def test_internal_and_metadata_targets_are_rejected(self):
        for raw in self.BLOCKED_TARGETS:
            with self.subTest(target=raw):
                with self.assertRaises(ValueError):
                    validate_media_url(raw)


class TestYtDlpExtractionProbes(unittest.TestCase):
    """Performs real yt-dlp probing on supported platforms and tests error mapping."""

    def test_nodejs_runtime_is_configured(self):
        opts = yt_dlp_options()
        self.assertIn("js_runtimes", opts, "yt-dlp must have js_runtimes configured")
        self.assertIn("node", opts["js_runtimes"], "node must be registered in js_runtimes")
        node_bin = opts["js_runtimes"]["node"]["path"]
        self.assertTrue(os.path.isfile(node_bin), f"Node binary must exist at {node_bin}")

    def test_youtube_real_extraction_probe(self):
        sample_url = "https://www.youtube.com/watch?v=aqz-KE-bpKQ"
        with public_egress_only():
            with yt_dlp.YoutubeDL(yt_dlp_options(skip_download=True, extract_flat=False)) as ydl:
                info = ydl.extract_info(sample_url, download=False)

        self.assertIsInstance(info, dict)
        title = info.get("title", "")
        self.assertIn("Big Buck Bunny", title, "YouTube sample must extract Big Buck Bunny")
        formats = info.get("formats", [])
        self.assertGreater(len(formats), 10, "YouTube video must expose rich rendition formats")

    def test_soundcloud_real_extraction_probe(self):
        sample_url = "https://soundcloud.com/forss/flickermood"
        with public_egress_only():
            with yt_dlp.YoutubeDL(yt_dlp_options(skip_download=True, extract_flat=False)) as ydl:
                info = ydl.extract_info(sample_url, download=False)

        self.assertIsInstance(info, dict)
        title = info.get("title", "")
        self.assertIn("Flickermood", title, "SoundCloud sample must extract Flickermood")
        formats = info.get("formats", [])
        self.assertGreater(len(formats), 0, "SoundCloud track must have audio formats")

    def test_auth_gated_platform_error_mapping(self):
        """Simulates auth-gated or login-required extractor response without crashing."""
        from yt_dlp.utils import ExtractorError

        def fake_extract_info(*_args, **_kwargs):
            raise ExtractorError("This post requires authentication or login cookies.")

        mock_ydl = MagicMock()
        mock_ydl.__enter__.return_value = mock_ydl
        mock_ydl.extract_info.side_effect = fake_extract_info

        base_url = "http://127.0.0.1:5000"
        with patch.object(webapp.yt_dlp, "YoutubeDL", return_value=mock_ydl):
            with webapp.app.test_client() as client:
                resp = client.post(
                    "/api/formats",
                    base_url=base_url,
                    json={"url": "https://www.instagram.com/reel/C8r_Bv3M-Q0/"},
                    headers={"Origin": base_url, "X-VidNest-CSRF": webapp.csrf_token},
                )
                self.assertEqual(resp.status_code, 502)
                data = resp.get_json()
                self.assertIn("error", data)
                self.assertIn("public", data["error"].lower())


class TestLiveWebAPI(unittest.TestCase):
    """Direct live HTTP tests against the local running server (127.0.0.1:5000)."""

    BASE_URL = "http://127.0.0.1:5000"

    def setUp(self):
        # Fetch fresh CSRF token from /api/session
        req = urllib.request.Request(f"{self.BASE_URL}/api/session")
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode())
                self.csrf_token = data.get("csrfToken")
        except Exception as exc:
            self.skipTest(f"Live server at {self.BASE_URL} not reachable: {exc}")

    def test_api_session_returns_csrf_token(self):
        self.assertTrue(bool(self.csrf_token), "Session must provide a CSRF token")

    def test_api_platforms_catalog(self):
        req = urllib.request.Request(f"{self.BASE_URL}/api/platforms")
        with urllib.request.urlopen(req, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode())
            self.assertGreaterEqual(data.get("count", 0), 1800)

    def test_api_formats_youtube_probe(self):
        payload = json.dumps({"url": "https://www.youtube.com/watch?v=aqz-KE-bpKQ"}).encode()
        req = urllib.request.Request(
            f"{self.BASE_URL}/api/formats",
            data=payload,
            headers={
                "Content-Type": "application/json",
                "X-VidNest-CSRF": self.csrf_token,
                "Origin": self.BASE_URL,
            },
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode())
            self.assertIn("title", data)
            self.assertIn("Big Buck Bunny", data["title"])
            self.assertIsInstance(data.get("formats"), list)
            self.assertGreater(len(data["formats"]), 0)

    def test_api_quick_download_soundcloud_audio(self):
        payload = json.dumps({
            "url": "https://soundcloud.com/forss/flickermood",
            "mode": "audio",
        }).encode()
        req = urllib.request.Request(
            f"{self.BASE_URL}/api/quick-download",
            data=payload,
            headers={
                "Content-Type": "application/json",
                "X-VidNest-CSRF": self.csrf_token,
                "Origin": self.BASE_URL,
            },
        )
        with urllib.request.urlopen(req, timeout=35) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode())
            self.assertEqual(data.get("mode"), "audio")
            self.assertIn("file", data)
            self.assertIn("title", data)
            self.assertIn("Flickermood", data["title"])

            # Verify that the generated media file is safely downloadable via /files/<file>
            file_req = urllib.request.Request(f"{self.BASE_URL}/files/{data['file']}")
            with urllib.request.urlopen(file_req, timeout=10) as file_resp:
                self.assertEqual(file_resp.status, 200)
                self.assertIn("attachment", file_resp.headers.get("Content-Disposition", ""))
                self.assertIn("audio/", file_resp.headers.get("Content-Type", ""))


if __name__ == "__main__":
    unittest.main(verbosity=2)
