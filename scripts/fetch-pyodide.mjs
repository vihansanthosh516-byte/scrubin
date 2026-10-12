// Self-hosts Pyodide: copies its runtime from node_modules/pyodide and downloads the Python wheels the app needs
// into client/public/pyodide/<version>/ so the page loads everything from its own origin (cached for a year,
// the version is in the path). Wheels are skipped if already present. The worker falls back to the jsDelivr CDN
// if these files are ever missing.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkgDir = path.join(root, "node_modules", "pyodide");
const version = JSON.parse(fs.readFileSync(path.join(pkgDir, "package.json"), "utf8")).version;
const out = path.join(root, "client", "public", "pyodide", `v${version}`);
fs.mkdirSync(out, { recursive: true });

const NEEDED = ["pydantic", "pyyaml", "fastapi", "httpx"];
const CORE = ["pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"];

for (const f of CORE) {
  const dest = path.join(out, f);
  if (!fs.existsSync(dest) || fs.statSync(dest).size !== fs.statSync(path.join(pkgDir, f)).size) fs.copyFileSync(path.join(pkgDir, f), dest);
}

const lock = JSON.parse(fs.readFileSync(path.join(pkgDir, "pyodide-lock.json"), "utf8")).packages;
const norm = (n) => n.toLowerCase().replace(/_/g, "-");
const byName = new Map(Object.keys(lock).map((k) => [norm(k), k]));
const wanted = new Set();
for (const n of NEEDED) {
  const key = byName.get(norm(n));
  const stack = [key];
  while (stack.length) {
    const k = stack.pop();
    if (!k || wanted.has(k) && k !== key) continue;
    wanted.add(k);
    for (const d of lock[k].depends || []) {
      const dk = byName.get(norm(d));
      if (dk && !wanted.has(dk)) stack.push(dk);
    }
  }
}

const base = `https://cdn.jsdelivr.net/pyodide/v${version}/full/`;
let fetched = 0;
for (const k of wanted) {
  const file = lock[k].file_name;
  const dest = path.join(out, file);
  if (fs.existsSync(dest)) continue;
  const res = await fetch(base + file);
  if (!res.ok) throw new Error(`download failed (${res.status}): ${base + file}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  fetched++;
}
fs.writeFileSync(path.join(root, "client", "public", "pyodide", "version.txt"), version);
const total = fs.readdirSync(out).reduce((n, f) => n + fs.statSync(path.join(out, f)).size, 0);
console.log(`pyodide v${version}: ${wanted.size} packages (${fetched} downloaded), ${(total / 1e6).toFixed(1)} MB in client/public/pyodide/v${version}/`);
