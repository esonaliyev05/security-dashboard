/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0 1px rgba(34,211,238,.25), 0 0 30px rgba(34,211,238,.15)",
      },
    },
  },
  plugins: [],
};
