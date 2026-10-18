package com.movid.app.data

import com.movid.app.core.queue.DownloadQueue
import com.movid.app.core.queue.DownloadState
import com.movid.app.core.queue.QueueItem
import com.movid.app.core.yt.DownloadSpec
import com.movid.app.core.yt.YtDlpError
import java.util.UUID
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

/**
 * Single owner of the download queue: the pure state machine from the core
 * package persisted into Room after every transition. The UI renders [items];
 * the DownloadService drives worker events through the same methods.
 */
class DownloadRepository(private val dao: DownloadDao) {

    private var queue = DownloadQueue()
    private val mutex = Mutex()

    private val _items = MutableStateFlow<List<QueueItem>>(emptyList())
    val items: StateFlow<List<QueueItem>> = _items.asStateFlow()

    /** Crash recovery: orphaned RUNNING rows go back to QUEUED. */
    suspend fun restore() = mutex.withLock {
        dao.requeueOrphanedRuns()
        val saved = dao.all()
        if (saved.isNotEmpty()) {
            queue = DownloadQueue(saved.map { it.toQueueItem() })
        }
        _items.value = queue.items
    }

    suspend fun add(url: String, spec: DownloadSpec = DownloadSpec(), title: String = ""): String {
        var addedId = ""
        lockPublish {
            // Guarded dedup: the exact same link + quality while a copy is
            // still active resolves to the existing item instead of queueing
            // a duplicate download. Different qualities stay allowed.
            val duplicate = queue.items.firstOrNull {
                it.url == url && it.spec == spec &&
                    it.state in setOf(
                        DownloadState.QUEUED,
                        DownloadState.RUNNING,
                        DownloadState.PAUSED,
                    )
            }
            if (duplicate != null) {
                addedId = duplicate.id
            } else {
                val id = UUID.randomUUID().toString()
                queue.add(QueueItem(id = id, url = url, title = title, spec = spec))
                addedId = id
            }
        }
        return addedId
    }

    /** Worker-side metadata update (resolved video title). */
    suspend fun updateTitle(id: String, title: String) = lockPublish { queue.setTitle(id, title) }

    suspend fun onProgress(id: String, progress: Float) = lockPublish { queue.onProgress(id, progress) }

    suspend fun onCompleted(id: String, outputPath: String? = null) =
        lockPublish { queue.onCompleted(id, outputPath) }

    suspend fun onFailed(id: String, error: YtDlpError) = lockPublish { queue.onFailed(id, error) }

    suspend fun retry(id: String) = lockPublish { queue.retry(id) }

    suspend fun pause(id: String) = lockPublish { queue.pause(id) }

    suspend fun resume(id: String) = lockPublish { queue.resume(id) }

    suspend fun cancel(id: String) = lockPublish { queue.cancel(id) }

    suspend fun remove(id: String) {
        mutex.withLock {
            queue.remove(id)
            dao.delete(id)
            _items.value = queue.items
        }
    }

    /** Marks the next QUEUED items RUNNING (FIFO, capacity-limited). */
    suspend fun nextStarts(): List<QueueItem> {
        var started: List<String> = emptyList()
        lockPublish { started = queue.pollStarts() }
        return _items.value.filter { it.id in started }
    }

    private suspend fun lockPublish(block: () -> Unit) {
        mutex.withLock {
            block()
            persistLocked()
            _items.value = queue.items
        }
    }

    /** Upserts every item: queue sizes are small, correctness over cleverness. */
    private suspend fun persistLocked() {
        val existing = dao.all().associateBy { it.id }
        for (item in queue.items) {
            dao.upsert(item.toEntity(existing[item.id]))
        }
    }
}