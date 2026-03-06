/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0c0f',
        surface: '#111318',
        'surface-2': '#141618',
        border: '#1e2128',
        'border-2': '#2a2d33',
        primary: '#f97316',
        'primary-hover': '#fb923c',
        'primary-dark': '#ea580c',
        muted: '#64748b',
        subtle: '#94a3b8',
        foreground: '#e2e8f0',
      },
      fontFamily: {
        mono: ['"DM Mono"', '"Fira Code"', 'monospace'],
        display: ['"Bebas Neue"', 'sans-serif'],
        sans: ['"Space Grotesk"', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'pulse-orange': 'pulseOrange 1s ease infinite alternate',
        'slide-in': 'slideIn 0.2s ease',
        'fade-in': 'fadeIn 0.3s ease',
        'confetti-fall': 'confettiFall linear forwards',
        'scan-line': 'scanLine 1.5s ease-in-out infinite',
      },
      keyframes: {
        pulseOrange: {
          from: { boxShadow: '0 0 8px rgba(249,115,22,0.3)' },
          to: { boxShadow: '0 0 24px rgba(249,115,22,0.8)' },
        },
        slideIn: {
          from: { opacity: 0, transform: 'translateX(-10px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        confettiFall: {
          from: { transform: 'translateY(-20px) rotate(0deg)', opacity: 1 },
          to: { transform: 'translateY(100vh) rotate(720deg)', opacity: 0 },
        },
        scanLine: {
          '0%, 100%': { top: '20%' },
          '50%': { top: '80%' },
        },
      },
    },
  },
  plugins: [],
}
