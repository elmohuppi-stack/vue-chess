/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        board: {
          light: "#f0e6d2",
          dark: "#b58863",
          accent: "#baca44",
          lastmove: "#aed581",
        },
        piece: {
          light: "#ffffff",
          dark: "#1a1a1a",
        },
      },
      spacing: {
        square: "12.5%",
      },
    },
  },
  plugins: [],
};
