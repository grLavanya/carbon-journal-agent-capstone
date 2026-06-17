/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Lora', 'Georgia', 'ui-serif', 'serif'],
      },
      colors: {
        parchment: {
          DEFAULT: '#FDF6E3',
          50: '#FFFDF7',
          100: '#FDF6E3',
          200: '#F5ECCE',
          300: '#E8D9B0',
          400: '#D4C08E',
          500: '#BFA870',
          600: '#A08B5C',
          700: '#7D6C48',
          800: '#5A4D33',
          900: '#3D3523',
        },
        sage: {
          DEFAULT: '#7C9A6E',
          50: '#F0F5ED',
          100: '#DCE8D5',
          200: '#B8D1A9',
          300: '#97BA87',
          400: '#7C9A6E',
          500: '#5F7D51',
          600: '#4B6340',
          700: '#3B4E33',
          800: '#2C3B26',
          900: '#1E281A',
        },
      },
    },
  },
  plugins: [],
};
