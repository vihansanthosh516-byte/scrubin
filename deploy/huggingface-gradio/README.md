# Hugging Face Space without Docker (Gradio SDK workaround)

Use this only if the Docker SDK is not available to you. Same steps as `../huggingface/README.md`, with these differences:

- When creating the Space choose SDK **Gradio** (not Docker).
- In step 3 copy these files instead:
```bash
git clone https://huggingface.co/spaces/<your-username>/scrubin-or-engine hf-space
cd hf-space
cp -r /path/to/scrubin/engine ./engine
cp /path/to/scrubin/deploy/huggingface-gradio/app.py ./app.py
cp /path/to/scrubin/deploy/huggingface-gradio/requirements.txt ./requirements.txt
cp /path/to/scrubin/deploy/huggingface-gradio/SPACE_README.md ./README.md
rm -rf engine/tests engine/.venv engine/scrubin_engine.egg-info engine/data
git add . && git commit -m "ScrubIn engine" && git push
```
- Secrets, `ALLOWED_ORIGINS`, the health check and the Vercel `VITE_ENGINE_URL` step are the same.
- The Space may show a Gradio UI error page at `/`; that is fine. The engine lives under `/engine/...`.
