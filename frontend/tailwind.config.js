/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Brand anchor — calm teal, kept deliberately outside the category palette.
        brand: {
          50: '#ECFDFA',
          100: '#CFF8F1',
          200: '#9DEEE3',
          300: '#5FDDCF',
          400: '#2BC4B6',
          500: '#12A89B',
          600: '#0C8A80',
          700: '#0E6F68',
          800: '#115A55',
          900: '#123F3D',
        },
        // Warm, cool-leaning neutrals — the canvas and surfaces.
        sand: {
          50: '#FAF9F6',
          100: '#F4F2EC',
          200: '#E9E6DD',
          300: '#D8D4C8',
        },
        ink: {
          DEFAULT: '#16201F',
          soft: '#5A625F',
          muted: '#8A918D',
        },
        // Dark-mode surfaces (deep teal-black, not flat gray).
        night: {
          900: '#0C1413',
          800: '#121C1B',
          700: '#1A2625',
          600: '#26322F',
        },
        // ─── The signature: the four behavioral dimensions ───
        focus: {
          DEFAULT: '#2A60D6',
          soft: '#EAF0FE',
          softText: '#1E47A8',
        },
        energy: {
          DEFAULT: '#0A7A55',
          soft: '#E2F5EC',
          softText: '#075E41',
        },
        impulse: {
          DEFAULT: '#B65C08',
          soft: '#FBEEDD',
          softText: '#8E4806',
        },
        stress: {
          DEFAULT: '#C2384F',
          soft: '#FBE7EB',
          softText: '#992638',
        },
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(22, 32, 31, 0.04), 0 8px 24px -12px rgba(22, 32, 31, 0.18)',
        lift: '0 2px 4px rgba(22, 32, 31, 0.05), 0 18px 40px -18px rgba(22, 32, 31, 0.28)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(-6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        rise: 'rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scale-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
