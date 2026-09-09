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
        background: "#000000",
        canvas: "#000000",
        surface: {
          DEFAULT: "#0a0a0c",
          subtle: "#000000",
          card: "#0a0a0c",
          hover: "#141417",
          active: "#1c1c20",
        },
        border: {
          DEFAULT: "#1f1f23",
          subtle: "#121214",
          active: "#ffffff",
        },
        brand: {
          primary: "#ffffff",
          primaryHover: "#f4f4f5",
          primaryDark: "#d4d4d8",
          accent: "#ffffff",
          accentBase: "#ffffff",
          accentHover: "#e4e4e7",
          surface: "#0a0a0c",
          canvas: "#000000",
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
