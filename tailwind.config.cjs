/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#42504E',
        success: '#73B234',
        danger: '#C91D25',
        paper: '#f7f7f7',
      },
      fontFamily: {
        manrope: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};


