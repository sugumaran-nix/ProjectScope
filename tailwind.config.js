/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
      // Custom animation for the drag ghost card
      keyframes: {
        "card-lift": {
          "0%": { transform: "scale(1) rotate(0deg)" },
          "100%": { transform: "scale(1.05) rotate(2deg)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "card-lift": "card-lift 150ms ease-out forwards",
        "fade-in": "fade-in 200ms ease-out forwards",
      },
      // Box shadow tokens — used sparingly (hover states only)
      boxShadow: {
        "card-hover": "0 4px 16px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04)",
      },
    },
  },
  plugins: [],
};
