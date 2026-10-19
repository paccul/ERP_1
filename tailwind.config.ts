import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#f9fafb",
        card: {
          DEFAULT: "#030712",
          foreground: "#f9fafb",
        },
        popover: {
          DEFAULT: "#030712",
          foreground: "#f9fafb",
        },
        primary: {
          DEFAULT: "#f59e0b", // Amber accent Garda BUJP
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#111827",
          foreground: "#f9fafb",
        },
        muted: {
          DEFAULT: "#1f2937",
          foreground: "#9ca3af",
        },
        accent: {
          DEFAULT: "#d97706",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        border: "#374151",
        input: "#1f2937",
        ring: "#f59e0b",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
