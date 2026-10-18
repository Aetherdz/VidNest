# Movid — Dependency additions (Phase 1/4/5 groundwork), 2026-10-18

Toolchain is pinned: AGP 8.9.1, Kotlin 2.1.20, KSP 2.1.20-1.0.31, compileSdk/target 35, minSdk 26.
Rule: only artifacts whose AAR metadata declares `minCompileSdk <= 35` are allowed.
Evidence = `META-INF/com/android/build/gradle/aar-metadata.properties` read from the AAR itself.

## Added / changed

| Library | Version | Phase | Purpose | Evidence |
|---------|---------|-------|---------|----------|
| com.google.dagger:hilt-android (+compiler) | 2.56.2 | 1 | DI replaces hand-rolled AppGraph | pom 200 on Central |
| androidx.hilt:hilt-navigation-compose | 1.2.0 | 1 | hiltViewModel() in nav graph | minCompileSdk=34 |
| androidx.hilt:hilt-work | 1.2.0 | 1 | HiltWorkerFactory for WorkManager | minCompileSdk=34 |
| androidx.work:work-runtime-ktx | 2.10.5 | 1 | Scheduled/retryable background downloads | 2.10 line, minCompileSdk=35 |
| androidx.navigation:navigation-compose | 2.8.9 (bump from 2.8.7) | 1 | Patch fixes | minCompileSdk=34 |
| androidx.datastore:datastore-preferences | 1.1.7 (bump from 1.1.1) | 1 | Settings/history prefs | no minCompileSdk marker |
| androidx.media3:media3-exoplayer | 1.7.1 | 4 | Player engine | minCompileSdk=35 |
| androidx.media3:media3-ui-compose | 1.7.1 | 4 | Compose player UI | minCompileSdk=35 |
| androidx.media3:media3-session | 1.7.1 | 4 | Background audio/PiP session | minCompileSdk=35 |
| androidx.biometric:biometric | 1.1.0 | 5 | Private vault lock | no minCompileSdk marker |
| io.coil-kt.coil3:coil-compose | 3.2.0 | 3/5 | Thumbnails, lazy-list image caching | pom 200 on Central |
| io.coil-kt.coil3:coil-network-okhttp | 3.2.0 | 3/5 | Image fetching | pom 200 on Central |
| app.cash.turbine:turbine | 1.2.1 | tests | Flow assertions for ViewModel tests | pom 200 on Central |

Plugin added: `com.google.dagger.hilt.android` 2.56.2 (root `build.gradle.kts`, `apply false` + applied in `:app`).

## Deliberately excluded (compileSdk 35 constraint or pre-release)

| Candidate | Why not |
|-----------|---------|
| media3 1.11.1 (latest) | minCompileSdk=36 → would force compileSdk 36 / AGP bump |
| media3 1.8–1.10 lines | not verified at 35; 1.7.1 is the newest verified line |
| navigation-compose 2.10.2 | 36-era line; 2.8.9 verified |
| androidx.hilt 1.4.0 / work 2.12.0 | stay on versions verified today; revisit at next toolchain bump |
| biometric 1.4.0-alpha07 | alpha |
| datastore 1.3.0-rc01, serialization 1.12.0-RC | pre-release |
| coil3 3.6.3 | newest; 3.2.0 chosen as proven with Kotlin 2.1.x |
| splashscreen | not needed (system splash + Compose) |
| okhttp directly | already pulled transitively by coil-network-okhttp |

## Not yet added (later phases, will verify when needed)

- WorkManager diagnostics (`work-testing`) at P1 test time.
- `androidx.media3:media3-datasource-okhttp` only if custom headers/cookies needed for playback.
- Compose UI test libs (`ui-test-junit4`, `ui-test-manifest`) at P1/P5 test time.
- Baseline profile module / macrobenchmark at P5.
