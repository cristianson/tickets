"use client";

import { useEffect, useId, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { cn, commonButtonStyles, iconButtonStyles } from "@/lib/utils";
import InsetShadowFilter from "./ui/insetShadowFilter";

const SUN_PATHS = [
  "M13 2C13 1.44772 12.5523 1 12 1C11.4477 1 11 1.44772 11 2V4C11 4.55228 11.4477 5 12 5C12.5523 5 13 4.55228 13 4V2Z",
  "M13 20C13 19.4477 12.5523 19 12 19C11.4477 19 11 19.4477 11 20V22C11 22.5523 11.4477 23 12 23C12.5523 23 13 22.5523 13 22V20Z",
  "M1 12C1 11.4477 1.44772 11 2 11H4C4.55228 11 5 11.4477 5 12C5 12.5523 4.55228 13 4 13H2C1.44772 13 1 12.5523 1 12Z",
  "M5.60701 4.1928C5.21649 3.80227 4.58332 3.80227 4.1928 4.1928C3.80227 4.58332 3.80227 5.21649 4.1928 5.60701L5.60701 7.02122C5.99753 7.41175 6.6307 7.41175 7.02122 7.02122C7.41175 6.6307 7.41175 5.99753 7.02122 5.60701L5.60701 4.1928Z",
  "M19.8072 4.1928C20.1978 4.58332 20.1978 5.21649 19.8072 5.60701L18.393 7.02122C18.0025 7.41175 17.3693 7.41175 16.9788 7.02122C16.5883 6.6307 16.5883 5.99753 16.9788 5.60701L18.393 4.1928C18.7835 3.80227 19.4167 3.80227 19.8072 4.1928Z",
  "M7.02122 18.397C7.41175 18.0065 7.41175 17.3734 7.02122 16.9828C6.6307 16.5923 5.99753 16.5923 5.60701 16.9828L4.1928 18.397C3.80227 18.7876 3.80227 19.4207 4.1928 19.8113C4.58332 20.2018 5.21649 20.2018 5.60701 19.8113L7.02122 18.397Z",
  "M16.9788 16.9828C17.3693 16.5923 18.0025 16.5923 18.393 16.9828L19.8072 18.397C20.1978 18.7876 20.1978 19.4207 19.8072 19.8113C19.4167 20.2018 18.7835 20.2018 18.393 19.8113L16.9788 18.397C16.5883 18.0065 16.5883 17.3734 16.9788 16.9828Z",
  "M20 11C19.4477 11 19 11.4477 19 12C19 12.5523 19.4477 13 20 13H22C22.5523 13 23 12.5523 23 12C23 11.4477 22.5523 11 22 11H20Z",
  "M12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6Z",
];

const MOON_PATH =
  "M6.8002 1.80907C6.92881 1.52469 6.86785 1.19039 6.64716 0.969692C6.42647 0.748998 6.09216 0.688047 5.80779 0.816654C2.8267 2.16482 0.75 5.16573 0.75 8.65329C0.75 13.4011 4.59889 17.25 9.34673 17.25C12.8343 17.25 15.8352 15.1733 17.1834 12.1922C17.312 11.9079 17.251 11.5736 17.0303 11.3529C16.8096 11.1322 16.4753 11.0712 16.191 11.1998C15.3011 11.6023 14.3128 11.8267 13.2701 11.8267C9.35068 11.8267 6.17337 8.64934 6.17337 4.72992C6.17337 3.68721 6.39777 2.69893 6.8002 1.80907Z";

// The sun lives on the left and the moon on the right: switching to light
// rolls the sun out to the left while the moon rolls in from the right, and
// the reverse when switching to dark. Both icons move at the same time (no gap
// with an empty button) and are clipped by the round button.
const ICON_OFFSET = 34; // px: just outside the 42px circle
// The icons roll like wheels: a 24px icon (12px radius) that travels
// ICON_OFFSET turns by ICON_OFFSET / 12 radians, so it spins about 160deg
// before settling. Moving right turns clockwise, moving left anticlockwise.
const ROLL = Math.round((ICON_OFFSET / 12) * (180 / Math.PI));

// `slide` is passed through AnimatePresence's `custom`, so an icon that is on
// its way out still gets the current value. When false (page load, reduced
// motion) the icons only fade.
const iconVariants: Variants = {
  sunHidden: (slide: boolean) =>
    slide ? { x: -ICON_OFFSET, rotate: -ROLL, opacity: 0 } : { opacity: 0 },
  moonHidden: (slide: boolean) =>
    slide ? { x: ICON_OFFSET, rotate: ROLL, opacity: 0 } : { opacity: 0 },
  shown: { x: 0, rotate: 0, opacity: 1 },
};
// x and rotate share one spring, so rotation stays locked to distance
// travelled (rolling, not sliding).
const iconTransition = {
  default: { type: "spring", duration: 0.6, bounce: 0 },
  opacity: { duration: 0.3, ease: "easeInOut" },
} as const;

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

export const ThemeToggleButton = () => {
  const [mounted, setMounted] = useState(false);
  // Slide only for switches made with this button; the icon just fades in on
  // page load.
  const [hasToggled, setHasToggled] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  // Both icons are on screen together mid-switch, so each needs its own id.
  const filterId = useId();

  // The theme is only known on the client. Render the button shell during SSR
  // (so nothing shifts on hydration) and add the icon once mounted.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard next-themes hydration guard
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setHasToggled(true);

    // Cross-fade the whole page between themes in one step with the View
    // Transitions API. Without it, the background, text, buttons and maps each
    // change on their own timing (text instantly, background over 200ms, maps
    // over 300ms), which reads as a flicker.
    const doc = document as ViewTransitionDocument;
    if (!doc.startViewTransition || reduceMotion) {
      setTheme(next);
      return;
    }
    const root = document.documentElement;
    // Show each theme's final colours straight away inside the cross-fade.
    root.classList.add("theme-switching");
    const transition = doc.startViewTransition(() => {
      // next-themes applies the class in an effect, after the browser has
      // captured the new state, so apply it synchronously here as well.
      root.classList.remove("light", "dark");
      root.classList.add(next);
      root.style.colorScheme = next;
      setTheme(next);
    });
    transition.finished.finally(() => root.classList.remove("theme-switching"));
  };

  const slide = hasToggled && !reduceMotion;

  return (
    <motion.button
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Toggle theme"}
      type="button"
      className={cn(
        commonButtonStyles,
        iconButtonStyles,
        // Only colours use CSS transitions: a CSS transition on `transform`
        // would fight the per-frame transforms set by framer-motion.
        "theme-toggle fixed right-4 top-4 z-50 overflow-hidden transition-colors [view-transition-name:theme-toggle]"
      )}
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <span className="relative block h-6 w-6">
        <AnimatePresence initial={false} custom={slide}>
          {mounted && isDark && (
            <motion.div
              key="sun"
              className="absolute inset-0"
              variants={iconVariants}
              custom={slide}
              initial="sunHidden"
              animate="shown"
              exit="sunHidden"
              transition={iconTransition}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <defs>
                  <InsetShadowFilter id={`${filterId}-sun`} dy={1.2} blur={0.3} opacity={0.5} />
                </defs>
                {SUN_PATHS.map((d) => (
                  <path key={d} filter={`url(#${filterId}-sun)`} d={d} fill="currentColor" />
                ))}
              </svg>
            </motion.div>
          )}
          {mounted && !isDark && (
            <motion.div
              key="moon"
              className="absolute inset-0"
              variants={iconVariants}
              custom={slide}
              initial="moonHidden"
              animate="shown"
              exit="moonHidden"
              transition={iconTransition}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <defs>
                  <InsetShadowFilter id={`${filterId}-moon`} dy={1.2} blur={0.3} opacity={0.5} />
                </defs>
                <path filter={`url(#${filterId}-moon)`} d={MOON_PATH} fill="currentColor" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
};
