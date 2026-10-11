// Real-time OR cases saved to the signed-in user's account (Supabase table or_cases), so a case started on one
// device can be resumed or replayed on another. The browser keeps its own copy (IndexedDB) and pushes changes here.
// Auth: the caller's Supabase access token (Authorization: Bearer ...) is verified server-side; the row's
// user_id is always the verified user, never what the page claims.
import { createClient } from "@supabase/supabase-js";
import { allow, jsonBody, type Req, type Res } from "./_lib.js";

export const config = { api: { bodyParser: { sizeLimit: "4mb" } } };

const LIST_COLUMNS = "id,scenario,role,seed,tick,sim_t,status,outcome,score,created_at,updated_at";

function admin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export default async function handler(req: Req, res: Res) {
  const db = admin();
  if (!db) return res.status(503).json({ error: "case sync is not configured" });
  if (!allow(req, "cases", 120, 60_000)) return res.status(429).json({ error: "Too many requests" });

  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "sign in to sync cases" });
  const { data: auth, error: authError } = await db.auth.getUser(token);
  if (authError || !auth?.user) return res.status(401).json({ error: "invalid session" });
  const uid = auth.user.id;

  try {
    const id = typeof req.query?.id === "string" ? req.query.id : "";
    if (req.method === "GET") {
      if (id) {
        const { data, error } = await db.from("or_cases").select("*").eq("id", id).eq("user_id", uid).maybeSingle();
        if (error) throw error;
        return data ? res.status(200).json(data) : res.status(404).json({ error: "case not found" });
      }
      const { data, error } = await db.from("or_cases").select(LIST_COLUMNS).eq("user_id", uid).order("updated_at", { ascending: false }).limit(50);
      if (error) throw error;
      return res.status(200).json(data ?? []);
    }
    if (req.method === "POST" || req.method === "PUT") {
      const row = jsonBody(req);
      if (!row?.id || typeof row.id !== "string" || row.id.length > 64 || !row.scenario || !row.role || typeof row.seed !== "number") {
        return res.status(400).json({ error: "bad case row" });
      }
      const { data: existing } = await db.from("or_cases").select("user_id,updated_at").eq("id", row.id).maybeSingle();
      if (existing && existing.user_id !== uid) return res.status(403).json({ error: "not your case" });
      if (existing && Number(existing.updated_at) > Number(row.updated_at)) return res.status(200).json({ ok: true, ignored: "older than the saved copy" });
      const body = {
        id: row.id, user_id: uid, scenario: String(row.scenario), role: String(row.role), seed: row.seed,
        tick: Number(row.tick) || 0, sim_t: Number(row.sim_t) || 0, status: String(row.status || "pre_induction"), outcome: row.outcome ?? null,
        score: row.score ?? null, log: Array.isArray(row.log) ? row.log : [], debrief: row.debrief ?? null,
        created_at: Number(row.created_at) || Date.now() / 1000, updated_at: Number(row.updated_at) || Date.now() / 1000,
      };
      const { error } = await db.from("or_cases").upsert(body, { onConflict: "id" });
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    if (req.method === "DELETE") {
      if (!id) return res.status(400).json({ error: "id required" });
      const { error } = await db.from("or_cases").delete().eq("id", id).eq("user_id", uid);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: "method not allowed" });
  } catch (e: any) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
