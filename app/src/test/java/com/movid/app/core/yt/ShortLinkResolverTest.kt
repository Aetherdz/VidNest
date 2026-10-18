package com.movid.app.core.yt

import java.net.HttpURLConnection
import java.net.InetAddress
import java.net.URL
import java.util.ArrayDeque
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class ShortLinkResolverTest {
    @Test
    fun `non-shortener is returned without network request`() {
        var opened = false
        val resolver = ShortLinkResolver(openConnection = { opened = true; error("unexpected") })

        assertEquals("https://example.com/video", resolver.resolve("https://example.com/video"))
        assertEquals(false, opened)
    }

    @Test
    fun `follows a bounded https redirect for known shorteners`() {
        val connections = ArrayDeque<HttpURLConnection>().apply {
            add(StubConnection(URL("https://vt.tiktok.com/x"), 302, "https://www.tiktok.com/@user/video/1"))
            add(StubConnection(URL("https://www.tiktok.com/@user/video/1"), 200, null))
        }
        val resolver = ShortLinkResolver(
            openConnection = { connections.removeFirst() },
            resolveAddresses = { listOf(InetAddress.getByAddress(byteArrayOf(8, 8, 8, 8))) },
        )

        assertEquals("https://www.tiktok.com/@user/video/1", resolver.resolve("https://vt.tiktok.com/x"))
        assertEquals(true, connections.isEmpty())
    }

    @Test
    fun `rejects redirect downgrade and local addresses`() {
        val downgrade = ShortLinkResolver(
            openConnection = { StubConnection(it, 302, "http://example.com/video") },
            resolveAddresses = { listOf(InetAddress.getByAddress(byteArrayOf(8, 8, 8, 8))) },
        )
        assertThrows(IllegalArgumentException::class.java) {
            downgrade.resolve("https://youtu.be/abc")
        }

        val local = ShortLinkResolver(
            openConnection = { error("unsafe address must be rejected before connection") },
            resolveAddresses = { listOf(InetAddress.getByAddress(byteArrayOf(127, 0, 0, 1))) },
        )
        assertThrows(java.io.IOException::class.java) {
            local.resolve("https://vt.tiktok.com/abc")
        }
    }

    @Test
    fun `requires https and rejects redirects outside the platform domain`() {
        val resolver = ShortLinkResolver(
            openConnection = { StubConnection(it, 302, "https://attacker.example/payload") },
            resolveAddresses = { listOf(InetAddress.getByAddress(byteArrayOf(8, 8, 8, 8))) },
        )
        assertThrows(IllegalArgumentException::class.java) {
            resolver.resolve("http://vt.tiktok.com/abc")
        }
        assertThrows(java.io.IOException::class.java) {
            resolver.resolve("https://vt.tiktok.com/abc")
        }
    }

    @Test
    fun `blocks ipv6 unique local and ipv4 carrier nat answers`() {
        val unsafeAnswers = listOf(
            InetAddress.getByAddress(byteArrayOf(0xfd.toByte(), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1)),
            InetAddress.getByAddress(byteArrayOf(100, 64, 0, 1)),
            InetAddress.getByAddress(byteArrayOf(255.toByte(), 255.toByte(), 255.toByte(), 255.toByte())),
        )
        unsafeAnswers.forEach { answer ->
            val resolver = ShortLinkResolver(
                openConnection = { error("unsafe address must be rejected before connection") },
                resolveAddresses = { listOf(answer) },
            )
            assertThrows(java.io.IOException::class.java) {
                resolver.resolve("https://vt.tiktok.com/abc")
            }
        }
    }

    @Test
    fun `retries a denied head request once with bounded get`() {
        val connections = ArrayDeque<HttpURLConnection>().apply {
            add(StubConnection(URL("https://vt.tiktok.com/x"), 403, null))
            add(StubConnection(URL("https://vt.tiktok.com/x"), 302, "https://www.tiktok.com/@user/video/1"))
            add(StubConnection(URL("https://www.tiktok.com/@user/video/1"), 200, null))
        }
        val resolver = ShortLinkResolver(
            openConnection = { connections.removeFirst() },
            resolveAddresses = { listOf(InetAddress.getByAddress(byteArrayOf(8, 8, 8, 8))) },
        )
        assertEquals("https://www.tiktok.com/@user/video/1", resolver.resolve("https://vt.tiktok.com/x"))
        assertEquals(true, connections.isEmpty())
    }

    private class StubConnection(
        url: URL,
        private val status: Int,
        private val location: String?,
    ) : HttpURLConnection(url) {
        override fun disconnect() = Unit
        override fun usingProxy(): Boolean = false
        override fun connect() = Unit
        override fun getResponseCode(): Int = status
        override fun getHeaderField(name: String?): String? =
            if (name.equals("Location", ignoreCase = true)) location else null
    }
}
