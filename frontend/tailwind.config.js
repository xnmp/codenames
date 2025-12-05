/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'team-red': '#dc2626',
        'team-red-light': '#fecaca',
        'team-blue': '#2563eb',
        'team-blue-light': '#bfdbfe',
        'card-neutral': '#a3a3a3',
        'card-assassin': '#171717',
      },
    },
  },
  plugins: [],
}
