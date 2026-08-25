/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: '#030304',
        darkmatter: '#0F1115',
        btc: {
          DEFAULT: '#F7931A',
          hover: '#e08213',
          glow: 'rgba(247, 147, 26, 0.6)',
        },
        burnt: '#EA580C',
        gold: '#FFD600',
        stardust: '#94A3B8',
        dim: '#1E293B',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'orange-glow': '0 0 25px -5px rgba(234, 88, 12, 0.5)',
        'btc-glow': '0 0 30px -5px rgba(247, 147, 26, 0.6)',
        'gold-glow': '0 0 25px -5px rgba(255, 214, 0, 0.5)',
        'card-glow': '0 0 50px -10px rgba(247, 147, 26, 0.15)',
      }
    },
  },
  plugins: [],
}
