/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#f0f4fa',
          100: '#dce6f5',
          200: '#b9cde8',
          300: '#8aadd6',
          400: '#5a87be',
          500: '#3a67a5',
          600: '#2c508a',
          700: '#1e3a5f',
          800: '#172d4a',
          900: '#101f34',
        },
        // Gold accent — recomendação skill ui-ux-pro-max: Banking/Traditional Finance
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#d97706',
          600: '#a16207',
          700: '#854d0e',
        },
      },
      // Plus Jakarta Sans — Friendly SaaS/Fintech (skill typography row 13)
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-navy': '0 0 30px rgba(58, 103, 165, 0.3)',
        'glow-gold': '0 0 20px rgba(161, 98, 7, 0.3)',
        'card': '0 4px 6px -1px rgba(0,0,0,0.2), 0 10px 40px -10px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
};
