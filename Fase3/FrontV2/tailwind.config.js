// tailwind.config.js
const {nextui} = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // make sure it's pointing to the ROOT node_module
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        bounce: 'bounce 2s infinite',
        pulse: 'pulse 2s infinite',
        spin: 'spin 3s linear infinite',
        ping: 'ping 2s infinite',
        slide: 'slide 10s linear infinite',
        wiggle: 'wiggle 1s ease-in-out infinite',
        'fast-slide': 'fast-slide 2s linear infinite',
        'color-slide': 'color-slide 10s linear infinite',
      },
      keyframes: {
        slide: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'fast-slide': {
          '0%, 100%': { opacity: 0 },
          '50%': { opacity: 1, transform: 'translateX(0)' },
        },
        'color-slide': {
          '0%': { background: 'linear-gradient(to right, transparent, transparent)' },
          '25%': { background: 'linear-gradient(to right, transparent, #4A4E69, transparent)' },
          '50%': { background: 'linear-gradient(to right, transparent,rgb(16, 15, 27), transparent)' },
          '75%': { background: 'linear-gradient(to right, transparent, transparent)' },
          '100%': { background: 'linear-gradient(to right, transparent,rgb(81, 18, 153), transparent)' },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};