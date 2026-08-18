// scripts/generate-icons.mjs — generates the app's PWA icons (a white "IKE" pixel wordmark
// on a slate background) as PNGs with no external dependencies. Re-run with
// `node scripts/generate-icons.mjs` after changing the design. These are placeholder icons;
// swap in real artwork when ready.
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");

const BG = [15, 23, 42]; // slate-900 #0F172A
const FG = [255, 255, 255]; // white

// A tiny 5x7 pixel font (1 = lit) for I, K, E — composed into one "IKE" bitmap below.
const GLYPHS = {
  I: [
    "11111",
    "00100",
    "00100",
    "00100",
    "00100",
    "00100",
    "11111",
  ],
  K: [
    "10001",
    "10010",
    "10100",
    "11000",
    "10100",
    "10010",
    "10001",
  ],
  E: [
    "11111",
    "10000",
    "10000",
    "11110",
    "10000",
    "10000",
    "11111",
  ],
};

// Compose "IKE" into a single bitmap, one blank column between letters.
function buildWordmark() {
  const letters = ["I", "K", "E"];
  const rows = 7;
  const gap = 1;
  const width = letters.reduce((w, l) => w + GLYPHS[l][0].length, 0) + gap * (letters.length - 1);
  const bitmap = Array.from({ length: rows }, () => new Array(width).fill(0));

  let x = 0;
  for (const letter of letters) {
    const glyph = GLYPHS[letter];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < glyph[row].length; col++) {
        bitmap[row][x + col] = glyph[row][col] === "1" ? 1 : 0;
      }
    }
    x += glyph[0].length + gap;
  }
  return { bitmap, width, height: rows };
}

const WORDMARK = buildWordmark();

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

// Sample the wordmark bitmap for canvas pixel (x, y). `scale` (0-1) shrinks the wordmark so
// maskable icons keep it inside the safe zone; the background always fills the whole canvas.
function pixel(x, y, size, scale) {
  const markWidth = size * 0.62 * scale;
  const cellSize = markWidth / WORDMARK.width;
  const markHeight = cellSize * WORDMARK.height;

  const left = (size - markWidth) / 2;
  const top = (size - markHeight) / 2;

  const col = Math.floor((x - left) / cellSize);
  const row = Math.floor((y - top) / cellSize);

  if (
    row >= 0 &&
    row < WORDMARK.height &&
    col >= 0 &&
    col < WORDMARK.width &&
    WORDMARK.bitmap[row][col]
  ) {
    return FG;
  }
  return BG;
}

function makePng(size, scale) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  // remaining bytes already 0 (compression / filter / interlace)

  const raw = Buffer.alloc(size * (1 + size * 3));
  let p = 0;
  for (let y = 0; y < size; y++) {
    raw[p++] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixel(x, y, size, scale);
      raw[p++] = r;
      raw[p++] = g;
      raw[p++] = b;
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync(OUT_DIR, { recursive: true });

const files = [
  ["icon-192.png", 192, 1],
  ["icon-512.png", 512, 1],
  ["icon-maskable-512.png", 512, 0.72],
  ["apple-touch-icon.png", 180, 1],
];

for (const [name, size, scale] of files) {
  writeFileSync(join(OUT_DIR, name), makePng(size, scale));
  console.log(`wrote ${name} (${size}x${size})`);
}
