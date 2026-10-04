import { useSyncExternalStore } from "react";

// Subscribes to a CSS media query. Always false during server rendering.
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

// Phones and tablets: no hover, finger input.
export const TOUCH_DEVICE_QUERY = "(hover: none) and (pointer: coarse)";
