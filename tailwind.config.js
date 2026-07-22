/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#ff5b6c',
          600: '#ff5b6c',
          700: '#ff5b6c',
        },
      },
    },
  },
  plugins: [],
}
