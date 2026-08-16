/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#FFFFFF',
        'bg-secondary': '#F8FAFC',
        
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        'text-muted': '#9CA3AF',
        
        'border-light': '#E5E7EB',
        'border-focus': 'rgba(20, 184, 166, 0.3)',

        primary: '#14B8A6', // Teal 500
        'primary-hover': '#0D9488', // Teal 600
        'primary-light': '#CCFBF1', // Teal 100

        'bg-alternate': '#F0FDFA', // Teal 50

        accent: '#0F766E', // Dark Teal 700
        'accent-hover': '#115E59', // Dark Teal 800
        'accent-light': '#99F6E4', // Teal 200

        'hero-dark': '#042F2E',
        'hero-base': '#043C3B',
        'hero-mid': '#064E4A',
        'hero-light': '#065F5B',

        success: '#22C55E',
        'success-light': 'rgba(34, 197, 94, 0.1)',
        
        warning: '#F59E0B',
        'warning-light': 'rgba(245, 158, 11, 0.1)',

        error: '#EF4444',
        'error-light': 'rgba(239, 68, 68, 0.1)',

        info: '#3B82F6',
        'info-light': 'rgba(59, 130, 246, 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'elevated': '0 10px 30px -5px rgba(0, 0, 0, 0.08)',
        'dropdown': '0 20px 40px -10px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'xl': '1rem',      // 16px
        '2xl': '1.25rem',  // 20px
        '3xl': '1.5rem',   // 24px
      },
      animation: {
        'float-slow': 'float 20s ease-in-out infinite',
        'float-slower': 'float 30s ease-in-out infinite',
        'pulse-slow': 'pulse-opacity 15s ease-in-out infinite',
        'wave': 'wave 25s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '33%': { transform: 'translateY(-20px) translateX(15px)' },
          '66%': { transform: 'translateY(15px) translateX(-20px)' },
        },
        'pulse-opacity': {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 0.7 },
        },
        wave: {
          '0%': { transform: 'translateX(0) scaleY(1)' },
          '50%': { transform: 'translateX(-25%) scaleY(1.1)' },
          '100%': { transform: 'translateX(-50%) scaleY(1)' },
        }
      }
    },
  },
  plugins: [],
}
