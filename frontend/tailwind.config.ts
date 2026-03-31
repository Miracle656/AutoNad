import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // New spec palette
        void:           "#020108",
        surface:        "#0E091C",
        panel:          "#120D24",
        "monad-purple": "#6E54FF",
        "purple-dim":   "#4a3ab5",
        "light-purple": "#DDD7FE",
        "off-white":    "#FBFAF9",
        "off-black":    "#1B1D21",
        cyan:           "#85E6FF",
        "light-blue":   "#B9E3F9",
        pink:           "#FF8EE4",
        orange:         "#FFAE45",
        muted:          "#4a4566",
        border:         "rgba(110, 84, 255, 0.12)",

        // Legacy aliases (keep for existing app components)
        "monad-bg":           "#0E091C",
        "monad-cyan":         "#85E6FF",
        "monad-blue":         "#B9E3F9",
        "monad-pink":         "#FF8EE4",
        "monad-amber":        "#FFAE45",
        "monad-purple-light": "#DDD7FE",
      },
      fontFamily: {
        // Spec names
        display: ["Britti Sans", "var(--font-dm-sans)", "DM Sans", "sans-serif"],
        body:    ["var(--font-inter)", "Inter", "sans-serif"],
        mono:    ["var(--font-roboto-mono)", "Roboto Mono", "monospace"],
        // Legacy aliases
        sans:     ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        headline: ["Britti Sans", "DM Sans", "Inter", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial":  "radial-gradient(var(--tw-gradient-stops))",
        "gradient-purple":  "linear-gradient(135deg, #6E54FF 0%, #DDD7FE 100%)",
      },
      keyframes: {
        gridDrift: {
          from: { transform: "translateY(0)" },
          to:   { transform: "translateY(60px)" },
        },
        blobFloat: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "50%":     { transform: "translate(25px,-18px) scale(1.04)" },
        },
        ticker: {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(-50%)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(-50%)" },
        },
        "spin-slow":    { to: { transform: "rotate(360deg)" } },
        "spin-slower":  { to: { transform: "rotate(360deg)" } },
        "spin-slowest": { to: { transform: "rotate(360deg)" } },
        "spin-reverse": { to: { transform: "rotate(-360deg)" } },
        "pulse-glow": {
          "0%,100%": { boxShadow: "0 0 20px rgba(110,84,255,0.4)" },
          "50%":     { boxShadow: "0 0 50px rgba(110,84,255,0.8), 0 0 80px rgba(110,84,255,0.3)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(28px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        portalBreathe: {
          "0%,100%": { transform: "rotate(45deg) scale(1)" },
          "50%":     { transform: "rotate(45deg) scale(1.025)" },
        },
        speedLine: {
          from: { transform: "translateX(-100%)" },
          to:   { transform: "translateX(200%)" },
        },
        // Legacy keyframes
        "pulse-purple": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(110, 84, 255, 0.4)" },
          "50%":      { boxShadow: "0 0 0 8px rgba(110, 84, 255, 0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "slide-in": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "flash-fill": {
          "0%":   { backgroundColor: "rgba(110, 84, 255, 0.4)" },
          "100%": { backgroundColor: "transparent" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "grid-drift":      "gridDrift 25s linear infinite",
        "blob-float":      "blobFloat 7s ease-in-out infinite",
        "blob-float-slow": "blobFloat 11s ease-in-out infinite reverse",
        ticker:            "ticker 35s linear infinite",
        marquee:           "marquee 22s linear infinite",
        "spin-slow":       "spin-slow 5s linear infinite",
        "spin-slower":     "spin-slower 10s linear infinite",
        "spin-slowest":    "spin-slowest 16s linear infinite",
        "spin-reverse":    "spin-reverse 24s linear infinite",
        "pulse-glow":      "pulse-glow 2.5s ease-in-out infinite",
        "fade-up":         "fadeUp 0.7s ease forwards",
        "portal-breathe":  "portalBreathe 5s ease-in-out infinite",
        "speed-line":      "speedLine 3s ease-in-out infinite",
        // Legacy
        "pulse-purple": "pulse-purple 2s ease-in-out infinite",
        shimmer:        "shimmer 1.5s linear infinite",
        "slide-in":     "slide-in 0.3s ease-out",
        "flash-fill":   "flash-fill 1s ease-out",
        float:          "float 3s ease-in-out infinite",
      },
      boxShadow: {
        "glow-purple":    "0 0 20px rgba(110, 84, 255, 0.3)",
        "glow-cyan":      "0 0 20px rgba(133, 230, 255, 0.3)",
        "glow-purple-lg": "0 0 40px rgba(110, 84, 255, 0.4)",
        card:             "0 4px 24px rgba(0, 0, 0, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
