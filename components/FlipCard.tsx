"use client";

import { useEffect, type MouseEvent, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { screenTilt, useTiltPermission } from "@/lib/deviceTilt";
import { TOUCH_DEVICE_QUERY, useMediaQuery } from "@/lib/useMediaQuery";

const spring = {
  type: "spring",
  stiffness: 300,
  damping: 40,
} as const;

// Maximum tilt in degrees when the pointer is at the card's edge.
const MAX_TILT = 10;
// Card degrees per degree the phone is tilted away from its resting position.
const GYRO_GAIN = 0.6;
// How quickly the resting position follows the phone (per event, ~60/s), so
// the card re-centres after the user changes how they hold it.
const GYRO_RECENTER = 0.01;

const clampTilt = (deg: number) => Math.max(-MAX_TILT, Math.min(MAX_TILT, deg));

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
  const reduceMotion = useReducedMotion();
  const isTouchDevice = useMediaQuery(TOUCH_DEVICE_QUERY);
  const tiltPermission = useTiltPermission();
  const gyroAvailable = tiltPermission === "not-needed" || tiltPermission === "granted";

  // On phones, tilt the card with the device's gyroscope instead of the mouse.
  // On iOS this only starts once the user has enabled it (see TiltButton).
  useEffect(() => {
    if (!isTouchDevice || reduceMotion || !gyroAvailable) return;
    let rest: { x: number; y: number } | null = null;
    const onOrientation = (event: DeviceOrientationEvent) => {
      const tilt = screenTilt(event);
      if (!tilt) return;
      rest ??= tilt;
      rest.x += (tilt.x - rest.x) * GYRO_RECENTER;
      rest.y += (tilt.y - rest.y) * GYRO_RECENTER;
      rotateX.set(clampTilt(-(tilt.x - rest.x) * GYRO_GAIN));
      rotateY.set(clampTilt((tilt.y - rest.y) * GYRO_GAIN));
    };
    window.addEventListener("deviceorientation", onOrientation);
    return () => {
      window.removeEventListener("deviceorientation", onOrientation);
      rotateX.set(0);
      rotateY.set(0);
    };
  }, [isTouchDevice, reduceMotion, gyroAvailable, rotateX, rotateY]);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    // Only tilt on large screens with a real hover-capable pointer.
    if (reduceMotion || !window.matchMedia("(min-width: 1024px) and (hover: hover)").matches) {
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
