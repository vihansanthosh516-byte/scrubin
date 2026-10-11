import { jsonBody, type Req, type Res } from "../_lib.js";

export default async function handler(req: Req, res: Res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const { code, redirect_uri } = jsonBody(req);
    const client_id = process.env.VITE_GOOGLE_CLIENT_ID;
    const client_secret = process.env.GOOGLE_CLIENT_SECRET;
    if (!client_id || !client_secret) throw new Error("Google credentials not configured");
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id, client_secret, redirect_uri: redirect_uri || `${process.env.VITE_APP_URL || "https://scrubin.vercel.app"}/signin`, grant_type: "authorization_code" }),
    });
    const access_token = ((await tokenResponse.json()) as any).access_token;
    if (!access_token) throw new Error("Failed to obtain access token from Google");
    const u = (await (await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { Authorization: `Bearer ${access_token}` } })).json()) as any;
    res.status(200).json({ user: { id: u.id, name: u.name, login: String(u.email).split("@")[0], avatar_url: u.picture, email: u.email } });
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message || e) });
  }
}
