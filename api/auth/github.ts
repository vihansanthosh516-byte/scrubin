import { jsonBody, type Req, type Res } from "../_lib.js";

export default async function handler(req: Req, res: Res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const { code } = jsonBody(req);
    const client_id = process.env.VITE_GITHUB_CLIENT_ID;
    const client_secret = process.env.GITHUB_CLIENT_SECRET;
    if (!client_id || !client_secret) throw new Error("GitHub credentials not configured");
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ client_id, client_secret, code }),
    });
    const access_token = ((await tokenResponse.json()) as any).access_token;
    if (!access_token) throw new Error("Failed to obtain access token from GitHub");
    const u = (await (await fetch("https://api.github.com/user", { headers: { Authorization: `token ${access_token}`, Accept: "application/json" } })).json()) as any;
    res.status(200).json({ user: { id: String(u.id), name: u.name || u.login, login: u.login, avatar_url: u.avatar_url, email: u.email } });
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message || e) });
  }
}
