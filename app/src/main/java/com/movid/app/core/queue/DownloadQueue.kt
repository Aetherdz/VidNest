package com.movid.app.core.queue

import com.movid.app.core.yt.DownloadSpec
import com.movid.app.core.yt.YtDlpError

enum class DownloadState { QUEUED, RUNNING, PAUSED, DONE, FAILED, NEED_COOKIES, CANCELLED }

data class QueueItem(
    val id: String,
    val url: String,
    val title: String = "",
    val state: DownloadState = DownloadState.QUEUED,
    val progress: Float = 0f,
    val attempts: Int = 0,
    val errorCode: String? = null,
    /** content:// or file:// location of the finished download. */
    val outputPath: String? = null,
    /** What to fetch: best quality, a height cap, or audio-only. */
    val spec: DownloadSpec = DownloadSpec(),
)

/**
 * Pure, deterministic queue state machine: no threads, no clocks.
 * The caller drives events (worker callbacks, user actions) and renders
 * [items].
 *
 * Retry policy:
 *  - NEED_COOKIES never auto-retries; it waits for a user action.
 *  - Other failures re-queue while [maxAttempts] is not exhausted.
 *  - User-initiated [retry] clears the attempt budget for a fresh start.
 */
class DownloadQueue(
    initial: List<QueueItem> = emptyList(),
    private val maxConcurrent: Int = 2,
    private val maxAttempts: Int = 3,
) {
    private val _items = initial.toMutableList()

    val items: List<QueueItem> get() = _items.toList()

    val runningCount: Int get() = _items.count { it.state == DownloadState.RUNNING }

    fun item(id: String): QueueItem? = _items.firstOrNull { it.id == id }

    fun add(item: QueueItem): QueueItem {
        require(_items.none { it.id == item.id }) { "duplicate queue id: ${item.id}" }
        val queued = item.copy(state = DownloadState.QUEUED, progress = 0f, errorCode = null)
        _items.add(queued)
        return queued
    }

    fun remove(id: String): Boolean = _items.removeAll { it.id == id }

    /** Marks the next QUEUED items RUNNING while capacity allows (FIFO). Returns ids to start. */
    fun pollStarts(): List<String> {
        val started = ArrayList<String>()
        // Snapshot the live count once: previously-started items are already
        // reflected in runningCount, so counting `started` again halved capacity.
        var running = runningCount
        for (index in _items.indices) {
            if (running >= maxConcurrent) break
            val entry = _items[index]
            if (entry.state == DownloadState.QUEUED) {
                _items[index] = entry.copy(state = DownloadState.RUNNING, errorCode = null)
                started.add(entry.id)
                running++
            }
        }
        return started
    }

    fun onProgress(id: String, progress: Float) {
        update(id) {
            if (it.state != DownloadState.RUNNING) it
            else it.copy(progress = progress.coerceIn(0f, 1f))
        }
    }

    fun onCompleted(id: String, outputPath: String? = null) {
        update(id) {
            when (it.state) {
                DownloadState.RUNNING ->
                    it.copy(
                        state = DownloadState.DONE,
                        progress = 1f,
                        errorCode = null,
                        outputPath = outputPath ?: it.outputPath,
                    )

                else -> it
            }
        }
    }

    fun onFailed(id: String, error: YtDlpError) {
        update(id) { entry ->
            // Only a RUNNING item may fail: late events from a stopped worker
            // (cancel/pause/delete/retry) must not requeue or corrupt state.
            if (entry.state != DownloadState.RUNNING) return@update entry
            val attempts = entry.attempts + 1
            when {
                error == YtDlpError.NEED_COOKIES ->
                    entry.copy(state = DownloadState.NEED_COOKIES, attempts = attempts, errorCode = error.code)

                attempts >= maxAttempts ->
                    entry.copy(state = DownloadState.FAILED, attempts = attempts, errorCode = error.code)

                else ->
                    entry.copy(state = DownloadState.QUEUED, attempts = attempts, errorCode = error.code)
            }
        }
    }

    /** Worker-side metadata update (e.g. resolved video title). */
    fun setTitle(id: String, title: String) {
        update(id) { it.copy(title = title) }
    }

    /** User-initiated retry: clears the attempt budget and the last error. */
    fun retry(id: String) {
        update(id) {
            if (it.state == DownloadState.FAILED || it.state == DownloadState.NEED_COOKIES || it.state == DownloadState.CANCELLED) {
                it.copy(state = DownloadState.QUEUED, attempts = 0, progress = 0f, errorCode = null)
            } else {
                it
            }
        }
    }

    /** Crash recovery: any RUNNING entry whose worker is gone goes back to QUEUED. */
    fun requeueAllRunning() {
        for (index in _items.indices) {
            if (_items[index].state == DownloadState.RUNNING) {
                _items[index] = _items[index].copy(state = DownloadState.QUEUED)
            }
        }
    }

    fun pause(id: String) {
        update(id) {
            if (it.state == DownloadState.QUEUED || it.state == DownloadState.RUNNING) {
                it.copy(state = DownloadState.PAUSED)
            } else {
                it
            }
        }
    }

    fun resume(id: String) {
        update(id) {
            if (it.state == DownloadState.PAUSED) it.copy(state = DownloadState.QUEUED) else it
        }
    }

    fun cancel(id: String) {
        update(id) {
            if (it.state == DownloadState.DONE) it else it.copy(state = DownloadState.CANCELLED)
        }
    }

    private fun update(id: String, transform: (QueueItem) -> QueueItem) {
        val index = _items.indexOfFirst { it.id == id }
        if (index >= 0) {
            _items[index] = transform(_items[index])
        }
    }
}
