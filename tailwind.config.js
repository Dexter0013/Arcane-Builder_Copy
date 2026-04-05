/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./game.js"
  ],
  darkMode: 'class', // we might not use this if using explicit custom properties
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-vignette': 'var(--bg-vignette)',
        'text-primary': 'var(--text-primary)',
        'text-muted': 'var(--text-muted)',
        'text-dim': 'var(--text-dim)',
        'accent': 'var(--accent)',
        'accent-glow': 'var(--accent-glow)',
        'accent-glow2': 'var(--accent-glow2)',
        'panel-bg': 'var(--panel-bg)',
        'panel-border': 'var(--panel-border)',
        'label-color': 'var(--label-color)',
        'label-shadow': 'var(--label-shadow)',
        'layer-accent': 'var(--layer-accent)',
        'layer-glow': 'var(--layer-glow)',
        'bar-bg': 'var(--bar-bg)',
        'bar-border': 'var(--bar-border)',
        'bar-fill-from': 'var(--bar-fill-from)',
        'bar-fill-to': 'var(--bar-fill-to)',
        'bar-fill-glow': 'var(--bar-fill-glow)',
        'bar-text': 'var(--bar-text)',
        'swatch-active': 'var(--swatch-active)',
        'swatch-glow': 'var(--swatch-glow)',
        'card-bg': 'var(--card-bg)',
        'card-active-bg': 'var(--card-active-bg)',
        'card-aura': 'var(--card-aura)',
        'bname-color': 'var(--bname-color)',
        'bname-active': 'var(--bname-active)',
        'bname-glow': 'var(--bname-glow)',
        'bkey-color': 'var(--bkey-color)',
        'bkey-border': 'var(--bkey-border)',
        'bkey-active': 'var(--bkey-active)',
        'bkey-aborder': 'var(--bkey-aborder)',
        'badge-bg': 'var(--badge-bg)',
        'badge-border': 'var(--badge-border)',
        'badge-color': 'var(--badge-color)',
        'badge-glow': 'var(--badge-glow)',
        'tip-bg': 'var(--tip-bg)',
        'tip-border': 'var(--tip-border)',
        'tip-text': 'var(--tip-text)',
        'tip-title': 'var(--tip-title)',
        'tip-glow': 'var(--tip-glow)',
        'toggle-bg': 'var(--toggle-bg)',
        'toggle-border': 'var(--toggle-border)',
        'toggle-color': 'var(--toggle-color)',
      },
      fontFamily: {
        'arcane': ['"Architects Daughter"', 'cursive'],
      },
      dropShadow: {
        'card-active': [
          '0 0 10px rgba(140, 60, 255, 0.8)',
          '0 0 22px rgba(80, 20, 180, 0.5)'
        ],
        'card-active-light': [
          '0 0 10px rgba(194, 153, 88, 0.8)',
          '0 0 20px rgba(154, 113, 48, 0.5)'
        ],
      },
      keyframes: {
        announceIn: {
          '0%': { opacity: '0', transform: 'scale(0.6) translateY(20px)' },
          '20%': { opacity: '1', transform: 'scale(1.05) translateY(0)' },
          '65%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95) translateY(-10px)' },
        },
        auraPulse: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(0.95)' },
          '50%': { opacity: '1.0', transform: 'scale(1.1)' },
        }
      },
      animation: {
        'announce-in': 'announceIn 2.2s ease forwards',
        'aura-pulse': 'auraPulse 1.6s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
