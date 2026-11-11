<div align="center">

<img src="docs/assets/hero-banner.svg" width="100%" alt="VidNest — Quiet Media Instrument v4 Banner" />

# VidNest

### The Quiet, Privacy-First Media Downloader &amp; Ecosystem
**Ad-Free • Zero Trackers • Zero Emojis in UI • 1,800+ Platforms • 4K UHD &amp; Lossless Audio • Native RTL**

Designed &amp; Architected by [**Atheerium**](https://atheerium.com) (`zaikabdou`)

<br />

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Expo SDK 54](https://img.shields.io/badge/Expo-SDK_54-000020.svg?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.76+-61DAFB.svg?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python 3.12+](https://img.shields.io/badge/Python-3.12+-3776AB.svg?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0+-000000.svg?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![yt-dlp](https://img.shields.io/badge/yt--dlp-Latest-red.svg?style=flat-square)](https://github.com/yt-dlp/yt-dlp)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-Multiplexer-007808.svg?style=flat-square&logo=ffmpeg&logoColor=white)](https://ffmpeg.org/)
[![StyleX](https://img.shields.io/badge/StyleX-Astryx_Tokens-0052CC.svg?style=flat-square)](https://stylexjs.com/)
[![WCAG AA](https://img.shields.io/badge/WCAG_AA-100%25_Compliant-success.svg?style=flat-square)](#quality-benchmarks--accessibility)
[![Tests Passing](https://img.shields.io/badge/Tests-35%2F35_Passing-brightgreen.svg?style=flat-square)](#automated-test-suite)

</div>

---

## Overview

**VidNest** is an ad-free, privacy-hardened media extraction and playback ecosystem built for modern mobile devices and the open web. It enables seamless media downloading from **over 1,800 global video and audio platforms** (YouTube, TikTok, Instagram, X/Twitter, Facebook, SoundCloud, Bilibili, and more) up to **4K UHD** resolution, with lossless **M4A** and studio-grade **MP3** audio multiplexing.

Built upon the **Violet Instrument v4** design language, VidNest rejects the bloated, ad-infested patterns of legacy downloaders:
- **Zero Advertisements & Trackers:** No analytics SDKs, no behavioral fingerprinting, no third-party CDNs.
- **Zero Emojis in User Interface:** Pure, bespoke SVG vector iconography and typographic hierarchy.
- **Arabic-Native (RTL-First):** Engineered natively for right-to-left languages without bidirectional layout glitching.
- **Tactile Sound & Surface Craft:** Dual-theme palettes (`#F7F5FF` Lavender Light & `#0B0A10` Midnight Dark) anchored by high-contrast **Forest Studio** action buttons (`#143326` / `#D8F3E5`).

---

## Visual Showcase

### Mobile Application (React Native + Expo SDK 54)

| Mobile Home (Light Mode) | Mobile Home (Dark Mode) |
|:---:|:---:|
| <img src="docs/screenshots/mobile-light.png" width="360" alt="VidNest Mobile Light Mode" /> | <img src="docs/screenshots/mobile-dark.png" width="360" alt="VidNest Mobile Dark Mode" /> |
| **Centered Download Instrument (Light `#F7F5FF`)** | **Centered Download Instrument (Dark `#0B0A10`)** |

| Mobile Downloads Tab | Mobile Settings Modal |
|:---:|:---:|
| <img src="docs/screenshots/mobile-downloads-dark.png" width="360" alt="VidNest Downloads View" /> | <img src="docs/screenshots/mobile-settings-light.png" width="360" alt="VidNest Settings View" /> |
| **Active & Completed Queue Management** | **Theme, Language, and Server Configuration** |

### Web Platform Companion

| Responsive Web Interface (Desktop 1440px) |
|:---:|
| <img src="docs/screenshots/web-dark-1440.png" width="100%" alt="VidNest Web Companion Dark Mode" /> |
| **Desktop Web Interface — Violet Instrument v4 Dark Theme (`#0B0A10`)** |

| Web Mobile View (Dark 390px) | Web Mobile View (Light 390px) |
|:---:|:---:|
| <img src="docs/screenshots/web-dark-390.png" width="360" alt="VidNest Web Mobile Dark" /> | <img src="docs/screenshots/web-light-390.png" width="360" alt="VidNest Web Mobile Light" /> |

---

## Why VidNest?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            VIDNEST VALUE PILLARS                            │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│ ✦ 1,800+ PLATFORMS   │ ✦ ZERO TRACKERS      │ ✦ VIOLET INSTRUMENT v4        │
│ YouTube, TikTok, X,  │ No ads, no tracking  │ Astryx & StyleX tokens,       │
│ Instagram, Vimeo...  │ telemetry, no CDNs.  │ Forest Studio high-contrast.  │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ ✦ 4K UHD & AUDIO     │ ✦ NETGUARD SSRF      │ ✦ ARABIC RTL NATIVE           │
│ yt-dlp + FFmpeg      │ Hard blocking on     │ WCAG AA compliance,           │
│ stream multiplexer.  │ 127.0.0.1, 169.254.  │ >= 48dp touch targets.        │
└──────────────────────┴──────────────────────┴───────────────────────────────┘
```

- **Universal Platform Support:** Automatic format probing and extraction across 1,800+ sites with URL normalization and deduplication.
- **Smart Stream Merging:** Combines unthrottled adaptive video streams with the highest bitrate audio tracks via non-blocking FFmpeg.
- **Defense-in-Depth SSRF Shield (`netguard.py`):** Pre-flight DNS resolution pinning that strictly blocks loopback, RFC 1918 private subnets, link-local addresses, and cloud provider metadata services (`169.254.169.254`) on connect and every HTTP redirect hop.
- **AI & Traditional Search Ready (SEO/GEO/AEO):** Fully structured `JSON-LD` schemas (`SoftwareApplication`, `WebApplication`, `FAQPage`), PWA `manifest.webmanifest`, `robots.txt`, `sitemap.xml`, and `llms.txt`.

---

## System Architecture

<div align="center">
  <img src="docs/assets/architecture.svg" width="100%" alt="VidNest System Architecture" />
</div>

### Repository Directory Layout

```
VidNest/
├── mobile-expo/                 # Cross-platform Mobile & Web App (Expo SDK 54)
│   ├── App.tsx                  # Application entry point & theme state
│   ├── app.json                 # Expo configuration & deep linking
│   ├── package.json             # React Native dependencies
│   ├── src/
│   │   ├── api/vidnestClient.ts # API client with CSRF & session handling
│   │   ├── components/          # CenteredDownloadInstrument, Screens, Nav, Icons
│   │   ├── hooks/useDownloader  # State machine for download workflow & sharing
│   │   ├── i18n/copy.ts         # Verified Arabic copy (RTL-first)
│   │   ├── theme/tokens.ts      # Violet Instrument v4 / Astryx / StyleX tokens
│   │   └── utils/urlValidator   # HTTPS validation & format helpers
│   └── __tests__/               # Client & mobile design verification tests
├── web/                         # Production Backend & Web Companion
│   ├── app.py                   # Flask REST API, rate limits, session tokens
│   ├── netguard.py              # Outbound socket filter (SSRF / IP blocking)
│   ├── static/                  # Responsive web UI, local IBM Plex Sans Arabic fonts
│   ├── tests/test_app.py        # 24 comprehensive backend test cases
│   └── Dockerfile               # Production container with FFmpeg & Gunicorn
├── bot/                         # Companion Telegram Bot
│   └── telegram_bot.py          # Webhook & polling modes with 50MB ceiling
├── design/                      # Design system specifications & logo assets
│   ├── BRIEF.md                 # Violet Instrument v4 specification & tokens
│   └── brand/                   # Official VidNest vector logos
├── docs/                        # Project documentation & visual assets
│   ├── assets/                  # Hero banner & architecture diagrams (SVG)
│   └── screenshots/             # High-resolution application screenshots
└── tools/                       # Developer automation scripts
    ├── run_expo.sh              # One-shot Expo test & launch script
    └── test_platforms.py        # End-to-end platform extraction test suite
```

---

## Security & Privacy Engineering

VidNest adheres to a strict zero-trust egress model:

1. **NetGuard SSRF Mitigation (`web/netguard.py`)**:
   - Outbound socket connections intercept DNS queries and reject:
     - `127.0.0.0/8` and `::1` (Loopback)
     - `10.0.0.0/8`, `172.16.0.0/12`, and `192.168.0.0/16` (RFC 1918 Private Networks)
     - `169.254.0.0/16` and `fe80::/10` (Link-Local)
     - `100.64.0.0/10` (Carrier-Grade NAT)
     - `169.254.169.254` (AWS, GCP, Azure, OpenStack Metadata Endpoints)
   - Protects against DNS rebinding attacks and inspects every redirect hop.
2. **Strict HTTPS & URL Sanitization**:
   - Rejects non-HTTPS schemes, embedded credentials (`user:pass@host`), and nonstandard ports.
3. **Session & Anti-CSRF Handshake**:
   - State-changing endpoints require an active session token and valid `X-VidNest-CSRF` header, with strict `Origin` and `Sec-Fetch-Site` verification.
4. **Isolated Ephemeral Storage**:
   - Downloads are isolated into temporary directories with cryptographically random UUIDs (`secrets.token_hex(16)`), blocking path traversal attacks. Unclaimed files are purged by scheduled sweepers.

---

## Quick Start

### 1. Mobile App (`mobile-expo/`)

```bash
# Navigate to the mobile package
cd mobile-expo

# Install dependencies
npm install

# Start development server
npx expo start --web       # Launch in browser
npx expo start --android   # Launch on Android device / emulator
npx expo start --ios       # Launch on iOS simulator
```

### 2. Web Server & Backend API (`web/`)

```bash
# Setup Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install backend dependencies
pip install -r web/requirements.txt

# Run development server
python3 -m flask --app web/app.py run --port 5000
```

### 3. Docker Compose (Production Ready)

```bash
# Spin up the Flask backend, FFmpeg multiplexer, and Caddy reverse proxy
docker compose up -d
```

### 4. Telegram Bot Companion

```bash
export TELEGRAM_BOT_TOKEN="your_bot_token"
python3 -m bot.telegram_bot
```

---

## REST API Reference

All requests must include standard security headers (`Origin`, `Sec-Fetch-Site`). State-changing endpoints require `X-VidNest-CSRF`.

| Endpoint | Method | Description | Parameters / Payload |
|---|:---:|---|---|
| `/healthz` | `GET` | Service liveness and health status | None |
| `/api/session` | `GET` | Issues a cryptographic session & CSRF token | None |
| `/api/formats` | `POST` | Probes URL and returns safe downloadable formats | `{"url": "https://..."}` |
| `/api/download` | `POST` | Executes format download and stream merge | `{"url": "...", "probeId": "...", "formatId": "..."}` |
| `/api/quick-download` | `POST` | One-click best format probe & download | `{"url": "...", "mode": "video\|audio\|1080\|720"}` |
| `/files/<uuid>.<ext>` | `GET` | Downloads sanitized output media binary | None (Stream attachment) |

---

## Quality Benchmarks & Accessibility

VidNest is audited with Playwright across multiple viewport breakpoints (`320px`, `360px`, `390px`, `768px`, `1024px`, `1440px`):

| Metric | Target | Verified Status |
|---|:---:|:---:|
| **Horizontal Overflow** | `0px` across all screen widths | ✅ **Zero Overflow (320px–1440px)** |
| **Touch Target Size** | $\ge 44\text{px}$ (Web) / $\ge 48\text{dp}$ (Mobile) | ✅ **100% Compliant** |
| **WCAG AA Contrast** | $\ge 4.5:1$ Normal / $\ge 3:1$ Large | ✅ **Forest Studio & Violet Clear** |
| **Focus Rings** | High-visibility `:focus-visible` | ✅ **Enabled for keyboard users** |
| **Reduced Motion** | Native `prefers-reduced-motion` | ✅ **Transitions disabled safely** |
| **Typography** | Local `IBM Plex Sans Arabic` | ✅ **Zero runtime external CDN requests** |

---

## Automated Test Suite

Run the verified test suites across both backend and mobile codebases:

```bash
# 1. Backend & NetGuard SSRF Shield Tests (24 test cases)
PYTHONPATH=web:. python3 -m unittest discover -s web/tests -p 'test_*.py' -v

# 2. Mobile Expo & Astryx/StyleX Token Tests (11 test cases)
node --test mobile-expo/__tests__/*.test.mjs
```

**Result: 35 passed, 0 failed (100% green).**

---

## Credits & License

- **Design & Architecture:** [**Atheerium**](https://atheerium.com) (`zaikabdou`)
- **Open Source License:** Released under the [MIT License](LICENSE).
