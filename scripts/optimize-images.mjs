// Prepares the gallery images in /assets:
// 1. Downscales and re-encodes oversized images. Ticket photos straight from an
//    export are far larger than they are ever displayed (at most 350x450px).
//    next/image resizes on the fly, but smaller sources mean faster first-hit
//    optimization and a lighter repo.
// 2. Generates the phone crop of each map (assets/maps/mobile/<theme>/). On
//    phones the map covers a tall stage and only its middle is visible, so
//    phones download this crop instead of the whole map (see City.tsx).
// 3. Encodes the static AVIF versions of the maps (public/maps/, listed in
//    lib/mapVariants.json), so maps don't wait for next/image (see below).
//
// Usage: npm run optimize-images            (only touches what's needed)
//        npm run optimize-images -- --force (redo everything)
import { createHash } from "node:crypto";
import { access, mkdir, readdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "assets");
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
    else if (/\.(webp|avif|png|jpe?g)$/i.test(entry.name)) yield full;
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
    const src = path.join(dir, name);
    // Redo a crop when its map has changed since (e.g. re-rendered).
    if (!force && (await exists(out)) && (await stat(out)).mtimeMs >= (await stat(src)).mtimeMs) continue;
    const { width, height } = await sharp(src).metadata();
    const cropWidth = Math.round(width * MOBILE_CROP_WIDTH);
    const info = await sharp(src)
      .extract({ left: Math.round((width - cropWidth) / 2), top: 0, width: cropWidth, height })
      .webp({ quality: 90, alphaQuality: 100, effort: 6 })
      .toFile(out);
    console.log(`maps/mobile/${theme}/${name}: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)}KB`);
  }
}

// Static AVIF versions of the maps (public/maps/), in the widths screens
// actually need. Served as plain files, so a map arrives straight from the CDN
// instead of waiting for next/image to encode it on the first request (~1s per
// size, per city, per theme). Encoded more carefully than next/image can afford
// on the fly (full colour resolution, slower encoder), they come out smaller at
// the same or better fidelity. lib/mapVariants.json lists them for lib/images.ts;
// browsers without AVIF still get next/image's WebP.
// Desktop: drawn up to 902px wide (1x, 2x, 3x screens). Phones: the middle crop
// drawn at roughly 350-520px wide on 2x and 3x screens.
const VARIANTS = {
  desktop: { widths: [1080, 1920, 2560], crop: 1, quality: 63 },
  mobile: { widths: [750, 1080, 1600], crop: MOBILE_CROP_WIDTH, quality: 50 },
};
const PUBLIC_MAPS = path.join(ROOT, "..", "public", "maps");
const MANIFEST = path.join(ROOT, "..", "lib", "mapVariants.json");

const jobs = [];
const manifest = {};
const keep = new Set();
for (const theme of ["light", "dark"]) {
  for (const name of (await readdir(path.join(ROOT, "maps", theme))).filter((n) => n.endsWith(".webp"))) {
    const src = path.join(ROOT, "maps", theme, name);
    const map = path.basename(name, ".webp");
    for (const [variant, { widths, crop, quality }] of Object.entries(VARIANTS)) {
      // The hash in the file name changes with the map or the settings, so the
      // files can be cached forever (see next.config.js).
      const hash = createHash("sha1")
        .update(await readFile(src))
        .update(JSON.stringify({ widths, crop, quality }))
        .digest("hex")
        .slice(0, 10);
      const dir = path.join(PUBLIC_MAPS, variant, theme);
      const srcSet = [];
      for (const width of widths) {
        const file = `${map}-${width}.${hash}.avif`;
        const out = path.join(dir, file);
        keep.add(out);
        srcSet.push(`/maps/${variant}/${theme}/${file} ${width}w`);
        if (!force && (await exists(out))) continue;
        jobs.push(async () => {
          await mkdir(dir, { recursive: true });
          const { width: w, height: h } = await sharp(src).metadata();
          const cropWidth = Math.round(w * crop);
          const info = await sharp(src)
            .extract({ left: Math.round((w - cropWidth) / 2), top: 0, width: cropWidth, height: h })
            .resize({ width })
            .avif({ quality, effort: 6, chromaSubsampling: "4:4:4" })
            .toFile(out);
          console.log(`public/maps/${variant}/${theme}/${file}: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)}KB`);
        });
      }
      manifest[`${variant}/${theme}/${map}`] = srcSet.join(", ");
    }
  }
}

// AVIF encoding at this effort takes a few seconds per image; a few at a time.
const queue = [...jobs];
await Promise.all(Array.from({ length: 3 }, async () => {
  while (queue.length) await queue.shift()();
}));

// Drop files of maps or settings that no longer exist.
await mkdir(PUBLIC_MAPS, { recursive: true });
for await (const file of walk(PUBLIC_MAPS)) {
  if (!keep.has(file)) await unlink(file);
}
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
