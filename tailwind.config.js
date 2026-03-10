/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#0ea5e9',
        success: '#10b981',
        warning: '#f59e0b',
        critical: '#ef4444',
        sidebar: '#0f172a',
      },
    },
  },
  plugins: [],
};
