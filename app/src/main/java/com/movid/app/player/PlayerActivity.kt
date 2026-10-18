package com.movid.app.player

import android.app.PictureInPictureParams
import android.content.Context
import android.content.Intent
import android.content.res.Configuration
import android.os.Build
import android.os.Bundle
import android.util.Rational
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.mutableStateOf
import com.movid.app.i18n.LanguageStore
import com.movid.app.i18n.withAppLanguage
import com.movid.app.player.ui.PlayerScreen
import com.movid.app.ui.theme.MovidTheme

/**
 * Full-screen player host. Playback itself lives in [PlaybackService]; this
 * activity renders the Compose overlay and supports picture-in-picture.
 */
class PlayerActivity : ComponentActivity() {

    companion object {
        private const val EXTRA_URIS = "movid.player.uris"
        private const val EXTRA_TITLES = "movid.player.titles"
        private const val EXTRA_INDEX = "movid.player.index"

        fun start(context: Context, uris: List<String>, titles: List<String>, index: Int) {
            context.startActivity(
                Intent(context, PlayerActivity::class.java)
                    .putStringArrayListExtra(EXTRA_URIS, ArrayList(uris))
                    .putStringArrayListExtra(EXTRA_TITLES, ArrayList(titles))
                    .putExtra(EXTRA_INDEX, index.coerceAtLeast(0))
                    .addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            )
        }
    }

    private val isPlaying = mutableStateOf(false)
    private val inPip = mutableStateOf(false)

    override fun attachBaseContext(newBase: Context) {
        super.attachBaseContext(newBase.withAppLanguage(LanguageStore.load(newBase)))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.dark(android.graphics.Color.TRANSPARENT),
            navigationBarStyle = SystemBarStyle.dark(android.graphics.Color.TRANSPARENT),
        )
        super.onCreate(savedInstanceState)
        val uriList = intent.getStringArrayListExtra(EXTRA_URIS).orEmpty()
        val titleList = intent.getStringArrayListExtra(EXTRA_TITLES).orEmpty()
        val index = intent.getIntExtra(EXTRA_INDEX, 0)
        setContent {
            // Player chrome is always dark-on-video (AGENTS.md); pinning the
            // dark scheme keeps Material-derived colors (disabled scrubber,
            // error overlay buttons) readable on the black window in every
            // appearance mode.
            MovidTheme(darkTheme = true) {
                PlayerScreen(
                    uris = uriList,
                    titles = titleList,
                    startIndex = index,
                    inPip = inPip.value,
                    onPlayingChanged = { playing -> isPlaying.value = playing },
                    onBack = { finish() },
                    onEnterPip = { enterPip() },
                )
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        // Single-top relaunch (e.g. notification tap): adopt the new playlist.
        val uris = intent.getStringArrayListExtra(EXTRA_URIS).orEmpty()
        if (uris.isNotEmpty()) {
            setIntent(intent)
            recreate()
        }
    }

    override fun onUserLeaveHint() {
        super.onUserLeaveHint()
        if (!isInPictureInPictureMode && isPlaying.value) {
            enterPip()
        }
    }

    override fun onPictureInPictureModeChanged(
        isInPictureInPictureMode: Boolean,
        newConfig: Configuration,
    ) {
        super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig)
        inPip.value = isInPictureInPictureMode
    }

    private fun enterPip() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        runCatching {
            enterPictureInPictureMode(
                PictureInPictureParams.Builder()
                    .setAspectRatio(Rational(16, 9))
                    .build(),
            )
        }
    }
}
