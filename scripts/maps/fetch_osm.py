#!/usr/bin/env python3
"""Downloads the map data behind the map backgrounds into scripts/maps/data/.

The data is OpenStreetMap, as published by the Overture Maps Foundation on a
public S3 bucket (no account or key needed). For each city in cities.json it
keeps what the backgrounds draw (land, water, parks, roads, railways and place
names) inside the city's frame, clipped and simplified for the render size, as
one GeoJSON file per city that render.mjs draws.

Usage: pip install pyarrow shapely
       python3 scripts/maps/fetch_osm.py            (only missing cities)
       python3 scripts/maps/fetch_osm.py --force    (all cities)
       python3 scripts/maps/fetch_osm.py berlin     (just these cities)
"""

import json
import math
import os
import sys
from concurrent.futures import ThreadPoolExecutor

import pyarrow.fs as pafs
import pyarrow.parquet as pq
import shapely
from shapely.geometry import box, mapping

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "data")
BUCKET = "overturemaps-us-west-2"
RELEASE = "2026-09-23.1"

# Must match the render size in render.mjs (CSS pixels, MapLibre 512px tiles).
VIEW_WIDTH, VIEW_HEIGHT = 947, 567
# Fetch a little more than the frame so the zoom can be tweaked in cities.json
# (up to this much zoomed out) without fetching again.
ZOOM_MARGIN = 0.5

ROAD_CLASSES = {
    "motorway", "trunk", "primary", "secondary", "tertiary",
    "residential", "living_street", "unclassified", "pedestrian",
}
RAIL_CLASSES = {"standard_gauge", "narrow_gauge"}
# Parks only (not land cover from satellite imagery, which would paint whole
# regions green): the original maps colour parks and leave the rest blank.
PARK_CLASSES = {
    "park", "garden", "nature_reserve", "golf_course", "cemetery", "grave_yard",
    "recreation_ground", "village_green", "zoo", "allotments", "dog_park",
}
# Districts, towns and neighbourhoods (render.mjs keeps the ones that fit).
PLACE_SUBTYPES = {"locality", "borough", "macrohood", "neighborhood"}


def frame_bbox(center, zoom):
    """The lon/lat box a VIEW_WIDTH x VIEW_HEIGHT map at this zoom shows."""
    world = 512 * 2 ** zoom
    lon, lat = center
    x = (lon + 180) / 360 * world
    y = (1 - math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)) / math.pi) / 2 * world

    def to_lonlat(px, py):
        return (
            px / world * 360 - 180,
            math.degrees(2 * math.atan(math.exp(math.pi * (1 - 2 * py / world))) - math.pi / 2),
        )

    west, north = to_lonlat(x - VIEW_WIDTH / 2, y - VIEW_HEIGHT / 2)
    east, south = to_lonlat(x + VIEW_WIDTH / 2, y + VIEW_HEIGHT / 2)
    return west, south, east, north


def row_groups_in_bbox(meta, bbox):
    """Row groups whose bbox column statistics overlap the box (Overture files
    are spatially sorted, so a city touches only a few)."""
    names = [meta.schema.column(i).path for i in range(meta.num_columns)]
    idx = {k: names.index(f"bbox.{k}") for k in ("xmin", "xmax", "ymin", "ymax")}
    west, south, east, north = bbox
    for rg in range(meta.num_row_groups):
        group = meta.row_group(rg)
        stats = {k: group.column(i).statistics for k, i in idx.items()}
        if any(s is None or not s.has_min_max for s in stats.values()):
            yield rg
            continue
        if (stats["xmin"].min <= east and stats["xmax"].max >= west
                and stats["ymin"].min <= north and stats["ymax"].max >= south):
            yield rg


def read_type(fs, path, columns, bbox):
    """All rows of one Overture type whose bbox overlaps the box."""
    files = [f.path for f in fs.get_file_info(pafs.FileSelector(f"{BUCKET}/release/{RELEASE}/{path}/"))
             if f.path.endswith(".parquet")]
    west, south, east, north = bbox

    def read_file(file):
        pf = pq.ParquetFile(file, filesystem=fs)
        groups = list(row_groups_in_bbox(pf.metadata, bbox))
        if not groups:
            return []
        rows = pf.read_row_groups(groups, columns=columns + ["bbox"]).to_pylist()
        return [r for r in rows if r["bbox"]["xmin"] <= east and r["bbox"]["xmax"] >= west
                and r["bbox"]["ymin"] <= north and r["bbox"]["ymax"] >= south]

    with ThreadPoolExecutor(16) as pool:
        return [row for rows in pool.map(read_file, files) for row in rows]


def english_name(names):
    common = (names or {}).get("common") or []
    for key, value in common:
        if key == "en":
            return value
    return None


def fetch_city(fs, city):
    bbox = frame_bbox(city["center"], city["zoom"] - ZOOM_MARGIN)
    clip = box(*bbox)
    # About a rendered pixel (a quarter of a CSS pixel) at the final zoom, in degrees.
    tolerance = 0.25 * 360 / (512 * 2 ** city["zoom"])
    features = []

    def add(layer, wkb, props=None, simplify=True):
        geom = shapely.from_wkb(wkb)
        if not geom.intersects(clip):
            return
        geom = geom.intersection(clip)
        if simplify:
            geom = geom.simplify(tolerance, preserve_topology=True)
        if geom.is_empty:
            return
        features.append({"type": "Feature", "geometry": mapping(geom),
                         "properties": {"layer": layer, **(props or {})}})

    # Land (from the coastline), for cities by the sea: render.mjs draws the
    # sea as the background and the land over it. Inland it's all land.
    if city.get("coastal"):
        for r in read_type(fs, "theme=base/type=land", ["geometry", "subtype"], bbox):
            if r["subtype"] == "land" and "Polygon" in shapely.from_wkb(r["geometry"]).geom_type:
                add("land", r["geometry"])

    for r in read_type(fs, "theme=base/type=water", ["geometry", "subtype", "class"], bbox):
        geom_type = shapely.from_wkb(r["geometry"]).geom_type
        if "Polygon" in geom_type:
            add("water", r["geometry"])
        elif r["class"] in ("river", "canal"):
            add("waterway", r["geometry"], {"class": r["class"]})

    for r in read_type(fs, "theme=base/type=land_use", ["geometry", "subtype", "class"], bbox):
        if r["class"] in PARK_CLASSES and "Polygon" in shapely.from_wkb(r["geometry"]).geom_type:
            add("park", r["geometry"])

    segments = read_type(fs, "theme=transportation/type=segment",
                         ["geometry", "subtype", "class", "names", "level_rules", "road_flags"], bbox)
    for r in segments:
        # Tunnels and covered stretches aren't drawn (as on the original maps).
        if any((rule.get("value") or 0) < 0 for rule in (r["level_rules"] or [])):
            continue
        if any("is_tunnel" in (flag.get("values") or []) for flag in (r["road_flags"] or [])):
            continue
        if r["subtype"] == "road" and r["class"] in ROAD_CLASSES:
            add("road", r["geometry"], {"class": r["class"], "name": (r["names"] or {}).get("primary")})
        elif r["subtype"] == "rail" and r["class"] in RAIL_CLASSES:
            add("rail", r["geometry"])

    for r in read_type(fs, "theme=divisions/type=division",
                       ["geometry", "subtype", "names", "population", "cartography"], bbox):
        if r["subtype"] not in PLACE_SUBTYPES or not (r["names"] or {}).get("primary"):
            continue
        add("place", r["geometry"], {
            "subtype": r["subtype"],
            "name": r["names"]["primary"],
            "name_en": english_name(r["names"]),
            "population": r["population"] or 0,
            "prominence": ((r["cartography"] or {}).get("prominence")) or 0,
        }, simplify=False)

    return {"type": "FeatureCollection", "bbox": list(bbox), "features": features}


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    force = "--force" in sys.argv
    with open(os.path.join(HERE, "cities.json")) as f:
        cities = json.load(f)["cities"]
    os.makedirs(OUT_DIR, exist_ok=True)
    # Anonymous access; through the system's HTTPS proxy when there is one.
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    fs = pafs.S3FileSystem(anonymous=True, region="us-west-2", **({"proxy_options": proxy} if proxy else {}))
    for city in cities:
        out = os.path.join(OUT_DIR, f"{city['id']}.geojson")
        if args and city["id"] not in args:
            continue
        if not args and not force and os.path.exists(out):
            continue
        data = fetch_city(fs, city)
        with open(out, "w") as f:
            json.dump(data, f, separators=(",", ":"))
        counts = {}
        for feat in data["features"]:
            counts[feat["properties"]["layer"]] = counts.get(feat["properties"]["layer"], 0) + 1
        print(f"{city['id']}: {os.path.getsize(out) / 1048576:.1f}MB {counts}", flush=True)


if __name__ == "__main__":
    main()
