"""WSGI entry point used by gunicorn in the production container."""

from app import app  # noqa: F401

application = app
