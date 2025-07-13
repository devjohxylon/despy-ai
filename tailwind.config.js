/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#0F172A', // slate-900
        'secondary': '#1E293B', // slate-800
        'accent': '#3B82F6', // blue-500
        'text-primary': '#F3F4F6', // gray-100
        'text-secondary': '#9CA3AF', // gray-400
        'success': '#22C55E', // green-500
        'warning': '#F59E0B', // amber-500
        'danger': '#EF4444', // red-500
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}