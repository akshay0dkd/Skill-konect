/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // or 'media' or 'class'
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        secondary: '#10b981',
        accent: '#f97316',
        text: {
          primary: '#1f2937',
          secondary: '#6b7280',
        },
        background: {
          primary: '#ffffff',
          secondary: '#f3f4f6',
        },
        border: {
          primary: '#d1d5db',
          secondary: '#e5e7eb',
        }
      }
    },
  },
  plugins: [],
}
