/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        steel: {
          50: "#F0F4F8",
          100: "#D9E2EC",
          200: "#BCCCDC",
          300: "#9FB3C8",
          400: "#829AB1",
          500: "#627D98",
          600: "#486581",
          700: "#334E68",
          800: "#243B53",
          900: "#1B2A4A",
          950: "#0F1A2E",
        },
        amber: {
          DEFAULT: "#E8913A",
          50: "#FFF8F0",
          100: "#FFECD6",
          200: "#FFD4A8",
          300: "#FFB870",
          400: "#E8913A",
          500: "#D07520",
          600: "#A85A10",
        },
        status: {
          success: "#2ECC71",
          progress: "#3498DB",
          pending: "#E8913A",
          danger: "#E74C3C",
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
