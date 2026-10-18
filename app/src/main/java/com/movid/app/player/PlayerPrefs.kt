package com.movid.app.player

import android.content.Context

/**
 * Remembers the last playback position per media item, so reopening a video
 * resumes where it stopped. SharedPreferences (not DataStore) because the
 * value is needed synchronously when playback starts.
 */
object PlayerPrefs {
    private const val PREFS = "movid_player"
    private const val KEY_PREFIX = "pos:"

    fun load(context: Context, mediaId: String): Long =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getLong(KEY_PREFIX + mediaId, 0L)

    fun save(context: Context, mediaId: String, positionMs: Long) {
        if (mediaId.isBlank() || positionMs <= 0L) return
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putLong(KEY_PREFIX + mediaId, positionMs)
            .apply()
    }
}
