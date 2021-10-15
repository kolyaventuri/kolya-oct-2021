const colors = require('tailwindcss/colors');

module.exports = {
  purge: ['./src/**/*.{ts,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
    colors: {
      ...colors,
      slate: {
        DEFAULT: '#131723'
      }
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
