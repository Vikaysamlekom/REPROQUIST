import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Chunking dibiarkan otomatis (Rolldown/Vite).
    // Jangan pakai manualChunks: pemisahan paksa justru membuat three.js
    // ikut dimuat saat halaman pertama dibuka. Dengan chunking otomatis,
    // three.js & React Three Fiber hanya masuk dalam grafik import dinamis
    // (lazy) dari OrganViewer, sehingga hanya diunduh saat membuka
    // halaman detail organ.
    chunkSizeWarningLimit: 1100,
  },
})
