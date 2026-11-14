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
          50: '#fff8f5',
          100: '#ffefe9',
          200: '#fedfd4',
          300: '#fcc5b2',
          400: '#faa485',
          500: '#fa8a5a', // Exact sampled solid light orange from user reference
          600: '#e97545',
          700: '#c75c2e',
          800: '#a14822',
          900: '#823b1e',
          950: '#481b0a',
        },
        charcoal: {
          50: '#f6f7f8',
          100: '#ededf0',
          200: '#d8d9e0',
          300: '#b4b6c2',
          400: '#888c9c',
          500: '#646979',
          600: '#4d5262',
          700: '#3b404e',
          800: '#2b2f3a',
          900: '#20232b', // Deep matte charcoal from user reference
          950: '#15171c',
        },
        parchment: {
          50: '#faf8f5', // Warm clean alabaster background
          100: '#f4f0e8',
          200: '#eae4d7',
          300: '#dcd2c0',
          400: '#c4b79f',
        }
      }
    },
  },
  plugins: [],
}
