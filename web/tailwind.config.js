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
        background: "#090a0d",
        surface: {
          DEFAULT: "#101217",
          subtle: "#15181f",
          card: "#12141a",
          hover: "#181b23",
          active: "#1f232e",
        },
        border: {
          DEFAULT: "#1f232e",
          subtle: "#171a22",
          active: "#2e3445",
        },
        text: {
          primary: "#f3f5f8",
          secondary: "#9ba3b2",
          muted: "#606776",
        },
        pl: {
          purple: "#38003c",
          purpleLight: "#6c0c77",
          green: "#00ff85",
          greenDark: "#028b49",
          magenta: "#e90052",
          blue: "#04faff",
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
