// Prepares the gallery images in /assets:
// 1. Downscales and re-encodes oversized images. Ticket photos straight from an
//    export are far larger than they are ever displayed (at most 350x450px).
//    next/image resizes on the fly, but smaller sources mean faster first-hit
//    optimization and a lighter repo.
// 2. Generates the phone crop of each map (assets/maps/mobile/<theme>/). On
//    phones the map covers a tall stage and only its middle is visible, so
//    phones download this crop instead of the whole map (see City.tsx).
//
// Usage: npm run optimize-images            (only touches what's needed)
//        npm run optimize-images -- --force (redo everything)
import { access, mkdir, readdir, rename, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "assets");
const force = process.argv.includes("--force");

// Tickets: 2x the largest rendered size. Maps: keep the full-size originals
// (desktop draws them up to 902px wide; 2x screens need ~1800px, and the crop
// for phones is cut from the full resolution).
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

console.log(`\nResized: ${(before / 1048576).toFixed(1)}MB -> ${(after / 1048576).toFixed(1)}MB`);

// Phone crops: the middle half of each map, full height. Phones show between
// ~36% (Pro Max) and ~50% (iPhone SE) of the map's width; the crop's 0.84
// aspect ratio is referenced in lib/images.ts (MOBILE_MAP_SIZES).
const MOBILE_CROP_WIDTH = 0.5;
const exists = (file) => access(file).then(() => true, () => false);
for (const theme of ["light", "dark"]) {
  const dir = path.join(ROOT, "maps", theme);
  const outDir = path.join(ROOT, "maps", "mobile", theme);
  await mkdir(outDir, { recursive: true });
  for (const name of await readdir(dir)) {
    const out = path.join(outDir, name);
    if (!force && (await exists(out))) continue;
    const { width, height } = await sharp(path.join(dir, name)).metadata();
    const cropWidth = Math.round(width * MOBILE_CROP_WIDTH);
    const info = await sharp(path.join(dir, name))
      .extract({ left: Math.round((width - cropWidth) / 2), top: 0, width: cropWidth, height })
      .webp({ quality: 90, alphaQuality: 100, effort: 6 })
      .toFile(out);
    console.log(`maps/mobile/${theme}/${name}: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)}KB`);
  }
}
