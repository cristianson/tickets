export type CityData = {
  city: string;
  transport: string;
  ticketImage: {
    front: string;
    back: string;
  };
  backgroundImage: string;
};

const Cities: CityData[] = [
  {
    city: "Warsaw, Poland",
    transport: "Train",
    ticketImage: {
      front: "/tickets/warsaw/warsaw_front.png",
      back: "/tickets/warsaw/warsaw_back.png",
    },
    backgroundImage: "/maps/bg_warsaw.png",
  },
  {
    city: "Amsterdam, Netherlands",
    transport: "Train",
    ticketImage: {
      front: "/tickets/amsterdam/amsterdam_front.png",
      back: "/tickets/amsterdam/amsterdam_back.png",
    },
    backgroundImage: "/maps/bg_amsterdam.png",
  },
  {
    city: "Berlin, Germany",
    transport: "Train",
    ticketImage: {
      front: "/tickets/berlin/berlin_front.png",
      back: "/tickets/berlin/berlin_back.png",
    },
    backgroundImage: "/maps/bg_berlin.png",
  },
  {
    city: "Cluj, Romania",
    transport: "Bus",
    ticketImage: {
      front: "/tickets/cluj/cluj_front.png",
      back: "/tickets/cluj/cluj_back.png",
    },
    backgroundImage: "/maps/bg_cluj.png",
  },
] as const;

export default Cities;
