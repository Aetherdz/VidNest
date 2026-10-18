# VidNest — workspace guide (read me first)

VidNest is an Arabic-first media downloader for Android: paste a link → pick a
quality → the file lands in the device's Movies/Music library, plus a built-in
player. It is an original implementation (no copied code/assets from other
apps); SnapTube was analyzed only as a feature reference — see
`design/RE_SNAPTUBE.md`.

## Designer fingerprint — permanent

`zaikabdou` is the owner/designer signature. It must remain in every build:

1. `AndroidManifest.xml` → `<meta-data android:name="com.movid.app.DESIGNER" android:value="zaikabdou" />`
2. `app/build.gradle.kts` → `buildConfigField("String", "DESIGNER", "\"zaikabdou\"")`
3. `res/values/strings.xml` + `res/values-ar/strings.xml` → `designer_credit`
   ("Designed by zaikabdou" / "تصميم zaikabdou"), rendered on the Home screen.
4. `design/BRIEF.md` changelog.

Do not rename, translate, remove or "clean up" any of these.

## Build & delivery

```bash
tools/smart_build.sh compile   # fastest Kotlin check (:app:compileDebugKotlin)
tools/smart_build.sh debug     # debug APK
tools/smart_build.sh release   # signed release APK (R8 + shrinking)
tools/smart_build.sh test      # JVM unit tests
tools/smart_build.sh send      # release + Telegram delivery when <= 50 MB
```

House rules:
- ONE Gradle build at a time (flock on `/tmp/opencode/movid-gradle.lock`).
- `GRADLE_USER_HOME=/tmp/opencode/gradle-home`; module build dirs live in
  `/tmp/opencode/movid-build/`; logs in `/tmp/opencode/logs/`.
- `/home` is a small (4.8 GB) partition. Keep artifacts under `/tmp/opencode`.
  If a build says "No space left on device", free `/home` first —
  `~/.gradle` is a symlink to `/tmp/opencode/gradle-ide-home` for this reason.
- Release signing reads `signing/keystore.properties` (demo keystore — replace
  before any store distribution).

## Layout (app/src/main/java/com/movid/app)

| Path | Role |
|---|---|
| `MainActivity.kt` | Compose host; captures share intents into `FetchRelay` (ACTION_SEND `text/plain` only — the http/https `ACTION_VIEW` filter was removed for least privilege) |
| `ui/FetchScreen.kt` | Home: URL field, paste button, quality sheet, queue list |
| `ui/FetchRelay.kt` | One-shot bridge for external links (ACTION_SEND only; its ACTION_VIEW branch is now unreachable from outside the app) |
| `engine/` | yt-dlp wrapper, `DownloadService` (FGS + notifications), MediaStore publish |
| `player/` | `PlaybackService` (MediaSessionService), `PlayerActivity`, `PlayerScreen` gestures, `PlayerPrefs` |
| `data/` | Room entities/DAO/repository, DataStore prefs |
| `i18n/` | Locale plumbing (ar default, en) |
| `ui/theme/` | "Violet Instrument" palette (see `design/BRIEF.md` v2 changelog) |

## Rules

- Strings: always both `values/` (en) and `values-ar/`; no hardcoded copy.
- RTL-first layouts; start/end only (no left/right).
- No emojis in UI copy. No ads, no trackers, no analytics SDKs.
- Least-privilege manifest: adding a permission requires a written reason here.
- `PlaybackService` trust policy: session connections are accepted only when
  `controllerInfo.uid == Process.myUid()` or `controllerInfo.isTrusted`
  (system / `MEDIA_CONTENT_CONTROL`); everything else is rejected. Never
  compare `packageName` — media3 takes it from the client-supplied connection
  request, so it is spoofable; `uid` is Binder-derived. `onGetSession` also
  lets through media3's synthetic internal callers (`Process.INVALID_UID -1`)
  so media-button dispatch (headset resume) keeps working — those never get a
  real connection. Keep both gates (`onGetSession` + `onConnect`).
- Downloads must be playable from the device library; publishing via MediaStore
  first (API 29+) and direct write for API 26–28.
- Player controls overlay is always dark-on-video regardless of theme.
- Permission inventory (merged release manifest, verified 2026-10-18 against
  `manifest-merger-release-report.txt`). Declared by us: INTERNET,
  ACCESS_NETWORK_STATE, FOREGROUND_SERVICE (+DATA_SYNC/+MEDIA_PLAYBACK),
  POST_NOTIFICATIONS, WRITE_EXTERNAL_STORAGE (maxSdk 28). Merged from
  libraries: WAKE_LOCK + RECEIVE_BOOT_COMPLETED (androidx.work — Phase-1
  groundwork only: downloads run in the DownloadService foreground service;
  no WorkManager jobs are scheduled yet, so these are currently inert),
  com.movid.app.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION (signature level,
  androidx.core). Any further permission needs its reason added to this list.
  Do NOT add `androidx.biometric` unless the Vault feature (design/BRIEF.md)
  is actually implemented — while unused it only ships dead permissions.

## Verification checklist before shipping

1. `tools/smart_build.sh compile` green.
2. `tools/smart_build.sh test` green.
3. `tools/smart_build.sh release` produces a signed APK (check with
   `apksigner verify`), size <= 50 MB, and `BuildConfig.DESIGNER` present in dex.
4. Security pass on the changed files (manifest, DownloadService publish path,
   FetchRelay, PlayerActivity/PiP).
