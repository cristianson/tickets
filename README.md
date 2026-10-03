# Ticket Gallery

A small and fun collection of real public transport tickets I collected from the cities I visited. You can flip each ticket to see the front and back and switch between light and dark themes.

## Features
- Browse through a list of cities and view their tickets.
- Flip a ticket to show its other side.
- Move to the next or previous city.
- Use the left/right arrow keys to move between cities, or swipe on a phone.
- On phones, tilt the device to tilt the ticket (uses the gyroscope).
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
- `npm run optimize-images` – downscale and re-encode any oversized images in `assets/`.

## Project Structure
- `app/` – Next.js pages and layout.
- `components/` – React components like the image gallery and theme switcher.
- `lib/` – data about the cities and tickets, plus image helpers.
- `assets/` – ticket photos (`tickets/`) and map backgrounds (`maps/light`, `maps/dark`).
- `public/` – static files served as-is (favicon).
- `scripts/` – maintenance scripts such as the image optimizer.

## Adding a City
1. Add the ticket photos to `assets/tickets/<city>/` and the maps to `assets/maps/light/` and `assets/maps/dark/`.
2. Run `npm run optimize-images` so the files are resized to what the site actually displays.
3. Import the images and add an entry in `lib/cityData.ts`.

No license information was provided.
