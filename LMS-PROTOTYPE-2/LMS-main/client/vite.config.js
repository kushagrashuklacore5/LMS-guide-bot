import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',   // FORCE RELATIVE PATHS
  plugins: [react()],
  build: {
    assetsDir: 'assets'
  }
})
