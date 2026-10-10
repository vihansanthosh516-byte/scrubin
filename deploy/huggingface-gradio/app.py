# Hugging Face "Gradio" Spaces just run app.py and expose port 7860.
# We don't use Gradio: this starts the ScrubIn engine (FastAPI + WebSockets) on that port.
import os

import uvicorn

from scrubin_engine.api.app import app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "7860")), proxy_headers=True, forwarded_allow_ips="*")
