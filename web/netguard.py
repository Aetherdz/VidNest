"""Network-address guards shared by the VidNest web companion and bot.

Only globally routable unicast addresses may be reached. The checks are
deliberately explicit (rather than relying on a single ``is_global`` call) so
carrier-grade NAT, benchmarking and NAT64 ranges stay blocked on every Python
version we deploy on.

Validation alone is not enough: an attacker-controlled DNS name can answer
with a public address during validation and rebind to a loopback, private,
link-local or metadata address when the extractor actually connects.  The
socket guard installed below closes that window by checking every outbound
``connect``/``connect_ex`` on threads that opted in through
:func:`public_egress_only`, before a single packet is sent.
"""

from __future__ import annotations

import contextlib
import functools
import ipaddress
import socket
import threading
import urllib.parse
import urllib.request

# Ranges that some Python releases still report as global, plus the NAT64
# prefix whose embedded IPv4 address must never be treated as public.
_BLOCKED_NETWORKS = (
    ipaddress.ip_network("100.64.0.0/10"),  # RFC 6598 carrier-grade NAT
    ipaddress.ip_network("198.18.0.0/15"),  # RFC 2544 benchmarking
    ipaddress.ip_network("64:ff9b::/96"),  # RFC 6052 NAT64
)

PRIVATE_TARGET_MESSAGE = "Media host resolves to a private or local address."

_TLS = threading.local()
_GUARD_INSTALLED = False
_GUARD_MARKER = "_vidnest_netguard_guard"


def _as_ip(value) -> ipaddress._BaseAddress:
    """Coerce an address object, string or socket tuple entry to an IP object."""
    if isinstance(value, (ipaddress.IPv4Address, ipaddress.IPv6Address)):
        return value
    # Scoped IPv6 literals (``fe80::1%eth0``) carry a zone suffix.
    return ipaddress.ip_address(str(value).split("%", 1)[0].strip())


def is_public_ip(addr: ipaddress._BaseAddress | str) -> bool:
    """Return ``True`` only for globally routable, non-special addresses."""
    try:
        addr = _as_ip(addr)
    except (TypeError, ValueError):
        return False
    if isinstance(addr, ipaddress.IPv6Address) and addr.ipv4_mapped is not None:
        addr = addr.ipv4_mapped
    if (
        not addr.is_global
        or addr.is_private
        or addr.is_loopback
        or addr.is_link_local
        or addr.is_multicast
        or addr.is_reserved
        or addr.is_unspecified
    ):
        return False
    return not any(addr in network for network in _BLOCKED_NETWORKS)


def resolve_public_host(
    ascii_host: str,
    port: int = 443,
    resolver=None,
) -> set[ipaddress._BaseAddress]:
    """Resolve ``ascii_host`` and require every answer to be a public address.

    ``resolver`` may be any callable with ``socket.getaddrinfo``'s signature so
    callers can inject a deterministic resolver in tests.
    """
    resolve = resolver or socket.getaddrinfo
    try:
        answers = resolve(ascii_host, port, type=socket.SOCK_STREAM)
    except (OSError, ValueError) as exc:
        raise ValueError("Could not validate this site's network address.") from exc

    addresses: set[ipaddress._BaseAddress] = set()
    for answer in answers:
        try:
            raw = str(answer[4][0]).split("%", 1)[0]
            addresses.add(ipaddress.ip_address(raw))
        except (IndexError, TypeError, ValueError) as exc:
            raise ValueError("Could not validate this site's network address.") from exc

    if not addresses or any(not is_public_ip(address) for address in addresses):
        raise ValueError("Links to private or local network addresses are blocked.")
    return addresses


# ---------------------------------------------------------------------------
# Connection-time egress guard (DNS rebinding and redirect SSRF).
# ---------------------------------------------------------------------------
@contextlib.contextmanager
def public_egress_only():
    """Block outbound sockets to non-public addresses on this thread only.

    The guard is thread-local so concurrent, unrelated work (for example a
    health check or the Telegram transport) is unaffected.  Nested use is
    supported: the previous state is restored on exit.
    """
    previous = getattr(_TLS, "active", False)
    _TLS.active = True
    try:
        yield
    finally:
        _TLS.active = previous


def _require_public_target(sock: socket.socket, address) -> None:
    """Raise ``ValueError`` when ``address`` points at a non-public host."""
    if not getattr(_TLS, "active", False):
        return
    if getattr(sock, "family", None) not in (socket.AF_INET, socket.AF_INET6):
        return
    if not isinstance(address, tuple) or not address:
        return

    raw_host = address[0]
    if isinstance(raw_host, bytes):
        raw_host = raw_host.decode("ascii", "ignore")
    if not raw_host:
        raise ValueError(PRIVATE_TARGET_MESSAGE)

    try:
        candidates = {_as_ip(raw_host)}
    except (TypeError, ValueError):
        # A hostname was handed straight to ``connect``: resolve it here and
        # require every answer to be public, so rebinding cannot slip past.
        port = address[1] if len(address) > 1 else None
        try:
            answers = socket.getaddrinfo(raw_host, port, type=socket.SOCK_STREAM)
        except (OSError, ValueError) as exc:
            raise ValueError(PRIVATE_TARGET_MESSAGE) from exc
        candidates = set()
        for answer in answers:
            try:
                candidates.add(_as_ip(answer[4][0]))
            except (IndexError, TypeError, ValueError):
                continue

    if not candidates or any(not is_public_ip(candidate) for candidate in candidates):
        raise ValueError(PRIVATE_TARGET_MESSAGE)


def install_socket_guard() -> None:
    """Wrap ``socket.socket.connect``/``connect_ex`` with the egress guard.

    Idempotent: repeated imports (or repeated calls) never double-wrap.
    """
    global _GUARD_INSTALLED
    if _GUARD_INSTALLED:
        return

    original_connect = socket.socket.connect
    original_connect_ex = socket.socket.connect_ex
    if getattr(original_connect, _GUARD_MARKER, False):
        _GUARD_INSTALLED = True
        return

    @functools.wraps(original_connect)
    def guarded_connect(self, address, *args, **kwargs):
        _require_public_target(self, address)
        return original_connect(self, address, *args, **kwargs)

    @functools.wraps(original_connect_ex)
    def guarded_connect_ex(self, address, *args, **kwargs):
        _require_public_target(self, address)
        return original_connect_ex(self, address, *args, **kwargs)

    setattr(guarded_connect, _GUARD_MARKER, True)
    setattr(guarded_connect_ex, _GUARD_MARKER, True)
    socket.socket.connect = guarded_connect  # type: ignore[method-assign]
    socket.socket.connect_ex = guarded_connect_ex  # type: ignore[method-assign]
    _GUARD_INSTALLED = True


class SafeRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Redirect handler that refuses to follow a hop to a non-public host.

    The socket guard above already blocks the connection itself; this handler
    keeps the failure explicit and early for any urllib-based caller that
    opts in to :func:`public_egress_only`.
    """

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        try:
            parsed = urllib.parse.urlsplit(newurl)
            host = parsed.hostname
            if parsed.scheme.lower() not in ("http", "https") or not host:
                raise ValueError(PRIVATE_TARGET_MESSAGE)
            ascii_host = host.encode("idna").decode("ascii").lower().rstrip(".")
            port = parsed.port or (443 if parsed.scheme.lower() == "https" else 80)
            resolve_public_host(ascii_host, port)
        except (UnicodeError, ValueError) as exc:
            raise ValueError(PRIVATE_TARGET_MESSAGE) from exc
        return super().redirect_request(req, fp, code, msg, headers, newurl)


install_socket_guard()
