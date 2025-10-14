import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/postcss'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // This merges the Tailwind CSS configuration...
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },

  // ...with the backend proxy configuration.
  server: {
    proxy: {
      // This proxies any requests from your frontend starting with '/api'
      // to your backend server running on http://localhost:3000
      '/api': 'http://localhost:3000',
    }
  }
})

