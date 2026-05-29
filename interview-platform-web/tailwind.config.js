/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas:  "#F3F3F3",
        surface: { DEFAULT: "#FFFFFF", alt: "#FAFAFA" },
        ink:  { 1: "#0F0F0F", 2: "#525252", 3: "#9C9C9C" },
        line: { DEFAULT: "#E6E6E6", strong: "#CCCCCC" },
        sidebar: "#0F0F0F",
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
