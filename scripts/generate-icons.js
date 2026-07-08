// Генератор иконок для Auto Sender
const fs = require('fs');
const path = require('path');

function createPNG(width, height, r, g, b) {
  // Minimal PNG generator
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  
  const ihdr = createChunk('IHDR', ihdrData);
  
  // IDAT chunk - raw pixel data
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte
    for (let x = 0; x < width; x++) {
      const cx = x - width / 2;
      const cy = y - height / 2;
      const dist = Math.sqrt(cx * cx + cy * cy);
      const maxDist = width / 2 - 1;
      
      if (dist <= maxDist) {
        rawData.push(r, g, b, 255);
      } else if (dist <= width / 2) {
        const alpha = Math.round(255 * (1 - (dist - maxDist)));
        rawData.push(r, g, b, Math.max(0, alpha));
      } else {
        rawData.push(0, 0, 0, 0);
      }
    }
  }
  
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(Buffer.from(rawData));
  const idat = createChunk('IDAT', compressed);
  
  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  const table = new Uint32Array(256);
  
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

const publicDir = path.join(__dirname, '..', 'public');

// Generate 256x256 PNG
const png256 = createPNG(256, 256, 74, 158, 255);
fs.writeFileSync(path.join(publicDir, 'icon.png'), png256);

// For ICO, we use the same PNG data wrapped in ICO format
const png32 = createPNG(32, 32, 74, 158, 255);
const png16 = createPNG(16, 16, 74, 158, 255);

function createICO(sizes) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(sizes.length, 4); // image count
  
  const dirEntries = [];
  const imageData = [];
  let offset = 6 + sizes.length * 16;
  
  for (const { width, height, png } of sizes) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(width === 256 ? 0 : width, 0);
    entry.writeUInt8(height === 256 ? 0 : height, 1);
    entry.writeUInt8(0, 2); // colors
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(png.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    dirEntries.push(entry);
    imageData.push(png);
    offset += png.length;
  }
  
  return Buffer.concat([header, ...dirEntries, ...imageData]);
}

const ico = createICO([
  { width: 256, height: 256, png: png256 },
  { width: 32, height: 32, png: png32 },
  { width: 16, height: 16, png: png16 }
]);
fs.writeFileSync(path.join(publicDir, 'icon.ico'), ico);

console.log('Icons generated successfully!');
