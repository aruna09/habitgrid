/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'green-empty': '#EBEDF0',
        'green-1': '#C6E48B',
        'green-2': '#7BC96F',
        'green-3': '#239A3B',
        'green-4': '#196127',
        bg: '#0D1117',
        surface: '#161B22',
        border: '#30363D',
        'text-primary': '#E6EDF3',
        'text-secondary': '#8B949E',
        accent: '#238636',
      },
      fontFamily: {
        mono: ['"DM Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

