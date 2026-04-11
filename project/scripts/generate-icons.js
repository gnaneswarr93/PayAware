import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Indigo #4f46e5
const BG_R = 79, BG_G = 70, BG_B = 229;

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc & 1) ? (crc >>> 1) ^ 0xEDB88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeB, data]);
  const crcVal = Buffer.alloc(4);
  crcVal.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crcVal]);
}

function createPNG(size) {
  // RGBA raw image data (filter byte + RGBA per pixel per row)
  const raw = Buffer.alloc(size * (1 + size * 4), 0);

  for (let y = 0; y < size; y++) {
    const row = y * (1 + size * 4);
    raw[row] = 0; // filter: None

    for (let x = 0; x < size; x++) {
      const off = row + 1 + x * 4;
      const nx = x / size;
      const ny = y / size;

      // Default: indigo background
      let r = BG_R, g = BG_G, b = BG_B, a = 255;

      // Inner lighter circle (subtle depth)
      const dx = nx - 0.5, dy = ny - 0.5;
      if (Math.sqrt(dx * dx + dy * dy) < 0.36) {
        r = Math.min(255, BG_R + 18);
        g = Math.min(255, BG_G + 18);
        b = Math.min(255, BG_B + 5);
      }

      // White "P" letterform (pixel-based)
      const s = size;
      const sw = Math.max(2, Math.round(s * 0.10)); // stroke width
      const lx = Math.round(s * 0.30);              // left x of stem
      const ty = Math.round(s * 0.20);              // top y
      const by = Math.round(s * 0.80);              // bottom y
      const capBy = Math.round(s * 0.53);            // cap bottom y
      const capRx = Math.round(s * 0.68);            // cap right x

      // Vertical stem
      const inStem = x >= lx && x <= lx + sw && y >= ty && y <= by;
      // Top horizontal bar
      const inTopBar = x >= lx && x <= capRx && y >= ty && y <= ty + sw;
      // Middle horizontal bar
      const inMidBar = x >= lx && x <= capRx && y >= capBy - sw && y <= capBy;
      // Right vertical of cap
      const inCapRight = x >= capRx - sw && x <= capRx && y >= ty && y <= capBy;

      if (inStem || inTopBar || inMidBar || inCapRight) {
        r = 255; g = 255; b = 255;
      }

      raw[off] = r;
      raw[off + 1] = g;
      raw[off + 2] = b;
      raw[off + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 6 });

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const size of sizes) {
  const file = path.join(outDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(file, createPNG(size));
  console.log(`✅ icon-${size}x${size}.png`);
}

// screenshot placeholder (390x844)
const scPath = path.join(outDir, 'screenshot-mobile.png');
fs.writeFileSync(scPath, createPNG(390));
console.log('✅ screenshot-mobile.png');

// favicon
fs.copyFileSync(path.join(outDir, 'icon-96x96.png'), path.join(__dirname, '../public/favicon.ico'));
console.log('✅ favicon.ico');

console.log('\n🎉 All icons generated in public/icons/');
