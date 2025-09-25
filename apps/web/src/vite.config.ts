// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // tu puerto del frontend
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // <-- tu backend
        changeOrigin: true,
        secure: false,
        // Tu backend NO usa prefijo /api, así que quitamos /api del path:
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
