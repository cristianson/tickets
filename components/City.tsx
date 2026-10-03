"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import type { CityData } from "@/lib/cityData";
import { MAP_QUALITY, MAP_SIZES, TICKET_SIZES } from "@/lib/images";
import { TOUCH_DEVICE_QUERY, useMediaQuery } from "@/lib/useMediaQuery";
import FlipCard from "./FlipCard";

const ANIMATION_OFFSET = 350;

// A swipe counts once the finger has travelled this far, or flicked this fast.
const SWIPE_DISTANCE = 80; // px
const SWIPE_VELOCITY = 400; // px/s

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
  priority?: boolean;
  onLoad?: () => void;
};

const TicketImage = ({ city, side, priority, onLoad }: TicketImageProps) => (
  <Image
    src={city.ticketImage[side]}
    alt={`${city.city} transport ticket ${side}`}
    sizes={TICKET_SIZES}
    placeholder="blur"
    loading={priority ? "eager" : undefined}
    fetchPriority={priority ? "high" : undefined}
    draggable={false}
    onLoad={onLoad}
    // On phones, never taller than the space between the title and controls
    // (two 74px button rows + 72px title + breathing room).
    className="h-auto max-h-[min(450px,calc(100dvh_-_260px))] w-auto max-w-full object-contain sm:max-h-[450px]"
  />
);

type TicketProps = {
  city: CityData;
  isFirst: boolean;
  isFlipped: boolean;
  onFlip: () => void;
};

function Ticket({ city, isFirst, isFlipped, onFlip }: TicketProps) {
  // The back face is hidden until flipped, so don't let it compete for
  // bandwidth with the front: request it once the front has loaded.
  const [frontLoaded, setFrontLoaded] = useState(false);

  return (
    <FlipCard
      isFlipped={isFlipped}
      onFlip={onFlip}
      // The first city's front face is fetched right away with high priority.
      front={
        <TicketImage
          city={city}
          side="front"
          priority={isFirst}
          onLoad={() => setFrontLoaded(true)}
        />
      }
      back={frontLoaded || isFlipped ? <TicketImage city={city} side="back" /> : null}
    />
  );
}

// Maps are the largest visible element (the LCP), so they load eagerly
// instead of waiting for the lazy-loading heuristics. On phones the map
// covers the whole ticket stage and fades out at the sides (see globals.css);
// on larger screens it is shown whole.
const mapClassName =
  "map-fade-x pointer-events-none select-none object-cover transition-opacity duration-300 ease-in-out sm:object-contain";

type Props = {
  city: CityData;
  direction: number;
  index: number;
  isFlipped: boolean;
  onSwipe: (step: 1 | -1) => void;
  onFlip: () => void;
};

export default function City({ city, direction, index, isFlipped, onSwipe, onFlip }: Props) {
  const isTouchDevice = useMediaQuery(TOUCH_DEVICE_QUERY);

  const handleDragEnd = (_: unknown, { offset, velocity }: PanInfo) => {
    if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) onSwipe(1);
    else if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) onSwipe(-1);
  };

  return (
    <div className="relative flex min-h-[300px] w-full max-w-[902px] flex-col items-center justify-center self-stretch overflow-hidden sm:min-h-[540px] sm:self-auto">
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
        quality={MAP_QUALITY}
        loading="eager"
        className={`${mapClassName} opacity-100 dark:opacity-0`}
      />
      <Image
        key={`${city.city}-dark`}
        src={city.backgroundImage.dark}
        alt=""
        fill
        sizes={MAP_SIZES}
        quality={MAP_QUALITY}
        loading="eager"
        className={`${mapClassName} opacity-0 dark:opacity-100`}
      />

      {/* The ticket column fills the full height so a swipe anywhere on it
          (not only on the ticket itself) changes city. */}
      <div className="relative z-20 flex max-h-[760px] min-h-[200px] w-full max-w-[382px] flex-1 flex-col items-center justify-center px-4 sm:max-w-[350px] sm:px-0">
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
            // Swipe left/right on touch devices; vertical scrolling still works.
            drag={isTouchDevice ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            className="flex w-full flex-1 items-center justify-center"
          >
            <Ticket city={city} isFirst={index === 0} isFlipped={isFlipped} onFlip={onFlip} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
