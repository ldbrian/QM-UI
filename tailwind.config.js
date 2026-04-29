/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#e6f4ff', 100: '#bae0ff', 500: '#1677ff', 600: '#0958d9' },
        neutral: { border: '#f0f0f0', divider: '#e8e8e8', title: '#000000d9', text: '#000000a6', muted: '#00000073' },
        danger: { border: '#ff4d4f', bg: '#fff2f0' }
      },
      fontFamily: { tabular: ['"Monaco"', 'Consolas', 'monospace', 'sans-serif'] }
    },
  },
  plugins: [],
}