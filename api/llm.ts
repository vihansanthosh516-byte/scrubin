// Proxy for the in-browser real-time engine's language-model calls (free-text orders). The API keys stay
// here; the page only sends {provider, payload}. Only the models the engine uses are allowed.
import { allow, jsonBody, type Req, type Res } from "./_lib.js";

const GROQ_MODELS = new Set(["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"]);
const OPENROUTER_MODELS = new Set(["nvidia/nemotron-3-super-120b-a12b:free"]);

export default async function handler(req: Req, res: Res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!allow(req, "llm", 30, 60_000)) return res.status(429).json({ error: "Too many requests" });
  const { provider, payload } = jsonBody(req);
  if (!payload || typeof payload !== "object" || JSON.stringify(payload).length > 40_000) return res.status(400).json({ error: "bad payload" });
  const isOr = provider === "openrouter";
  const key = isOr ? process.env.OPENROUTER_API_KEY : process.env.GROQ_API_KEY;
  if (!key) return res.status(503).json({ error: "language model not configured" });
  if (!(isOr ? OPENROUTER_MODELS : GROQ_MODELS).has(payload.model)) return res.status(400).json({ error: "model not allowed" });
  payload.max_tokens = Math.min(Number(payload.max_tokens) || 1500, 2000);
  try {
    const up = await fetch(isOr ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    res.status(up.status).setHeader("Content-Type", "application/json").send(await up.text());
  } catch (e: any) {
    res.status(502).json({ error: "upstream failed", detail: String(e?.message || e) });
  }
}
