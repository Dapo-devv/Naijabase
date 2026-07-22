/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A8C4A',
          50: '#E6F4EC',
          100: '#C8E8D4',
          200: '#92D2AA',
          300: '#5CBA7B',
          400: '#2DA457',
          500: '#0A8C4A',
          600: '#08733D',
          700: '#065A30',
          800: '#044023',
          900: '#022615',
        },
        secondary: {
          DEFAULT: '#F4A261',
          50: '#FDF4EA',
          100: '#FAE3CB',
          200: '#F4C79A',
          300: '#EFAA69',
          400: '#F4A261',
          500: '#E08838',
          600: '#B86B26',
          700: '#8F521C',
          800: '#673A15',
          900: '#3F2310',
        },
        neutral: {
          bg: '#F8F9FA',
          card: '#FFFFFF',
          text: '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};
