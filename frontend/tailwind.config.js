/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff', 100: '#dbe7fe', 200: '#bfd4fe', 300: '#93b6fd',
          400: '#608ffa', 500: '#3d68f5', 600: '#2749e9', 700: '#2038d4',
          800: '#2130ab', 900: '#212f87',
        },
        surface: {
          light: '#ffffff', 'light-alt': '#f7f9fc',
          dark: '#0f1420', 'dark-alt': '#161d2e',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { xl: '0.875rem' },
    },
  },
  plugins: [],
}
