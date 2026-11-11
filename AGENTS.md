# VidNest — Workspace Guide (Read Me First)

VidNest is an ad-free, privacy-first media downloader and player ecosystem supporting **1,800+ global platforms** (YouTube, TikTok, Instagram, X/Twitter, Facebook, SoundCloud, and more). It delivers high-resolution downloads up to **4K** and pristine audio extraction in **MP3** and **M4A**.

---

## 1. Designer Fingerprint — Permanent

`Atheerium` (`zaikabdou`) is the owner and designer signature of VidNest. It must remain in all codebases and builds:
1. `mobile-expo/src/theme/tokens.ts` and UI credits ("Designed by Atheerium" / "تصميم Atheerium").
2. `web/static/index.html` meta tags and footer credits.
3. `design/BRIEF.md` changelog and specifications.
4. `README.md` and documentation across all packages.

Do not rename, remove, or alter this attribution.

---

## 2. Modern Stack & Architecture

### A. Cross-Platform Mobile & Web App (`mobile-expo/`)
- Built with **React Native + Expo SDK 54** and TypeScript.
- **Design System:** `Violet Instrument v4` integrating `@astryxdesign/core`, `@astryxdesign/theme-neutral`, and `@stylexjs/stylex` design tokens.
- **Accessibility:** Full Arabic RTL layout (`dir="rtl" lang="ar"`), dual light (`#F7F5FF`) and dark (`#0B0A10`) themes, Forest Studio primary CTA (`#143326` / `#D8F3E5`), WCAG AA compliance, and $\ge 48\text{dp}$ touch targets.
- **Key Modules:**
  - `App.tsx`: Main entry point, theme management, and API base URL configuration.
  - `src/components/CenteredDownloadInstrument.tsx`: The signature centered download instrument UI.
  - `src/components/`: `HomeScreen.tsx`, `DownloadsScreen.tsx`, `LibraryScreen.tsx`, `SettingsModal.tsx`, `BottomNav.tsx`, and bespoke `Icons.tsx`.
  - `src/hooks/useDownloader.ts`: Central state machine for session handling, format probing, downloading, and native share sheet triggering.
  - `src/api/vidnestClient.ts`: Secure client communicating with the Flask backend.
  - `src/utils/urlValidator.ts`: Precision URL validation and format filtering.

### B. Web Platform & Backend API (`web/`)
- Production **Flask** backend with `yt-dlp` and `FFmpeg` for media extraction and stream multiplexing.
- Responsive RTL Arabic web interface (`web/static/index.html`, `web/static/styles.css`, `web/static/app.js`) with self-hosted IBM Plex Sans Arabic fonts.
- SSRF Defense: `web/netguard.py` enforces strict public egress and blocks loopback, private networks (RFC 1918), link-local, and cloud metadata (`169.254.169.254`) across all HTTP redirect hops.
- Session & CSRF token authentication, rate limiting, and sanitized randomized temporary storage.
- Search engine & AI optimization (**SEO / GEO / AEO**): `JSON-LD` schemas, `robots.txt`, `sitemap.xml`, `llms.txt`, and PWA `manifest.webmanifest`.

### C. Companion Telegram Bot (`bot/`)
- `bot/telegram_bot.py`: Bilingual companion bot supporting webhook and polling modes with inline resolution selection and 50 MB upload limits.

---

## 3. Engineering & Security Rules

- **Zero Emojis in UI:** Never use emoji characters in user interface copy or icons. All iconography must use clean, custom vector SVG symbols.
- **Arabic & RTL First:** Primary layout is right-to-left. Use logical CSS properties (`padding-inline`, `margin-inline`, `inset-inline`) and verified RTL styling.
- **Strict HTTPS & SSRF Mitigation:** All URLs must be validated before passing to `yt-dlp`. Never connect to private IP ranges or cloud metadata endpoints.
- **Session & CSRF Security:** All state-changing endpoints require valid CSRF tokens and matching `Origin`/`Sec-Fetch-Site` headers.
- **Clean Workspace:** Never commit `node_modules`, `.env` secrets, binaries (`ffmpeg`, `.apk`), or `.team/` runtime artifacts.

---

## 4. Verification & Testing

Every change must be validated against the automated test suites:

```bash
# 1. Web Backend & Security Tests (24 tests)
PYTHONPATH=web:. python3 -m unittest discover -s web/tests -p 'test_*.py' -v

# 2. Mobile Expo & Design System Verification (11 tests)
node --test mobile-expo/__tests__/*.test.mjs

# 3. Flutter Tests
cd mobile-flutter && flutter test

# 4. Expo App Development Launcher
./tools/run_expo.sh
```

---

## 5. OpenCode Models Execution Pattern (Async Nohup)

When delegating tasks to OpenCode models (`luna 6`, `luna 6 fast`, `deepseek v4.1 flash`), execute them in the background via `nohup` or async subprocess:

```bash
# GPT-6 Luna
nohup opencode run -m openai/gpt-6-luna "اكتب تعليماتك هنا" > .team/result-luna.md 2>&1 &

# GPT-6 Luna Fast
nohup opencode run -m openai/gpt-6-luna-fast "اكتب تعليماتك هنا" > .team/result-light.md 2>&1 &

# DeepSeek V4.1 Flash
nohup opencode run -m opencode/deepseek-v4.1-flash-free "اكتب تعليماتك هنا" > .team/result-main.md 2>&1 &
```

