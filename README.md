# Ticket Gallery

A small and fun collection of real public transport tickets I collected from the cities I visited. You can flip each ticket to see the front and back and switch between light and dark themes.

## Features
- Browse through a list of cities and view their tickets.
- Flip a ticket to show its other side, with the Flip button or by tapping/clicking the ticket.
- Move to the next or previous city.
- Use the left/right arrow keys to move between cities, or swipe on a phone.
- On phones, tilt the device to tilt the ticket (uses the gyroscope). iPhones show an "Enable tilt" button, since iOS requires permission for motion sensors.
- Toggle between light and dark mode.

## Getting Started
1. Install [Node.js](https://nodejs.org/) 20.9 or newer if you do not have it already.
2. Install the project’s packages by running `npm install` in this folder.
3. Start a development server with `npm run dev`.
4. Open your browser and go to [http://localhost:3000](http://localhost:3000) to see the gallery.

## Scripts
- `npm run dev` – start the development server.
- `npm run build` – create a production build.
- `npm run start` – run the production build.
- `npm run lint` – check the code for common problems.
- `npm run optimize-images` – downscale oversized images in `assets/` and generate the phone crops of the maps.
- `npm run render-maps` – draw the map backgrounds from OpenStreetMap data (see [Map Backgrounds](#map-backgrounds)).

## Project Structure
- `app/` – Next.js pages and layout.
- `components/` – React components like the image gallery and theme switcher.
- `lib/` – data about the cities and tickets, plus image helpers.
- `assets/` – ticket photos (`tickets/`) and map backgrounds (`maps/light`, `maps/dark`, plus phone crops in `maps/mobile`).
- `public/` – static files served as-is (favicon).
- `scripts/` – maintenance scripts such as the image optimizer and the map renderer (`scripts/maps/`).

## Adding a City
1. Add the ticket photos to `assets/tickets/<city>/`.
2. Add the city to `scripts/maps/cities.json` and draw its maps (see below).
3. Run `npm run optimize-images`: it resizes the ticket photos to what the site displays and generates the phone crops of the maps (`assets/maps/mobile/`).
4. Import the images (including the two phone crops) and add an entry in `lib/cityData.ts`.

## Map Backgrounds
The maps behind the tickets are drawn from [OpenStreetMap](https://www.openstreetmap.org/copyright) data, with the colours of two Snazzy Maps themes: "Even Lighter" by Anda (light) and "Shades of Grey" by Adam Krogh (dark). Both themes use the same data and framing, so they only differ in colour.

1. `pip install pyarrow shapely`, then `python3 scripts/maps/fetch_osm.py` downloads each city's data (from the Overture Maps release of OpenStreetMap, no account needed) into `scripts/maps/data/`.
2. `npm run render-maps` draws `assets/maps/light/` and `assets/maps/dark/` with MapLibre in Google Chrome (or set `CHROMIUM_PATH` to a Chromium).
3. `npm run optimize-images` regenerates the phone crops.

Each city's centre and zoom are in `scripts/maps/cities.json`; the colours are in `scripts/maps/render.mjs`. The page credits OpenStreetMap, as its licence (ODbL) requires.

No license information was provided.
