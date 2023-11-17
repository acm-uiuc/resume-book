/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // "./app/**/*.{js,ts,jsx,tsx}",
    // "./pages/**/*.{js,ts,jsx,tsx}",
    // "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        acm: {
          thirdary: "#1976d2",
          secondary: "#4577F8",
          main: "#404C6C",
          DEFAULT: "#3E476F",
        },
      },
    },
    fontFamily: {
      inherit: ["inherit"],
    },
  },
  plugins: [],
};
