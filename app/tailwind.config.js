/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      height:{
        '70': '70px',
      },
      colors: {
        primary: '#e86a10',
        'primary-light': '#ff8f3d',
        'primary-dark': '#c45100',
        'primary-bg': '#fff7ed',
        'primary-hover': 'rgba(232, 106, 16, 0.1)',
        'tier-green': '#76b900',
        'tier-green-light': '#8ed600',
        'tier-green-dark': '#5c8f00',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
