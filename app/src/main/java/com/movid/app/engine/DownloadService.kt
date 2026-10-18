package com.movid.app.engine

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.media.MediaScannerConnection
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.app.ServiceCompat
import androidx.lifecycle.LifecycleService
import androidx.lifecycle.lifecycleScope
import com.movid.app.AppGraph
import com.movid.app.MainActivity
import com.movid.app.R
import com.movid.app.core.queue.DownloadState
import com.movid.app.core.queue.QueueItem
import com.movid.app.core.yt.YtDlpError
import com.movid.app.data.DownloadRepository
import java.io.File
import java.util.concurrent.ConcurrentHashMap
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineStart
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

internal fun isExpectedMediaFile(file: File, id: String): Boolean =
    file.isFile && file.name.startsWith("$id.") &&
        file.extension.lowercase() in setOf(
            "mp4", "mkv", "webm", "mov", "3gp", "m4v",
            "mp3", "m4a", "opus", "ogg", "flac", "wav", "aac",
        ) && file.length() > 0L

/**
 * Foreground (dataSync) service that executes queued downloads. The queue
 * state lives in [com.movid.app.data.DownloadRepository]; this service only
 * runs work and reports events back, and restarts itself while items remain.
 */
class DownloadService : LifecycleService() {

    companion object {
        private const val CHANNEL_ID = "downloads"
        private const val SERVICE_NOTIFICATION_ID = 1001
        private const val FINISHED_NOTIFICATION_ID = 1002
        private const val ACTION_KICK = "com.movid.app.action.KICK"
        private const val ACTION_CANCEL_ITEM = "com.movid.app.action.CANCEL_ITEM"
        private const val ACTION_STOP_WORK = "com.movid.app.action.STOP_WORK"
        private const val ACTION_RETRY_ITEM = "com.movid.app.action.RETRY_ITEM"
        private const val EXTRA_ID = "id"

        /**
         * PendingIntent for a service action, safe to embed in notifications.
         * Request codes are namespaced per action + item so identical ids on
         * different buttons never collide into one PendingIntent.
         */
        private fun serviceAction(
            context: Context,
            action: String,
            id: String?,
            requestCode: Int,
        ): PendingIntent {
            val intent = Intent(context, DownloadService::class.java)
                .setAction(action)
                .putExtra(EXTRA_ID, id)
            val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                PendingIntent.getForegroundService(context, requestCode, intent, flags)
            } else {
                PendingIntent.getService(context, requestCode, intent, flags)
            }
        }

        /** Starts (or wakes) the service so it can pick up QUEUED items. */
        fun kick(context: Context) {
            context.startForegroundService(
                Intent(context, DownloadService::class.java).setAction(ACTION_KICK),
            )
        }

        fun cancel(context: Context, id: String) {
            context.startForegroundService(
                Intent(context, DownloadService::class.java)
                    .setAction(ACTION_CANCEL_ITEM)
                    .putExtra(EXTRA_ID, id),
            )
        }

        /**
         * Stops the worker for [id] without touching its queue state (used for
         * pause and delete). Safe no-op when no worker is running.
         */
        fun stopWork(context: Context, id: String) {
            context.startForegroundService(
                Intent(context, DownloadService::class.java)
                    .setAction(ACTION_STOP_WORK)
                    .putExtra(EXTRA_ID, id),
            )
        }
    }

    private val jobs = ConcurrentHashMap<String, Job>()
    private var foregroundStarted = false

    private val mediaExtensions = setOf(
        "mp4", "mkv", "webm", "mov", "3gp", "m4v",
        "mp3", "m4a", "opus", "ogg", "flac", "wav", "aac",
    )

    override fun onCreate() {
        super.onCreate()
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(
            NotificationChannel(
                CHANNEL_ID,
                getString(R.string.notif_channel_downloads),
                NotificationManager.IMPORTANCE_LOW,
            ),
        )
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        super.onStartCommand(intent, flags, startId)
        ensureForeground()
        when (intent?.action) {
            ACTION_KICK -> lifecycleScope.launch { pump() }
            ACTION_STOP_WORK -> {
                val id = intent.getStringExtra(EXTRA_ID)
                    ?.takeIf { runCatching { java.util.UUID.fromString(it) }.isSuccess }
                    ?: return START_NOT_STICKY
                lifecycleScope.launch {
                    // State transition first: a late worker callback must not
                    // requeue a job that the caller intended to pause/remove.
                    AppGraph.repository.pause(id)
                    jobs.remove(id)?.cancel()
                    AppGraph.fetchEngine.cancel(id)
                    maybeStop()
                }
            }

            ACTION_CANCEL_ITEM -> {
                // Only app-generated UUIDs may reach the queue/engine.
                val id = intent.getStringExtra(EXTRA_ID)
                    ?.takeIf { runCatching { java.util.UUID.fromString(it) }.isSuccess }
                    ?: return START_NOT_STICKY
                lifecycleScope.launch {
                    AppGraph.repository.cancel(id)
                    jobs.remove(id)?.cancel()
                    AppGraph.fetchEngine.cancel(id)
                    maybeStop()
                }
            }

            ACTION_RETRY_ITEM -> {
                // Fired from the failure notification's Retry button; the id
                // arrives from a PendingIntent we built, but validate anyway.
                val id = intent.getStringExtra(EXTRA_ID)
                    ?.takeIf { runCatching { java.util.UUID.fromString(it) }.isSuccess }
                    ?: return START_NOT_STICKY
                lifecycleScope.launch {
                    AppGraph.repository.retry(id)
                    pump()
                }
            }
        }
        return START_NOT_STICKY
    }

    private suspend fun pump() {
        val started = AppGraph.repository.nextStarts()
        for (item in started) {
            launchItem(item)
        }
        maybeStop()
    }

    private fun launchItem(item: QueueItem) {
        if (jobs.containsKey(item.id)) return
        val job = lifecycleScope.launch(Dispatchers.IO, start = CoroutineStart.LAZY) {
            try {
                runItem(item)
            } catch (expected: CancellationException) {
                throw expected
            } catch (t: Throwable) {
                // Persistence or engine crashers must not strand RUNNING items.
                runCatching { AppGraph.repository.onFailed(item.id, YtDlpError.UNKNOWN) }
            }
        }
        jobs[item.id] = job
        // Two-arg remove: a late old worker can never clobber a newer job entry.
        job.invokeOnCompletion {
            jobs.remove(item.id, job)
            lifecycleScope.launch { pump() }
        }
        job.start()
    }

    private suspend fun runItem(item: QueueItem) {
        val id = item.id
        val url = item.url
        val repo = AppGraph.repository
        val engine = AppGraph.fetchEngine

        val title = item.title.takeIf { it.isNotBlank() }
            ?: runCatching { engine.probe(url).title }.getOrNull()
        if (!title.isNullOrBlank()) repo.updateTitle(id, title)
        updateServiceNotification(title, 0, id)

        val outputBase = getExternalFilesDir(Environment.DIRECTORY_MOVIES) ?: filesDir
        // Keep the private working directory stable so in-progress files from
        // older app versions remain resumable across the brand rename.
        val outputDir = File(outputBase, "Movid").apply { mkdirs() }
        val template = File(outputDir, "$id.%(ext)s").absolutePath

        var lastPercent = -1
        val result = engine.download(
            processId = id,
            url = url,
            outputTemplate = template,
            spec = item.spec,
        ) { p ->
            val percent = (p * 100).toInt()
            if (percent != lastPercent) {
                lastPercent = percent
                lifecycleScope.launch { AppGraph.repository.onProgress(id, p) }
                updateServiceNotification(title, percent, id)
            }
        }

        if (result.ok) {
            // A stop/pause can race the engine's final success callback. Only
            // publish while this worker still owns a RUNNING queue entry.
            if (!repo.isCurrentRunning(id)) return
            val mediaFile = expectedMediaFile(outputDir, id)
            if (mediaFile == null) {
                reportFailure(id, title, YtDlpError.UNKNOWN, repo)
                return
            }
            // Move the finished file into public storage so it shows up in
            // the gallery/Music apps. When publishing is not possible the
            // private copy is kept and playback still works from there.
            val published = runCatching { publishToDevice(outputDir, id, item.spec.audioOnly) }
                .getOrNull()
            // Publishing can take time; re-check the repository immediately
            // before committing completion so a late success stays silent.
            if (!repo.isCurrentRunning(id)) {
                published?.let(::deletePublishedFile)
                return
            }
            val outputPath = published?.toString() ?: mediaFile
                .takeIf { it.isFile && it.length() > 0L }
                ?.let { Uri.fromFile(it).toString() }
            if (outputPath == null) {
                reportFailure(id, title, YtDlpError.UNKNOWN, repo)
                return
            }
            repo.onCompleted(id, outputPath)
            if (repo.items.value.firstOrNull { it.id == id }?.state != DownloadState.DONE) {
                published?.let(::deletePublishedFile)
                return
            }
            // Keep the private source until DONE is committed. If pause wins
            // the completion race, the published copy is rolled back and the
            // source remains available for resume.
            if (published != null) {
                outputDir.listFiles { file -> file.name.startsWith("$id.") }
                    ?.forEach { it.delete() }
            }
            notifyFinished(id, title, getString(R.string.notif_download_done))
        } else {
            val error = result.error ?: YtDlpError.UNKNOWN
            reportFailure(id, title, error, repo)
        }
    }

    private suspend fun reportFailure(
        id: String,
        title: String?,
        error: YtDlpError,
        repo: DownloadRepository,
    ) {
        repo.onFailed(id, error)
        // Only announce terminal failures. Paused/deleted items and transient
        // retry attempts must not produce a stale failure notification.
        val state = repo.items.value.firstOrNull { it.id == id }?.state
        if (state == DownloadState.FAILED || state == DownloadState.NEED_COOKIES) {
            notifyFinished(
                id,
                title,
                getString(R.string.notif_download_failed, getString(errorReasonRes(error))),
                // NEED_COOKIES is terminal without a cookie source, so Retry
                // would fail identically — only genuine failures get the button.
                canRetry = state == DownloadState.FAILED,
            )
        }
    }

    private fun expectedMediaFile(dir: File, id: String): File? = dir.listFiles { file ->
        isExpectedMediaFile(file, id)
    }?.maxByOrNull { it.length() }

    /**
     * Copies the finished media into shared device storage:
     *  - API 29+: MediaStore insert (Movies/VidNest, Music/VidNest; no permission)
     *  - API 26-28: direct write to the public folder when the (optional)
     *    storage permission was granted, then rescanned for the gallery.
     * On success the private working copy is deleted; on failure it is kept
     * so the item can still be played. Returns the published URI or null.
     */
    @Suppress("DEPRECATION")
    private fun publishToDevice(dir: File, id: String, audioOnly: Boolean): Uri? {
        val candidates = dir.listFiles { f ->
            f.isFile && f.name.startsWith("$id.") &&
                !f.name.endsWith(".part") && !f.name.endsWith(".ytdl")
        }?.toList().orEmpty()
        if (candidates.isEmpty()) return null
        val chosen = candidates
            .filter { it.extension.lowercase() in mediaExtensions && it.length() > 0L }
            .maxByOrNull { it.length() }
            ?: return null

        val ext = chosen.extension.lowercase()
        val isAudio = audioOnly || ext in setOf("mp3", "m4a", "opus", "ogg", "flac", "wav", "aac")
        val mime = when (ext) {
            "mp4", "m4v" -> "video/mp4"
            "mkv" -> "video/x-matroska"
            "webm" -> "video/webm"
            "3gp" -> "video/3gpp"
            "mov" -> "video/quicktime"
            "mp3" -> "audio/mpeg"
            "m4a" -> "audio/mp4"
            "opus", "ogg" -> "audio/ogg"
            "flac" -> "audio/flac"
            "wav" -> "audio/wav"
            "aac" -> "audio/aac"
            else -> if (isAudio) "audio/mpeg" else "video/mp4"
        }

        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val collection = if (isAudio) {
                MediaStore.Audio.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
            } else {
                MediaStore.Video.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
            }
            val resolver = contentResolver
            val values = ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, chosen.name)
                put(MediaStore.MediaColumns.MIME_TYPE, mime)
                put(
                    MediaStore.MediaColumns.RELATIVE_PATH,
                    if (isAudio) "${Environment.DIRECTORY_MUSIC}/VidNest"
                    else "${Environment.DIRECTORY_MOVIES}/VidNest",
                )
                put(MediaStore.MediaColumns.IS_PENDING, 1)
            }
            val uri = resolver.insert(collection, values) ?: return null
            val copied = runCatching {
                resolver.openOutputStream(uri)?.use { out ->
                    chosen.inputStream().use { input -> input.copyTo(out) }
                } != null
            }.getOrDefault(false)
            if (!copied) {
                runCatching { resolver.delete(uri, null, null) }
                return null
            }
            values.clear()
            values.put(MediaStore.MediaColumns.IS_PENDING, 0)
            val published = runCatching { resolver.update(uri, values, null, null) > 0 }
                .getOrDefault(false)
            if (!published) {
                runCatching { resolver.delete(uri, null, null) }
                return null
            }
            uri
        } else {
            if (checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) !=
                PackageManager.PERMISSION_GRANTED
            ) {
                return null
            }
            val base = if (isAudio) {
                Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MUSIC)
            } else {
                Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES)
            }
            val targetDir = File(base, "VidNest").apply { mkdirs() }
            val dest = File(targetDir, chosen.name)
            val copied = runCatching { chosen.copyTo(dest, overwrite = true) }.isSuccess
            if (!copied) {
                dest.delete()
                return null
            }
            MediaScannerConnection.scanFile(this, arrayOf(dest.absolutePath), null, null)
            Uri.fromFile(dest)
        }
    }

    private fun deletePublishedFile(uri: Uri) {
        if (uri.scheme == "content") {
            runCatching { contentResolver.delete(uri, null, null) }
        } else if (uri.scheme == "file") {
            uri.path?.let(::File)?.delete()
        }
    }

    private fun DownloadRepository.isCurrentRunning(id: String): Boolean =
        items.value.firstOrNull { it.id == id }?.state == DownloadState.RUNNING

    private fun ensureForeground() {
        if (foregroundStarted) return
        ServiceCompat.startForeground(
            this,
            SERVICE_NOTIFICATION_ID,
            buildServiceNotification(getString(R.string.notif_preparing), null),
            ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC,
        )
        foregroundStarted = true
    }

    private fun updateServiceNotification(name: String?, percent: Int, id: String? = null) {
        runCatching {
            val text = if (name.isNullOrBlank()) {
                getString(R.string.notif_downloading_percent, percent)
            } else {
                getString(R.string.notif_downloading_named, name, percent)
            }
            NotificationManagerCompat.from(this).notify(
                SERVICE_NOTIFICATION_ID,
                buildServiceNotification(text, percent, id),
            )
        }
    }

    /**
     * The ongoing service notification is shared by the whole queue, so
     * Pause/Cancel buttons are only attached when exactly one active item
     * exists and [id] is it — with several running items a per-item action
     * would be ambiguous. Retry lives on the per-item finished notification.
     */
    private fun buildServiceNotification(
        text: String,
        progress: Int?,
        id: String? = null,
    ): Notification {
        val contentIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification_download)
            .setContentTitle(getString(R.string.app_name))
            .setContentText(text)
            .setContentIntent(contentIntent)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
        val actives = AppGraph.repository.items.value.count {
            it.state == DownloadState.RUNNING || it.state == DownloadState.QUEUED
        }
        if (id != null && actives == 1) {
            builder.addAction(
                0,
                getString(R.string.player_pause),
                serviceAction(this, ACTION_STOP_WORK, id, 3001),
            ).addAction(
                0,
                getString(R.string.action_cancel),
                serviceAction(this, ACTION_CANCEL_ITEM, id, 3002),
            )
        }
        if (progress != null) {
            builder.setProgress(100, progress, false)
        }
        return builder.build()
    }

    /** Short, localized explanation for a yt-dlp failure class. */
    private fun errorReasonRes(error: YtDlpError): Int = when (error) {
        YtDlpError.NEED_COOKIES -> R.string.notif_err_need_cookies
        YtDlpError.VIDEO_UNAVAILABLE -> R.string.notif_err_unavailable
        YtDlpError.GEO_RESTRICTED -> R.string.notif_err_geo
        YtDlpError.ACCESS_DENIED -> R.string.notif_err_access
        YtDlpError.NETWORK -> R.string.notif_err_network
        YtDlpError.DISK_FULL -> R.string.notif_err_disk
        YtDlpError.UNSUPPORTED_SITE -> R.string.notif_err_unsupported
        YtDlpError.ENGINE_OUTDATED -> R.string.notif_err_engine_outdated
        YtDlpError.TEMPORARY_SITE_ERROR -> R.string.notif_err_extractor
        YtDlpError.EXTRACTOR_OUTDATED -> R.string.notif_err_extractor
        YtDlpError.UNKNOWN -> R.string.notif_err_unknown
    }

    private fun notifyFinished(id: String, title: String?, text: String, canRetry: Boolean = false) {
        runCatching {
            val contentIntent = PendingIntent.getActivity(
                this,
                0,
                Intent(this, MainActivity::class.java),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
            val builder = NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification_download)
                .setContentTitle(title?.takeIf { it.isNotBlank() } ?: getString(R.string.app_name))
                .setContentText(text)
                .setContentIntent(contentIntent)
                .setAutoCancel(true)
            if (canRetry) {
                builder.addAction(
                    0,
                    getString(R.string.action_retry),
                    serviceAction(this, ACTION_RETRY_ITEM, id, 3003),
                )
            }
            // Tag by item id: no collision with the service notification id.
            NotificationManagerCompat.from(this).notify(id, FINISHED_NOTIFICATION_ID, builder.build())
        }
    }

    private fun maybeStop() {
        if (jobs.isNotEmpty()) return
        // The repository is the arbiter of remaining work: a pump coroutine can
        // be mid-flight (not yet in [jobs]) while QUEUED/RUNNING items exist.
        val pending = AppGraph.repository.items.value.any {
            it.state == DownloadState.QUEUED || it.state == DownloadState.RUNNING
        }
        if (pending) return
        if (foregroundStarted) {
            ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
            foregroundStarted = false
        }
        stopSelf()
    }

}
