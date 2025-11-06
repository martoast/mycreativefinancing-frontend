/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

export default {
  content: [
    './components/**/*.{html,js,ts,vue}',
    './layouts/**/*.{html,js,ts,vue}',
    './pages/**/*.{html,js,ts,vue}'
  ],
  theme: {
    extend: {
      fontFamily: {
        display: defaultTheme.fontFamily.sans,
        tech: defaultTheme.fontFamily.mono,
        modern: defaultTheme.fontFamily.sans,
      },
      colors: {
        // Gold color palette
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
          DEFAULT: '#d4af37',
          light: '#f9d776',
          dark: '#aa8c2c',
        },
        // Red color palette (same format as gold)
        red: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
          DEFAULT: '#dc3545',
          light: '#ff6b6b',
          dark: '#a71d2a',
        },
        // Accent colors
        accent: {
          blue: '#3B82F6',
          green: '#10B981',
          purple: '#8B5CF6',
          red: '#EF4444',
        },
        // Zinc grays
        zinc: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          850: '#1f1f23',
          900: '#18181b',
          925: '#121214',
          950: '#09090b',
        },
        // Keep some existing colors for compatibility
        primary: '#d4af37',
        secondary: '#5f915c',
        white: '#ffffff',
        black: '#000000',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #d4af37 0%, #f9d776 50%, #aa8c2c 100%)',
        'gradient-red': 'linear-gradient(135deg, #dc3545 0%, #ff6b6b 50%, #a71d2a 100%)',
        'gradient-dark': 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)',
        'gradient-accent': 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({ strategy: 'class' }),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography')
  ],
}
