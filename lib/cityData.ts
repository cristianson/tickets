export type CityData = {
  city: string;
  transport: string;
  ticketImage: {
    front: string;
    back: string;
  };
  backgroundImage: {
    light: string;
    dark: string;
  };
};

const Cities: CityData[] = [
  {
    city: "Warsaw, Poland",
    transport: "Train",
    ticketImage: {
      front: "/tickets/warsaw/warsaw_front.webp",
      back: "/tickets/warsaw/warsaw_back.webp",
    },
    backgroundImage: {
      light: "/maps/light/bg_warsaw.webp",
      dark: "/maps/dark/bg_warsaw.webp",
    },
  },
  {
    city: "Amsterdam, Netherlands",
    transport: "Train",
    ticketImage: {
      front: "/tickets/amsterdam/amsterdam_front.webp",
      back: "/tickets/amsterdam/amsterdam_back.webp",
    },
    backgroundImage: {
      light: "/maps/light/bg_amsterdam.webp",
      dark: "/maps/dark/bg_amsterdam.webp",
    },
  },
  {
    city: "Berlin, Germany",
    transport: "Train",
    ticketImage: {
      front: "/tickets/berlin/berlin_front.webp",
      back: "/tickets/berlin/berlin_back.webp",
    },
    backgroundImage: {
      light: "/maps/light/bg_berlin.webp",
      dark: "/maps/dark/bg_berlin.webp",
    },
  },
  {
    city: "-Napoca, Romania",
    transport: "Bus",
    ticketImage: {
      front: "/tickets/cluj/cluj_front.webp",
      back: "/tickets/cluj/cluj_back.webp",
    },
    backgroundImage: {
      light: "/maps/light/bg_cluj.webp",
      dark: "/maps/dark/bg_cluj.webp",
    },
  },
  {
    city: "Hamburg, Germany",
    transport: "Train",
    ticketImage: {
      front: "/tickets/hamburg/hamburg_front.webp",
      back: "/tickets/hamburg/hamburg_back.webp",
    },
    backgroundImage: {
      light: "/maps/light/bg_hamburg.webp",
      dark: "/maps/dark/bg_hamburg.webp",
    },
  },
  {
    city: "Munich, Germany",
    transport: "Train",
    ticketImage: {
      front: "/tickets/munich/munich_front.webp",
      back: "/tickets/munich/munich_back.webp",
    },
    backgroundImage: {
      light: "/maps/light/bg_munich.webp",
      dark: "/maps/dark/bg_munich.webp",
    },
  },
] as const;

export default Cities;
