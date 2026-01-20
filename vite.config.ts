import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [],
  base: './',
  server: {
    host: true
  },
  build: {
    outDir: 'cordova_app/www', // Direct output to Cordova's www
    emptyOutDir: true
  }
})
