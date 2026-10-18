package com.movid.app.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.movid.app.core.queue.DownloadState
import com.movid.app.core.queue.QueueItem
import com.movid.app.core.yt.DownloadSpec

@Entity(tableName = "downloads")
data class DownloadEntity(
    @PrimaryKey val id: String,
    val url: String,
    val title: String,
    val state: String,
    val progress: Float,
    val attempts: Int,
    val errorCode: String?,
    val outputPath: String?,
    val audioOnly: Boolean,
    val maxHeight: Int?,
    val qualityLabel: String,
    val createdAt: Long,
    val updatedAt: Long,
)

fun QueueItem.toEntity(
    existing: DownloadEntity? = null,
    now: Long = System.currentTimeMillis(),
): DownloadEntity = DownloadEntity(
    id = id,
    url = url,
    title = title.ifBlank { existing?.title.orEmpty() },
    state = state.name,
    progress = progress,
    attempts = attempts,
    errorCode = errorCode,
    outputPath = outputPath ?: existing?.outputPath,
    audioOnly = spec.audioOnly,
    maxHeight = spec.maxHeight,
    qualityLabel = spec.label,
    createdAt = existing?.createdAt ?: now,
    updatedAt = now,
)

fun DownloadEntity.toQueueItem(): QueueItem = QueueItem(
    id = id,
    url = url,
    title = title,
    state = runCatching { DownloadState.valueOf(state) }.getOrDefault(DownloadState.QUEUED),
    progress = progress,
    attempts = attempts,
    errorCode = errorCode,
    outputPath = outputPath,
    spec = DownloadSpec(audioOnly = audioOnly, maxHeight = maxHeight, label = qualityLabel),
)