import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal pure-JS PNG generator for high-res icons with Adobe Stock creator styling
function createPNG(width, height, options = {}) {
  const { isMaskable = false, isAppleTouch = false } = options;
  const buffer = Buffer.alloc(width * height * 4);
  const centerX = width / 2;
  const centerY = height / 2;

  // Maskable & Apple touch have full-bleed backgrounds (no transparent corners)
  const fullBleed = isMaskable || isAppleTouch;
  const scaleFactor = isMaskable ? 0.72 : 0.88; // safe zone margin for maskable icons

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Scaled coordinates relative to center
      const scaledDx = dx / scaleFactor;
      const scaledDy = dy / scaleFactor;
      const scaledDist = dist / scaleFactor;

      // Glyph elements: camera aperture, lens dot, flash bar
      const isInBadge =
        Math.abs(scaledDx) <= (width * 0.44) &&
        Math.abs(scaledDy) <= (height * 0.44);

      const isApertureRing =
        scaledDist <= (width * 0.24) && scaledDist >= (width * 0.16);
      const isCenterDot = scaledDist <= (width * 0.09);
      const isTopFlash =
        scaledDy >= -(height * 0.36) &&
        scaledDy <= -(height * 0.28) &&
        Math.abs(scaledDx) <= (width * 0.16);

      const grad = y / height;
      const rGrad = Math.round(15 + grad * 20);   // Dark rich navy
      const gGrad = Math.round(23 + grad * 45);   // #0f172a to vibrant indigo
      const bGrad = Math.round(50 + grad * 120);  // Deep slate/blue

      if (isApertureRing || isCenterDot || isTopFlash) {
        // High contrast crisp white/cyan glyph
        buffer[idx] = 255;
        buffer[idx + 1] = 255;
        buffer[idx + 2] = 255;
        buffer[idx + 3] = 255;
      } else if (isInBadge || fullBleed) {
        if (isInBadge) {
          // Vibrant inner badge gradient (#1d4ed8 to #3b82f6)
          buffer[idx] = Math.round(29 + grad * 30);
          buffer[idx + 1] = Math.round(78 + grad * 52);
          buffer[idx + 2] = Math.round(216 + grad * 30);
          buffer[idx + 3] = 255;
        } else {
          // Full-bleed outer background for maskable/apple
          buffer[idx] = rGrad;
          buffer[idx + 1] = gGrad;
          buffer[idx + 2] = bGrad;
          buffer[idx + 3] = 255;
        }
      } else {
        // Transparent outside badge for standard 'any' icons
        buffer[idx] = 0;
        buffer[idx + 1] = 0;
        buffer[idx + 2] = 0;
        buffer[idx + 3] = 0;
      }
    }
  }

  // Build PNG chunks
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT (filter byte 0 preceding each row)
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    rawData[y * (width * 4 + 1)] = 0; // filter 0
    buffer.copy(rawData, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(len + 12);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, len + 8));
  chunk.writeInt32BE(crc, len + 8);
  return chunk;
}

// CRC32 table
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return c ^ -1;
}

const iconsDir = path.resolve('public/icons');
const publicDir = path.resolve('public');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Extension icons
[16, 32, 48, 128].forEach(size => {
  const pngBuf = createPNG(size, size);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), pngBuf);
  console.log(`Created icon${size}.png`);
});

// PWA icons
const pwa192 = createPNG(192, 192);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);
console.log('Created public/pwa-192x192.png');

const pwa512 = createPNG(512, 512);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);
console.log('Created public/pwa-512x512.png');

const pwaMaskable512 = createPNG(512, 512, { isMaskable: true });
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable512);
console.log('Created public/pwa-maskable-512x512.png');

const appleTouchIcon = createPNG(180, 180, { isAppleTouch: true });
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouchIcon);
console.log('Created public/apple-touch-icon.png');

// Vector SVG icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none">
  <rect width="128" height="128" rx="28" fill="url(#bg-gradient)"/>
  <circle cx="64" cy="64" r="32" stroke="#FFFFFF" stroke-width="8" stroke-dasharray="14 6"/>
  <circle cx="64" cy="64" r="14" fill="#60A5FA"/>
  <path d="M40 38L48 26H80L88 38H40Z" fill="#93C5FD" fill-opacity="0.8"/>
  <defs>
    <linearGradient id="bg-gradient" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop stop-color="#1E3A8A"/>
      <stop offset="1" stop-color="#2563EB"/>
    </linearGradient>
  </defs>
</svg>`;
fs.writeFileSync(path.join(iconsDir, 'icon32.svg'), svgIcon);
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);
console.log('Created icon.svg');
