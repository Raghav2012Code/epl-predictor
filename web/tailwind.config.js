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
        background: "#021e23",
        canvas: "#021e23",
        surface: {
          DEFAULT: "#0a534e",
          subtle: "#063835",
          card: "#0a534e",
          hover: "#0e645e",
          active: "#12756e",
        },
        border: {
          DEFAULT: "#0a534e",
          subtle: "#063835",
          active: "#25845f",
        },
        brand: {
          primary: "#25845f",
          primaryHover: "#2ca073",
          primaryDark: "#1c684a",
          accent: "#8cbc93",
          accentHover: "#9ec7a4",
          surface: "#0a534e",
          canvas: "#021e23",
        },
        text: {
          primary: "#f3f5f8",
          secondary: "#8cbc93",
          muted: "#93aba2",
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
