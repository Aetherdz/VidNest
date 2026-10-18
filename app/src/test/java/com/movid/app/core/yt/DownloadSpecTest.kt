package com.movid.app.core.yt

import com.movid.app.core.yt.DownloadSpec
import org.junit.Assert.assertEquals
import org.junit.Test

class DownloadSpecTest {

    @Test
    fun default_spec_is_bestvideo_bestaudio() {
        assertEquals("bestvideo+bestaudio/best", DownloadSpec().formatSelector())
    }

    @Test
    fun audio_only_selector() {
        assertEquals("bestaudio/best", DownloadSpec(audioOnly = true).formatSelector())
    }

    @Test
    fun max_height_selector() {
        assertEquals(
            "bestvideo[height<=720]+bestaudio/best[height<=720]",
            DownloadSpec(maxHeight = 720).formatSelector(),
        )
        assertEquals(
            "bestvideo[height<=1080]+bestaudio/best[height<=1080]",
            DownloadSpec(maxHeight = 1080).formatSelector(),
        )
    }

    @Test
    fun audio_only_takes_precedence_over_max_height() {
        assertEquals(
            "bestaudio/best",
            DownloadSpec(audioOnly = true, maxHeight = 720).formatSelector(),
        )
    }

    @Test
    fun label_is_display_only_does_not_affect_selector() {
        assertEquals(
            "bestvideo+bestaudio/best",
            DownloadSpec(label = "Best").formatSelector(),
        )
        assertEquals(
            "bestaudio/best",
            DownloadSpec(audioOnly = true, label = "MP3").formatSelector(),
        )
    }
}
