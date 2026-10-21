import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    noDiscovery: true,
    include: ['react', 'react-dom/client', 'react/jsx-dev-runtime'],
  },
})
