/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lato', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Deep Teal Palette (Primary color, navigation, headings, key UI elements)
        deepteal: {
          50: '#edf7f6',
          100: '#d5ece8',
          200: '#b0dcd5',
          300: '#7ec4b9',
          400: '#4da89c',
          500: '#2c8d81',
          600: '#1b6f65',
          700: '#155952',
          800: '#124842',
          900: '#0d3834', // Canonical Deep Teal
          950: '#072421',
        },
        // Mint Palette (Secondary/accent color, highlights, progress indicators, success states)
        mint: {
          50: '#f0fdf9',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf', // Canonical Mint
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        // Warm Cream Palette (Main background/surface color, subtle panels)
        cream: {
          50: '#fdfcf9',
          100: '#faf7f2', // Canonical Warm Cream background
          200: '#f3efe6', // Secondary surface / warm panel
          300: '#e8e2d5', // Subtle warm border
          400: '#d7cebe',
          500: '#b8ab96',
        },
        // Override standard color scales so existing components seamlessly inherit the theme:
        slate: {
          50: '#faf7f2',   // Warm Cream background
          100: '#f3efe6',  // Warm Cream subtle surface
          200: '#e8e2d5',  // Subtle warm border
          300: '#d6cdbd',
          400: '#9ea9a6',  // Muted text
          500: '#6d7b78',  // Secondary text
          600: '#4f5d5a',  // Regular text
          700: '#35423f',  // Neutral dark text
          800: '#242f2d',  // Neutral dark text
          900: '#141d1b',  // Darkest neutral text & headings
        },
        teal: {
          50: '#edf7f6',
          100: '#d5ece8',
          200: '#b0dcd5',
          300: '#7ec4b9',
          400: '#4da89c',
          500: '#2c8d81',
          600: '#1b6f65',
          700: '#155952',
          800: '#124842',
          900: '#0d3834',
        },
        blue: {
          50: '#edf7f6',
          100: '#d5ece8',
          200: '#b0dcd5',
          300: '#7ec4b9',
          400: '#4da89c',
          500: '#2c8d81',
          600: '#0d3834',  // Primary Deep Teal for key UI actions
          700: '#0a2e2b',
          800: '#072421',
          900: '#051b19',
        },
        emerald: {
          50: '#f0fdf9',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',  // Clean Mint accent
          500: '#14b8a6',  // Mint
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },
    },
  },
  plugins: [],
}
