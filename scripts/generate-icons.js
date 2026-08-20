const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const root = path.resolve(__dirname, "..");
const iconDir = path.join(root, "assets", "icons");
const sizes = [16, 32, 48, 128];

function crc32(buffer) {
  let crc = -1;
  for (let index = 0; index < buffer.length; index += 1) {
    crc ^= buffer[index];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function writePng(filePath, width, height, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  const rows = [];
  for (let y = 0; y < height; y += 1) {
    rows.push(Buffer.from([0]));
    rows.push(pixels.subarray(y * width * 4, (y + 1) * width * 4));
  }

  fs.writeFileSync(
    filePath,
    Buffer.concat([
      signature,
      chunk("IHDR", ihdr),
      chunk("IDAT", zlib.deflateSync(Buffer.concat(rows))),
      chunk("IEND", Buffer.alloc(0))
    ])
  );
}

function setPixel(pixels, size, x, y, color) {
  if (x < 0 || y < 0 || x >= size || y >= size) {
    return;
  }
  const index = (Math.floor(y) * size + Math.floor(x)) * 4;
  pixels[index] = color[0];
  pixels[index + 1] = color[1];
  pixels[index + 2] = color[2];
  pixels[index + 3] = color[3];
}

function fillRoundedRect(pixels, size, x, y, width, height, radius, color) {
  for (let py = Math.floor(y); py < Math.ceil(y + height); py += 1) {
    for (let px = Math.floor(x); px < Math.ceil(x + width); px += 1) {
      const rx = px < x + radius ? x + radius : px >= x + width - radius ? x + width - radius - 1 : px;
      const ry = py < y + radius ? y + radius : py >= y + height - radius ? y + height - radius - 1 : py;
      if ((px - rx) * (px - rx) + (py - ry) * (py - ry) <= radius * radius) {
        setPixel(pixels, size, px, py, color);
      }
    }
  }
}

function fillRect(pixels, size, x, y, width, height, color) {
  for (let py = Math.floor(y); py < Math.ceil(y + height); py += 1) {
    for (let px = Math.floor(x); px < Math.ceil(x + width); px += 1) {
      setPixel(pixels, size, px, py, color);
    }
  }
}

function drawLine(pixels, size, x1, y1, x2, y2, thickness, color) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  const radius = thickness / 2;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / lengthSquared));
      const projectionX = x1 + t * dx;
      const projectionY = y1 + t * dy;
      const distance = Math.hypot(x - projectionX, y - projectionY);
      if (distance <= radius) {
        setPixel(pixels, size, x, y, color);
      }
    }
  }
}

function createIcon(size) {
  const pixels = Buffer.alloc(size * size * 4);
  const scale = size / 128;

  fillRoundedRect(pixels, size, 8 * scale, 8 * scale, 112 * scale, 112 * scale, 20 * scale, [24, 111, 126, 255]);
  fillRoundedRect(pixels, size, 27 * scale, 35 * scale, 74 * scale, 54 * scale, 7 * scale, [245, 250, 252, 255]);
  fillRect(pixels, size, 37 * scale, 49 * scale, 54 * scale, 6 * scale, [105, 124, 135, 255]);
  fillRect(pixels, size, 37 * scale, 64 * scale, 39 * scale, 6 * scale, [105, 124, 135, 255]);
  drawLine(pixels, size, 29 * scale, 96 * scale, 99 * scale, 28 * scale, 14 * scale, [220, 62, 68, 255]);
  drawLine(pixels, size, 29 * scale, 96 * scale, 99 * scale, 28 * scale, 6 * scale, [255, 245, 238, 255]);

  return pixels;
}

fs.mkdirSync(iconDir, { recursive: true });
for (const size of sizes) {
  writePng(path.join(iconDir, `icon-${size}.png`), size, size, createIcon(size));
}

console.log("Generated extension icons.");
