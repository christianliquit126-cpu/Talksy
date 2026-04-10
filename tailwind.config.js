/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        surface: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #d946ef 0%, #f97316 100%)',
        'gradient-cool': 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
        'gradient-warm': 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(217, 70, 239, 0.3)',
        'glow-accent': '0 0 20px rgba(249, 115, 22, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [],
}
