// Collects crashes from users' browsers into the Vercel function logs (Vercel dashboard, Logs, filter "client-error").
// No third-party service and no personal data: only the message, stack, page path and browser string.
import { allow, jsonBody, type Req, type Res } from "./_lib.js";

const cut = (v: unknown, n: number) => String(v ?? "").slice(0, n);

export default function handler(req: Req, res: Res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!allow(req, "log", 20, 60_000)) return res.status(429).json({ error: "Too many requests" });
  const b = jsonBody(req);
  console.error(
    "client-error " +
      JSON.stringify({ kind: cut(b.kind, 30), message: cut(b.message, 400), stack: cut(b.stack, 1500), path: cut(b.path, 120), ua: cut(req.headers["user-agent"], 160), release: cut(b.release, 20) }),
  );
  res.status(204).end();
}
