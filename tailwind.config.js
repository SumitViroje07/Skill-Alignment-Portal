/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F5F0FE',
          100: '#EDE1FC',
          200: '#C8AAF5',
          300: '#B18BF0',
          400: '#9464E9',
          500: '#713FD0',
          600: '#5B2FB0',
          700: '#4A2690',
          800: '#3A1D6E',
          900: '#271B3F',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#F8F6FC',
          lav: '#EDE1FC',
        },
        ink: {
          DEFAULT: '#271B3F',
          soft: '#796C87',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px -6px rgba(113, 63, 208, 0.12)',
        'card-hover': '0 12px 32px -8px rgba(113, 63, 208, 0.22)',
        float: '0 8px 40px -8px rgba(39, 27, 63, 0.16)',
      },
      backgroundImage: {
        'hero-grad': 'linear-gradient(135deg, #F8F6FC 0%, #EDE1FC 55%, #C8AAF5 100%)',
      },
    },
  },
  plugins: [],
};
