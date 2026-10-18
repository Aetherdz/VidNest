package com.movid.app.core.yt

import com.movid.app.engine.isExpectedMediaFile
import java.io.File
import kotlin.io.path.createTempDirectory
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class MediaOutputValidationTest {

    @Test
    fun accepts_nonempty_files_with_playable_media_extensions() {
        val directory = createTempDirectory().toFile()
        try {
            val media = File(directory, "download.mp4").apply { writeText("media") }
            assertTrue(isExpectedMediaFile(media, "download"))
        } finally {
            directory.deleteRecursively()
        }
    }

    @Test
    fun rejects_empty_wrong_extension_and_sidecar_outputs() {
        val directory = createTempDirectory().toFile()
        try {
            val emptyMedia = File(directory, "download.mp4").apply { createNewFile() }
            val sidecar = File(directory, "download.info.json").apply { writeText("metadata") }
            val partial = File(directory, "download.mp4.part").apply { writeText("partial") }
            val ytDlpState = File(directory, "download.mp4.ytdl").apply { writeText("state") }
            val foreignId = File(directory, "other.mp4").apply { writeText("media") }

            assertFalse(isExpectedMediaFile(emptyMedia, "download"))
            assertFalse(isExpectedMediaFile(sidecar, "download"))
            assertFalse(isExpectedMediaFile(partial, "download"))
            assertFalse(isExpectedMediaFile(ytDlpState, "download"))
            assertFalse(isExpectedMediaFile(foreignId, "download"))
        } finally {
            directory.deleteRecursively()
        }
    }

}
