# Movid — Phase 0 Audit

Scope: every source file under `app/src/main` (18 Kotlin files, 11 res files), `AndroidManifest.xml`, all
Gradle/properties/proguard files. Read-only inspection; no builds run. LOC = physical lines.
Total production Kotlin: **1,269 LOC**. Total source: **1,921 LOC** including build/config.

---

## 1. File inventory

| Path | Role | LOC |
|---|---|---|
| `app/src/main/java/com/movid/app/ui/FetchScreen.kt` | The entire UI. URL field, quality dialog, queue list, row actions. | 327 |
| `app/src/main/java/com/movid/app/engine/DownloadService.kt` | Foreground `dataSync` service: queue pump, worker jobs, notifications. | 262 |
| `app/src/main/java/com/movid/app/engine/FetchEngine.kt` | Blocking wrapper over youtubedl-android + ffmpeg. Init, probe, download, cancel. | 192 |
| `app/src/main/java/com/movid/app/core/queue/DownloadQueue.kt` | Pure in-memory queue state machine (the only testable core). | 161 |
| `app/build.gradle.kts` | Single-module build, all dependencies. | 115 |
| `app/src/main/java/com/movid/app/core/cookies/NetscapeCookies.kt` | Netscape cookies.txt parser/serializer. **No callers.** | 100 |
| `app/src/main/java/com/movid/app/ui/theme/Theme.kt` | B/W Material 3 light+dark schemes. | 90 |
| `app/src/main/java/com/movid/app/data/DownloadRepository.kt` | Single owner of queue + Room persistence, mutex-guarded. | 89 |
| `app/src/main/java/com/movid/app/i18n/AppLanguage.kt` | Locale enum, SharedPreferences store, `withAppLanguage`. | 66 |
| `app/src/main/java/com/movid/app/core/yt/YtDlpErrorClassifier.kt` | Regex mapping of yt-dlp stderr → `YtDlpError`. Pure, testable. | 65 |
| `app/src/main/java/com/movid/app/AppGraph.kt` | Manual DI singleton object + daily yt-dlp auto-update. | 54 |
| `app/src/main/java/com/movid/app/data/DownloadEntity.kt` | Room entity + `QueueItem`↔`DownloadEntity` mappers. | 53 |
| `app/src/main/AndroidManifest.xml` | Permissions, single activity, one service. | 37 |
| `app/src/main/res/values/strings.xml` | 30 strings (EN). | 34 |
| `app/src/main/res/values-ar/strings.xml` | 30 strings (AR). | 34 |
| `app/src/main/res/drawable/ic_launcher_fg.xml` | Launcher foreground vector. | 28 |
| `app/src/main/java/com/movid/app/MainActivity.kt` | Entry activity, `enableEdgeToEdge`, locale wrap. | 26 |
| `app/src/main/java/com/movid/app/data/DownloadDao.kt` | 4 Room queries (`observeAll` never used). | 25 |
| `app/src/main/java/com/movid/app/core/yt/DownloadSpec.kt` | Quality spec + yt-dlp `-f` selector. Pure, testable. | 19 |
| `app/src/main/java/com/movid/app/data/AppDatabase.kt` | Room DB v2, destructive migration. | 18 |
| `app/src/main/res/xml/data_extraction_rules.xml` | Excludes every domain from backup + transfer. | 16 |
| `app/proguard-rules.pro` | R8 rules (2 of 4 targets nonexistent packages). | 14 |
| `build.gradle.kts` | Plugin version pins + build dir relocation. | 13 |
| `app/src/main/res/drawable/ic_notification_download.xml` | Notification small icon. | 9 |
| `app/src/main/java/com/movid/app/MovidApp.kt` | `Application`, calls `AppGraph.init`. | 9 |
| `gradle.properties` | JVM args, caching, non-transitive R. | 8 |
| `app/src/main/res/values/themes.xml` | Light launch theme (bars transparent). | 8 |
| `app/src/main/res/values-night/themes.xml` | Night launch theme. | 8 |
| `settings.gradle.kts` | Repos + `include(":app")` (single module). | 17 |
| `app/src/main/res/values/colors.xml` | 2 colors. | 4 |
| `app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml` | Adaptive icon. | 5 |
| `app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml` | Adaptive icon (round). | 5 |
| `gradle/wrapper/gradle-wrapper.properties` | Gradle 8.13 + SHA. | 9 |

**Absent:** `app/src/test/`, `app/src/androidTest/` (dirs do not exist — 3 test deps declared, **zero tests**),
`assets/`, no `baseline-prof.txt`, no `localeConfig`, no `FileProvider`.

---

## 2. Confirmed bugs

### B1 — URL field renders `//:https` (RTL). **CONFIRMED**
`ui/FetchScreen.kt:94-103` — the `OutlinedTextField` sets only `value/onValueChange/label/placeholder/singleLine`.
No `TextStyle(textDirection = TextDirection.Ltr)` and no `LocalLayoutDirection` override, while
`AndroidManifest.xml:18` declares `supportsRtl="true"` and `i18n/AppLanguage.kt:55` calls `config.setLayoutDirection(locale)`
for `ar`. Result: the `https://…` placeholder (`values/strings.xml:12`) and any pasted URL are reordered by the
bidi algorithm. Fix: wrap the field in `CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Ltr)`
or set `textStyle = TextStyle(textDirection = TextDirection.Ltr, textAlign = TextAlign.Start)`.

### B2 — Title overlaps the status bar. **CONFIRMED**
`MainActivity.kt:19` calls `enableEdgeToEdge()` (transparent bars, content draws behind them), but
`ui/FetchScreen.kt:84-92` renders the title `Text` inside a `Column` whose only modifier is
`.padding(16.dp)` — no `Scaffold`, no `WindowInsets`, no `safeDrawingPadding()`, no
`statusBarsPadding()`. The title therefore draws under the status bar. The XML at
`values/themes.xml:5-7` sets `windowLightStatusBar`/`statusBarColor` that are both ignored under `targetSdk 35`.
Fix: `Scaffold(contentWindowInsets = WindowInsets.safeDrawing)` or `Modifier.safeDrawingPadding()` on the root.

### B3 — Start-up blocks the download list on a network call. **CONFIRMED (high impact)**
`AppGraph.kt:40-43` runs `repository.restore()` **then** `maybeUpdateEngine()` sequentially in one coroutine.
`maybeUpdateEngine` → `fetchEngine.updateBinary()` (`AppGraph.kt:51`, `FetchEngine.kt:47-53`) performs a blocking
HTTP download of a fresh yt-dlp from GitHub. On first launch (`last == 0L`, `AppGraph.kt:49-50`) the `StateFlow`
is not published until that finishes, so `FetchScreen` renders an **empty list for the duration of the download**.
Fix: separate scopes, restore first, update in a detached scope.

### B4 — One notification ID for two concurrent downloads. **CONFIRMED**
`core/queue/DownloadQueue.kt:32` sets `maxConcurrent = 2`, but
`engine/DownloadService.kt:202-214` builds and posts the progress notification under a single
`SERVICE_NOTIFICATION_ID` (`:39`) with no tag. The second item's progress **overwrites** the first's.

### B5 — "Pause" on a running download keeps downloading. **CONFIRMED (race)**
`ui/FetchScreen.kt:157-166`: `repo.pause(item.id)` runs first, then `if (item.state == DownloadState.RUNNING)` —
`item` is the **stale render-time snapshot**. If the item flipped QUEUED→RUNNING between composition and the tap,
`stopWork` is never called: the yt-dlp process keeps running, the row shows PAUSED, and every progress update is
dropped by `DownloadQueue.kt:72`. Same stale-snapshot defect in `onRemove` (`FetchScreen.kt:180-187`).

### B6 — Cancel is unreachable dead code. **CONFIRMED**
`QueueRow` declares `onCancel` (`FetchScreen.kt:266`), it is supplied at `:173` as
`DownloadService.cancel(context, item.id)`, and it is **never invoked** — the `when` at `:299-310` renders
Pause/Resume/Retry only. Consequently `DownloadService.cancel` (`:53-59`), `ACTION_CANCEL_ITEM` (`:42`, `:103-114`)
and `repository.cancel` are unreachable. `DownloadState.CANCELLED` (`:306`) can therefore only be produced by
`queue.cancel()`, which nothing calls. Users cannot cancel a download; the "retry" affordance offered at `:306`
for `CANCELLED` is likewise dead.

### B7 — Concurrent `pump()` can start a paused item. **CONFIRMED (race)**
`DownloadService.pump()` (`:119-125`) is `suspend` with no mutual exclusion and is invoked from three places:
`onStartCommand` (`:93`), `job.invokeOnCompletion` (`:143`), and `ACTION_CANCEL_ITEM` (`:110-113`).
`DownloadRepository.nextStarts()` releases the mutex before reading `_items.value`
(`data/DownloadRepository.kt:71-73`), so the returned `QueueItem` snapshot can be stale by the time
`launchItem` (`:127-146`) starts the worker — an item paused in that window is still started.

### B8 — Full-table Room rewrite on every progress tick. **CONFIRMED (perf)**
`DownloadService.kt:171-175` launches a coroutine per 1% step (up to 101/item). Each runs
`DownloadRepository.lockPublish` → `persistLocked()` (`:84-89`) which does `dao.all()` (a full `SELECT`) followed
by an `@Upsert` of **every** item, then assigns `_items.value = queue.items` (`:79`) where
`DownloadQueue.items` copies the whole list (`core/queue/DownloadQueue.kt:37`). With `maxConcurrent = 2`
that is up to ~200 full-table rewrites + list copies per second, each triggering a `StateFlow` emission that
recomposes every visible row. No `distinctUntilChanged`, no throttling below 1%.

### B9 — `startForeground` can crash on Android 15+. **CONFIRMED (forward risk)**
`DownloadService.kt:193-198` calls `ServiceCompat.startForeground(..., FOREGROUND_SERVICE_TYPE_DATA_SYNC)`
**unguarded**, with `targetSdk 35` (`app/build.gradle.kts:17`). Android 15 enforces a 6-hour/24h cap on
`dataSync` foreground services; exceeding it throws inside the service and kills the process. `FOREGROUND_SERVICE_DATA_SYNC`
is declared (`AndroidManifest.xml:7`) so permission is fine — the risk is purely the time budget.
Long multi-file batch downloads will hit it. Migrating to a `mediaProcessing`/`shortService` type or a
WorkManager-anchored foreground worker is the fix.

### B10 — Probe failures discard the real reason. **CONFIRMED**
`FetchScreen.kt:112-121` wraps the probe in `runCatching { … }.onFailure { probeFailed = true }` and never reads
the exception. `FetchEngine.probeQualities` (`:96-99`) puts yt-dlp's **stderr** into the `IllegalStateException`
message, and `YtDlpErrorClassifier` (`core/yt/YtDlpErrorClassifier.kt:60-65`) is never applied to probe errors.
An age-restricted video, a geo-block and a typo'd URL all render the same
`fetch_probe_failed` string (`values/strings.xml:15`) in both languages.

### B11 — Downloads are invisible outside the app. **CONFIRMED (architectural)**
`DownloadService.kt:159-161` writes to `getExternalFilesDir(Environment.DIRECTORY_MOVIES)/Movid/<uuid>.%(ext)s`
— app-private external storage, filename is the queue **UUID**. No `MediaStore` insert, no `FileProvider` in
`AndroidManifest.xml`, no `WRITE_EXTERNAL_STORAGE`/scoped-storage handling, no SAF. Consequences: files never
appear in the gallery or any file manager, are deleted on uninstall, cannot be shared or opened by another app,
and cannot be played by the planned Media3 player. Every completed-item action in the target
(open/share/rename/move/show-in-folder) is blocked on this one decision.

### B12 — "Pause" is not "resume". **CONFIRMED (promise gap)**
`FetchEngine.download` (`FetchEngine.kt:138-152`) passes only `-o`, `--no-playlist`, `--newline`, `-f`,
`-x/--audio-format/--audio-quality` or `--merge-output-format`, and `--cookies`. There is **no `-c/--continue`**,
so pausing kills the process and "resuming" restarts from byte 0. There is also no `.part` cleanup anywhere,
so partial files accumulate on every pause/cancel. The UI offers Pause/Resume (`FetchScreen.kt:299-304`) and the
target promises resume — this is currently a lie.

### B13 — Plain-HTTP links are accepted then blocked. **CONFIRMED**
`FetchEngine.requireHttpUrl` (`:186-191`) explicitly allows `scheme == "http"`, but the app declares neither
`usesCleartextTraffic` nor a network-security config, so cleartext is blocked by the platform on API 28+ for every
process in the app, including the bundled Python. The user pastes an `http://` link, gets `NETWORK`, and is told
nothing about why. Either reject `http://` with a clear message or allow cleartext deliberately.

### B14 — No scheme normalisation. **CONFIRMED (minor UX)**
Same method (`:186-191`): `URI("youtube.com/watch?v=x")` has a null scheme → `require` throws → generic
`fetch_probe_failed`. No auto-`https://` prefixing, no host-only paste support, which is exactly what the share
intent and clipboard flows will produce.

### B15 — Notification permission re-prompted on every screen open. **CONFIRMED (minor)**
`FetchScreen.kt:68-75` registers a launcher and fires it from `LaunchedEffect(Unit)` on **every** composition of
the only screen, with no rationale and no "permanently denied" handling. Downloads continue with no visible
notification if denied.

### B16 — `outputPath` column is permanently NULL. **CONFIRMED (dead schema)**
`data/DownloadEntity.kt:18` declares `outputPath`, but `toEntity` (`:37`) hardcodes `outputPath = existing?.outputPath`
and the only metadata setter in the whole app is `updateTitle` (`DownloadRepository.kt:44`). Nothing ever writes a
path. Same for `createdAt`/`updatedAt` being write-only (`:41-42`) — no query filters on them.

---

## 3. Architecture gap analysis vs target

| Target capability | Today | Evidence |
|---|---|---|
| MVVM | **Absent.** No `ViewModel` anywhere. `lifecycle-viewmodel-compose:2.9.0` is declared but never imported. | `app/build.gradle.kts:75`; grep for `ViewModel` in `app/src` → 0 hits |
| Clean layers | Two pseudo-layers only: `core/` (pure) + everything else. `engine/` imports `AppGraph` directly. | `engine/DownloadService.kt:16, 99, 120, 136, 151-152, 173, 253` |
| Hilt | **Absent.** Hand-rolled `object AppGraph` with `lateinit var`s. | `AppGraph.kt:13-31` |
| Where state lives | **In the composable.** `url`, `probing`, `probe`, `probeFailed` are plain `remember { mutableStateOf }` — lost on process death; no `rememberSaveable`. | `ui/FetchScreen.kt:62-65` |
| Business logic in UI | The composable drives probe → pick → `repo.add` → `DownloadService.kick` inline; the Activity/Service boundary is implicit. | `ui/FetchScreen.kt:105-209` |
| Modules | **Single module** (`:app`). Target `ui/domain/data/downloader/player` not present. | `settings.gradle.kts:18` |
| WorkManager | **Absent.** No dependency, no class, no usage. The service is started only by UI calls. | grep → 0 hits |
| DataStore | Declared, **unused**. Language + yt-dlp timestamp use raw SharedPreferences. | `app/build.gradle.kts:95`; `AppGraph.kt:48`, `AppLanguage.kt:32` |
| Room | Present and clean — `Flow` DAO, `@Upsert`, proper mappers. Genuinely the strongest part of the codebase. | `data/DownloadDao.kt`, `DownloadRepository.kt` |
| Repository as SSOT | Correct: one `StateFlow`, mutex-guarded, both UI and service mutate through it. | `data/DownloadRepository.kt:19-89` |
| Testability | **Zero tests.** `app/src/test` does not exist despite 3 test deps. The three pure classes — `DownloadQueue`, `NetscapeCookies`, `YtDlpErrorClassifier` (plus `DownloadSpec.formatSelector`) — are trivially unit-testable and would pay for themselves immediately. | `app/build.gradle.kts:111-113` |
| Process-scoped DI correctness | `AppGraph.init` (`:33-44`) is idempotent but launches restore on a detached `Dispatchers.Default` scope; the service can call `nextStarts()` against an empty in-memory queue before `restore()` publishes. Self-heals **only if the UI is open** (`FetchScreen.kt:80-82`). | `AppGraph.kt:40-43` |

---

## 4. Engine gap analysis

### What `FetchEngine` / `DownloadService` do today
- `FetchEngine.ensureInitialized()` (`FetchEngine.kt:32-40`): double-checked-locked init of `YoutubeDL` + `FFmpeg`. Correct and thread-safe.
- `updateBinary()` (`:47-53`): silent, unverified, **unconsented** replacement of the bundled yt-dlp from GitHub on first launch and daily thereafter (`AppGraph.kt:47-54`). No user-facing version, no opt-in, no integrity check — a real supply-chain/privacy finding for an app that markets "no trackers".
- `probe()` (`:64-74`): `getInfo` → id/title/uploader/thumbnail. **The uploader and thumbnail are returned and then discarded** — `probeQualities` (`:100-117`) reads only `title` and `formats`. The data needed for the preview card is already on hand.
- `probeQualities()` (`:88-118`): `-J --no-playlist`, hand-rolled JSON walk to collect distinct `height` values and an `acodec != "none"` flag. Runs on `Dispatchers.IO` (`FetchScreen.kt:113`) with **no timeout and no cancel** — the button stays disabled (`:125`) until it returns.
- `download()` (`:128-167`): builds a `YoutubeDLRequest`, maps stdout progress → `onProgress`, classifies stderr → `Result`. `requireHttpUrl` (`:183-192`) is a genuine and well-implemented **argument-injection guard** (`!startsWith("-")` + URI scheme/host check). Keep it.
- `DownloadService`: `LifecycleService`, single `SERVICE_NOTIFICATION_ID`, `ConcurrentHashMap<String, Job>` workers (`:74`), `START_NOT_STICKY`, stop-when-idle via repository truth (`:249-262`). Correctly guards item ids with a UUID check before they reach the engine (`:96`, `:106`). Solid bones; everything is missing on top.

### yt-dlp capability notes (what is actually available)
- **Already present and correctly used:** bundled Python + yt-dlp + ffmpeg (`app/build.gradle.kts:101-102`), which gives `-f` selectors, `-x/--audio-format`, `--merge-output-format`, `--cookies`, `--newline`, and the native downloader.
- **`--concurrent-fragments N` / `-N`** — available via the bundled yt-dlp's native downloader. This is the correct path to "beat Snaptube on speed": parallel HLS/DASH fragment fetches on a single URL, no new binary. Must be **gated on a minimum Wi-Fi / unmetered connection**, since it multiplies concurrent sockets. Verify the bundled build's yt-dlp version at runtime before enabling (add `--version` to a startup probe).
- **`--http-chunk-size` + `-N`** — multi-connection range requests on a single progressive file; same caveat.
- **`--downloader ffmpeg` / `dash`** — available since ffmpeg is bundled. Slower than native; useful fallback when the native downloader fails.
- **aria2c is NOT bundled.** `youtubedl-android`'s `ffmpeg` artifact ships only ffmpeg. `yt-dlp --external-downloader aria2c` requires an `aria2c` binary that does not exist in this APK. **Do not promise aria2c.** If multi-connection is wanted, use `-N`.
- **`--continue` / `-c`** — available, unused (B12). This is the single cheapest real "resume" win: persist the output template so the `.part` file is reused.
- **Capability checks worth noting:** no `--write-subs`/`--sub-langs`, no `--write-thumbnail`, no `--embed-metadata`/`--embed-thumbnail`, no `--cookies-from-browser`, no `--playlist-items`/`--yes-playlist`, no `--match-filter`, no `--download-archive` (perfect for dedupe), no `--concurrent-fragments`, no `--retries`/`--fragment-retries`/`--socket-timeout`, no `--throttled-rate` (speed limit), no `--limit-rate` per job, no `--geo-bypass`.

### Format / quality matrix — gaps
| Target | Today | Evidence |
|---|---|---|
| Video best quality | `bestvideo+bestaudio/best`, merged to mp4 | `core/yt/DownloadSpec.kt:18`; `FetchEngine.kt:148` |
| Height cap | `bestvideo[height<=H]+bestaudio/best[height<=H]` | `DownloadSpec.kt:17` |
| Audio MP3 | `-x --audio-format mp3 --audio-quality 0` → **re-encode** (lossy, CPU-heavy) | `FetchEngine.kt:144-146` |
| Audio M4A / OPUS | **Missing** — `-x --audio-format m4a` is a stream copy, near-instant | target only |
| Subtitles | **Missing** — no `--write-subs`, no `subLangs` field | target only |
| Thumbnail | **Missing** as a *download*, though `probe()` already fetches the URL and discards it | `FetchEngine.kt:72` vs `:100-117` |
| ffmpeg merge/convert | Present (`--merge-output-format mp4`) | `FetchEngine.kt:148` |
| DRM skip message | **Missing.** No `--no-check-certificates`/`--no-check-formats`; a DRM stream fails and lands in `UNKNOWN` (`YtDlpErrorClassifier.kt:64`) with no explanation. Needs an explicit `DRM_PROTECTED` classification + "this content is DRM-protected, skipping" copy. | target only |
| Estimated size / duration | **Missing.** Neither is probed nor stored | target only |
| Format list w/ containers | **Missing** — only heights are surfaced; no ext/fps/codec/size shown | target only |

### Notification richness
Today: one channel (`DownloadService.kt:79-87`, `IMPORTANCE_LOW`), a determinate 0–100 bar, app name as title,
`$name - N%` as text, no actions, no speed, no ETA, no per-item identity (`SERVICE_NOTIFICATION_ID` shared,
B4), no `setGroup`/summary, no progress subtype, and the "finished" notification (`:236-247`) is correctly tagged
by item id but carries no tap-to-open-file intent (it reuses `MainActivity` only) and no error detail beyond the raw
English `error.code` (`values/strings.xml:34`) — shown directly to an Arabic user.
Missing vs target: speed, ETA, per-item notifications, pause/cancel/retry `addAction`s, `setProgress` with
`max = 100` plus a byte-accurate variant, `setForegroundServiceBehavior`, progress summary, and localized error copy.

---

## 5. UX gap list mapped to phases

| # | Target capability | Status | Phase |
|---|---|---|---|
| U1 | **RTL URL field** | Broken (B1) | **P0 / Phase 0** |
| U2 | **Status-bar overlap** | Broken (B2) | **P0 / Phase 0** |
| U3 | Preview card: thumbnail, title, duration, size estimate, quality picker, remember choice | Missing. `uploader`/`thumbnailUrl` already arrive and are thrown away (`FetchEngine.kt:70-72`). No Coil dependency (`app/build.gradle.kts:79-89`). "Remember choice" has no store at all — `AppGraph.kt:15-17` only persists the yt-dlp timestamp. | P1 / Phase 3 |
| U4 | Clipboard detection prompt | Missing. No `ClipboardManager` usage anywhere. Note: Android 12+ restricts clipboard reads to the focused app, so this must be a **passive** prompt (read on focus, or use `PrimaryClipRequest` behind a user tap), not a background sniff. | P1 / Phase 3 |
| U5 | Share-intent support | Missing. `AndroidManifest.xml:27-30` registers **only** `ACTION_MAIN`/`LAUNCHER` — no `ACTION_SEND`/`ACTION_VIEW` filter. Also requires URL normalisation (B14) and `text/plain` + `text/uri-list` handling. | P1 / Phase 3 |
| U6 | Built-in browser + media detection + ad blocking | Missing entirely. No WebView dependency, no WebViewClient, no blocker list. A browser raises its own review/privacy posture — decide scope before committing. | P2 / Phase 5 |
| U7 | Downloads tab: active / completed / failed | Missing. One flat `LazyColumn` over all states (`FetchScreen.kt:148-190`). | P1 / Phase 4 |
| U8 | Search / sort / filter | Missing. `DownloadDao` has exactly one ordering (`createdAt ASC`, `DownloadDao.kt:11,14`) and `observeAll` is never called. | P1 / Phase 4 |
| U9 | Multi-select | Missing. No selection state, no `itemsIndexed`/long-press. | P1 / Phase 4 |
| U10 | Swipe to dismiss | Missing. `SwipeToDismissBox` available in the pinned BOM. | P1 / Phase 4 |
| U11 | Completed-item actions: open / share / rename / move / delete / show-in-folder | **Blocked by B11** — files are in app-private storage with UUID names and no provider. Requires MediaStore/SAF + a real filename first. | P1 / Phase 4 (after Phase 1 storage work) |
| U12 | Friendly Arabic errors | Partial. Strings are localized, but the *content* is not: raw `error.code` in the failure notification (`DownloadService.kt:186`, `values-ar/strings.xml:34`), hardcoded English `"Best"`/`"MP3"`/`"1080p"` labels (`DownloadSpec.kt:12`, `FetchScreen.kt:231,238`) that are **persisted to the DB** (`DownloadEntity.kt:21,40`), and probe errors flattened to one generic line (B10). | P0 (wire codes→strings) + P1 (localize labels) |
| U13 | Home with recent downloads | Missing — no home route exists. | P1 / Phase 4 |
| U14 | Media3 player, background audio, speed, PiP, subtitles, gestures, resume position | Missing. No media3 dependency. Also blocked by B11 (no playable path, no subtitles written by the engine). | P2 / Phase 5 |
| U15 | Audio library + one-tap MP3 convert | Missing. Needs the M4A/OPUS stream-copy path + a library index. | P2 / Phase 5 |
| U16 | Storage manager: usage, auto-clean, duplicates | Missing. `--download-archive` + DB size column make dedupe cheap. | P2 / Phase 5 |
| U17 | Backup / restore | **Explicitly disabled**: `AndroidManifest.xml:12` `allowBackup="false"`, `:14` `fullBackupContent="false"`, and `data_extraction_rules.xml:3-16` excludes every domain. Must be flipped deliberately. | P2 / Phase 5 |
| U18 | Optional biometric vault | Missing. No `androidx.biometric` dependency. | P2 / Phase 5 |
| U19 | Wi-Fi-only / speed limiter / scheduled downloads / queue priorities | Missing. Requires WorkManager constraints (`UNMETERED`), `--throttled-rate`, and a scheduled timestamp column. | P1 (Wi-Fi + limits) / P2 (scheduling, priorities) |
| U20 | Startup & perf: lazy lists, stable keys, Coil | LazyColumn + `key = { it.id }` are **already correct** (`FetchScreen.kt:154`). Coil missing. Perf regressions B8 and B3 unaddressed. | P0 (fix B8) / P2 (Coil + baseline profile) |
| U21 | Language switcher UI | **Unreachable**: `LanguageStore.save` (`AppLanguage.kt:35-40`) and `Context.findActivity` (`:60-67`) are never called — grep confirms definition-only. `AppLanguage.ENGLISH`/`ARABIC` are dead. No `android:localeConfig` resource, so Android 13+ per-app language cannot list EN/AR either. | P1 / Phase 4 (settings) |
| U22 | Retry with backoff | Partial. `maxAttempts = 3` with **immediate** re-queue and zero delay (`DownloadQueue.kt:100-104`); `invokeOnCompletion { pump() }` (`DownloadService.kt:143`) retries at once. No `delay()`, no jitter. | P1 / Phase 2 |
| U23 | Playlist / channel / batch with selection | **Structurally blocked**: `--no-playlist` is hardcoded in both the probe (`FetchEngine.kt:93`) and the download (`:140`), and `probeQualities` only reads the root object (`:100`), ignoring `_type == "playlist"` entries. | P1 / Phase 2 |
| U24 | Cookies / sign-in recovery | `NEED_COOKIES` state + classifier exist and are wired (`DownloadQueue.kt:97`, `YtDlpErrorClassifier.kt:25-33`) — **already present**. But `NetscapeCookies` (100 LOC) has **zero callers**, and `FetchEngine.download`'s `cookiesFile` parameter (`:133,150`) is never passed by the caller (`DownloadService.kt:164-169`). The feature is a state with no way out. | P1 / Phase 2 |

---

## 6. Dead code, unused dependencies, i18n/RTL, accessibility

### Dead code / unused
| Item | Evidence |
|---|---|
| `AppGraph.database` | Declared `AppGraph.kt:22-23`, assigned `:37`, **never read** — grep confirms the only usage is the assignment. |
| `AppGraph.appContext` | Set `:36`, used only inside `maybeUpdateEngine` `:48` — should be private. |
| `androidx.navigation:navigation-compose:2.8.7` | `app/build.gradle.kts:88`. Zero imports; there is exactly one screen and no `NavHost`. Remove or adopt in Phase 4. |
| `androidx.datastore:datastore-preferences:1.1.1` | `app/build.gradle.kts:95`. Zero imports; the code comment at `AppLanguage.kt:23-25` explains SharedPreferences is deliberate for `attachBaseContext`. Remove unless a settings DataStore lands. |
| `androidx.documentfile:documentfile:1.0.1` | `app/build.gradle.kts:98`. Zero imports. |
| `lifecycle-viewmodel-compose:2.9.0` | `app/build.gradle.kts:75`. Zero imports — no ViewModel exists (B-list §3). |
| `LanguageStore.save`, `Context.findActivity`, `AppLanguage.ENGLISH/ARABIC` | `AppLanguage.kt:35-40, 60-67, 12-13`. Defined, never called. The whole language feature is unreachable. |
| `NetscapeCookies` (100 LOC) + `Cookie` | `core/cookies/NetscapeCookies.kt`. Zero references outside the file. `FetchEngine.download`'s `cookiesFile` param (`:133`) has no caller. |
| `DownloadDao.observeAll()` | `data/DownloadDao.kt:11-12`. Never called — the UI binds to `repository.items` (`FetchScreen.kt:60`), a `StateFlow` fed by in-memory state. |
| `DownloadRepository.runningCount` accessor | `DownloadQueue.kt:39`. Never read (`pollStarts` uses its own local, `:57`). |
| `DownloadEntity.outputPath`, `createdAt`, `updatedAt` | `DownloadEntity.kt:18, 22-23`. Write-only (B16); no query references them. |
| `QueueItem` defaults `attempts`, `errorCode` | `DownloadQueue.kt:15-16` — always overridden by callers. |
| Proguard keeps for nonexistent packages | `proguard-rules.pro:10-11` keep `com.movid.app.core.model.**` and `com.movid.app.core.serialization.**`. **Neither package exists** — the real packages are `core.queue` and `core.yt`. The intended protection is not applied. |
| `DownloadService.cancel` / `ACTION_CANCEL_ITEM` / `repository.cancel` | Reachable only from `FetchScreen.kt:173`, which is never invoked (B6). |
| `unitTests.isReturnDefaultValues = true` | `app/build.gradle.kts:60` — masks failures in every future unit test. Remove when tests land. |
| No test/androidTest dirs | 3 test deps declared (`app/build.gradle.kts:111-115`), **0 tests**. `room-testing` is on the *unit* classpath (`:113`) where it cannot work without Robolectric. |

### Hardcoded English strings in code (not in `strings.xml`)
- `core/yt/DownloadSpec.kt:12` — `val label: String = "Best"` is the **default parameter**, so it is persisted into `qualityLabel` (`DownloadEntity.kt:21, 40`) and rendered verbatim (`FetchScreen.kt:281`) — an Arabic user sees `جارٍ التنزيل… - Best`. Confirmed.
- `ui/FetchScreen.kt:231` — `"${height}p"`; `:238` — `"MP3"`. Both persisted the same way.
- `engine/DownloadService.kt:186` — `getString(R.string.notif_download_failed, error.code)` puts the machine code `need_cookies` / `extractor_outdated` into the notification.
- `engine/FetchEngine.kt:98, 191` — `"probe failed"`, `"invalid url"` (internal, not shown — acceptable).

### RTL / layout direction
- **B1 confirmed** (`FetchScreen.kt:94-103`).
- No `android:textDirection` on any of the 30 strings in `values/strings.xml` / `values-ar/strings.xml`. `app_name` (`"Movid"`) is the only LTR-marked string — `"Movid"` is also set as the **application label** (`AndroidManifest.xml:16`), which is fine by luck of naming.
- `%1$dp` (`values/strings.xml:18`, `values-ar/strings.xml:18`) is direction-safe (positional args, no `%s`), unlike `notif_downloading_named` (`%1$s - %2$d%%`, `:32`) whose literal `" - "` will reorder in RTL but is acceptable; `application/vnd` of the dash is the only concern.
- `Arrangement.End` (`FetchScreen.kt:294`) correctly mirrors in RTL. `horizontalArrangement = Arrangement.spacedBy(8.dp)` on the `LazyColumn` (`:152`) is a *vertical* arrangement — harmless but semantically odd.
- No `start`/`end` vs `left`/`right` violations found in Kotlin, so lint's `RtlHardcoded` would stay silent — which is precisely why this bug reached users. `lint { abortOnError = false }` (`app/build.gradle.kts:63-66`) also means lint never gates anything; `checkReleaseBuilds = false` hides it further.
- `AndroidManifest.xml:18` `supportsRtl="true"` is correct and must stay.
- **`values/themes.xml:5-7` / `values-night/themes.xml:5-7`** (`statusBarColor`, `navigationBarColor`, `windowLightStatusBar`) are all **dead on API 35** — edge-to-edge is enforced by `targetSdk 35` and `enableEdgeToEdge()` overrides them (`MainActivity.kt:19`). Keeping them is misleading.
- `AndroidManifest.xml:25` `configChanges` includes `uiMode` and `fontScale`, so the Activity never recreates for theme/font changes — acceptable for Compose, but it also means the locale override at `MainActivity.kt:14-16` is the *only* locale source and can never be re-applied without a manual recreate (which is why `findActivity` exists and is unused).
- `i18n/AppLanguage.kt:52` — `Locale.setDefault(locale)` is a **process-global mutation** performed inside a context wrapper; it leaks into `DownloadService` and every library. Prefer `AppCompatDelegate.setApplicationLocales` (needs appcompat) or a per-context config without touching the global default.

### Accessibility
- **`contentDescription = null` on all four interactive icons** — `ui/FetchScreen.kt:301` (Pause), `:304` (Resume), `:307` (Retry), `:311` (Delete). Every row control is an unlabeled button to TalkBack. Should be `stringResource(R.string.action_pause)` etc.
- `IconButton` default size is 48dp → **touch-target size is fine** (`FetchScreen.kt:301-311`). `Button` (`:105`) and `QualityOption` `TextButton` (`FetchScreen.kt:254-259`) are ≥48dp via M3 defaults. **No touch-target violation found** — say so explicitly.
- **Non-text contrast failure (WCAG 1.4.11, needs ≥3:1):** the URL field outline uses `colorScheme.outline` = `VnGray400` `#9E9E9E` on a white surface ≈ **2.6:1** (light, `Theme.kt:73,52`) and `VnGray600` `#595959` on black ≈ **2.5:1** (dark, `Theme.kt:43,22`). This is the exact field the user complained about. Fix: use `outlineVariant`→`outline`, or darken to `#767676` (4.54:1).
- Text contrast is fine: `onSurfaceVariant` `#D6D6D6` on `#000000` ≈ 14.6:1 (dark) and `#262626` on `#FFFFFF` ≈ 13.9:1 (light) — `Theme.kt:39,69`.
- `error = VnGray200`/`VnGray800` (`Theme.kt:45,75`) means **no red** anywhere. Acceptable for the strict B/W design language and it is not the sole carrier of meaning (the `fetch_state_failed` label is), but the failed state must be distinguishable by more than weight in Phase 4.
- `LinearProgressIndicator` (`FetchScreen.kt:286-291`) carries the default `ProgressBarRangeInfo`, so it is announced correctly, but there is **no `semantics { contentDescription }`** naming the item or the percentage.
- No `Modifier.semantics` grouping for `QueueRow` (`FetchScreen.kt:271-314`) — each row is read as loose fragments rather than one unit.

---

## 7. Prioritized upgrade plan

Ordering constraints: every phase must leave `:app` compiling and debug-installable. No phase introduces a
dependency it does not immediately use. Behaviour-preserving refactors are always split from behaviour changes.

### P0 — Correctness & foundation (must land first)

| Step | Work | Effort |
|---|---|---|
| P0.1 | Fix B1 (RTL URL field) + B2 (insets via `Scaffold`/`safeDrawingPadding`) + add `contentDescription` to all four `IconButton`s + fix the outline contrast. Touches only `FetchScreen.kt`, `Theme.kt`. | **0.5 d** |
| P0.2 | Introduce `FetchViewModel : ViewModel` and move `url/probing/probe/probeFailed` out of the composable (`remember` → `StateFlow` + `rememberSaveable` for `url`). Delete `lifecycle-viewmodel-compose`-less direct `AppGraph` reads from the UI. | **1 d** |
| P0.3 | Surface real errors: pipe `probeQualities`'s exception through `YtDlpErrorClassifier` and map every `YtDlpError` → a localized string; replace the raw `error.code` in the notification (`DownloadService.kt:186`). Add the 9 new strings to both `values/` and `values-ar/`. | **1 d** |
| P0.4 | Engine/service fixes: B5 stale-snapshot pause/delete (read the current state from `repository` instead of the captured `item`), B7 concurrent-pump (single mutex/actor around `pump()` + return the fresh item from `nextStarts()`), B4 per-item notification ids, B13/B14 URL validation with a user-facing message. | **1.5 d** |
| P0.5 | Perf + startup: split B3 (restore and engine-update on separate scopes), throttle persistence in B8 (only upsert the item that changed; coalesce progress to ~4 Hz; keep `outputPath`/timestamps out of the hot path). | **1.5 d** |
| P0.6 | Dead-code sweep: drop `navigation-compose`, `datastore-preferences`, `documentfile`, fix `proguard-rules.pro:10-11` to the real packages, remove `lint { abortOnError = false }`'s safety net only after lint is clean. **Keep** `NetscapeCookies` (Phase 2 will use it) and mark it `@Suppress`/document it as pending. | **0.5 d** |

**P0 total ≈ 6 days.** Leaves: no user-visible regressions, real error messages, no leaks in the hot path.

### P1 — Product capability (the target's core)

| Step | Work | Effort |
|---|---|---|
| P1.1 | **Storage is the keystone (unblocks U11, U14, U15).** Migrate output from app-private `getExternalFilesDir` (B11) to MediaStore/`Downloads` via SAF; name files from the resolved title with sanitised names + collision suffixes; persist `outputPath`, `fileName`, `sizeBytes`, `durationSec`, `thumbnailUrl`, `uploader` in a Room **v3** migration (stop using `fallbackToDestructiveMigration`, `AppDatabase.kt:16`); write a real `outputPath` on completion; add a `FileProvider`. | **3–4 d** |
| P1.2 | **Reliability.** Add WorkManager; make the engine's queue a `CoroutineWorker`/`Worker` with `Constraints(NetworkType.UNMETERED)` for the Wi-Fi-only setting; move retries off `job.invokeOnCompletion` into a `Result.retry()` with exponential backoff + jitter (U22). Keep `DownloadService` only as the foreground shell. | **2–3 d** |
| P1.3 | **Formats.** Add `-c/--continue` (fixes B12, the real resume), `--concurrent-fragments N` behind a Wi-Fi + "high speed" toggle, `--throttled-rate` for the speed limiter, `-x --audio-format m4a` as a **stream-copy** default with MP3 as an explicit re-encode option, `--write-subs`/`--write-thumbnail`/`--embed-metadata`, `--retries`/`--fragment-retries`/`--socket-timeout`, and a `DRM_PROTECTED` error class with a clear skip message. | **3 d** |
| P1.4 | **Playlist/batch/cookies.** Detect `playlist`/`multi_video` in the probe, add a selection sheet, `--yes-playlist`/`--playlist-items N`, `--download-archive` for dedupe; wire `NetscapeCookies` into a "sign in to continue" flow that writes a temp cookies file and passes `cookiesFile` to `FetchEngine.download` (the parameter already exists, `FetchEngine.kt:133`). | **3 d** |
| P1.5 | **Preview card + smart UX.** Replace the bare dialog with a card: thumbnail (add Coil), title, uploader, duration, size estimate, format rows with container/size, quality picker + "remember my choice" (DataStore, which finally earns its dependency). Clipboard prompt on screen focus, share-intent filters (`ACTION_SEND text/plain`, `ACTION_VIEW` http/https) in `AndroidManifest.xml`. | **3–4 d** |
| P1.6 | **Downloads tab.** Home + Downloads routes (adopt `navigation-compose`), active/completed/failed tabs, search/sort/filter (`DownloadDao` gets real queries and uses `observeAll`), multi-select, swipe-to-dismiss, and the completed-item action sheet: open / share / rename / move / show-in-folder / delete. | **4–5 d** |
| P1.7 | **Settings + language.** Make the existing but unreachable language store reachable; add `android:localeConfig` so Android 13+ per-app language works; settings screen for Wi-Fi-only, speed limit, parallel connections, default quality. | **1.5 d** |

**P1 total ≈ 20–24 days.**

### P2 — Differentiators

| Step | Work | Effort |
|---|---|---|
| P2.1 | Media3 player: audio background service, speed, PiP, subtitle tracks, gestures, position resume (needs P1.1 + P1.3 subtitles). | **5–7 d** |
| P2.2 | Audio library + one-tap convert (needs P1.3 m4a/opus). | **3 d** |
| P2.3 | Storage manager: usage breakdown, auto-clean rules, duplicate detection. | **2 d** |
| P2.4 | Backup/restore — flip `allowBackup`/`fullBackupContent` (`AndroidManifest.xml:12,14`) and rewrite `data_extraction_rules.xml` to export only the DB + settings, never cookies. | **1 d** |
| P2.5 | Built-in browser with media detection + ad blocking — **largest privacy/review risk**; scope it deliberately (custom Tab, WebView, local blocker list, no remote rules). | **5–8 d** |
| P2.6 | Scheduled downloads, queue priorities, optional biometric vault. | **3 d** |
| P2.7 | **Tests + perf:** first unit tests for the four pure classes (`DownloadQueue`, `NetscapeCookies`, `YtDlpErrorClassifier`, `DownloadSpec`), then Room/DAO instrumentation tests, then Compose UI tests; enable `abortOnError`, drop `isReturnDefaultValues`, add `baseline-prof.txt`, Coil lazy lists. | **3–4 d** |

**P2 total ≈ 22–28 days.**

---

## 8. File-level change map (Phases 0–1, first two phases)

**Do NOT split the module in Phase 0** — `settings.gradle.kts:18` stays `include(":app")`. Module extraction is a
Phase-4 change with no behaviour benefit and a real chance of breaking a currently-green build.

### Phase 0 — new files
```
app/src/main/java/com/movid/app/ui/FetchViewModel.kt          NEW  ViewModel; owns url/probing/probe/probeFailed
                                                                   as StateFlow; calls probe + repo.add; exposes events
                                                                   (one-shot) for DownloadService.kick via a Channel.
app/src/main/java/com/movid/app/ui/components/UrlField.kt    NEW  the LTR-forced OutlinedTextField (fixes B1).
app/src/main/java/com/movid/app/ui/components/QueueRow.kt   NEW  extracted from FetchScreen.kt:263-315; adds
                                                                   contentDescription strings + row semantics.
app/src/main/java/com/movid/app/ui/ErrorText.kt              NEW  YtDlpError -> localized string mapping (fixes B10).
app/src/test/java/com/movid/app/core/queue/DownloadQueueTest.kt          NEW (cheap regression net)
app/src/test/java/com/movid/app/core/yt/YtDlpErrorClassifierTest.kt     NEW
app/src/test/java/com/movid/app/core/cookies/NetscapeCookiesTest.kt      NEW
app/src/test/java/com/movid/app/core/yt/DownloadSpecTest.kt              NEW
```
### Phase 0 — modified files
```
ui/FetchScreen.kt                 -> ~120 LOC (thin: collect VM state, render components, handle events)
                                      fixes B1 (UrlField), B2 (Scaffold + safeDrawing insets),
                                      B5 (read live state from repo, not the captured item),
                                      accessibility (descriptions, semantics)
ui/components/QueueRow.kt         -> replaces :263-315, fixes accessibility
ui/theme/Theme.kt                 -> outline colours: VnGray400/#9E9E9E -> #767676 (light),
                                      VnGray600/#595959 -> #8A8A8A (dark) for >=3:1 non-text contrast
engine/DownloadService.kt         -> B4 per-item notification tag ("item:"+id) for the foreground channel,
                                      B7 single pump gate + fresh items from nextStarts(),
                                      B9 wrap startForeground in runCatching + drop to a non-FG path on denial,
                                      B12/U12 localized error text in notifyFinished
engine/FetchEngine.kt             -> B13/B14 requireHttpUrl: reject non-http(s) with a typed error,
                                      normalise scheme-less hosts; expose --version for the parallel-fragments gate
data/DownloadRepository.kt        -> B8 persistLocked() upserts only the changed item; add suspend fun item(id)
data/DownloadDao.kt               -> B8 add @Query upsert-by-id path / @Transaction to avoid full-table SELECT;
                                      actually wire observeAll() in Phase 4
AppGraph.kt                       -> B3 restore() and maybeUpdateEngine() on separate scopes; make appContext
                                      private; mark database as internal for the DB provider
core/queue/DownloadQueue.kt       -> expose current-state read for B5; drop unused runningCount
res/values/strings.xml            -> +9 strings: action_pause/resume/retry/delete, error_* x8, url_invalid,
                                      cleartext_blocked, probe_running
res/values-ar/strings.xml         -> mirror all 9
app/build.gradle.kts              -> drop navigation-compose / datastore-preferences / documentfile;
                                      drop unitTests.isReturnDefaultValues; keep abortOnError=false until
                                      lint is clean, then flip
proguard-rules.pro                -> fix :10-11 to com.movid.app.core.yt.** / core.queue.**
```
### Phase 1 — new files
```
app/src/main/java/com/movid/app/data/Migrations.kt           NEW  v2 -> v3: outputPath, fileName, sizeBytes,
                                                                   durationSec, thumbnailUrl, uploader,
                                                                   priority, scheduledAt (non-destructive)
app/src/main/java/com/movid/app/media/MediaStoreWriter.kt   NEW  SAF/MediaStore output + name sanitisation +
                                                                   collision suffixes + MediaStore row insert
app/src/main/java/com/movid/app/media/FileNames.kt          NEW  pure, unit-testable title -> safe filename
app/src/main/java/com/movid/app/engine/DownloadWorker.kt    NEW  WorkManager CoroutineWorker; retries with
                                                                   backoff; constraints from settings
app/src/main/java/com/movid/app/engine/EngineOptions.kt     NEW  one place that builds the yt-dlp arg list
                                                                   (-c, -N, --throttled-rate, --write-subs, ...)
app/src/main/java/com/movid/app/ui/preview/PreviewCard.kt  NEW  thumbnail/title/uploader/duration/size/format rows
app/src/main/java/com/movid/app/ui/preview/FormatRow.kt    NEW
app/src/main/java/com/movid/app/ui/preview/QualityPicker.kt NEW  + remember-choice via DataStore
app/src/main/java/com/movid/app/ui/downloads/DownloadsScreen.kt  NEW  tabs, search, sort, filter, multi-select, swipe
app/src/main/java/com/movid/app/ui/downloads/ItemActionsSheet.kt NEW open/share/rename/move/show-in-folder/delete
app/src/main/java/com/movid/app/ui/settings/SettingsScreen.kt     NEW language, wifi-only, speed, parallelism
app/src/main/res/xml/locale_config.xml                    NEW  android:localeConfig for Android 13+ per-app language
```
### Phase 1 — modified files
```
app/src/main/AndroidManifest.xml       -> MediaStore/SAF intents, ACTION_SEND + ACTION_VIEW filters for the share
                                          entry point, FileProvider, <meta-data android:name="localeConfig">,
                                          planned READ_MEDIA_* for the player, allowBackup decision (P2.4)
data/DownloadEntity.kt                 -> the v3 columns + mappers
data/AppDatabase.kt                    -> .addMigrations(Migrations.V2_3), drop fallbackToDestructiveMigration
data/DownloadDao.kt                    -> real search/sort/filter/tab queries; finally call observeAll()
data/DownloadRepository.kt             -> two sources of truth (Room Flow + in-memory queue) reconciled into one
                                          StateFlow; per-item persistence
engine/FetchEngine.kt                  -> EngineOptions, --concurrent-fragments, -c, subs/thumbnail/metadata,
                                          m4a/opus stream-copy, DRM_PROTECTED classification
engine/DownloadService.kt              -> becomes the foreground shell only; delegates to DownloadWorker
res/values[-ar]/strings.xml            -> +preview_*, +filter_*, +action_open/share/rename/move/delete,
                                          +error_drm_protected and every new error code localized
```
