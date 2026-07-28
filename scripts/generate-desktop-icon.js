// Builds a proper multi-resolution Windows .ico (the format a desktop
// shortcut's icon actually needs) from the same navy/house glyph used for
// the PWA icons, since browsers can't create a physical desktop icon
// themselves — see generate-desktop-shortcut.js for the shortcut itself.
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const NAVY = "#0a1628";
const ROOF_WALLS =
  "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z";
const DOOR = "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8";

function houseSvg(size) {
  const glyphSize = size * 0.6;
  const offset = (size - glyphSize) / 2;
  const scale = glyphSize / 24;
  const cornerRadius = size * 0.22;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="${NAVY}" />
    <g transform="translate(${offset}, ${offset}) scale(${scale})">
      <path d="${ROOF_WALLS}" fill="#ffffff" />
      <path d="${DOOR}" fill="${NAVY}" />
    </g>
  </svg>`;
}

async function buildIco(sizes, outPath) {
  const images = [];
  for (const size of sizes) {
    const png = await sharp(Buffer.from(houseSvg(size))).png().toBuffer();
    images.push({ size, png });
  }

  const HEADER_SIZE = 6;
  const ENTRY_SIZE = 16;
  let offset = HEADER_SIZE + ENTRY_SIZE * images.length;

  const header = Buffer.alloc(HEADER_SIZE);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(images.length, 4);

  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(ENTRY_SIZE);
    const dim = size >= 256 ? 0 : size; // 0 means 256px per the ICO spec
    entry.writeUInt8(dim, 0);
    entry.writeUInt8(dim, 1);
    entry.writeUInt8(0, 2); // color count (0 = not palette-based)
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });

  const ico = Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, ico);
  console.log("wrote", outPath, `(${ico.length} bytes)`);
}

buildIco([16, 32, 48, 256], path.join(__dirname, "..", "public", "icons", "homelink.ico")).catch(
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
