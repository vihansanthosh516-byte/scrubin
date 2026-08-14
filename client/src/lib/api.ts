// Centralized API client for ScrubIn Frontend
// -------------------------------------------------------------------
// All fetch calls go through this layer so the UI never uses raw fetch.
// It returns JSON responses and throws on non‑2xx status.
// -------------------------------------------------------------------

// Base origin for the API. Empty string = same-origin (dev: Vite proxies
// /api to the Express server; Cloudflare Pages: set VITE_API_URL to the
// Docker-hosted API, e.g. https://api.yourdomain.com). VITE_APP_URL is kept
// as a legacy alias.
export const API_BASE = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_APP_URL ||
  ""
).replace(/\/+$/, "");

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const resp = await fetch(url, {
    credentials: "include", // needed for httpOnly cookies
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`API error ${resp.status}: ${err}`);
  }
  return (await resp.json()) as T;
}
