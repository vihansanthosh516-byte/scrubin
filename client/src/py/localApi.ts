// Serves the classic multiple-choice simulation's /api/sim/* and /api/scenarios* calls from the
// in-browser Python core, so that mode needs no server. Everything else (sign-in, AI notes, ...)
// goes to the site's own /api functions as before.
import { py } from "./runtime";

const SIM_POST = new Set(["start", "next", "decide", "reset", "complicate", "tick", "complete"]);
const SAVES_KEY = "scrubin_sim_saves_v1";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function readSaves(): any[] {
  try {
    return JSON.parse(localStorage.getItem(SAVES_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeSaves(list: any[]) {
  try {
    localStorage.setItem(SAVES_KEY, JSON.stringify(list.slice(-50)));
  } catch {
    /* storage full / unavailable */
  }
}

async function handle(method: string, url: URL, init?: RequestInit): Promise<Response | null> {
  const p = url.pathname;
  const body = init?.body && typeof init.body === "string" ? JSON.parse(init.body) : undefined;
  const q = Object.fromEntries(url.searchParams.entries());

  let m = p.match(/^\/api\/sim\/(\w+)$/);
  if (m && method === "POST" && SIM_POST.has(m[1])) {
    const r = await py.core("POST", "/" + m[1], body ?? {});
    return json(r.status, r.json);
  }
  if (method === "GET" && p === "/api/sim/procedures") {
    const r = await py.core("GET", "/procedures");
    return json(r.status, r.json);
  }
  if (method === "GET" && p === "/api/scenarios") {
    const r = await py.core("GET", "/scenarios");
    return json(r.status, r.json);
  }
  m = p.match(/^\/api\/scenarios\/([\w-]+)$/);
  if (method === "GET" && m) {
    const r = await py.core("GET", "/scenarios/" + m[1]);
    return json(r.status, r.json);
  }
  if (method === "GET" && p === "/api/procedures/search") {
    const r = await py.core("GET", "/procedures/search", undefined, q);
    return json(r.status, r.json);
  }
  // Saved simulations: kept on this device.
  if (method === "POST" && p === "/api/sim/save") {
    const { session_id, procedure } = body ?? {};
    const id = `save_${Date.now()}`;
    const savedAt = new Date().toISOString();
    writeSaves([...readSaves(), { id, savedAt, session_id, procedure: procedure || "appendectomy", tick: 1, status: "active", state: { session_id, procedureId: procedure || "appendectomy", tick: 1 } }]);
    return json(200, { id, savedAt });
  }
  if (method === "GET" && p === "/api/sim/list") {
    return json(200, { saved: readSaves().map((s) => ({ id: s.id, session_id: s.session_id, procedure: s.procedure, last_saved: s.savedAt, tick: s.tick, status: s.status })) });
  }
  if (method === "POST" && p === "/api/sim/resume") {
    const saved = readSaves().find((s) => (body?.id ? s.id === body.id : s.session_id === body?.session_id));
    if (!saved) return json(404, { detail: "Saved simulation not found" });
    const r = await py.core("POST", "/start", { procedure: saved.state?.procedureId || saved.procedure || "appendectomy" });
    if (r.status === 200) return json(200, { ...saved.state, session_id: r.json.session_id, procedure: saved.procedure });
    return json(200, { session_id: saved.session_id || saved.id, procedure: saved.procedure, ...saved.state });
  }
  m = p.match(/^\/api\/sim\/([\w-]+)$/);
  if (method === "DELETE" && m) {
    const list = readSaves();
    const rest = list.filter((s) => s.session_id !== m![1] && s.id !== m![1]);
    if (rest.length === list.length) return json(404, { detail: "Saved simulation not found" });
    writeSaves(rest);
    return json(200, { success: true });
  }
  m = p.match(/^\/api\/replay\/([\w-]+)$/);
  if (method === "GET" && m) {
    const saved = readSaves().find((s) => s.id === m![1]);
    return json(200, { replay: saved ? saved.state : { id: m[1], status: "placeholder" } });
  }
  if (method === "GET" && p === "/api/health") return json(200, { ok: true, core: "browser" });
  return null;
}

/** Wrap window.fetch once. Set VITE_REMOTE_SIM=1 to keep using the server for these calls. */
export function installLocalApi() {
  if (import.meta.env.VITE_REMOTE_SIM === "1" || (window as any).__scrubinLocalApi) return;
  (window as any).__scrubinLocalApi = true;
  const real = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      const url = new URL(raw, window.location.origin);
      const apiPath = url.pathname.startsWith("/api/");
      if (apiPath) {
        const method = (init?.method || (typeof input !== "string" && !(input instanceof URL) ? input.method : "GET") || "GET").toUpperCase();
        const res = await handle(method, url, init);
        if (res) return res;
      }
    } catch (e) {
      return json(500, { error: String(e) });
    }
    return real(input, init);
  };
}
