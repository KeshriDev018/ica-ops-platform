/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#003366',
        orange: '#FC8A24',
        cream: '#FFFEF3',
        olive: '#6B8E23',
      },
      fontFamily: {
        primary: ['Figtree', 'sans-serif'],
        secondary: ['Bodoni Moda', 'serif'],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0, 51, 102, 0.1)',
        medium: '0 4px 16px rgba(0, 51, 102, 0.15)',
      },
      borderRadius: {
        card: '12px',
      }
    },
  },
  plugins: [],
}
