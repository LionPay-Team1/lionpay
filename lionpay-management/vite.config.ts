import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'process.env.AUTH_SERVICE_URL': JSON.stringify(process.env.AUTH_SERVICE_URL || 'http://localhost:8080'),
    'process.env.WALLET_SERVICE_URL': JSON.stringify(process.env.WALLET_SERVICE_URL || 'http://localhost:8081'),
  },
  server: {
    port: parseInt(process.env.PORT || '5174'),
    host: true,
  },
})
