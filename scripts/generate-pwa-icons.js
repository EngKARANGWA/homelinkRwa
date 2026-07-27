const sharp = require("sharp");
const path = require("path");

const NAVY = "#0a1628";

// Lucide "home" glyph, viewBox 0 0 24 24.
const ROOF_WALLS =
  "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z";
const DOOR = "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8";

function houseSvg(size, { glyphRatio, cornerRadius, glyphColor = "#ffffff" }) {
  const glyphSize = size * glyphRatio;
  const offset = (size - glyphSize) / 2;
  const scale = glyphSize / 24;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="${NAVY}" />
    <g transform="translate(${offset}, ${offset}) scale(${scale})">
      <path d="${ROOF_WALLS}" fill="${glyphColor}" />
      <path d="${DOOR}" fill="${NAVY}" />
    </g>
  </svg>`;
}

async function main() {
  const iconsDir = path.join(__dirname, "..", "public", "icons");
  const appDir = path.join(__dirname, "..", "src", "app");

  const targets = [
    { file: "icon-192.png", dir: iconsDir, size: 192, glyphRatio: 0.6, cornerRadius: 192 * 0.22 },
    { file: "icon-512.png", dir: iconsDir, size: 512, glyphRatio: 0.6, cornerRadius: 512 * 0.22 },
    // Maskable icons need the glyph inside the ~80%-diameter safe zone, so
    // OS masks (circle, squircle, etc.) never clip it. Full-bleed square,
    // no rounded corners of our own — the OS applies its own mask shape.
    {
      file: "icon-512-maskable.png",
      dir: iconsDir,
      size: 512,
      glyphRatio: 0.42,
      cornerRadius: 0,
    },
    // Next.js file convention: apple-icon.png must live directly in app/.
    { file: "apple-icon.png", dir: appDir, size: 180, glyphRatio: 0.6, cornerRadius: 0 },
  ];

  for (const t of targets) {
    const svg = houseSvg(t.size, {
      glyphRatio: t.glyphRatio,
      cornerRadius: t.cornerRadius,
    });
    const outPath = path.join(t.dir, t.file);
    await sharp(Buffer.from(svg)).png().toFile(outPath);
    console.log("wrote", outPath);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
