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
        background: "var(--background)",
        foreground: "var(--foreground)",
        gov: {
          navy: "#0a2540",
          blue: "#005ea2",
          lightBlue: "#e8f1f8",
          darkBlue: "#1a365d",
          accent: "#d97706",
          gold: "#b45309",
          border: "#cbd5e1"
        }
      },
    },
  },
  plugins: [],
};
export default config;
