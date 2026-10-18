# Movid R8 rules.
# Most AndroidX libraries (Room) ship consumer rules.
# Rules below cover the parts we reflect over ourselves.

# kotlinx.serialization model classes are serialized by name.
-keepattributes *Annotation*, InnerClasses, Signature
-dontnote kotlinx.serialization.**

# Keep the pure core model graph intact (JSON stability).
-keep class com.movid.app.core.model.** { *; }
-keep class com.movid.app.core.serialization.** { *; }

# youtubedl-android: reflectively loaded extraction runtime.
-keep class com.yausername.** { *; }
-dontwarn com.yausername.**

# Designer fingerprint: the ship checklist requires BuildConfig.DESIGNER to
# survive R8 in the release dex. Do not remove this rule.
-keep class com.movid.app.BuildConfig {
    public static final java.lang.String DESIGNER;
}