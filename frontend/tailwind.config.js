/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: "#0b0f19",
        darkPanel: "#161e31",
        darkBorder: "#1f2937",
        cobaltGlow: "#2563eb",
        emeraldGlow: "#059669",
        roseGlow: "#dc2626"
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
