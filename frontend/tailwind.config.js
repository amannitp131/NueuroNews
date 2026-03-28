/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F1B2D",
        mist: "#E9F0F7",
        accent: "#0EA5A6",
        ember: "#F97316"
      },
      boxShadow: {
        panel: "0 12px 28px rgba(15, 27, 45, 0.08)"
      }
    }
  },
  plugins: []
};
