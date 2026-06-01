/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      // ─────────────────────────────────────────────────────────────
      // 🎨 PALETTE — modifiez ces couleurs pour changer toute l'identité
      //    visuelle du site (utilisées partout via les classes Tailwind,
      //    ex. text-marine, bg-ocre, border-brume…).
      // ─────────────────────────────────────────────────────────────
      colors: {
        // Bleu profond : couleur principale (en-têtes, boutons, sections sombres)
        marine: {
          DEFAULT: '#0F2A47',
          light: '#1C3D60',
          dark: '#0A1E33',
        },
        // Accent ocre / terracotta : à utiliser avec parcimonie (CTA, détails)
        ocre: {
          DEFAULT: '#C8842D',
          light: '#DDA04F',
          dark: '#A66B1F',
        },
        sable: '#F7F4EF',   // Neutre chaud très clair (fonds de section)
        brume: '#F1F4F8',   // Gris clair froid (séparateurs, fonds alternés)
        ardoise: '#5B6577', // Texte secondaire
        encre: '#16202E',   // Texte principal
      },
      // ─────────────────────────────────────────────────────────────
      // ✍️ TYPOGRAPHIE — les polices sont chargées dans BaseLayout.astro
      // ─────────────────────────────────────────────────────────────
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'], // Titres élégants
        sans: ['Inter', 'system-ui', 'sans-serif'], // Corps de texte lisible
      },
      maxWidth: {
        content: '1200px', // Largeur maximale du contenu centré
      },
      boxShadow: {
        card: '0 12px 40px -18px rgba(15, 42, 71, 0.25)',
      },
    },
  },
  plugins: [],
};
