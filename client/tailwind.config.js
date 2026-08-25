/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ops: {
          bg: '#f8fafc',
          surface: '#ffffff',
          dark: '#0f172a',
          border: '#e2e8f0',
        },
        teal: {
          brand: '#0f766e',
          hover: '#0d9488',
          dark: '#042f2e',
          light: '#f0fdf4',
        },
        status: {
          overdue: {
            text: '#e11d48',
            bg: '#fff1f2',
            border: '#fecdd3',
          },
          warning: {
            text: '#b45309',
            bg: '#fffbeb',
            border: '#fef3c7',
          },
          success: {
            text: '#047857',
            bg: '#ecfdf5',
            border: '#a7f3d0',
          },
          neutral: {
            text: '#475569',
            bg: '#f1f5f9',
            border: '#e2e8f0',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
