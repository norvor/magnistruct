/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'], // <--- Look inside src folder
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'], // Custom font for headers
      },
      colors: {
        // Our Magnistruct Palette
        slate: {
          950: '#020617', // Deep Space Background
        },
        primary: {
          DEFAULT: '#2dd4bf', // Teal Glow
        },
      }
    },
  },
  plugins: [],
}