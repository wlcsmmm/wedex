import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'warm-white': '#FAF8F5',
        'blush': {
          DEFAULT: '#F2A99F',
          50: '#FEF5F4',
          100: '#FDEAE9',
          200: '#FAD5D2',
          300: '#F7BFBB',
          400: '#F4B4A9',
          500: '#F2A99F',
          600: '#E8877A',
          700: '#DC6455',
          800: '#C94030',
          900: '#9E3225',
        },
        'sage': {
          DEFAULT: '#7A9E7E',
          50: '#F2F7F3',
          100: '#E4EFE6',
          200: '#C6DFCA',
          300: '#A8CFAD',
          400: '#8DB593',
          500: '#7A9E7E',
          600: '#5E8263',
          700: '#476249',
          800: '#314330',
          900: '#1A2419',
        },
        'charcoal': '#2D2D2D',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
