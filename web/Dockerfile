# VidNest web companion — production image (Flask + yt-dlp + ffmpeg).
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    VIDNEST_DOWNLOAD_DIR=/tmp/vidnest-downloads

RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --system --uid 1001 --create-home vidnest

WORKDIR /srv/vidnest
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py gunicorn.conf.py wsgi.py ./
COPY static ./static

USER vidnest
EXPOSE 5000
CMD ["gunicorn", "--config", "gunicorn.conf.py", "wsgi:app"]
