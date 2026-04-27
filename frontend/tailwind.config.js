/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ===== CLAUDE-INSPIRED PALETTE =====
        // Warm cream/sand para superfícies, ink escuro para texto, accent quente.
        // Reforça confiança financeira sem o "frio bancário" tradicional.
        ink: {
          50:  '#f8f6f1', // off-white quente (background)
          100: '#efece4', // cream sutil
          200: '#e3ddd0', // borda cream
          300: '#c8bfac', // muted
          400: '#8a8273', // texto secundário sobre cream
          500: '#5b5547', // texto sobre cream
          600: '#3f3a30', // título sobre cream
          700: '#2a2620', // ink primário
          800: '#1a1814', // ink mais escuro
          900: '#0f0e0b', // ink quase preto (contraste máximo)
        },
        // Accent terracota — aproximação do "Claude orange" sem copiar
        accent: {
          50:  '#fdf3ec',
          100: '#fae0d0',
          200: '#f4be9b',
          300: '#ee9863',
          400: '#e57940',
          500: '#d6612a', // primário do CTA
          600: '#b34a1f',
          700: '#8d3a1a',
          800: '#682c17',
          900: '#421d10',
        },
        // Navy mantida — ainda usada em badges de confiança e charts
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
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#d97706',
          600: '#a16207',
          700: '#854d0e',
        },
      },
      fontFamily: {
        // Sans para UI; serif para títulos quando queremos o feel "editorial Claude"
        sans:    ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['"Fraunces"', '"Plus Jakarta Sans"', 'Georgia', 'serif'],
        mono:    ['"JetBrains Mono"', '"SF Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter:  '-0.025em',
      },
      animation: {
        'fade-in':   'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up':  'slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow':'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn:   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:  { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      boxShadow: {
        'soft':    '0 1px 2px rgba(15,14,11,0.04), 0 4px 16px -2px rgba(15,14,11,0.06)',
        'lifted':  '0 2px 4px rgba(15,14,11,0.04), 0 12px 32px -8px rgba(15,14,11,0.10)',
        'card':    '0 1px 0 rgba(15,14,11,0.04), 0 4px 24px -8px rgba(15,14,11,0.08)',
        'inset-soft': 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      backgroundImage: {
        'paper':  "radial-gradient(circle at 1px 1px, rgba(42,38,32,0.04) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};
