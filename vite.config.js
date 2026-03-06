import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Ramadan Kareem - Jadwal Sholat & Al-Quran',
        short_name: 'Ramadan Kareem',
        description: 'Jadwal sholat, Al-Quran, dan notifikasi waktu sholat',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone', // ⚠️ Wajib: 'standalone' agar bisa di-install
        orientation: 'portrait',
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // ⚠️ Wajib untuk Android
          }
        ]
      },
      workbox: {
        // Opsional: konfigurasi caching lanjutan
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}']
      }
    })
  ],
})
