import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Saat `npm run dev`, teruskan /api ke server Express lokal (backend/).
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
