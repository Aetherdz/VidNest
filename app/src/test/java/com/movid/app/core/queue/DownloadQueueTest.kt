package com.movid.app.core.queue

import com.movid.app.core.yt.YtDlpError
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

class DownloadQueueTest {

    private fun makeItem(id: String) = QueueItem(id = id, url = "https://example.com/$id")

    @Test
    fun add_sets_queued_state() {
        val q = DownloadQueue()
        q.add(makeItem("a").copy(title = "T"))
        assertEquals(1, q.items.size)
        val it = q.item("a")!!
        assertEquals(DownloadState.QUEUED, it.state)
        assertEquals(0f, it.progress)
        assertNull(it.errorCode)
        assertEquals("T", it.title)
    }

    @Test
    fun add_duplicate_id_throws() {
        val q = DownloadQueue()
        q.add(makeItem("a"))
        assertThrows(IllegalArgumentException::class.java) { q.add(makeItem("a")) }
        assertEquals(1, q.items.size)
    }

    @Test
    fun item_unknown_returns_null() {
        val q = DownloadQueue()
        assertNull(q.item("nope"))
    }

    @Test
    fun remove_returns_boolean() {
        val q = DownloadQueue().apply { add(makeItem("a")); add(makeItem("b")) }
        assertTrue(q.remove("a"))
        assertFalse(q.remove("nope"))
        assertFalse(q.remove("a")) // already gone
        assertEquals(1, q.items.size)
        assertEquals("b", q.items.first().id)
    }

    @Test
    fun pollStarts_fifo_and_capacity() {
        val q = DownloadQueue(maxConcurrent = 2)
        listOf("a", "b", "c", "d").forEach { q.add(makeItem(it)) }
        assertEquals(listOf("a", "b"), q.pollStarts())
        assertEquals(2, q.runningCount)
        assertEquals(emptyList<String>(), q.pollStarts()) // capacity full
        assertEquals(DownloadState.RUNNING, q.item("a")!!.state)
        assertEquals(DownloadState.RUNNING, q.item("b")!!.state)
        assertEquals(DownloadState.QUEUED, q.item("c")!!.state)
        assertEquals(DownloadState.QUEUED, q.item("d")!!.state)
    }

    @Test
    fun pollStarts_skips_non_queued() {
        val q = DownloadQueue(maxConcurrent = 2).apply {
            add(makeItem("a"))
            add(makeItem("b"))
            add(makeItem("c"))
            add(makeItem("d"))
            pollStarts() // a, b RUNNING
            onCompleted("a") // a DONE
            pause("c") // c QUEUED -> PAUSED
        }
        // only d is QUEUED; a=DONE, b=RUNNING, c=PAUSED
        assertEquals(listOf("d"), q.pollStarts())
        assertEquals(DownloadState.DONE, q.item("a")!!.state)
        assertEquals(DownloadState.RUNNING, q.item("b")!!.state)
        assertEquals(DownloadState.PAUSED, q.item("c")!!.state)
        assertEquals(DownloadState.RUNNING, q.item("d")!!.state)
    }

    @Test
    fun onProgress_only_when_running() {
        val q = DownloadQueue(maxConcurrent = 2).apply {
            add(makeItem("a"))
            pollStarts() // a is RUNNING
        }
        q.onProgress("a", 0.5f)
        assertEquals(0.5f, q.item("a")!!.progress)

        q.onProgress("a", -0.1f) // clamped to 0
        assertEquals(0f, q.item("a")!!.progress)

        q.onProgress("a", 1.5f) // clamped to 1
        assertEquals(1f, q.item("a")!!.progress)

        // QUEUED item ignores progress
        q.add(makeItem("b"))
        q.onProgress("b", 0.9f)
        assertEquals(0f, q.item("b")!!.progress)

        // unknown id is a no-op
        q.onProgress("nope", 0.9f)
        assertEquals(2, q.items.size)
    }

    @Test
    fun onCompleted_running_to_done() {
        val q = DownloadQueue(maxConcurrent = 2).apply {
            add(makeItem("a"))
            pollStarts()
        }
        q.onCompleted("a", "/storage/file.mp4")
        val done = q.item("a")!!
        assertEquals(DownloadState.DONE, done.state)
        assertEquals(1f, done.progress)
        assertEquals("/storage/file.mp4", done.outputPath)
        assertNull(done.errorCode)
    }

    @Test
    fun onCompleted_paused_is_noop() {
        val q = DownloadQueue(maxConcurrent = 2).apply {
            add(makeItem("a"))
            pollStarts()
            pause("a")
        }
        assertEquals(DownloadState.PAUSED, q.item("a")!!.state)
        q.onCompleted("a")
        assertEquals(DownloadState.PAUSED, q.item("a")!!.state)
        assertEquals(0f, q.item("a")!!.progress)
    }

    @Test
    fun onCompleted_non_running_is_noop() {
        val q = DownloadQueue().apply { add(makeItem("a")) }
        q.onCompleted("a", "/x")
        assertEquals(DownloadState.QUEUED, q.item("a")!!.state)
        assertEquals(0f, q.item("a")!!.progress)
    }

    @Test
    fun onFailed_requeues_under_max_attempts() {
        val q = DownloadQueue(maxAttempts = 3, maxConcurrent = 2).apply {
            add(makeItem("a"))
            pollStarts()
        }
        // failure 1 -> requeued, attempts=1
        q.onFailed("a", YtDlpError.NETWORK)
        assertEquals(DownloadState.QUEUED, q.item("a")!!.state)
        assertEquals(1, q.item("a")!!.attempts)
        assertEquals("network", q.item("a")!!.errorCode)

        // failure 2 -> requeued, attempts=2
        q.pollStarts()
        q.onFailed("a", YtDlpError.NETWORK)
        assertEquals(DownloadState.QUEUED, q.item("a")!!.state)
        assertEquals(2, q.item("a")!!.attempts)

        // failure 3 -> FAILED (attempts >= maxAttempts)
        q.pollStarts()
        q.onFailed("a", YtDlpError.NETWORK)
        assertEquals(DownloadState.FAILED, q.item("a")!!.state)
        assertEquals(3, q.item("a")!!.attempts)
    }

    @Test
    fun onFailed_need_cookies_not_requeued() {
        val q = DownloadQueue(maxConcurrent = 2).apply {
            add(makeItem("a"))
            pollStarts()
        }
        q.onFailed("a", YtDlpError.NEED_COOKIES)
        assertEquals(DownloadState.NEED_COOKIES, q.item("a")!!.state)
        assertEquals(1, q.item("a")!!.attempts)
        assertEquals("need_cookies", q.item("a")!!.errorCode)
    }

    @Test
    fun onFailed_non_running_is_noop() {
        val q = DownloadQueue().apply { add(makeItem("a")) }
        q.onFailed("a", YtDlpError.NETWORK)
        assertEquals(DownloadState.QUEUED, q.item("a")!!.state)
        assertEquals(0, q.item("a")!!.attempts)
    }

    @Test
    fun retry_clears_budget() {
        val q = DownloadQueue(maxAttempts = 2, maxConcurrent = 2).apply {
            add(makeItem("a"))
            pollStarts()
            onFailed("a", YtDlpError.NETWORK)
            pollStarts()
            onFailed("a", YtDlpError.NETWORK)
        }
        assertEquals(DownloadState.FAILED, q.item("a")!!.state)
        assertEquals(2, q.item("a")!!.attempts)

        q.retry("a")
        assertEquals(DownloadState.QUEUED, q.item("a")!!.state)
        assertEquals(0, q.item("a")!!.attempts)
        assertEquals(0f, q.item("a")!!.progress)
        assertNull(q.item("a")!!.errorCode)
    }

    @Test
    fun retry_need_cookies_and_cancelled() {
        val q = DownloadQueue(maxConcurrent = 2).apply {
            add(makeItem("a"))
            pollStarts()
            onFailed("a", YtDlpError.NEED_COOKIES)
        }
        q.retry("a")
        assertEquals(DownloadState.QUEUED, q.item("a")!!.state)
        assertEquals(0, q.item("a")!!.attempts)

        q.cancel("a") // QUEUED -> CANCELLED
        assertEquals(DownloadState.CANCELLED, q.item("a")!!.state)
        q.retry("a") // CANCELLED -> QUEUED
        assertEquals(DownloadState.QUEUED, q.item("a")!!.state)
    }

    @Test
    fun retry_done_is_noop() {
        val q = DownloadQueue(maxConcurrent = 2).apply {
            add(makeItem("a"))
            pollStarts()
            onCompleted("a")
        }
        q.retry("a")
        assertEquals(DownloadState.DONE, q.item("a")!!.state)
    }

    @Test
    fun cancel_non_done_becomes_cancelled() {
        val q = DownloadQueue(maxConcurrent = 2).apply {
            add(makeItem("a"))
            pollStarts()
        }
        q.cancel("a")
        assertEquals(DownloadState.CANCELLED, q.item("a")!!.state)
    }

    @Test
    fun cancel_then_late_failure_does_not_consume_retry_or_requeue() {
        val q = DownloadQueue(maxConcurrent = 2).apply {
            add(makeItem("a"))
            pollStarts()
        }
        q.cancel("a")
        q.onFailed("a", YtDlpError.NETWORK)
        assertEquals(DownloadState.CANCELLED, q.item("a")!!.state)
        assertEquals(0, q.item("a")!!.attempts)
    }

    @Test
    fun cancel_after_complete_is_noop() {
        val q = DownloadQueue(maxConcurrent = 2).apply {
            add(makeItem("a"))
            pollStarts()
            onCompleted("a")
        }
        assertEquals(DownloadState.DONE, q.item("a")!!.state)
        q.cancel("a")
        assertEquals(DownloadState.DONE, q.item("a")!!.state) // unchanged
    }

    @Test
    fun cancel_unknown_is_noop() {
        val q = DownloadQueue().apply { add(makeItem("a")) }
        q.cancel("nope")
        assertEquals(1, q.items.size)
    }

    @Test
    fun pause_and_resume() {
        val q = DownloadQueue(maxConcurrent = 2).apply {
            add(makeItem("a"))
            pollStarts()
        }
        q.pause("a")
        assertEquals(DownloadState.PAUSED, q.item("a")!!.state)
        q.resume("a")
        assertEquals(DownloadState.QUEUED, q.item("a")!!.state)
    }

    @Test
    fun pause_only_queued_or_running() {
        val q = DownloadQueue().apply { add(makeItem("a")) }
        q.pause("a") // QUEUED -> PAUSED
        assertEquals(DownloadState.PAUSED, q.item("a")!!.state)
        q.pause("a") // PAUSED -> no-op
        assertEquals(DownloadState.PAUSED, q.item("a")!!.state)
    }

    @Test
    fun resume_only_paused() {
        val q = DownloadQueue().apply { add(makeItem("a")) }
        q.resume("a") // QUEUED -> no-op
        assertEquals(DownloadState.QUEUED, q.item("a")!!.state)
    }

    @Test
    fun requeueAllRunning() {
        val q = DownloadQueue(maxConcurrent = 2).apply {
            add(makeItem("a"))
            add(makeItem("b"))
            add(makeItem("c"))
            pollStarts() // a, b RUNNING; c QUEUED
            onCompleted("a") // a DONE, frees a slot
            pollStarts() // c RUNNING
            onCompleted("c") // c DONE
        }
        // a=DONE, b=RUNNING, c=DONE
        assertEquals(1, q.runningCount)
        q.requeueAllRunning()
        assertEquals(0, q.runningCount)
        assertEquals(DownloadState.DONE, q.item("a")!!.state) // untouched
        assertEquals(DownloadState.QUEUED, q.item("b")!!.state) // RUNNING -> QUEUED
        assertEquals(DownloadState.DONE, q.item("c")!!.state) // untouched
    }

    @Test
    fun setTitle_updates_title() {
        val q = DownloadQueue().apply { add(makeItem("a")) }
        q.setTitle("a", "Video Title")
        assertEquals("Video Title", q.item("a")!!.title)
    }

    @Test
    fun setTitle_unknown_is_noop() {
        val q = DownloadQueue().apply { add(makeItem("a")) }
        q.setTitle("nope", "x")
        assertEquals(1, q.items.size)
    }
}
