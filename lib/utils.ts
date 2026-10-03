import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const commonButtonStyles =
  "bg-white dark:bg-gray-800 border border-grayWarm-200 dark:border-gray-600 text-grayWarm-500 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 shadow-xsSkeumorphic transition duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 dark:focus-visible:ring-gray-500 dark:focus-visible:ring-offset-gray-900";
