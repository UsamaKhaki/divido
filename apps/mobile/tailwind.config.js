/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // The app is light-only. 'class' stops NativeWind on web from throwing when
  // something else toggles the <html> class (the default 'media' mode forbids it).
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
