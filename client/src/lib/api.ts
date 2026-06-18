// Centralized API client for ScrubIn Frontend
// -------------------------------------------------------------------
// All fetch calls go through this layer so the UI never uses raw fetch.
// It returns JSON responses and throws on non‑2xx status.
// -------------------------------------------------------------------

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const base = import.meta.env.VITE_APP_URL || ""; // empty for relative calls
  const url = `${base}${endpoint}`;
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
