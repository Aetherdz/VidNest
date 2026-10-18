package com.movid.app.core.yt

import java.io.IOException
import java.net.HttpURLConnection
import java.net.InetAddress
import java.net.URI
import java.net.URL
import java.util.Locale

/**
 * Expands a small allow-list of common share-link hosts before yt-dlp sees the URL.
 * Network requests are only made after the user explicitly starts a probe/download.
 * Redirects are manual, bounded, HTTPS-only after the first hop, and cookie-free.
 */
class ShortLinkResolver(
    private val openConnection: (URL) -> HttpURLConnection = { it.openConnection() as HttpURLConnection },
    private val nowNanos: () -> Long = System::nanoTime,
    private val resolveAddresses: (String) -> List<InetAddress> = { InetAddress.getAllByName(it).toList() },
) {
    fun resolve(rawUrl: String): String {
        val original = validate(rawUrl)
        if (!isKnownShortener(original.host)) return original.toASCIIString()
        require(original.scheme.equals("https", ignoreCase = true)) {
            "HTTPS is required for short links"
        }
        val allowedRedirectHosts = REDIRECT_HOSTS.getValue(normalizeHost(original.host))

        val deadline = nowNanos() + MAX_TOTAL_NANOS
        var current = original
        repeat(MAX_REDIRECTS + 1) { hop ->
            if (nowNanos() >= deadline) throw IOException("Short-link resolution timed out")
            if (isUnsafeHost(current.host)) throw IOException("Short link points to a local address")
            val timeout = remainingTimeout(deadline)
            val connection = openConnection(current.toURL())
            try {
                connection.instanceFollowRedirects = false
                connection.connectTimeout = timeout
                connection.readTimeout = timeout
                connection.requestMethod = "HEAD"
                connection.setRequestProperty("User-Agent", USER_AGENT)
                var status = connection.responseCode
                if (status >= 400) {
                    connection.disconnect()
                    val get = openConnection(current.toURL())
                    try {
                        get.instanceFollowRedirects = false
                        val getTimeout = remainingTimeout(deadline)
                        get.connectTimeout = getTimeout
                        get.readTimeout = getTimeout
                        get.requestMethod = "GET"
                        get.setRequestProperty("Range", "bytes=0-0")
                        get.setRequestProperty("User-Agent", USER_AGENT)
                        status = get.responseCode
                        val location = get.getHeaderField("Location")
                        if (isRedirect(status) && location != null) {
                            current = nextUri(current, location, allowedRedirectHosts)
                            if (hop == MAX_REDIRECTS) throw IOException("Too many short-link redirects")
                            return@repeat
                        }
                        if (status >= 400) throw IOException("Short-link resolution failed (HTTP $status)")
                        return current.toASCIIString()
                    } finally {
                        get.disconnect()
                    }
                }
                if (!isRedirect(status)) {
                    if (status >= 400) throw IOException("Short-link resolution failed (HTTP $status)")
                    return current.toASCIIString()
                }
                val location = connection.getHeaderField("Location")
                    ?: throw IOException("Short link returned an empty redirect")
                current = nextUri(current, location, allowedRedirectHosts)
                if (hop == MAX_REDIRECTS) throw IOException("Too many short-link redirects")
            } finally {
                connection.disconnect()
            }
        }
        return current.toASCIIString()
    }

    private fun nextUri(current: URI, location: String, allowedHosts: Set<String>): URI {
        require('\r' !in location && '\n' !in location) { "Invalid redirect location" }
        val target = validate(current.resolve(location).toString())
        require(!current.scheme.equals("https", ignoreCase = true) || target.scheme.equals("https", ignoreCase = true)) {
            "Insecure redirect refused"
        }
        if (allowedHosts.none { hostMatches(target.host, it) }) {
            throw IOException("Short link redirected outside its supported platform")
        }
        return target
    }

    private fun validate(value: String): URI {
        require(value.length <= MAX_URL_LENGTH) { "URL is too long" }
        val uri = runCatching { URI(value.trim()) }.getOrNull()
            ?: throw IllegalArgumentException("Invalid URL")
        val scheme = uri.scheme?.lowercase(Locale.ROOT)
        require(scheme == "https" || scheme == "http") { "Only HTTP(S) URLs are supported" }
        require(uri.rawUserInfo == null && !uri.host.isNullOrBlank()) { "Invalid URL authority" }
        return uri
    }

    private fun isKnownShortener(host: String): Boolean {
        return normalizeHost(host) in REDIRECT_HOSTS
    }

    private fun normalizeHost(host: String): String = host.lowercase(Locale.ROOT).trimEnd('.')

    private fun hostMatches(host: String, allowedRoot: String): Boolean {
        val normalized = normalizeHost(host)
        return normalized == allowedRoot || normalized.endsWith(".$allowedRoot")
    }

    /** Best-effort block for literal/private destinations; yt-dlp remains the final fetcher. */
    private fun isUnsafeHost(host: String): Boolean {
        val lookupHost = host.removePrefix("[").removeSuffix("]")
        val addresses = runCatching { resolveAddresses(lookupHost) }.getOrElse {
            throw IOException("Could not validate short-link host", it)
        }
        return addresses.isEmpty() || addresses.any(::isUnsafeAddress)
    }

    private fun isUnsafeAddress(address: InetAddress): Boolean {
        val bytes = address.address.map { it.toInt() and 0xff }
        if (bytes.size == 4) {
            val (a, b) = bytes
            return address.isAnyLocalAddress || address.isLoopbackAddress || address.isLinkLocalAddress ||
                address.isSiteLocalAddress || address.isMulticastAddress ||
                a == 0 || (a == 100 && b in 64..127) ||
                (a == 198 && b in 18..19) ||
                (a == 255 && b == 255 && bytes[2] == 255 && bytes[3] == 255)
        }
        if (bytes.size == 16) {
            val mappedIpv4 = bytes.take(10).all { it == 0 } && bytes[10] == 0xff && bytes[11] == 0xff
            if (mappedIpv4) {
                return isUnsafeAddress(InetAddress.getByAddress(bytes.drop(12).map(Int::toByte).toByteArray()))
            }
            return address.isAnyLocalAddress || address.isLoopbackAddress || address.isLinkLocalAddress ||
                address.isSiteLocalAddress || address.isMulticastAddress ||
                bytes[0] and 0xfe == 0xfc || // fc00::/7 unique-local
                (bytes[0] == 0x00 && bytes.take(15).all { it == 0 }) || // IPv4-compatible / unspecified
                (bytes[0] == 0x00 && bytes[1] == 0x64 && bytes[2] == 0xff && bytes[3] == 0x9b) // NAT64
        }
        return true
    }

    private fun remainingTimeout(deadline: Long): Int {
        val remainingMs = ((deadline - nowNanos()).coerceAtLeast(0L) / 1_000_000L).toInt()
        if (remainingMs <= 0) throw IOException("Short-link resolution timed out")
        return minOf(CONNECT_TIMEOUT_MS, READ_TIMEOUT_MS, remainingMs)
    }

    private fun isRedirect(status: Int): Boolean = status in REDIRECT_CODES

    private companion object {
        const val CONNECT_TIMEOUT_MS = 2_500
        const val READ_TIMEOUT_MS = 2_500
        const val MAX_REDIRECTS = 5
        const val MAX_URL_LENGTH = 4_096
        const val MAX_TOTAL_NANOS = 15_000_000_000L
        const val USER_AGENT = "VidNest/0.4 (Android; link resolver)"
        val REDIRECT_HOSTS = mapOf(
            "vt.tiktok.com" to setOf("tiktok.com"),
            "vm.tiktok.com" to setOf("tiktok.com"),
            "fb.watch" to setOf("facebook.com", "fb.com"),
            "youtu.be" to setOf("youtube.com", "youtube-nocookie.com"),
        )
        val REDIRECT_CODES = setOf(301, 302, 303, 307, 308)
    }
}
