import { AnimatePresence, motion } from "framer-motion";

const fadeVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

type CityTextProps = {
  city: string;
  transport: string;
};

export default function CityText({ city, transport }: CityTextProps) {
  return (
    // aria-live announces the new city to screen readers when navigating.
    <div className="flex h-[72px] flex-col items-center justify-center" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.div
          key={city}
          initial="enter"
          animate="center"
          exit="exit"
          variants={fadeVariants}
          transition={{ opacity: { duration: 0.2 } }}
          className="flex flex-col items-center px-4 text-center"
        >
          <h1 className="mb-1 font-inter text-xl font-bold tracking-[-0.04em] text-gray-900 dark:text-gray-100">
            {city}
          </h1>
          <h2 className="font-inter text-lg font-medium tracking-[-0.03em] text-gray-600 dark:text-gray-300">
            {transport}
          </h2>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
