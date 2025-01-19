import { AnimatePresence, motion } from "framer-motion";

const fadeVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

type CityTextProps = {
  city: string;
  transport: string;
  index: number;
};

export default function CityText({ city, transport, index }: CityTextProps) {
  return (
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
            {city}
          </h1>
          <h2 className="font-inter text-[#535862] text-lg tracking-[-0.03em]">
            {transport}
          </h2>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
