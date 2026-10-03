"use client";

import { useEffect, useId, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { cn, commonButtonStyles } from "@/lib/utils";
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

const iconAnimationProps = {
  initial: { y: -20, opacity: 0, rotate: -180 },
  animate: { y: 0, opacity: 1, rotate: 0 },
  exit: { y: 20, opacity: 0, rotate: 180 },
  transition: { duration: 0.3 },
};

export const ThemeToggleButton = () => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const filterId = useId();

  // The theme is only known on the client. Render the button shell during SSR
  // (so nothing shifts on hydration) and add the icon once mounted.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard next-themes hydration guard
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Toggle theme"}
      type="button"
      className={cn(
        commonButtonStyles,
        "fixed right-4 top-4 z-50 overflow-hidden rounded-full p-2"
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      whileHover={{ scale: 1.1, rotate: 90 }}
      whileTap={{ scale: 0.9, rotate: -90 }}
      transition={{ type: "tween", duration: 0.1, ease: "easeInOut" }}
    >
      <span className="block h-6 w-6">
      <AnimatePresence mode="wait" initial={false}>
        {mounted && isDark && (
          <motion.div key="sun" {...iconAnimationProps}>
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
                <InsetShadowFilter id={filterId} dy={1.2} blur={0.3} opacity={0.5} />
              </defs>
              {SUN_PATHS.map((d) => (
                <path key={d} filter={`url(#${filterId})`} d={d} fill="currentColor" />
              ))}
            </svg>
          </motion.div>
        )}
        {mounted && !isDark && (
          <motion.div key="moon" {...iconAnimationProps}>
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
                <InsetShadowFilter id={filterId} dy={1.2} blur={0.3} opacity={0.5} />
              </defs>
              <path filter={`url(#${filterId})`} d={MOON_PATH} fill="currentColor" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
      </span>
    </motion.button>
  );
};
