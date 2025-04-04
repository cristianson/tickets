"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { FiSun, FiMoon } from "react-icons/fi";

export const ThemeToggleButton = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder or nothing on the server to avoid hydration mismatch
    // You could also render a default button state here
    return <div className="w-10 h-10"></div>; // Simple placeholder
  }

  // Determine the actual theme to display (handles 'system' theme)
  const currentTheme = theme === "system" ? resolvedTheme : theme;

  const toggleTheme = () => {
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      aria-label="Toggle Dark Mode"
      type="button"
      className="fixed top-4 right-4 z-50 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
      onClick={toggleTheme}
    >
      {currentTheme === "dark" ? (
        <FiSun className="w-6 h-6 transition-transform duration-500 ease-in-out transform hover:rotate-90" />
      ) : (
        <FiMoon className="w-6 h-6 transition-transform duration-500 ease-in-out transform hover:rotate-90" />
      )}
    </button>
  );
};
