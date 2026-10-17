// Renders the map backgrounds (assets/maps/<theme>/bg_<city>.webp) from the
// OpenStreetMap data that fetch_osm.py downloads. Both themes are drawn from
// the same data with the same framing (cities.json), so light and dark only
// differ in colour:
// - light: the palette of "Even Lighter" by Anda (Snazzy Maps)
// - dark:  the palette of "Shades of Grey" by Adam Krogh (Snazzy Maps)
// Each map fades out towards its edges in an ellipse, so it blends into the
// page background in both themes.
//
// Usage: python3 scripts/maps/fetch_osm.py  (once, or after changing cities.json)
//        npm run render-maps              (all cities)
//        npm run render-maps -- berlin    (just these cities)
// Then run `npm run optimize-images` to regenerate the phone crops.
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { chromium } from "playwright-core";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const HERE = path.dirname(new URL(import.meta.url).pathname);
const ROOT = path.join(HERE, "..", "..");
const DATA = path.join(HERE, "data");

// CSS pixels; drawn at 4x, so the maps are 3788x2268. Desktop shows the map
// 902px wide, about this size, so sizes below are roughly what desktop shows
// (phones show the middle half, about 1.3x larger). Must match fetch_osm.py.
const VIEW = { width: 947, height: 567 };
const SCALE = 4;

// Glyphs (Noto Sans, OFL) for the labels, downloaded once into data/glyphs.
const GLYPHS_URL = "https://raw.githubusercontent.com/protomaps/basemaps-assets/main/fonts";
const FONT = "Noto Sans Regular";
const FONT_MEDIUM = "Noto Sans Medium";

// Colours sampled from the original Snazzy Maps backgrounds. "Shades of Grey"
// is black at Google lightness 16-21 (so #292929-#363636), labels at 40.
const THEMES = {
  light: {
    land: "#fcfcfc",
    park: "#e3eed5",
    water: "#dfeff5",
    rail: "#e4dede",
    minor: "#ececec",
    tertiary: "#e8e8e8",
    major: "#f2d3c4",
    motorway: "#efc6b5",
    casing: null,
    label: "#5f8f98",
    labelHalo: "#fcfcfc",
    cityLabel: "#56858e",
  },
  dark: {
    land: "#303030",
    park: "#343434",
    water: "#262626",
    rail: "#2c2c2c",
    minor: "#2a2a2a",
    tertiary: "#2a2a2a",
    major: "#2c2c2c",
    motorway: "#282828",
    casing: "#3f3f3f",
    label: "#6b6b6b",
    labelHalo: "#292929",
    cityLabel: "#8a8a8a",
  },
};

// Line widths (CSS px) by zoom: zoomed-out (bigger) cities get finer lines.
const width = (z12, z14) => ["interpolate", ["exponential", 1.6], ["zoom"], 12, z12, 14, z14];

function style(theme, data, city) {
  const c = THEMES[theme];
  const coastal = Boolean(city.coastal);
  const layer = (name) => ["==", ["get", "layer"], name];
  const roadClass = (...classes) => ["all", layer("road"), ["in", ["get", "class"], ["literal", classes]]];
  const road = (id, filter, color, w) => ({
    id,
    type: "line",
    source: "osm",
    filter,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": color, "line-width": w },
  });
  const majorRoads = roadClass("primary", "secondary", "trunk");

  return {
    version: 8,
    glyphs: "http://maps.local/glyphs/{fontstack}/{range}.pbf",
    sources: {
      osm: { type: "geojson", data, tolerance: 0.2, buffer: 64 },
      city: {
        type: "geojson",
        data: { type: "Feature", geometry: { type: "Point", coordinates: city.center }, properties: {} },
      },
    },
    layers: [
      // Coastal cities: the sea is the background and land is drawn over it.
      { id: "background", type: "background", paint: { "background-color": coastal ? c.water : c.land } },
      ...(coastal
        ? [{ id: "land", type: "fill", source: "osm", filter: layer("land"), paint: { "fill-color": c.land } }]
        : []),
      { id: "park", type: "fill", source: "osm", filter: layer("park"), paint: { "fill-color": c.park } },
      { id: "water", type: "fill", source: "osm", filter: layer("water"), paint: { "fill-color": c.water } },
      road("waterway", layer("waterway"), c.water, width(0.8, 2.4)),
      {
        id: "rail",
        type: "line",
        source: "osm",
        filter: layer("rail"),
        paint: { "line-color": c.rail, "line-width": width(0.5, 1) },
      },
      road("road-minor", roadClass("residential", "living_street", "unclassified", "pedestrian"), c.minor, width(0.4, 1.2)),
      road("road-tertiary", roadClass("tertiary"), c.tertiary, width(0.6, 1.8)),
      // Shades of Grey outlines the main roads with a slightly lighter edge.
      ...(c.casing
        ? [
            road("road-major-casing", majorRoads, c.casing, width(1.4, 3.2)),
            road("road-motorway-casing", roadClass("motorway"), c.casing, width(1.7, 3.8)),
          ]
        : []),
      road("road-major", majorRoads, c.major, width(0.9, 2.6)),
      road("road-motorway", roadClass("motorway"), c.motorway, width(1.2, 3.2)),
      {
        id: "road-label",
        type: "symbol",
        source: "osm",
        filter: ["all", majorRoads, ["has", "name"]],
        layout: {
          "symbol-placement": "line",
          "symbol-spacing": 300,
          "text-field": ["get", "name"],
          "text-font": [FONT],
          "text-size": 8,
          "text-letter-spacing": 0.02,
        },
        paint: { "text-color": c.label, "text-halo-color": c.labelHalo, "text-halo-width": 1, "text-opacity": 0.8 },
      },
      {
        id: "place-label",
        type: "symbol",
        source: "osm",
        filter: [
          "all",
          layer("place"),
          // Not the city itself (it gets its own label below).
          ["!=", ["get", "name"], city.localName ?? city.label],
          ["!=", ["get", "name_en"], city.label],
          // Districts and towns; villages and hamlets have prominence < 30.
          ["any", ["!=", ["get", "subtype"], "locality"], [">=", ["get", "prominence"], 30]],
        ],
        layout: {
          "text-field": ["upcase", ["get", "name"]],
          "text-font": [FONT_MEDIUM],
          "text-size": 9,
          "text-letter-spacing": 0.12,
          "text-max-width": 9,
          "text-padding": 16,
          // Larger, more prominent places win when labels collide, then
          // districts over neighbourhoods.
          "symbol-sort-key": [
            "-",
            ["match", ["get", "subtype"], "neighborhood", 0, -10],
            ["+", ["get", "prominence"], ["/", ["get", "population"], 100000]],
          ],
        },
        paint: { "text-color": c.label, "text-halo-color": c.labelHalo, "text-halo-width": 1.2 },
      },
      {
        id: "city-label",
        type: "symbol",
        source: "city",
        layout: {
          "text-field": city.label,
          "text-font": [FONT_MEDIUM],
          "text-size": 22,
          "text-allow-overlap": true,
          "symbol-z-order": "source",
        },
        paint: { "text-color": c.cityLabel, "text-halo-color": c.labelHalo, "text-halo-width": 1.5 },
      },
    ],
  };
}

const exists = (file) => access(file).then(() => true, () => false);

async function glyph(fontstack, range) {
  const font = fontstack.split(",")[0];
  const file = path.join(DATA, "glyphs", font, `${range}.pbf`);
  if (!(await exists(file))) {
    const res = await fetch(`${GLYPHS_URL}/${encodeURIComponent(font)}/${range}.pbf`);
    if (!res.ok) throw new Error(`glyphs ${font} ${range}: HTTP ${res.status}`);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
  }
  return readFile(file);
}

// The page's alpha: 1 in the middle, falling linearly to 0 on an ellipse that
// touches the edges (like the original maps).
async function fadeEdges(png) {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  for (let y = 0; y < h; y++) {
    const dy = (y + 0.5 - h / 2) / (h / 2);
    for (let x = 0; x < w; x++) {
      const dx = (x + 0.5 - w / 2) / (w / 2);
      const alpha = Math.max(0, 1 - Math.hypot(dx, dy));
      data[(y * w + x) * 4 + 3] = Math.round(alpha * 255);
    }
  }
  return sharp(data, { raw: info });
}

const PAGE = `<!doctype html><html><head><link rel="stylesheet" href="http://maps.local/maplibre-gl.css">
<style>html,body,#map{margin:0;width:100%;height:100%}</style></head>
<body><div id="map"></div><script src="http://maps.local/maplibre-gl.js"></script></body></html>`;

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const { cities } = JSON.parse(await readFile(path.join(HERE, "cities.json"), "utf8"));
const maplibreDir = path.dirname(require.resolve("maplibre-gl/dist/maplibre-gl.js"));

// Uses the installed Google Chrome, or the Chromium at CHROMIUM_PATH.
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : { channel: "chrome" }),
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: VIEW, deviceScaleFactor: SCALE });
page.on("pageerror", (err) => console.error(err));
await page.route("http://maps.local/**", async (route) => {
  const url = new URL(route.request().url());
  const glyphMatch = url.pathname.match(/^\/glyphs\/(.+)\/(\d+-\d+)\.pbf$/);
  if (glyphMatch) {
    const body = await glyph(decodeURIComponent(glyphMatch[1]), glyphMatch[2]).catch(() => null);
    return body ? route.fulfill({ body, contentType: "application/x-protobuf" }) : route.fulfill({ status: 404 });
  }
  if (url.pathname === "/") return route.fulfill({ body: PAGE, contentType: "text/html" });
  return route.fulfill({ path: path.join(maplibreDir, path.basename(url.pathname)) });
});
await page.goto("http://maps.local/");

for (const city of cities) {
  if (args.length && !args.includes(city.id)) continue;
  const dataFile = path.join(DATA, `${city.id}.geojson`);
  if (!(await exists(dataFile))) {
    console.error(`${city.id}: no data, run python3 scripts/maps/fetch_osm.py first`);
    process.exitCode = 1;
    continue;
  }
  const data = JSON.parse(await readFile(dataFile, "utf8"));
  for (const theme of Object.keys(THEMES)) {
    const png = await page.evaluate(
      ({ style, center, zoom }) =>
        new Promise((resolve, reject) => {
          window.renderedMap?.remove();
          const map = new window.maplibregl.Map({
            container: "map",
            style,
            center,
            zoom,
            interactive: false,
            attributionControl: false,
            fadeDuration: 0,
            canvasContextAttributes: { preserveDrawingBuffer: true, antialias: true },
          });
          window.renderedMap = map;
          map.on("error", (e) => reject(new Error(e.error?.message ?? String(e))));
          map.once("idle", () => resolve(map.getCanvas().toDataURL("image/png")));
        }),
      { style: style(theme, data, city), center: city.center, zoom: city.zoom }
    );
    const out = path.join(ROOT, "assets", "maps", theme, `bg_${city.id}.webp`);
    const image = await fadeEdges(Buffer.from(png.split(",")[1], "base64"));
    // Flat colours and thin lines: near-lossless keeps them crisp at a
    // fraction of the size of lossless.
    const info = await image.webp({ nearLossless: true, quality: 60, effort: 6 }).toFile(out);
    console.log(`maps/${theme}/bg_${city.id}.webp: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)}KB`);
  }
}
await browser.close();
