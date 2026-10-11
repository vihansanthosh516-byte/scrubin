// Page-side handle to the Pyodide worker (worker.ts). One worker serves the whole app.
type Pending = { resolve: (v: any) => void; reject: (e: Error) => void };

let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, Pending>();
const wsListeners = new Map<string, Set<(data: any) => void>>();
const statusListeners = new Set<(s: PyStatus) => void>();
const persistListeners = new Set<(ev: { row?: any; deletedId?: string }) => void>();

export type PyStatus = { stage: string; ready: boolean; error: string | null };
let current: PyStatus = { stage: "", ready: false, error: null };

function setStatus(stage: string) {
  current = stage === "ready" ? { stage: "Ready", ready: true, error: null } : stage.startsWith("error:") ? { stage: "", ready: false, error: stage.slice(6) } : { stage, ready: false, error: null };
  statusListeners.forEach((f) => f(current));
}

function get(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (ev: MessageEvent) => {
    const m = ev.data;
    if (m.type === "status") return setStatus(m.stage);
    if (m.type === "persist") return void persistListeners.forEach((f) => f({ row: m.row }));
    if (m.type === "deleted") return void persistListeners.forEach((f) => f({ deletedId: m.id }));
    if (m.type === "ws") return void wsListeners.get(m.case_id)?.forEach((f) => f(m.data));
    const p = pending.get(m.id);
    if (!p) return;
    pending.delete(m.id);
    if ("error" in m) p.reject(new Error(m.error));
    else p.resolve(m.result);
  };
  worker.onerror = (e) => setStatus("error:" + e.message);
  return worker;
}

function call<T = any>(msg: Record<string, unknown>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    get().postMessage({ id, ...msg });
  });
}

export const py = {
  /** Start loading Python (idempotent). Resolves when the engines are ready. */
  init: () => call({ op: "init" }),
  status: () => current,
  onStatus: (f: (s: PyStatus) => void) => {
    statusListeners.add(f);
    return () => void statusListeners.delete(f);
  },
  /** Called whenever a case row is saved or deleted inside the worker (used to sync cases to the account). */
  onPersist: (f: (ev: { row?: any; deletedId?: string }) => void) => {
    persistListeners.add(f);
    return () => void persistListeners.delete(f);
  },
  /** Put a case row fetched from the cloud into the worker (replacing any local copy). */
  importRow: (row: unknown) => call({ op: "import_row", row: JSON.stringify(row) }),
  /** Classic multiple-choice core call. Returns {status, json}. */
  core: (method: string, path: string, body?: unknown, query?: Record<string, string>) =>
    call<{ status: number; json: any }>({ op: "core", method, path, body: body === undefined ? null : JSON.stringify(body), query: query ? JSON.stringify(query) : null }),
  /** Real-time OR engine API call (same paths as the old /engine HTTP API). Returns {status, json}. */
  api: (method: string, path: string, body?: unknown, query?: Record<string, string>) =>
    call<{ status: number; json: any }>({ op: "api", method, path, body: body === undefined ? null : JSON.stringify(body), query: query ? JSON.stringify(query) : null }),
  wsOpen: (caseId: string, onData: (data: any) => void) => {
    let set = wsListeners.get(caseId);
    if (!set) wsListeners.set(caseId, (set = new Set()));
    set.add(onData);
    return call({ op: "ws_open", caseId });
  },
  wsSend: (caseId: string, msg: unknown) => call({ op: "ws_msg", caseId, msg: JSON.stringify(msg) }),
  wsClose: (caseId: string, onData: (data: any) => void) => {
    wsListeners.get(caseId)?.delete(onData);
    return call({ op: "ws_close", caseId });
  },
};
