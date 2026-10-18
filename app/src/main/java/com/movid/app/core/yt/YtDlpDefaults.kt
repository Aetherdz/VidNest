package com.movid.app.core.yt

/** Small, testable set of conservative yt-dlp defaults used for probe and download. */
object YtDlpDefaults {
    const val SOCKET_TIMEOUT_SECONDS = "25"
    const val RETRIES = "5"
    const val FRAGMENT_RETRIES = "5"
    const val CONCURRENT_FRAGMENTS = "4"

    /** Flat argv tokens; every value remains a separate option argument. */
    fun commonOptions(): List<Pair<String, String?>> = listOf(
        "--no-playlist" to null,
        "--socket-timeout" to SOCKET_TIMEOUT_SECONDS,
        "--retries" to RETRIES,
    )

    fun downloadOptions(): List<Pair<String, String?>> = commonOptions() + listOf(
        "--fragment-retries" to FRAGMENT_RETRIES,
        "--concurrent-fragments" to CONCURRENT_FRAGMENTS,
        "--newline" to null,
        "--embed-metadata" to null,
        "-S" to "res,ext:mp4:m4a,codec:avc:m4a",
    )
}
