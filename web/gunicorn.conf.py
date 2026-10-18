"""gunicorn configuration for the VidNest web companion container."""

import os

bind = f"0.0.0.0:{os.environ.get('PORT', '5000')}"
# One worker keeps the probe cache, CSRF token and rate limiter shared. The
# heavy lifting happens in yt-dlp/ffmpeg subprocesses; threads keep the health
# endpoint and page loads responsive while one download streams.
workers = 1
threads = int(os.environ.get("VIDNEST_THREADS", "8"))
worker_class = "gthread"
timeout = int(os.environ.get("VIDNEST_TIMEOUT", "1800"))
graceful_timeout = 30
keepalive = 5
max_requests = 500
max_requests_jitter = 50
accesslog = "-"
errorlog = "-"
loglevel = "info"
