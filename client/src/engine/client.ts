import { useCallback, useEffect, useRef, useState } from "react";
import type { Action, CaseState, Catalog, CommsMessage, CreateCaseResponse, Debrief, ReplayData, Role, SavedCase } from "./types";

// The Python engine is reached through the Vite proxy (/engine -> :8000) in
// development. In production set VITE_ENGINE_URL to the engine's origin.
const ENGINE_ORIGIN = (import.meta.env.VITE_ENGINE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

function httpUrl(path: string) {
  return `${ENGINE_ORIGIN}/engine${path}`;
}

function wsUrl(path: string) {
  if (ENGINE_ORIGIN) return `${ENGINE_ORIGIN.replace(/^http/, "ws")}/engine${path}`;
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}/engine${path}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
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
  const refCounter = useRef(1);

  useEffect(() => {
    // A new case starts with a clean log — the previous case's lines don't carry over.
    setComms([]);
    setState(null);
    setLastParse(null);
    if (!caseId) return;
    let closed = false;
    let retry: number | undefined;
    const seen = new Set<number>();

    const connect = () => {
      const ws = new WebSocket(wsUrl(`/cases/${caseId}/ws`));
      wsRef.current = ws;
      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        if (!closed) retry = window.setTimeout(connect, 1500);
      };
      ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.type === "state") {
          setState(msg as CaseState);
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
    };
    connect();
    return () => {
      closed = true;
      window.clearTimeout(retry);
      wsRef.current?.close();
    };
  }, [caseId]);

  const send = useCallback((payload: unknown) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
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
