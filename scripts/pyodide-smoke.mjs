// Smoke test for the in-browser engines: loads Pyodide in Node, runs the same glue the browser worker runs
// (client/src/py/browser_api.py) and exercises the classic core and the real-time engine.
//   npm run pack:py && node scripts/pyodide-smoke.mjs      (needs Node 20+)
import { loadPyodide } from "pyodide";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
const R = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const t0 = Date.now();
const py = await loadPyodide();
await py.loadPackage(["pydantic", "pyyaml", "fastapi", "httpx"]);
for (const f of ["engine.json", "core.json"]) {
  const files = JSON.parse(fs.readFileSync(`${R}/client/public/py/${f}`, "utf8"));
  for (const [p, text] of Object.entries(files)) {
    const full = "/app/" + p; py.FS.mkdirTree(full.slice(0, full.lastIndexOf("/"))); py.FS.writeFile(full, text);
  }
}
py.runPython(`import sys; sys.path.insert(0, "/app")`);
const msgs = []; const rows = {};
py.globals.set("js_emit", (s) => { msgs.push(JSON.parse(s)); });
py.globals.set("js_put", (s) => { const r = JSON.parse(s); rows[r.id] = r; });
py.globals.set("js_del", (id) => { delete rows[id]; });
py.runPython(fs.readFileSync(`${R}/client/src/py/browser_api.py`, "utf8"));
console.log("ready", Date.now() - t0, "ms");
const g = (n) => py.globals.get(n);
const J = (s) => JSON.parse(s);
// core
let r = J(g("core_call")("POST", "/start", JSON.stringify({ procedure: "appendectomy", seed: 7 }), null)); console.log("core start", r.status, r.json.procedure_name);
const sid = r.json.session_id;
r = J(g("core_call")("POST", "/next", JSON.stringify({ session_id: sid }), null)); console.log("core next", r.status, r.json.tick);
r = J(g("core_call")("GET", "/procedures/search", null, JSON.stringify({ q: "hernia" }))); console.log("search", r.json.procedures.length);
// real-time
r = J(await g("api_call")("POST", "/cases", JSON.stringify({ scenario: "radical_prostatectomy", role: "surgeon", seed: 3, user_id: "u" }), null)); console.log("create", r.status, r.json.case_id);
const cid = r.json.case_id;
await g("ws_open")(cid);
await g("ws_msg")(cid, JSON.stringify({ type: "control", paused: false, speed: 10 }));
await new Promise((res) => setTimeout(res, 3000));
const states = msgs.filter((m) => m.data && m.data.type === "state");
console.log("state msgs", states.length, "last t", states.at(-1)?.data.t);
await g("ws_msg")(cid, JSON.stringify({ type: "utterance", text: "time out", ref: 1 }));
console.log("utterance parsed", JSON.stringify(msgs.filter((m) => m.data?.type === "parsed").at(-1)?.data).slice(0, 160));
r = J(await g("api_call")("GET", `/users/u/cases`, null, null)); console.log("list", r.json.map((x) => [x.scenario_name, x.status, Math.round(x.sim_t)]));
r = J(await g("api_call")("GET", `/cases/${cid}/debrief`, null, null)); console.log("debrief", r.status, r.json.score);
r = J(await g("api_call")("GET", `/cases/${cid}/replay`, null, JSON.stringify({ every_s: 5 }))); console.log("replay", r.status, r.json.frames?.length);
g("ws_close")(cid);
console.log("persisted rows", Object.keys(rows).length);
if (!rows[cid] || !states.length) { console.error("SMOKE FAILED"); process.exit(1); }
console.log("SMOKE OK");
process.exit(0);
