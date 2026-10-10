# Run the OR engine free on Hugging Face Spaces

No card needed. A Docker Space gives about 2 vCPU and 16 GB RAM for free. It sleeps after a while idle and wakes on the next visit.

## 1. Create the Space
1. Sign up / log in at https://huggingface.co.
2. New > Space. Name: `scrubin-or-engine`. SDK: **Docker** (blank). Visibility: **Public** (private Spaces can't be called from a browser without a token). Hardware: **CPU basic (free)**. Create.
3. Your engine URL will be `https://<your-username>-scrubin-or-engine.hf.space`.

## 2. Add your secrets
Space > Settings > **Variables and secrets** > New secret, for each:
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`
and a variable `ALLOWED_ORIGINS` = `https://scrubin.vercel.app`.

## 3. Push the engine into the Space
```bash
git clone https://huggingface.co/spaces/<your-username>/scrubin-or-engine hf-space
cd hf-space
cp -r /path/to/scrubin/engine ./engine
cp /path/to/scrubin/deploy/huggingface/Dockerfile ./Dockerfile
cp /path/to/scrubin/deploy/huggingface/SPACE_README.md ./README.md
rm -rf engine/tests engine/.venv engine/scrubin_engine.egg-info
git add . && git commit -m "ScrubIn engine" && git push
```
(Use a Hugging Face access token with write permission as the password when git asks.) The Space builds for a few minutes. Then:
```bash
curl https://<your-username>-scrubin-or-engine.hf.space/engine/health
```

## 4. Point the site at it
Vercel > scrubin > Settings > Environment Variables: `VITE_ENGINE_URL` = the `.hf.space` URL, then redeploy.

## Updating
Copy the changed `engine/` files into the Space repo, commit and push.
