# ScrubIn OR engine for a Hugging Face Space (SDK: Docker). Copy this file and the engine/ folder
# into the root of the Space repository (see README.md next to this file).
FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1 PORT=7860
# Spaces run as user id 1000
RUN useradd -m -u 1000 user
WORKDIR /app
COPY --chown=user engine/pyproject.toml ./
COPY --chown=user engine/scrubin_engine ./scrubin_engine
RUN pip install .
USER user
EXPOSE 7860
CMD ["sh", "-c", "uvicorn scrubin_engine.api.app:app --host 0.0.0.0 --port ${PORT:-7860} --proxy-headers --forwarded-allow-ips='*'"]
