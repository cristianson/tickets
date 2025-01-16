"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./ui/button";
import FlipButton from "./ui/flipButton";
import Cities from "@/lib/cityData";
import City from "./City";

export default function ImageGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const toggleFlipRef = useRef<() => void>();

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? Cities.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) =>
      prevIndex === Cities.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleToggleFlip = (toggleFn: () => void) => {
    toggleFlipRef.current = toggleFn;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <div className="flex flex-row w-full items-center justify-center px-4 sm:px-12 gap-4">
        <Button
          className="hidden sm:flex"
          onClick={goToPrevious}
          aria-label="Previous image"
          variant="previous"
        />
        <City
          city={Cities[currentIndex]}
          direction={direction}
          index={currentIndex}
          onToggleFlip={handleToggleFlip}
        />
        <Button
          className="hidden sm:flex"
          onClick={goToNext}
          aria-label="Next image"
          variant="next"
        />
      </div>
      {/* Mobile Navigation */}
      <div className="flex sm:hidden flex-row items-center gap-8">
        <Button
          onClick={goToPrevious}
          aria-label="Previous image"
          variant="previous"
          isMobile
        />
        <Button
          onClick={goToNext}
          aria-label="Next image"
          variant="next"
          isMobile
        />
      </div>
      <FlipButton
        onClick={() => toggleFlipRef.current?.()}
        className="absolute bottom-4 right-4"
      />
    </div>
  );
}
