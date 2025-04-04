"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { CityData } from "@/lib/cityData";
import { AnimatePresence, motion } from "framer-motion";
import { withFlip } from "./withFlip";
import { useState, useEffect } from "react";

const fadeVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

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

type ImageProps = {
  ticketImage: CityData["ticketImage"];
  cityName: string;
  side?: "front" | "back";
};

const TicketImage = ({ ticketImage, cityName, side = "front" }: ImageProps) => (
  <Image
    src={side === "front" ? ticketImage.front : ticketImage.back}
    alt={`${cityName} transport ticket ${side}`}
    width={350}
    height={0}
    style={{
      maxHeight: "450px", //Max height of the ticket image
      width: "auto",
      height: "auto",
      objectFit: "contain",
      maxWidth: "100%",
    }}
    priority
  />
);

const FlippableTicket = withFlip(TicketImage);

type Props = {
  city: CityData;
  direction: number;
  index: number;
  onToggleFlip?: (toggleFn: () => void) => void;
};

const backgroundVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }, // Optional: define exit animation if needed
};

export default function City({ city, direction, index, onToggleFlip }: Props) {
  const { resolvedTheme } = useTheme();

  // State to manage the current background image URL
  // We update this *after* the delay to ensure the new image fades in
  const [currentBackgroundImageUrl, setCurrentBackgroundImageUrl] =
    useState("");

  // Determine the *target* background image based on the theme
  const targetBackgroundImageUrl =
    resolvedTheme === "dark"
      ? city.backgroundImage.dark
      : city.backgroundImage.light;

  // Define gradients for light and dark modes
  const lightGradient =
    "radial-gradient(50% 50% at 51.58% 50%, rgba(255, 255, 255, 0.00) 0%, #FFF 100%)";
  const darkGradient =
    "radial-gradient(50% 50% at 51.58% 50%, rgba(255, 255, 255, 0.00) 0%, #181D27 100%)"; // Dark mode gradient

  // Select the gradient based on the theme
  const backgroundGradient =
    resolvedTheme === "dark" ? darkGradient : lightGradient;

  // Effect to update the background image URL with a delay
  useEffect(() => {
    // Set the new background immediately for the key change
    setCurrentBackgroundImageUrl(targetBackgroundImageUrl);
  }, [targetBackgroundImageUrl]);

  return (
    <div className="w-full flex flex-col items-center justify-center max-w-[902px] min-h-[540px] relative transition-colors duration-300 ease-in-out overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={currentBackgroundImageUrl}
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `${backgroundGradient}, url(${currentBackgroundImageUrl})`,
          }}
          variants={backgroundVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.3, duration: 0.3, ease: "easeInOut" }}
        />
      </AnimatePresence>

      <div
        className="w-full max-w-[350px] relative flex flex-col items-center justify-center z-10"
        style={{ minHeight: 200, maxHeight: "760px", overflow: "visible" }}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 500, damping: 40 },
              opacity: { duration: 0.15 },
            }}
            className="w-full top-0 left-0"
          >
            <FlippableTicket
              ticketImage={city.ticketImage}
              cityName={city.city}
              onToggleFlip={onToggleFlip}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
