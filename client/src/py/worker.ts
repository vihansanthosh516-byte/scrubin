/// <reference lib="webworker" />
// Runs both Python engines (real-time OR + classic multiple-choice core) in the browser with Pyodide.
// Page <-> worker protocol: requests {id, op, ...} get {id, result} or {id, error}; the worker also
// pushes {type:"status"|"ws", ...} events.
import glue from "./browser_api.py?raw";

const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/";
const ctx = self as unknown as DedicatedWorkerGlobalScope;

let py: any = null;
let booting: Promise<void> | null = null;

// ---------------------------------------------------------------- IndexedDB (case rows)
const DB_NAME = "scrubin-or";
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore("cases", { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbAll(): Promise<any[]> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const r = db.transaction("cases").objectStore("cases").getAll();
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  } catch {
    return [];
  }
}
async function idbPut(row: any) {
  try {
    const db = await openDb();
    db.transaction("cases", "readwrite").objectStore("cases").put(row);
  } catch {
    /* storage unavailable (private window): the case still works, it just isn't kept */
  }
}
async function idbDel(id: string) {
  try {
    const db = await openDb();
    db.transaction("cases", "readwrite").objectStore("cases").delete(id);
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------- boot
function status(stage: string) {
  ctx.postMessage({ type: "status", stage });
}

async function boot() {
  status("Loading the simulator…");
  const { loadPyodide } = await import(/* @vite-ignore */ PYODIDE_URL + "pyodide.mjs");
  py = await loadPyodide({ indexURL: PYODIDE_URL });
  status("Loading medical models…");
  await py.loadPackage(["pydantic", "pyyaml", "fastapi", "httpx"]);
  const [engine, core] = await Promise.all([fetch("/py/engine.json").then((r) => r.json()), fetch("/py/core.json").then((r) => r.json())]);
  for (const bundle of [engine, core] as Record<string, string>[]) {
    for (const [p, text] of Object.entries(bundle)) {
      const full = "/app/" + p;
      py.FS.mkdirTree(full.slice(0, full.lastIndexOf("/")));
      py.FS.writeFile(full, text);
    }
  }
  py.runPython(`import sys\nsys.path.insert(0, "/app")`);
  py.globals.set("js_emit", (s: string) => ctx.postMessage(JSON.parse(s)));
  py.globals.set("js_put", (s: string) => {
    const row = JSON.parse(s);
    void idbPut(row);
    ctx.postMessage({ type: "persist", row });
  });
  py.globals.set("js_del", (id: string) => {
    void idbDel(id);
    ctx.postMessage({ type: "deleted", id });
  });
  py.runPython(glue);
  py.globals.get("rt_load")(JSON.stringify(await idbAll()));
  status("ready");
}

function ensure(): Promise<void> {
  if (!booting) {
    booting = boot().catch((e) => {
      booting = null;
      status("error:" + String(e));
      throw e;
    });
  }
  return booting;
}

// ---------------------------------------------------------------- requests
ctx.onmessage = async (ev: MessageEvent) => {
  const { id, op } = ev.data as { id: number; op: string; [k: string]: any };
  try {
    await ensure();
    const g = (n: string) => py.globals.get(n);
    let result: unknown;
    if (op === "init") result = true;
    else if (op === "core") result = JSON.parse(g("core_call")(ev.data.method, ev.data.path, ev.data.body ?? null, ev.data.query ?? null));
    else if (op === "api") result = JSON.parse(await g("api_call")(ev.data.method, ev.data.path, ev.data.body ?? null, ev.data.query ?? null));
    else if (op === "import_row") result = g("rt_import")(ev.data.row);
    else if (op === "ws_open") result = await g("ws_open")(ev.data.caseId);
    else if (op === "ws_msg") result = await g("ws_msg")(ev.data.caseId, ev.data.msg);
    else if (op === "ws_close") result = g("ws_close")(ev.data.caseId);
    else throw new Error("unknown op " + op);
    ctx.postMessage({ id, result: result ?? null });
  } catch (e) {
    ctx.postMessage({ id, error: String(e) });
  }
};
