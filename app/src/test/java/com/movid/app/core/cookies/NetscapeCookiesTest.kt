package com.movid.app.core.cookies

import com.movid.app.core.cookies.Cookie
import com.movid.app.core.cookies.NetscapeCookies
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class NetscapeCookiesTest {

    @Test
    fun serialize_includes_header_and_tab_fields() {
        val cookie = Cookie(
            domain = "example.com",
            name = "session",
            value = "abc123",
            path = "/",
            secure = true,
            httpOnly = true,
            expiresEpochSeconds = 1700000000,
        )
        val text = NetscapeCookies.serialize(listOf(cookie))
        assertTrue(text.startsWith("# Netscape HTTP Cookie File"))
        // domain "example.com" does not start with '.', so the include-subdomains field is FALSE
        assertTrue(
            text.contains("example.com\tFALSE\t/\tTRUE\t1700000000\tsession\tabc123"),
        )
    }

    @Test
    fun serialize_round_trip() {
        val cookies = listOf(
            Cookie("example.com", "a", "1", secure = true),
            Cookie("example.org", "b", "2", path = "/app", httpOnly = true, expiresEpochSeconds = 999),
            Cookie(".example.net", "c", "3"),
        )
        val parsed = NetscapeCookies.parse(NetscapeCookies.serialize(cookies))
        assertEquals(cookies, parsed)
    }

    @Test
    fun parse_basic_netscape_block() {
        val text = """
            # Netscape HTTP Cookie File
            # comment line

            #HttpOnly_example.com	TRUE	/	TRUE	1700000000	session	abc123
            example.org	FALSE	/app	FALSE	0	token	xyz
        """.trimIndent()
        val cookies = NetscapeCookies.parse(text)
        assertEquals(2, cookies.size)
        assertEquals("example.com", cookies[0].domain)
        assertEquals("session", cookies[0].name)
        assertEquals("abc123", cookies[0].value)
        assertTrue(cookies[0].secure)
        assertTrue(cookies[0].httpOnly)
        assertEquals(1700000000L, cookies[0].expiresEpochSeconds)
    }

    @Test
    fun parse_skips_comments_and_blank_lines() {
        val text = """
            # Netscape HTTP Cookie File
            # a comment

            example.com	TRUE	/	TRUE	0	name	value
        """.trimIndent()
        val cookies = NetscapeCookies.parse(text)
        assertEquals(1, cookies.size)
    }

    @Test
    fun parse_httpOnly_prefix() {
        val text = "# Netscape HTTP Cookie File\n#HttpOnly_example.com\tTRUE\t/\tTRUE\t0\tsession\tsecret\n"
        val cookies = NetscapeCookies.parse(text)
        assertEquals(1, cookies.size)
        assertTrue(cookies[0].httpOnly)
        assertEquals("example.com", cookies[0].domain)
    }

    @Test
    fun parse_skips_too_few_fields() {
        val text = "# Netscape HTTP Cookie File\nonly\tsix\tfields\there\n"
        assertTrue(NetscapeCookies.parse(text).isEmpty())
    }

    @Test
    fun parse_skips_empty_domain_or_name() {
        val text = "# Netscape HTTP Cookie File\n\tTRUE\t/\tTRUE\t0\tname\tvalue\n"
        assertTrue(NetscapeCookies.parse(text).isEmpty())
        val text2 = "# Netscape HTTP Cookie File\nexample.com\tTRUE\t/\tTRUE\t0\t\tvalue\n"
        assertTrue(NetscapeCookies.parse(text2).isEmpty())
    }

    @Test
    fun parse_sanitizes_fields_no_line_injection() {
        // A hostile value containing tab/newline must not inject a fake cookie line.
        val hostile = Cookie("example.com", "name\n\tinjected", "value", path = "/")
        val text = NetscapeCookies.serialize(listOf(hostile))
        val parsed = NetscapeCookies.parse(text)
        assertEquals(1, parsed.size)
        assertFalse(parsed[0].name.contains('\n'))
        assertFalse(parsed[0].name.contains('\t'))
        assertEquals("value", parsed[0].value)
    }

    @Test
    fun parse_skips_overlong_lines() {
        val longLine = "example.com\tTRUE\t/\tTRUE\t0\tname\t" + "x".repeat(8_192)
        val text = "# Netscape HTTP Cookie File\n$longLine\n"
        assertTrue(NetscapeCookies.parse(text).isEmpty())
    }

    @Test
    fun parse_stops_at_max_cookies() {
        val lines = (1..10_001).map { i ->
            "example.com\tTRUE\t/\tTRUE\t0\tcookie$i\tvalue$i"
        }.joinToString("\n")
        val text = "# Netscape HTTP Cookie File\n$lines\n"
        val cookies = NetscapeCookies.parse(text)
        assertEquals(10_000, cookies.size)
        assertEquals("cookie1", cookies[0].name)
        assertEquals("cookie10000", cookies[9_999].name)
    }

    @Test
    fun parseHeader_splits_name_value_pairs() {
        assertEquals(listOf("a" to "b", "c" to "d"), NetscapeCookies.parseHeader("a=b; c=d"))
        // spaces are trimmed
        assertEquals(listOf("a" to "b"), NetscapeCookies.parseHeader(" a = b "))
        // entries without '=' and empty entries are skipped
        assertEquals(listOf("a" to "b", "c" to "d"), NetscapeCookies.parseHeader("a=b; ; novalue; c=d"))
        // first '=' is the separator; the value may contain '='
        assertEquals(listOf("a" to "b=c"), NetscapeCookies.parseHeader("a=b=c"))
        assertTrue(NetscapeCookies.parseHeader("").isEmpty())
    }

    @Test
    fun sessionCookies_for_builds_session_cookies() {
        val cookies = NetscapeCookies.sessionCookiesFor("https://example.com/path", "a=b; c=d")
        assertEquals(2, cookies.size)
        assertEquals("example.com", cookies[0].domain)
        assertEquals("a", cookies[0].name)
        assertEquals("b", cookies[0].value)
        assertTrue(cookies[0].secure)
        assertEquals(0L, cookies[0].expiresEpochSeconds) // session cookie
        assertEquals("/", cookies[0].path)
    }

    @Test
    fun sessionCookies_for_http_is_not_secure() {
        val cookies = NetscapeCookies.sessionCookiesFor("http://example.com/x", "a=b")
        assertFalse(cookies[0].secure)
    }

    @Test
    fun sessionCookies_strips_port() {
        val cookies = NetscapeCookies.sessionCookiesFor("https://example.com:8080/x", "a=b")
        assertEquals("example.com", cookies[0].domain)
        assertTrue(cookies[0].secure)
    }

    @Test
    fun sessionCookies_empty_host_or_header() {
        assertTrue(NetscapeCookies.sessionCookiesFor("https://", "a=b").isEmpty())
        assertTrue(NetscapeCookies.sessionCookiesFor("https://example.com", "").isEmpty())
        assertTrue(NetscapeCookies.sessionCookiesFor("https://example.com", "   ").isEmpty())
    }

    @Test
    fun parse_does_not_leak_header_line() {
        // The HEADER line itself must never become a cookie.
        val text = "# Netscape HTTP Cookie File"
        assertTrue(NetscapeCookies.parse(text).isEmpty())
    }
}
