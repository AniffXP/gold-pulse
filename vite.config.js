import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Proxy /api/scan ke TradingView Scanner API (hindari CORS)
  server: {
    port: 3000,
    proxy: {
      '/api/scan': {
        target: 'https://scanner.tradingview.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/scan/, '/cfd/scan'),
      },
    },
  },
})
