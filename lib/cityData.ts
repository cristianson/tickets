import type { StaticImageData } from "next/image";

import warsawFront from "@/assets/tickets/warsaw/warsaw_front.webp";
import warsawBack from "@/assets/tickets/warsaw/warsaw_back.webp";
import warsawMapLight from "@/assets/maps/light/bg_warsaw.webp";
import warsawMapDark from "@/assets/maps/dark/bg_warsaw.webp";
import amsterdamFront from "@/assets/tickets/amsterdam/amsterdam_front.webp";
import amsterdamBack from "@/assets/tickets/amsterdam/amsterdam_back.webp";
import amsterdamMapLight from "@/assets/maps/light/bg_amsterdam.webp";
import amsterdamMapDark from "@/assets/maps/dark/bg_amsterdam.webp";
import berlinFront from "@/assets/tickets/berlin/berlin_front.webp";
import berlinBack from "@/assets/tickets/berlin/berlin_back.webp";
import berlinMapLight from "@/assets/maps/light/bg_berlin.webp";
import berlinMapDark from "@/assets/maps/dark/bg_berlin.webp";
import clujFront from "@/assets/tickets/cluj/cluj_front.webp";
import clujBack from "@/assets/tickets/cluj/cluj_back.webp";
import clujMapLight from "@/assets/maps/light/bg_cluj.webp";
import clujMapDark from "@/assets/maps/dark/bg_cluj.webp";
import hamburgFront from "@/assets/tickets/hamburg/hamburg_front.webp";
import hamburgBack from "@/assets/tickets/hamburg/hamburg_back.webp";
import hamburgMapLight from "@/assets/maps/light/bg_hamburg.webp";
import hamburgMapDark from "@/assets/maps/dark/bg_hamburg.webp";
import munichFront from "@/assets/tickets/munich/munich_front.webp";
import munichBack from "@/assets/tickets/munich/munich_back.webp";
import munichMapLight from "@/assets/maps/light/bg_munich.webp";
import munichMapDark from "@/assets/maps/dark/bg_munich.webp";
import funchalFront from "@/assets/tickets/funchal/funchal_front.webp";
import funchalBack from "@/assets/tickets/funchal/funchal_back.webp";
import funchalMapLight from "@/assets/maps/light/bg_funchal.webp";
import funchalMapDark from "@/assets/maps/dark/bg_funchal.webp";
import bucharestFront from "@/assets/tickets/bucharest/bucharest_front.webp";
import bucharestBack from "@/assets/tickets/bucharest/bucharest_back.webp";
import bucharestMapLight from "@/assets/maps/light/bg_bucharest.webp";
import bucharestMapDark from "@/assets/maps/dark/bg_bucharest.webp";

// Images are statically imported so Next.js knows their dimensions (no layout
// shift), generates blur placeholders, and serves them from content-hashed,
// immutable-cached URLs.
export type CityData = {
  city: string;
  transport: string;
  ticketImage: {
    front: StaticImageData;
    back: StaticImageData;
  };
  backgroundImage: {
    light: StaticImageData;
    dark: StaticImageData;
  };
};

const Cities: CityData[] = [
  {
    city: "Warsaw, Poland",
    transport: "Train",
    ticketImage: { front: warsawFront, back: warsawBack },
    backgroundImage: { light: warsawMapLight, dark: warsawMapDark },
  },
  {
    city: "Amsterdam, Netherlands",
    transport: "Train",
    ticketImage: { front: amsterdamFront, back: amsterdamBack },
    backgroundImage: { light: amsterdamMapLight, dark: amsterdamMapDark },
  },
  {
    city: "Berlin, Germany",
    transport: "Train",
    ticketImage: { front: berlinFront, back: berlinBack },
    backgroundImage: { light: berlinMapLight, dark: berlinMapDark },
  },
  {
    city: "Cluj-Napoca, Romania",
    transport: "Bus",
    ticketImage: { front: clujFront, back: clujBack },
    backgroundImage: { light: clujMapLight, dark: clujMapDark },
  },
  {
    city: "Hamburg, Germany",
    transport: "Train",
    ticketImage: { front: hamburgFront, back: hamburgBack },
    backgroundImage: { light: hamburgMapLight, dark: hamburgMapDark },
  },
  {
    city: "Munich, Germany",
    transport: "Train",
    ticketImage: { front: munichFront, back: munichBack },
    backgroundImage: { light: munichMapLight, dark: munichMapDark },
  },
  {
    city: "Funchal Madeira, Portugal",
    transport: "Bus",
    ticketImage: { front: funchalFront, back: funchalBack },
    backgroundImage: { light: funchalMapLight, dark: funchalMapDark },
  },
  {
    city: "Bucharest, Romania",
    transport: "All public transport",
    ticketImage: { front: bucharestFront, back: bucharestBack },
    backgroundImage: { light: bucharestMapLight, dark: bucharestMapDark },
  },
];

export default Cities;
