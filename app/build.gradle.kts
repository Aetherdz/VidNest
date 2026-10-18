import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("org.jetbrains.kotlin.plugin.serialization")
    id("com.google.devtools.ksp")
    id("com.google.dagger.hilt.android")
}

android {
    namespace = "com.movid.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.movid.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 4
        versionName = "0.4.0"
        // Permanent designer fingerprint — do not change.
        buildConfigField("String", "DESIGNER", "\"zaikabdou\"")
        ndk {
            // yt-dlp's runtime bundles python + ffmpeg natives for every ABI;
            // a universal APK balloons past 120 MB. Target phones are arm64;
            // add more ABIs via splits only if a device actually needs them.
            abiFilters += listOf("arm64-v8a")
        }
    }

    signingConfigs {
        // Demo signing for local/release builds. The keystore is not for
        // production distribution; replace it before any store release.
        val propsFile = rootProject.file("signing/keystore.properties")
        if (propsFile.exists()) {
            create("release") {
                val props = Properties().apply {
                    propsFile.inputStream().use { load(it) }
                }
                storeFile = rootProject.file(props.getProperty("storeFile"))
                storePassword = props.getProperty("storePassword")
                keyAlias = props.getProperty("keyAlias")
                keyPassword = props.getProperty("keyPassword")
            }
        }
    }

    androidResources {
        // Ship only the two languages VidNest speaks (replaces the deprecated
        // resourceConfigurations setter).
        localeFilters += listOf("en", "ar")
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            val releaseSigning = signingConfigs.findByName("release")
            if (releaseSigning != null) signingConfig = releaseSigning
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    packaging {
        resources.excludes += setOf(
            "META-INF/DEPENDENCIES", "META-INF/LICENSE*", "META-INF/NOTICE*",
            "META-INF/AL2.0", "META-INF/LGPL2.1",
            "META-INF/versions/9/OSGI-INF/MANIFEST.DSF",
        )
    }

    testOptions {
        unitTests.isReturnDefaultValues = true
    }

    lint {
        abortOnError = false
        checkReleaseBuilds = false
    }
}

dependencies {
    // ---------------- core / lifecycle ----------------
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.9.0")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.9.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.9.0")
    implementation("androidx.lifecycle:lifecycle-service:2.9.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.2")

    // ---------------- Compose (BOM keeps the family consistent) ----------
    val composeBom = platform("androidx.compose:compose-bom:2025.05.00")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    // Outlined line icons only (black/white design language).
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.navigation:navigation-compose:2.8.9")
    debugImplementation("androidx.compose.ui:ui-tooling")

    // ---------------- Room + DataStore -----------------------------------
    implementation("androidx.room:room-runtime:2.7.1")
    implementation("androidx.room:room-ktx:2.7.1")
    ksp("androidx.room:room-compiler:2.7.1")
    implementation("androidx.datastore:datastore-preferences:1.1.7")

    // ---------------- Storage Access Framework helpers -------------------
    implementation("androidx.documentfile:documentfile:1.0.1")

    // ---------------- Architecture: Hilt (DI) + WorkManager --------------
    // Phase 1 groundwork: single AppGraph becomes a Hilt graph; WorkManager
    // replaces the service-only pipeline for scheduled/retryable downloads.
    // Versions pinned for compileSdk 35 (verified via aar-metadata minCompileSdk).
    implementation("com.google.dagger:hilt-android:2.56.2")
    ksp("com.google.dagger:hilt-android-compiler:2.56.2")
    implementation("androidx.hilt:hilt-navigation-compose:1.2.0")
    implementation("androidx.hilt:hilt-work:1.2.0")
    implementation("androidx.work:work-runtime-ktx:2.10.5")

    // ---------------- Player: Media3 (Phase 4) ---------------------------
    // media3 1.11.x requires compileSdk 36; 1.7.1 is the newest line that
    // builds against 35 (AAR metadata checked).
    implementation("androidx.media3:media3-exoplayer:1.7.1")
    implementation("androidx.media3:media3-ui:1.7.1")
    implementation("androidx.media3:media3-ui-compose:1.7.1")
    implementation("androidx.media3:media3-session:1.7.1")

    // Phase 5 (biometric vault) is not implemented yet: androidx.biometric is
    // intentionally absent so the release manifest stays free of unused
    // USE_BIOMETRIC / USE_FINGERPRINT permissions. When the feature is built,
    // add the dependency and document its permissions in AGENTS.md.

    // ---------------- Images: Coil 3 (thumbnails, lazy lists) ------------
    implementation("io.coil-kt.coil3:coil-compose:3.2.0")
    implementation("io.coil-kt.coil3:coil-network-okhttp:3.2.0")

    // ---------------- Download engine: yt-dlp + ffmpeg (on-device) -------
    implementation("com.github.yausername.youtubedl-android:library:0.14.0")
    implementation("com.github.yausername.youtubedl-android:ffmpeg:0.14.0")

    // ---------------- Serialization --------------------------------------
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.8.0")

    // ---------------- Baseline profiles (startup speed) ------------------
    implementation("androidx.profileinstaller:profileinstaller:1.4.1")

    // ---------------- tests ----------------------------------------------
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.10.2")
    testImplementation("app.cash.turbine:turbine:1.2.1")
    testImplementation("androidx.room:room-testing:2.7.1")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
}
