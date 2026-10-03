import { getImageProps, type StaticImageData } from "next/image";
import type { CityData } from "./cityData";

type Theme = "light" | "dark";

// `sizes` tells the browser how wide each image is actually rendered, so it
// downloads a matching variant instead of the full-size source. The same values
// are used for rendering and preloading so both resolve to the same URL.
export const TICKET_SIZES = "350px";

// Phones (below Tailwind's `sm`) show a crop of the middle of the map that
// covers the ticket stage; larger screens show the whole map, up to 902px wide.
const MOBILE_MAP_QUERY = "(max-width: 639px)";

// Next encodes AVIF quickly and with reduced colour resolution, which blurs the
// maps' thin streets and small labels; at quality 100 the full map matches the
// original. Phones' dense screens hide this, so their crop uses the default 75.
// Both must be listed in `images.qualities`.
export type MapVariant = "mobile" | "desktop";
export function mapImage(
  city: CityData,
  theme: Theme,
  variant: MapVariant
): { src: StaticImageData; sizes: string; quality: number } {
  return variant === "mobile"
    ? {
        src: city.mobileBackgroundImage[theme],
        // The stage is the screen height minus the two 74px button rows and the
        // 72px title; the crop (0.835 aspect ratio, see
        // scripts/optimize-images.mjs) is drawn at that height.
        sizes: "calc((100vh - 220px) * 0.835)",
        quality: 75,
      }
    : { src: city.backgroundImage[theme], sizes: "(max-width: 902px) 100vw, 902px", quality: 100 };
}

function preload(props: { src: string; srcSet?: string; sizes?: string }) {
  const img = new window.Image();
  if (props.sizes) img.sizes = props.sizes;
  if (props.srcSet) img.srcset = props.srcSet;
  img.src = props.src;
}

// Warm the cache for one map (the version this screen uses), e.g. the current
// city's map in the other theme so switching themes doesn't have to wait.
export function preloadMap(city: CityData, theme: Theme) {
  const variant = window.matchMedia(MOBILE_MAP_QUERY).matches ? "mobile" : "desktop";
  preload(getImageProps({ ...mapImage(city, theme, variant), alt: "", fill: true }).props);
}

// Warm the cache for a city the user is likely to open next: both ticket faces
// plus only the map for the active theme.
export function preloadCity(city: CityData, theme: Theme) {
  for (const src of [city.ticketImage.front, city.ticketImage.back]) {
    preload(getImageProps({ src, sizes: TICKET_SIZES, alt: "" }).props);
  }
  preloadMap(city, theme);
}
