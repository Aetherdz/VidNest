# VidNest — Design Brief (v1, 2026-10-18)

ملخص عربي: الاتجاه الجمالي هو "دقة أحادية اللون" — أبيض/أسود/رمادي فقط، تباين عالٍ، مساحات
مريحة، تسلسل طباعي قوي، حركة سريعة هادفة (150-280ms)، بلا إيموجي وبلا ألوان ديناميكية.
الواجهة عربية أولاً مع RTL كامل، وكل شيء مبني على توكنز مركزية في الكود.

This brief is the single source of truth for tokens, components and motion.
Skills (`design/SKILLS.md`) inform it; user constraints override everything.

## 1. Product & primary tasks

VidNest: offline-first media downloader for Arabic-speaking users who want fast,
clean downloads without ads or clutter. The design job is to make ten tabs of
noise feel like one instrument: paste, choose, done.

| Screen | Type | Primary task |
|--------|------|--------------|
| Home | capture | From link to queued download in <= 2 taps |
| Preview sheet | decision | Confident quality/format choice with size estimate |
| Downloads | monitor + control | See progress at a glance; pause/resume/retry/delete |
| Library (completed) | retrieve | Find a file and open/share it fast |
| Player | consume | Zero-chrome playback, gestures, resume position |
| Settings | configuration | Change behavior in seconds, trust what's on |
| Onboarding / permissions | gate | Understand what is needed and why, once |
| Vault | gate | One biometric action, then browse |
| Browser | tool | Detect media on a page, download without ads |

## 2. Aesthetic direction: "Precision Monochrome"

Editorial, utilitarian, instrument-like. Confidence through restraint: hairline
borders instead of shadows, type hierarchy instead of color, whitespace instead
of decoration.

Why this direction:
- Hard user constraint: strict black/white + grays, no emojis, fast motion.
- It is the anti-Snaptube: competitors shout with color and promo clutter; a
  quiet, precise tool reads as premium and trustworthy.
- Monochrome scales cleanly across Light / Dark / AMOLED without theme debt.
- Zero hue = zero color-blindness risk and faster rendering decisions.

Principles only (no asset or string copying) from: editorial print, high-contrast
instrument panels, transit signage, `taste-minimalist` (editorial monochrome),
`apple-design` (fluid, interruptible motion), `emil-design-eng` (invisible details).

## 3. Design tokens (Compose: theme/tokens.kt -> ColorScheme/Typography/Shapes)

### 3.1 Color roles — no hue anywhere; one zinc-based neutral ramp

Light "Paper":
- background #FFFFFF, backgroundAlt #FAFAFA
- surface #F4F4F5, surfaceVariant #EFEFF1
- border #E4E4E7, borderStrong #D4D4D8
- textPrimary #09090B, textSecondary #52525B (7:1), textTertiary #71717A (4.8:1)
- disabledContent #A1A1AA
- primary (inverted CTA) background #09090B, onPrimary #FAFAFA

Dark "Ink":
- background #09090B, surface #18181B, surfaceVariant #27272A
- border #27272A, borderStrong #3F3F46
- textPrimary #FAFAFA, textSecondary #A1A1AA (7.5:1), textTertiary #9CA3AF -> use #8E8E96 (~4.6:1)
- disabledContent #52525B

AMOLED "Void":
- background #000000, surface #0E0E10, surfaceVariant #19191C
- border #1C1C1F, rest as Dark

Semantics: error/warning/success are expressed by icon + weight + copy, never hue
(forbidden). Destructive actions are outlined + confirmed. If a single hue is ever
unavoidable, cap at 8% area and desaturated; default answer is no.
Scrim: 60% black. Contrast gate: body >= 7:1, secondary >= 4.5:1.

### 3.2 Typography — one family, three weights

Family: IBM Plex Sans Arabic (SIL OFL) for both Arabic and Latin; weights 400/500/600.
Bundled in res/font (subset later if size matters). Fallback: system default.
No Inter/Roboto-as-default look, no second display family.

Scale (sp / line-height; Arabic gains +2 line-height via locale-aware style):
- Display   32 / 40, w600 — rare, hero numbers only
- Title     24 / 32, w600 — screen titles
- Headline  18 / 26, w600 — section headers, item titles
- BodyL     16 / 24, w400/500 — comfortable reading, inputs
- Body      14 / 22, w400 — list metadata
- Label     13 / 18, w500 — buttons, chips, tabs
- Caption   12 / 16, w400 — file size, ETA, timestamps

Rules: max two sizes per card; numerals tabular for progress/size/time; never
uppercase (Arabic has no case; Latin stays sentence case).

### 3.3 Spacing & layout

Base 4/8 scale: 2, 4, 8, 12, 16, 20, 24, 32, 48, 64.
Screen padding 16 (compact) / 20 (regular, >= 600dp); card padding 16; section gap 24.
Touch targets >= 48dp; icons 24dp (20dp inline); hairline borders 1dp.
Lists: single column; Library grid 2 columns on >= 600dp (adaptive skill).
No nested cards; one border per surface level.

### 3.4 Shape & elevation

Radii: xs 6 (chips), s 10 (inputs/buttons), m 14 (cards), l 20 (sheets/dialogs), pill 999.
Elevation: flat everywhere; sheets/dialogs use scrim + border only.
Separators: 1dp, full-bleed or inset 16; never both.

### 3.5 Motion

Durations: micro 120ms (press/ripple), small 160ms (fades), medium 220ms
(enter/exit), large 280ms (sheets/panels). Ceiling 300ms.
Easings: enter decelerate (0.05, 0.7, 0.1, 1); exit accelerate (0.3, 0, 0.8, 0.15);
standard (0.2, 0, 0, 1).
Gestures/sheets: springs (medium stiffness, dampingRatio ~0.9), velocity-aware,
interruptible, start from current value (apple-design transfer). Progress bars:
linear, no bounce, no shimmer. Reduce-motion: honor system animator scale 0 ->
crossfades only, sheet snaps.
Haptics: light tick on destructive confirm + download start; nothing else.

### 3.6 Iconography

Outlined only (material-icons-extended). No emoji, no filled decorative icons.
Directional icons mirror in RTL; media icons do not.

## 4. Component inventory (all states required)

- Button: primary (inverted), secondary (border), tertiary (text), destructive
  (border + icon). States: default, pressed (scale .98 + ripple 12%), focused
  (2dp ring, 2dp offset), disabled (40% content), loading (inline 16dp spinner
  replaces label, width retained).
- Input (URL field): forced LTR text + RTL container; trailing paste/clear 48dp;
  states: default, focused (2dp border ink), error (icon + message under), disabled.
- Download row (the core component): thumbnail 56dp (radius s), title 2 lines,
  meta line (size, ETA/speed), progress 2dp linear, status chip; states: queued,
  running, paused, done, failed; swipe = pause/delete; long-press = multi-select.
- Sheet: drag handle 32x4, snap points, scrim 60%; used for quality/format choice
  and share targets. Itemized choice rows with size estimates; "remember choice" row.
- Dialog: destructive confirm only; title + body + two actions, RTL-safe order.
- Navigation: bottom bar (Home / Downloads / Library), 64dp + insets, labels 12sp,
  active tab marked by inverted pill (no color).
- Chips: quality/format; selected = filled ink, unselected = hairline.
- Empty state: 32dp outlined icon + headline + one action. Arabic copy: plain,
  direct, no exclamation marks.
- Error surface: inline card, icon + what happened + single retry; localized from
  the error enum; never a raw stack/exception.
- Snackbar: minimal, only for undo/retry with action.

## 5. Screen-type playbooks (identify type before designing)

- Capture (Home): input first, one CTA; validation inline; clipboard/share entry
  points; recent items secondary.
- Monitor (Downloads): dense glanceable rows, bulk selection, bulk actions;
  filters as segmented tabs (All / Active / Done / Failed).
- Retrieve (Library): search-first, thumbnail grid/rows, per-item overflow actions
  (open/share/rename/move/delete/show in folder).
- Consume (Player): chrome-light; tap toggles controls; gestures: vertical sides =
  volume/brightness, horizontal = seek; PiP; background audio.
- Configure (Settings): grouped rows, sticky group headers, right-aligned controls.
- Gate (Onboarding, Vault): one message, one action; vault = biometric first,
  PIN fallback.

## 6. Rules and bans

- Banned: color accents, gradients, glassmorphism, heavy shadows, decorative
  illustration, emoji, all-caps, purple/blue "AI defaults".
- Hierarchy via scale/weight/spacing only; one primary action per screen.
- RTL: start/end only in code; URLs/numbers LTR-embedded; URL input forced LTR;
  layouts mirror fully; test both locales at every phase.
- All strings in strings.xml (ar + en), plurals proper; no hardcoded copy.
- Edges: every screen must define loading, empty, error, offline states.
- Performance is design: lazy lists with stable keys, images sized/cached (Coil),
  60fps target on mid-range; no animation blocking the main thread.

## 7. Compose implementation notes

- `ui/theme/tokens.kt` (raw values), `Theme.kt` (map to ColorScheme for
  Light/Dark/AMOLED via ThemeMode enum + system default), `Type.kt`,
  `Shape.kt`, `Motion.kt` (durations/easings/springs objects).
- Dynamic color: OFF (documented; user constraint). Dark/light/AMOLED supported.
- Previews: light + dark + RTL + fontScale 1.3 for every shared component.
- No hardcoded dp/sp/color outside theme/tokens; lint rule candidate later.

## 8. Governance

Order of authority: user instructions > this brief > skills > generic conventions.
When a skill (mostly web-oriented) conflicts with Material 3 or Compose idioms,
Material 3/Compose wins and the principle is adapted, not copied.
Revisit this brief at each phase gate; keep a changelog at the bottom.

## Changelog

### v2 — 2026-10-18: "Violet Instrument" palette (user override)

User asked for "أسلوب وألوان مناسبة" and "أفضل من Snaptube" — hue is now allowed
under a strict budget: one violet (#6D3BFF) for primary action, progress and the
brand mark; mint (#3DDBB0 / deep #0A654F) for success signals only; canvases are
calm paper #F7F5FF (light) and ink #0F0D16 (dark). Everything else keeps the v1
neutral ramp. Reference analysis of Snaptube `com.snaptube.premium` 7.67.0
(26,017 classes, ad SDKs, install-packages and overlay permissions) defines what
we avoid: color noise, promos, tracking.

Designer fingerprint `Atheerium` is permanent and lives across: `mobile-expo/src/theme/tokens.ts`, `web/static/index.html`, `README.md`, and this specification. Do not change it.

### v2.1 — 2026-10-18: hardening pass (user override)

Attack-surface reduction, no visual change. `MainActivity`'s http/https
`ACTION_VIEW` + `BROWSABLE` intent filter is removed — share capture
(`ACTION_SEND`, `text/plain`) stays, generic URL handlers do not.
`PlaybackService.onGetSession` now returns the session only to our own package
or to a trusted system controller (`isTrusted`); foreign apps get `null` and are
disconnected. Unit tests and APK verification tooling are being added in
parallel by the same pass.

Designer fingerprint `Atheerium` is unchanged and remains permanent across all components.

### v2.2 — 2026-10-18: appearance modes (user request)

User asked for a night mode, a day mode and a "follow the phone" default that
can still be overridden. `ThemeMode` (SYSTEM / LIGHT / DARK) is persisted in
the `ui_theme` preference store (next to the language choice) and applied
in `MainActivity`; a header button on Home opens a three-option dialog that
applies immediately. Status-bar icons follow the resolved mode on every
release; navigation-bar icons do too from Android 10. Dynamic color stays
off; the light "Paper"
scheme is now reachable from the UI, not only through system dark mode. Hardening in
the same pass: the light success mint (secondary) moved to #0A654F to clear
the contrast gate, the missing Material surface/inverse roles were filled in,
the root surface now paints the resolved canvas, and the player is pinned to
the dark scheme so the always-dark overlay cannot inherit light controls.

### v2.3 — 2026-10-18: Home redesign + language picker (user request)

Home was restructured to the user's mockup spec: a headline, an LTR-pinned URL
field with a paste action, one primary Download CTA, and a "Recent" section
showing the newest two downloads with state and progress. Recent items are
hidden when none exist; reading qualities happens only on an explicit
Download/Go/Retry tap — never on paste or share receipt. Appearance and language
choices moved behind the menu's Settings dialog.

### v2.4 — 2026-10-18: link handling and download recovery

Added bounded, cookie-free redirect resolution for common short-link domains,
network/retry/format defaults for yt-dlp, typed actionable download errors with
copyable diagnostics, and a manual stable engine update action. These changes
are build- and unit-test-verified; actual platform downloads still require
device verification.

### v2.5 — 2026-10-18: VidNest identity

The user-facing product name is now VidNest (package/application ID and
`Atheerium` designer fingerprint remain unchanged). Replaced the launcher mark
with an original nest-cradle/play symbol, including Android themed monochrome
artwork and a scalable SVG lockup in `design/brand/vidnest-logo.svg`. New public
downloads use `Movies/VidNest` or `Music/VidNest`; the private working folder
and fallback lookup keep recognizing legacy download paths so queued and
in-progress items survive the rename.

The same pass fixes misleading Home controls found in review: an unplayable
completed item now shows a delete icon/label, and engine updates use an
update-specific progress message. Recent-item status and progress are
announced politely to accessibility services. Short-link expansion is restricted
to HTTPS platform shorteners and same-platform redirects; generic shorteners are
left to yt-dlp rather than followed by the app's own HTTP client. Private,
carrier-NAT, and IPv6 unique-local resolver answers are rejected, and denied
HEAD requests receive one bounded GET attempt.

### v2.6 — 2026-10-18: notification actions (parity with reference)

Download notifications are now actionable, closing the largest UX gap found in
the SnapTube feature comparison (`design/RE_SNAPTUBE.md`): the per-item failure
notification carries a Retry button that re-queues the item and wakes the
service without opening the app, and the ongoing download notification offers
Pause and Cancel — but only while exactly one item is active, because the
service notification is shared across the whole queue and a per-item action
would be ambiguous when several downloads run at once. Retry is deliberately
withheld for NEED_COOKIES failures, where a retry would fail identically until
a cookie source exists. PendingIntents are immutable, namespaced per
action + item id, and routed through the existing validated action handlers in
`DownloadService.onStartCommand`; no new permissions or exported components.

### v3 — 2026-11-10: 4-Tab navigation, universal extractor, cookie browser & audio parity

Major architecture upgrade adhering strictly to the Violet Instrument design system
and least-privilege security policy, while preserving the permanent `Atheerium` designer fingerprint:

1. **4-Tab Material 3 Navigation (`AppNav`)**:
   - `Home`: Streamlined capture with smart passive clipboard link detector banner, quick-launch platform shortcuts (YouTube, TikTok, Instagram, X, Facebook, SoundCloud, Vimeo), and permanent `Atheerium` designer credit.
   - `Downloads`: Full-featured queue monitor with segmented filter chips (`All`, `Active`, `Completed`, `Failed`), real-time progress indicators, pause/resume/retry/cancel/delete controls, and direct browser login recovery for `NEED_COOKIES`.
   - `Library`: Instant media manager for completed items with live search, media type filters (`All`, `Video`, `Audio`), direct playback via `PlayerActivity`, and scoped sharing through `content://` URIs.
   - `Browser`: Hardened, in-app media detection & cookie capture browser.
2. **Hardened Cookie Browser (`BrowserScreen`)**:
   - Security-first `WebView` integration: `allowFileAccess = false`, `allowContentAccess = false`, `mixedContentMode = MIXED_CONTENT_NEVER_ALLOW`, `multipleWindows = false`, `geolocation = false`, and no JavaScript interfaces exposed.
   - Navigation filter allowing strictly `http(s)` URLs while blocking `intent:`, `file:`, `content:`, and `data:` schemes.
   - Automated media stream/page detection (`.m3u8`, `.mpd`, `.mp4`, `.m4a`, `.mp3`) and direct session cookie extraction into `CookieStore` (`NetscapeCookies`), solving `NEED_COOKIES` authentication challenges with one tap.
3. **Universal Quality Probing & Dual Audio Extraction**:
   - Enhanced `QualityDialog` featuring rich media thumbnails via Coil 3, duration, channel/uploader metadata, and per-resolution file size estimates.
   - Complete audio format choice: fast original `M4A` (direct stream extraction) and compatible `MP3` (ffmpeg transcode).
4. **Web & Bot Companion Readiness**:
    - Shared multi-platform architecture enabling web and Telegram bot companions with NetGuard SSRF mitigation and unified cookie-aware extraction.

### v4 — Violet Instrument v4 (web + app parity)

The web and Android app share the Violet Instrument v4 tokens: canvas `#F6F4FF`
/ `#0E0C18`; surface `#FFFFFF` / `#181527`; primary `#6A4CFF` / `#9A85FF`;
forest CTA `#0F2A24`; mint `#CFF5E3`; and outline `#DCD7EE` / `#2E2947`.
Typography uses self-hosted IBM Plex Sans Arabic. Navigation uses a floating pill
with interruptible spring motion. Web download progress moves through staged
states—preparing, fetching, processing and ready—with clear, localized feedback.
Web CSP restricts fonts to `font-src 'self'`. The permanent designer identity
remains `Atheerium`.

### v5 — VidNest identity alignment (user override, 2026-11-11)

This user brief supersedes v4's violet, sand, and terracotta color roles for the
Flutter app and website. Keep existing product content and API contracts, and
retain the permanent `Atheerium` attribution. The Flutter mock extractor must
not be presented as a production download engine. Screens in the Flutter
preview explicitly disclose that simulated tasks do not save real files.

#### Design plan

- **Palette:** Paper `#FFFFFF`; mist surface `#F6F7F9`; navy ink `#101828`;
  secondary text `#667085`; VidNest orange `#F26B1D`. Orange marks the primary
  download action and active navigation. Dark mode uses a separate navy surface
  ramp while retaining the same orange accent.
- **Type:** IBM Plex Sans Arabic as the single family, self-hosted on both
  surfaces. Title 28, body 16, secondary 13; URL text remains explicitly LTR.
- **Layout:** 8-point spacing; 16-point content cards; 28-point primary button
  radius; safe-area-aware floating three-tab app navigation. Site content stays
  mobile-first and RTL, aligned to the inline start edge.
- **Principle:** Make the product's actual task—paste, choose, save—the
  memorable feature. Keep the surrounding UI quiet, without gradients or
  decorative card repetition. Use rounded Material Symbols in Flutter and
  preserve the site's lightweight vector icon treatment.

```text
App (RTL)                         Website (RTL)
┌───────────────────────┐         ┌──────────────────────────────────┐
│ settings       logo   │         │ logo                    navigation│
│ link field       Paste│         │ headline + Download  │ phone demo │
│ [Download]           │         ├──────────────────────────────────┤
│ preview / quality    │         │ platforms                         │
│ platform chips       │         │ four benefits                     │
│ recent downloads     │         │ paste → quality → save            │
│ Home Downloads Library│         │ FAQ / privacy / contact           │
└───────────────────────┘         └──────────────────────────────────┘
```

#### Review against the brief

The palette, type scale, corner radii, navigation count, and screen sections
follow the user's explicit values rather than the previous design defaults.
The phone mockup is the one visual signature; cards remain limited to useful
content groups. Dark mode is a separate palette because the brief requires it
but specifies only light-mode hex values. Real media metadata and thumbnails
must come from available local files; missing files or metadata get a neutral
fallback instead of invented values.
