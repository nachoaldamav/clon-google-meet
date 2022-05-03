module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  safeList: ['border-transparent', 'border-green-600', 'border-slate-600'],
  theme: {
    fontFamily: {
      display: ['Inter', 'sans-serif'],
    },
    extend: {
      colors: {
        primary: '#181622',
        secondary: '#13111c',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('tailwindcss-bg-patterns')],
}
