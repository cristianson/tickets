"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { CityData } from "@/lib/cityData";
import { MAP_SIZES, TICKET_SIZES } from "@/lib/images";
import FlipCard from "./FlipCard";

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

type TicketImageProps = {
  city: CityData;
  side: "front" | "back";
  isFirst: boolean;
};

const TicketImage = ({ city, side, isFirst }: TicketImageProps) => {
  // The first city's front face is the page's LCP element: fetch it right away.
  const isLcp = isFirst && side === "front";
  return (
    <Image
      src={city.ticketImage[side]}
      alt={`${city.city} transport ticket ${side}`}
      sizes={TICKET_SIZES}
      placeholder="blur"
      loading={isLcp ? "eager" : undefined}
      fetchPriority={isLcp ? "high" : undefined}
      className="h-auto max-h-[450px] w-auto max-w-full object-contain"
    />
  );
};

const mapClassName =
  "pointer-events-none select-none object-contain transition-opacity duration-300 ease-in-out";

type Props = {
  city: CityData;
  direction: number;
  index: number;
  isFlipped: boolean;
};

export default function City({ city, direction, index, isFlipped }: Props) {
  return (
    <div className="relative flex min-h-[540px] w-full max-w-[902px] flex-col items-center justify-center overflow-hidden">
      {/* Both theme maps are rendered and cross-faded with CSS, so the correct
          one shows on first paint (no wait for hydration) and theme toggles
          animate without JavaScript. Keyed by city so a slow-loading map
          never leaves the previous city's map on screen. */}
      <Image
        key={`${city.city}-light`}
        src={city.backgroundImage.light}
        alt=""
        fill
        sizes={MAP_SIZES}
        className={`${mapClassName} opacity-100 dark:opacity-0`}
      />
      <Image
        key={`${city.city}-dark`}
        src={city.backgroundImage.dark}
        alt=""
        fill
        sizes={MAP_SIZES}
        className={`${mapClassName} opacity-0 dark:opacity-100`}
      />

      <div className="relative z-20 flex max-h-[760px] min-h-[200px] w-full max-w-[350px] flex-col items-center justify-center">
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
            className="w-full"
          >
            <FlipCard
              isFlipped={isFlipped}
              front={<TicketImage city={city} side="front" isFirst={index === 0} />}
              back={<TicketImage city={city} side="back" isFirst={index === 0} />}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
