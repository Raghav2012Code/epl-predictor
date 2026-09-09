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
        background: "#290000",
        canvas: "#290000",
        surface: {
          DEFAULT: "#480202",
          subtle: "#380101",
          card: "#480202",
          hover: "#590202",
          active: "#6d0202",
        },
        border: {
          DEFAULT: "#590202",
          subtle: "#3d0101",
          active: "#767e70",
        },
        brand: {
          primary: "#6d0202",
          primaryHover: "#850303",
          primaryDark: "#520101",
          accent: "#767e70",
          accentBase: "#767e70",
          accentHover: "#8d9786",
          surface: "#480202",
          canvas: "#290000",
        },
        text: {
          primary: "#eeebd8",
          secondary: "#cbd1c4",
          muted: "#a4aca0",
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
