import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg-primary) / <alpha-value>)",
        "bg-2": "rgb(var(--bg-secondary) / <alpha-value>)",
        gold: "rgb(var(--accent-gold) / <alpha-value>)",
        crimson: "rgb(var(--accent-red) / <alpha-value>)",
        cyan: "rgb(var(--accent-cyan) / <alpha-value>)",
        ink: "rgb(var(--text-primary) / <alpha-value>)",
        "ink-2": "rgb(var(--text-secondary) / <alpha-value>)",
        "ink-3": "rgb(var(--text-muted) / <alpha-value>)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      maxWidth: { wide: "1400px" },
      transitionTimingFunction: {
        luxe: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      animation: {
        aurora: "aurora 60s linear infinite",
      },
      keyframes: {
        aurora: {
          from: { backgroundPosition: "50% 50%, 50% 50%" },
          to: { backgroundPosition: "350% 50%, 350% 50%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
