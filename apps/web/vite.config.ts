// apps/web/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // podés omitirlo si ya te anda en 5173
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // /api/products -> /products
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
