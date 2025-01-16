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
      front: "/tickets/warsaw.png",
      back: "/tickets/amsterdam.png",
    },
    backgroundImage: "/maps/bg_warsaw.png",
  },
  {
    city: "Amsterdam, Netherlands",
    transport: "Train",
    ticketImage: {
      front: "/tickets/amsterdam.png",
      back: "/tickets/amsterdam-back.png",
    },
    backgroundImage: "/maps/bg_amsterdam.png",
  },
] as const;

export default Cities;
