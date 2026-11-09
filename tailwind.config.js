/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Vazirmatn", "Tahoma", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eff8ff",
          100: "#dbeeff",
          500: "#2878e5",
          600: "#1766d2",
          700: "#1554ae",
          950: "#081b37",
        },
        cyber: {
          cyan: "#46e6d1",
          lime: "#c8f36a",
        },
      },
      boxShadow: {
        soft: "0 18px 55px -32px rgba(22, 52, 92, 0.24)",
        glow: "0 0 32px rgba(70, 230, 209, 0.16)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
