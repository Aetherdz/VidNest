package com.movid.app.ui.theme

import android.content.Context

/** UI appearance modes offered in the app. SYSTEM follows the device setting. */
enum class ThemeMode {
    SYSTEM,
    LIGHT,
    DARK;

    companion object {
        fun fromName(name: String?): ThemeMode = entries.firstOrNull { it.name == name } ?: SYSTEM
    }
}

/** Resolves an appearance mode to the concrete dark/light decision. */
fun ThemeMode.isDark(systemInDark: Boolean): Boolean = when (this) {
    ThemeMode.SYSTEM -> systemInDark
    ThemeMode.LIGHT -> false
    ThemeMode.DARK -> true
}

/**
 * Persisted appearance choice. SharedPreferences (not DataStore) on purpose:
 * the value is read synchronously before the first frame is composed. Shares
 * the "movid_ui" file with the language choice (see AppLanguage.kt).
 */
object ThemeStore {
    private const val PREFS = "movid_ui"
    private const val KEY_THEME_MODE = "theme_mode"

    fun load(context: Context): ThemeMode =
        ThemeMode.fromName(
            context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .getString(KEY_THEME_MODE, null),
        )

    fun save(context: Context, mode: ThemeMode) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_THEME_MODE, mode.name)
            .apply()
    }
}
