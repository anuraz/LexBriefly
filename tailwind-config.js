// Small wrapper to provide tailwind config when using CDN
// This file is referenced by index.html for pre-configuration when using the CDN build
window.tailwind = window.tailwind || {};
window.tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#112240',
          900: '#0A192F',
          950: '#020c1b'
        },
        gold: {
          100: '#fdf9e2',
          400: '#F4D068',
          500: '#D4AF37',
          600: '#AA8811'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif']
      }
    }
  }
};
