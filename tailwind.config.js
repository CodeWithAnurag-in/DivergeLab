/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#030712',
        surface: '#090d16',
        card: '#0e131f',
        border: 'rgba(255, 255, 255, 0.08)',
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          950: '#083344',
        },
      },
      fontFamily: {
        sans: ['Geist', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
