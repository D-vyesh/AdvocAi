/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          '"Outfit"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          '"Outfit"',
          '"Plus Jakarta Sans"',
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      colors: {
        border: "rgba(255, 255, 255, 0.18)",
        input: "rgba(255, 255, 255, 0.08)",
        ring: "rgba(0, 212, 255, 0.65)",

        background: "#060914",
        foreground: "#f8fafc",

        card: "rgba(20, 30, 58, 0.45)",
        "card-foreground": "#f8fafc",

        popover: "rgba(16, 24, 48, 0.82)",
        "popover-foreground": "#f8fafc",

        primary: {
          DEFAULT: "#00d4ff",
          foreground: "#040914",
        },
        secondary: {
          DEFAULT: "#f59e0b",
          foreground: "#040914",
        },
        destructive: {
          DEFAULT: "#ff4d6d",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          foreground: "#94a3b8",
        },
        accent: {
          DEFAULT: "#00f5b4",
          foreground: "#040914",
        },
        glass: {
          DEFAULT: "rgba(255, 255, 255, 0.09)",
          light: "rgba(255, 255, 255, 0.16)",
          dark: "rgba(10, 16, 36, 0.55)",
          border: "rgba(255, 255, 255, 0.25)",
          highlight: "rgba(255, 255, 255, 0.72)",
        },
        chart: {
          1: "#00d4ff",
          2: "#f59e0b",
          3: "#00f5b4",
          4: "#6366f1",
          5: "#a855f7",
        },
      },
      boxShadow: {
        glass: "inset 0 2px 3px 0 rgba(255, 255, 255, 0.65), inset 0 -4px 10px 0 rgba(0, 0, 0, 0.32), 0 18px 44px -10px rgba(0, 0, 0, 0.5)",
        "glass-sm": "inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.6), inset 0 -2px 5px 0 rgba(0, 0, 0, 0.25), 0 8px 24px -4px rgba(0, 0, 0, 0.38)",
        "glass-lg": "inset 0 2px 4px 0 rgba(255, 255, 255, 0.75), inset 0 -6px 14px 0 rgba(0, 0, 0, 0.38), 0 28px 70px -14px rgba(0, 0, 0, 0.6)",
        "glass-glow": "0 0 30px rgba(0, 212, 255, 0.42), inset 0 2px 3px rgba(255, 255, 255, 0.85), inset 0 -3px 8px rgba(0, 0, 0, 0.28)",
        "glass-pill": "inset 0 2px 3px 0 rgba(255, 255, 255, 0.72), inset 0 -3px 6px 0 rgba(0, 0, 0, 0.3), 0 12px 28px -6px rgba(0, 0, 0, 0.45)",
        "glass-circle": "inset 0 2px 3px 0 rgba(255, 255, 255, 0.82), inset 0 -3px 6px 0 rgba(0, 0, 0, 0.35), 0 14px 32px -6px rgba(0, 0, 0, 0.48)",
        fluffy: "inset 0 2px 4px rgba(255,255,255,0.68), inset 0 10px 22px rgba(255,255,255,0.08), inset 0 -6px 14px rgba(0,0,0,0.34), 0 24px 60px -12px rgba(0,0,0,0.58), 0 0 36px -8px rgba(0,212,255,0.16)",
      },
      backdropBlur: {
        glass: "28px",
        "glass-lg": "44px",
      },
      borderRadius: {
        "3xl": "1.85rem",
        "4xl": "2.35rem",
        "5xl": "3rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      transitionTimingFunction: {
        fluffy: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        liquid: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(14px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(24px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "orb-float-1": {
          "0%, 100%": { transform: "translate3d(0px, 0px, 0) scale(1)" },
          "33%": { transform: "translate3d(55px, -70px, 0) scale(1.12)" },
          "66%": { transform: "translate3d(-35px, 40px, 0) scale(0.94)" },
        },
        "orb-float-2": {
          "0%, 100%": { transform: "translate3d(0px, 0px, 0) scale(1)" },
          "33%": { transform: "translate3d(-65px, 45px, 0) scale(1.16)" },
          "66%": { transform: "translate3d(45px, -45px, 0) scale(0.9)" },
        },
        "orb-float-3": {
          "0%, 100%": { transform: "translate3d(0px, 0px, 0) scale(1)" },
          "50%": { transform: "translate3d(38px, 58px, 0) scale(1.1)" },
        },
        "bubble-breathe": {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%": { transform: "translateY(-8px) scale(1.03)" },
        },
        "shimmer": {
          "0%": { transform: "translateX(-120%) skewX(-18deg)" },
          "100%": { transform: "translateX(240%) skewX(-18deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "fade-in-up": "fade-in-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "orb-1": "orb-float-1 22s ease-in-out infinite",
        "orb-2": "orb-float-2 26s ease-in-out infinite",
        "orb-3": "orb-float-3 18s ease-in-out infinite",
        "bubble-breathe": "bubble-breathe 5s ease-in-out infinite",
        shimmer: "shimmer 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
