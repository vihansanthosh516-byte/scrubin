# Simulators in the browser

Both Python engines run on the user's own device with [Pyodide](https://pyodide.org) (Python compiled to
WebAssembly) in a Web Worker, so the site needs no simulation server:

| Mode | Python source | Browser side |
|---|---|---|
| Real-time OR (`/simulation`, `/or/*`) | `engine/scrubin_engine` | `engine/client.ts` talks to the worker (same API the old HTTP/WebSocket server had) |
| Classic multiple choice (`/simulation/classic`) | `vendor/scrubin-core` (copy of the Scrubin-Core repo, see `CORE_COMMIT.txt`) | `localApi.ts` wraps `window.fetch` and answers `/api/sim/*` and `/api/scenarios*` |

- `scripts/pack-python.mjs` bundles the sources into `client/public/py/*.json` (runs before `dev` and `build`).
- `worker.ts` loads Pyodide from the jsDelivr CDN (about 10 MB over the wire (brotli) the first time, then cached), mounts the bundles,
  and runs `browser_api.py`, which replaces the FastAPI servers. Case records are kept in IndexedDB.
- Things that need a secret stay on the server, as Vercel functions in `/api`: `llm` and `stt` (free-text and voice orders),
  `evaluate` (AI attending notes), `auth/*` (sign-in and sign-up).
- A link with `?engine=https://<name>.trycloudflare.com` still points the real-time OR at a remote engine (testing).
  `VITE_REMOTE_SIM=1` / `VITE_REMOTE_API=1` / `VITE_ENGINE_MODE=remote` restore the old server behaviour.
- Smoke test: `npm run test:browser-engine` (Node 20+).
- To update the classic core: copy the new sources into `vendor/scrubin-core` (the three top-level modules plus `scrubin/`,
  without tests) and update `CORE_COMMIT.txt`.
