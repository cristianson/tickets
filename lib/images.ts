import { getImageProps } from "next/image";
import type { CityData } from "./cityData";

// `sizes` tells the browser how wide each image is actually rendered, so it
// downloads a matching variant instead of the full-size source. The same values
// are used for rendering and preloading so both resolve to the same URL.
export const TICKET_SIZES = "350px";
export const MAP_SIZES = "(max-width: 902px) 100vw, 902px";

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
    { src: city.backgroundImage[theme], sizes: MAP_SIZES },
  ];
  for (const { src, sizes } of images) {
    preload(getImageProps({ src, sizes, alt: "" }).props);
  }
}
