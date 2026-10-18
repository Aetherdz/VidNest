package com.movid.app.ui.theme

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ThemeModeTest {

    @Test
    fun system_mode_follows_device_setting() {
        assertTrue(ThemeMode.SYSTEM.isDark(systemInDark = true))
        assertFalse(ThemeMode.SYSTEM.isDark(systemInDark = false))
    }

    @Test
    fun light_mode_is_light_regardless_of_device_setting() {
        assertFalse(ThemeMode.LIGHT.isDark(systemInDark = true))
        assertFalse(ThemeMode.LIGHT.isDark(systemInDark = false))
    }

    @Test
    fun dark_mode_is_dark_regardless_of_device_setting() {
        assertTrue(ThemeMode.DARK.isDark(systemInDark = true))
        assertTrue(ThemeMode.DARK.isDark(systemInDark = false))
    }

    @Test
    fun from_name_null_blank_or_unknown_falls_back_to_system() {
        assertEquals(ThemeMode.SYSTEM, ThemeMode.fromName(null))
        assertEquals(ThemeMode.SYSTEM, ThemeMode.fromName(""))
        assertEquals(ThemeMode.SYSTEM, ThemeMode.fromName("bogus"))
    }

    @Test
    fun from_name_resolves_known_mode_names() {
        assertEquals(ThemeMode.SYSTEM, ThemeMode.fromName("SYSTEM"))
        assertEquals(ThemeMode.LIGHT, ThemeMode.fromName("LIGHT"))
        assertEquals(ThemeMode.DARK, ThemeMode.fromName("DARK"))
    }
}
