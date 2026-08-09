import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#FAFAFA',
          secondary: '#F5F5F0',
        },
        foreground: {
          DEFAULT: '#1A1A1A',
          secondary: '#6B6B6B',
          muted: '#9A9A9A',
        },
        accent: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#EFF6FF',
        },
        destructive: {
          DEFAULT: '#DC2626',
          light: '#FEF2F2',
        },
        success: {
          DEFAULT: '#16A34A',
          light: '#F0FDF4',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FFFBEB',
        },
        border: {
          DEFAULT: 'rgba(0, 0, 0, 0.06)',
          strong: 'rgba(0, 0, 0, 0.12)',
        },
        card: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      fontSize: {
        'hero': ['68px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'hero-sm': ['44px', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'section': ['40px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'section-sm': ['28px', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'product': ['20px', { lineHeight: '1.3' }],
        'label': ['12px', { lineHeight: '1.4', letterSpacing: '0.1em' }],
      },
      spacing: {
        '18': '72px',
        '22': '88px',
        '30': '120px',
      },
      maxWidth: {
        'site': '1440px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)',
        'modal': '0 20px 60px rgba(0,0,0,0.15)',
        'toast': '0 4px 20px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-badge': 'pulse-badge 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'pulse-badge': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-in': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
