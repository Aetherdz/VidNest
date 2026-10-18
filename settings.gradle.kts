pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        // yt-dlp Android wrapper (youtubedl-android) is published via JitPack.
        maven("https://jitpack.io")
    }
}
rootProject.name = "Movid"
include(":app")