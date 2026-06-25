import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// Tunnel mode (TUNNEL=1): serve plain HTTP and let ngrok terminate TLS with its trusted cert.
// WebXR needs a secure context, and ngrok's real HTTPS satisfies that without the Quest browser
// tripping over the self-signed basic-ssl cert. The basic-ssl plugin is only for direct LAN access.
const tunnel = process.env.TUNNEL === '1'

export default defineConfig({
  base: '/hzn_gallery/',
  plugins: [react(), ...(tunnel ? [] : [basicSsl()])],
  server: {
    host: true,
    // Vite 6 blocks requests whose Host header isn't known; allow ngrok's tunnel domains.
    allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok.app', '.ngrok.dev', '.ngrok.io'],
  },
})
