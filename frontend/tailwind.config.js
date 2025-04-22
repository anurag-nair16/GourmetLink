/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // This includes all JavaScript files in the src folder and its subfolders
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#22c55e',
          dark: '#15803d',
          light: '#f0fdf4'
        }
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': {
            opacity: 1
          },
          '50%': {
            opacity: .5
          },
        },
      },
    },
  },
  plugins: [
    
  ],
}
