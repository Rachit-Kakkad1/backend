/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // --- EXISTING APP COLORS (Preserved) ---
        cyber: {
          black: "rgb(var(--cyber-black) / <alpha-value>)",
          dark: "rgb(var(--cyber-dark) / <alpha-value>)",
          "dark-lighter": "rgba(255, 255, 255, 0.05)",
          blue: "rgb(var(--cyber-blue) / <alpha-value>)",
          purple: "rgb(var(--cyber-purple) / <alpha-value>)",
          green: "rgb(var(--cyber-green) / <alpha-value>)",
          cyan: "rgb(var(--cyber-cyan) / <alpha-value>)",
          indigo: "rgb(var(--cyber-indigo) / <alpha-value>)",
          amber: "rgb(var(--cyber-amber) / <alpha-value>)",
          rose: "rgb(var(--cyber-rose) / <alpha-value>)",
          orange: "rgb(var(--cyber-orange) / <alpha-value>)",
          yellow: "rgb(var(--cyber-yellow) / <alpha-value>)",
          teal: "rgb(var(--cyber-teal) / <alpha-value>)",
          pink: "rgb(var(--cyber-pink) / <alpha-value>)",
          slate: "rgb(var(--cyber-slate) / <alpha-value>)",
          white: "rgb(var(--cyber-white) / <alpha-value>)",
        },

        // --- NEW LANDING PAGE COLORS (Added) ---
        background: '#0B0F19',
        surface: '#111827',
        surfaceHighlight: '#1F2937',
        primary: '#3B82F6',
        accent: '#64748B',
        border: '#1E293B',
        textMain: '#F8FAFC',
        textMuted: '#94A3B8',
        success: '#10B981',
        danger: '#EF4444',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%)',
        'soft-glow': 'radial-gradient(circle at center, rgb(var(--cyber-blue) / 0.15) 0%, transparent 70%)',
        'purple-glow': 'radial-gradient(circle at center, rgb(var(--cyber-purple) / 0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'subtle-blue': '0 0 15px rgb(var(--cyber-blue) / 0.15)',
        'subtle-purple': '0 0 15px rgb(var(--cyber-purple) / 0.15)',
        'glass-pro': '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
      },
      dropShadow: {
        'soft': '0 0 8px rgb(var(--cyber-blue) / 0.3)',
      },

      // --- ANIMATIONS FOR LANDING PAGE ---
      animation: {
        'scan': 'scan 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulseRadial': 'pulseRadial 8s ease-in-out infinite',
        'floatOrb': 'floatOrb 15s ease-in-out infinite',
        'glitch-1': 'glitch-1 2s infinite linear alternate-reverse',
        'glitch-2': 'glitch-2 3s infinite linear alternate-reverse',
        'fadeInGlow': 'fadeInGlow 0.8s ease-out forwards',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(-10%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(300%)', opacity: '0' },
        },
        pulseRadial: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.1)' },
        },
        floatOrb: {
          '0%, 100%': { transform: 'translate(-50%, 0) rotate(0deg)' },
          '50%': { transform: 'translate(-50%, 100px) rotate(180deg)' },
        },
        'glitch-1': {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-3px, 3px)' },
          '40%': { transform: 'translate(3px, -3px)' },
          '60%': { transform: 'translate(-3px, -3px)' },
          '80%': { transform: 'translate(3px, 3px)' },
        },
        'glitch-2': {
          '0%, 100%': { transform: 'translate(0)' },
          '30%': { transform: 'translate(-4px, -2px)' },
          '70%': { transform: 'translate(4px, 2px)' },
        },
        fadeInGlow: {
          '0%': { opacity: '0', transform: 'translateY(20px)', filter: 'blur(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
      }
    },
  },
  plugins: [],
};