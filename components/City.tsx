"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { CityData } from "@/lib/cityData";
import { AnimatePresence, motion } from "framer-motion";
import { withFlip } from "./withFlip";

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

export default function City({ city, direction, index, onToggleFlip }: Props) {
  const { resolvedTheme } = useTheme();

  const transition = { duration: 0.3, ease: "easeInOut" };

  return (
    <div className="w-full flex flex-col items-center justify-center max-w-[902px] min-h-[540px] relative transition-colors duration-300 ease-in-out overflow-hidden">
      {/* Light Background Image */}
      <motion.div
        className="absolute inset-0 z-0 bg-center bg-no-repeat bg-contain"
        style={{
          backgroundImage: `url(${city.backgroundImage.light})`,
        }}
        initial={false}
        animate={{ opacity: resolvedTheme === "light" ? 1 : 0 }}
        transition={transition}
      />
      {/* Dark Background Image */}
      <motion.div
        className="absolute inset-0 z-0 bg-center bg-no-repeat bg-contain"
        style={{
          backgroundImage: `url(${city.backgroundImage.dark})`,
        }}
        initial={false}
        animate={{ opacity: resolvedTheme === "dark" ? 1 : 0 }}
        transition={transition}
      />

      {/* Ticket Container */}
      <div
        className="w-full max-w-[350px] relative flex flex-col items-center justify-center z-20" // Above gradient
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
