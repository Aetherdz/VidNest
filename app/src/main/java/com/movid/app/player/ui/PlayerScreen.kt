package com.movid.app.player.ui

import android.content.ComponentName
import android.content.pm.PackageManager
import android.media.AudioManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.outlined.Pause
import androidx.compose.material.icons.outlined.PictureInPictureAlt
import androidx.compose.material.icons.outlined.PlayArrow
import androidx.compose.material.icons.outlined.Subtitles
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.session.MediaController
import androidx.media3.session.SessionToken
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import com.movid.app.R
import com.movid.app.i18n.findActivity
import com.movid.app.player.PlaybackService
import com.movid.app.player.PlayerPrefs
import java.util.Locale
import kotlin.math.abs
import kotlin.math.roundToInt
import kotlinx.coroutines.delay
import kotlinx.coroutines.withTimeoutOrNull

/**
 * Full-screen player UI over a [PlayerView] fed by a [MediaController] bound
 * to [PlaybackService]. Controls auto-hide; gestures: tap toggles the chrome,
 * double-tap seeks ±10 s, horizontal drag scrubs, vertical drag adjusts
 * brightness (left half) or media volume (right half), long-press holds 2x.
 */
@Composable
fun PlayerScreen(
    uris: List<String>,
    titles: List<String>,
    startIndex: Int,
    inPip: Boolean,
    onPlayingChanged: (Boolean) -> Unit,
    onBack: () -> Unit,
    onEnterPip: () -> Unit,
) {
    val context = LocalContext.current

    var controller by remember { mutableStateOf<MediaController?>(null) }
    var loadFailed by remember { mutableStateOf(false) }

    var position by remember { mutableStateOf(0L) }
    var duration by remember { mutableStateOf(0L) }
    var isPlaying by remember { mutableStateOf(false) }
    var isBuffering by remember { mutableStateOf(false) }
    var speed by remember { mutableStateOf(1f) }
    var currentIndex by remember { mutableStateOf(startIndex) }
    var seeking by remember { mutableStateOf(false) }
    var showControls by remember { mutableStateOf(true) }
    var lastInteraction by remember { mutableStateOf(System.currentTimeMillis()) }
    var speedBoost by remember { mutableStateOf(false) }
    var seekPreview by remember { mutableStateOf<Long?>(null) }
    var flash by remember { mutableStateOf<String?>(null) }
    var resumeApplied by remember { mutableStateOf(false) }

    val seekForwardLabel = stringResource(R.string.player_seek_forward)
    val seekBackLabel = stringResource(R.string.player_seek_back)
    val rtl = LocalLayoutDirection.current == LayoutDirection.Rtl
    val supportsPip = remember {
        context.packageManager.hasSystemFeature(PackageManager.FEATURE_PICTURE_IN_PICTURE)
    }

    val noteInteraction: () -> Unit = {
        lastInteraction = System.currentTimeMillis()
        showControls = true
    }

    val subtitlePicker = rememberLauncherForActivityResult(
        ActivityResultContracts.OpenDocument(),
    ) { picked ->
        val c = controller
        if (picked != null && c != null) {
            runCatching {
                context.contentResolver.takePersistableUriPermission(
                    picked,
                    android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION,
                )
            }
            val name = picked.lastPathSegment.orEmpty().lowercase()
            val mime = when {
                name.endsWith(".vtt") -> "text/vtt"
                name.endsWith(".ssa") || name.endsWith(".ass") -> "text/x-ssa"
                else -> "application/x-subrip"
            }
            val subtitle = MediaItem.SubtitleConfiguration.Builder(picked)
                .setMimeType(mime)
                .setSelectionFlags(C.SELECTION_FLAG_DEFAULT)
                .build()
            val item = c.currentMediaItem
            val index = c.currentMediaItemIndex
            if (item != null) {
                val atPosition = c.currentPosition
                c.replaceMediaItem(
                    index,
                    item.buildUpon().setSubtitleConfigurations(listOf(subtitle)).build(),
                )
                c.seekTo(index, atPosition)
            }
        }
    }

    // Connect to the playback service (single ExoPlayer instance lives there).
    DisposableEffect(Unit) {
        val token = SessionToken(context, ComponentName(context, PlaybackService::class.java))
        val future = MediaController.Builder(context, token).buildAsync()
        future.addListener(
            {
                controller = runCatching { future.get() }.getOrNull()
                if (controller == null) loadFailed = true
            },
            ContextCompat.getMainExecutor(context),
        )
        onDispose { MediaController.releaseFuture(future) }
    }

    // Hand the playlist to the player once the controller is ready.
    LaunchedEffect(controller) {
        val c = controller ?: return@LaunchedEffect
        if (uris.isNotEmpty()) {
            val items = uris.mapIndexed { index, uri ->
                MediaItem.Builder()
                    .setUri(uri)
                    .setMediaId(uri)
                    .setMediaMetadata(
                        MediaMetadata.Builder()
                            .setTitle(titles.getOrNull(index).orEmpty().ifBlank { context.getString(R.string.app_name) })
                            .build(),
                    )
                    .build()
            }
            val safeIndex = startIndex.coerceIn(0, (items.size - 1).coerceAtLeast(0))
            c.setMediaItems(items, safeIndex, 0L)
            c.prepare()
            c.playWhenReady = true
        } else if (c.mediaItemCount == 0) {
            onBack()
        }
    }

    // Player events: errors, resume position, playlist transitions.
    DisposableEffect(controller) {
        val c = controller ?: return@DisposableEffect onDispose { }
        val listener = object : Player.Listener {
            override fun onPlayerError(error: PlaybackException) {
                loadFailed = true
            }

            override fun onPlaybackStateChanged(playbackState: Int) {
                if (playbackState == Player.STATE_READY && uris.isNotEmpty() && !resumeApplied) {
                    resumeApplied = true
                    val item = c.currentMediaItem ?: return
                    val saved = PlayerPrefs.load(context, item.mediaId)
                    val total = c.duration
                    if (saved > 3_000L && total > 0L && saved < total - 3_000L) {
                        c.seekTo(saved)
                    }
                }
            }

            override fun onMediaItemTransition(mediaItem: MediaItem?, reason: Int) {
                loadFailed = false
                if (reason == Player.MEDIA_ITEM_TRANSITION_REASON_AUTO && mediaItem != null) {
                    val saved = PlayerPrefs.load(context, mediaItem.mediaId)
                    val total = c.duration
                    if (saved > 3_000L && total > 0L && saved < total - 3_000L) {
                        c.seekTo(saved)
                    }
                }
            }
        }
        c.addListener(listener)
        onDispose {
            c.removeListener(listener)
            runCatching {
                val item = c.currentMediaItem
                if (item != null && c.currentPosition > 0L) {
                    PlayerPrefs.save(context, item.mediaId, c.currentPosition)
                }
            }
        }
    }

    // Lightweight state poll for the overlay UI (250-500 ms is plenty).
    LaunchedEffect(controller) {
        val c = controller ?: return@LaunchedEffect
        var lastSaved = 0L
        while (true) {
            if (!seeking) position = c.currentPosition.coerceAtLeast(0L)
            if (c.duration > 0L) duration = c.duration
            val playing = c.isPlaying
            if (playing != isPlaying) {
                isPlaying = playing
                onPlayingChanged(playing)
            }
            isBuffering = c.playbackState == Player.STATE_BUFFERING
            speed = c.playbackParameters.speed
            currentIndex = c.currentMediaItemIndex.coerceAtLeast(0)
            val item = c.currentMediaItem
            if (item != null && playing && abs(position - lastSaved) > 5_000L) {
                lastSaved = position
                PlayerPrefs.save(context, item.mediaId, position)
            }
            delay(500L)
        }
    }

    // Auto-hide the controls shortly after the last interaction.
    LaunchedEffect(showControls, lastInteraction, isPlaying, seeking) {
        if (showControls && isPlaying && !seeking) {
            delay(3_500L)
            showControls = false
        }
    }

    // Clear the seek / double-tap flash after a moment.
    LaunchedEffect(flash) {
        if (flash != null) {
            delay(900L)
            flash = null
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black),
    ) {
        val c = controller
        if (c != null) {
            AndroidView(
                factory = { ctx ->
                    PlayerView(ctx).apply {
                        useController = false
                        resizeMode = AspectRatioFrameLayout.RESIZE_MODE_FIT
                        setShowBuffering(PlayerView.SHOW_BUFFERING_WHEN_PLAYING)
                        setShutterBackgroundColor(android.graphics.Color.BLACK)
                    }
                },
                update = { view -> view.player = c },
                modifier = Modifier.fillMaxSize(),
            )
        }

        if (c != null && !inPip) {
            // Gesture surface (tap / double-tap / drag / long-press).
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .pointerInput(c) {
                        awaitEachGesture {
                            val down = awaitFirstDown(requireUnconsumed = false)
                            val slop = viewConfiguration.touchSlop
                            var wentUp = false
                            var startedDrag = false
                            val timedOut = withTimeoutOrNull(400L) {
                                while (true) {
                                    val event = awaitPointerEvent()
                                    val change = event.changes
                                        .firstOrNull { it.id == down.id }
                                        ?: return@withTimeoutOrNull Unit
                                    if (!change.pressed) {
                                        wentUp = true
                                        return@withTimeoutOrNull Unit
                                    }
                                    if ((change.position - down.position).getDistance() > slop) {
                                        startedDrag = true
                                        return@withTimeoutOrNull Unit
                                    }
                                }
                                @Suppress("UNREACHABLE_CODE")
                                Unit
                            } == null

                            if (timedOut && !wentUp && !startedDrag) {
                                // Long press: hold at 2x until released. The
                                // finally block restores the speed even when
                                // the gesture coroutine is cancelled.
                                val previous = c.playbackParameters.speed
                                c.setPlaybackSpeed(2f)
                                speedBoost = true
                                noteInteraction()
                                try {
                                    while (true) {
                                        val event = awaitPointerEvent()
                                        val change = event.changes
                                            .firstOrNull { it.id == down.id } ?: break
                                        if (!change.pressed) break
                                    }
                                } finally {
                                    c.setPlaybackSpeed(previous)
                                    speedBoost = false
                                }
                            } else if (wentUp) {
                                // Tap: single toggles the chrome, double seeks ±10 s.
                                val second = withTimeoutOrNull(280L) {
                                    awaitFirstDown(requireUnconsumed = false)
                                }
                                if (second != null) {
                                    val forward = second.position.x >= size.width / 2f
                                    val delta = if (forward) 10_000L else -10_000L
                                    val target = if (duration > 0L) {
                                        (c.currentPosition + delta).coerceIn(0L, duration)
                                    } else {
                                        (c.currentPosition + delta).coerceAtLeast(0L)
                                    }
                                    c.seekTo(target)
                                    flash = if (forward) seekForwardLabel else seekBackLabel
                                    noteInteraction()
                                    while (true) {
                                        val event = awaitPointerEvent()
                                        if (event.changes.none { it.pressed }) break
                                    }
                                } else {
                                    showControls = !showControls
                                    lastInteraction = System.currentTimeMillis()
                                }
                            } else {
                                // Drag: horizontal = scrub, vertical = brightness/volume.
                                var axisLocked = false
                                var horizontal = false
                                var previousY = down.position.y
                                val startPosition = c.currentPosition
                                val spanMs = duration.coerceIn(30_000L, 180_000L)
                                var previewTarget = startPosition
                                val audio = context.getSystemService(AudioManager::class.java)
                                var volumeAccumulator = 0f
                                val hostActivity = context.findActivity()
                                while (true) {
                                    val event = awaitPointerEvent()
                                    val change =
                                        event.changes.firstOrNull { it.id == down.id } ?: break
                                    if (!change.pressed) break
                                    val dx = change.position.x - down.position.x
                                    val dy = change.position.y - down.position.y
                                    if (!axisLocked && (abs(dx) > slop || abs(dy) > slop)) {
                                        horizontal = abs(dx) > abs(dy)
                                        axisLocked = true
                                    }
                                    if (axisLocked) {
                                        change.consume()
                                        if (horizontal) {
                                            val widthPx = size.width.coerceAtLeast(1)
                                            // In RTL the Material slider runs
                                            // right-to-left; mirror the scrub
                                            // direction so both agree.
                                            val scrubDx = if (rtl) -dx else dx
                                            val scrubbed = (
                                                startPosition +
                                                    ((scrubDx / widthPx) * spanMs.toFloat()).toLong()
                                                )
                                            previewTarget = if (duration > 0L) {
                                                scrubbed.coerceIn(0L, duration)
                                            } else {
                                                scrubbed.coerceAtLeast(0L)
                                            }
                                            seekPreview = previewTarget
                                        } else {
                                            val heightPx = size.height.coerceAtLeast(1)
                                            val deltaFraction =
                                                -(change.position.y - previousY) / heightPx
                                            if (down.position.x < size.width / 2f) {
                                                if (hostActivity != null) {
                                                    val attrs = hostActivity.window.attributes
                                                    val current = if (attrs.screenBrightness < 0f) {
                                                        0.5f
                                                    } else {
                                                        attrs.screenBrightness
                                                    }
                                                    attrs.screenBrightness =
                                                        (current + deltaFraction * 1.5f)
                                                            .coerceIn(0.01f, 1f)
                                                    hostActivity.window.attributes = attrs
                                                }
                                            } else if (audio != null) {
                                                val maxVolume = audio
                                                    .getStreamMaxVolume(AudioManager.STREAM_MUSIC)
                                                    .coerceAtLeast(1)
                                                volumeAccumulator += deltaFraction * maxVolume * 1.5f
                                                val steps = volumeAccumulator.roundToInt()
                                                if (steps != 0) {
                                                    volumeAccumulator -= steps
                                                    val target = (
                                                        audio.getStreamVolume(AudioManager.STREAM_MUSIC) +
                                                            steps
                                                        ).coerceIn(0, maxVolume)
                                                    audio.setStreamVolume(
                                                        AudioManager.STREAM_MUSIC,
                                                        target,
                                                        0,
                                                    )
                                                }
                                            }
                                        }
                                    }
                                    previousY = change.position.y
                                }
                                if (axisLocked && horizontal) {
                                    c.seekTo(previewTarget)
                                    flash = formatTime(previewTarget)
                                    noteInteraction()
                                }
                                seekPreview = null
                            }
                        }
                    },
            )

            if (showControls) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .fillMaxWidth()
                        .background(Color.Black.copy(alpha = 0.55f))
                        .statusBarsPadding()
                        .padding(horizontal = 4.dp, vertical = 4.dp),
                ) {
                    IconButton(onClick = onBack) {
                        Icon(
                            Icons.AutoMirrored.Outlined.ArrowBack,
                            contentDescription = stringResource(R.string.player_back),
                            tint = Color.White,
                        )
                    }
                    Text(
                        text = titles.getOrNull(currentIndex).orEmpty()
                            .ifBlank { c.currentMediaItem?.mediaMetadata?.title?.toString().orEmpty() }
                            .ifBlank { stringResource(R.string.app_name) },
                        color = Color.White,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier
                            .weight(1f)
                            .padding(horizontal = 4.dp),
                    )
                    if (supportsPip) {
                        IconButton(onClick = onEnterPip) {
                            Icon(
                                Icons.Outlined.PictureInPictureAlt,
                                contentDescription = stringResource(R.string.player_pip),
                                tint = Color.White,
                            )
                        }
                    }
                    IconButton(onClick = { subtitlePicker.launch(arrayOf("*/*")) }) {
                        Icon(
                            Icons.Outlined.Subtitles,
                            contentDescription = stringResource(R.string.player_subtitles),
                            tint = Color.White,
                        )
                    }
                }

                Box(
                    modifier = Modifier.align(Alignment.Center),
                    contentAlignment = Alignment.Center,
                ) {
                    if (isBuffering) {
                        CircularProgressIndicator(
                            color = Color.White,
                            strokeWidth = 3.dp,
                            modifier = Modifier.size(56.dp),
                        )
                    } else {
                        IconButton(
                            onClick = {
                                if (isPlaying) c.pause() else c.play()
                                noteInteraction()
                            },
                            modifier = Modifier
                                .size(88.dp)
                                .background(Color.Black.copy(alpha = 0.45f), CircleShape),
                        ) {
                            Icon(
                                if (isPlaying) Icons.Outlined.Pause else Icons.Outlined.PlayArrow,
                                contentDescription = stringResource(
                                    if (isPlaying) R.string.player_pause else R.string.player_play,
                                ),
                                tint = Color.White,
                                modifier = Modifier.size(48.dp),
                            )
                        }
                    }
                }

                Column(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth()
                        .background(Color.Black.copy(alpha = 0.55f))
                        .navigationBarsPadding()
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = formatTime(position),
                            color = Color.White,
                            style = MaterialTheme.typography.labelMedium,
                        )
                        Slider(
                            value = position.coerceIn(0L, duration.coerceAtLeast(1L)).toFloat(),
                            enabled = duration > 0L,
                            onValueChange = { value ->
                                seeking = true
                                position = value.toLong()
                            },
                            onValueChangeFinished = {
                                c.seekTo(position)
                                seeking = false
                                noteInteraction()
                            },
                            valueRange = 0f..duration.coerceAtLeast(1L).toFloat(),
                            colors = SliderDefaults.colors(
                                thumbColor = Color.White,
                                activeTrackColor = Color.White,
                                inactiveTrackColor = Color.White.copy(alpha = 0.35f),
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .padding(horizontal = 12.dp),
                        )
                        Text(
                            text = formatTime(duration),
                            color = Color.White,
                            style = MaterialTheme.typography.labelMedium,
                        )
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        TextButton(
                            onClick = {
                                c.setPlaybackSpeed(nextSpeed(speed))
                                noteInteraction()
                            },
                        ) {
                            Text(
                                stringResource(R.string.player_speed_value, speedLabel(speed)),
                                color = Color.White,
                            )
                        }
                        if (speedBoost) {
                            Text(
                                text = stringResource(R.string.player_speed_value, speedLabel(2f)),
                                color = Color.White,
                                style = MaterialTheme.typography.labelLarge,
                            )
                        }
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }

            seekPreview?.let { preview ->
                Box(modifier = Modifier.align(Alignment.Center)) {
                    Text(
                        text = formatTime(preview),
                        color = Color.White,
                        style = MaterialTheme.typography.headlineSmall,
                        modifier = Modifier
                            .background(Color.Black.copy(alpha = 0.65f), CircleShape)
                            .padding(horizontal = 20.dp, vertical = 10.dp),
                    )
                }
            }

            flash?.let { label ->
                Box(
                    modifier = Modifier
                        .align(Alignment.Center)
                        .offset(y = (-56).dp),
                ) {
                    Text(
                        text = label,
                        color = Color.White,
                        style = MaterialTheme.typography.titleLarge,
                        modifier = Modifier
                            .background(Color.Black.copy(alpha = 0.65f), CircleShape)
                            .padding(horizontal = 16.dp, vertical = 8.dp),
                    )
                }
            }
        }

        if (c == null && !loadFailed) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center,
            ) {
                CircularProgressIndicator(color = Color.White)
            }
        }

        if (loadFailed) {
            ErrorOverlay(
                onRetry = {
                    loadFailed = false
                    controller?.prepare()
                },
                onBack = onBack,
            )
        }
    }
}

@Composable
private fun ErrorOverlay(onRetry: () -> Unit, onBack: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(
            text = stringResource(R.string.player_error),
            color = Color.White,
            style = MaterialTheme.typography.bodyLarge,
        )
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = onRetry) {
            Text(stringResource(R.string.action_retry))
        }
        Spacer(modifier = Modifier.height(4.dp))
        TextButton(onClick = onBack) {
            Text(stringResource(R.string.player_back), color = Color.White)
        }
    }
}

private val SPEED_STEPS = listOf(1f, 1.25f, 1.5f, 2f, 0.5f)

private fun nextSpeed(current: Float): Float {
    val index = SPEED_STEPS.indexOfFirst { abs(it - current) < 0.01f }
    return SPEED_STEPS[(index + 1 + SPEED_STEPS.size) % SPEED_STEPS.size]
}

private fun speedLabel(speed: Float): String =
    if (speed % 1f == 0f) speed.toInt().toString() else speed.toString()

private fun formatTime(ms: Long): String {
    if (ms <= 0L) return "00:00"
    val totalSeconds = ms / 1000L
    val hours = totalSeconds / 3600L
    val minutes = (totalSeconds % 3600L) / 60L
    val seconds = totalSeconds % 60L
    return if (hours > 0L) {
        String.format(Locale.US, "%d:%02d:%02d", hours, minutes, seconds)
    } else {
        String.format(Locale.US, "%02d:%02d", minutes, seconds)
    }
}
