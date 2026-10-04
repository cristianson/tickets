"use client";

import { useCallback, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { useTheme } from "next-themes";
import ChevronButton from "./ui/chevronButton";
import FlipButton from "./ui/flipButton";
import Cities from "@/lib/cityData";
import { preloadCity, preloadMap } from "@/lib/images";
import City from "./City";
import CityText from "./ui/cityText";

const wrap = (index: number) => (index + Cities.length) % Cities.length;

export default function ImageGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const { resolvedTheme } = useTheme();
  const currentCity = Cities[currentIndex];

  const paginate = useCallback((step: 1 | -1) => {
    setDirection(step);
    setCurrentIndex((index) => wrap(index + step));
    setIsFlipped(false);
  }, []);

  const goToPrevious = () => paginate(-1);
  const goToNext = () => paginate(1);
  const toggleFlip = () => setIsFlipped((flipped) => !flipped);

  // Only warm up the neighbouring cities once the browser is idle, instead of
  // downloading every image in the gallery on page load.
  useEffect(() => {
    if (!resolvedTheme) return;
    const theme = resolvedTheme === "dark" ? "dark" : "light";
    const run = () => {
      preloadCity(Cities[wrap(currentIndex + 1)], theme);
      preloadCity(Cities[wrap(currentIndex - 1)], theme);
      // The other theme's map isn't downloaded with the page (it's hidden).
      preloadMap(Cities[currentIndex], theme === "dark" ? "light" : "dark");
    };
    // Safari has no requestIdleCallback; fall back to a short timeout there.
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(run, 500);
    return () => window.clearTimeout(id);
  }, [currentIndex, resolvedTheme]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key === "ArrowLeft") paginate(-1);
      else if (event.key === "ArrowRight") paginate(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paginate]);

  return (
    <MotionConfig reducedMotion="user">
      {/* Phones: the controls are fixed to the screen corners, mirroring the
          top buttons; the page reserves room for both rows (16px + 42px + 16px)
          and the ticket stage fills the space in between, so nothing moves when
          tickets of different shapes come and go.
          Larger screens: everything centred as one group. */}
      <div className="flex min-h-[100dvh] flex-col items-center py-[74px] sm:min-h-screen sm:justify-center sm:py-0">
        <CityText city={currentCity.city} transport={currentCity.transport} />
        <div className="flex w-full flex-1 flex-row items-center justify-center gap-4 sm:flex-none sm:px-12">
          <ChevronButton
            className="hidden sm:flex"
            onClick={goToPrevious}
            aria-label="Previous ticket"
            variant="previous"
          />
          <City
            city={currentCity}
            direction={direction}
            index={currentIndex}
            isFlipped={isFlipped}
            onSwipe={paginate}
            onFlip={toggleFlip}
          />
          <ChevronButton
            className="hidden sm:flex"
            onClick={goToNext}
            aria-label="Next ticket"
            variant="next"
          />
        </div>
        {/* Phones: arrows bottom-left, Flip bottom-right, lined up with the
            Enable tilt and theme buttons above. Larger screens: Flip centred
            under the ticket (the arrows sit beside it). */}
        <div className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between sm:static sm:justify-center">
          <div className="flex flex-row items-center gap-4 sm:hidden">
            <ChevronButton onClick={goToPrevious} aria-label="Previous ticket" variant="previous" />
            <ChevronButton onClick={goToNext} aria-label="Next ticket" variant="next" />
          </div>
          <FlipButton onClick={toggleFlip} isFlipped={isFlipped} />
        </div>
      </div>
    </MotionConfig>
  );
}
