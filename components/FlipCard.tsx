"use client";

import { useEffect, type MouseEvent, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { gyroTilt, MAX_TILT, startGyroTilt, useTiltPermission } from "@/lib/deviceTilt";
import { TOUCH_DEVICE_QUERY, useMediaQuery } from "@/lib/useMediaQuery";

const spring = {
  type: "spring",
  stiffness: 300,
  damping: 40,
} as const;

type Props = {
  front: ReactNode;
  back: ReactNode;
  isFlipped: boolean;
  onFlip: () => void;
};

export default function FlipCard({ front, back, isFlipped, onFlip }: Props) {
  // Tilt is driven by motion values rather than React state so pointer
  // movement animates without re-rendering the component on every event.
  const rotateX = useSpring(useMotionValue(0), spring);
  const rotateY = useSpring(useMotionValue(0), spring);
  const reduceMotion = useReducedMotion();
  const isTouchDevice = useMediaQuery(TOUCH_DEVICE_QUERY);
  const tiltPermission = useTiltPermission();

  // Flip progress in degrees: 0 = front facing, 180 = back facing.
  const flip = useSpring(isFlipped ? 180 : 0, spring);
  useEffect(() => {
    if (reduceMotion) flip.jump(isFlipped ? 180 : 0);
    else flip.set(isFlipped ? 180 : 0);
  }, [isFlipped, reduceMotion, flip]);
  const frontRotateY = useTransform(flip, (deg) => -deg);
  const backRotateY = useTransform(flip, (deg) => 180 - deg);
  // Hide whichever face is turned away (it's edge-on at 90deg, so the switch
  // is invisible). `backface-visibility` alone isn't enough: Safari ignores it
  // in the flat snapshots taken for the theme cross-fade, which made the back
  // of the ticket flash during a theme switch.
  const frontVisibility = useTransform(flip, (deg) => (deg < 90 ? "visible" : "hidden"));
  const backVisibility = useTransform(flip, (deg) => (deg < 90 ? "hidden" : "visible"));
  const gyroAvailable = tiltPermission === "not-needed" || tiltPermission === "granted";

  // On phones, tilt the card with the device's gyroscope instead of the mouse.
  // On iOS this only starts once the user has enabled it (see TiltButton).
  // The gyro tilt is shared across the page (see lib/deviceTilt.ts), so a new
  // ticket starts at the current tilt rather than flat.
  useEffect(() => {
    if (!isTouchDevice || reduceMotion || !gyroAvailable) return;
    startGyroTilt();
    rotateX.jump(gyroTilt.x.get());
    rotateY.jump(gyroTilt.y.get());
    const unsubscribeX = gyroTilt.x.on("change", (deg) => rotateX.set(deg));
    const unsubscribeY = gyroTilt.y.on("change", (deg) => rotateY.set(deg));
    return () => {
      unsubscribeX();
      unsubscribeY();
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
      className="flex cursor-pointer items-center justify-center [perspective:1200px]"
      // Tap/click the ticket to flip it. framer-motion doesn't fire onTap when
      // the gesture turned into a drag, so swiping to change city won't flip.
      onTap={onFlip}
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
          style={{ rotateY: frontRotateY, visibility: frontVisibility }}
          aria-hidden={isFlipped}
        >
          {front}
        </motion.div>
        <motion.div
          className="absolute left-0 top-0 [backface-visibility:hidden] [transform-style:preserve-3d]"
          style={{ rotateY: backRotateY, visibility: backVisibility }}
          aria-hidden={!isFlipped}
        >
          {back}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
