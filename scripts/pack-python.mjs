// Packs the Python sources that run in the browser (Pyodide) into JSON bundles:
//   client/public/py/engine.json  <- engine/scrubin_engine  (real-time OR engine)
//   client/public/py/core.json    <- vendor/scrubin-core    (classic multiple-choice engine)
// Each bundle is { "relative/path.py": "file text", ... }. Run before vite (see package.json).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KEEP = /\.(py|yaml|yml|json)$/;

function collect(dir, base, out, skip = new Set(["__pycache__", "tests", ".venv", "node_modules"])) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(e.name) || e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) collect(full, base, out, skip);
    else if (KEEP.test(e.name)) out[path.relative(base, full).split(path.sep).join("/")] = fs.readFileSync(full, "utf8");
  }
}

function pack(name, entries) {
  const out = {};
  for (const [dir, prefix] of entries) {
    const tmp = {};
    collect(path.join(root, dir), path.join(root, dir), tmp);
    for (const [k, v] of Object.entries(tmp)) out[prefix + k] = v;
  }
  const dest = path.join(root, "client", "public", "py", name);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, JSON.stringify(out));
  console.log(`packed ${name}: ${Object.keys(out).length} files, ${(fs.statSync(dest).size / 1e6).toFixed(2)} MB`);
}

pack("engine.json", [["engine/scrubin_engine", "scrubin_engine/"]]);
// vendor/scrubin-core holds a "scrubin/" package plus three top-level modules.
pack("core.json", [["vendor/scrubin-core", ""]]);
