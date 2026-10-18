package com.movid.app.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.movid.app.R

/**
 * IBM Plex Sans Arabic (SIL OFL - see assets/licenses) with the "Violet
 * Instrument" type scale from design/BRIEF.md: one family, weights
 * 400/500/600, seven steps. Arabic gets the +2sp line-height the brief
 * asks for, applied to every slot.
 */
private val PlexArabic = FontFamily(
    Font(R.font.ibm_plex_sans_arabic_regular, FontWeight.Normal),
    Font(R.font.ibm_plex_sans_arabic_medium, FontWeight.Medium),
    Font(R.font.ibm_plex_sans_arabic_semibold, FontWeight.SemiBold),
)

fun movidTypography(arabic: Boolean): Typography {
    val boost = if (arabic) 2 else 0
    fun style(size: Int, lineHeight: Int, weight: FontWeight) = TextStyle(
        fontFamily = PlexArabic,
        fontWeight = weight,
        fontSize = size.sp,
        lineHeight = (lineHeight + boost).sp,
    )
    val display = style(32, 40, FontWeight.SemiBold)
    val title = style(24, 32, FontWeight.SemiBold)
    val headline = style(18, 26, FontWeight.SemiBold)
    val bodyLarge = style(16, 24, FontWeight.Normal)
    val body = style(14, 22, FontWeight.Normal)
    val label = style(13, 18, FontWeight.Medium)
    val caption = style(12, 16, FontWeight.Normal)
    return Typography(
        displayLarge = display,
        displayMedium = display,
        displaySmall = title,
        headlineLarge = title,
        headlineMedium = headline,
        headlineSmall = headline,
        titleLarge = title,
        titleMedium = bodyLarge.copy(fontWeight = FontWeight.Medium),
        titleSmall = body.copy(fontWeight = FontWeight.Medium),
        bodyLarge = bodyLarge,
        bodyMedium = body,
        bodySmall = caption,
        labelLarge = label,
        labelMedium = label,
        labelSmall = caption,
    )
}
