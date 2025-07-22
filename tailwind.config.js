/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4285F4',
        'primary-dark': '#3367D6',
        secondary: '#10B981',
        accent: '#F59E0B',
        blue: {
          500: '#4285F4',
          600: '#3367D6',
        }
      },
    },
  },
  plugins: [],
}