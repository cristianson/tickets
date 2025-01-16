import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { useState } from "react";

const spring = {
  type: "spring",
  stiffness: 300,
  damping: 40,
};

export function withFlip<T extends object>(Component: ComponentType<T>) {
  return (props: T & { onToggleFlip?: (toggleFn: () => void) => void }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const toggleFlip = () => {
      setIsFlipped((prev) => !prev);
    };

    // Pass toggle function to parent
    props.onToggleFlip?.(toggleFlip);

    return (
      <div className="relative">
        <div style={{ perspective: "1200px" }}>
          <motion.div
            animate={{ rotateY: isFlipped ? -180 : 0 }}
            transition={spring}
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            <Component {...props} side="front" />
          </motion.div>
          <motion.div
            initial={{ rotateY: 180 }}
            animate={{ rotateY: isFlipped ? 0 : 180 }}
            transition={spring}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            <Component {...props} side="back" />
          </motion.div>
        </div>
      </div>
    );
  };
}
