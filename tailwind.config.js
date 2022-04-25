module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      display: ['Inter', 'sans-serif'],
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
