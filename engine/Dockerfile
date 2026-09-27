# ScrubIn real-time OR engine (FastAPI + WebSockets).
# Build from the engine/ folder:  docker build -t scrubin-or-engine engine
FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app
COPY pyproject.toml ./
COPY scrubin_engine ./scrubin_engine
RUN pip install .
# Hosts like Render set $PORT; default 8000 locally.
EXPOSE 8000
CMD ["sh", "-c", "uvicorn scrubin_engine.api.app:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers --forwarded-allow-ips='*'"]
