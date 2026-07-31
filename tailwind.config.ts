import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        board: {
          DEFAULT: "#0E1420", // near-black navy background
          raised: "#161D2C", // card surface
          line: "#2A3346", // hairline dividers
        },
        ivory: "#E7E5DC", // primary text, warm off-white (not pure white)
        amber: "#E3A857", // signature accent
        gain: "#4FA98C", // muted teal-green for gains
        loss: "#C1554B", // muted rust-red for losses
        dim: "#8B92A3", // secondary text
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"], // masthead-style serif for headlines
        mono: ["'IBM Plex Mono'", "monospace"], // tickers, prices, all numerals
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
