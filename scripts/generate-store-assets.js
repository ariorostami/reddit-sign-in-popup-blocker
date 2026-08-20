const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const root = path.resolve(__dirname, "..");
const storeDir = path.join(root, "assets", "store");

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

function writeRgbPng(filePath, width, height, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;

  const rows = [];
  for (let y = 0; y < height; y += 1) {
    rows.push(Buffer.from([0]));
    rows.push(pixels.subarray(y * width * 3, (y + 1) * width * 3));
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

function setPixel(pixels, width, height, x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= height) {
    return;
  }
  const index = (Math.floor(y) * width + Math.floor(x)) * 3;
  pixels[index] = color[0];
  pixels[index + 1] = color[1];
  pixels[index + 2] = color[2];
}

function fillRect(pixels, width, height, x, y, rectWidth, rectHeight, color) {
  for (let py = Math.floor(y); py < Math.ceil(y + rectHeight); py += 1) {
    for (let px = Math.floor(x); px < Math.ceil(x + rectWidth); px += 1) {
      setPixel(pixels, width, height, px, py, color);
    }
  }
}

function fillRoundedRect(pixels, width, height, x, y, rectWidth, rectHeight, radius, color) {
  for (let py = Math.floor(y); py < Math.ceil(y + rectHeight); py += 1) {
    for (let px = Math.floor(x); px < Math.ceil(x + rectWidth); px += 1) {
      const rx = px < x + radius ? x + radius : px >= x + rectWidth - radius ? x + rectWidth - radius - 1 : px;
      const ry = py < y + radius ? y + radius : py >= y + rectHeight - radius ? y + rectHeight - radius - 1 : py;
      if ((px - rx) * (px - rx) + (py - ry) * (py - ry) <= radius * radius) {
        setPixel(pixels, width, height, px, py, color);
      }
    }
  }
}

function drawLine(pixels, width, height, x1, y1, x2, y2, thickness, color) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  const radius = thickness / 2;

  for (let y = Math.floor(Math.min(y1, y2) - thickness); y <= Math.ceil(Math.max(y1, y2) + thickness); y += 1) {
    for (let x = Math.floor(Math.min(x1, x2) - thickness); x <= Math.ceil(Math.max(x1, x2) + thickness); x += 1) {
      const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / lengthSquared));
      const projectionX = x1 + t * dx;
      const projectionY = y1 + t * dy;
      const distance = Math.hypot(x - projectionX, y - projectionY);
      if (distance <= radius) {
        setPixel(pixels, width, height, x, y, color);
      }
    }
  }
}

function drawSmallPromoTile() {
  const width = 440;
  const height = 280;
  const pixels = Buffer.alloc(width * height * 3);

  fillRect(pixels, width, height, 0, 0, width, height, [247, 250, 251]);
  fillRect(pixels, width, height, 0, 0, width, 72, [24, 111, 126]);
  fillRoundedRect(pixels, width, height, 42, 48, 356, 188, 12, [255, 255, 255]);
  fillRoundedRect(pixels, width, height, 42, 48, 356, 188, 12, [214, 225, 230]);
  fillRoundedRect(pixels, width, height, 46, 52, 348, 180, 10, [255, 255, 255]);
  fillRect(pixels, width, height, 46, 52, 348, 34, [24, 111, 126]);

  fillRoundedRect(pixels, width, height, 66, 65, 10, 10, 5, [255, 237, 233]);
  fillRoundedRect(pixels, width, height, 88, 65, 10, 10, 5, [255, 237, 233]);
  fillRoundedRect(pixels, width, height, 110, 65, 10, 10, 5, [255, 237, 233]);

  fillRoundedRect(pixels, width, height, 78, 112, 138, 14, 4, [122, 144, 154]);
  fillRoundedRect(pixels, width, height, 78, 144, 226, 10, 3, [209, 221, 225]);
  fillRoundedRect(pixels, width, height, 78, 169, 198, 10, 3, [209, 221, 225]);
  fillRoundedRect(pixels, width, height, 78, 194, 226, 10, 3, [209, 221, 225]);

  fillRoundedRect(pixels, width, height, 252, 112, 88, 70, 8, [245, 250, 251]);
  fillRoundedRect(pixels, width, height, 256, 116, 80, 62, 6, [255, 255, 255]);
  fillRoundedRect(pixels, width, height, 274, 137, 44, 8, 3, [122, 144, 154]);
  fillRoundedRect(pixels, width, height, 274, 154, 32, 8, 3, [122, 144, 154]);

  drawLine(pixels, width, height, 246, 196, 352, 100, 18, [220, 62, 68]);
  drawLine(pixels, width, height, 246, 196, 352, 100, 8, [255, 245, 238]);
  fillRect(pixels, width, height, 0, 260, width, 20, [24, 111, 126]);

  return { width, height, pixels };
}

function drawMarqueePromoTile() {
  const width = 1400;
  const height = 560;
  const pixels = Buffer.alloc(width * height * 3);

  fillRect(pixels, width, height, 0, 0, width, height, [247, 250, 251]);
  fillRect(pixels, width, height, 0, 0, width, 112, [24, 111, 126]);
  fillRect(pixels, width, height, 0, 514, width, 46, [24, 111, 126]);

  fillRoundedRect(pixels, width, height, 112, 84, 1176, 392, 22, [202, 215, 220]);
  fillRoundedRect(pixels, width, height, 118, 90, 1164, 380, 18, [255, 255, 255]);
  fillRect(pixels, width, height, 118, 90, 1164, 58, [24, 111, 126]);

  fillRoundedRect(pixels, width, height, 158, 111, 18, 18, 9, [255, 237, 233]);
  fillRoundedRect(pixels, width, height, 198, 111, 18, 18, 9, [255, 237, 233]);
  fillRoundedRect(pixels, width, height, 238, 111, 18, 18, 9, [255, 237, 233]);

  fillRoundedRect(pixels, width, height, 196, 214, 410, 24, 6, [122, 144, 154]);
  fillRoundedRect(pixels, width, height, 196, 273, 650, 18, 5, [209, 221, 225]);
  fillRoundedRect(pixels, width, height, 196, 318, 586, 18, 5, [209, 221, 225]);
  fillRoundedRect(pixels, width, height, 196, 363, 640, 18, 5, [209, 221, 225]);

  fillRoundedRect(pixels, width, height, 870, 198, 270, 188, 16, [245, 250, 251]);
  fillRoundedRect(pixels, width, height, 876, 204, 258, 176, 12, [255, 255, 255]);
  fillRoundedRect(pixels, width, height, 932, 252, 150, 18, 5, [122, 144, 154]);
  fillRoundedRect(pixels, width, height, 932, 294, 116, 18, 5, [122, 144, 154]);
  fillRoundedRect(pixels, width, height, 932, 336, 128, 18, 5, [209, 221, 225]);

  drawLine(pixels, width, height, 854, 408, 1158, 184, 40, [220, 62, 68]);
  drawLine(pixels, width, height, 854, 408, 1158, 184, 18, [255, 245, 238]);

  return { width, height, pixels };
}

fs.mkdirSync(storeDir, { recursive: true });
const tile = drawSmallPromoTile();
writeRgbPng(path.join(storeDir, "small-promo-tile.png"), tile.width, tile.height, tile.pixels);
const marquee = drawMarqueePromoTile();
writeRgbPng(path.join(storeDir, "marquee-promo-tile.png"), marquee.width, marquee.height, marquee.pixels);
console.log("Generated assets/store/small-promo-tile.png");
console.log("Generated assets/store/marquee-promo-tile.png");
