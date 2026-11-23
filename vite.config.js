import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const backendOrigin = 'http://127.0.0.1:8080'
const proxyOptions = {
  target: backendOrigin,
  changeOrigin: true,
  timeout: 300000,
  proxyTimeout: 300000,
}

const proxy = {
  '/api': proxyOptions,
  '/query': proxyOptions,
  '/stream': proxyOptions,
  '/search': proxyOptions,
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy },
  preview: { proxy },
})
