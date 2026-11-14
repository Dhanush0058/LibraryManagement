/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        coral: {
          50: '#fff5f2',
          100: '#ffe8e2',
          200: '#ffd5ca',
          300: '#fdb5a4',
          400: '#fb8b72',
          500: '#f96849', // Primary Coral / Terracotta from reference
          600: '#e8502f',
          700: '#c33e22',
          800: '#a1351f',
          900: '#84311f',
          950: '#48150a',
        },
        charcoal: {
          50: '#f6f7f8',
          100: '#eceef0',
          200: '#d5d9de',
          300: '#b1b9c2',
          400: '#8693a1',
          500: '#667484',
          600: '#515e6d',
          700: '#424d5a',
          800: '#2b313a',
          900: '#1c2026', // Deep charcoal from reference image footer
          950: '#121418',
        },
        parchment: {
          50: '#faf9f6', // Warm off-white background
          100: '#f4f2ec',
          200: '#eae6dc',
          300: '#dcD6C7',
          400: '#c8bfae',
        }
      }
    },
  },
  plugins: [],
}
