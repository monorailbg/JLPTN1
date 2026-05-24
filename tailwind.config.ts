import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        washi: "#f5f0e8",
        ink: "#1a1208",
        vermillion: "#c0392b",
        gold: "#c9a84c",
        "deep-blue": "#1a3a5c",
        moss: "#4a5e3a",
        "aged-paper": "#ede8d8",
      },
      fontFamily: {
        sans: ["'Noto Sans JP'", "Hiragino Sans", "Yu Gothic", "sans-serif"],
        serif: ["'Noto Serif JP'", "Hiragino Mincho Pro", "Yu Mincho", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
export default config;
