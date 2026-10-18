package com.movid.app.core.yt

/** Typed yt-dlp failure classes the queue and UI react to. */
enum class YtDlpError(val code: String) {
    /** YouTube asks for a signed-in session ("confirm you're not a bot", age, members-only). */
    NEED_COOKIES("need_cookies"),
    VIDEO_UNAVAILABLE("video_unavailable"),
    GEO_RESTRICTED("geo_restricted"),
    ACCESS_DENIED("access_denied"),
    NETWORK("network"),
    DISK_FULL("disk_full"),
    UNSUPPORTED_SITE("unsupported_site"),
    ENGINE_OUTDATED("engine_outdated"),
    TEMPORARY_SITE_ERROR("temporary_site_error"),
    EXTRACTOR_OUTDATED("extractor_outdated"),
    UNKNOWN("unknown"),
}

/**
 * Maps yt-dlp stderr output to a [YtDlpError].
 *
 * Rules are checked in priority order: the most user-actionable failure wins
 * when a log contains several signals (e.g. a bot-check page delivered with
 * HTTP 403 must classify as NEED_COOKIES, not ACCESS_DENIED).
 */
object YtDlpErrorClassifier {
    private val rules: List<Pair<Regex, YtDlpError>> = listOf(
        Regex("sign in to confirm you'?re not a bot", RegexOption.IGNORE_CASE) to YtDlpError.NEED_COOKIES,
        Regex(
            "sign in to confirm your age|age-restricted|inappropriate for some users",
            RegexOption.IGNORE_CASE,
        ) to YtDlpError.NEED_COOKIES,
        Regex(
            "members-only|available to this channel'?s members|join this channel",
            RegexOption.IGNORE_CASE,
        ) to YtDlpError.NEED_COOKIES,
        // Geo-restriction must precede the generic VIDEO_UNAVAILABLE rule: yt-dlp
        // reports geo blocks either as "This video is not available in your
        // country" or "The uploader has not made this video available in your
        // country", and real logs also combine it with "Video unavailable."
        Regex(
            "not made this video available in your country|not available in your country|" +
                "unavailable in your country",
            RegexOption.IGNORE_CASE,
        ) to YtDlpError.GEO_RESTRICTED,
        Regex(
            "private video|video unavailable|this video is not available|has been removed|removed by the uploader",
            RegexOption.IGNORE_CASE,
        ) to YtDlpError.VIDEO_UNAVAILABLE,
        Regex("http error 40[13]|forbidden", RegexOption.IGNORE_CASE) to YtDlpError.ACCESS_DENIED,
        Regex("no space left on device|enospc", RegexOption.IGNORE_CASE) to YtDlpError.DISK_FULL,
        Regex(
            "nsig extraction failed|signature extraction failed|unable to extract|please report this issue",
            RegexOption.IGNORE_CASE,
        ) to YtDlpError.EXTRACTOR_OUTDATED,
        Regex(
            "http error (429|5[0-9][0-9])|too many requests|service unavailable|bad gateway|gateway timeout",
            RegexOption.IGNORE_CASE,
        ) to YtDlpError.TEMPORARY_SITE_ERROR,
        Regex(
            "unsupported url|no suitable extractor|unsupported site|this site is not supported",
            RegexOption.IGNORE_CASE,
        ) to YtDlpError.UNSUPPORTED_SITE,
        Regex(
            "yt-dlp is no longer supported|please update yt-dlp|update yt-dlp to|unsupported python version|" +
                "requires python 3\\.10|syntaxerror: invalid syntax",
            RegexOption.IGNORE_CASE,
        ) to YtDlpError.ENGINE_OUTDATED,
        Regex(
            "could not resolve host|connection refused|connection reset|timed out|" +
                "network is unreachable|unable to connect|temporary failure in name resolution",
            RegexOption.IGNORE_CASE,
        ) to YtDlpError.NETWORK,
    )

    fun classify(stderr: String): YtDlpError {
        for ((pattern, error) in rules) {
            if (pattern.containsMatchIn(stderr)) return error
        }
        return YtDlpError.UNKNOWN
    }
}
