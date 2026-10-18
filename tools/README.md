# Movid tools

Thin wrappers around Gradle for this project. Run them from anywhere; each one
resolves the repo root itself.

| Command | What it does |
| --- | --- |
| `tools/smart_build.sh <compile\|debug\|release\|test\|send> [--clean]` | Runs one Gradle invocation: `:app:compileDebugKotlin`, `:app:assembleDebug`, `:app:assembleRelease`, `:app:testDebugUnitTest`, or a release build plus Telegram delivery (`send`). `--clean` prepends the `clean` task. |
| `tools/release.sh [--send]` | Release build via `smart_build.sh`, copies the APK to `dist/movid-<versionName>-release.apk`, prints sha256 + size. `--send` also delivers it to Telegram. |

## One Gradle build at a time

This machine has little RAM, so **never run two Gradle builds at once** (that
includes a build started from an IDE). `smart_build.sh` enforces this with a
non-blocking `flock` on `/tmp/opencode/movid-gradle.lock`: if another build
holds the lock it prints a message and exits with code `3`. Builds are not
queued — wait for the running one, then re-run.

## Output locations (everything heavy lives under /tmp/opencode)

- `GRADLE_USER_HOME`: `/tmp/opencode/gradle-home` (always exported by the scripts).
- Module build dirs: `/tmp/opencode/movid-build/<module>` — redirected there by the root `build.gradle.kts`.
- APKs:
  - debug: `/tmp/opencode/movid-build/app/outputs/apk/debug/app-debug.apk`
  - release: `/tmp/opencode/movid-build/app/outputs/apk/release/app-release.apk` (signed) or `app-release-unsigned.apk` (current v1 builds — no release signingConfig yet).
- Logs: `/tmp/opencode/logs/movid-<task>-<UTC timestamp>.log` (full Gradle output).
- Release archives: `dist/movid-<versionName>-release.apk` inside the repo.

## Telegram delivery rule

`send` / `--send` only delivers an APK whose filename does not contain
`unsigned` and whose size is at most 50,000,000 bytes; otherwise the script
prints why it skipped. Delivery goes through
`/home/zaikabdou1/FetchCUT/tools/tg_report.sh file <apk>`.

## UI design work

`tools/design_skills.sh` (provided by a separate task) loads all bundled design
skills in one call for UI work — run it before larger Compose UI changes so the
full style/layout guidance is in context.

## Examples

```sh
tools/smart_build.sh compile            # quick compile check
tools/smart_build.sh debug --clean      # clean debug APK
tools/smart_build.sh test               # JVM unit tests
tools/smart_build.sh send               # release build + Telegram (signed & <= 50 MB)
tools/release.sh                        # release build + dist/ artifact, sha256 + size
tools/release.sh --send                 # same, then Telegram delivery
```

## Verifying a built APK

```sh
tools/verify_apk.sh [apk-path]   # default: the release APK under /tmp/opencode/movid-build
```

Runs the AGENTS.md "Verification checklist before shipping" items that can be
checked on a finished APK: 50 MB size limit, signature, manifest policy
(`com.movid.app.DESIGNER` meta-data, `allowBackup`, permission allowlist,
exported components) and the permanent `zaikabdou` dex fingerprint. It never
invokes Gradle. Missing tools degrade gracefully: apksigner falls back to
keytool, aapt2 falls back to a labelled best-effort strings scan of the binary
AndroidManifest.xml; SKIPs never fail the run. Exit 1 only on a real failure
(APK missing, oversize, signature failure, fingerprint missing).
