// Generate branded placeholder thumbnails for every procedure in the registry.
// The Python core returns thumbnail: "/thumbnails/{id}.png" but no files exist —
// vite dev serves client/public at "/", so these land in client/public/thumbnails.
// Pure Node, no dependencies: writes real PNGs (IHDR/IDAT/IEND + CRC32).
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "client", "public", "thumbnails");

// ── Minimal PNG encoder ──────────────────────────────────────────────────────
let CRC_TABLE = null;
function crc32(buf) {
  if (!CRC_TABLE) {
    CRC_TABLE = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC_TABLE[n] = c;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePNG(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ── Brand palette ────────────────────────────────────────────────────────────
const CREAM = [0xfb, 0xf9, 0xf5, 0xff];
const CHARCOAL = [0x34, 0x32, 0x2d, 0xff];
const PALETTE = [
  [0xcc, 0x55, 0x3d, 0xff], // terracotta (brand)
  [0x2e, 0x6b, 0x4b, 0xff], // deep green
  [0xc2, 0x78, 0x20, 0xff], // amber
  [0x3a, 0x5a, 0x72, 0xff], // slate blue
  [0x6b, 0x3a, 0x72, 0xff], // plum
];
const W = 800, H = 600;

function hashId(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

function setPixel(buf, x, y, [r, g, b, a]) {
  const o = (y * W + x) * 4;
  buf[o] = r; buf[o + 1] = g; buf[o + 2] = b; buf[o + 3] = a;
}

function drawThumbnail(id) {
  const buf = Buffer.alloc(W * H * 4);
  const h = hashId(id);
  const accent = PALETTE[h % PALETTE.length];
  const accent2 = PALETTE[(h + 2) % PALETTE.length];

  for (let y = 0; y < H; y++) {
    const inTopBand = y < 200;
    const inBottomBand = y >= 500;
    for (let x = 0; x < W; x++) {
      let color = CREAM;
      if (x < 18) color = accent;                 // left edge stripe
      else if (inTopBand) color = CHARCOAL;       // header band
      else if (inBottomBand) color = accent;      // footer band
      setPixel(buf, x, y, color);
    }
  }

  // Header art: outer ring + inner dot + secondary dot (anti-aliased via supersample).
  const circles = [
    { cx: 380, cy: 140, r: 95, color: accent },
    { cx: 380, cy: 140, r: 48, color: CREAM },
    { cx: 640, cy: 62, r: 26, color: accent2 },
  ];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      for (const c of circles) {
        const dx = x - c.cx, dy = y - c.cy;
        if (dx * dx + dy * dy <= c.r * c.r) { setPixel(buf, x, y, c.color); break; }
      }
    }
  }
  return encodePNG(W, H, buf);
}

// ── Procedure registry (from GET /api/sim/procedures) ───────────────────────
const PROCS = [
  "appendectomy", "inguinal-hernia", "thyroidectomy", "carpal-tunnel-release",
  "cholecystectomy", "acl-reconstruction", "c-section", "total-knee-replacement",
  "total-hysterectomy", "sigmoid-colectomy", "lap-cholecystectomy", "radical-nephrectomy",
  "hip-replacement", "breast-lumpectomy", "tympanoplasty", "femoral-nail-fixation",
  "rotator-cuff-repair", "rhinoplasty", "parathyroidectomy", "cabg", "craniotomy",
  "spinal-fusion", "exploratory-laparotomy", "pulmonary-lobectomy", "whipple",
  "aaa-repair", "radical-prostatectomy", "esophagectomy", "hepatic-lobectomy",
  "lumbar-microdiscectomy", "cabg-offpump",
];

mkdirSync(OUT_DIR, { recursive: true });
for (const id of PROCS) {
  const png = drawThumbnail(id);
  const p = join(OUT_DIR, `${id}.png`);
  writeFileSync(p, png);
  console.log(`${id.padEnd(26)} ${png.length} bytes`);
}
console.log(`\nWrote ${PROCS.length} thumbnails → ${OUT_DIR}`);
