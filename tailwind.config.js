/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#f9f6f2',
          100: '#f6ede3',
          200: '#f1e3cb',
          300: '#e9d3ad',
          400: '#e0be8c',
          500: '#d1a96a',
          600: '#b98d4a',
          700: '#a07436',
          800: '#7c5a29',
          900: '#5a3e1a',
        },
        brown: {
          50: '#f7f3f0',
          100: '#e9ded6',
          200: '#d2bba7',
          300: '#b08a5a',
          400: '#8c6239',
          500: '#6b4322',
          600: '#54351a',
          700: '#3d2613',
          800: '#2d1a0d',
          900: '#1a0d06',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
} 