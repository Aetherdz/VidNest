package com.movid.app

import android.content.Context
import android.content.Intent
import android.content.res.Configuration
import android.graphics.drawable.ColorDrawable
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat
import com.movid.app.i18n.LanguageStore
import com.movid.app.i18n.withAppLanguage
import com.movid.app.ui.FetchRelay
import com.movid.app.ui.FetchScreen
import com.movid.app.ui.theme.MovidNight
import com.movid.app.ui.theme.MovidPaper
import com.movid.app.ui.theme.MovidTheme
import com.movid.app.ui.theme.ThemeStore
import com.movid.app.ui.theme.isDark

class MainActivity : ComponentActivity() {
    override fun attachBaseContext(newBase: Context) {
        super.attachBaseContext(newBase.withAppLanguage(LanguageStore.load(newBase)))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        // The window background comes from the XML theme, which only knows
        // the system mode; repaint it from the stored choice before the first
        // frame. The Compose root surface keeps the canvas correct afterwards.
        val storedDark = ThemeStore.load(this).isDark(deviceNightMode())
        window.setBackgroundDrawable(
            ColorDrawable((if (storedDark) MovidNight else MovidPaper).toArgb()),
        )
        // The status bar is transparent on every supported release, so its
        // icons follow the resolved mode; the navigation bar keeps a
        // system-derived scrim below API 29 and stays system-matched there.
        val controller = WindowCompat.getInsetsController(window, window.decorView)
        controller.isAppearanceLightStatusBars = !storedDark
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            controller.isAppearanceLightNavigationBars = !storedDark
        }
        // Only a fresh launch delivers a new share; when the system restores
        // the task (process death) the old intent must not re-fire a probe.
        if (savedInstanceState == null) relay(intent)
        setContent {
            var appLanguage by remember { mutableStateOf(LanguageStore.load(this@MainActivity)) }
            var themeMode by remember { mutableStateOf(ThemeStore.load(this@MainActivity)) }
            val dark = themeMode.isDark(isSystemInDarkTheme())
            val view = LocalView.current
            // Keep the system-bar icons in step when the mode is switched at
            // runtime (same polarity rule as in onCreate above).
            LaunchedEffect(dark) {
                val controller =
                    WindowCompat.getInsetsController(this@MainActivity.window, view)
                controller.isAppearanceLightStatusBars = !dark
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    controller.isAppearanceLightNavigationBars = !dark
                }
            }
            MovidTheme(darkTheme = dark) {
                FetchScreen(
                    themeMode = themeMode,
                    appLanguage = appLanguage,
                    onLanguageChange = { language ->
                        if (language != appLanguage) {
                            LanguageStore.save(this@MainActivity, language)
                            appLanguage = language
                            recreate()
                        }
                    },
                    onThemeModeChange = { mode ->
                        ThemeStore.save(this@MainActivity, mode)
                        themeMode = mode
                    },
                )
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        relay(intent)
    }

    /** Device night mode, independent of the app's stored appearance choice. */
    private fun deviceNightMode(): Boolean =
        (resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) ==
            Configuration.UI_MODE_NIGHT_YES

    /** Feeds a share/view intent to the fetch screen; explains empty shares. */
    private fun relay(intent: Intent?) {
        if (!FetchRelay.offer(intent)) {
            Toast.makeText(this, R.string.fetch_no_link, Toast.LENGTH_SHORT).show()
        }
    }
}
