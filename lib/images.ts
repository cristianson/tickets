import { getImageProps } from "next/image";
import type { CityData } from "./cityData";

// `sizes` tells the browser how wide each image is actually rendered, so it
// downloads a matching variant instead of the full-size source. The same values
// are used for rendering and preloading so both resolve to the same URL.
export const TICKET_SIZES = "350px";
// On phones the map covers the ticket stage (the screen height minus the two
// 74px button rows and the 72px title), so its drawn width is the stage height
// times the map's aspect ratio (3787 / 2267). See City.tsx.
export const MAP_SIZES =
  "(max-width: 639px) calc((100vh - 220px) * 1.67), (max-width: 902px) 100vw, 902px";
// The maps are faint backdrops: quality 60 looks the same as the default 75
// there (50 starts to smudge thin streets on the dark maps) and is ~30%
// smaller. Must be listed in `images.qualities`.
export const MAP_QUALITY = 60;

function preload(props: ReturnType<typeof getImageProps>["props"]) {
  const img = new window.Image();
  if (props.sizes) img.sizes = props.sizes;
  if (props.srcSet) img.srcset = props.srcSet;
  img.src = props.src;
}

// Warm the cache for one map, e.g. the current city's map in the other theme
// so switching themes doesn't have to wait for it.
export function preloadMap(city: CityData, theme: "light" | "dark") {
  preload(
    getImageProps({
      src: city.backgroundImage[theme],
      sizes: MAP_SIZES,
      quality: MAP_QUALITY,
      alt: "",
    }).props
  );
}

// Warm the cache for a city the user is likely to open next: both ticket faces
// plus only the map for the active theme.
export function preloadCity(city: CityData, theme: "light" | "dark") {
  const images = [
    { src: city.ticketImage.front, sizes: TICKET_SIZES },
    { src: city.ticketImage.back, sizes: TICKET_SIZES },
    { src: city.backgroundImage[theme], sizes: MAP_SIZES, quality: MAP_QUALITY },
  ];
  for (const { src, sizes, quality } of images) {
    preload(getImageProps({ src, sizes, quality, alt: "" }).props);
  }
}
