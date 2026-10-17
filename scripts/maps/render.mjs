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

// The two Snazzy Maps styles, translated from their Google Maps style JSON.
// Google's "lightness" L on black is 255 * L / 100, so Shades of Grey's
// landscape at 20 is #333333. OSM road classes map onto Google's road types:
// highway = motorway, trunk, primary; arterial = secondary, tertiary;
// local = the rest. null = not drawn (Even Lighter hides transit).
const THEMES = {
  // "Even Lighter" by Anda.
  light: {
    land: "#ffffff", // landscape geometry.fill
    park: "#e6f3d6", // poi.park
    water: "#eaf6f8",
    rail: null, // transit: off
    // road: saturation -100, lightness 45 (Google's grey local and arterial
    // road edges, lightened); road.arterial fill #f4f4f4.
    local: "#eeeeee",
    arterial: "#f4f4f4",
    arterialCasing: "#e8e8e8",
    highway: "#f4d2c5", // road.highway geometry.fill
    highwayCasing: null,
    label: "#6195a0", // administrative labels
    labelHalo: "#ffffff", // Google's default label outline
    highwayLabel: "#4e4e4e",
    arterialLabel: "#787878",
  },
  // "Shades of Grey" by Adam Krogh.
  dark: {
    land: "#333333", // landscape, lightness 20
    park: "#363636", // poi, 21
    water: "#2b2b2b", // 17
    rail: "#303030", // transit, 19
    local: "#292929", // road.local, 16
    arterial: "#2e2e2e", // road.arterial, 18
    arterialCasing: null,
    highway: "#2b2b2b", // road.highway fill, 17
    highwayCasing: "#4a4a4a", // road.highway stroke, 29, weight 0.2
    label: "#666666", // labels.text.fill, 40
    labelHalo: "#292929", // labels.text.stroke, 16
    highwayLabel: "#666666",
    arterialLabel: "#666666",
  },
};

// Line widths (CSS px) by zoom: zoomed-out (bigger) cities get finer lines.
const width = (z12, z14) => ["interpolate", ["exponential", 1.6], ["zoom"], 12, z12, 14, z14];
// A line's width plus an outline of `edge` px on each side.
const outlined = (z12, z14, edge) => width(z12 + 2 * edge, z14 + 2 * edge);

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
  const local = roadClass("residential", "living_street", "unclassified", "pedestrian");
  const arterial = roadClass("secondary", "tertiary");
  const highway = roadClass("trunk", "primary");
  const motorway = roadClass("motorway");
  const roadLabel = (id, filter, color) => ({
    id,
    type: "symbol",
    source: "osm",
    filter: ["all", filter, ["has", "name"]],
    layout: {
      "symbol-placement": "line",
      "symbol-spacing": 300,
      "text-field": ["get", "name"],
      "text-font": [FONT],
      "text-size": 8,
      "text-letter-spacing": 0.02,
    },
    paint: { "text-color": color, "text-halo-color": c.labelHalo, "text-halo-width": 1 },
  });

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
      ...(c.rail ? [road("rail", layer("rail"), c.rail, width(0.5, 1))] : []),
      road("road-local", local, c.local, width(0.4, 1.2)),
      ...(c.arterialCasing ? [road("road-arterial-casing", arterial, c.arterialCasing, outlined(0.6, 1.8, 0.3))] : []),
      road("road-arterial", arterial, c.arterial, width(0.6, 1.8)),
      ...(c.highwayCasing
        ? [
            road("road-highway-casing", highway, c.highwayCasing, outlined(0.9, 2.6, 0.2)),
            road("road-motorway-casing", motorway, c.highwayCasing, outlined(1.2, 3.2, 0.2)),
          ]
        : []),
      road("road-highway", highway, c.highway, width(0.9, 2.6)),
      road("road-motorway", motorway, c.highway, width(1.2, 3.2)),
      roadLabel("road-label-arterial", roadClass("secondary"), c.arterialLabel),
      roadLabel("road-label-highway", roadClass("motorway", "trunk", "primary"), c.highwayLabel),
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
        paint: { "text-color": c.label, "text-halo-color": c.labelHalo, "text-halo-width": 1.5 },
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
