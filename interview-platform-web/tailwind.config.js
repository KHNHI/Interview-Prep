/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas:  "#F7F6F0",
        surface: { DEFAULT: "#FFFEFA", alt: "#EEF0E5" },
        ink:  { 1: "#253D30", 2: "#52634F", 3: "#6D7965" },
        line: { DEFAULT: "#DEE1D3", strong: "#BFC9B4" },
        sidebar: "#244536",
      },
      fontFamily: {
        sans: ["Onest", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        sm:  "5px",
        DEFAULT: "8px",
        lg:  "12px",
      },
      boxShadow: {
        card:    "0 1px 2px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.03)",
        "card-md": "0 4px 16px rgba(0,0,0,0.07)",
      },
      letterSpacing: {
        tight:   "-0.03em",
        tighter: "-0.04em",
        label:   "0.08em",
      },
    },
  },
  plugins: [],
}
