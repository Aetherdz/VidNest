package com.movid.app.core.yt

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class YtDlpDefaultsTest {
    @Test
    fun `probe defaults are bounded and single-item`() {
        val options = YtDlpDefaults.commonOptions().toMap()
        assertTrue(options.containsKey("--no-playlist"))
        assertEquals("25", options["--socket-timeout"])
        assertEquals("5", options["--retries"])
    }

    @Test
    fun `download defaults enable progress retries metadata and sorting`() {
        val options = YtDlpDefaults.downloadOptions().toMap()
        assertTrue(options.containsKey("--no-playlist"))
        assertTrue(options.containsKey("--newline"))
        assertTrue(options.containsKey("--embed-metadata"))
        assertEquals("5", options["--fragment-retries"])
        assertEquals("4", options["--concurrent-fragments"])
        assertEquals("res,ext:mp4:m4a,codec:avc:m4a", options["-S"])
    }
}
