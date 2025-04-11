import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const commonButtonStyles =
  "bg-white dark:bg-gray-800 border border-grayWarm-200 dark:border-gray-600 text-grayWarm-500 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 shadow-xsSkeumorphic transition-transform duration-300 ease-in-out";
