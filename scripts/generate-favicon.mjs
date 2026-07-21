import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public');

const svgPath = join(publicDir, 'favicon.svg');
const svgBuffer = readFileSync(svgPath);

const pngSizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

console.log('Generating PNGs...');
for (const { name, size } of pngSizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(join(publicDir, name));
  console.log(`  ✓ ${name}`);
}

// Build ICO from 16, 32, 48 PNGs.
// ICO format: header + directory + image data.
// Each entry uses PNG data directly (PNG-in-ICO, supported by all modern browsers).
console.log('Assembling favicon.ico...');

const icoSizes = [16, 32, 48];
const pngBuffers = await Promise.all(
  icoSizes.map((size) =>
    sharp(svgBuffer).resize(size, size).png().toBuffer()
  )
);

const HEADER_SIZE = 6;
const DIR_ENTRY_SIZE = 16;
const numImages = icoSizes.length;
const dirOffset = HEADER_SIZE + DIR_ENTRY_SIZE * numImages;

let imageDataOffset = dirOffset;
const offsets = pngBuffers.map((buf) => {
  const offset = imageDataOffset;
  imageDataOffset += buf.length;
  return offset;
});

const totalSize = imageDataOffset;
const ico = Buffer.alloc(totalSize);

// ICO header
ico.writeUInt16LE(0, 0);       // reserved
ico.writeUInt16LE(1, 2);       // type: 1 = ICO
ico.writeUInt16LE(numImages, 4); // image count

// Directory entries
pngBuffers.forEach((buf, i) => {
  const size = icoSizes[i];
  const base = HEADER_SIZE + DIR_ENTRY_SIZE * i;
  ico.writeUInt8(size === 256 ? 0 : size, base);     // width (0 = 256)
  ico.writeUInt8(size === 256 ? 0 : size, base + 1); // height
  ico.writeUInt8(0, base + 2);   // color count
  ico.writeUInt8(0, base + 3);   // reserved
  ico.writeUInt16LE(1, base + 4); // color planes
  ico.writeUInt16LE(32, base + 6); // bits per pixel
  ico.writeUInt32LE(buf.length, base + 8);  // image data size
  ico.writeUInt32LE(offsets[i], base + 12); // image data offset
});

// Image data
pngBuffers.forEach((buf, i) => {
  buf.copy(ico, offsets[i]);
});

writeFileSync(join(publicDir, 'favicon.ico'), ico);
console.log('  ✓ favicon.ico');

// Remove the intermediate 48px PNG — it was only needed for the ICO
import { unlinkSync } from 'fs';
try { unlinkSync(join(publicDir, 'favicon-48x48.png')); } catch {}

console.log('✡️ Done');
