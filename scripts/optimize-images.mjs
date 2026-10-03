// Downscales and re-encodes the gallery images in /assets.
//
// Source photos/maps straight from an export are far larger than they are ever
// displayed (maps render at most 902px wide, tickets at most 350x450px).
// next/image resizes on the fly, but smaller sources mean faster first-hit
// optimization, a lighter repo, and a sane fallback if optimization is off.
//
// Usage: npm run optimize-images            (only touches oversized files)
//        npm run optimize-images -- --force (re-encode everything)
import { readdir, rename, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "assets");
const force = process.argv.includes("--force");

// Tickets: 2x the largest rendered size. Maps: on phones they cover a tall
// stage and are drawn up to ~1200px wide on 3x screens, so keep up to 3840px.
const PRESETS = {
  maps: { maxWidth: 3840, maxHeight: 3840, quality: 80, alphaQuality: 90 },
  tickets: { maxWidth: 1400, maxHeight: 1400, quality: 80, alphaQuality: 90 },
};

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(webp|png|jpe?g)$/i.test(entry.name)) yield full;
  }
}

let before = 0;
let after = 0;
for await (const file of walk(ROOT)) {
  const preset = PRESETS[path.relative(ROOT, file).split(path.sep)[0]];
  if (!preset) continue;

  const image = sharp(file);
  const { width, height } = await image.metadata();
  const { size } = await stat(file);
  const oversized = width > preset.maxWidth || height > preset.maxHeight;
  if (!oversized && !force) continue;

  const out = file.replace(/\.(png|jpe?g)$/i, ".webp") + ".tmp";
  const info = await image
    .resize({ width: preset.maxWidth, height: preset.maxHeight, fit: "inside", withoutEnlargement: true })
    .webp({ quality: preset.quality, alphaQuality: preset.alphaQuality, effort: 6 })
    .toFile(out);
  await rename(out, out.slice(0, -".tmp".length));

  before += size;
  after += info.size;
  console.log(
    `${path.relative(ROOT, file)}: ${width}x${height} -> ${info.width}x${info.height}, ` +
      `${(size / 1024).toFixed(0)}KB -> ${(info.size / 1024).toFixed(0)}KB`
  );
}

console.log(`\nTotal: ${(before / 1048576).toFixed(1)}MB -> ${(after / 1048576).toFixed(1)}MB`);
