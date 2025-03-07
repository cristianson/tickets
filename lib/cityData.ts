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
      front: "/tickets/warsaw/warsaw_front.webp",
      back: "/tickets/warsaw/warsaw_back.webp",
    },
    backgroundImage: "/maps/bg_warsaw.webp",
  },
  {
    city: "Amsterdam, Netherlands",
    transport: "Train",
    ticketImage: {
      front: "/tickets/amsterdam/amsterdam_front.webp",
      back: "/tickets/amsterdam/amsterdam_back.webp",
    },
    backgroundImage: "/maps/bg_amsterdam.webp",
  },
  {
    city: "Berlin, Germany",
    transport: "Train",
    ticketImage: {
      front: "/tickets/berlin/berlin_front.webp",
      back: "/tickets/berlin/berlin_back.webp",
    },
    backgroundImage: "/maps/bg_berlin.webp",
  },
  {
    city: "Cluj-Napoca, Romania",
    transport: "Bus",
    ticketImage: {
      front: "/tickets/cluj/cluj_front.webp",
      back: "/tickets/cluj/cluj_back.webp",
    },
    backgroundImage: "/maps/bg_cluj.webp",
  },
  {
    city: "Hamburg, Germany",
    transport: "Train",
    ticketImage: {
      front: "/tickets/hamburg/hamburg_front.webp",
      back: "/tickets/hamburg/hamburg_back.webp",
    },
    backgroundImage: "/maps/bg_hamburg.webp",
  },
] as const;

export default Cities;
