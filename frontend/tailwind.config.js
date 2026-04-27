/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ===== PALETA PROFISSIONAL =====
        // Azul-tinta profundo (Stripe-like) + verdes dinheiro + cinzas neutros.
        // Sem mais cream/sand — paleta que comunica "fintech séria pra dono de empresa".
        ink: {
          50:  '#f7f8fa', // background base
          100: '#eceef2', // surface muted
          200: '#dde0e6', // border padrão
          300: '#b8bdc8', // muted text / icons
          400: '#7a8294', // secondary text
          500: '#535b6e', // body text
          600: '#363c4d', // primary text
          700: '#1f2433', // títulos
          800: '#13172a', // títulos fortes
          900: '#0a0d1a', // ink absoluto
        },
        // Azul-marca — confiança bancária, mas mais vivo que navy puro
        brand: {
          50:  '#eef2ff',
          100: '#dbe5ff',
          200: '#b6cbff',
          300: '#85a8ff',
          400: '#5481fa',
          500: '#2c5deb', // primário CTA
          600: '#1d47cf',
          700: '#1a3aa6',
          800: '#1a3380',
          900: '#192a5e',
        },
        // Verdes dinheiro — pra ganhos, métricas positivas
        money: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        // Vermelhos — alertas e perdas
        loss: {
          50:  '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
      fontFamily: {
        // Inter para tudo. Plus Jakarta sai (era "design system jovial demais").
        // Inter é a fonte padrão de fintech sério hoje (Stripe, Linear, Vercel).
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter:  '-0.022em',
        tight:    '-0.012em',
      },
      animation: {
        'fade-in':   'fadeIn 0.25s ease-out',
        'slide-up':  'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow':'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn:   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:  { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      boxShadow: {
        // Sombras sóbrias, não dramáticas
        'xs':   '0 1px 2px rgba(13,17,38,0.05)',
        'sm':   '0 1px 3px rgba(13,17,38,0.06), 0 1px 2px rgba(13,17,38,0.04)',
        'md':   '0 4px 12px -2px rgba(13,17,38,0.08), 0 2px 4px -1px rgba(13,17,38,0.04)',
        'lg':   '0 12px 32px -8px rgba(13,17,38,0.12), 0 4px 8px -2px rgba(13,17,38,0.06)',
        'card': '0 1px 3px rgba(13,17,38,0.04), 0 1px 2px rgba(13,17,38,0.03)',
      },
    },
  },
  plugins: [],
};
