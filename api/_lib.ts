// Small helpers shared by the serverless functions. Files starting with "_" are not routes.
export type Req = any;
export type Res = any;

const hits = new Map<string, number[]>();

/** Best-effort per-IP rate limit (per warm function instance). Returns true when the call is allowed. */
export function allow(req: Req, bucket: string, limit: number, windowMs: number): boolean {
  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "?").split(",")[0].trim();
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (list.length >= limit) {
    hits.set(key, list);
    return false;
  }
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return true;
}

export async function readBody(req: Req, maxBytes = 6_000_000): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > maxBytes) throw Object.assign(new Error("payload too large"), { status: 413 });
    chunks.push(Buffer.from(c));
  }
  return Buffer.concat(chunks);
}

export function jsonBody(req: Req): any {
  if (req.body && typeof req.body === "object") return req.body;
  try {
    return JSON.parse(req.body || "{}");
  } catch {
    return {};
  }
}
