// Email/password sign-up: creates the Supabase user pre-confirmed through the service-role admin API
// so the browser can sign in immediately (the project requires email confirmation otherwise).
import { createClient } from "@supabase/supabase-js";
import { jsonBody, type Req, type Res } from "../_lib.js";

export default async function handler(req: Req, res: Res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(500).json({ error: "Signup is not configured on the server." });
  const { email, password, name, profession } = jsonBody(req);
  if (!email || !password || !name) return res.status(400).json({ error: "Missing required fields." });
  try {
    const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: name, profession } });
    if (error) {
      const message = error.message || "";
      if (error.status === 422 || /already.*(registered|exists)/i.test(message)) return res.status(409).json({ error: "Email is already registered. Please sign in." });
      return res.status(400).json({ error: message || "Could not create account." });
    }
    res.status(200).json({ user: { id: data.user.id, email: data.user.email } });
  } catch {
    res.status(500).json({ error: "Could not create account." });
  }
}
