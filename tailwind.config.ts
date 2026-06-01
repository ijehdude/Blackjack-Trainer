import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        felt: {
          DEFAULT: "#1a5c38",
          dark: "#123d26",
          darker: "#0d2e1c",
          light: "#1e6b42",
        },
        gold: {
          DEFAULT: "#c9a84c",
          light: "#e0c06a",
          dark: "#a8882a",
        },
        navy: {
          DEFAULT: "#0f1f3d",
          light: "#1a3260",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
