// Movid root build file. Plugin versions are pinned here (single source of truth).
plugins {
    id("com.android.application") version "8.9.1" apply false
    id("org.jetbrains.kotlin.android") version "2.1.20" apply false
    id("org.jetbrains.kotlin.jvm") version "2.1.20" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.1.20" apply false
    id("org.jetbrains.kotlin.plugin.serialization") version "2.1.20" apply false
    id("com.google.devtools.ksp") version "2.1.20-1.0.31" apply false
    id("com.google.dagger.hilt.android") version "2.56.2" apply false
}

// Keep every build intermediate off the small /home partition.
subprojects {
    layout.buildDirectory.set(file("/tmp/opencode/movid-build/${project.name}"))
}