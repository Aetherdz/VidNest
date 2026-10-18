package com.movid.app.ui

import android.content.Intent
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/**
 * Hands links captured outside the app (share sheet, deep links) to the fetch
 * screen. Populated by [com.movid.app.MainActivity] and consumed once.
 */
object FetchRelay {

    private val _pendingUrl = MutableStateFlow<String?>(null)
    val pendingUrl: StateFlow<String?> = _pendingUrl

    /**
     * Extracts an http(s) link from a share/view intent, if any.
     * Returns false only when the intent was a share/view that carried no
     * usable link, so callers can tell the user why nothing happened.
     */
    fun offer(intent: Intent?): Boolean {
        val text = when (intent?.action) {
            Intent.ACTION_SEND -> intent.getStringExtra(Intent.EXTRA_TEXT)
            Intent.ACTION_VIEW -> intent.dataString
            else -> return true
        } ?: return false
        val link = extractLink(text) ?: return false
        _pendingUrl.value = link
        return true
    }

    fun consume() {
        _pendingUrl.value = null
    }
}

private val URL_LINK = Regex("""https?://\S+""")

/**
 * The first http(s) link in [text] with surrounding punctuation trimmed.
 * Share texts routinely glue sentence punctuation to the URL ("see link.")
 * and that trailing dot would otherwise be sent to the download engine and
 * break the item.
 */
internal fun extractLink(text: String?): String? {
    if (text == null) return null
    var match = URL_LINK.find(text)?.value ?: return null
    match = match.trimEnd('.', ',', ';', ':', '!', '?', '\'', '"', '»', '«', '،', '؛', '…')
    // Drop a closing bracket only when it is not balanced inside the URL
    // (share texts often wrap the link: "(https://x.com/a)").
    while (match.isNotEmpty() && match.last() in ")]}>") {
        val close = match.last()
        val open = when (close) {
            ')' -> '('
            ']' -> '['
            '}' -> '{'
            else -> '<'
        }
        if (match.count { it == close } <= match.count { it == open }) break
        match = match.dropLast(1)
    }
    return match.takeIf { it.length > "https://".length }
}
