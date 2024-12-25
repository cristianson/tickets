import Image from "next/image";
import { CityData } from "@/lib/cityData";
import { AnimatePresence, motion } from "framer-motion";

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

type Props = {
  city: CityData;
  direction: number;
  index: number;
};

export default function City({ city, direction, index }: Props) {
  return (
    <div
      className="w-full flex flex-col items-center justify-center max-w-[902px] min-h-[572px] relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `
  radial-gradient(50% 50% at 51.58% 50%, rgba(255, 255, 255, 0.00) 0%, #FFF 100%),
  url(${city.background})
`,
        transition: "background-image 0.5s ease-in-out",
      }}
    >
      {" "}
      {/* Location Text */}
      <div className="h-[72px] flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index + "-text"}
            initial="enter"
            animate="center"
            exit="exit"
            variants={fadeVariants}
            transition={{ opacity: { duration: 0.2 } }}
            className="flex flex-col items-center px-4 text-center"
          >
            <h1 className="font-inter text-[#181D27] text-xl font-bold tracking-[-0.04em] mb-1">
              {city.city}
            </h1>
            <h2 className="font-inter text-[#535862] text-lg tracking-[-0.03em]">
              {city.transport}
            </h2>
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Image Gallery */}
      <div className="relative w-full mt-12 flex justify-center">
        <div className="w-full max-w-[350px] relative mb-4">
          <div className="relative" style={{ minHeight: 200 }}>
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
                className="w-full absolute top-0 left-0"
              >
                <Image
                  src={city.image}
                  alt={`${city.city} transport ticket`}
                  width={350}
                  height={0}
                  style={{ width: "100%", height: "auto" }}
                  className="rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
