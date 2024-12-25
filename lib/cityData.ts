export type CityData = {
  city: string;
  transport: string;
  image: string;
  background: string;
};

const Cities: CityData[] = [
  {
    city: "Warsaw, Poland",
    transport: "Train",
    image: "/krakow.png",
    background: "/bg_krakow.png",
  },
  {
    city: "Amsterdam, Netherlands",
    transport: "Train",
    image: "/amsterdam.png",
    background: "/bg_amsterdam.png",
  },
] as const;

export default Cities;
