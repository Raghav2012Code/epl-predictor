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
          active: "#00ff85",
        },
        brand: {
          primary: "#059669",
          primaryHover: "#10b981",
          primaryDark: "#047857",
          accent: "#00ff85",
          accentBase: "#00ff85",
          accentHover: "#38ff9f",
          surface: "#0f1219",
          canvas: "#08090d",
        },
        text: {
          primary: "#f8fafc",
          secondary: "#94a3b8",
          muted: "#64748b",
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
