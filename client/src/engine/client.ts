import { useCallback, useEffect, useRef, useState } from "react";
import { py } from "@/py/runtime";
import { ensureCaseLocal, listCloudCases } from "./cloudCases";
import type { Action, CaseState, Catalog, CommsMessage, CreateCaseResponse, Debrief, ReplayData, Role, SavedCase } from "./types";

// By default the Python engine runs inside the browser (Pyodide, see src/py). A remote engine is used only
// when a link carries ?engine=https://<name>.trycloudflare.com (testing against a developer machine) or the
// build sets VITE_ENGINE_MODE=remote together with VITE_ENGINE_URL.
function tunnelOverride(): string {
  try {
    const q = new URLSearchParams(window.location.search).get("engine");
    if (q && /^https:\/\/[a-z0-9-]+\.trycloudflare\.com\/?$/i.test(q)) sessionStorage.setItem("scrubin-engine", q.replace(/\/$/, ""));
    return sessionStorage.getItem("scrubin-engine") ?? "";
  } catch {
    return "";
  }
}
const ENGINE_ORIGIN =
  tunnelOverride() || (import.meta.env.VITE_ENGINE_MODE === "remote" ? (import.meta.env.VITE_ENGINE_URL as string | undefined)?.replace(/\/$/, "") ?? "" : "");
const LOCAL = !ENGINE_ORIGIN;

function httpUrl(path: string) {
  return `${ENGINE_ORIGIN}/engine${path}`;
}

function wsUrl(path: string) {
  if (ENGINE_ORIGIN) return `${ENGINE_ORIGIN.replace(/^http/, "ws")}/engine${path}`;
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}/engine${path}`;
}

async function localRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const url = new URL(path, "http://local");
  const method = (init?.method || "GET").toUpperCase();
  // Cases of a signed-in user are mirrored to their account: merge the cloud list, and pull a case this device lacks.
  if (method === "GET" && /^\/users\/[^/]+\/cases$/.test(url.pathname)) {
    const [local, remote] = await Promise.all([py.api(method, url.pathname, undefined, {}), listCloudCases()]);
    const byId = new Map<string, any>((local.json as any[]).map((r) => [r.id, r]));
    for (const r of remote) {
      const mine = byId.get(r.id);
      if (!mine || Number(r.updated_at) > Number(mine.updated_at)) byId.set(r.id, { ...(mine ?? {}), ...r });
    }
    return [...byId.values()].sort((a, b) => Number(b.updated_at) - Number(a.updated_at)) as T;
  }
  const m = url.pathname.match(/^\/cases\/([^/]+)\/(resume|replay|debrief)$/);
  if (m) await ensureCaseLocal(m[1]);
  const body = init?.body && typeof init.body === "string" ? JSON.parse(init.body) : undefined;
  const r = await py.api(method, url.pathname, body, Object.fromEntries(url.searchParams.entries()));
  if (r.status >= 400) throw new Error(`${r.status} ${JSON.stringify(r.json)}`);
  return r.json as T;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (LOCAL) return localRequest<T>(path, init);
  const res = await fetch(httpUrl(path), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

/** The free production host sleeps when idle; keep pinging /health for up to
 *  `timeoutMs` while it wakes. Resolves true once it answers. */
export async function wakeEngine(timeoutMs = 90_000): Promise<boolean> {
  if (LOCAL) {
    // No timeout: a slow connection just takes longer to download Python (about 15 MB the first time); only a real failure ends the wait.
    try {
      await py.init();
      return true;
    } catch {
      return false;
    }
  }
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 10_000);
      const res = await fetch(httpUrl("/health"), { signal: ctrl.signal });
      clearTimeout(t);
      if (res.ok) return true;
    } catch {
      // still waking
    }
    if (!ENGINE_ORIGIN) return false; // local dev: no cold starts, fail fast
    await new Promise((r) => setTimeout(r, 3000));
  }
  return false;
}

export const engineApi = {
  health: () => request<{ ok: boolean; llm: boolean }>("/health"),
  catalog: () => request<Catalog>("/catalog"),
  createCase: (scenario: string, role: Role, userId?: string, seed?: number) =>
    request<CreateCaseResponse>("/cases", { method: "POST", body: JSON.stringify({ scenario, role, seed, user_id: userId }) }),
  resumeCase: (caseId: string) => request<CreateCaseResponse>(`/cases/${caseId}/resume`, { method: "POST" }),
  listCases: (userId: string) => request<SavedCase[]>(`/users/${encodeURIComponent(userId)}/cases`),
  deleteCase: (caseId: string) => request<{ ok: boolean }>(`/cases/${caseId}`, { method: "DELETE" }),
  replay: (caseId: string, everyS = 5) => request<ReplayData>(`/cases/${caseId}/replay?every_s=${everyS}`),
  debrief: (caseId: string, end = false) => request<Debrief>(`/cases/${caseId}/debrief${end ? "?end=true" : ""}`),
  transcribe: async (audio: Blob): Promise<string> => {
    if (LOCAL) {
      // The site's own /api/stt function takes the raw recording and holds the key.
      const r = await fetch("/api/stt", { method: "POST", headers: { "Content-Type": audio.type || "audio/webm" }, body: audio });
      if (!r.ok) throw new Error(await r.text());
      return (await r.json()).text as string;
    }
    const form = new FormData();
    form.append("audio", audio, "speech.webm");
    const res = await fetch(httpUrl("/stt"), { method: "POST", body: form });
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()).text as string;
  },
};

export interface OrConnection {
  state: CaseState | null;
  comms: CommsMessage[];
  connected: boolean;
  lastParse: { text: string; ok: boolean; source: string; clarification: string | null } | null;
  act: (action: Action) => void;
  say: (text: string) => void;
  control: (c: { speed?: number; paused?: boolean }) => void;
}

/** Live connection to one engine case over WebSocket, with reconnect. */
export function useOrConnection(caseId: string | null): OrConnection {
  const [state, setState] = useState<CaseState | null>(null);
  const [comms, setComms] = useState<CommsMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastParse, setLastParse] = useState<OrConnection["lastParse"]>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pendingText = useRef<Map<number, string>>(new Map());
  const outbox = useRef<unknown[]>([]);
  const lastTick = useRef(0);
  const localReady = useRef(false);
  const caseIdRef = useRef<string | null>(null);
  caseIdRef.current = caseId;
  const refCounter = useRef(1);

  useEffect(() => {
    // A new case starts with a clean log — the previous case's lines don't carry over.
    setComms([]);
    setState(null);
    setLastParse(null);
    lastTick.current = 0;
    outbox.current = [];
    if (!caseId) return;
    let closed = false;
    let retry: number | undefined;
    const seen = new Set<number>();

    const handle = (msg: any) => {
      if (msg.type === "state") {
        if (msg.tick < lastTick.current) {
          // The engine restarted and rebuilt the case: start the transcript over from its copy.
          seen.clear();
          setComms([]);
        }
        lastTick.current = msg.tick;
        // The engine leaves out the step list and instruments when they haven't changed.
        setState((prev) => {
          const next = msg as CaseState;
          if (next.surgery && prev?.surgery && !next.surgery.tasks) {
            return { ...next, surgery: { ...next.surgery, tasks: prev.surgery.tasks, instruments: prev.surgery.instruments } };
          }
          return next;
        });
        const fresh = (msg.comms as CommsMessage[]).filter((c) => !seen.has(c.id));
        if (fresh.length) {
          fresh.forEach((c) => seen.add(c.id));
          setComms((prev) => [...prev, ...fresh].slice(-300));
        }
      } else if (msg.type === "parsed") {
        const text = pendingText.current.get(msg.ref) ?? "";
        pendingText.current.delete(msg.ref);
        setLastParse({ text, ok: !!msg.result?.ok, source: msg.result?.source ?? "", clarification: msg.result?.clarification ?? null });
      }
    };

    // In-browser engine: the Python worker pushes the same messages a WebSocket would.
    if (LOCAL) {
      localReady.current = false;
      py.wsOpen(caseId, handle)
        .then(() => {
          if (closed) return;
          localReady.current = true;
          setConnected(true);
          outbox.current.splice(0).forEach((p) => void py.wsSend(caseId, p));
        })
        .catch(() => setConnected(false));
      return () => {
        closed = true;
        localReady.current = false;
        void py.wsClose(caseId, handle);
      };
    }

    const connect = () => {
      const ws = new WebSocket(wsUrl(`/cases/${caseId}/ws`));
      wsRef.current = ws;
      ws.onopen = () => {
        setConnected(true);
        // Orders given while the line was down go out now instead of vanishing.
        const queued = outbox.current.splice(0);
        queued.forEach((p) => ws.send(JSON.stringify(p)));
      };
      ws.onclose = () => {
        setConnected(false);
        if (!closed) retry = window.setTimeout(connect, 1500);
      };
      ws.onmessage = (ev) => handle(JSON.parse(ev.data));
    };
    connect();
    return () => {
      closed = true;
      window.clearTimeout(retry);
      wsRef.current?.close();
    };
  }, [caseId]);

  const send = useCallback((payload: unknown) => {
    if (LOCAL) {
      if (localReady.current && caseIdRef.current) void py.wsSend(caseIdRef.current, payload);
      else if (outbox.current.length < 20) outbox.current.push(payload);
      return;
    }
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
    else if (outbox.current.length < 20) outbox.current.push(payload);
  }, []);

  const act = useCallback((action: Action) => send({ type: "action", action }), [send]);
  const say = useCallback(
    (text: string) => {
      const ref = refCounter.current++;
      pendingText.current.set(ref, text);
      send({ type: "utterance", text, ref });
    },
    [send],
  );
  const control = useCallback((c: { speed?: number; paused?: boolean }) => send({ type: "control", ...c }), [send]);

  return { state, comms, connected, lastParse, act, say, control };
}
