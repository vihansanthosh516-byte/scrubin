import type { Req, Res } from "./_lib.js";

export default function handler(_req: Req, res: Res) {
  res.status(200).json({ ok: true, core: "browser", llm: !!process.env.GROQ_API_KEY });
}
