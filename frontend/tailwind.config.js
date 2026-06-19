/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#0a0a0b',
          900: '#111113',
          800: '#1a1a1e',
          700: '#27272d',
          600: '#3f3f47',
          500: '#5c5c66',
          400: '#8f8f99',
          300: '#b4b4bf',
          200: '#d9d9e3',
          100: '#f0f0f5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};