module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  safeList: ['border-transparent', 'border-green-600'],
  theme: {
    fontFamily: {
      display: ['Inter', 'sans-serif'],
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
