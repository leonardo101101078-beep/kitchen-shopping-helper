import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

/** GitHub Pages project site: set VITE_BASE=/repo-name/ in CI (trailing slash). Local dev uses `/`. */
function normalizeBase(raw: string | undefined): string {
  if (raw == null || raw === '' || raw === '/') return '/'
  const withSlash = raw.startsWith('/') ? raw : `/${raw}`
  return withSlash.endsWith('/') ? withSlash : `${withSlash}/`
}

const base = normalizeBase(process.env.VITE_BASE)

function publicAsset(file: string): string {
  if (base === '/') return `/${file}`
  return `${base}${file}`
}

// https://vite.dev/config/
export default defineConfig({
  base,
  resolve: {
    alias: {
      // gray-matter → js-yaml may touch Buffer in the browser without this
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['buffer', 'gray-matter'],
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192.png', 'pwa-512.png', 'apple-touch-icon.png'],
      manifest: {
        name: '廚房採購小幫手',
        short_name: '採購小幫手',
        description: '今天吃什麼、食譜與採買清單',
        theme_color: '#6B705C',
        background_color: '#F9F7E8',
        display: 'standalone',
        start_url: base,
        scope: base,
        lang: 'zh-Hant',
        icons: [
          {
            src: publicAsset('pwa-192.png'),
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: publicAsset('pwa-512.png'),
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
})
