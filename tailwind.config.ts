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
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "var(--color-accent-primary, #f59e0b)",
          foreground: "var(--color-accent-text-on-amber, #000000)",
        },
        secondary: {
          DEFAULT: "var(--color-bg-surface-2, #111827)",
          foreground: "var(--color-text-primary, #f9fafb)",
        },
        muted: {
          DEFAULT: "var(--color-bg-surface-3, #1f2937)",
          foreground: "var(--color-text-secondary, #9ca3af)",
        },
        accent: {
          DEFAULT: "var(--color-accent-hover, #d97706)",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "var(--color-status-danger, #ef4444)",
          foreground: "#ffffff",
        },
        border: "var(--color-border-default, #374151)",
        input: "var(--color-bg-surface-2, #1f2937)",
        ring: "var(--color-focus-ring, #f59e0b)",
        // Explicit Figma Design Token Utilities
        canvas: "var(--color-bg-canvas)",
        "surface-1": "var(--color-bg-surface-1)",
        "surface-2": "var(--color-bg-surface-2)",
        "surface-3": "var(--color-bg-surface-3)",
        "txt-primary": "var(--color-text-primary)",
        "txt-secondary": "var(--color-text-secondary)",
        "status-success": "var(--color-status-success)",
        "status-warning": "var(--color-status-warning)",
        "status-danger": "var(--color-status-danger)",
      },
      fontFamily: {
        sans: ["var(--font-ui)", "Plus Jakarta Sans", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
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
