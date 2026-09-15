import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: '6px',
        md: '4px',
        sm: '2px',
        xl: '8px',
        '2xl': '8px',
      },
      fontFamily: {
        sans: ['var(--font-noto)', 'Hiragino Sans', 'Yu Gothic', 'system-ui', 'sans-serif'],
        logo: ['var(--font-noto)', 'Hiragino Sans', 'Yu Gothic', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--bg-base))',
        foreground: 'hsl(var(--text-primary))',
        yellow: {
          DEFAULT: '#FFD400',
          dark: '#E6C100',
        },
        ink: {
          DEFAULT: '#111111',
          light: '#333333',
          muted: '#666666',
          faint: '#999999',
        },
        border: {
          DEFAULT: 'hsl(var(--border-base))',
          dark: 'hsl(0 0% 80%)',
        },
        muted: {
          DEFAULT: 'hsl(0 0% 96%)',
          foreground: 'hsl(var(--text-secondary))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
