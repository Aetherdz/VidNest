package com.movid.app.core.yt

import org.junit.Assert.assertEquals
import org.junit.Test

class YtDlpErrorClassifierTest {
    @Test fun `maps actionable engine and site failures`() {
        assertEquals(YtDlpError.ENGINE_OUTDATED, YtDlpErrorClassifier.classify("Please update yt-dlp to latest"))
        assertEquals(YtDlpError.UNSUPPORTED_SITE, YtDlpErrorClassifier.classify("Unsupported URL: example.invalid"))
        assertEquals(YtDlpError.GEO_RESTRICTED, YtDlpErrorClassifier.classify("Video unavailable in your country"))
        assertEquals(YtDlpError.DISK_FULL, YtDlpErrorClassifier.classify("OSError: [Errno 28] No space left on device"))
        assertEquals(YtDlpError.TEMPORARY_SITE_ERROR, YtDlpErrorClassifier.classify("HTTP Error 503: Service Unavailable"))
    }

    @Test fun `prioritizes login-required over generic forbidden`() {
        assertEquals(
            YtDlpError.NEED_COOKIES,
            YtDlpErrorClassifier.classify("HTTP Error 403: Forbidden. Sign in to confirm you're not a bot"),
        )
    }

    @Test fun `local and extractor issues outrank temporary HTTP noise`() {
        assertEquals(
            YtDlpError.DISK_FULL,
            YtDlpErrorClassifier.classify("HTTP Error 503: Service Unavailable; No space left on device"),
        )
        assertEquals(
            YtDlpError.EXTRACTOR_OUTDATED,
            YtDlpErrorClassifier.classify("HTTP Error 503: nsig extraction failed"),
        )
    }

    @Test fun `classifies link-resolution timeout and unknown fallback`() {
        assertEquals(YtDlpError.NETWORK, YtDlpErrorClassifier.classify("Short-link resolution timed out"))
        assertEquals(YtDlpError.UNKNOWN, YtDlpErrorClassifier.classify("unrecognized short-link failure"))
    }
}
