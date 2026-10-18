# VidNest local web companion

This is a separate, optional Flask interface for downloading public media to
the computer running it. It is not part of the Android APK.

## Run locally

```bash
cd web
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Open `http://127.0.0.1:5000`. The development server binds only to loopback;
do not expose it to a LAN or the public internet. The URL guard currently
allows HTTPS links from YouTube, TikTok, Instagram, Facebook, and X/Twitter
domains and rejects non-global DNS answers for the submitted hostname. Generic
shorteners are not resolved by this web server. This preflight does **not**
validate or pin every redirect, CDN, or manifest request yt-dlp makes while
extracting media. It is defense-in-depth, not a substitute for an outbound
firewall or a hardened network sandbox.

The page first inspects a link and displays the safe, downloadable formats
reported by yt-dlp for that media item. The selector uses server-cached format
IDs with a short expiry; client input is never passed through as yt-dlp's
format-expression language. A video-only stream may need ffmpeg to merge its
audio track. Platform support, quality and availability depend on the source
and yt-dlp extractors; this does not mean every website or every resolution is
supported.

Downloads are stored under `/tmp/opencode/vidnest-web-downloads/` by default
(override with `VIDNEST_DOWNLOAD_DIR`) under random names. Orphaned temporary
job folders are removed at startup. The tool accepts one download at a time and
requests a per-file cap of about 1 GB; streaming sources may temporarily exceed
the cap until yt-dlp reports progress, but oversized output is rejected before
it is published. yt-dlp's cache is disabled. The tool does not persist
credentials or cookies. For internet-facing use, build a separate authenticated
service with a production WSGI server, strict egress controls and per-user
quotas; this local utility is not intended for that purpose.

## Tests

```bash
python -m unittest discover -s tests -v
```
