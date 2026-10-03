"use client";

import type { MouseEvent, ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const spring = {
  type: "spring",
  stiffness: 300,
  damping: 40,
} as const;

// Maximum tilt in degrees when the pointer is at the card's edge.
const MAX_TILT = 10;

type Props = {
  front: ReactNode;
  back: ReactNode;
  isFlipped: boolean;
};

export default function FlipCard({ front, back, isFlipped }: Props) {
  // Tilt is driven by motion values rather than React state so pointer
  // movement animates without re-rendering the component on every event.
  const rotateX = useSpring(useMotionValue(0), spring);
  const rotateY = useSpring(useMotionValue(0), spring);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    // Only tilt on large screens with a real hover-capable pointer.
    if (!window.matchMedia("(min-width: 1024px) and (hover: hover)").matches) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(-offsetY * 2 * MAX_TILT);
    rotateY.set(offsetX * 2 * MAX_TILT);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      className="flex items-center justify-center [perspective:1200px]"
      whileHover={{ scale: 1.02 }}
      transition={spring}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative flex items-center justify-center [transform-style:preserve-3d]"
        style={{ rotateX, rotateY }}
      >
        <motion.div
          className="flex items-center justify-center [backface-visibility:hidden] [transform-style:preserve-3d]"
          initial={false}
          animate={{ rotateY: isFlipped ? -180 : 0 }}
          transition={spring}
          aria-hidden={isFlipped}
        >
          {front}
        </motion.div>
        <motion.div
          className="absolute left-0 top-0 [backface-visibility:hidden] [transform-style:preserve-3d]"
          initial={false}
          animate={{ rotateY: isFlipped ? 0 : 180 }}
          transition={spring}
          aria-hidden={!isFlipped}
        >
          {back}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
