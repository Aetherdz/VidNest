package com.movid.app.core.yt

/**
 * What to fetch for a queue item: best video+audio, a capped resolution, or
 * audio-only (MP3 via ffmpeg).
 *
 * [label] is display-only ("Best", "1080p", "MP3").
 */
data class DownloadSpec(
    val audioOnly: Boolean = false,
    val maxHeight: Int? = null,
    val label: String = "Best",
) {
    /** yt-dlp `-f` selector for this spec. */
    fun formatSelector(): String = when {
        audioOnly -> "bestaudio/best"
        maxHeight != null -> "bestvideo[height<=$maxHeight]+bestaudio/best[height<=$maxHeight]"
        else -> "bestvideo+bestaudio/best"
    }
}