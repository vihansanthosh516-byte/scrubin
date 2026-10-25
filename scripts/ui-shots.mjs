#!/usr/bin/env node
// UI screenshot matrix: every route × light/dark × desktop/tablet/phone, signed in as the dev user.
//
//   node scripts/ui-shots.mjs [outDir] [--base http://127.0.0.1:3000] [--routes /,/procedures] [--widths 1440,390]
//                             [--themes light] [--signed-out /signin] [--session-js '...'] [--page-js '...'] [--axe]
//
// Needs a running dev client (`npx vite`) so `?devUser=1` can seed a signed-in user, and a Chromium
// binary (CHROME_PATH, else the newest Playwright-cached chromium). Talks to Chromium over the
// DevTools protocol with Node's built-in WebSocket, so it adds no dependencies.
// With --axe it also injects axe-core from jsDelivr and writes <outDir>/axe.json.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const outDir = path.resolve(args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--")) ?? "ui-shots");
const base = flag("base", "http://127.0.0.1:3000");
const routes = flag("routes", "/,/procedures,/learn,/leaderboard,/profile,/my-simulations,/or/cases,/simulation?proc=appendectomy,/terms,/does-not-exist").split(",");
const widths = flag("widths", "1440,1024,390").split(",").map(Number);
const themes = flag("themes", "light,dark").split(",");
const runAxe = args.includes("--axe");
// --session-js runs once after the dev user is seeded (e.g. to un-onboard them);
// --page-js runs on every page before the capture (e.g. to open a menu).
const sessionJs = flag("session-js", "");
const pageJs = flag("page-js", "");
const signedOut = flag("signed-out", "/signin").split(",").filter(Boolean);

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const cache = path.join(os.homedir(), ".cache/ms-playwright");
  const dirs = fs.existsSync(cache) ? fs.readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort() : [];
  for (const d of dirs.reverse()) {
    for (const sub of ["chrome-linux64/chrome", "chrome-linux/chrome"]) {
      const p = path.join(cache, d, sub);
      if (fs.existsSync(p)) return p;
    }
  }
  throw new Error("No Chromium found: set CHROME_PATH");
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function launch() {
  const userDir = fs.mkdtempSync(path.join(os.tmpdir(), "ui-shots-"));
  const proc = spawn(findChrome(), ["--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--remote-debugging-port=0", `--user-data-dir=${userDir}`, "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
  const wsUrl = await new Promise((resolve, reject) => {
    let buf = "";
    proc.stderr.on("data", (d) => {
      buf += d;
      const m = /DevTools listening on (ws:\/\/\S+)/.exec(buf);
      if (m) resolve(m[1]);
    });
    proc.on("exit", () => reject(new Error("Chromium exited: " + buf)));
  });
  const ws = new WebSocket(wsUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0;
  const pending = new Map();
  const listeners = [];
  ws.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method) listeners.forEach((l) => l(msg));
  });
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const mid = ++id;
      // Page scripts (--page-js) may wait for the app, e.g. the in-browser simulator booting.
      const timer = setTimeout(() => {
        pending.delete(mid);
        reject(new Error(`${method} timed out`));
      }, method === "Runtime.evaluate" ? 180000 : 20000);
      pending.set(mid, {
        resolve: (v) => (clearTimeout(timer), resolve(v)),
        reject: (e) => (clearTimeout(timer), reject(e)),
      });
      ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
    });
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const page = (method, params) => send(method, params, sessionId);
  await page("Page.enable");
  await page("Runtime.enable");
  const errors = [];
  listeners.push((m) => {
    // A confirm()/alert() would block the page forever: accept it and move on.
    if (m.sessionId === sessionId && m.method === "Page.javascriptDialogOpening") page("Page.handleJavaScriptDialog", { accept: true }).catch(() => {});
    if (m.sessionId === sessionId && m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails?.exception?.description ?? m.params.exceptionDetails?.text);
  });
  return {
    page,
    errors,
    async eval(expr) {
      const r = await page("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
      return r.result?.value;
    },
    async goto(url) {
      await page("Page.navigate", { url }).catch((e) => console.warn(url, e.message));
      for (let i = 0; i < 60; i++) {
        await sleep(250);
        if ((await this.eval("document.readyState").catch(() => "")) === "complete") break;
      }
      await sleep(1500); // let data fetches and entrance animations settle
    },
    close() {
      ws.close();
      proc.kill();
    },
  };
}

const slug = (r) => (r === "/" ? "home" : r.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "_"));

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const b = await launch();
  const axe = {};
  const shoot = async (route, theme, width) => {
    await b.page("Emulation.setDeviceMetricsOverride", { width, height: width < 600 ? 844 : 900, deviceScaleFactor: 1, mobile: width < 600 });
    await b.page("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }, { name: "prefers-color-scheme", value: theme }] });
    await b.eval(`localStorage.setItem("theme", ${JSON.stringify(theme)})`);
    await b.goto(base + route);
    if (pageJs) {
      await b.eval(pageJs);
      await sleep(600);
    }
    // Scroll through once so scroll-triggered (whileInView) sections render, then back to the top.
    await b.eval(`(async () => { const h = document.documentElement.scrollHeight; for (let y = 0; y < h; y += 400) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); await new Promise(r => setTimeout(r, 400)); })()`);
    // Capture beyond the viewport rather than resizing it, so 100vh sections keep their real height.
    const height = Math.min(6000, (await b.eval("document.documentElement.scrollHeight")) || 900);
    const { data } = await b.page("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width, height, scale: 1 } });
    const file = path.join(outDir, `${slug(route)}-${theme}-${width}.png`);
    fs.writeFileSync(file, Buffer.from(data, "base64"));
    if (runAxe && width === widths[0]) {
      await b.eval(`new Promise(r => { if (window.axe) return r(); const s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js"; s.onload = r; document.head.appendChild(s); })`);
      const res = await b.eval(`axe.run(document, { resultTypes: ["violations"] }).then(r => r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, sample: v.nodes[0]?.target })))`);
      axe[`${route} ${theme}`] = res;
    }
    console.log(path.relative(process.cwd(), file));
  };

  // Signed-out screens first, then seed the dev user and walk the signed-in routes.
  await b.goto(base + "/");
  await b.eval("localStorage.clear()");
  for (const route of signedOut)
    for (const theme of themes)
      for (const w of widths) await shoot(route, theme, w).catch((e) => console.warn(`skipped ${route} ${theme} ${w}: ${e.message}`));
  await b.goto(base + "/?devUser=1");
  if (sessionJs) await b.eval(sessionJs);
  for (const route of routes)
    for (const theme of themes)
      for (const w of widths) await shoot(route, theme, w).catch((e) => console.warn(`skipped ${route} ${theme} ${w}: ${e.message}`));

  if (runAxe) fs.writeFileSync(path.join(outDir, "axe.json"), JSON.stringify(axe, null, 2));
  if (b.errors.length) fs.writeFileSync(path.join(outDir, "errors.txt"), [...new Set(b.errors)].join("\n\n"));
  console.log(`${b.errors.length} page errors`);
  b.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
