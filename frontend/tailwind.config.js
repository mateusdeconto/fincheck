/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ===== FINCHECK DESIGN SYSTEM v3 =====
        // Palheta quente: parchment + verde-dinheiro + navy dark.
        // Diferenciada de todo SaaS genérico cold-gray.

        // Tons de tinta — base quente (não cold gray)
        ink: {
          50:  '#F5F2EC', // parchment — bg principal da app
          100: '#EAE5DB', // surface muted
          200: '#D5CFC4', // borda padrão
          300: '#AEA89E', // muted icons/text
          400: '#7A7469', // secondary text
          500: '#524C44', // body text
          600: '#342E27', // primary text
          700: '#1E1914', // headings
          800: '#120E0A', // headings fortes
          900: '#080604', // absolute dark
        },

        // Verde-dinheiro — identidade FinCheck
        money: {
          50:  '#EDFBF2',
          100: '#D3F5E1',
          200: '#A8EBCA',
          300: '#6DDBA9',
          400: '#33C484',
          500: '#0FAD6A', // principal
          600: '#0A8E56',
          700: '#076E42',
          800: '#044D2F',
          900: '#022C1B',
        },

        // Azul-marca — links, focus, progress bar
        brand: {
          50:  '#EEF2FF',
          100: '#DBE5FF',
          200: '#B6CBFF',
          300: '#85A8FF',
          400: '#5481FA',
          500: '#2C5DEB',
          600: '#1D47CF',
          700: '#1A3AA6',
          800: '#1A3380',
          900: '#192A5E',
        },

        // Vermelho-alerta
        loss: {
          50:  '#FFF1F0',
          100: '#FFE0DC',
          200: '#FFC4BC',
          500: '#F03A2E',
          600: '#D42F24',
          700: '#B2271E',
        },

        // Navy — seções escuras hero/CTA
        navy: {
          800: '#0C1528',
          900: '#080E1C',
          950: '#030810',
        },
      },

      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },

      letterSpacing: {
        tightest: '-0.045em',
        tighter:  '-0.028em',
        tight:    '-0.015em',
      },

      animation: {
        'fade-in':    'fadeIn 0.25s ease-out',
        'slide-up':   'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':  'spin 2s linear infinite',
        'float':      'float 6s ease-in-out infinite',
      },

      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float:   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },

      boxShadow: {
        'xs':         '0 1px 2px rgba(18,14,10,0.06)',
        'sm':         '0 1px 3px rgba(18,14,10,0.08), 0 1px 2px rgba(18,14,10,0.04)',
        'md':         '0 4px 12px -2px rgba(18,14,10,0.10), 0 2px 4px -1px rgba(18,14,10,0.06)',
        'lg':         '0 12px 32px -8px rgba(18,14,10,0.14), 0 4px 8px -2px rgba(18,14,10,0.08)',
        'card':       '0 2px 8px rgba(18,14,10,0.06), 0 1px 2px rgba(18,14,10,0.04)',
        'card-hover': '0 8px 24px rgba(18,14,10,0.12), 0 2px 4px rgba(18,14,10,0.06)',
        'money':      '0 4px 20px rgba(15,173,106,0.28)',
        'money-lg':   '0 8px 32px rgba(15,173,106,0.36)',
      },
    },
  },
  plugins: [],
};
