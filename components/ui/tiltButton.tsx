"use client";

import { AnimatePresence, motion } from "framer-motion";
import { requestTiltPermission, useTiltPermission } from "@/lib/deviceTilt";
import { cn, commonButtonStyles, pillButtonStyles } from "@/lib/utils";
import { TOUCH_DEVICE_QUERY, useMediaQuery } from "@/lib/useMediaQuery";

// Shown only on phones whose browser requires permission for motion sensors
// (iOS). Tapping it shows the system "Motion & Orientation" prompt; once the
// user answers, the button goes away. Android tilts without asking.
// Sits in the top-left corner, mirroring the theme toggle on the right.
export default function TiltButton() {
  const permission = useTiltPermission();
  const isTouchDevice = useMediaQuery(TOUCH_DEVICE_QUERY);
  const visible = isTouchDevice && permission === "prompt";

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={requestTiltPermission}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          // transition-colors: a CSS opacity transition would fight the fade below.
          className={cn(commonButtonStyles, pillButtonStyles, "fixed left-4 top-4 z-50 transition-colors")}
        >
          <span className="text-sm font-medium">Enable tilt</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Phone */}
            <rect
              x="6.5"
              y="3.5"
              width="7"
              height="13"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.66667"
              transform="rotate(-15 10 10)"
            />
            {/* Motion arcs */}
            <path
              d="M3 7.5C2.4 8.3 2.1 9.1 2.1 10s.3 1.7.9 2.5M17 7.5c.6.8.9 1.6.9 2.5s-.3 1.7-.9 2.5"
              stroke="currentColor"
              strokeWidth="1.66667"
              strokeLinecap="round"
            />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
