package com.movid.app.ui

import android.Manifest
import android.content.ClipboardManager
import android.content.ClipData
import android.content.Context
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ContentPaste
import androidx.compose.material.icons.outlined.ContentCopy
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.DeleteOutline
import androidx.compose.material.icons.outlined.Download
import androidx.compose.material.icons.outlined.Menu
import androidx.compose.material.icons.outlined.Pause
import androidx.compose.material.icons.automirrored.outlined.InsertDriveFile
import androidx.compose.material.icons.outlined.PlayArrow
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextDirection
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.movid.app.AppGraph
import com.movid.app.R
import com.movid.app.core.queue.DownloadState
import com.movid.app.core.queue.QueueItem
import com.movid.app.core.yt.DownloadSpec
import com.movid.app.engine.DownloadService
import com.movid.app.engine.FetchEngine
import com.movid.app.i18n.AppLanguage
import com.movid.app.player.PlayerActivity
import com.movid.app.ui.theme.ThemeMode
import java.io.File
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@Composable
fun FetchScreen(
    themeMode: ThemeMode,
    appLanguage: AppLanguage,
    onLanguageChange: (AppLanguage) -> Unit,
    onThemeModeChange: (ThemeMode) -> Unit,
) {
    val context = LocalContext.current
    val repo = AppGraph.repository
    val items by repo.items.collectAsStateWithLifecycle()
    val recentItems = remember(items) { items.asReversed() }
    val scope = rememberCoroutineScope()
    var url by remember { mutableStateOf("") }
    var probing by remember { mutableStateOf(false) }
    var probe by remember { mutableStateOf<FetchEngine.QualityProbe?>(null) }
    var probeFailed by remember { mutableStateOf(false) }
    var probeError by remember { mutableStateOf<com.movid.app.core.yt.YtDlpError?>(null) }
    var probeErrorDetails by remember { mutableStateOf("") }
    var updatingEngine by remember { mutableStateOf(false) }
    var probedUrl by remember { mutableStateOf("") }
    var probeRequestId by remember { mutableStateOf(0) }
    var picking by remember { mutableStateOf(false) }
    var playableUris by remember { mutableStateOf<Map<String, Uri>>(emptyMap()) }
    var notifAsked by remember { mutableStateOf(false) }
    var showSettings by remember { mutableStateOf(false) }
    var showMenu by remember { mutableStateOf(false) }
    var engineVersion by remember { mutableStateOf<String?>(null) }
    var engineUpdateResult by remember { mutableStateOf<Int?>(null) }

    // Notifications are requested at the first add (with context), not during
    // a cold start; on API 26-28 the legacy storage permission is asked at
    // launch so finished downloads can land in the public folders.
    val notifPermission = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) { granted ->
        if (!granted) {
            Toast.makeText(context, R.string.notif_permission_hint, Toast.LENGTH_SHORT).show()
        }
    }
    val storagePermission = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) { }
    LaunchedEffect(Unit) {
        if (Build.VERSION.SDK_INT <= 28) {
            storagePermission.launch(Manifest.permission.WRITE_EXTERNAL_STORAGE)
        }
    }
    LaunchedEffect(showSettings) {
        if (showSettings) {
            engineVersion = withContext(Dispatchers.IO) { AppGraph.fetchEngine.currentVersionName() }
        }
    }

    val askNotifPermission: () -> Unit = {
        if (Build.VERSION.SDK_INT >= 33 && !notifAsked &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) !=
            PackageManager.PERMISSION_GRANTED
        ) {
            notifAsked = true
            notifPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    // Crash recovery can leave restored items QUEUED with no pump pending;
    // kick the service whenever a QUEUED item appears while we are visible.
    val hasQueued = items.any { it.state == DownloadState.QUEUED }
    LaunchedEffect(hasQueued) {
        if (hasQueued) DownloadService.kick(context)
    }

    // Probe only follows an explicit Download/Go/Retry action; pasted/shared
    // text populates the field without sending a network request.
    fun startProbe(raw: String) {
        val clean = extractLink(raw) ?: raw.trim()
        if (clean.isEmpty()) return
        if (probing) return
        val requestId = ++probeRequestId
        probe = null
        probeFailed = false
        probeError = null
        probeErrorDetails = ""
        probing = true
        scope.launch {
            val result = runCatching {
                withContext(Dispatchers.IO) {
                    AppGraph.fetchEngine.probeQualities(clean)
                }
            }
            if (requestId == probeRequestId) {
                result
                    .onSuccess {
                        probe = it
                        probedUrl = clean
                    }
                    .onFailure { error ->
                        probeFailed = true
                        probeErrorDetails = error.message.orEmpty().take(4_000)
                        probeError = com.movid.app.core.yt.YtDlpErrorClassifier
                            .classify(probeErrorDetails)
                            .takeIf { it != com.movid.app.core.yt.YtDlpError.UNKNOWN }
                    }
                probing = false
            }
        }
    }

    fun startPlayback(selected: QueueItem) {
        val playable = items
            .filter { it.state == DownloadState.DONE }
            .mapNotNull { candidate ->
                playableUris[candidate.id]?.let { uri -> candidate.id to uri.toString() }
            }
        if (playable.isEmpty()) return
        val index = playable.indexOfFirst { it.first == selected.id }.coerceAtLeast(0)
        val titles = playable.map { pair ->
            items.firstOrNull { it.id == pair.first }?.title.orEmpty()
        }
        PlayerActivity.start(context, playable.map { it.second }, titles, index)
    }

    // Playable URIs for DONE items resolve off the composition thread: listing
    // the private folder on every recomposition would jank the queue list.
    val doneSignature = items
        .filter { it.state == DownloadState.DONE }
        .joinToString(separator = "|") { "${it.id}:${it.outputPath.orEmpty()}" }
    LaunchedEffect(doneSignature) {
        playableUris = withContext(Dispatchers.IO) {
            items
                .filter { it.state == DownloadState.DONE }
                .mapNotNull { candidate ->
                    downloadedUri(context, candidate)?.let { candidate.id to it }
                }
                .toMap()
        }
    }

    val pasteFromClipboard: () -> Unit = {
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
        val text = clipboard?.primaryClip
            ?.takeIf { it.itemCount > 0 }
            ?.getItemAt(0)
            ?.coerceToText(context)
            ?.toString()
        val link = extractLink(text)
        if (link.isNullOrBlank()) {
            Toast.makeText(context, R.string.fetch_clipboard_empty, Toast.LENGTH_SHORT).show()
        } else {
            probeRequestId += 1
            probing = false
            url = link
            probe = null
            probeFailed = false
            probedUrl = ""
        }
    }

    // Links captured from other apps (share sheet / deep links) arrive here.
    val pendingUrl by FetchRelay.pendingUrl.collectAsStateWithLifecycle()
    LaunchedEffect(pendingUrl) {
        val link = pendingUrl ?: return@LaunchedEffect
        probeRequestId += 1
        probing = false
        url = link
        probe = null
        probeFailed = false
        probedUrl = ""
        FetchRelay.consume()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .windowInsetsPadding(WindowInsets.safeDrawing)
            .imePadding(),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
      Column(
        modifier = Modifier
            .fillMaxSize()
            .widthIn(max = 600.dp)
            .padding(horizontal = 16.dp),
      ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier.fillMaxWidth().height(56.dp),
        ) {
            Text(
                text = stringResource(R.string.app_name),
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
            )
            Box(modifier = Modifier.align(Alignment.CenterStart)) {
                IconButton(onClick = { showMenu = true }) {
                    Icon(Icons.Outlined.Menu, contentDescription = stringResource(R.string.menu_settings))
                }
                DropdownMenu(expanded = showMenu, onDismissRequest = { showMenu = false }) {
                    DropdownMenuItem(
                        text = { Text(stringResource(R.string.menu_settings)) },
                        onClick = { showMenu = false; showSettings = true },
                    )
                }
            }
        }

        if (showSettings) {
            AlertDialog(
                onDismissRequest = { showSettings = false },
                title = { Text(stringResource(R.string.settings_title)) },
                text = {
                    Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                        Text(stringResource(R.string.appearance_title), style = MaterialTheme.typography.titleSmall)
                        SettingsChoice(stringResource(R.string.theme_system), themeMode == ThemeMode.SYSTEM) {
                            onThemeModeChange(ThemeMode.SYSTEM)
                        }
                        SettingsChoice(stringResource(R.string.theme_light), themeMode == ThemeMode.LIGHT) {
                            onThemeModeChange(ThemeMode.LIGHT)
                        }
                        SettingsChoice(stringResource(R.string.theme_dark), themeMode == ThemeMode.DARK) {
                            onThemeModeChange(ThemeMode.DARK)
                        }
                        HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                        Text(stringResource(R.string.language_title), style = MaterialTheme.typography.titleSmall)
                        SettingsChoice(stringResource(R.string.language_system), appLanguage == AppLanguage.SYSTEM) {
                            onLanguageChange(AppLanguage.SYSTEM)
                        }
                        SettingsChoice(stringResource(R.string.language_english), appLanguage == AppLanguage.ENGLISH) {
                            onLanguageChange(AppLanguage.ENGLISH)
                        }
                        SettingsChoice(stringResource(R.string.language_arabic), appLanguage == AppLanguage.ARABIC) {
                            onLanguageChange(AppLanguage.ARABIC)
                        }
                        HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                        Text(
                            stringResource(R.string.fetch_engine_version, engineVersion ?: "—"),
                            style = MaterialTheme.typography.bodySmall,
                        )
                        engineUpdateResult?.let { Text(stringResource(it), style = MaterialTheme.typography.bodySmall) }
                        Button(
                            onClick = {
                                if (!updatingEngine) {
                                    updatingEngine = true
                                    engineUpdateResult = null
                                    scope.launch {
                                        val updated = withContext(Dispatchers.IO) { AppGraph.fetchEngine.updateBinary() }
                                        engineVersion = withContext(Dispatchers.IO) { AppGraph.fetchEngine.currentVersionName() }
                                        engineUpdateResult = if (updated) R.string.fetch_engine_update_done else R.string.fetch_engine_update_failed
                                        updatingEngine = false
                                    }
                                }
                            },
                            enabled = !updatingEngine,
                            modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                        ) {
                            Text(stringResource(if (updatingEngine) R.string.fetch_engine_updating else R.string.fetch_update_engine))
                        }
                    }
                },
                confirmButton = {
                    TextButton(onClick = { showSettings = false }) { Text(stringResource(R.string.action_done)) }
                },
            )
        }

        Text(
            text = stringResource(R.string.fetch_headline),
            style = MaterialTheme.typography.headlineMedium.copy(
                fontWeight = FontWeight.Bold,
            ),
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 24.dp, bottom = 24.dp)
                .semantics { heading() },
        )

        OutlinedTextField(
            value = url,
            onValueChange = {
                probeRequestId += 1
                probing = false
                url = it
                probe = null
                probeFailed = false
                probedUrl = ""
            },
            label = { Text(stringResource(R.string.fetch_url_label)) },
            placeholder = { Text(stringResource(R.string.fetch_url_hint)) },
            singleLine = true,
            textStyle = MaterialTheme.typography.bodyLarge.copy(
                textDirection = TextDirection.Ltr,
            ),
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Go),
            keyboardActions = KeyboardActions(onGo = { startProbe(url) }),
            trailingIcon = {
                IconButton(
                    onClick = pasteFromClipboard,
                    modifier = Modifier
                        .padding(end = 4.dp)
                        .size(48.dp),
                ) {
                    Icon(
                        Icons.Outlined.ContentPaste,
                        contentDescription = stringResource(R.string.fetch_paste),
                        tint = MaterialTheme.colorScheme.primary,
                    )
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 64.dp),
            shape = RoundedCornerShape(20.dp),
        )

        val validUrl = extractLink(url)?.let {
            it.startsWith("https://", ignoreCase = true) || it.startsWith("http://", ignoreCase = true)
        } == true
        Button(
            onClick = { startProbe(url) },
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 4.dp)
                .height(56.dp),
            enabled = validUrl && !probing,
            shape = MaterialTheme.shapes.extraLarge,
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.primary,
            ),
        ) {
            if (probing) {
                CircularProgressIndicator(
                    modifier = Modifier.size(16.dp),
                    strokeWidth = 2.dp,
                    color = LocalContentColor.current,
                )
                Spacer(modifier = Modifier.size(8.dp))
                Text(stringResource(R.string.fetch_probing))
            } else {
                Icon(
                    imageVector = Icons.Outlined.Download,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp),
                )
                Spacer(modifier = Modifier.size(8.dp))
                Text(stringResource(R.string.fetch_add))
            }
        }

        if (probeFailed) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(top = 8.dp),
            ) {
                Text(
                    text = stringResource(probeError?.let(::probeErrorMessage) ?: R.string.fetch_probe_failed),
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier
                        .weight(1f)
                        .semantics { liveRegion = LiveRegionMode.Polite },
                )
                IconButton(
                    onClick = {
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        clipboard.setPrimaryClip(
                            ClipData.newPlainText(context.getString(R.string.fetch_copy_error_details), probeErrorDetails),
                        )
                        Toast.makeText(context, R.string.fetch_copy_error_details, Toast.LENGTH_SHORT).show()
                    },
                    enabled = probeErrorDetails.isNotBlank(),
                    modifier = Modifier.size(48.dp),
                ) {
                    Icon(
                        imageVector = Icons.Outlined.ContentCopy,
                        contentDescription = stringResource(R.string.fetch_copy_error_details),
                    )
                }
                TextButton(
                    onClick = { startProbe(url) },
                    enabled = !probing,
                ) {
                    Text(stringResource(R.string.action_retry))
                }
                if (probeError == com.movid.app.core.yt.YtDlpError.ENGINE_OUTDATED) {
                    TextButton(
                        enabled = !updatingEngine,
                        onClick = {
                            updatingEngine = true
                            scope.launch {
                                val updated = withContext(Dispatchers.IO) { AppGraph.fetchEngine.updateBinary() }
                                updatingEngine = false
                                Toast.makeText(
                                    context,
                                    if (updated) R.string.fetch_engine_update_done else R.string.fetch_engine_update_failed,
                                    Toast.LENGTH_LONG,
                                ).show()
                            }
                        },
                    ) { Text(stringResource(R.string.fetch_update_engine)) }
                }
            }
        }

        if (recentItems.isNotEmpty()) {
            Spacer(modifier = Modifier.height(24.dp))
            Text(
                text = stringResource(R.string.fetch_recent_title),
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 8.dp),
            )
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(bottom = 4.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                items(recentItems.take(2), key = { it.id }) { item ->
                RecentQueueRow(
                    item = item,
                    playable = playableUris.containsKey(item.id),
                    onPlay = { startPlayback(item) },
                    onPause = {
                        scope.launch {
                            // Pause is a real stop: flip state first (so a late
                            // worker event is ignored), then kill the process.
                            // stopWork is a safe no-op when no worker is
                            // running, so the decision can never go stale.
                            repo.pause(item.id)
                            DownloadService.stopWork(context, item.id)
                        }
                    },
                    onResume = {
                        scope.launch {
                            repo.resume(item.id)
                            DownloadService.kick(context)
                        }
                    },
                    onRetry = {
                        scope.launch {
                            repo.retry(item.id)
                            DownloadService.kick(context)
                        }
                    },
                    onCancel = { DownloadService.cancel(context, item.id) },
                    onRemove = {
                        scope.launch {
                            repo.remove(item.id)
                            DownloadService.stopWork(context, item.id)
                        }
                    },
                )
                }
            }
        } else {
            Spacer(modifier = Modifier.weight(1f))
        }
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 2.dp, bottom = 4.dp),
        ) {
            Text(
                text = stringResource(R.string.designer_credit),
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 2.dp),
            )
        }
      }
    }

    // Quality picker: probe first, then enqueue with the chosen [DownloadSpec].
    probe?.let { result ->
        QualityDialog(
            probe = result,
            onDismiss = { probe = null },
            onPick = { spec ->
                val clean = probedUrl.ifBlank { url.trim() }
                if (!picking && clean.isNotEmpty()) {
                    picking = true
                    probe = null
                    probeFailed = false
                    url = ""
                    scope.launch {
                        try {
                            repo.add(clean, spec, result.title)
                            DownloadService.kick(context)
                            askNotifPermission()
                        } finally {
                            picking = false
                        }
                    }
                }
            },
        )
    }

}

private fun probeErrorMessage(error: com.movid.app.core.yt.YtDlpError): Int = when (error) {
    com.movid.app.core.yt.YtDlpError.NEED_COOKIES -> R.string.notif_err_need_cookies
    com.movid.app.core.yt.YtDlpError.VIDEO_UNAVAILABLE -> R.string.notif_err_unavailable
    com.movid.app.core.yt.YtDlpError.GEO_RESTRICTED -> R.string.notif_err_geo
    com.movid.app.core.yt.YtDlpError.ACCESS_DENIED -> R.string.notif_err_access
    com.movid.app.core.yt.YtDlpError.NETWORK -> R.string.notif_err_network
    com.movid.app.core.yt.YtDlpError.DISK_FULL -> R.string.notif_err_disk
    com.movid.app.core.yt.YtDlpError.UNSUPPORTED_SITE -> R.string.notif_err_unsupported
    com.movid.app.core.yt.YtDlpError.ENGINE_OUTDATED -> R.string.notif_err_engine_outdated
    com.movid.app.core.yt.YtDlpError.TEMPORARY_SITE_ERROR -> R.string.notif_err_extractor
    com.movid.app.core.yt.YtDlpError.EXTRACTOR_OUTDATED -> R.string.notif_err_extractor
    com.movid.app.core.yt.YtDlpError.UNKNOWN -> R.string.notif_err_unknown
}

@Composable
private fun SettingsChoice(label: String, selected: Boolean, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 48.dp)
            .selectable(selected = selected, role = Role.RadioButton, onClick = onClick),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        RadioButton(selected = selected, onClick = null)
        Text(label, style = MaterialTheme.typography.bodyMedium)
    }
}

@Composable
private fun QualityDialog(
    probe: FetchEngine.QualityProbe,
    onDismiss: () -> Unit,
    onPick: (DownloadSpec) -> Unit,
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(stringResource(R.string.fetch_quality_title)) },
        text = {
            Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                Text(
                    text = probe.title,
                    style = MaterialTheme.typography.titleSmall,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.padding(bottom = 8.dp),
                )
                QualityOption(
                    text = stringResource(R.string.fetch_quality_best),
                    onClick = { onPick(DownloadSpec()) },
                )
                for (height in probe.videoHeights) {
                    QualityOption(
                        text = stringResource(R.string.fetch_quality_p, height.toString()),
                        onClick = {
                            onPick(DownloadSpec(maxHeight = height, label = "${height}p"))
                        },
                    )
                }
                if (probe.hasAudioOnly) {
                    QualityOption(
                        text = stringResource(R.string.fetch_quality_audio),
                        onClick = { onPick(DownloadSpec(audioOnly = true, label = "MP3")) },
                    )
                }
            }
        },
        confirmButton = {},
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text(stringResource(R.string.action_cancel))
            }
        },
    )
}

@Composable
private fun QualityOption(text: String, onClick: () -> Unit) {
    TextButton(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
    ) {
        Text(text)
    }
}

@Composable
private fun QueueRow(
    item: QueueItem,
    playable: Boolean,
    onPlay: () -> Unit,
    onPause: () -> Unit,
    onResume: () -> Unit,
    onRetry: () -> Unit,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(start = 14.dp, end = 6.dp, top = 10.dp, bottom = 10.dp),
        ) {
            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 12.dp),
            ) {
                Text(
                    text = item.title.ifBlank { item.url },
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    style = MaterialTheme.typography.bodyLarge,
                )
                val status = stateLabel(item.state)
                val quality = qualitySuffix(item.spec.label)
                Text(
                    text = if (quality.isBlank()) status else "$status · $quality",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier
                        .padding(top = 2.dp)
                        .semantics { liveRegion = LiveRegionMode.Polite },
                )
                if (item.state == DownloadState.RUNNING) {
                    Text(
                        text = stringResource(
                            R.string.download_progress_percent,
                            (item.progress * 100).toInt(),
                        ),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(top = 6.dp),
                    )
                    LinearProgressIndicator(
                        progress = { item.progress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 4.dp),
                    )
                }
            }
            Column(horizontalAlignment = Alignment.End) {
                when (item.state) {
                    DownloadState.QUEUED, DownloadState.RUNNING ->
                        IconButton(onClick = onPause) {
                            Icon(
                                Icons.Outlined.Pause,
                                contentDescription = stringResource(R.string.player_pause),
                            )
                        }

                    DownloadState.PAUSED ->
                        IconButton(onClick = onResume) {
                            Icon(
                                Icons.Outlined.PlayArrow,
                                contentDescription = stringResource(R.string.player_play),
                            )
                        }

                    DownloadState.FAILED, DownloadState.NEED_COOKIES, DownloadState.CANCELLED ->
                        IconButton(onClick = onRetry) {
                            Icon(
                                Icons.Outlined.Refresh,
                                contentDescription = stringResource(R.string.action_retry),
                            )
                        }

                    DownloadState.DONE -> {
                        if (playable) {
                            IconButton(onClick = onPlay) {
                                Icon(
                                    Icons.Outlined.PlayArrow,
                                    contentDescription = stringResource(R.string.player_play),
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

/** Compact Home-only presentation; full queue controls remain in QueueRow elsewhere. */
@Composable
private fun RecentQueueRow(
    item: QueueItem,
    playable: Boolean,
    onPlay: () -> Unit,
    onPause: () -> Unit,
    onResume: () -> Unit,
    onRetry: () -> Unit,
    onCancel: () -> Unit,
    onRemove: () -> Unit,
) {
    val running = item.state == DownloadState.RUNNING
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 84.dp)
                .padding(12.dp),
        ) {
            Box(
                modifier = Modifier
                    .size(60.dp)
                    .background(
                        color = MaterialTheme.colorScheme.primaryContainer,
                        shape = RoundedCornerShape(14.dp),
                    ),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Outlined.InsertDriveFile,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(24.dp),
                )
            }
            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(start = 12.dp, end = 4.dp),
            ) {
                Text(
                    text = item.title.ifBlank { item.url },
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    style = MaterialTheme.typography.bodyLarge,
                )
                if (running) {
                    LinearProgressIndicator(
                        progress = { item.progress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 9.dp),
                    )
                    Text(
                        text = stringResource(
                            R.string.download_progress_percent,
                            (item.progress * 100).toInt(),
                        ),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier
                            .padding(top = 4.dp)
                            .semantics { liveRegion = LiveRegionMode.Polite },
                    )
                } else {
                    val status = stateLabel(item.state)
                    val quality = qualitySuffix(item.spec.label)
                    Text(
                        text = if (quality.isBlank()) status else "$status · $quality",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier
                            .padding(top = 4.dp)
                            .semantics { liveRegion = LiveRegionMode.Polite },
                    )
                }
            }
            val action = when {
                running -> onPause
                item.state == DownloadState.QUEUED -> onCancel
                item.state == DownloadState.PAUSED -> onResume
                item.state == DownloadState.FAILED || item.state == DownloadState.NEED_COOKIES ||
                    item.state == DownloadState.CANCELLED -> onRetry
                item.state == DownloadState.DONE && playable -> onPlay
                item.state == DownloadState.DONE -> null
                else -> null
            }
            if (action != null) {
                IconButton(onClick = action, modifier = Modifier.size(48.dp)) {
                    val (icon, description) = when {
                        running ->
                            Icons.Outlined.Pause to R.string.player_pause
                        item.state == DownloadState.QUEUED ->
                            Icons.Outlined.Close to R.string.action_cancel
                        item.state == DownloadState.PAUSED ->
                            Icons.Outlined.PlayArrow to R.string.player_play
                        item.state == DownloadState.FAILED || item.state == DownloadState.NEED_COOKIES ||
                            item.state == DownloadState.CANCELLED ->
                            Icons.Outlined.Refresh to R.string.action_retry
                        else -> Icons.Outlined.PlayArrow to R.string.player_play
                    }
                    Icon(icon, contentDescription = stringResource(description))
                }
            }
            if (item.state in setOf(
                    DownloadState.PAUSED,
                    DownloadState.DONE,
                    DownloadState.FAILED,
                    DownloadState.NEED_COOKIES,
                    DownloadState.CANCELLED,
                )
            ) {
                IconButton(onClick = onRemove, modifier = Modifier.size(48.dp)) {
                    Icon(
                        Icons.Outlined.DeleteOutline,
                        contentDescription = stringResource(R.string.action_delete),
                    )
                }
            }
        }
    }
}

/** Localizes the persisted quality label ("Best" / "MP3" / "720p"). */
@Composable
private fun qualitySuffix(label: String): String = when (label) {
    "Best" -> stringResource(R.string.fetch_quality_best)
    "MP3" -> stringResource(R.string.fetch_quality_audio)
    else -> label
}

@Composable
private fun stateLabel(state: DownloadState): String = stringResource(
    when (state) {
        DownloadState.QUEUED -> R.string.fetch_state_queued
        DownloadState.RUNNING -> R.string.fetch_state_running
        DownloadState.PAUSED -> R.string.fetch_state_paused
        DownloadState.DONE -> R.string.fetch_state_done
        DownloadState.FAILED -> R.string.fetch_state_failed
        DownloadState.NEED_COOKIES -> R.string.fetch_state_need_cookies
        DownloadState.CANCELLED -> R.string.fetch_state_cancelled
    },
)

/**
 * Resolves a finished download to something playable: the published
 * content:// URI when available, otherwise the private working copy.
 */
private fun downloadedUri(context: Context, item: QueueItem): Uri? {
    item.outputPath?.takeIf { path ->
        path.isNotBlank() && Uri.parse(path).let { uri ->
            if (uri.scheme == "file") {
                uri.path?.let(::File)?.let(::isPlayableMediaFile) == true
            } else {
                uri.scheme == "content"
            }
        }
    }?.let { return Uri.parse(it) }
    val outputBase = context.getExternalFilesDir(Environment.DIRECTORY_MOVIES)
    val dirs = listOfNotNull(
        outputBase?.let { File(it, "Movid") },
        outputBase?.let { File(it, "VidNest") },
    )
    val file = dirs.asSequence().flatMap { dir ->
        dir.listFiles()?.asSequence().orEmpty()
    }.filter { candidate ->
        candidate.isFile && candidate.name.startsWith("${item.id}.") &&
            isPlayableMediaFile(candidate)
    }.maxByOrNull { it.length() }
    return file?.let { Uri.fromFile(it) }
}

private fun isPlayableMediaFile(file: File): Boolean =
    file.isFile && file.length() > 0L && file.extension.lowercase() in PLAYABLE_MEDIA_EXTENSIONS

private val PLAYABLE_MEDIA_EXTENSIONS = setOf(
    "mp4", "mkv", "webm", "mov", "3gp", "m4v",
    "mp3", "m4a", "opus", "ogg", "flac", "wav", "aac",
)
