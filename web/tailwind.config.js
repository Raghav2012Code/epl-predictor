/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#08090c",
        canvas: "#08090c",
        surface: {
          DEFAULT: "#0f1219",
          subtle: "#0a0c12",
          card: "#0f1219",
          hover: "#151922",
          active: "#1c2230",
        },
        border: {
          DEFAULT: "#1a1f2c",
          subtle: "#121620",
          active: "#ffffff",
        },
        brand: {
          primary: "#ffffff",
          primaryHover: "#f4f4f5",
          primaryDark: "#d4d4d8",
          accent: "#ffffff",
          accentBase: "#ffffff",
          accentHover: "#e4e4e7",
          surface: "#0f1219",
          canvas: "#08090c",
        },
        text: {
          primary: "#ffffff",
          secondary: "#a1a1aa",
          muted: "#71717a",
        },
      },
      borderRadius: {
        none: "0px",
        sm: "2px",
        DEFAULT: "2px",
        md: "2px",
        lg: "2px",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "'JetBrains Mono'",
          "'SF Mono'",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
