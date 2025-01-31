"use client";

import { Drawer } from "vaul";

export default function VaulDrawer() {
  return (
    <Drawer.Root>
      <Drawer.Trigger className="text-sm font-medium">More info</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="bg-gray-100 h-fit fixed bottom-0 left-0 right-0 outline-none z-50">
          <div className="p-4 bg-white">
            <p className="mb-4">
              Public transportation is the backbone of modern cities, offering
              an efficient and sustainable way for people to commute. From buses
              and trains to trams and ferries, these systems help reduce traffic
              congestion, lower carbon footprints, and provide affordable travel
              options for millions. Investing in reliable public transport
              infrastructure not only benefits daily commuters but also enhances
              the overall quality of urban life.
            </p>
            <p>
              Ticketing systems have evolved significantly over the years,
              transitioning from paper tickets to digital and contactless
              payment solutions. With advancements in technology, passengers can
              now use mobile apps and smart cards to streamline their travel
              experience. The integration of AI-powered scheduling and real-time
              tracking has further improved efficiency, making it easier for
              commuters to plan their journeys with minimal delays.
            </p>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
