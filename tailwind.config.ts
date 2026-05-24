import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs:  '420px',
      sm:  '640px',
      md:  '768px',
      lg:  '1024px',
      xl:  '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        washi:         "var(--washi)",
        ink:           "var(--ink)",
        "ink-2":       "var(--ink-2)",
        "ink-3":       "var(--ink-3)",
        paper:         "var(--paper)",
        "paper-elev":  "var(--paper-elev)",
        "paper-sunken": "var(--paper-sunken)",
        "aged-paper":  "var(--paper)",   // legacy alias
        vermillion:    "#c0392b",
        gold:          "#c9a84c",
        "deep-blue":   "#1a3a5c",
        moss:          "#4a5e3a",
        hairline:      "var(--border)",
      },
      borderRadius: {
        'sm':  '8px',
        DEFAULT: '10px',
        'md':  '12px',
        'lg':  '16px',
        'xl':  '20px',
        '2xl': '24px',
        '3xl': '28px',
      },
      boxShadow: {
        sm:  'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md:  'var(--shadow-md)',
        lg:  'var(--shadow-lg)',
      },
      fontFamily: {
        sans:  ["var(--font-noto-sans)",  "Hiragino Sans",       "Yu Gothic",   "sans-serif"],
        serif: ["var(--font-noto-serif)", "Hiragino Mincho Pro", "Yu Mincho",   "serif"],
      },
      animation: {
        "fade-in":    "fadeIn 0.4s ease-out",
        "slide-up":   "slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        "scale-in":   "scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: "0" },                                          "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(12px)" },           "100%": { opacity: "1", transform: "translateY(0)" } },
        scaleIn: { "0%": { opacity: "0", transform: "scale(0.96)" },                "100%": { opacity: "1", transform: "scale(1)" } },
      },
    },
  },
  plugins: [],
};
export default config;
