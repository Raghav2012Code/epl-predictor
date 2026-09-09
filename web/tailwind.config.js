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
        background: "#090a0f",
        canvas: "#090a0f",
        surface: {
          DEFAULT: "#12141a",
          subtle: "#0e1015",
          card: "#12141a",
          hover: "#181b22",
          active: "#20242e",
        },
        border: {
          DEFAULT: "#1e222b",
          subtle: "#151820",
          active: "#00ff85",
        },
        brand: {
          primary: "#047857",
          primaryHover: "#059669",
          primaryDark: "#065f46",
          accent: "#00ff85",
          accentBase: "#00ff85",
          accentHover: "#38ff9f",
          surface: "#12141a",
          canvas: "#090a0f",
        },
        text: {
          primary: "#f8fafc",
          secondary: "#94a3b8",
          muted: "#818e9f",
        },
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "4px",
        md: "6px",
        lg: "8px",
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
