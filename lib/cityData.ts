export type CityData = {
  city: string;
  transport: string;
  ticketImage: string;
  backgroundImage: string;
};

const Cities: CityData[] = [
  {
    city: "Warsaw, Poland",
    transport: "Train",
    ticketImage: "/tickets/krakow.png",
    backgroundImage: "/maps/bg_krakow.png",
  },
  {
    city: "Amsterdam, Netherlands",
    transport: "Train",
    ticketImage: "/tickets/amsterdam.png",
    backgroundImage: "/maps/bg_amsterdam.png",
  },
] as const;

export default Cities;
