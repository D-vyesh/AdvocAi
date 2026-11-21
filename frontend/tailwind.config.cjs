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
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Plus Jakarta Sans"',
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        border: "rgba(255, 255, 255, 0.15)",
        input: "rgba(255, 255, 255, 0.08)",
        ring: "rgba(0, 212, 255, 0.6)",

        background: "#080c16",
        foreground: "#f8fafc",

        card: "rgba(18, 26, 47, 0.55)",
        "card-foreground": "#f8fafc",

        popover: "rgba(18, 26, 47, 0.85)",
        "popover-foreground": "#f8fafc",

        primary: {
          DEFAULT: "#00d4ff",
          foreground: "#050b18",
        },
        secondary: {
          DEFAULT: "#f59e0b",
          foreground: "#050b18",
        },
        destructive: {
          DEFAULT: "#ff4d4f",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          foreground: "#94a3b8",
        },
        accent: {
          DEFAULT: "#00f5b4",
          foreground: "#050b18",
        },
        glass: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          light: "rgba(255, 255, 255, 0.14)",
          dark: "rgba(10, 16, 32, 0.6)",
          border: "rgba(255, 255, 255, 0.22)",
          highlight: "rgba(255, 255, 255, 0.65)",
        },
        chart: {
          1: "#00d4ff",
          2: "#f59e0b",
          3: "#00f5b4",
          4: "#3b82f6",
          5: "#8b5cf6",
        },
      },
      boxShadow: {
        glass: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.65), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.3), 0 12px 36px -6px rgba(0, 0, 0, 0.45)",
        "glass-sm": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.55), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.2), 0 6px 20px -3px rgba(0, 0, 0, 0.35)",
        "glass-lg": "inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.75), inset 0 -2px 3px 0 rgba(0, 0, 0, 0.4), 0 24px 60px -12px rgba(0, 0, 0, 0.55)",
        "glass-glow": "0 0 25px rgba(0, 212, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.8)",
        "glass-pill": "inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.7), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.3), 0 10px 25px -4px rgba(0, 0, 0, 0.4)",
        "glass-circle": "inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.8), inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.35), 0 12px 28px -5px rgba(0, 0, 0, 0.45)",
      },
      backdropBlur: {
        glass: "28px",
        "glass-lg": "40px",
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "orb-float-1": {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(40px, -60px) scale(1.1)" },
          "66%": { transform: "translate(-30px, 30px) scale(0.95)" },
        },
        "orb-float-2": {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(-50px, 40px) scale(1.15)" },
          "66%": { transform: "translate(40px, -40px) scale(0.9)" },
        },
        "orb-float-3": {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "50%": { transform: "translate(30px, 50px) scale(1.08)" },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in-up": "fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "orb-1": "orb-float-1 22s ease-in-out infinite",
        "orb-2": "orb-float-2 26s ease-in-out infinite",
        "orb-3": "orb-float-3 18s ease-in-out infinite",
        shimmer: "shimmer 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
