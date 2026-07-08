/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0a0a',
          card: '#1a1a1a',
          text: '#f5f5f5',
        },
        light: {
          bg: '#f5f5f5',
          card: '#e8e8e8',
          text: '#0a0a0a',
        },
        accent: {
          green: '#4CAF50',
          red: '#ff4757',
          blue: '#4a9eff',
        }
      },
      borderRadius: {
        '2xl': '20px',
      },
      backdropBlur: {
        'xl': '20px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
