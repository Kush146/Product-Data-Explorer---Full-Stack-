/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    container: { center: true, padding: "1rem", screens: { lg: "1120px" } },
    extend: {
      colors: {
        wob: {
          green: "#2E7D32",     // header buttons, accents
          green2: "#26722C",    // hover
          yellow: "#F2C200",    // CTAs
          cream: "#F6F5EE",     // page bg band
          ink: "#1E1E1E",
          gray: "#6B7280",
        },
      },
      boxShadow: {
        card: "0 2px 0 0 rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)",
      },
      borderRadius: { xl2: "1rem" },
    },
  },
  plugins: [],
};
