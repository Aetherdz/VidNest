package com.movid.app.engine

import android.content.Context
import com.movid.app.core.yt.DownloadSpec
import com.movid.app.core.yt.ShortLinkResolver
import com.movid.app.core.yt.YtDlpDefaults
import com.movid.app.core.yt.YtDlpError
import com.movid.app.core.yt.YtDlpErrorClassifier
import com.yausername.ffmpeg.FFmpeg
import com.yausername.youtubedl_android.YoutubeDL
import com.yausername.youtubedl_android.YoutubeDLRequest
import com.yausername.youtubedl_android.mapper.VideoInfo
import java.io.File
import java.util.UUID
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.json.jsonObject

/**
 * Thin wrapper over youtubedl-android (bundled python + yt-dlp + ffmpeg).
 * Owns binary init/update and maps yt-dlp stderr to [YtDlpError].
 *
 * All methods are blocking; call them off the main thread.
 */
class FetchEngine(private val appContext: Context) {

    private val shortLinkResolver = ShortLinkResolver()

    @Volatile
    private var ready = false

    /** Initializes the bundled binaries. Idempotent; safe from any thread. */
    fun ensureInitialized() {
        if (ready) return
        synchronized(this) {
            if (ready) return
            YoutubeDL.getInstance().init(appContext)
            FFmpeg.getInstance().init(appContext)
            ready = true
        }
    }

    /**
     * Best-effort refresh of the yt-dlp binary (the bundled one is old).
     * Returns true when the update succeeded; failures (offline, rate limit)
     * are ignored and the bundled binary stays usable.
     */
    fun updateBinary(): Boolean = try {
        ensureInitialized()
        YoutubeDL.getInstance().updateYoutubeDL(appContext)
        true
    } catch (_: Throwable) {
        false
    }

    fun currentVersionName(): String? = runCatching {
        ensureInitialized()
        YoutubeDL.getInstance().version(appContext)
    }.getOrNull()

    data class FetchInfo(
        val id: String,
        val title: String,
        val uploader: String,
        val thumbnailUrl: String,
    )

    /** Probes a URL for metadata (no download). Blocking. */
    @Throws(Exception::class)
    fun probe(url: String): FetchInfo {
        ensureInitialized()
        val resolvedUrl = validatedUrl(url)
        val info: VideoInfo = YoutubeDL.getInstance().getInfo(resolvedUrl)
        return FetchInfo(
            id = info.id.orEmpty(),
            title = info.title.orEmpty(),
            uploader = info.uploader.orEmpty(),
            thumbnailUrl = info.thumbnail.orEmpty(),
        )
    }

    /** Qualities discovered by a dry probe (-J). */
    data class QualityProbe(
        val title: String,
        val videoHeights: List<Int>,
        val hasAudioOnly: Boolean,
    )

    /**
     * Dry-runs yt-dlp (-J, no download) to list the distinct video heights the
     * clip offers and whether an audio-only stream exists. Blocking.
     */
    @Throws(Exception::class)
    fun probeQualities(url: String): QualityProbe {
        ensureInitialized()
        val resolvedUrl = validatedUrl(url)
        val request = YoutubeDLRequest(resolvedUrl)
        request.addOption("-J")
        YtDlpDefaults.commonOptions().forEach { (name, value) ->
            if (value == null) request.addOption(name) else request.addOption(name, value)
        }
        val response = YoutubeDL.getInstance()
            .execute(request, "probe-" + UUID.randomUUID()) { _, _, _ -> }
        if (response.exitCode != 0) {
            val stderr = response.err.ifBlank { response.out }
            throw IllegalStateException(stderr.ifBlank { "probe failed" })
        }
        val root = Json.parseToJsonElement(response.out).jsonObject
        val title = (root["title"] as? JsonPrimitive)?.contentOrNull.orEmpty()
        val heights = sortedSetOf<Int>()
        var hasAudioOnly = false
        val formats = root["formats"] as? JsonArray ?: JsonArray(emptyList())
        for (element in formats) {
            val format = element.jsonObject
            val vcodec = (format["vcodec"] as? JsonPrimitive)?.contentOrNull ?: "none"
            val acodec = (format["acodec"] as? JsonPrimitive)?.contentOrNull ?: "none"
            if (acodec != "none") hasAudioOnly = true
            val height = (format["height"] as? JsonPrimitive)?.intOrNull ?: continue
            if (vcodec != "none" && height > 0) heights.add(height)
        }
        return QualityProbe(
            title = title,
            videoHeights = heights.sortedDescending(),
            hasAudioOnly = hasAudioOnly,
        )
    }

    data class Result(val ok: Boolean, val error: YtDlpError?, val detail: String)

    /**
     * Downloads [url] to [outputTemplate] (yt-dlp "-o" template, e.g.
     * ".../abc.%(ext)s") honouring [spec] (best / height cap / audio-only MP3).
     * [processId] is the queue item id so cancellation can address the running
     * process. Blocking.
     */
    fun download(
        processId: String,
        url: String,
        outputTemplate: String,
        spec: DownloadSpec = DownloadSpec(),
        cookiesFile: File? = null,
        onProgress: (Float) -> Unit = {},
    ): Result {
        return try {
            ensureInitialized()
            val resolvedUrl = validatedUrl(url)
            val request = YoutubeDLRequest(resolvedUrl)
            request.addOption("-o", outputTemplate)
            YtDlpDefaults.downloadOptions().forEach { (name, value) ->
                if (value == null) request.addOption(name) else request.addOption(name, value)
            }
            request.addOption("-f", spec.formatSelector())
            if (spec.audioOnly) {
                request.addOption("-x")
                request.addOption("--audio-format", "mp3")
                request.addOption("--audio-quality", "0")
            } else {
                request.addOption("--merge-output-format", "mp4")
            }
            if (cookiesFile != null && cookiesFile.exists()) {
                request.addOption("--cookies", cookiesFile.absolutePath)
            }
            val response = YoutubeDL.getInstance().execute(request, processId) { progress, _, _ ->
                if (progress >= 0f) onProgress(progress.coerceIn(0f, 1f))
            }
            if (response.exitCode == 0) {
                Result(true, null, response.out)
            } else {
                val stderr = response.err.ifBlank { response.out }
                Result(false, YtDlpErrorClassifier.classify(stderr), stderr)
            }
        } catch (e: Exception) {
            val message = generateSequence(e as Throwable?) { it.cause }
                .mapNotNull { it.message?.takeIf(String::isNotBlank) }
                .distinct()
                .joinToString(": ")
                .ifBlank { e.javaClass.simpleName }
            Result(false, YtDlpErrorClassifier.classify(message), message)
        }
    }

    /** Kills the running yt-dlp process for [processId], if any. */
    fun cancel(processId: String) {
        try {
            YoutubeDL.getInstance().destroyProcessById(processId)
        } catch (_: Throwable) {
            // Process already finished or never started.
        }
    }

    /**
     * Rejects anything that is not a plain http(s) URL. Prevents a pasted
     * string from being parsed as a yt-dlp CLI flag (argument injection) and
     * keeps non-URL schemes out of the engine.
     */
    private fun validatedUrl(url: String): String {
        val trimmed = url.trim()
        require(trimmed.length <= 4096) { "URL is too long" }
        require(!trimmed.startsWith("-")) { "invalid url" }
        val uri = runCatching { java.net.URI(trimmed) }.getOrNull()
        require(
            uri != null &&
                (uri.scheme.equals("http", ignoreCase = true) || uri.scheme.equals("https", ignoreCase = true)) &&
                !uri.host.isNullOrBlank() && uri.rawUserInfo == null,
        ) { "invalid url" }
        val resolved = shortLinkResolver.resolve(uri.toASCIIString())
        require(!resolved.startsWith("-")) { "invalid url" }
        val finalUri = runCatching { java.net.URI(resolved) }.getOrNull()
        require(
            finalUri != null &&
                (finalUri.scheme.equals("http", ignoreCase = true) || finalUri.scheme.equals("https", ignoreCase = true)) &&
                !finalUri.host.isNullOrBlank() && finalUri.rawUserInfo == null,
        ) { "invalid url" }
        return finalUri.toASCIIString()
    }
}
