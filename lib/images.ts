import { getImageProps } from "next/image";
import type { CityData } from "./cityData";

// `sizes` tells the browser how wide each image is actually rendered, so it
// downloads a matching variant instead of the full-size source. The same values
// are used for rendering and preloading so both resolve to the same URL.
export const TICKET_SIZES = "350px";
// On phones the map is cropped to cover a tall stage, so it renders ~2.5x the
// screen width (see City.tsx).
export const MAP_SIZES = "(max-width: 639px) 250vw, (max-width: 902px) 100vw, 902px";
// The maps are faint backdrops: quality 50 is visually identical to the default
// 75 there and ~40% smaller. Must be listed in `images.qualities`.
export const MAP_QUALITY = 50;

function preload(props: ReturnType<typeof getImageProps>["props"]) {
  const img = new window.Image();
  if (props.sizes) img.sizes = props.sizes;
  if (props.srcSet) img.srcset = props.srcSet;
  img.src = props.src;
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
