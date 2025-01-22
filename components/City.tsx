import Image from "next/image";
import { CityData } from "@/lib/cityData";
import { AnimatePresence, motion } from "framer-motion";
import { withFlip } from "./withFlip";

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

type ImageProps = {
  ticketImage: CityData["ticketImage"];
  cityName: string;
  side?: "front" | "back";
};

const TicketImage = ({ ticketImage, cityName, side = "front" }: ImageProps) => (
  <Image
    src={side === "front" ? ticketImage.front : ticketImage.back}
    alt={`${cityName} transport ticket ${side}`}
    width={350}
    height={0}
    style={{ width: "100%", height: "auto" }}
    // className="shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
    priority
  />
);

const FlippableTicket = withFlip(TicketImage);

type Props = {
  city: CityData;
  direction: number;
  index: number;
  onToggleFlip?: (toggleFn: () => void) => void;
};

export default function City({ city, direction, index, onToggleFlip }: Props) {
  return (
    <div
      className="w-full flex flex-col items-center justify-center max-w-[902px] min-h-[540px] relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `
          radial-gradient(50% 50% at 51.58% 50%, rgba(255, 255, 255, 0.00) 0%, #FFF 100%),
          url(${city.backgroundImage})
        `,
        transition: "background-image 0.5s ease-in-out",
      }}
    >
      <div
        className="w-full max-w-[350px] relative flex flex-col items-center justify-center"
        style={{ minHeight: 200 }}
      >
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
            className="w-full top-0 left-0"
          >
            <FlippableTicket
              ticketImage={city.ticketImage}
              cityName={city.city}
              onToggleFlip={onToggleFlip}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
