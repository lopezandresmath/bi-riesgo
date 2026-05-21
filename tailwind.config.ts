import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#f4f7fb',
        paper: '#ffffff',
        ink: {
          DEFAULT: '#1e3a5f',
          2: '#3d5a7f',
          3: '#7a8da8',
          4: '#b8c4d4',
        },
        rule: {
          DEFAULT: '#e2e8f0',
          strong: '#cbd5e1',
        },
        accent: {
          DEFAULT: '#3b6ea8',
          soft: '#a8c2dc',
          bg: '#e8f0f9',
        },
        neg: {
          DEFAULT: '#d97070',
          soft: '#f0b8b8',
          bg: '#fbeaea',
        },
        pos: {
          DEFAULT: '#5ba888',
          soft: '#aed4c1',
          bg: '#e6f3ed',
        },
        warn: {
          DEFAULT: '#d4a04c',
          bg: '#faf1de',
        },
        chip: { bg: '#eef3f9' },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Fraunces', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '8px',
        input: '6px',
        cell: '4px',
        pill: '3px',
      },
      maxWidth: {
        app: '1600px',
      },
    },
  },
  plugins: [],
} satisfies Config
