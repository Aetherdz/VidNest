package com.movid.app.i18n

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.content.res.Configuration
import java.util.Locale

/** UI languages offered in the app. SYSTEM follows the device setting. */
enum class AppLanguage(val tag: String) {
    SYSTEM(""),
    ENGLISH("en"),
    ARABIC("ar");

    companion object {
        fun fromTag(tag: String?): AppLanguage = entries.firstOrNull { it.tag == tag } ?: SYSTEM
    }
}

/**
 * Persisted language choice.
 *
 * SharedPreferences (not DataStore) on purpose: attachBaseContext needs the
 * value synchronously before the first frame is created.
 */
object LanguageStore {
    private const val PREFS = "movid_ui"
    private const val KEY_LANGUAGE = "language_tag"

    fun load(context: Context): AppLanguage =
        AppLanguage.fromTag(
            context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_LANGUAGE, ""),
        )

    fun save(context: Context, language: AppLanguage) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_LANGUAGE, language.tag)
            .apply()
    }
}

/**
 * Wraps this context with the chosen locale. Layout direction (RTL) follows
 * the locale automatically because the manifest declares supportsRtl="true".
 * Unlike AppCompat, this keeps MainActivity a plain ComponentActivity and
 * adds no dependency.
 */
fun Context.withAppLanguage(language: AppLanguage): Context {
    if (language == AppLanguage.SYSTEM) return this
    val locale = Locale.forLanguageTag(language.tag)
    Locale.setDefault(locale)
    val config = Configuration(resources.configuration)
    config.setLocale(locale)
    config.setLayoutDirection(locale)
    return createConfigurationContext(config)
}

/** Walks the ContextWrapper chain to find the host Activity (for recreate()). */
fun Context.findActivity(): Activity? {
    var context: Context? = this
    while (context is ContextWrapper) {
        if (context is Activity) return context
        context = context.baseContext
    }
    return null
}