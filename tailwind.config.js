/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["var(--font-inter)"],
      },
      colors: {
        gray: {
          25: "#FDFDFD",
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E9EAEB",
          300: "#D5D7DA",
          400: "#A4A7AE",
          500: "#717680",
          600: "#535862",
          700: "#414651",
          800: "#252B37",
          900: "#181D27",
          950: "#0A0D12",
        },
        grayWarm: {
          25: "#FDFDFC",
          50: "#FAFAF9",
          100: "#F5F5F4",
          200: "#E7E5E4",
          300: "#D7D3D0",
          400: "#A9A29D",
          500: "#79716B",
          600: "#57534E",
          700: "#44403C",
          800: "#292524",
          900: "#1C1917",
          950: "#171412",
        },
      },
      boxShadow: {
        xsSkeumorphic: `
          inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18),
          inset 0px -2px 0px 0px rgba(10, 13, 18, 0.05),
          0px 1px 2px 0px rgba(16, 24, 40, 0.05)
        `,
      },
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
};
