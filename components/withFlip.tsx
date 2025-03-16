import type { ComponentType } from "react";
import { motion, useSpring } from "framer-motion";
import { useState, useRef, useEffect } from "react";

const spring = {
  type: "spring",
  stiffness: 300,
  damping: 40,
};

export function withFlip<T extends object>(Component: ComponentType<T>) {
  return (props: T & { onToggleFlip?: (toggleFn: () => void) => void }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    // Add new state and ref for mouse movement effect
    const [rotateXaxis, setRotateXaxis] = useState(0);
    const [rotateYaxis, setRotateYaxis] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    // Add springs for smooth animation
    const dx = useSpring(0, spring);
    const dy = useSpring(0, spring);

    // Handle mouse movement for 3D effect
    const handleMouseMove = (event: any) => {
      const element = ref.current;
      if (!element) return;

      // Check if the screen width is greater than a certain breakpoint (e.g., 1024px for desktop)
      if (window.innerWidth < 1024) {
        return; // Don't apply the effect on smaller devices
      }
      const elementRect = element.getBoundingClientRect();
      const elementWidth = elementRect.width;
      const elementHeight = elementRect.height;
      const elementCenterX = elementWidth / 2;
      const elementCenterY = elementHeight / 2;
      const mouseX = event.clientY - elementRect.y - elementCenterY;
      const mouseY = event.clientX - elementRect.x - elementCenterX;
      const degreeX = (mouseX / elementWidth) * 20;
      const degreeY = (mouseY / elementHeight) * 20;
      setRotateXaxis(degreeX);
      setRotateYaxis(degreeY);
    };

    const handleMouseEnd = () => {
      setRotateXaxis(0);
      setRotateYaxis(0);
    };

    useEffect(() => {
      dx.set(-rotateXaxis);
      dy.set(rotateYaxis);
    }, [rotateXaxis, rotateYaxis]);

    const toggleFlip = () => {
      setIsFlipped((prev) => !prev);
    };

    // Pass toggle function to parent
    props.onToggleFlip?.(toggleFlip);

    return (
      <div className="relative">
        <motion.div
          style={{
            perspective: "1200px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          whileHover={{ scale: 1.02 }}
          transition={spring}
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseEnd}

          // className="hover:shadow-2xl transition-shadow duration-300"
        >
          <motion.div
            style={{
              transformStyle: "preserve-3d",
              rotateX: dx,
              rotateY: dy,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? -180 : 0 }}
              transition={spring}
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
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
          </motion.div>
        </motion.div>
      </div>
    );
  };
}
