import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
  registerType: 'autoUpdate',
  injectRegister: 'auto',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.png', 'coin.png'],
  manifest: {
    name: '信誓读读',
    short_name: '信誓读读',
    description: '专注建造你的城堡',
    theme_color: '#121212',
    background_color: '#121212',
    display: 'standalone',
    orientation: 'portrait',
    scope: '/xinshidudu/',
    start_url: '/xinshidudu/',
    lang: 'zh-CN',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,woff2}'],
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    cleanupOutdatedCaches: true,
    skipWaiting: true,
    clientsClaim: true,
    navigateFallbackDenylist: [/^\/api/],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
        handler: 'NetworkOnly',
      },
    ],
  },
}),
  ],
  base: mode === 'production' ? '/xinshidudu/' : '/',
}))