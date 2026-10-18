package com.movid.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration

// Movid brand — "Violet Instrument": one confident violet for action and
// progress, one mint signal for success, on calm paper / ink canvases.
// Hue is spent on purpose only (CTA, progress, success, brand mark).
val MovidViolet = Color(0xFF6D3BFF)
val MovidVioletSoft = Color(0xFFA78BFF)
val MovidMint = Color(0xFF3DDBB0)
val MovidMintDeep = Color(0xFF0A654F)
val MovidInk = Color(0xFF17121F)
val MovidPaper = Color(0xFFF7F5FF)
val MovidNight = Color(0xFF0F0D16)
val MovidBlack = Color(0xFF000000)
val MovidWhite = Color(0xFFFFFFFF)

private val DarkScheme = darkColorScheme(
    primary = MovidVioletSoft,
    onPrimary = Color(0xFF230A66),
    primaryContainer = Color(0xFF2B1E63),
    onPrimaryContainer = Color(0xFFE9E2FF),
    inversePrimary = MovidViolet,
    secondary = MovidMint,
    onSecondary = Color(0xFF00382A),
    secondaryContainer = Color(0xFF0F4437),
    onSecondaryContainer = Color(0xFFBAF5E3),
    tertiary = MovidVioletSoft,
    onTertiary = Color(0xFF230A66),
    background = MovidNight,
    onBackground = Color(0xFFF2EFFF),
    surface = Color(0xFF12101B),
    onSurface = Color(0xFFF2EFFF),
    surfaceVariant = Color(0xFF1D1930),
    onSurfaceVariant = Color(0xFFC9C2E0),
    surfaceContainerLowest = Color(0xFF0B0912),
    surfaceContainerLow = Color(0xFF14111C),
    surfaceContainer = Color(0xFF17141F),
    surfaceContainerHigh = Color(0xFF1D1930),
    surfaceContainerHighest = Color(0xFF26223B),
    surfaceDim = MovidNight,
    surfaceBright = Color(0xFF2E2A44),
    inverseSurface = Color(0xFFF7F5FF),
    inverseOnSurface = MovidInk,
    outline = Color(0xFF6F6990),
    outlineVariant = Color(0xFF3A3552),
    error = Color(0xFFFFB4AB),
    onError = Color(0xFF690005),
    errorContainer = Color(0xFF93000A),
    onErrorContainer = Color(0xFFFFDAD6),
    scrim = MovidBlack,
)

private val LightScheme = lightColorScheme(
    primary = MovidViolet,
    onPrimary = MovidWhite,
    primaryContainer = Color(0xFFECE6FF),
    onPrimaryContainer = Color(0xFF2A1660),
    inversePrimary = MovidVioletSoft,
    secondary = MovidMintDeep,
    onSecondary = MovidWhite,
    secondaryContainer = Color(0xFFD7F7EC),
    onSecondaryContainer = Color(0xFF06382A),
    tertiary = MovidViolet,
    onTertiary = MovidWhite,
    background = MovidPaper,
    onBackground = MovidInk,
    surface = MovidWhite,
    onSurface = MovidInk,
    surfaceVariant = Color(0xFFEDEAF7),
    onSurfaceVariant = Color(0xFF4A4460),
    surfaceContainerLowest = MovidWhite,
    surfaceContainerLow = Color(0xFFFBF9FF),
    surfaceContainer = Color(0xFFF3F1FB),
    surfaceContainerHigh = Color(0xFFEDEAF7),
    surfaceContainerHighest = Color(0xFFE6E2F3),
    surfaceDim = Color(0xFFE6E2F3),
    surfaceBright = MovidWhite,
    inverseSurface = MovidInk,
    inverseOnSurface = MovidPaper,
    outline = Color(0xFF7B7590),
    outlineVariant = Color(0xFFD9D4E8),
    error = Color(0xFFB3261E),
    onError = MovidWhite,
    errorContainer = Color(0xFFF9DEDC),
    onErrorContainer = Color(0xFF410E0B),
    scrim = MovidBlack,
)

@Composable
fun MovidTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val isArabic = LocalConfiguration.current.locales.get(0)?.language == "ar"
    MaterialTheme(
        colorScheme = if (darkTheme) DarkScheme else LightScheme,
        typography = movidTypography(arabic = isArabic),
    ) {
        // Root surface: paints the resolved canvas independently of the
        // window background (the platform resolves that one from the system
        // mode) and gives every screen the matching content color.
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background,
        ) {
            content()
        }
    }
}
