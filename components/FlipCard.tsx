"use client";

import { createContext, useContext, useEffect, type MouseEvent, type ReactNode } from "react";
import {
  motion,
  motionValue,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cardTilt, gyroTilt, MAX_TILT, startGyroTilt, useTiltPermission } from "@/lib/deviceTilt";
import { TOUCH_DEVICE_QUERY, useMediaQuery } from "@/lib/useMediaQuery";

const spring = {
  type: "spring",
  stiffness: 300,
  damping: 40,
} as const;

// The card's tilt (degrees around x and y), for the shine on each face.
const TiltContext = createContext<{ x: MotionValue<number>; y: MotionValue<number> }>({
  x: motionValue(0),
  y: motionValue(0),
});

// Light playing on a ticket face as it tilts: a glare where the light hits,
// a soft shade on the side turned away, and a faint holographic sheen. They
// move with the tilt and fade in the more the card is tilted, so a flat card
// looks untouched. Each layer is masked by the ticket image itself (`src` is
// the image's current, already-downloaded URL) so nothing spills onto the
// transparent corners. Separate layers because each needs its own blend mode
// to show on near-white paper.
export function TicketShine({ src }: { src: string | null }) {
  const tilt = useContext(TiltContext);
  const lightX = useTransform(tilt.y, (deg) => 50 + deg * 5);
  const lightY = useTransform(tilt.x, (deg) => 50 - deg * 5);
  const shadeX = useTransform(lightX, (x) => 100 - x);
  const shadeY = useTransform(lightY, (y) => 100 - y);
  const sheenPosition = useTransform(tilt.y, (deg) => 50 + deg * 6);
  const opacity = useTransform(() => Math.min(1, Math.hypot(tilt.x.get(), tilt.y.get()) / 7));
  const glare = useMotionTemplate`radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0) 55%)`;
  const shade = useMotionTemplate`radial-gradient(circle at ${shadeX}% ${shadeY}%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 70%)`;
  const sheenPositionCss = useMotionTemplate`${sheenPosition}% 50%`;
  if (!src) return null;
  const mask = `url("${src}")`;
  const layer = {
    WebkitMaskImage: mask,
    maskImage: mask,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    opacity,
  };
  const className = "pointer-events-none absolute inset-0";
  return (
    <>
      <motion.div
        aria-hidden
        className={`${className} mix-blend-multiply`}
        style={{ ...layer, backgroundImage: shade }}
      />
      <motion.div
        aria-hidden
        className={`${className} mix-blend-screen`}
        style={{ ...layer, backgroundImage: glare }}
      />
      <motion.div
        aria-hidden
        className={className}
        style={{
          ...layer,
          backgroundImage:
            "linear-gradient(110deg, transparent 30%, rgba(255,110,200,0.16) 42%, rgba(120,220,255,0.16) 50%, rgba(255,235,130,0.16) 58%, transparent 70%)",
          backgroundSize: "250% 100%",
          backgroundPosition: sheenPositionCss,
        }}
      />
    </>
  );
}

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

  // Share the tilt with effects outside the card (the map parallax).
  useEffect(() => {
    const unsubscribeX = rotateX.on("change", (deg) => cardTilt.x.set(deg));
    const unsubscribeY = rotateY.on("change", (deg) => cardTilt.y.set(deg));
    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [rotateX, rotateY]);

  // A soft shadow under the card, shifting with the tilt as if lit from above,
  // and narrowing as the card turns edge-on during a flip. It's a flat layer
  // behind the 3D card rather than part of it: in the same 3D space, the half
  // of the card swinging backwards mid-flip would pass behind it and darken.
  const shadowX = useTransform(rotateY, (deg) => -deg * 1.2);
  const shadowY = useTransform(rotateX, (deg) => 14 + deg * 1.2);
  const shadowScaleX = useTransform(flip, (deg) =>
    Math.max(0.15, Math.abs(Math.cos((deg * Math.PI) / 180)))
  );
  // The paper's edge, only visible while the card is edge-on mid-flip.
  const edgeRotateY = useTransform(flip, (deg) => 90 - deg);
  const edgeOpacity = useTransform(flip, (deg) => Math.max(0, 1 - Math.abs(deg - 90) / 30));

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
      className="flex cursor-pointer items-center justify-center"
      // Tap/click the ticket to flip it. framer-motion doesn't fire onTap when
      // the gesture turned into a drag, so swiping to change city won't flip.
      onTap={onFlip}
      whileHover={{ scale: 1.02 }}
      transition={spring}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative flex [perspective:1200px]">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-[4%] rounded-lg bg-black/25 blur-xl dark:bg-black/60"
          style={{ x: shadowX, y: shadowY, scaleX: shadowScaleX }}
        />
        <motion.div
          className="relative flex items-center justify-center [transform-style:preserve-3d]"
          style={{ rotateX, rotateY }}
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-y-[2%] left-1/2 -ml-[1.5px] w-[3px] rounded-sm bg-[#e7e1d3] dark:bg-[#cbc4b3]"
            style={{ rotateY: edgeRotateY, opacity: edgeOpacity }}
          />
          <motion.div
            className="relative flex items-center justify-center [backface-visibility:hidden] [transform-style:preserve-3d]"
            style={{ rotateY: frontRotateY, visibility: frontVisibility }}
            aria-hidden={isFlipped}
          >
            <TiltContext.Provider value={{ x: rotateX, y: rotateY }}>{front}</TiltContext.Provider>
          </motion.div>
          <motion.div
            className="absolute left-0 top-0 [backface-visibility:hidden] [transform-style:preserve-3d]"
            style={{ rotateY: backRotateY, visibility: backVisibility }}
            aria-hidden={!isFlipped}
          >
            <TiltContext.Provider value={{ x: rotateX, y: rotateY }}>{back}</TiltContext.Provider>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
