"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./ui/button";

type ImageData = {
  city: string;
  transport: string;
};

const IMAGES = [
  "https://i.ibb.co/vBqpxC2/Subject-2.png",
  "https://i.ibb.co/zN1BKjs/Subject.png",
] as const;

const IMAGE_DATA: ImageData[] = [
  { city: "Warsaw, Poland", transport: "Train" },
  { city: "Amsterdam, Netherlands", transport: "Train" },
];

const BACKGROUND_IMAGES = [
  "https://i.ibb.co/sHQVNLw/Krakow.png",
  "https://i.ibb.co/PGM7WnM/Amsterdam-2.png",
] as const;

const ANIMATION_OFFSET = 350;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? ANIMATION_OFFSET : -ANIMATION_OFFSET,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? ANIMATION_OFFSET : -ANIMATION_OFFSET,
    opacity: 0,
  }),
};

const fadeVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function ImageGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? IMAGES.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) =>
      prevIndex === IMAGES.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="flex flex-row items-center justify-center min-h-screen px-4 sm:px-12">
      {/* Desktop Navigation */}
      <div className="fixed bottom-12 left-0 right-0 w-full flex justify-center items-center gap-8 sm:hidden z-[100]">
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

      {/* Mobile Navigation */}
      <div className="hidden sm:flex absolute left-4 right-4 justify-between items-center">
        <Button
          onClick={goToPrevious}
          aria-label="Previous image"
          variant="previous"
        />
        <Button onClick={goToNext} aria-label="Next image" variant="next" />
      </div>

      <div
        className="w-full flex flex-col items-center justify-center max-w-[902px] min-h-[572px] mx-4 relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `
      radial-gradient(50% 50% at 51.58% 50%, rgba(255, 255, 255, 0.00) 0%, #FFF 100%),
      url(${BACKGROUND_IMAGES[currentIndex]})
    `,
          transition: "background-image 0.5s ease-in-out",
        }}
      >
        {" "}
        {/* Location Text */}
        <div className="h-[72px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex + "-text"}
              initial="enter"
              animate="center"
              exit="exit"
              variants={fadeVariants}
              transition={{ opacity: { duration: 0.2 } }}
              className="flex flex-col items-center px-4 text-center"
            >
              <h1 className="font-inter text-[#181D27] text-xl sm:text-2xl font-bold tracking-[-0.04em] mb-1">
                {IMAGE_DATA[currentIndex].city}
              </h1>
              <h2 className="font-inter text-[#535862] text-lg sm:text-xl tracking-[-0.03em]">
                {IMAGE_DATA[currentIndex].transport}
              </h2>
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Image Gallery */}
        <div className="relative w-full mt-12 flex justify-center">
          <div className="w-full max-w-[350px] relative mb-4">
            <div className="relative" style={{ minHeight: 200 }}>
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 500, damping: 40 },
                    opacity: { duration: 0.15 },
                  }}
                  className="w-full absolute top-0 left-0"
                >
                  <Image
                    src={IMAGES[currentIndex]}
                    alt={`${IMAGE_DATA[currentIndex].city} transport ticket`}
                    width={350}
                    height={0}
                    style={{ width: "100%", height: "auto" }}
                    className="rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
