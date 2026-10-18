package com.movid.app.core.cookies

/** One web cookie in the Netscape cookies.txt model. */
data class Cookie(
    val domain: String,
    val name: String,
    val value: String,
    val path: String = "/",
    val secure: Boolean = false,
    val httpOnly: Boolean = false,
    /** 0 = session cookie (no expiry). yt-dlp accepts session cookies. */
    val expiresEpochSeconds: Long = 0L,
)

/**
 * Parser/serializer for the "Netscape HTTP Cookie File" format that yt-dlp
 * consumes via `--cookies`. Pure Kotlin.
 */
object NetscapeCookies {
    const val HEADER = "# Netscape HTTP Cookie File"
    private const val HTTP_ONLY_PREFIX = "#HttpOnly_"
    private const val MAX_LINE_LENGTH = 8_192
    private const val MAX_COOKIES = 10_000

    fun serialize(cookies: List<Cookie>): String {
        val sb = StringBuilder()
        sb.append(HEADER).append('\n')
        for (cookie in cookies) {
            if (cookie.httpOnly) sb.append(HTTP_ONLY_PREFIX)
            sb.append(sanitizeField(cookie.domain)).append('\t')
            sb.append(if (cookie.domain.startsWith('.')) "TRUE" else "FALSE").append('\t')
            sb.append(sanitizeField(cookie.path)).append('\t')
            sb.append(if (cookie.secure) "TRUE" else "FALSE").append('\t')
            sb.append(cookie.expiresEpochSeconds).append('\t')
            sb.append(sanitizeField(cookie.name)).append('\t')
            sb.append(sanitizeField(cookie.value)).append('\n')
        }
        return sb.toString()
    }

    /**
     * Fields must not contain tabs/newlines: a hostile cookie from a web
     * source could otherwise inject extra cookie-file lines that yt-dlp reads.
     */
    private fun sanitizeField(value: String): String =
        value.replace('\t', ' ').replace('\r', ' ').replace('\n', ' ')

    fun parse(text: String): List<Cookie> {
        val out = ArrayList<Cookie>()
        for (rawLine in text.lineSequence()) {
            if (rawLine.isBlank()) continue
            if (rawLine.length > MAX_LINE_LENGTH) continue
            if (out.size >= MAX_COOKIES) break
            var line = rawLine
            var httpOnly = false
            if (line.startsWith(HTTP_ONLY_PREFIX)) {
                httpOnly = true
                line = line.removePrefix(HTTP_ONLY_PREFIX)
            } else if (line.startsWith('#')) {
                continue
            }
            val parts = line.split('\t')
            if (parts.size < 7) continue
            val domain = parts[0]
            val name = parts[5]
            if (domain.isEmpty() || name.isEmpty()) continue
            out.add(
                Cookie(
                    domain = domain,
                    name = name,
                    value = parts.drop(6).joinToString("\t"),
                    path = parts[2].ifEmpty { "/" },
                    secure = parts[3].equals("TRUE", ignoreCase = true),
                    httpOnly = httpOnly,
                    expiresEpochSeconds = parts[4].toLongOrNull() ?: 0L,
                ),
            )
        }
        return out
    }

    /** Parses a Cookie request header ("a=b; c=d") into ordered name/value pairs. */
    fun parseHeader(header: String): List<Pair<String, String>> =
        header.split(';')
            .map { it.trim() }
            .filter { it.isNotEmpty() && it.contains('=') }
            .map { pair ->
                val separator = pair.indexOf('=')
                pair.substring(0, separator).trim() to pair.substring(separator + 1).trim()
            }

    /** Builds session cookies for [url] out of a Cookie header string. */
    fun sessionCookiesFor(url: String, header: String): List<Cookie> {
        val host = url.substringAfter("://", "").substringBefore('/').substringBefore(':')
        if (host.isEmpty()) return emptyList()
        val secure = url.startsWith("https")
        return parseHeader(header).map { (name, value) ->
            Cookie(domain = host, name = name, value = value, secure = secure)
        }
    }
}