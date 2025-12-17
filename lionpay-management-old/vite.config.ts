import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.AUTH_SERVICE_URL': JSON.stringify(process.env.AUTH_SERVICE_URL),
    'process.env.WALLET_SERVICE_URL': JSON.stringify(process.env.WALLET_SERVICE_URL),
  },
  server: {
    port: parseInt(process.env.PORT || '5174'),
    host: true,
  },
})
