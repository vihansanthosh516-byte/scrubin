// Sends crashes from real users' browsers to /api/log (shows up in the Vercel function logs as "client-error").
// Only the message, stack and page path are sent. At most a handful per visit, and never in development.
const sent = new Set<string>();
let count = 0;

export function reportError(kind: string, err: unknown) {
  if (import.meta.env.DEV || count >= 8) return;
  const e = err as { message?: string; stack?: string } | string | undefined;
  const message = typeof e === "string" ? e : e?.message || String(e);
  const key = kind + message;
  if (sent.has(key)) return;
  sent.add(key);
  count++;
  try {
    const body = JSON.stringify({ kind, message, stack: typeof e === "object" ? e?.stack : undefined, path: window.location.pathname, release: import.meta.env.VITE_COMMIT || "" });
    if (!navigator.sendBeacon?.("/api/log", new Blob([body], { type: "application/json" }))) {
      void fetch("/api/log", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
    }
  } catch {
    /* reporting must never break the page */
  }
}

export function installErrorReporting() {
  window.addEventListener("error", (ev) => reportError("error", ev.error ?? ev.message));
  window.addEventListener("unhandledrejection", (ev) => reportError("promise", ev.reason));
}
