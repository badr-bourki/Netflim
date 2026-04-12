/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        netflim: {
          bg: '#141414',
          red: '#E50914',
        },
      },
    },
  },
  plugins: [],
}

