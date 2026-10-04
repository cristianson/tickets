import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Every control is 42px tall so the top and bottom button rows line up:
// round icon buttons (theme toggle, arrows) and pill buttons with a label
// (Enable tilt, Flip ticket).
export const iconButtonStyles = "inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full";
export const pillButtonStyles = "inline-flex h-[42px] items-center justify-center gap-1.5 rounded-full px-4";

// select-none: double-clicking a button (e.g. Flip ticket twice) would
// otherwise highlight its label.
export const commonButtonStyles =
  "select-none bg-white dark:bg-gray-800 border border-grayWarm-200 dark:border-gray-600 text-grayWarm-500 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 shadow-xsSkeumorphic transition duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 dark:focus-visible:ring-gray-500 dark:focus-visible:ring-offset-gray-900";
